import 'package:flutter/material.dart';

import '../../features/projects/project_model.dart';
import '../../features/projects/project_service.dart';
import '../../features/tasks/task_board_screen.dart';

import '../utils/text_formatter.dart';

class ProjectCard extends StatelessWidget {
  final Project project;

  final VoidCallback onMemberAdded;

  const ProjectCard({
    super.key,
    required this.project,
    required this.onMemberAdded,
  });

  // =========================
  // ADD MEMBER DIALOG
  // =========================

  Future<void> _showAddMemberDialog(BuildContext context) async {
    final userIdController = TextEditingController();

    final result = await showDialog<bool>(
      context: context,

      builder: (context) {
        return AlertDialog(
          title: const Text("Add Project Member"),

          content: TextField(
            controller: userIdController,

            decoration: const InputDecoration(labelText: "Enter user email"),
          ),

          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context, false);
              },

              child: const Text("Cancel"),
            ),

            ElevatedButton(
              onPressed: () async {
                final userId = userIdController.text.trim();

                if (userId.isEmpty) {
                  return;
                }

                await ProjectService.addMember(project.id, userId);

                Navigator.pop(context, true);
              },

              child: const Text("Add"),
            ),
          ],
        );
      },
    );

    if (result == true) {
      onMemberAdded();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Member added successfully")),
      );
    }
  }

  // =========================
  // DELETE PROJECT
  // =========================

  Future<void> _deleteProject(BuildContext context) async {
    final result = await showDialog<bool>(
      context: context,

      builder: (context) {
        return AlertDialog(
          title: const Text("Delete Project"),

          content: Text(
            "Delete '${project.name}' ?\n\n"
            "All tasks inside this project "
            "will also be deleted.",
          ),

          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context, false);
              },

              child: const Text("Cancel"),
            ),

            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),

              onPressed: () async {
                try {
                  await ProjectService.deleteProject(project.id);

                  if (!context.mounted) {
                    return;
                  }

                  Navigator.pop(context, true);
                } catch (e) {
                  Navigator.pop(context, false);

                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text("Delete failed: $e")));
                }
              },

              child: const Text("Delete"),
            ),
          ],
        );
      },
    );

    if (result == true) {
      onMemberAdded();

      if (!context.mounted) {
        return;
      }

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("Project deleted")));
    }
  }

  @override
  Widget build(BuildContext context) {
    // =========================
    // SAFE DATA HANDLING
    // =========================

    String safeName = project.name.trim();

    if (safeName.isEmpty) {
      safeName = "Untitled Project";
    }

    String safeDescription = project.description.trim();

    if (safeDescription.isEmpty) {
      safeDescription = "No description";
    }

    String formattedName = TextFormatter.toTitleCase(safeName);

    String formattedDescription = TextFormatter.toTitleCase(safeDescription);

    String avatarLetter = formattedName.isNotEmpty
        ? formattedName[0].toUpperCase()
        : "?";

    return Card(
      elevation: 4,

      margin: const EdgeInsets.symmetric(vertical: 8),

      child: InkWell(
        borderRadius: BorderRadius.circular(16),

        onTap: () {
          Navigator.push(
            context,

            MaterialPageRoute(
              builder: (_) => TaskBoardScreen(projectId: project.id),
            ),
          );
        },

        child: Padding(
          padding: const EdgeInsets.all(16),

          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,

            children: [
              // =========================
              // PROJECT AVATAR
              // =========================
              Padding(
                padding: const EdgeInsets.only(top: 4),

                child: CircleAvatar(
                  radius: 24,

                  backgroundColor: Theme.of(context).colorScheme.primary,

                  child: Text(
                    avatarLetter,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),

              // =========================
              // PROJECT INFO
              // =========================
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,

                  children: [
                    Text(
                      formattedName,

                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,

                      style: const TextStyle(
                        fontSize: 18,

                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    const SizedBox(height: 6),

                    Text(
                      formattedDescription,

                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,

                      style: TextStyle(
                        color: Theme.of(context).textTheme.bodySmall?.color,
                      ),
                    ),

                    const SizedBox(height: 10),

                    Row(
                      children: [
                        const Icon(Icons.group, size: 16, color: Colors.grey),

                        const SizedBox(width: 4),

                        Text(
                          "Members: ${project.members.length}",

                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 8),

              // =========================
              // ACTION MENU
              // =========================
              PopupMenuButton<String>(
                onSelected: (value) {
                  if (value == "add_member") {
                    _showAddMemberDialog(context);
                  }

                  if (value == "delete") {
                    _deleteProject(context);
                  }
                },

                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: "add_member",

                    child: Row(
                      children: [
                        Icon(Icons.person_add),

                        SizedBox(width: 8),

                        Text("Add Member"),
                      ],
                    ),
                  ),

                  const PopupMenuItem(
                    value: "delete",

                    child: Row(
                      children: [
                        Icon(Icons.delete, color: Colors.red),

                        SizedBox(width: 8),

                        Text("Delete Project"),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
