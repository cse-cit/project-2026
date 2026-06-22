import 'dart:convert';
import 'package:http/http.dart' as http;

import '../../core/storage/token_storage.dart';
import 'notification_model.dart';
import '../../core/config/app_config.dart';

class NotificationService {

  static const String baseUrl = AppConfig.baseUrl;

  /// Fetch all notifications
  static Future<List<AppNotification>> getNotifications() async {

    final token = await TokenStorage.getToken();

    final response = await http.get(
      Uri.parse("$baseUrl/api/notifications"),
      headers: {
        "Authorization": "Bearer $token"
      },
    );

    if (response.statusCode == 200) {

      final List data = jsonDecode(response.body);

      final notifications = data
          .map((json) => AppNotification.fromJson(json))
          .toList();

      notifications.sort((a, b) =>
          DateTime.parse(b.createdAt).compareTo(DateTime.parse(a.createdAt)));

      return notifications;

    } else {

      throw Exception("Failed to load notifications");

    }
  }
  static Future<void> markAsRead(String notificationId) async {

    final token = await TokenStorage.getToken();

    final response = await http.patch(
      Uri.parse("$baseUrl/api/notifications/$notificationId/read"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
    );

    if (response.statusCode != 200) {
      throw Exception("Failed to mark notification as read");
    }
  }
  static Future<void> clearNotifications() async {

    final token = await TokenStorage.getToken();

    await http.delete(
      Uri.parse("$baseUrl/api/notifications"),
      headers: {
        "Authorization": "Bearer $token"
     },
    );
  }
}