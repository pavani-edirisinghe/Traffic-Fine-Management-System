import 'package:flutter/material.dart';
import '../../data/repositories/fine_repository.dart';
import '../../data/repositories/payment_repository.dart';
import '../../domain/models/traffic_fine.dart';
import '../../domain/models/payment.dart';

class PaymentProvider extends ChangeNotifier {
  PaymentProvider({
    required PaymentRepository paymentRepository,
    required FineRepository fineRepository,
  }) : _paymentRepository = paymentRepository,
       _fineRepository = fineRepository;
  final PaymentRepository _paymentRepository;
  final FineRepository _fineRepository;

  TrafficFine? _currentFine;
  Payment? _currentPayment;
  List<Payment> _paymentHistory = [];
  String? _error;
  bool _isLoading = false;

  // Getters
  TrafficFine? get currentFine => _currentFine;
  Payment? get currentPayment => _currentPayment;
  List<Payment> get paymentHistory => _paymentHistory;
  String? get error => _error;
  bool get isLoading => _isLoading;

  Future<bool> validateFine({
    required String referenceNumber,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Stripped categoryId to match the updated FineRepository
      _currentFine = await _fineRepository.validateFine(
        referenceNumber: referenceNumber,
      );
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> initiatePayment({required String paymentMethod}) async {
    if (_currentFine == null) {
      _error = 'No fine selected';
      return false;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentPayment = await _paymentRepository.initiatePayment(
        fineId: _currentFine!.id,
        paymentMethod: paymentMethod,
      );
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> verifyPayment({required String transactionId}) async {
    if (_currentPayment == null) {
      _error = 'No payment in progress';
      return false;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentPayment = await _paymentRepository.verifyPayment(
        paymentId: _currentPayment!.id,
        transactionId: transactionId,
      );
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> fetchPaymentHistory() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _paymentHistory = await _paymentRepository.getPaymentHistory();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearCurrentFine() {
    _currentFine = null;
    notifyListeners();
  }

  void clearCurrentPayment() {
    _currentPayment = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
