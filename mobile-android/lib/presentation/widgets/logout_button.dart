import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class LogoutButton extends StatefulWidget {
  // Fixed: Using Dart's modern super parameter syntax to clear the warning
  const LogoutButton({super.key});

  @override
  State<LogoutButton> createState() => _LogoutButtonState();
}

class _LogoutButtonState extends State<LogoutButton> {
  bool _isLoggingOut = false;

  Future<void> _handleLogout(BuildContext context) async {
    // Fixed: Using the correct variable name
    setState(() => _isLoggingOut = true);

    try {
      const storage = FlutterSecureStorage();
      await storage.deleteAll();

      if (!context.mounted) return;

      context.go('/login');
      
    } catch (e) {
      debugPrint('Logout Error: $e');
      // Fixed: Using the correct variable name
      setState(() => _isLoggingOut = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0),
      child: OutlinedButton.icon(
        style: OutlinedButton.styleFrom(
          foregroundColor: const Color(0xFF0F172A), 
          side: const BorderSide(color: Color(0xFFCBD5E1)), 
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        onPressed: _isLoggingOut ? null : () => _handleLogout(context),
        icon: _isLoggingOut
            ? const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : const Icon(Icons.logout, size: 18),
        label: const Text(
          'Logout',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}