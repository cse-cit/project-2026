class AppNotification {

  final String id;
  final String message;
  final bool isRead;
  final String createdAt;
  final String? referenceId;

  AppNotification({
    required this.id,
    required this.message,
    required this.isRead,
    required this.createdAt,
    this.referenceId,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {

    return AppNotification(
      id: json["id"],
      message: json["message"],
      isRead: json["read"] ?? json["isRead"] ?? false,
      createdAt: json["createdAt"],
      referenceId: json["referenceId"],
    );
  }
}