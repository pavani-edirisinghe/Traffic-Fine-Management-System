import '../../domain/models/traffic_fine.dart';
import '../datasources/remote/api_client.dart';
import 'package:flutter/foundation.dart';

class FineRepository {
  FineRepository({required ApiClient apiClient}) : _apiClient = apiClient;
  final ApiClient _apiClient;

  Future<TrafficFine> validateFine({required String referenceNumber}) async {
    try {
      debugPrint('🚦 [REPO] SENDING REQUEST TO BACKEND: /api/v1/fines/reference/$referenceNumber');
      
      final response = await _apiClient.get(
        '/fines/reference/$referenceNumber'
      );
      
      debugPrint('🚦 [REPO] RECEIVED DATA FROM BACKEND!');
      return TrafficFine.fromJson(response);
      
    } catch (e) {
      debugPrint('🚨 [REPO] CRITICAL NETWORK ERROR: $e'); 
      throw Exception('Unmasked Error: $e');
    }
  }

  Future<bool> payFineById({
    required String fineId,
    required double amount,
    required String paymentMethod,
  }) async {
    try {
      debugPrint('🚦 [REPO] SENDING PAYMENT FOR FINE ID: $fineId');
      
      // Assuming your backend payment endpoint is /api/v1/payments
      await _apiClient.post(
        '/payments/$fineId', // Append the ID directly to the path
        data: {
          'amount': amount,
          'paymentMethod': paymentMethod, 
        },
      );

      debugPrint('🚦 [REPO] PAYMENT SUCCESSFUL!');
      return true;
    } catch (e) {
      debugPrint('🚨 [REPO] PAYMENT FAILED: $e');
      return false;
    }
  }

}