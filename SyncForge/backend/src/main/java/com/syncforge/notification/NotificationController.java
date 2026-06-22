package com.syncforge.notification;

import com.syncforge.auth.JwtService;
import com.syncforge.user.User;
import com.syncforge.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    private String getUserId(HttpServletRequest request) {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing Authorization header");
        }

        String token = authHeader.substring(7);

        String email = jwtService.extractUsername(token);

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getId().toString();
    }

    @GetMapping
    public List<Notification> getNotifications(HttpServletRequest request) {

        String userId = getUserId(request);

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
    }

    @PatchMapping("/{id}/read")
    public Notification markAsRead(
            @PathVariable String id,
            HttpServletRequest request
    ) {

        String userId = getUserId(request);

        Notification notification =
                notificationRepository.findById(id).orElseThrow();

        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        notification.setRead(true);

        return notificationRepository.save(notification);
    }

    @DeleteMapping
    public void clearNotifications(HttpServletRequest request) {

        String userId = getUserId(request);

        notificationRepository.deleteByUserId(userId);
    }
}