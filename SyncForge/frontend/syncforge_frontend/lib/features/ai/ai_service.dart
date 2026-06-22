import '../../core/api/api_client.dart';
import '../../core/storage/token_storage.dart';

class AIService {

  // =========================
  // GENERATE TASK DESCRIPTION
  // =========================

  static Future<String> generateDescription(
    String title,
  ) async {

    try {

      final token =
          await TokenStorage.getToken();

      final response =
          await ApiClient.post(

        "/ai/generate-description",

        {
          "title": title,
        },

        token: token,
      );

      // =========================
      // VALIDATE RESPONSE
      // =========================

      if (response["description"] == null) {

        throw Exception(
          "AI response was empty.",
        );
      }

      final description =
          response["description"]
              .toString()
              .trim();

      // =========================
      // HANDLE FAILED AI RESPONSE
      // =========================

      if (description.isEmpty ||
          description ==
              "AI generation failed") {

        throw Exception(
          "AI quota exceeded or generation failed.",
        );
      }

      return description;

    } catch (e) {

      print("AI ERROR: $e");

      throw Exception(
        "AI quota exceeded. Try again later.",
      );
    }
  }
}