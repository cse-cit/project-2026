package com.syncforge.notification;

import com.syncforge.websocket.WebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final WebSocketService webSocketService;

    public void sendNotification(String userId, String message, String referenceId, String projectId) {

        // Safety check (avoid broken notifications)
        if (userId == null || userId.isBlank()) {
            System.out.println("Notification skipped: invalid userId");
            return;
        }

        if (message == null || message.isBlank()) {
            System.out.println("Notification skipped: empty message");
            return;
        }

        System.out.println("NotificationService triggered for user: " + userId);

        Notification notification = Notification.builder()
                .userId(userId)
                .message(message)
                .referenceId(referenceId)
                .projectId(projectId)
                .isRead(false)
                .createdAt(Instant.now())
                .build();

        // Save to MongoDB
        Notification saved = notificationRepository.save(notification);

        System.out.println("Saved notification ID: " + saved.getId());

        // Send realtime notification via WebSocket
        try {
            webSocketService.sendUserNotification(userId, saved);
        } catch (Exception e) {
            System.out.println("WebSocket notification failed: " + e.getMessage());
        }
    }
}