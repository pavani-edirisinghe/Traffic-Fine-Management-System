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

  Future<User> login({required String email, required String password}) async {
    final response = await _apiClient.login(email: email, password: password);

    final token = (response['accessToken'] ?? response['token']) as String;
    final userData = (response['user'] as Map<String, dynamic>?) ?? response;

    await _localStorage.saveToken(token);
    await _localStorage.saveUserData(jsonEncode(userData));
    _apiClient.setToken(token);

    return User.fromJson(userData);
  }

  bool isAuthenticated() {
    final token = _localStorage.getToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> logout() async {
    await _localStorage.clearAll();
    _apiClient.clearToken();
  }
}