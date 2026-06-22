import 'dart:convert';
import 'package:http/http.dart' as http;

import '../../core/api/api_client.dart';
import '../../core/storage/token_storage.dart';
import 'task_model.dart';
import '../../core/config/app_config.dart';

class TaskService {
  static const String baseUrl = AppConfig.apiBaseUrl;

  /// Fetch all tasks of a project
  static Future<List<Task>> getTasks(String projectId) async {
    final token = await TokenStorage.getToken();

    final response = await ApiClient.get(
      "/projects/$projectId/tasks",
      token: token,
    );

    return response.map<Task>((t) => Task.fromJson(t)).toList();
  }

  /// Update task status (Drag & Drop)
  static Future<void> updateStatus(
    String projectId,
    String taskId,
    String status,
  ) async {
    final token = await TokenStorage.getToken();

    final response = await http.patch(
      Uri.parse("$baseUrl/projects/$projectId/tasks/$taskId/status"),

      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      },

      body: jsonEncode({"status": status}),
    );

    if (response.statusCode != 200) {
      throw Exception("Failed to update task status");
    }
  }

  /// Create a new task
  static Future<void> createTask(
    String projectId,
    String title,
    String description,
    String priority,
    String? dueDate,
  ) async {
    final token = await TokenStorage.getToken();

    final response = await http.post(
      Uri.parse("$baseUrl/projects/$projectId/tasks"),

      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      },

      body: jsonEncode({
        "title": title,
        "description": description,
        "priority": priority,
        "dueDate": dueDate,
      }),
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception("Failed to create task");
    }
  }

  static Future<void> deleteTask(String projectId, String taskId) async {
    final token = await TokenStorage.getToken();

    await ApiClient.delete("/projects/$projectId/tasks/$taskId", token: token);
  }
}
