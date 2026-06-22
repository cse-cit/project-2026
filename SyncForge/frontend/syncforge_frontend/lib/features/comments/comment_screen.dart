import 'package:flutter/material.dart';
import 'comment_service.dart';
import 'comment_model.dart';
import 'package:file_picker/file_picker.dart';
import '../files/file_service.dart';
import '../files/file_model.dart';
import '../../core/utils/text_formatter.dart';

class CommentScreen extends StatefulWidget {

  final String taskId;

  const CommentScreen({super.key, required this.taskId});

  @override
  State<CommentScreen> createState() => _CommentScreenState();
}

class _CommentScreenState extends State<CommentScreen> {

  late Future<List<Comment>> commentsFuture;
  late Future<List<TaskFile>> filesFuture;

  final controller = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    commentsFuture = CommentService.getComments(widget.taskId);
    filesFuture = FileService.getFiles(widget.taskId);
  }

  Future<void> sendComment() async {

    if (controller.text.trim().isEmpty) return;

    await CommentService.addComment(
      widget.taskId,
      controller.text.trim(),
    );

    controller.clear();

    setState(() {
      _loadData();
    });
  }

  /// FILE PICKER
  Future<void> pickFile() async {

    try {

      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['png', 'jpg', 'jpeg', 'pdf'],
        withData: false,
      );

      if (result == null) return;

      final file = result.files.first;

      if (file.path == null) return;

      const maxSize = 5 * 1024 * 1024;

      if (file.size > maxSize) {

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("File exceeds 5MB limit")),
        );

        return;
      }

      await FileService.uploadFile(widget.taskId, file);

      setState(() {
        _loadData();
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("${file.name} uploaded successfully")),
      );

    } catch (e) {

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("File upload failed")),
      );

    }
  }

  /// FILE SIZE FORMATTER
  String _formatFileSize(int bytes) {

    if (bytes >= 1024 * 1024) {
      return "${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB";
    }

    if (bytes >= 1024) {
      return "${(bytes / 1024).toStringAsFixed(1)} KB";
    }

    return "$bytes B";
  }

  /// TIME FORMATTER
  String _timeAgo(DateTime time) {

    final diff = DateTime.now().difference(time);

    if (diff.inSeconds < 60) {
      return "Just now";
    }

    if (diff.inMinutes < 60) {
      return "${diff.inMinutes}m ago";
    }

    if (diff.inHours < 24) {
      return "${diff.inHours}h ago";
    }

    if (diff.inDays < 7) {
      return "${diff.inDays}d ago";
    }

    return "${time.day}/${time.month}/${time.year}";
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(

      resizeToAvoidBottomInset: true,

      appBar: AppBar(
        title: const Text("Task Details"),
        actions: [
          IconButton(
            icon: const Icon(Icons.attach_file),
            onPressed: pickFile,
          )
        ],
      ),

      body: SafeArea(

        child: Column(
          children: [

            /// CONTENT AREA
            Expanded(

              child: SingleChildScrollView(

                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [

                    /// ATTACHMENTS
                    FutureBuilder<List<TaskFile>>(
                      future: filesFuture,
                      builder: (context, snapshot) {

                        if (!snapshot.hasData || snapshot.data!.isEmpty) {
                          return const SizedBox();
                        }

                        final files = snapshot.data!;

                        return Padding(
                          padding: const EdgeInsets.all(12),

                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [

                              const Text(
                                "Attachments",
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),

                              const SizedBox(height: 10),

                              ...files.map((f) {

                                return Card(
                                  margin: const EdgeInsets.only(bottom: 8),

                                  child: ListTile(

                                    leading: const Icon(Icons.insert_drive_file),

                                    title: Text(
                                      TextFormatter.toTitleCase(f.fileName),
                                    ),

                                    subtitle: Text(
                                      _formatFileSize(f.fileSize),
                                    ),

                                    trailing: IconButton(
                                      icon: const Icon(Icons.download),

                                      onPressed: () async {

                                        await FileService.downloadFile(
                                          widget.taskId,
                                          f.id,
                                          f.fileName,
                                        );

                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(
                                            content: Text("${f.fileName} downloaded"),
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                                );

                              }).toList()
                            ],
                          ),
                        );
                      },
                    ),

                    /// COMMENTS
                    FutureBuilder<List<Comment>>(
                      future: commentsFuture,

                      builder: (context, snapshot) {

                        if (snapshot.connectionState == ConnectionState.waiting) {
                          return const Center(child: CircularProgressIndicator());
                        }

                        final list = snapshot.data ?? [];

                        if (list.isEmpty) {
                          return const Padding(
                            padding: EdgeInsets.all(20),
                            child: Center(child: Text("No comments yet")),
                          );
                        }

                        return ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          padding: const EdgeInsets.all(12),
                          itemCount: list.length,

                          itemBuilder: (context, index) {

                            final c = list[index];

                            final created =
                                DateTime.tryParse(c.createdAt) ?? DateTime.now();

                            return Card(
                              margin: const EdgeInsets.only(bottom: 10),

                              child: Padding(
                                padding: const EdgeInsets.all(14),

                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [

                                    Row(
                                      children: [

                                        CircleAvatar(
                                          radius: 14,
                                          backgroundColor:
                                              Theme.of(context).colorScheme.primary,
                                          child: const Icon(
                                            Icons.person,
                                            size: 16,
                                            color: Colors.white,
                                          ),
                                        ),

                                        const SizedBox(width: 8),

                                        Text(
                                          c.username,
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),

                                        const Spacer(),

                                        Text(
                                          _timeAgo(created),
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey,
                                          ),
                                        )
                                      ],
                                    ),

                                    const SizedBox(height: 8),

                                    Text(
                                      TextFormatter.toTitleCase(c.message),
                                      style: const TextStyle(fontSize: 14),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),

            /// COMMENT INPUT
            Container(
              padding: const EdgeInsets.all(12),

              decoration: const BoxDecoration(
                border: Border(
                  top: BorderSide(color: Colors.grey),
                ),
              ),

              child: Row(
                children: [

                  Expanded(
                    child: TextField(
                      controller: controller,

                      decoration: const InputDecoration(
                        hintText: "Write a comment...",
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),

                  const SizedBox(width: 8),

                  IconButton(
                    icon: const Icon(Icons.send),
                    color: Colors.blue,
                    onPressed: sendComment,
                  )
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}