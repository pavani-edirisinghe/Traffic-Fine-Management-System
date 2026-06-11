import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../presentation/providers/auth_provider.dart';
import '../../../config/theme/app_theme.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _licenseNumberController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  bool _obscurePassword = true;
  bool _agreedToTerms = false;
  int _passwordStrength = 0;

  @override
  void dispose() {
    _licenseNumberController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _phoneController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    super.dispose();
  }

  int _calculatePasswordStrength(String password) {
    int strength = 0;
    if (password.length >= 8) strength++;
    if (password.contains(RegExp(r'[a-z]')) &&
        password.contains(RegExp(r'[A-Z]'))) strength++;
    if (password.contains(RegExp(r'[0-9]'))) strength++;
    if (password.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) strength++;
    return strength;
  }

  void _handleRegister(BuildContext context, AuthProvider authProvider) async {
    if (_firstNameController.text.isEmpty ||
        _lastNameController.text.isEmpty ||
        _licenseNumberController.text.isEmpty ||
        _emailController.text.isEmpty ||
        _passwordController.text.isEmpty ||
        _phoneController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')),
      );
      return;
    }

    if (!_agreedToTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Please agree to the terms and conditions')),
      );
      return;
    }

    final success = await authProvider.register(
      licenseNumber: _licenseNumberController.text,
      email: _emailController.text,
      password: _passwordController.text,
      phoneNumber: _phoneController.text,
      firstName: _firstNameController.text,
      lastName: _lastNameController.text,
    );

    if (success && context.mounted) {
      context.go('/home');
    } else if (!success && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(authProvider.error ?? 'Registration failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
          title: Text(
            'Digital Fine Pay',
            style: GoogleFonts.montserrat(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: AppColors.primary,
            ),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.language),
              onPressed: () {},
            ),
          ],
        ),
        body: SafeArea(
          child: Consumer<AuthProvider>(
            builder: (context, authProvider, _) {
              return SingleChildScrollView(
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Header
                      Text(
                        'Create Account',
                        style: GoogleFonts.montserrat(
                          fontSize: 32,
                          fontWeight: FontWeight.w700,
                          color: AppColors.onSurface,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Register securely to manage and pay your fines.',
                        style: GoogleFonts.inter(
                          fontSize: 16,
                          fontWeight: FontWeight.w400,
                          color: AppColors.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // First Name
                      _buildFormField(
                        label: 'First Name (as per NIC)',
                        controller: _firstNameController,
                        hint: 'A. B.',
                        icon: Icons.person,
                        enabled: !authProvider.isLoading,
                      ),
                      const SizedBox(height: 16),

                      // Last Name
                      _buildFormField(
                        label: 'Last Name (as per NIC)',
                        controller: _lastNameController,
                        hint: 'Perera',
                        icon: Icons.person_outline,
                        enabled: !authProvider.isLoading,
                      ),
                      const SizedBox(height: 16),

                      // NIC Number
                      _buildFormField(
                        label: 'National Identity Card (NIC)',
                        controller: _licenseNumberController,
                        hint: 'e.g. 199012345678 or 901234567V',
                        icon: Icons.badge,
                        enabled: !authProvider.isLoading,
                      ),
                      const SizedBox(height: 16),

                      // Email
                      _buildFormField(
                        label: 'Email Address',
                        controller: _emailController,
                        hint: 'name@example.com',
                        icon: Icons.mail,
                        enabled: !authProvider.isLoading,
                        keyboardType: TextInputType.emailAddress,
                      ),
                      const SizedBox(height: 16),

                      // Phone Number
                      _buildPhoneField(enabled: !authProvider.isLoading),
                      const SizedBox(height: 16),

                      // Password with strength meter
                      _buildPasswordField(authProvider),
                      const SizedBox(height: 16),

                      // Terms & Conditions
                      Container(
                        decoration: BoxDecoration(
                          color: AppColors.surfaceContainerLowest,
                          border: Border.all(color: AppColors.outlineVariant),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Checkbox(
                              value: _agreedToTerms,
                              onChanged: (val) {
                                setState(() {
                                  _agreedToTerms = val ?? false;
                                });
                              },
                              fillColor: WidgetStateProperty.all(
                                _agreedToTerms
                                    ? AppColors.primary
                                    : AppColors.outline,
                              ),
                            ),
                            Expanded(
                              child: Text.rich(
                                TextSpan(
                                  text: 'I agree to the ',
                                  style: GoogleFonts.inter(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w400,
                                    color: AppColors.onSurfaceVariant,
                                  ),
                                  children: [
                                    TextSpan(
                                      text: 'Terms of Service',
                                      style: GoogleFonts.inter(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                    TextSpan(
                                      text: ' and acknowledge the ',
                                      style: GoogleFonts.inter(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w400,
                                        color: AppColors.onSurfaceVariant,
                                      ),
                                    ),
                                    TextSpan(
                                      text: 'Privacy Policy',
                                      style: GoogleFonts.inter(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                    TextSpan(
                                      text:
                                          ' governing official state transactions.',
                                      style: GoogleFonts.inter(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w400,
                                        color: AppColors.onSurfaceVariant,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Register Button
                      SizedBox(
                        height: 56,
                        child: ElevatedButton.icon(
                          onPressed: authProvider.isLoading || !_agreedToTerms
                              ? null
                              : () => _handleRegister(context, authProvider),
                          icon: authProvider.isLoading
                              ? const SizedBox.shrink()
                              : const Icon(Icons.how_to_reg),
                          label: authProvider.isLoading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation(
                                      AppColors.onPrimary,
                                    ),
                                  ),
                                )
                              : Text(
                                  'Create Account',
                                  style: GoogleFonts.inter(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Login Link
                      Center(
                        child: RichText(
                          text: TextSpan(
                            text: 'Already have an account? ',
                            style: GoogleFonts.inter(
                              fontSize: 16,
                              fontWeight: FontWeight.w400,
                              color: AppColors.onSurfaceVariant,
                            ),
                            children: [
                              TextSpan(
                                text: 'Log In',
                                style: GoogleFonts.inter(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.primary,
                                ),
                                recognizer: authProvider.isLoading
                                    ? null
                                    : (TapGestureRecognizer()
                                      ..onTap = () => context.pop()),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      );

  Widget _buildFormField({
    required String label,
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    required bool enabled,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          enabled: enabled,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: Icon(icon),
          ),
        ),
      ],
    );
  }

  Widget _buildPhoneField({required bool enabled}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Phone Number',
          style: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Container(
              decoration: BoxDecoration(
                color: AppColors.surfaceContainer,
                border: Border(
                  top: BorderSide(color: AppColors.outline, width: 2),
                  left: BorderSide(color: AppColors.outline, width: 2),
                  bottom: BorderSide(color: AppColors.outline, width: 2),
                ),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(8),
                  bottomLeft: Radius.circular(8),
                ),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              child: Text(
                '+94',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.onSurfaceVariant,
                ),
              ),
            ),
            Expanded(
              child: TextField(
                controller: _phoneController,
                enabled: enabled,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  hintText: '77 123 4567',
                  border: OutlineInputBorder(
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(8),
                      bottomRight: Radius.circular(8),
                    ),
                    borderSide: BorderSide(color: AppColors.outline, width: 2),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(8),
                      bottomRight: Radius.circular(8),
                    ),
                    borderSide: BorderSide(color: AppColors.outline, width: 2),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(8),
                      bottomRight: Radius.circular(8),
                    ),
                    borderSide: BorderSide(color: AppColors.primary, width: 2),
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPasswordField(AuthProvider authProvider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Create Password',
          style: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _passwordController,
          enabled: !authProvider.isLoading,
          obscureText: _obscurePassword,
          onChanged: (val) {
            setState(() {
              _passwordStrength = _calculatePasswordStrength(val);
            });
          },
          decoration: InputDecoration(
            hintText: '••••••••',
            prefixIcon: const Icon(Icons.lock),
            suffixIcon: IconButton(
              icon: Icon(
                _obscurePassword ? Icons.visibility_off : Icons.visibility,
              ),
              onPressed: () {
                setState(() {
                  _obscurePassword = !_obscurePassword;
                });
              },
            ),
          ),
        ),
        const SizedBox(height: 8),
        // Password strength meter
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: List.generate(
                4,
                (index) => Expanded(
                  child: Container(
                    height: 6,
                    margin: EdgeInsets.only(right: index < 3 ? 4 : 0),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(3),
                      color: index < _passwordStrength
                          ? AppColors.primary
                          : AppColors.surfaceContainerHigh,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _getStrengthLabel(_passwordStrength),
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                    color: AppColors.onSurfaceVariant,
                  ),
                ),
                Text(
                  '8+ Characters',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                    color: AppColors.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }

  String _getStrengthLabel(int strength) {
    switch (strength) {
      case 0:
        return 'Too Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Strong';
      case 4:
        return 'Very Strong';
      default:
        return '';
    }
  }
}
