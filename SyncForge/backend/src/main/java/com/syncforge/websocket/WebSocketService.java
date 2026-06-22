package com.syncforge.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    // ✅ Project-level events
    public void sendProjectEvent(String projectId, SocketEvent event) {
        messagingTemplate.convertAndSend(
                "/topic/project/" + projectId,
                event
        );
    }

    // ✅ User-level notifications
    public void sendUserNotification(String userId, Object payload) {

        SocketEvent event = SocketEvent.builder()
                .type("NOTIFICATION")
                .data(payload)
                .build();

        messagingTemplate.convertAndSend(
                "/topic/user-" + userId,
                event
        );
    }
}