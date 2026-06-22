import 'package:flutter/material.dart';
import 'package:timeago/timeago.dart' as timeago;

import '../../core/websocket/socket_service.dart';
import '../../core/storage/token_storage.dart';

import 'notification_model.dart';
import 'notification_service.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {

  final SocketService socket = SocketService();

  late Future<List<AppNotification>> notifications;

  @override
  void initState() {
    super.initState();

    notifications = NotificationService.getNotifications();

    _connectSocket();
  }

  Future<void> _connectSocket() async {

    final token = await TokenStorage.getToken();
    final userId = await TokenStorage.getUserId();   // you must store this

    if (token == null || userId == null) return;

    socket.connect(
      token: token,
      projectId: "",   // not needed for notification screen
      userId: userId,

      onProjectEvent: (data) {},

      onNotification: (data) {

        print("NEW NOTIFICATION RECEIVED: $data");

        setState(() {
          notifications = NotificationService.getNotifications();
        });
      },
    );
  }

  Future<void> refresh() async {
    setState(() {
      notifications = NotificationService.getNotifications();
    });
  }

  Future<void> clearAll() async {
    await NotificationService.clearNotifications();
    refresh();
  }

  Future<void> _handleTap(AppNotification n) async {

    if (!n.isRead) {
      await NotificationService.markAsRead(n.id);
    }

    if (n.referenceId != null && mounted) {
      Navigator.pushNamed(
        context,
        "/task-details",
        arguments: n.referenceId,
      );
    }

    refresh();
  }

  IconData getIcon(String message) {

    final m = message.toLowerCase();

    if (m.contains("comment")) return Icons.chat_bubble_outline;
    if (m.contains("file")) return Icons.attach_file;
    if (m.contains("status")) return Icons.task_alt;
    if (m.contains("added")) return Icons.group_add;

    return Icons.notifications;
  }

  Color getColor(String message) {

    final m = message.toLowerCase();

    if (m.contains("comment")) return Colors.blueAccent;
    if (m.contains("file")) return Colors.orange;
    if (m.contains("status")) return Colors.green;
    if (m.contains("added")) return Colors.purple;

    return Colors.grey;
  }

  @override
  void dispose() {
    socket.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(

      appBar: AppBar(
        title: const Text("Notifications"),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline),
            onPressed: clearAll,
          )
        ],
      ),

      body: FutureBuilder<List<AppNotification>>(

        future: notifications,

        builder: (context, snapshot) {

          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(
              child: Text(
                "🔔 No notifications yet\nActivity updates will appear here.",
                textAlign: TextAlign.center,
              ),
            );
          }

          final list = snapshot.data!;

          return RefreshIndicator(

            onRefresh: refresh,

            child: ListView.separated(

              padding: const EdgeInsets.all(16),

              itemCount: list.length,

              separatorBuilder: (_, __) => const SizedBox(height: 10),

              itemBuilder: (context, index) {

                final n = list[index];

                final formattedTime =
                    timeago.format(DateTime.parse(n.createdAt));

                final icon = getIcon(n.message);
                final iconColor = getColor(n.message);

                return Card(

                  elevation: n.isRead ? 2 : 6,

                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),

                  child: InkWell(

                    borderRadius: BorderRadius.circular(14),

                    onTap: () => _handleTap(n),

                    child: ListTile(

                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),

                      leading: CircleAvatar(
                        backgroundColor:
                            n.isRead ? Colors.grey : iconColor,
                        child: Icon(icon, color: Colors.white),
                      ),

                      title: Text(
                        n.message,
                        style: TextStyle(
                          fontWeight:
                              n.isRead ? FontWeight.normal : FontWeight.w600,
                        ),
                      ),

                      subtitle: Text(formattedTime),

                      trailing: n.isRead
                          ? const Icon(Icons.done, size: 18)
                          : const Icon(Icons.fiber_new, color: Colors.red),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}