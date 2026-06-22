import '../../core/api/api_client.dart';
import '../../core/storage/token_storage.dart';
import 'project_model.dart';

class ProjectService {
  /// GET ALL PROJECTS
  static Future<List<Project>> getProjects() async {
    final token = await TokenStorage.getToken();

    final response = await ApiClient.get("/projects", token: token);

    return response.map<Project>((p) => Project.fromJson(p)).toList();
  }

  /// CREATE PROJECT
  static Future<void> createProject(String name, String description) async {
    final token = await TokenStorage.getToken();

    await ApiClient.post(
      "/projects?name=$name&description=$description",
      {},
      token: token,
    );
  }

  /// ADD MEMBER TO PROJECT
  static Future<void> addMember(String projectId, String userId) async {
    final token = await TokenStorage.getToken();

    await ApiClient.post("/projects/$projectId/members", {
      "userId": userId,
    }, token: token);
  }

  /// DELETE PROJECT
  static Future<void> deleteProject(String projectId) async {
    final token = await TokenStorage.getToken();

    await ApiClient.delete("/projects/$projectId", token: token);
  }
}
