import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/storage/token_storage.dart';
import 'comment_model.dart';
import '../../core/config/app_config.dart';

class CommentService {

  static const baseUrl = AppConfig.baseUrl;

  static Future<List<Comment>> getComments(String taskId) async {

    final token = await TokenStorage.getToken();

    final response = await http.get(
      Uri.parse("$baseUrl/api/tasks/$taskId/comments"),
      headers: {
        "Authorization": "Bearer $token",
      },
    );

    final data = jsonDecode(response.body);

    return (data as List)
        .map((e) => Comment.fromJson(e))
        .toList();
  }

  static Future<void> addComment(
      String taskId,
      String message,
      ) async {

    final token = await TokenStorage.getToken();

    await http.post(
      Uri.parse("$baseUrl/api/tasks/$taskId/comments"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json"
      },
      body: jsonEncode({
        "message": message
      }),
    );
  }
}