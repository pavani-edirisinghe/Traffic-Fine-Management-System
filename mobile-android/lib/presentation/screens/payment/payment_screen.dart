import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../config/dependencies/service_locator.dart';
import '../../../presentation/providers/payment_provider.dart';

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({Key? key, required this.fineId}) : super(key: key);
  final String fineId;

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String _selectedPaymentMethod = 'CARD';
  late final PaymentProvider _paymentProvider = getIt<PaymentProvider>();

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Payment')),
        body: SafeArea(
          child: AnimatedBuilder(
            animation: _paymentProvider,
            builder: (context, _) {
              final paymentProvider = _paymentProvider;
              final fine = paymentProvider.currentFine;

              if (fine == null) {
                return const Center(child: Text('No fine found'));
              }

              return SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Fine Details Card
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Fine Details',
                                style:
                                    Theme.of(context).textTheme.headlineSmall,
                              ),
                              const SizedBox(height: 16),
                              _buildDetailRow(
                                context,
                                'Reference:',
                                fine.referenceNumber,
                              ),
                              const SizedBox(height: 8),
                              _buildDetailRow(
                                context,
                                'Category:',
                                fine.categoryName,
                              ),
                              const SizedBox(height: 8),
                              _buildDetailRow(
                                context,
                                'Vehicle:',
                                fine.vehicleNumber,
                              ),
                              const SizedBox(height: 8),
                              _buildDetailRow(
                                context,
                                'Violation:',
                                fine.violationDescription,
                              ),
                              const Divider(height: 24),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Amount Due:',
                                    style: Theme.of(
                                      context,
                                    ).textTheme.headlineSmall,
                                  ),
                                  Text(
                                    'Rs. ${fine.amount.toStringAsFixed(2)}',
                                    style: Theme.of(context)
                                        .textTheme
                                        .headlineSmall
                                        ?.copyWith(
                                          color: const Color(0xFF43A047),
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),
                      // Payment Method Selection
                      Text(
                        'Payment Method',
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        initialValue: _selectedPaymentMethod,
                        decoration: InputDecoration(
                          prefixIcon: const Icon(Icons.payment),
                          enabled: !paymentProvider.isLoading,
                        ),
                        items: const [
                          DropdownMenuItem(
                              value: 'CARD',
                              child: Text('Credit / Debit Card')),
                          DropdownMenuItem(
                              value: 'MOBILE_BANKING',
                              child: Text('Mobile Banking')),
                          DropdownMenuItem(
                              value: 'BANK_TRANSFER',
                              child: Text('Bank Transfer')),
                        ],
                        onChanged: !paymentProvider.isLoading
                            ? (val) {
                                if (val != null) {
                                  setState(() {
                                    _selectedPaymentMethod = val;
                                  });
                                }
                              }
                            : null,
                      ),
                      const SizedBox(height: 32),
                      // Payment Button
                      ElevatedButton(
                        onPressed: paymentProvider.isLoading
                            ? null
                            : () => _initiatePayment(context, paymentProvider),
                        child: paymentProvider.isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor:
                                      AlwaysStoppedAnimation(Colors.white),
                                ),
                              )
                            : const Text('Proceed to Payment'),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      );

  Widget _buildDetailRow(BuildContext context, String label, String value) =>
      Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 1,
            child: Text(label, style: Theme.of(context).textTheme.bodyMedium),
          ),
          Expanded(
            flex: 2,
            child: Text(
              value,
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      );

  // Payment method selection is handled via DropdownButtonFormField to avoid
  // deprecated Radio APIs (RadioGroup should be used in newer Flutter).

  void _initiatePayment(
    BuildContext context,
    PaymentProvider paymentProvider,
  ) async {
    final success = await paymentProvider.initiatePayment(
      paymentMethod: _selectedPaymentMethod,
    );

    if (success && context.mounted) {
      final paymentId = paymentProvider.currentPayment!.id;
      context.push('/payment-confirmation/$paymentId');
    } else if (!success && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(paymentProvider.error ?? 'Payment failed')),
      );
    }
  }
}
