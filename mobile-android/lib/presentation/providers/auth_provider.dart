import 'package:flutter/material.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/repositories/fine_repository.dart';
import '../../domain/models/traffic_fine.dart';
import '../../config/dependencies/service_locator.dart';

class AuthProvider extends ChangeNotifier {
  final AuthRepository _authRepository = getIt<AuthRepository>();
  final FineRepository _fineRepository = getIt<FineRepository>();

  bool _isLoading = false;
  bool _isAuthenticated = false;
  String? _error;
  TrafficFine? _currentFine;

  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  String? get error => _error;
  TrafficFine? get currentFine => _currentFine;

  Future<bool> loginWithReference(String referenceOrToken) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Look up the fine using the provided reference number
      final fine = await _fineRepository.validateFine(
        referenceNumber: referenceOrToken,
      );
      
      _currentFine = fine;
      _isAuthenticated = true; 
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Could not find fine. Please check the reference number.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  void logout() {
    _isAuthenticated = false;
    _currentFine = null;
    _authRepository.logout();
    notifyListeners();
  }
}