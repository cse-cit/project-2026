import 'package:flutter/material.dart';

import 'features/auth/login_screen.dart';
import 'features/projects/project_list_screen.dart';
import 'features/tasks/task_board_screen.dart';
import 'features/comments/comment_screen.dart';
import 'features/dashboard/dashboard_screen.dart';

import 'core/theme/app_theme.dart';

void main() {
  runApp(const SyncForgeApp());
}

class SyncForgeApp extends StatelessWidget {
  const SyncForgeApp({super.key});

  @override
  Widget build(BuildContext context) {

    return MaterialApp(
      title: "SyncForge",

      debugShowCheckedModeBanner: false,

      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,

      initialRoute: "/",

      routes: {

        "/": (context) => LoginScreen(),

        "/projects": (context) => ProjectListScreen(),
        "/dashboard": (context) => DashboardScreen(),

      },

      /// Handle dynamic routes
      onGenerateRoute: (settings) {

        /// OPEN TASK BOARD
        if (settings.name == "/task-board") {

          final projectId = settings.arguments as String;

          return MaterialPageRoute(
            builder: (_) => TaskBoardScreen(projectId: projectId),
          );
        }

        /// OPEN TASK COMMENTS
        if (settings.name == "/task-details") {

          final taskId = settings.arguments as String;

          return MaterialPageRoute(
            builder: (_) => CommentScreen(taskId: taskId),
          );
        }

        return null;
      },
    );
  }
}