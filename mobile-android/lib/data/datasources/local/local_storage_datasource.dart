import 'package:shared_preferences/shared_preferences.dart';

class LocalStorageDataSource {
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';
  static const String _paymentsKey = 'offline_payments';

  late SharedPreferences _prefs;

  Future<void> initialize() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // Token Management
  Future<void> saveToken(String token) async {
    await _prefs.setString(_tokenKey, token);
  }

  String? getToken() => _prefs.getString(_tokenKey);

  Future<void> removeToken() async {
    await _prefs.remove(_tokenKey);
  }

  // User Data
  Future<void> saveUserData(String userData) async {
    await _prefs.setString(_userKey, userData);
  }

  String? getUserData() => _prefs.getString(_userKey);

  Future<void> removeUserData() async {
    await _prefs.remove(_userKey);
  }

  // Offline Payments
  Future<void> saveOfflinePayment(String paymentData) async {
    final List<String> payments = _prefs.getStringList(_paymentsKey) ?? [];
    payments.add(paymentData);
    await _prefs.setStringList(_paymentsKey, payments);
  }

  Future<void> saveOfflinePayments(List<String> paymentData) async {
    await _prefs.setStringList(_paymentsKey, paymentData);
  }

  List<String>? getOfflinePayments() => _prefs.getStringList(_paymentsKey);

  Future<void> removeOfflinePayment(String paymentData) async {
    final List<String> payments = _prefs.getStringList(_paymentsKey) ?? [];
    payments.remove(paymentData);
    await _prefs.setStringList(_paymentsKey, payments);
  }

  Future<void> clearOfflinePayments() async {
    await _prefs.remove(_paymentsKey);
  }

  // Clear All Data
  Future<void> clearAll() async {
    await _prefs.clear();
  }
}
