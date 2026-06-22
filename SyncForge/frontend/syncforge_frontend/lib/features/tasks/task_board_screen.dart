import 'package:flutter/material.dart';
import 'task_service.dart';
import 'task_model.dart';
import '../../core/storage/token_storage.dart';
import '../../core/websocket/socket_service.dart';
import '../../core/utils/text_formatter.dart';
import '../comments/comment_screen.dart';
import '../ai/ai_service.dart';
import '../../core/responsive/responsive.dart';

class TaskBoardScreen extends StatefulWidget {
  final String projectId;

  const TaskBoardScreen({super.key, required this.projectId});

  @override
  State<TaskBoardScreen> createState() => _TaskBoardScreenState();
}

class _TaskBoardScreenState extends State<TaskBoardScreen> {
  late Future<List<Task>> _tasksFuture;

  final SocketService socket = SocketService();

  @override
  void initState() {
    super.initState();

    _loadTasks();
    _connectSocket();
  }

  void _loadTasks() {
    _tasksFuture = TaskService.getTasks(widget.projectId);
  }

  Future<void> _connectSocket() async {
    final token = await TokenStorage.getToken();

    final userId = await TokenStorage.getUserId();

    if (token == null) return;

    socket.connect(
      token: token,
      projectId: widget.projectId,
      userId: userId!,

      onProjectEvent: (event) {
        print("Realtime update: $event");

        setState(() {
          _loadTasks();
        });
      },

      onNotification: (notification) {
        print("Notification: $notification");
      },
    );
  }

  @override
  void dispose() {
    socket.disconnect();

    super.dispose();
  }

  List<Task> _filter(List<Task> tasks, String status) {
    return tasks.where((t) => t.status == status).toList();
  }

  Color _priorityColor(String priority) {
    switch (priority) {
      case "HIGH":
        return Colors.red;

      case "LOW":
        return Colors.green;

      default:
        return Colors.orange;
    }
  }

  bool _isOverdue(String dueDate) {
    return DateTime.parse(dueDate).isBefore(DateTime.now());
  }

  String _formatDueDate(String dueDate) {
    final date = DateTime.parse(dueDate);

    return "${date.day}/"
        "${date.month}/"
        "${date.year}";
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Task Board")),

      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateTaskDialog,
        child: const Icon(Icons.add),
      ),

