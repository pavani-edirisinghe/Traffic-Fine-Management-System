import '../../domain/models/traffic_fine.dart';
import '../datasources/remote/api_client.dart';
import 'package:flutter/foundation.dart';

class FineRepository {
  FineRepository({required ApiClient apiClient}) : _apiClient = apiClient;
  final ApiClient _apiClient;

  Future<TrafficFine> validateFine({required String referenceNumber}) async {
    try {
      debugPrint('🚦 [REPO] SENDING REQUEST TO BACKEND: /fines/validate?referenceNumber=$referenceNumber');
      
      // Using Dio's queryParameters is safer than string interpolation
      final response = await _apiClient.get(
        '/fines/validate', 
        queryParameters: {'referenceNumber': referenceNumber}
      );
      
      debugPrint('🚦 [REPO] RECEIVED DATA FROM BACKEND!');
      return TrafficFine.fromJson(response);
      
    } catch (e) {
      // PRINT THE EXACT NETWORK ERROR
      debugPrint('🚨 [REPO] CRITICAL NETWORK ERROR: $e'); 
      throw Exception('Unmasked Error: $e');
    }
  }
}