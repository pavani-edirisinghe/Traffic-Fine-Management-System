import 'package:flutter/material.dart';
import '../../data/repositories/fine_repository.dart';
import '../../config/dependencies/service_locator.dart';

class AuthProvider extends ChangeNotifier {
  final FineRepository _fineRepo = getIt<FineRepository>();

  bool _isLoading = false;
  bool _isAuthenticated = false;
  String? _error;
  String? _currentFineId; 

  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  String? get error => _error;
  String? get currentFineId => _currentFineId;

  Future<bool> loginAsDriver(String tokenInput) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      debugPrint('🚦 1. PUBLIC KIOSK MODE: Asking backend to validate $tokenInput...');

      // Direct hit to the backend endpoint we fixed in Spring Boot
      final fine = await _fineRepo.validateFine(referenceNumber: tokenInput);

      debugPrint('🚦 2. SUCCESS! BACKEND FOUND FINE ID: ${fine.id}');
      
      _currentFineId = fine.id.toString(); 
      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
      
    } catch (e) {
      debugPrint('🚨 BACKEND REJECTED CODE: $e');
      _error = 'Invalid Reference Number or Code not found.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  void logout() async {
    _isAuthenticated = false;
    _currentFineId = null;
    notifyListeners();
  }
}