import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../config/dependencies/service_locator.dart';
import '../../../data/repositories/auth_repository.dart';
import '../../../presentation/providers/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('Profile'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        body: SafeArea(
          child: AnimatedBuilder(
            animation: getIt<AuthProvider>(),
            builder: (context, _) {
              final authProvider = getIt<AuthProvider>();
              final user =
                  authProvider.user ?? getIt<AuthRepository>().getCachedUser();

              if (user == null) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.person_off, size: 56),
                        const SizedBox(height: 12),
                        Text(
                          'No profile data found',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Sign in again with the demo account to load the saved profile.',
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 16),
                        OutlinedButton(
                          onPressed: () => context.go('/login'),
                          child: const Text('Go to Login'),
                        ),
                      ],
                    ),
                  ),
                );
              }

              return SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Center(
                        child: Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E88E5),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              user.firstName.isNotEmpty
                                  ? user.firstName[0]
                                  : '?',
                              style: const TextStyle(
                                fontSize: 48,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      Center(
                        child: Text(
                          user.fullName,
                          style: Theme.of(context).textTheme.headlineMedium,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Center(
                        child: Text(
                          user.licenseNumber,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ),
                      const SizedBox(height: 32),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Personal Information',
                                style:
                                    Theme.of(context).textTheme.headlineSmall,
                              ),
                              const SizedBox(height: 16),
                              _buildInfoRow(context, 'Email:', user.email),
                              const SizedBox(height: 12),
                              _buildInfoRow(
                                  context, 'Phone:', user.phoneNumber),
                              const SizedBox(height: 12),
                              _buildInfoRow(
                                context,
                                'License Expiry:',
                                user.licenseExpiryDate,
                              ),
                              const SizedBox(height: 12),
                              _buildInfoRow(
                                context,
                                'Member Since:',
                                user.createdAt,
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Card(
                        child: Column(
                          children: [
                            ListTile(
                              leading: const Icon(Icons.payment),
                              title: const Text('Payment History'),
                              trailing: const Icon(Icons.chevron_right),
                              onTap: () => context.push('/payment-history'),
                            ),
                            const Divider(height: 1),
                            ListTile(
                              leading: const Icon(Icons.settings),
                              title: const Text('Settings'),
                              trailing: const Icon(Icons.chevron_right),
                              onTap: () => context.push('/settings'),
                            ),
                            const Divider(height: 1),
                            ListTile(
                              leading: const Icon(Icons.help_outline),
                              title: const Text('Help & Support'),
                              trailing: const Icon(Icons.chevron_right),
                              onTap: () => context.push('/help-support'),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: () async {
                          await authProvider.logout();
                          if (context.mounted) {
                            context.go('/login');
                          }
                        },
                        icon: const Icon(Icons.logout),
                        label: const Text('Logout'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE53935),
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

  Widget _buildInfoRow(BuildContext context, String label, String value) => Row(
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
}
