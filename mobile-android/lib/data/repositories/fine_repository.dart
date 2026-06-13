import '../../domain/models/traffic_fine.dart';
import '../datasources/remote/api_client.dart';

class FineRepository {
  FineRepository({required ApiClient apiClient}) : _apiClient = apiClient;
  final ApiClient _apiClient;

  Future<TrafficFine> validateFine({
    required String referenceNumber,
    String? categoryId,
  }) async {
    // This will hit the backend /fines/validate endpoint
    return await _apiClient.getFineByReference(
      referenceNumber: referenceNumber,
      categoryId: categoryId ?? '', 
    );
  }
}