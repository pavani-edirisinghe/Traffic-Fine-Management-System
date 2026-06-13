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

    return 'http://192.168.1.100:8080/api/v1';
  }

  final Dio _dio = Dio(
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

  // Auth Endpoints
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
      throw _handleException(e);
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
      throw _handleException(e);
    }
  }

  // Fine Endpoints
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
      throw _handleException(e);
    }
  }

  Future<User> getUserProfile() async {
    try {
      final response = await _dio.get('/users/profile');
      return User.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleException(e);
    }
  }

  // Payment Endpoints
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
      throw _handleException(e);
    }
  }

  Future<Payment> getPaymentStatus(String paymentId) async {
    try {
      final response = await _dio.get('/payments/$paymentId');
      return Payment.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleException(e);
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
      throw _handleException(e);
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
      throw _handleException(e);
    }
  }

  String _handleException(DioException e) {
    if (e.response != null) {
      final message = e.response?.data['message'] ?? 'An error occurred';
      return message;
    }
    return e.message ?? 'An error occurred';
  }
}