      body: FutureBuilder<List<Task>>(
        future: _tasksFuture,

        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,

                children: [
                  Icon(Icons.error_outline, size: 60, color: Colors.red),

                  SizedBox(height: 12),

                  Text("Failed to load tasks"),
                ],
              ),
            );
          }

          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,

                children: [
                  Icon(Icons.task_alt, size: 60, color: Colors.grey),

                  SizedBox(height: 14),

                  Text(
                    "No tasks found",

                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),

                  SizedBox(height: 6),

                  Text(
                    "Create your first task",
                    style: TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            );
          }

          final tasks = snapshot.data!;

          final todo = _filter(tasks, "TODO");

          final progress = _filter(tasks, "IN_PROGRESS");

          final done = _filter(tasks, "DONE");

          if (Responsive.isDesktop(context)) {
            return Row(
              children: [
                Expanded(child: _buildColumn("TODO", todo)),

                Expanded(child: _buildColumn("IN_PROGRESS", progress)),

                Expanded(child: _buildColumn("DONE", done)),
              ],
            );
          }

          return SingleChildScrollView(
            scrollDirection: Axis.horizontal,

            child: Row(
              children: [
                _buildColumn("TODO", todo),

                _buildColumn("IN_PROGRESS", progress),

                _buildColumn("DONE", done),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildColumn(String status, List<Task> tasks) {
    String title = TextFormatter.toTitleCase(status.replaceAll("_", " "));

    return Container(
      width: Responsive.isDesktop(context)
          ? MediaQuery.of(context).size.width / 3.5
          : Responsive.isTablet(context)
          ? 420
          : 320,

      height: MediaQuery.of(context).size.height - 120,

      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),

      padding: const EdgeInsets.all(14),

      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,

        borderRadius: BorderRadius.circular(18),

        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),

            blurRadius: 10,

            offset: const Offset(0, 4),
          ),
        ],
      ),

      child: DragTarget<Task>(
        onAccept: (task) async {
          if (task.status != status) {
            await TaskService.updateStatus(widget.projectId, task.id, status);

            setState(() {
              _loadTasks();
            });
          }
        },

        builder: (context, candidateData, rejectedData) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,

            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),

                decoration: BoxDecoration(
                  color: Theme.of(
                    context,
                  ).colorScheme.primary.withOpacity(0.15),

                  borderRadius: BorderRadius.circular(8),
                ),

                child: Text(
                  "$title (${tasks.length})",

                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,

                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ),

              const SizedBox(height: 14),

              Expanded(
                child: tasks.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,

                          children: [
                            Icon(
                              Icons.inbox,
                              size: 42,
                              color: Colors.grey.shade400,
                            ),

                            const SizedBox(height: 10),

                            Text(
                              "No tasks",

                              style: TextStyle(
                                color: Colors.grey.shade600,

                                fontWeight: FontWeight.w600,
                              ),
                            ),

                            const SizedBox(height: 4),

                            Text(
                              "Drop tasks here",

                              style: TextStyle(
                                color: Colors.grey,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: tasks.length,

                        itemBuilder: (context, index) {
                          final task = tasks[index];

                          return Draggable<Task>(
                            data: task,

                            feedback: Material(
                              color: Colors.transparent,

                              child: SizedBox(
                                width: 260,

                                child: _taskCard(task),
                              ),
                            ),

                            childWhenDragging: Opacity(
                              opacity: 0.35,

                              child: _taskCard(task),
                            ),

                            child: _taskCard(task),
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _taskCard(Task task) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),

      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => CommentScreen(taskId: task.id)),
        );
      },

      child: Card(
        elevation: 6,

        shadowColor: Colors.black26,

        margin: const EdgeInsets.only(bottom: 14),

        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),

        child: Padding(
          padding: const EdgeInsets.all(16),

          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,

            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,

                children: [
                  Container(
                    width: 8,
                    height: 8,

                    margin: const EdgeInsets.only(top: 6),

                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.primary,

                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),

                  const SizedBox(width: 8),

                  Expanded(
                    child: Text(
                      TextFormatter.toTitleCase(task.title),

                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 8),

              if (task.description.isNotEmpty)
                Text(
                  TextFormatter.toTitleCase(task.description),

                  style: TextStyle(
                    color: Theme.of(context).textTheme.bodySmall!.color,

                    fontSize: 13,
                  ),
                ),

              const SizedBox(height: 12),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,

                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),

                    decoration: BoxDecoration(
                      color: Theme.of(
                        context,
                      ).colorScheme.primary.withOpacity(0.1),

                      borderRadius: BorderRadius.circular(8),
                    ),

                    child: Text(
                      TextFormatter.toTitleCase(
                        task.status.replaceAll("_", " "),
                      ),

                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,

                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),
                  ),

                  PopupMenuButton(
                    icon: const Icon(
                      Icons.more_vert,
                      size: 18,
                      color: Colors.grey,
                    ),

                    itemBuilder: (context) => [
                      const PopupMenuItem(
                        value: "delete",
                        child: Text("Delete"),
                      ),
                    ],

                    onSelected: (value) {
                      if (value == "delete") {
                        showDialog(
                          context: context,

                          builder: (context) {
                            return AlertDialog(
                              title: const Text("Delete Task"),

                              content: Text("Delete '${task.title}' ?"),

                              actions: [
                                TextButton(
                                  onPressed: () {
                                    Navigator.pop(context);
                                  },

                                  child: const Text("Cancel"),
                                ),

                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.red,
                                  ),

                                  onPressed: () async {
                                    try {
                                      await TaskService.deleteTask(
                                        widget.projectId,
                                        task.id,
                                      );

                                      if (!mounted) {
                                        return;
                                      }

                                      Navigator.pop(context);

                                      ScaffoldMessenger.of(
                                        context,
                                      ).showSnackBar(
                                        const SnackBar(
                                          content: Text("Task deleted"),
                                        ),
                                      );

                                      setState(() {
                                        _loadTasks();
                                      });
                                    } catch (e) {
                                      Navigator.pop(context);

                                      ScaffoldMessenger.of(
                                        context,
                                      ).showSnackBar(
                                        SnackBar(
                                          content: Text("Delete failed"),
                                        ),
                                      );
                                    }
                                  },

                                  child: const Text("Delete"),
                                ),
                              ],
                            );
                          },
                        );
                      }
                    },
                  ),
                ],
              ),

              const SizedBox(height: 8),

              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),

                decoration: BoxDecoration(
                  color: _priorityColor(task.priority).withOpacity(0.15),

                  borderRadius: BorderRadius.circular(8),
                ),

                child: Text(
                  task.priority,

                  style: TextStyle(
                    color: _priorityColor(task.priority),

                    fontWeight: FontWeight.bold,

                    fontSize: 11,
                  ),
                ),
              ),

              if (task.dueDate != null) ...[
                const SizedBox(height: 10),

                Row(
                  children: [
                    Icon(
                      Icons.schedule,
                      size: 14,

                      color: _isOverdue(task.dueDate!)
                          ? Colors.red
                          : Colors.grey,
                    ),

                    const SizedBox(width: 4),

                    Text(
                      _formatDueDate(task.dueDate!),

                      style: TextStyle(
                        fontSize: 12,

                        color: _isOverdue(task.dueDate!)
                            ? Colors.red
                            : Colors.grey,

                        fontWeight: _isOverdue(task.dueDate!)
                            ? FontWeight.bold
                            : FontWeight.normal,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  void _showCreateTaskDialog() {
    final titleController = TextEditingController();

    final descController = TextEditingController();

    String selectedPriority = "MEDIUM";

    DateTime? selectedDueDate;

    bool aiLoading = false;

    bool creatingTask = false;

    showDialog(
      context: context,

      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Dialog(
              child: Container(
                width: Responsive.isDesktop(context) ? 650 : null,

                padding: const EdgeInsets.all(16),

                child: AlertDialog(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),

                  title: const Text("Create Task"),

                  content: SingleChildScrollView(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,

                      children: [
                        TextField(
                          controller: titleController,

                          decoration: const InputDecoration(
                            labelText: "Task Title",
                          ),
                        ),

                        const SizedBox(height: 10),

                        TextField(
                          controller: descController,

                          maxLines: 4,

                          decoration: const InputDecoration(
                            labelText: "Description",
                          ),
                        ),

                        const SizedBox(height: 12),

                        DropdownButtonFormField<String>(
                          value: selectedPriority,

                          decoration: const InputDecoration(
                            labelText: "Priority",
                          ),

                          items: const [
                            DropdownMenuItem(value: "LOW", child: Text("LOW")),

                            DropdownMenuItem(
                              value: "MEDIUM",
                              child: Text("MEDIUM"),
                            ),

                            DropdownMenuItem(
                              value: "HIGH",
                              child: Text("HIGH"),
                            ),
                          ],

                          onChanged: creatingTask
                              ? null
                              : (value) {
                                  if (value != null) {
                                    setModalState(() {
                                      selectedPriority = value;
                                    });
                                  }
                                },
                        ),

                        const SizedBox(height: 12),

                        SizedBox(
                          width: double.infinity,

                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.calendar_today),

                            label: Text(
                              selectedDueDate == null
                                  ? "Select Due Date"
                                  : "${selectedDueDate!.day}/"
                                        "${selectedDueDate!.month}/"
                                        "${selectedDueDate!.year}",
                            ),

                            onPressed: creatingTask
                                ? null
                                : () async {
                                    final picked = await showDatePicker(
                                      context: context,

                                      initialDate: DateTime.now(),

                                      firstDate: DateTime.now(),

                                      lastDate: DateTime(2030),
                                    );

                                    if (picked != null) {
                                      setModalState(() {
                                        selectedDueDate = picked;
                                      });
                                    }
                                  },
                          ),
                        ),
                      ],
                    ),
                  ),

                  actions: [
                    TextButton(
                      onPressed: creatingTask
                          ? null
                          : () => Navigator.pop(context),

                      child: const Text("Cancel"),
                    ),

                    OutlinedButton.icon(
                      icon: aiLoading
                          ? const SizedBox(
                              width: 16,
                              height: 16,

                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.auto_awesome),

                      label: const Text("Ask AI"),

                      onPressed: aiLoading || creatingTask
                          ? null
                          : () async {
                              if (titleController.text.trim().isEmpty) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text("Enter task title first"),
                                  ),
                                );

                                return;
                              }

                              setModalState(() {
                                aiLoading = true;
                              });

                              try {
                                final result =
                                    await AIService.generateDescription(
                                      titleController.text.trim(),
                                    );

                                descController.text = result;
                              } catch (e) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text(e.toString())),
                                );
                              }

                              setModalState(() {
                                aiLoading = false;
                              });
                            },
                    ),

                    ElevatedButton(
                      onPressed: creatingTask
                          ? null
                          : () async {
                              if (titleController.text.trim().isEmpty) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text("Task title is required"),
                                  ),
                                );

                                return;
                              }

                              try {
                                setModalState(() {
                                  creatingTask = true;
                                });

                                await TaskService.createTask(
                                  widget.projectId,

                                  titleController.text,

                                  descController.text,

                                  selectedPriority,

                                  selectedDueDate?.toUtc().toIso8601String(),
                                );

                                if (!mounted) {
                                  return;
                                }

                                Navigator.pop(context);

                                setState(() {
                                  _loadTasks();
                                });
                              } catch (e) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text("Failed to create task"),
                                  ),
                                );
                              } finally {
                                setModalState(() {
                                  creatingTask = false;
                                });
                              }
                            },

                      child: creatingTask
                          ? const SizedBox(
                              height: 18,
                              width: 18,

                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text("Create"),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}
