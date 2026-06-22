import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/app_config.dart';

class ApiClient {

  // =========================
  // POST REQUEST
  // =========================

  static Future<dynamic> post(

    String endpoint,

    Map<String, dynamic> body,

    {String? token}

  ) async {

    final response = await http.post(

      Uri.parse(
        "${AppConfig.apiBaseUrl}$endpoint",
      ),

      headers: {

        "Content-Type":
            "application/json",

        if (token != null)
          "Authorization":
              "Bearer $token"
      },

      body: jsonEncode(body),
    );

    return jsonDecode(response.body);
  }

  // =========================
  // GET REQUEST
  // =========================

  static Future<dynamic> get(

    String endpoint,

    {String? token}

  ) async {

    final response = await http.get(

      Uri.parse(
        "${AppConfig.apiBaseUrl}$endpoint",
      ),

      headers: {

        if (token != null)
          "Authorization":
              "Bearer $token"
      },
    );

    return jsonDecode(response.body);
  }

  // =========================
  // DELETE REQUEST
  // =========================

  static Future<void> delete(

    String endpoint,

    {String? token}

  ) async {

    final response =
        await http.delete(

      Uri.parse(
        "${AppConfig.apiBaseUrl}$endpoint",
      ),

      headers: {

        if (token != null)
          "Authorization":
              "Bearer $token"
      },
    );

    if (response.statusCode >= 400) {

      throw Exception(
        "Delete request failed",
      );
    }
  }
}