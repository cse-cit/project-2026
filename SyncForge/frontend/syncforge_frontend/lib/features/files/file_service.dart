import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:file_picker/file_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:http_parser/http_parser.dart';
import 'package:path/path.dart' as path;

import '../../core/storage/token_storage.dart';
import 'file_model.dart';
import '../../core/config/app_config.dart';

class FileService {

  static const baseUrl = AppConfig.baseUrl;

  // =========================
  // UPLOAD FILE
  // =========================

  static Future<void> uploadFile(
    String taskId,
    PlatformFile file,
  ) async {

    final token = await TokenStorage.getToken();

    final uri = Uri.parse(
      "$baseUrl/api/tasks/$taskId/files",
    );

    var request = http.MultipartRequest("POST", uri);

    request.headers["Authorization"] = "Bearer $token";

    final ext = path.extension(file.name).toLowerCase();

    MediaType type;

    if (ext == ".png") {
      type = MediaType("image", "png");
    } else if (ext == ".jpg" || ext == ".jpeg") {
      type = MediaType("image", "jpeg");
    } else if (ext == ".pdf") {
      type = MediaType("application", "pdf");
    } else {
      throw Exception("Unsupported file type");
    }

    request.files.add(
      await http.MultipartFile.fromPath(
        "file",
        file.path!,
        filename: file.name,
        contentType: type,
      ),
    );

    final response = await request.send();

    print("UPLOAD STATUS: ${response.statusCode}");

    if (response.statusCode != 200) {
      final resp = await response.stream.bytesToString();
      print("SERVER ERROR: $resp");
    }
  }

  // =========================
  // GET FILE LIST
  // =========================

  static Future<List<TaskFile>> getFiles(String taskId) async {

    final token = await TokenStorage.getToken();

    final response = await http.get(
      Uri.parse("$baseUrl/api/tasks/$taskId/files"),
      headers: {
        "Authorization": "Bearer $token",
      },
    );

    final data = jsonDecode(response.body);

    return (data as List)
        .map((e) => TaskFile.fromJson(e))
        .toList();
  }

  // =========================
  // DOWNLOAD FILE
  // =========================

  static Future<void> downloadFile(
    String taskId,
    String fileId,
    String fileName,
  ) async {

    final token = await TokenStorage.getToken();

    await FileService.requestStoragePermission();

    final response = await http.get(
      Uri.parse(
        "$baseUrl/api/tasks/$taskId/files/$fileId/download",
      ),
      headers: {
        "Authorization": "Bearer $token",
      },
    );

    if (response.statusCode == 200) {

      final directory = Directory('/storage/emulated/0/Download');

      if (!directory.existsSync()) {
        directory.createSync(recursive: true);
      }

      final filePath = "${directory.path}/$fileName";

      final file = File(filePath);

      await file.writeAsBytes(response.bodyBytes);

      print("FILE SAVED AT: $filePath");

    } else {

      print("DOWNLOAD FAILED: ${response.statusCode}");
    }
  }

  // =========================
  // STORAGE PERMISSION
  // =========================

  static Future<void> requestStoragePermission() async {

   if (await Permission.photos.request().isGranted) {
     return;
   }

   if (await Permission.storage.request().isGranted) {
     return;
   }

   print("Storage permission denied");
  }
}