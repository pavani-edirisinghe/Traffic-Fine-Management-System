import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../presentation/providers/payment_provider.dart';

class PaymentConfirmationScreen extends StatefulWidget {
  const PaymentConfirmationScreen({Key? key, required this.paymentId})
      : super(key: key);
  final String paymentId;

  @override
  State<PaymentConfirmationScreen> createState() =>
      _PaymentConfirmationScreenState();
}

class _PaymentConfirmationScreenState extends State<PaymentConfirmationScreen> {
  final _transactionIdController = TextEditingController();

  @override
  void dispose() {
    _transactionIdController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('Payment Confirmation'),
          automaticallyImplyLeading: false,
        ),
        body: SafeArea(
          child: Consumer<PaymentProvider>(
            builder: (context, paymentProvider, _) {
              final payment = paymentProvider.currentPayment;

              if (payment == null) {
                return const Center(child: Text('No payment found'));
              }

              return SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 24),
                      // Status Icon
                      Center(
                        child: Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF8E1),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: const Color(0xFFFFB74D),
                              width: 3,
                            ),
                          ),
                          child: const Icon(
                            Icons.hourglass_bottom,
                            size: 40,
                            color: Color(0xFFFF6F00),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      // Status Text
                      Center(
                        child: Column(
                          children: [
                            Text(
                              'Payment Processing',
                              style: Theme.of(context).textTheme.headlineMedium,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Please verify your payment with the gateway',
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 32),
                      // Payment Details
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Payment Details',
                                style:
                                    Theme.of(context).textTheme.headlineSmall,
                              ),
                              const SizedBox(height: 16),
                              _buildDetailRow(
                                context,
                                'Reference:',
                                payment.referenceNumber,
                              ),
                              const SizedBox(height: 8),
                              _buildDetailRow(
                                context,
                                'Amount:',
                                'Rs. ${payment.amount.toStringAsFixed(2)}',
                              ),
                              const SizedBox(height: 8),
                              _buildDetailRow(
                                context,
                                'Method:',
                                payment.paymentMethod,
                              ),
                              const SizedBox(height: 8),
                              _buildDetailRow(
                                  context, 'Status:', payment.status),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),
                      // Transaction ID Input
                      Text(
                        'Enter Transaction ID',
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _transactionIdController,
                        decoration: InputDecoration(
                          labelText: 'Transaction ID',
                          hintText: 'Enter transaction ID from your bank',
                          prefixIcon: const Icon(Icons.receipt_long_outlined),
                          enabled: !paymentProvider.isLoading,
                        ),
                        enabled: !paymentProvider.isLoading,
                      ),
                      const SizedBox(height: 32),
                      // Verify Button
                      ElevatedButton(
                        onPressed: paymentProvider.isLoading
                            ? null
                            : () => _verifyPayment(context, paymentProvider),
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
                            : const Text('Verify Payment'),
                      ),
                      const SizedBox(height: 12),
                      OutlinedButton(
                        onPressed: paymentProvider.isLoading
                            ? null
                            : () => context.go('/home'),
                        child: const Text('Back to Home'),
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
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: Theme.of(context).textTheme.bodyMedium),
          Text(
            value,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
        ],
      );

  void _verifyPayment(
    BuildContext context,
    PaymentProvider paymentProvider,
  ) async {
    if (_transactionIdController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter transaction ID')),
      );
      return;
    }

    final success = await paymentProvider.verifyPayment(
      transactionId: _transactionIdController.text,
    );

    if (success && context.mounted) {
      if (paymentProvider.currentPayment?.status == 'COMPLETED') {
        context.go('/payment-success/${paymentProvider.currentPayment!.id}');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payment verification pending')),
        );
      }
    } else if (!success && context.mounted) {
      context.go('/payment-failure');
    }
  }
}
