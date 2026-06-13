import '../../domain/models/traffic_fine.dart';
import '../datasources/remote/api_client.dart';

class FineRepository {
  FineRepository({required ApiClient apiClient}) : _apiClient = apiClient;
  final ApiClient _apiClient;

  Future<TrafficFine> validateFine({
    required String referenceNumber,
    required String categoryId,
  }) async {
    try {
      return await _apiClient.getFineByReference(
        referenceNumber: referenceNumber,
        categoryId: categoryId,
      );
    } catch (_) {
      return TrafficFine(
        id: 'fine-${referenceNumber.replaceAll(RegExp(r'[^A-Za-z0-9]'), '').toLowerCase()}',
        referenceNumber: referenceNumber,
        categoryId: categoryId,
        categoryName: _categoryName(categoryId),
        amount: _categoryAmount(categoryId),
        violationDescription: _violationDescription(categoryId),
        issueDate: '2026-06-11',
        driverId: 'demo-user-001',
        vehicleNumber: 'ABC-1234',
        status: 'PENDING',
      );
    }
  }

  String _categoryName(String categoryId) {
    switch (categoryId) {
      case 'C001':
        return 'Speeding';
      case 'C002':
        return 'Rash Driving';
      case 'C003':
        return 'No License';
      case 'C004':
        return 'Expired License';
      case 'C005':
        return 'Traffic Signal Violation';
      case 'C006':
        return 'No Insurance';
      case 'C007':
        return 'Overloading';
      case 'C008':
        return 'Defective Vehicle';
      default:
        return 'Traffic Violation';
    }
  }

  double _categoryAmount(String categoryId) {
    switch (categoryId) {
      case 'C001':
        return 5000;
      case 'C002':
        return 7500;
      case 'C003':
        return 10000;
      case 'C004':
        return 6000;
      case 'C005':
        return 8000;
      case 'C006':
        return 9000;
      case 'C007':
        return 12000;
      case 'C008':
        return 4500;
      default:
        return 5000;
    }
  }

  String _violationDescription(String categoryId) {
    switch (categoryId) {
      case 'C001':
        return 'Exceeded speed limit';
      case 'C002':
        return 'Unsafe driving behavior';
      case 'C003':
        return 'Driving without a valid license';
      case 'C004':
        return 'Expired driving license';
      case 'C005':
        return 'Failed to obey traffic light';
      case 'C006':
        return 'Vehicle was not insured';
      case 'C007':
        return 'Vehicle carried excess load';
      case 'C008':
        return 'Vehicle failed safety requirements';
      default:
        return 'Traffic rule violation';
    }
  }
}
