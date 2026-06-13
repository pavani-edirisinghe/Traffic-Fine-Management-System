import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../config/dependencies/service_locator.dart';
import '../../../presentation/providers/payment_provider.dart';

class FineEntryScreen extends StatefulWidget {
  const FineEntryScreen({Key? key}) : super(key: key);

  @override
  State<FineEntryScreen> createState() => _FineEntryScreenState();
}

class _FineEntryScreenState extends State<FineEntryScreen> {
  final _referenceNumberController = TextEditingController();
  final _categoryIdController = TextEditingController();
  late final PaymentProvider _paymentProvider = getIt<PaymentProvider>();

  final List<String> _fineCategories = [
    'C001 - Speeding',
    'C002 - Rash Driving',
    'C003 - No License',
    'C004 - Expired License',
    'C005 - Traffic Signal Violation',
    'C006 - No Insurance',
    'C007 - Overloading',
    'C008 - Defective Vehicle',
  ];

  @override
  void dispose() {
    _referenceNumberController.dispose();
    _categoryIdController.dispose();
    super.dispose();
  }

  void _validateFine(
    BuildContext context,
    PaymentProvider paymentProvider,
  ) async {
    if (_referenceNumberController.text.isEmpty ||
        _categoryIdController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')),
      );
      return;
    }

    final success = await paymentProvider.validateFine(
      referenceNumber: _referenceNumberController.text,
      categoryId: _categoryIdController.text,
    );

    if (success && context.mounted) {
      context.push('/payment/${paymentProvider.currentFine!.id}');
    } else if (!success && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(paymentProvider.error ?? 'Fine not found')),
      );
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Enter Fine Details')),
        body: SafeArea(
          child: AnimatedBuilder(
            animation: _paymentProvider,
            builder: (context, _) {
              final paymentProvider = _paymentProvider;

              return SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        'Fine Information',
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Enter your fine reference number and category',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 32),
                      TextField(
                        controller: _referenceNumberController,
                        decoration: InputDecoration(
                          labelText: 'Fine Reference Number',
                          hintText: 'e.g., RF20240514001',
                          prefixIcon: const Icon(
                            Icons.confirmation_number_outlined,
                          ),
                          enabled: !paymentProvider.isLoading,
                        ),
                        enabled: !paymentProvider.isLoading,
                      ),
                      const SizedBox(height: 20),
                      DropdownButtonFormField<String>(
                        initialValue: _categoryIdController.text.isEmpty
                            ? null
                            : _categoryIdController.text,
                        decoration: InputDecoration(
                          labelText: 'Fine Category',
                          prefixIcon: const Icon(Icons.category_outlined),
                          enabled: !paymentProvider.isLoading,
                        ),
                        items: _fineCategories.map((category) {
                          final categoryId = category.split(' - ')[0];
                          return DropdownMenuItem<String>(
                            value: categoryId,
                            child: Text(category),
                          );
                        }).toList(),
                        onChanged: !paymentProvider.isLoading
                            ? (value) {
                                setState(() {
                                  _categoryIdController.text = value ?? '';
                                });
                              }
                            : null,
                      ),
                      const SizedBox(height: 32),
                      ElevatedButton(
                        onPressed: paymentProvider.isLoading
                            ? null
                            : () => _validateFine(context, paymentProvider),
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
                            : const Text('Find Fine'),
                      ),
                      const SizedBox(height: 24),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE3F2FD),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFF2196F3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(
                                  Icons.help_outline,
                                  color: Color(0xFF2196F3),
                                ),
                                const SizedBox(width: 12),
                                Text(
                                  'Need Help?',
                                  style: Theme.of(context).textTheme.labelLarge,
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Your fine reference number can be found on your traffic fine ticket.\n\nIf you cannot find your reference number, please contact the nearest police station or call our helpline.',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      );
}
