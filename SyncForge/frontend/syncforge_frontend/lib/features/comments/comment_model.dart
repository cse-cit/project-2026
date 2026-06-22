class Comment {

  final String id;
  final String taskId;
  final String userId;
  final String username;
  final String message;
  final String createdAt;

  Comment({
    required this.id,
    required this.taskId,
    required this.userId,
    required this.username,
    required this.message,
    required this.createdAt,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {

    return Comment(
      id: json['id'],
      taskId: json['taskId'],
      userId: json['userId'],
      username: json['username'] ?? "Unknown",
      message: json['message'],
      createdAt: json['createdAt'] ?? "",
    );
  }
}