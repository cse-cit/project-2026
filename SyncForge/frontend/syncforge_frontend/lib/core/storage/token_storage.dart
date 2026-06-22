import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {

  static const FlutterSecureStorage _storage = FlutterSecureStorage();

  static const String _tokenKey = "jwt";

  /// Save JWT token
  static Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  /// Get stored JWT token
  static Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  /// Delete stored token (logout)
  static Future<void> clearToken() async {
    await _storage.delete(key: _tokenKey);
  }

  /// Extract userId (email) from JWT payload
  static Future<String?> getUserId() async {

    final token = await getToken();

    if (token == null) return null;

    try {

      final parts = token.split('.');

      if (parts.length != 3) return null;

      final payload = parts[1];

      final normalized = base64Url.normalize(payload);

      final decoded = utf8.decode(base64Url.decode(normalized));

      final data = jsonDecode(decoded);

      return data["sub"]; // subject field from JWT (email)

    } catch (e) {

      print("JWT decode error: $e");

      return null;
    }
  }
}