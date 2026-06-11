import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../config/theme/app_theme.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('Settings'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        body: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text(
              'Manage your application preferences and security.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: AppColors.onSurfaceVariant,
                  ),
            ),
            const SizedBox(height: 24),
            _SettingsSection(
              title: 'Notifications',
              children: const [
                _ToggleRow(
                    title: 'Push Notifications',
                    subtitle: 'Instant alerts on your device',
                    value: true),
                _ToggleRow(
                    title: 'SMS Alerts',
                    subtitle: 'For critical updates only',
                    value: false),
                _ToggleRow(
                    title: 'Email Receipts',
                    subtitle: 'Payment confirmations',
                    value: true),
              ],
            ),
            const SizedBox(height: 16),
            _SettingsSection(
              title: 'Preferences',
              children: const [
                _DropdownRow(title: 'Language', value: 'English'),
                _SegmentRow(title: 'App Theme', value: 'Light'),
                _SliderRow(title: 'Text Size', valueLabel: 'Default'),
              ],
            ),
            const SizedBox(height: 16),
            _SettingsSection(
              title: 'Privacy & Security',
              children: const [
                _ToggleRow(
                    title: 'Biometric Login',
                    subtitle: 'Use Fingerprint/Face ID',
                    value: true),
                _DropdownRow(title: 'Session Timeout', value: '15 Minutes'),
              ],
            ),
            const SizedBox(height: 16),
            _SettingsSection(
              title: 'About & Legal',
              children: [
                _ActionRow(title: 'Terms of Service', onTap: () {}),
                _ActionRow(title: 'Privacy Policy', onTap: () {}),
                const _InfoRow(
                    title: 'App Version', value: 'v2.4.1 (Build 890)'),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => context.go('/login'),
                icon: const Icon(Icons.logout),
                label: const Text('Logout'),
              ),
            ),
          ],
        ),
      );
}

class _SettingsSection extends StatelessWidget {
  const _SettingsSection({required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w700,
                    ),
              ),
              const SizedBox(height: 12),
              ...children,
            ],
          ),
        ),
      );
}

class _ToggleRow extends StatelessWidget {
  const _ToggleRow(
      {required this.title, required this.subtitle, required this.value});

  final String title;
  final String subtitle;
  final bool value;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: Theme.of(context).textTheme.bodyLarge),
                  Text(subtitle,
                      style: Theme.of(context)
                          .textTheme
                          .bodySmall
                          ?.copyWith(color: AppColors.onSurfaceVariant)),
                ],
              ),
            ),
            Switch(value: value, onChanged: (_) {}),
          ],
        ),
      );
}

class _DropdownRow extends StatelessWidget {
  const _DropdownRow({required this.title, required this.value});

  final String title;
  final String value;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: Theme.of(context).textTheme.bodyLarge),
            Text(value,
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(fontWeight: FontWeight.w600)),
          ],
        ),
      );
}

class _SegmentRow extends StatelessWidget {
  const _SegmentRow({required this.title, required this.value});

  final String title;
  final String value;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: Theme.of(context).textTheme.bodyLarge),
            Chip(label: Text(value)),
          ],
        ),
      );
}

class _SliderRow extends StatelessWidget {
  const _SliderRow({required this.title, required this.valueLabel});

  final String title;
  final String valueLabel;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: Theme.of(context).textTheme.bodyLarge),
                Text(valueLabel,
                    style: Theme.of(context)
                        .textTheme
                        .bodySmall
                        ?.copyWith(color: AppColors.onSurfaceVariant)),
              ],
            ),
            Slider(value: 0.5, onChanged: (_) {}),
          ],
        ),
      );
}

class _ActionRow extends StatelessWidget {
  const _ActionRow({required this.title, required this.onTap});

  final String title;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => ListTile(
        contentPadding: EdgeInsets.zero,
        title: Text(title),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      );
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.title, required this.value});

  final String title;
  final String value;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: Theme.of(context).textTheme.bodyLarge),
            Text(value,
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(fontWeight: FontWeight.w600)),
          ],
        ),
      );
}
