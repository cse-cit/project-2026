package com.syncforge.comment;

import com.syncforge.common.security.SecurityUtils;
import com.syncforge.notification.NotificationService;
import com.syncforge.project.ProjectSecurityService;
import com.syncforge.task.Task;
import com.syncforge.task.TaskRepository;
import com.syncforge.user.User;
import com.syncforge.user.UserRepository;
import com.syncforge.websocket.SocketEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final ProjectSecurityService projectSecurityService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public Comment addComment(String taskId, AddCommentRequest request) {

        // Find task
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Validate project member
        projectSecurityService.validateProjectMember(task.getProjectId());

        // Get logged in user
        User user = SecurityUtils.getCurrentUser();

        // Resolve username safely
        String username = user.getFullName();

        if (username == null || username.isBlank()) {
            username = user.getEmail().split("@")[0]; // fallback if fullName missing
        }

        // Create comment
        Comment comment = Comment.builder()
                .taskId(taskId)
                .userId(user.getId())
                .username(username)
                .message(request.message())
                .createdAt(Instant.now())
                .build();

        Comment saved = commentRepository.save(comment);

        // Real-time websocket event
        SocketEvent event = SocketEvent.builder()
                .type("COMMENT_ADDED")
                .data(saved)
                .build();

        messagingTemplate.convertAndSend(
                "/topic/project/" + task.getProjectId(),
                event
        );

        // Notification logic
        if (task.getAssignedTo() != null) {

            userRepository.findById(task.getAssignedTo()).ifPresent(assignedUser -> {

                if (!assignedUser.getId().equals(user.getId())) {

                    notificationService.sendNotification(
                            assignedUser.getId(),
                            "New comment on your task: " + task.getTitle(),
                            taskId,
                            task.getProjectId()
                    );

                }

            });
        }

        return saved;
    }

    public List<Comment> getComments(String taskId) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        projectSecurityService.validateProjectMember(task.getProjectId());

        return commentRepository.findByTaskId(taskId);
    }
}