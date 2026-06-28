import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../../../domain/models/traffic_fine.dart';
import '../../../domain/models/payment.dart';
import '../../../domain/models/user.dart';

class ApiClient {
  ApiClient() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          if (_token != null) {
            options.headers['Authorization'] = 'Bearer $_token';
          }
          return handler.next(options);
        },
        onError: (error, handler) {
          if (error.response?.statusCode == 401) {
            // Handle unauthorized access
          }
          return handler.next(error);
        },
      ),
    );
  }

  static const String _configuredBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
  );

  static String get _baseUrl {
    if (_configuredBaseUrl.isNotEmpty) {
      return _configuredBaseUrl;
    }

    if (kIsWeb) {
      return 'http://localhost:8080/api/v1';
    }

    // Android Emulator loopback IP to reach your local Spring Boot server
    return 'http://10.0.2.2:8080/api/v1';
  }

  late final Dio _dio = Dio(
    BaseOptions(
      baseUrl: _baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      contentType: 'application/json',
    ),
  );

  String? _token;

  void setToken(String token) {
    _token = token;
  }

  void clearToken() {
    _token = null;
  }

  // --- Generic HTTP Methods (ONLY ONE DEFINITION EACH) ---
  Future<dynamic> get(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return response.data;
    } on DioException catch (e) {
      throw Exception(_handleException(e));
    }
  }

  Future<dynamic> post(String path, {dynamic data}) async {
    try {
      final response = await _dio.post(path, data: data);
      return response.data;
    } on DioException catch (e) {
      throw Exception(_handleException(e));
    }
  }

  // --- Auth Endpoints ---
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {'username': email, 'password': password},
      );
      return response.data;
    } on DioException catch (e) {
      throw Exception(_handleException(e));
    }
  }

  Future<Map<String, dynamic>> register({
    required String licenseNumber,
    required String email,
    required String password,
    required String phoneNumber,
    required String firstName,
    required String lastName,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/signup',
        data: {
          'username': email,
          'password': password,
          'licenseNumber': licenseNumber,
          'phoneNumber': phoneNumber,
          'firstName': firstName,
          'lastName': lastName,
        },
      );
      return response.data;
    } on DioException catch (e) {
      throw Exception(_handleException(e));
    }
  }

  // --- Fine Endpoints ---
  Future<TrafficFine> getFineByReference({
    required String referenceNumber,
    required String categoryId,
  }) async {
    try {
      final response = await _dio.get(
        '/fines/validate',
        queryParameters: {
          'referenceNumber': referenceNumber,
          'categoryId': categoryId,
        },
      );
      return TrafficFine.fromJson(response.data);
    } on DioException catch (e) {
      throw Exception(_handleException(e));
    }
  }

  Future<User> getUserProfile() async {
    try {
      debugPrint('🚦 API CLIENT EXECUTING GET /users/profile');
      final response = await _dio.get('/users/profile');
      debugPrint('🚦 API CLIENT RESPONSE RECEIVED: ${response.statusCode}');
      debugPrint('🚦 RAW JSON FROM BACKEND: ${response.data}');
      
      return User.fromJson(response.data);
    } on DioException catch (e) {
      debugPrint('🚨 API CLIENT ERROR: ${e.response?.statusCode} - ${e.message}');
      throw Exception(_handleException(e));
    } catch (e) {
      debugPrint('🚨 API CLIENT UNKNOWN ERROR: $e');
      throw Exception('Unknown error: $e');
    }
  }

  // --- Payment Endpoints ---
  Future<Payment> createPayment({
    required String fineId,
    required String paymentMethod,
  }) async {
    try {
      final response = await _dio.post(
        '/payments',
        data: {'fineId': fineId, 'paymentMethod': paymentMethod},
      );
      return Payment.fromJson(response.data);
    } on DioException catch (e) {
      throw Exception(_handleException(e));
    }
  }

  Future<Payment> getPaymentStatus(String paymentId) async {
    try {
      final response = await _dio.get('/payments/$paymentId');
      return Payment.fromJson(response.data);
    } on DioException catch (e) {
      throw Exception(_handleException(e));
    }
  }

  Future<List<Payment>> getPaymentHistory() async {
    try {
      final response = await _dio.get('/payments/history');
      final List<dynamic> data = response.data;
      return data
          .map((json) => Payment.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw Exception(_handleException(e));
    }
  }

  Future<Payment> verifyPayment({
    required String paymentId,
    required String transactionId,
  }) async {
    try {
      final response = await _dio.post(
        '/payments/$paymentId/verify',
        data: {'transactionId': transactionId},
      );
      return Payment.fromJson(response.data);
    } on DioException catch (e) {
      throw Exception(_handleException(e));
    }
  }

  // --- Error Handler ---
  String _handleException(DioException e) {
    if (e.response != null) {
      final data = e.response?.data;
      
      // If the backend sent a proper JSON map, extract the message
      if (data is Map<String, dynamic>) {
        return data['message'] ?? 'An error occurred';
      }
      
      // If the backend sent a plain string (like a 403 Access Denied), return the string
      if (data is String) {
        return 'Backend Status ${e.response?.statusCode}: $data';
      }
    }
    return e.message ?? 'A network error occurred';
  }
}