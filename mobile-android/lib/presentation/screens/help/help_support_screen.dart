import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../config/theme/app_theme.dart';

class HelpSupportScreen extends StatelessWidget {
  const HelpSupportScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('Help & Support'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        body: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text(
              'Find answers or get in touch with our team.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: AppColors.onSurfaceVariant,
                  ),
            ),
            const SizedBox(height: 20),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _ContactTile(
                      icon: Icons.call,
                      title: 'Phone Support',
                      value: '+94-1234-5678',
                      onTap: () {},
                    ),
                    const Divider(),
                    _ContactTile(
                      icon: Icons.mail,
                      title: 'Email Support',
                      value: 'support@digitalfinepay.lk',
                      onTap: () {},
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Frequently Asked Questions',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: AppColors.primary,
                  ),
            ),
            const SizedBox(height: 12),
            const _FaqCard(
              title: 'Getting Started',
              items: [
                'How do I create an account?',
                'What documents do I need to register?',
                'Is the app available in Sinhala and Tamil?',
              ],
            ),
            const SizedBox(height: 12),
            const _FaqCard(
              title: 'Payment & Fines',
              items: [
                'How quickly does a payment reflect?',
                'What payment methods are accepted?',
                'Can I pay a fine in installments?',
              ],
            ),
            const SizedBox(height: 12),
            const _FaqCard(
              title: 'Troubleshooting',
              items: [
                'App is crashing on launch',
                'Payment failed but money was deducted',
                'I cannot find my specific fine',
              ],
            ),
            const SizedBox(height: 20),
            Card(
              color: AppColors.surfaceContainerLow,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Still need help?',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: AppColors.onSurface,
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Our agents are available 24/7 to assist you.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppColors.onSurfaceVariant,
                          ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.chat),
                      label: const Text('Start Support Chat'),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
}

class _ContactTile extends StatelessWidget {
  const _ContactTile({
    required this.icon,
    required this.title,
    required this.value,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => ListTile(
        contentPadding: EdgeInsets.zero,
        leading: CircleAvatar(
          backgroundColor: AppColors.surfaceContainerLow,
          child: Icon(icon, color: AppColors.primary),
        ),
        title: Text(title),
        subtitle: Text(value),
        onTap: onTap,
      );
}

class _FaqCard extends StatelessWidget {
  const _FaqCard({required this.title, required this.items});

  final String title;
  final List<String> items;

  @override
  Widget build(BuildContext context) => Card(
        child: ExpansionTile(
          title: Text(title, style: Theme.of(context).textTheme.titleMedium),
          children: [
            for (final item in items)
              ListTile(
                dense: true,
                title: Text(item),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {},
              ),
          ],
        ),
      );
}
