import 'package:shared_preferences/shared_preferences.dart';

class LocalStorageDataSource {
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';
  static const String _paymentsKey = 'offline_payments';

  // We keep an empty initialize method just in case main.dart calls it on boot, 
  // so the app doesn't crash looking for a missing function.
  Future<void> initialize() async {}

  // --- Token Management ---
  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token); 
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  Future<void> deleteToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  // --- User Data ---
  Future<void> saveUserData(String userData) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, userData);
  }

  Future<String?> getUserData() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_userKey);
  }

  Future<void> removeUserData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_userKey);
  }

  // --- Offline Payments ---
  Future<void> saveOfflinePayment(String paymentData) async {
    final prefs = await SharedPreferences.getInstance();
    final List<String> payments = prefs.getStringList(_paymentsKey) ?? [];
    payments.add(paymentData);
    await prefs.setStringList(_paymentsKey, payments);
  }

  Future<void> saveOfflinePayments(List<String> paymentData) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(_paymentsKey, paymentData);
  }

  Future<List<String>?> getOfflinePayments() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_paymentsKey);
  }

  Future<void> removeOfflinePayment(String paymentData) async {
    final prefs = await SharedPreferences.getInstance();
    final List<String> payments = prefs.getStringList(_paymentsKey) ?? [];
    payments.remove(paymentData);
    await prefs.setStringList(_paymentsKey, payments);
  }

  Future<void> clearOfflinePayments() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_paymentsKey);
  }

  // --- Clear All Data ---
  Future<void> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}