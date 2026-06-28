import 'dart:convert';
import '../../domain/models/user.dart';
import '../datasources/remote/api_client.dart';
import '../datasources/local/local_storage_datasource.dart';

class AuthRepository {
  AuthRepository({
    required ApiClient apiClient,
    required LocalStorageDataSource localStorage,
  })  : _apiClient = apiClient,
        _localStorage = localStorage;
        
  final ApiClient _apiClient;
  final LocalStorageDataSource _localStorage;

  Future<void> initialize() async {
    await _localStorage.initialize();
  }

  // Used for Officer/Admin standard login
  Future<User> login({required String email, required String password}) async {
    final response = await _apiClient.login(email: email, password: password);

    final token = (response['accessToken'] ?? response['token']) as String;
    final userData = (response['user'] as Map<String, dynamic>?) ?? response;

    await _localStorage.saveToken(token);
    await _localStorage.saveUserData(jsonEncode(userData));
    _apiClient.setToken(token);

    return User.fromJson(userData);
  }

  // NEW: Secure Driver Authentication Flow
  Future<User> authenticateDriver(String token) async {
    try {
      await _localStorage.saveToken(token);
      _apiClient.setToken(token);

      // Changed back to /auth/me (or /users/me depending on your backend)
      final response = await _apiClient.get('/auth/me'); 
      return User.fromJson(response);
      
    } catch (e) {
      await logout();
      throw Exception('Rejected: $e');
    }
  }

  // NEW: Used for Driver token-based login
  Future<User> getMe() async {
    try {
      // We assume _apiClient has a generic .get() method. 
      // If it doesn't, you will need to add one to api_client.dart
      final response = await _apiClient.get('/auth/me'); 
      return User.fromJson(response);
    } catch (e) {
      throw Exception('Failed to fetch profile from token: $e');
    }
  }

  // Upgrade this to a Future<bool>
  Future<bool> isAuthenticated() async {
    final token = await _localStorage.getToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> logout() async {
    // If Nirasha used clearAll() instead of deleteToken(), 
    // the provider's logout method will still work smoothly with this.
    await _localStorage.clearAll();
    _apiClient.clearToken();
  }
}