import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../core/storage/token_storage.dart';
import '../../core/config/app_config.dart';

class AuthService {

  static const String baseUrl = AppConfig.baseUrl;

  // =========================
  // LOGIN
  // =========================

  static Future<bool> login(
    String email,
    String password,
  ) async {

    final response = await http.post(

      Uri.parse(
        "$baseUrl/api/auth/login",
      ),

      headers: {
        "Content-Type":
            "application/json"
      },

      body: jsonEncode({

        "email": email,

        "password": password,
      }),
    );

    if (response.statusCode == 200) {

      final data =
          jsonDecode(response.body);

      await TokenStorage.saveToken(
        data["accessToken"],
      );

      return true;
    }

    return false;
  }

  // =========================
  // REGISTER
  // =========================

  static Future<bool> register(

    String fullName,

    String email,

    String phoneNumber,

    String password,
  ) async {

    final response = await http.post(

      Uri.parse(
        "$baseUrl/api/auth/register",
      ),

      headers: {
        "Content-Type":
            "application/json"
      },

      body: jsonEncode({

        "fullName": fullName,

        "email": email,

        "phoneNumber":
            phoneNumber,

        "password": password,
      }),
    );

    return response.statusCode == 200
        || response.statusCode == 201;
  }
}