import 'dart:convert';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import '../config/app_config.dart';

class SocketService {

  StompClient? _client;

  bool get isConnected => _client != null && _client!.connected;

  void connect({
    required String token,
    required String projectId,
    required String userId,
    required Function(Map<String, dynamic>) onProjectEvent,
    required Function(Map<String, dynamic>) onNotification,
  }) {

    if (_client != null && _client!.connected) {
      return;
    }

    _client = StompClient(
      config: StompConfig(

        /// IMPORTANT: force native websocket
        url: AppConfig.websocketUrl,

        reconnectDelay: const Duration(seconds: 5),

        /// required for Android websocket handshake
        webSocketConnectHeaders: {
          'Authorization': 'Bearer $token',
        },

        stompConnectHeaders: {
          'Authorization': 'Bearer $token',
        },

        onConnect: (frame) {

          print("✅ WebSocket CONNECTED");

          /// PROJECT EVENTS
          if (projectId.isNotEmpty) {
            _client!.subscribe(
              destination: '/topic/project/$projectId',
              callback: (frame) {

                if (frame.body != null) {

                  final data = jsonDecode(frame.body!);

                  print("📡 Project Event: $data");

                  onProjectEvent(data);
                }
              },
            );
          }

          /// USER NOTIFICATIONS
          _client!.subscribe(
            destination: '/topic/user-$userId',
            callback: (frame) {

              if (frame.body != null) {

                final data = jsonDecode(frame.body!);

                print("🔔 Notification Event: $data");

                onNotification(data);
              }
            },
          );
        },

        onWebSocketError: (error) {
          print("❌ WebSocket error: $error");
        },

        onDisconnect: (frame) {
          print("⚠️ WebSocket disconnected");
        },

        onStompError: (frame) {
          print("❌ STOMP error: ${frame.body}");
        },
      ),
    );

    _client!.activate();
  }

  void disconnect() {

    if (_client != null) {

      _client!.deactivate();

      _client = null;

      print("🔌 WebSocket manually disconnected");
    }
  }
}