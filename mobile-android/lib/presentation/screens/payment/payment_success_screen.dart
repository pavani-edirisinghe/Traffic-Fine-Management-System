import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../config/theme/app_theme.dart';

class PaymentSuccessScreen extends StatelessWidget {
  const PaymentSuccessScreen({Key? key, required this.paymentId})
      : super(key: key);

  final String paymentId;

  @override
  Widget build(BuildContext context) => Scaffold(
        body: SafeArea(
          child: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0xFFF9F9FF), Color(0xFFE8EEFF)],
              ),
            ),
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 560),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _StatusBadge(
                        icon: Icons.check_circle,
                        color: AppColors.success,
                        background: AppColors.successContainer,
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Payment Successful!',
                        textAlign: TextAlign.center,
                        style: Theme.of(context)
                            .textTheme
                            .headlineMedium
                            ?.copyWith(
                              color: AppColors.success,
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Your fine has been paid and the confirmation is ready.',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              color: AppColors.onSurfaceVariant,
                            ),
                      ),
                      const SizedBox(height: 28),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              _DetailRow(
                                  label: 'Confirmation Code',
                                  value: 'CONFIRM-2026-ABC123'),
                              const SizedBox(height: 12),
                              _DetailRow(label: 'Payment ID', value: paymentId),
                              const SizedBox(height: 12),
                              _DetailRow(
                                  label: 'Reference Number',
                                  value: 'REF-2026-001234'),
                              const SizedBox(height: 12),
                              _DetailRow(
                                  label: 'Amount Paid', value: 'LKR 5,000.00'),
                              const SizedBox(height: 12),
                              _DetailRow(
                                  label: 'Date & Time',
                                  value: '14 Oct 2024, 14:32 PM'),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {},
                              icon: const Icon(Icons.download),
                              label: const Text('Download'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {},
                              icon: const Icon(Icons.share),
                              label: const Text('Share'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => context.go('/home'),
                          child: const Text('Go Home'),
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.verified_user,
                              size: 18, color: AppColors.primary),
                          SizedBox(width: 8),
                          Text(
                            'Official State Transaction',
                            style: TextStyle(
                              fontSize: 12,
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
            ),
          ),
        ),
      );
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({
    required this.icon,
    required this.color,
    required this.background,
  });

  final IconData icon;
  final Color color;
  final Color background;

  @override
  Widget build(BuildContext context) => Container(
        width: 96,
        height: 96,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: background,
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Icon(icon, color: color, size: 56),
      );
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.onSurfaceVariant,
                  ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.onSurface,
                  ),
            ),
          ),
        ],
      );
}
