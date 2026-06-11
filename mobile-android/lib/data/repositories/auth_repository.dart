import 'dart:convert';
import '../../domain/models/user.dart';
import '../datasources/remote/api_client.dart';
import '../datasources/local/local_storage_datasource.dart';

class AuthRepository {
  static const String mockEmail = 'demo@trafficfine.lk';
  static const String mockPassword = 'Demo@1234';

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
    try {
      if (email.trim().toLowerCase() == mockEmail && password == mockPassword) {
        final mockUser = User(
          id: 'demo-user-001',
          username: mockEmail,
          licenseNumber: 'B1234567',
          email: mockEmail,
          phoneNumber: '+94 77 123 4567',
          firstName: 'Vijay',
          lastName: 'Mendis',
          role: 'DRIVER',
          licenseExpiryDate: '2030-10-14',
          createdAt: '2024-10-14',
        );

        await _localStorage.saveToken('mock-session-token');
        await _localStorage.saveUserData(jsonEncode(mockUser.toJson()));
        _apiClient.setToken('mock-session-token');

        return mockUser;
      }

      final response = await _apiClient.login(email: email, password: password);

      final token = (response['accessToken'] ?? response['token']) as String;
      final userData = (response['user'] as Map<String, dynamic>?) ?? response;

      // Save token and user data locally
      await _localStorage.saveToken(token);
      await _localStorage.saveUserData(jsonEncode(userData));
      _apiClient.setToken(token);

      return User.fromJson(userData);
    } catch (e) {
      rethrow;
    }
  }

  Future<User> register({
    required String licenseNumber,
    required String email,
    required String password,
    required String phoneNumber,
    required String firstName,
    required String lastName,
  }) async {
    try {
      final response = await _apiClient.register(
        licenseNumber: licenseNumber,
        email: email,
        password: password,
        phoneNumber: phoneNumber,
        firstName: firstName,
        lastName: lastName,
      );

      final token = (response['accessToken'] ?? response['token']) as String;
      final userData = (response['user'] as Map<String, dynamic>?) ?? response;

      // Save token and user data locally
      await _localStorage.saveToken(token);
      await _localStorage.saveUserData(jsonEncode(userData));
      _apiClient.setToken(token);

      return User.fromJson(userData);
    } catch (e) {
      rethrow;
    }
  }

  Future<User> getUserProfile() async => _apiClient.getUserProfile();

  User? getCachedUser() {
    final userData = _localStorage.getUserData();
    if (userData != null) {
      return User.fromJson(jsonDecode(userData));
    }
    return null;
  }

  bool isAuthenticated() {
    final token = _localStorage.getToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> logout() async {
    await _localStorage.clearAll();
    _apiClient.clearToken();
  }

  Future<void> restoreSession() async {
    final token = _localStorage.getToken();
    if (token != null) {
      _apiClient.setToken(token);
    }
  }
}
