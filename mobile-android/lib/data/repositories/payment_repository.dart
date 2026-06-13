import '../../domain/models/payment.dart';
import '../datasources/remote/api_client.dart';
import '../datasources/local/local_storage_datasource.dart';

class PaymentRepository {
  PaymentRepository({
    required ApiClient apiClient,
    required LocalStorageDataSource localStorage,
  })  : _apiClient = apiClient,
        _localStorage = localStorage;
        
  final ApiClient _apiClient;
  final LocalStorageDataSource _localStorage;

  Future<Payment> initiatePayment({
    required String fineId,
    required String paymentMethod,
  }) async {
    return await _apiClient.createPayment(
      fineId: fineId,
      paymentMethod: paymentMethod,
    );
  }

  Future<Payment> verifyPayment({
    required String paymentId,
    required String transactionId,
  }) async {
    return await _apiClient.verifyPayment(
      paymentId: paymentId,
      transactionId: transactionId,
    );
  }

  Future<Payment> getPaymentStatus(String paymentId) async =>
      _apiClient.getPaymentStatus(paymentId);

  Future<List<Payment>> getPaymentHistory() async => 
      _apiClient.getPaymentHistory();
}