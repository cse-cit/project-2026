import '../../core/api/api_client.dart';
import '../../core/storage/token_storage.dart';

import '../projects/project_model.dart';
import '../projects/project_service.dart';

import '../tasks/task_model.dart';

class DashboardService {
  // =========================
  // GET DASHBOARD ANALYTICS
  // =========================

  static Future<Map<String, dynamic>> getTaskAnalytics() async {
    final token = await TokenStorage.getToken();

    final List<Project> projects = await ProjectService.getProjects();

    int totalTasks = 0;

    int completedTasks = 0;

    int overdueTasks = 0;

    int highPriorityTasks = 0;

    int todoTasks = 0;

    int progressTasks = 0;

    int doneTasks = 0;

    for (final project in projects) {
      final response = await ApiClient.get(
        "/projects/${project.id}/tasks",
        token: token,
      );

      final List<Task> tasks = response
          .map<Task>((t) => Task.fromJson(t))
          .toList();

      totalTasks += tasks.length;

      completedTasks += tasks.where((t) => t.status == "DONE").length;

      highPriorityTasks += tasks.where((t) => t.priority == "HIGH").length;

      todoTasks += tasks.where((t) => t.status == "TODO").length;

      progressTasks += tasks.where((t) => t.status == "IN_PROGRESS").length;

      doneTasks += tasks.where((t) => t.status == "DONE").length;

      overdueTasks += tasks.where((t) {
        if (t.dueDate == null) {
          return false;
        }

        return DateTime.parse(t.dueDate!).isBefore(DateTime.now()) &&
            t.status != "DONE";
      }).length;
    }

    double completionRate = 0;

    if (totalTasks > 0) {
      completionRate = (completedTasks / totalTasks) * 100;
    }

    return {
      "projects": projects.length,

      "totalTasks": totalTasks,

      "completedTasks": completedTasks,

      "overdueTasks": overdueTasks,

      "highPriorityTasks": highPriorityTasks,

      "completionRate": completionRate.toStringAsFixed(1),

      "todoTasks": todoTasks,

      "progressTasks": progressTasks,

      "doneTasks": doneTasks,
    };
  }
}
