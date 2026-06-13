import 'dart:convert';
import 'package:intl/intl.dart';
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
  static const String _mockReferenceNumber = 'REF-2026-001234';

  Future<Payment> initiatePayment({
    required String fineId,
    required String paymentMethod,
  }) async {
    try {
      final payment = await _apiClient.createPayment(
        fineId: fineId,
        paymentMethod: paymentMethod,
      );
      await saveOfflinePayment(payment);
      return payment;
    } catch (_) {
      final payment = Payment(
        id: 'pay-${DateTime.now().millisecondsSinceEpoch}',
        fineId: fineId,
        referenceNumber: _mockReferenceNumber,
        amount: 5000,
        paymentMethod: paymentMethod,
        status: 'PENDING',
        transactionId: null,
        paymentDate: DateFormat('dd MMM yyyy, HH:mm').format(DateTime.now()),
        receiptUrl: null,
        notes: 'Demo payment session',
      );
      await _replaceOfflinePayment(payment);
      return payment;
    }
  }

  Future<Payment> verifyPayment({
    required String paymentId,
    required String transactionId,
  }) async {
    try {
      final payment = await _apiClient.verifyPayment(
        paymentId: paymentId,
        transactionId: transactionId,
      );
      await _replaceOfflinePayment(payment);
      return payment;
    } catch (_) {
      final existing = _findOfflinePayment(paymentId);
      final payment = Payment(
        id: paymentId,
        fineId: existing?.fineId ?? 'fine-demo',
        referenceNumber: existing?.referenceNumber ?? _mockReferenceNumber,
        amount: existing?.amount ?? 5000,
        paymentMethod: existing?.paymentMethod ?? 'CARD',
        status: 'COMPLETED',
        transactionId: transactionId,
        paymentDate: existing?.paymentDate ??
            DateFormat('dd MMM yyyy, HH:mm').format(DateTime.now()),
        receiptUrl: null,
        notes: 'Demo payment completed',
      );
      await _replaceOfflinePayment(payment);
      return payment;
    }
  }

  Future<Payment> getPaymentStatus(String paymentId) async =>
      _apiClient.getPaymentStatus(paymentId);

  Future<List<Payment>> getPaymentHistory() async {
    try {
      return await _apiClient.getPaymentHistory();
    } catch (_) {
      final offlinePayments = getOfflinePayments();
      if (offlinePayments.isNotEmpty) {
        return offlinePayments;
      }

      return [
        Payment(
          id: 'history-001',
          fineId: 'fine-history-001',
          referenceNumber: 'REF-2025-009876',
          amount: 2500,
          paymentMethod: 'CARD',
          status: 'COMPLETED',
          transactionId: 'TXN-001',
          paymentDate: '12 Oct 2025',
          receiptUrl: null,
          notes: 'Speeding violation',
        ),
        Payment(
          id: 'history-002',
          fineId: 'fine-history-002',
          referenceNumber: 'REF-2025-005432',
          amount: 1000,
          paymentMethod: 'MOBILE_BANKING',
          status: 'COMPLETED',
          transactionId: 'TXN-002',
          paymentDate: '05 Sep 2025',
          receiptUrl: null,
          notes: 'Parking fine',
        ),
      ];
    }
  }

  Future<void> saveOfflinePayment(Payment payment) async {
    final payments = getOfflinePayments();
    payments.add(payment);
    await _persistOfflinePayments(payments);
  }

  List<Payment> getOfflinePayments() {
    final paymentStrings = _localStorage.getOfflinePayments();
    if (paymentStrings == null || paymentStrings.isEmpty) {
      return [];
    }

    return paymentStrings
        .map((json) => Payment.fromJson(jsonDecode(json)))
        .toList();
  }

  Future<void> _replaceOfflinePayment(Payment payment) async {
    final payments = getOfflinePayments();
    payments.removeWhere((item) => item.id == payment.id);
    payments.add(payment);
    await _persistOfflinePayments(payments);
  }

  Payment? _findOfflinePayment(String paymentId) {
    for (final payment in getOfflinePayments()) {
      if (payment.id == paymentId) {
        return payment;
      }
    }
    return null;
  }

  Future<void> _persistOfflinePayments(List<Payment> payments) async {
    final serializedPayments =
        payments.map((payment) => jsonEncode(payment.toJson())).toList();
    await _localStorage.saveOfflinePayments(serializedPayments);
  }

  Future<void> clearOfflinePayments() async {
    await _localStorage.clearOfflinePayments();
  }
}
