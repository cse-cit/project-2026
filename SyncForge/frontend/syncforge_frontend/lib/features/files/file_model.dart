class TaskFile {

  final String id;
  final String taskId;
  final String fileName;
  final String fileType;
  final int fileSize;
  final String uploadedBy;
  final String createdAt;

  TaskFile({
    required this.id,
    required this.taskId,
    required this.fileName,
    required this.fileType,
    required this.fileSize,
    required this.uploadedBy,
    required this.createdAt,
  });

  factory TaskFile.fromJson(Map<String, dynamic> json) {

    return TaskFile(
      id: json['id'],
      taskId: json['taskId'],
      fileName: json['fileName'],
      fileType: json['fileType'],
      fileSize: json['fileSize'] ?? 0,
      uploadedBy: json['uploadedBy'],
      createdAt: json['createdAt'] ?? "",
    );
  }
}