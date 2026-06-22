import '../../core/api/api_client.dart';
import '../../core/storage/token_storage.dart';

import '../projects/project_model.dart';
import '../tasks/task_model.dart';

import 'profile_model.dart';

class ProfileService {
  // =========================
  // GET PROFILE
  // =========================
  static Future<UserProfile> getProfile() async {
    final token = await TokenStorage.getToken();

    final response = await ApiClient.get("/profile", token: token);

    return UserProfile.fromJson(response);
  }

  // =========================
  // GET PROJECT COUNT
  // =========================
  static Future<int> getProjectsCount() async {
    final token = await TokenStorage.getToken();

    final response = await ApiClient.get("/projects", token: token);

    final List<Project> projects = response
        .map<Project>((p) => Project.fromJson(p))
        .toList();

    return projects.length;
  }

  // =========================
  // GET USER TASK STATS
  // =========================
  static Future<Map<String, int>> getTaskStats() async {
    final token = await TokenStorage.getToken();

    final response = await ApiClient.get("/projects", token: token);

    final List<Project> projects = response
        .map<Project>((p) => Project.fromJson(p))
        .toList();

    int totalTasks = 0;
    int completedTasks = 0;

    for (final project in projects) {
      final taskResponse = await ApiClient.get(
        "/projects/${project.id}/tasks",
        token: token,
      );

      final List<Task> tasks = taskResponse
          .map<Task>((t) => Task.fromJson(t))
          .toList();

      totalTasks = totalTasks + tasks.length;

      completedTasks =
          completedTasks + tasks.where((t) => t.status == "DONE").length;
    }

    return {"total": totalTasks, "completed": completedTasks};
  }
}
