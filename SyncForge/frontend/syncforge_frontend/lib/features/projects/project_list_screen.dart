import 'package:flutter/material.dart';

import 'project_service.dart';
import 'project_model.dart';

import '../../core/widgets/project_card.dart';
import '../../core/storage/token_storage.dart';
import '../../core/websocket/socket_service.dart';

import '../notifications/notification_model.dart';
import '../notifications/notification_screen.dart';
import '../notifications/notification_service.dart';
import '../../core/responsive/responsive.dart';

// ✅ PROFILE IMPORT
import '../profile/profile_screen.dart';

class ProjectListScreen extends StatefulWidget {
  const ProjectListScreen({super.key});

  @override
  State<ProjectListScreen> createState() => _ProjectListScreenState();
}

class _ProjectListScreenState extends State<ProjectListScreen> {
  late Future<List<Project>> projects;

  final SocketService socket = SocketService();

  List<AppNotification> notifications = [];

  @override
  void initState() {
    super.initState();

    _loadProjects();
    _loadNotifications();
    _connectNotifications();
  }

  /// Load projects
  void _loadProjects() {
    projects = ProjectService.getProjects();
  }

  /// Load existing notifications from backend
  Future<void> _loadNotifications() async {
    try {
      final data = await NotificationService.getNotifications();

      setState(() {
        notifications = data;
      });
    } catch (e) {
      print("Failed to load notifications: $e");
    }
  }

  /// Connect WebSocket for realtime notifications
  Future<void> _connectNotifications() async {
    final token = await TokenStorage.getToken();
    final userId = await TokenStorage.getUserId();

    if (token == null || userId == null) return;

    socket.connect(
      token: token,
      projectId: "",
      userId: userId,

      onProjectEvent: (event) {},

      onNotification: (notification) {
        print("Realtime notification: $notification");

        setState(() {
          notifications.insert(0, AppNotification.fromJson(notification));
        });
      },
    );
  }

  /// Create project dialog
  void _showCreateProjectDialog() {
    final nameController = TextEditingController();
    final descController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("Create Project"),

          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(labelText: "Project Name"),
              ),

              const SizedBox(height: 10),

              TextField(
                controller: descController,
                decoration: const InputDecoration(labelText: "Description"),
              ),
            ],
          ),

          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Cancel"),
            ),

            ElevatedButton(
              onPressed: () async {
                await ProjectService.createProject(
                  nameController.text.trim(),
                  descController.text.trim(),
                );

                Navigator.pop(context);

                setState(() {
                  _loadProjects();
                });
              },
              child: const Text("Create"),
            ),
          ],
        );
      },
    );
  }

  /// Logout
  Future<void> _logout() async {
    await TokenStorage.clearToken();

    if (!mounted) return;

    Navigator.pushReplacementNamed(context, "/");
  }

  /// Open notification screen
  void _openNotifications() async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const NotificationScreen()),
    );

    /// clear badge when user opens notifications
    setState(() {
      notifications.clear();
    });
  }

  /// ✅ Open profile screen
  void _openProfile() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const ProfileScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("SyncForge Projects"),

        actions: [
          /// 📊 Dashboard Button
          IconButton(
            icon: const Icon(Icons.dashboard),
            onPressed: () {
              Navigator.pushNamed(context, "/dashboard");
            },
          ),

          /// 🔔 Notification Bell
          Stack(
            children: [
              IconButton(
                icon: Icon(
                  Icons.notifications,
                  color: Theme.of(context).colorScheme.secondary,
                ),
                onPressed: _openNotifications,
              ),

              if (notifications.isNotEmpty)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      notifications.length.toString(),
                      style: const TextStyle(color: Colors.white, fontSize: 10),
                    ),
                  ),
                ),
            ],
          ),

          /// 👤 PROFILE BUTTON
          IconButton(icon: const Icon(Icons.person), onPressed: _openProfile),

          /// 🚪 Logout Button
          IconButton(icon: const Icon(Icons.logout), onPressed: _logout),
        ],
      ),

      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateProjectDialog,
        child: const Icon(Icons.add),
      ),

      body: FutureBuilder<List<Project>>(
        future: projects,

        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.folder_open, size: 60, color: Colors.grey),

                  SizedBox(height: 10),

                  Text("No projects yet", style: TextStyle(fontSize: 18)),

                  SizedBox(height: 4),

                  Text(
                    "Create your first project",
                    style: TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            );
          }

          final list = snapshot.data!;

          return GridView.builder(
            padding: const EdgeInsets.all(16),

            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: Responsive.isDesktop(context)
                  ? 3
                  : Responsive.isTablet(context)
                  ? 2
                  : 1,

              crossAxisSpacing: 16,
              mainAxisSpacing: 16,

              childAspectRatio: Responsive.isDesktop(context)
                  ? 2.8
                  : Responsive.isTablet(context)
                  ? 2.4
                  : 2.2,
            ),

            itemCount: list.length,

            itemBuilder: (context, index) {
              return ProjectCard(
                project: list[index],

                onMemberAdded: () {
                  setState(() {
                    _loadProjects();
                  });
                },
              );
            },
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    socket.disconnect();
    super.dispose();
  }
}
