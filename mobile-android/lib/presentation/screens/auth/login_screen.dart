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

 
  void _handleLookup(BuildContext context) async {
    final referenceNumber = _referenceController.text.trim();
    
    if (referenceNumber.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid reference number')),
      );
      return;
    }

    // Call the AuthProvider to log in with the token
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.loginAsDriver(referenceNumber);

    if (success && context.mounted) {
      // NOTE: Update this routing logic based on how you want to navigate after login
      context.go('/payment/$referenceNumber');
    } else if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(authProvider.error ?? 'Login Failed')),
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
                              hintText: 'e.g. TF-2026-3578C0',
                              prefixIcon: const Icon(Icons.receipt_long),
                              enabled: !authProvider.isLoading,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 32),

                      // Pay Button
                      // Pay Button
                      SizedBox(
                        height: 56,
                        child: ElevatedButton.icon(
                          onPressed: () => _handleLookup(context),
                          icon: const Icon(Icons.search),
                          label: Text(
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