import 'package:flutter/material.dart';
import '../../data/repositories/auth_repository.dart';
import '../../domain/models/user.dart';

class AuthProvider extends ChangeNotifier {
  AuthProvider({required AuthRepository authRepository})
    : _authRepository = authRepository {
    _initialize();
  }
  final AuthRepository _authRepository;

  User? _user;
  String? _error;
  bool _isLoading = false;
  bool _isAuthenticated = false;

  // Getters
  User? get user => _user;
  String? get error => _error;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;

  Future<void> _initialize() async {
    await _authRepository.initialize();
    await _authRepository.restoreSession();
    _isAuthenticated = _authRepository.isAuthenticated();
    _user = _authRepository.getCachedUser();
    notifyListeners();
  }

  Future<bool> login({required String email, required String password}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _user = await _authRepository.login(email: email, password: password);
      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String licenseNumber,
    required String email,
    required String password,
    required String phoneNumber,
    required String firstName,
    required String lastName,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _user = await _authRepository.register(
        licenseNumber: licenseNumber,
        email: email,
        password: password,
        phoneNumber: phoneNumber,
        firstName: firstName,
        lastName: lastName,
      );
      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authRepository.logout();
    _user = null;
    _isAuthenticated = false;
    _error = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
