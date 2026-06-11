import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../config/dependencies/service_locator.dart';
import '../../../presentation/providers/payment_provider.dart';
import '../../../config/theme/app_theme.dart';

class PaymentHistoryScreen extends StatefulWidget {
  const PaymentHistoryScreen({Key? key}) : super(key: key);

  @override
  State<PaymentHistoryScreen> createState() => _PaymentHistoryScreenState();
}

class _PaymentHistoryScreenState extends State<PaymentHistoryScreen> {
  late final PaymentProvider _paymentProvider = getIt<PaymentProvider>();

  @override
  void initState() {
    super.initState();
    Future.microtask(_paymentProvider.fetchPaymentHistory);
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          backgroundColor: AppColors.surfaceContainerLow,
          elevation: 1,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
          title: Text(
            'Payment History',
            style: GoogleFonts.montserrat(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: AppColors.primary,
            ),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.filter_list),
              onPressed: () {},
            )
          ],
        ),
        body: SafeArea(
          child: AnimatedBuilder(
            animation: _paymentProvider,
            builder: (context, _) {
              final paymentProvider = _paymentProvider;

              if (paymentProvider.isLoading) {
                return const Center(child: CircularProgressIndicator());
              }

              final history = paymentProvider.paymentHistory;
              final totalPaid = history.fold<double>(
                  0, (s, p) => s + (p.status == 'COMPLETED' ? p.amount : 0));

              if (history.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.receipt_long_outlined,
                        size: 64,
                        color: Colors.grey,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No payments yet',
                        style: GoogleFonts.montserrat(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: AppColors.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                );
              }

              return Column(
                children: [
                  // Sticky summary
                  Material(
                    elevation: 0.5,
                    color: AppColors.surface.withValues(alpha: 0.95),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Total Paid',
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.onSurfaceVariant,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'LKR ${totalPaid.toStringAsFixed(0)}',
                                style: GoogleFonts.montserrat(
                                  fontSize: 28,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.primary,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  // List
                  Expanded(
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 12),
                      itemCount: history.length,
                      itemBuilder: (context, index) {
                        final payment = history[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                          color: AppColors.surface,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(12),
                            onTap: () {},
                            child: Padding(
                              padding: const EdgeInsets.all(14),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              payment.referenceNumber,
                                              style: GoogleFonts.montserrat(
                                                fontSize: 16,
                                                fontWeight: FontWeight.w600,
                                                color: AppColors.onSurface,
                                              ),
                                            ),
                                            const SizedBox(height: 6),
                                            Text(
                                              payment.notes ?? '',
                                              style: GoogleFonts.inter(
                                                fontSize: 12,
                                                color: AppColors.outline,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.end,
                                        children: [
                                          Text(
                                            'LKR ${payment.amount.toStringAsFixed(0)}',
                                            style: GoogleFonts.montserrat(
                                              fontSize: 16,
                                              fontWeight: FontWeight.w600,
                                              color: AppColors.onSurface,
                                            ),
                                          ),
                                          const SizedBox(height: 6),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 8, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: payment.status ==
                                                      'COMPLETED'
                                                  ? AppColors.successContainer
                                                  : (payment.status == 'PENDING'
                                                      ? AppColors
                                                          .secondaryContainer
                                                      : AppColors
                                                          .errorContainer),
                                              borderRadius:
                                                  BorderRadius.circular(16),
                                            ),
                                            child: Text(
                                              payment.status,
                                              style: GoogleFonts.inter(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w700,
                                                color: payment.status ==
                                                        'COMPLETED'
                                                    ? AppColors.success
                                                    : AppColors.onSecondary,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Divider(
                                      color: AppColors.surfaceContainerHigh),
                                  const SizedBox(height: 8),
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        payment.paymentDate,
                                        style: GoogleFonts.inter(
                                          fontSize: 14,
                                          color: AppColors.onSurfaceVariant,
                                        ),
                                      ),
                                      const Icon(Icons.chevron_right,
                                          size: 18, color: Colors.grey),
                                    ],
                                  )
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      );
  // status color helper removed — theme tokens used instead
}
