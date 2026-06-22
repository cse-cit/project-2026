import 'package:flutter/material.dart';

import '../../core/storage/token_storage.dart';

import 'profile_model.dart';
import 'profile_service.dart';
import '../../core/responsive/responsive.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late Future<UserProfile> profileFuture;

  late Future<int> projectsCountFuture;

  late Future<Map<String, int>> taskStatsFuture;

  @override
  void initState() {
    super.initState();

    profileFuture = ProfileService.getProfile();

    projectsCountFuture = ProfileService.getProjectsCount();

    taskStatsFuture = ProfileService.getTaskStats();
  }

  Future<void> _logout() async {
    await TokenStorage.clearToken();

    if (!mounted) return;

    Navigator.pushReplacementNamed(context, "/");
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Profile")),

      body: FutureBuilder<UserProfile>(
        future: profileFuture,

        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return const Center(child: Text("Failed to load profile"));
          }

          if (!snapshot.hasData) {
            return const Center(child: Text("No profile found"));
          }

          final user = snapshot.data!;

          return Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: Responsive.isDesktop(context) ? 800 : double.infinity,
              ),

              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),

                child: Column(
                  children: [
                    // ======================
                    // Avatar
                    // ======================
                    CircleAvatar(
                      radius: 45,

                      child: Text(
                        user.fullName.isNotEmpty
                            ? user.fullName[0].toUpperCase()
                            : "U",

                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // ======================
                    // Name
                    // ======================
                    Text(
                      user.fullName,

                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    const SizedBox(height: 6),

                    Text(
                      user.email,

                      style: const TextStyle(color: Colors.grey, fontSize: 15),
                    ),

                    const SizedBox(height: 16),

                    // ======================
                    // Role Badge
                    // ======================
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 8,
                      ),

                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.primary,

                        borderRadius: BorderRadius.circular(30),
                      ),

                      child: Text(
                        user.role,

                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),

                    const SizedBox(height: 30),

                    // ======================
                    // Info Card
                    // ======================
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(20),

                        child: Column(
                          children: [
                            _infoTile(
                              Icons.phone,
                              "Phone Number",
                              user.phoneNumber,
                            ),

                            const Divider(),

                            _infoTile(Icons.email, "Email", user.email),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // ======================
                    // REAL STATS
                    // ======================
                    FutureBuilder<int>(
                      future: projectsCountFuture,

                      builder: (context, projectSnapshot) {
                        return FutureBuilder<Map<String, int>>(
                          future: taskStatsFuture,

                          builder: (context, taskSnapshot) {
                            if (!projectSnapshot.hasData ||
                                !taskSnapshot.hasData) {
                              return const Center(
                                child: CircularProgressIndicator(),
                              );
                            }

                            final projects = projectSnapshot.data!;

                            final totalTasks = taskSnapshot.data!["total"] ?? 0;

                            final completedTasks =
                                taskSnapshot.data!["completed"] ?? 0;

                            return Responsive.isMobile(context)
                                ? Card(
                                    child: Padding(
                                      padding: const EdgeInsets.all(16),
                                      child: Column(
                                        children: [
                                          ListTile(
                                            leading: const Icon(Icons.folder),
                                            title: const Text("Projects"),
                                            trailing: Text(
                                              projects.toString(),
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 18,
                                              ),
                                            ),
                                          ),

                                          const Divider(),

                                          ListTile(
                                            leading: const Icon(Icons.task),
                                            title: const Text("Tasks"),
                                            trailing: Text(
                                              totalTasks.toString(),
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 18,
                                              ),
                                            ),
                                          ),

                                          const Divider(),

                                          ListTile(
                                            leading: const Icon(
                                              Icons.check_circle,
                                            ),
                                            title: const Text("Completed"),
                                            trailing: Text(
                                              completedTasks.toString(),
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 18,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  )
                                : Row(
                                    children: [
                                      _statCard(
                                        "Projects",
                                        projects.toString(),
                                      ),

                                      _statCard("Tasks", totalTasks.toString()),

                                      _statCard(
                                        "Done",
                                        completedTasks.toString(),
                                      ),
                                    ],
                                  );
                          },
                        );
                      },
                    ),

                    const SizedBox(height: 30),

                    // ======================
                    // Logout
                    // ======================
                    SizedBox(
                      width: double.infinity,
                      height: 50,

                      child: ElevatedButton.icon(
                        onPressed: _logout,

                        icon: const Icon(Icons.logout),

                        label: const Text("Logout"),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _infoTile(IconData icon, String title, String value) {
    return ListTile(
      leading: Icon(icon),

      title: Text(title),

      subtitle: Text(value.isEmpty ? "Not Available" : value),
    );
  }

  Widget _statCard(String title, String value) {
    return SizedBox(
      width: 220,
      child: Card(
        margin: const EdgeInsets.all(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20),

          child: Column(
            children: [
              Text(
                value,

                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),

              const SizedBox(height: 6),

              Text(title, style: const TextStyle(color: Colors.grey)),
            ],
          ),
        ),
      ),
    );
  }
}
