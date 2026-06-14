import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../config/dependencies/service_locator.dart';
import '../../../presentation/providers/payment_provider.dart';
import '../../../data/repositories/fine_repository.dart';
import '../../../domain/models/traffic_fine.dart';

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({Key? key, required this.fineId}) : super(key: key);
  
  // Note: Since we updated the router earlier, this fineId is actually the 
  // reference number string (e.g., TF-2026-3578C0)
  final String fineId;

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  late final PaymentProvider _paymentProvider = getIt<PaymentProvider>();
  late final FineRepository _fineRepo = getIt<FineRepository>();
  
  late Future<TrafficFine> _fineFuture;

  @override
  void initState() {
    super.initState();
    // 1. AUTO-LOAD: Fetch the fine exactly like React's useEffect does
    _fineFuture = _fineRepo.validateFine(referenceNumber: widget.fineId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // Web Portal Background Color
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: const Color(0xFF1976D2),
        title: const Text(
          'SEARCH ANOTHER TICKET',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/login'),
        ),
      ),
      body: SafeArea(
        child: FutureBuilder<TrafficFine>(
          future: _fineFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 16),
                    Text('Searching for ticket...', style: TextStyle(color: Colors.grey)),
                  ],
                ),
              );
            }

            if (snapshot.hasError || !snapshot.hasData) {
              return Center(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  margin: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.red[50],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'No fine found with those details. Please check your reference number and try again.',
                    style: TextStyle(color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                ),
              );
            }

            final fine = snapshot.data!;

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 480),
                  child: Card(
                    elevation: 6,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // --- BLUE HEADER ---
                        Container(
                          color: const Color(0xFF1976D2), // React Blue
                          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                          child: const Column(
                            children: [
                              Icon(Icons.local_police, color: Colors.white, size: 48),
                              SizedBox(height: 12),
                              Text(
                                'Traffic Fine Portal',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'Sri Lanka Police Department',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // --- WHITE CONTENT BODY ---
                        Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Ticket Found: ${fine.referenceNumber}',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              if (fine.driverId.isNotEmpty)
                                Text(
                                  'Driver: ${fine.driverId}', // Update if you have a driverName field
                                  style: TextStyle(color: Colors.grey[700], fontSize: 14),
                                ),
                              const SizedBox(height: 24),

                              // --- GREY DETAILS BOX ---
                              Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF1F5F9),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Column(
                                  children: [
                                    _buildDetailRow('Wrong Did:', fine.categoryName),
                                    const SizedBox(height: 12),
                                    _buildDetailRow('Vehicle No:', fine.vehicleNumber),
                                    const SizedBox(height: 12),
                                    _buildDetailRow('Status:', fine.status, isStatus: true),
                                    const Padding(
                                      padding: EdgeInsets.symmetric(vertical: 12),
                                      child: Divider(height: 1, color: Colors.black12),
                                    ),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text('Amount Due:', style: TextStyle(color: Colors.grey[700])),
                                        Text(
                                          'Rs. ${fine.amount.toStringAsFixed(0)}',
                                          style: const TextStyle(
                                            fontSize: 20,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFFD32F2F), // Red text
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 24),

                              // --- GREEN PAYMENT BUTTON ---
                              AnimatedBuilder(
                                animation: _paymentProvider,
                                builder: (context, _) {
                                  final isLoading = _paymentProvider.isLoading;
                                  return SizedBox(
                                    width: double.infinity,
                                    height: 50,
                                    child: ElevatedButton.icon(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF2E7D32), // React Green
                                        foregroundColor: Colors.white,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                      ),
                                      onPressed: isLoading
                                          ? null
                                          : () => _initiatePayment(context),
                                      icon: isLoading 
                                          ? const SizedBox.shrink() 
                                          : const Icon(Icons.payment),
                                      label: isLoading
                                          ? const SizedBox(
                                              height: 20, width: 20,
                                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                            )
                                          : Text(
                                              'PAY RS. ${fine.amount.toStringAsFixed(0)}',
                                              style: const TextStyle(
                                                fontSize: 16, 
                                                fontWeight: FontWeight.bold
                                              ),
                                            ),
                                    ),
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isStatus = false}) {
    Color? valueColor;
    if (isStatus) {
      valueColor = value.toUpperCase() == 'PAID' ? Colors.green[700] : Colors.orange[800];
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: Colors.grey[700])),
        Text(
          value,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: valueColor ?? Colors.black87,
          ),
        ),
      ],
    );
  }

  void _initiatePayment(BuildContext context) async {
    // Hidden the Dropdown to match React Web Portal UI exactly. 
    // Defaulting to CARD for the provider.
    final success = await _paymentProvider.initiatePayment(paymentMethod: 'CARD');

    if (success && context.mounted) {
      // Assuming your provider sets currentPayment upon success
      final paymentId = _paymentProvider.currentPayment?.id ?? 'success';
      context.push('/payment-confirmation/$paymentId');
    } else if (!success && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_paymentProvider.error ?? 'Payment failed'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}