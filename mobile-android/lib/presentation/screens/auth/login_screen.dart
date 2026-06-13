import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../presentation/providers/auth_provider.dart';
import '../../../config/theme/app_theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _referenceController = TextEditingController();

  @override
  void dispose() {
    _referenceController.dispose();
    super.dispose();
  }

  void _handleLookup(BuildContext context, AuthProvider authProvider) async {
    if (_referenceController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter the reference number or token')),
      );
      return;
    }

    // Call backend to authenticate / fetch fine details
    // For now, we mock the success and pass a mock fineId
    final success = await authProvider.loginWithReference(_referenceController.text.trim());

    if (success && context.mounted) {
      // Assuming your fine ID is returned or derived from the login response
      final fineId = '1'; // Replace with actual Fine ID from backend
      context.go('/payment/$fineId');
    } else if (!success && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(authProvider.error ?? 'Invalid Reference Number')),
      );
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        body: SafeArea(
          child: SingleChildScrollView(
            child: Consumer<AuthProvider>(
              builder: (context, authProvider, _) {
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 60),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Header
                      Icon(Icons.local_police, size: 80, color: AppColors.primary),
                      const SizedBox(height: 24),
                      Text(
                        'Traffic Fine Pay',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.montserrat(
                          fontSize: 32,
                          fontWeight: FontWeight.w700,
                          color: AppColors.onSurface,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Enter the reference number provided by the officer to instantly pay your fine.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontSize: 16,
                          color: AppColors.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 48),

                      // Reference Number Field
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Reference Number / Token',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: AppColors.onSurfaceVariant,
                            ),
                          ),
                          const SizedBox(height: 8),
                          TextField(
                            controller: _referenceController,
                            decoration: InputDecoration(
                              hintText: 'e.g. DRV-771234567',
                              prefixIcon: const Icon(Icons.receipt_long),
                              enabled: !authProvider.isLoading,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 32),

                      // Pay Button
                      SizedBox(
                        height: 56,
                        child: ElevatedButton.icon(
                          onPressed: authProvider.isLoading
                              ? null
                              : () => _handleLookup(context, authProvider),
                          icon: authProvider.isLoading
                              ? const SizedBox.shrink()
                              : const Icon(Icons.search),
                          label: authProvider.isLoading
                              ? const CircularProgressIndicator(color: Colors.white)
                              : Text(
                                  'Find & Pay',
                                  style: GoogleFonts.inter(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ),
      );
}