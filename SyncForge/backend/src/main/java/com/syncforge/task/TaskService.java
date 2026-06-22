package com.syncforge.task;

import com.syncforge.common.security.SecurityUtils;
import com.syncforge.notification.NotificationService;
import com.syncforge.project.ProjectSecurityService;
import com.syncforge.user.User;
import com.syncforge.user.UserRepository;
import com.syncforge.websocket.SocketEvent;
import com.syncforge.websocket.WebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectSecurityService projectSecurityService;
    private final WebSocketService webSocketService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public Task createTask(String projectId, CreateTaskRequest request) {

        projectSecurityService.validateProjectMember(projectId);

        User currentUser = SecurityUtils.getCurrentUser();

        Task task = Task.builder()
                .projectId(projectId)
                .title(request.title())
                .description(request.description())
                .assignedTo(request.assignedTo())
                .priority(
                   request.priority() != null
                     ? request.priority()
                     : "MEDIUM"
                )
                .createdBy(currentUser.getId())
                .status(TaskStatus.TODO)
                .dueDate(request.dueDate())
                .createdAt(Instant.now()) 
                .updatedAt(Instant.now())
                .build();

        Task savedTask = taskRepository.save(task);

        SocketEvent event = SocketEvent.builder()
                .type("TASK_CREATED")
                .data(savedTask)
                .build();

        webSocketService.sendProjectEvent(projectId, event);

        // 🔔 Notification with validation
        if (request.assignedTo() != null) {

            userRepository.findById(request.assignedTo()).ifPresent(assignedUser -> {

                if (!assignedUser.getId().equals(currentUser.getId())) {

                    notificationService.sendNotification(
                            assignedUser.getId(),
                            "New task assigned: " + request.title(),
                            savedTask.getId(),
                            savedTask.getProjectId()
                    );

                }

            });
        }

        return savedTask;
    }

    public List<Task> getProjectTasks(String projectId) {

        projectSecurityService.validateProjectMember(projectId);

        return taskRepository.findByProjectId(projectId);
    }

    public Task updateTaskStatus(String taskId, UpdateTaskStatusRequest request) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        projectSecurityService.validateProjectMember(task.getProjectId());

        User currentUser = SecurityUtils.getCurrentUser();

        task.setStatus(request.status());
        task.setUpdatedAt(Instant.now());

        Task updatedTask = taskRepository.save(task);

        SocketEvent event = SocketEvent.builder()
                .type("TASK_STATUS_UPDATED")
                .data(updatedTask)
                .build();

        webSocketService.sendProjectEvent(task.getProjectId(), event);

        // 🔔 Notification with validation
        if (task.getAssignedTo() != null) {

            userRepository.findById(task.getAssignedTo()).ifPresent(assignedUser -> {

                if (!assignedUser.getId().equals(currentUser.getId())) {

                    notificationService.sendNotification(
                            assignedUser.getId(),
                            "Task status updated to " + request.status(),
                            task.getId(),
                            task.getProjectId()
                    );

                }

            });
        }

        return updatedTask;
    }
    public void deleteTask(
        String projectId,
        String taskId
    ) {

    Task task = taskRepository
            .findById(taskId)
            .orElseThrow(
                    () -> new RuntimeException(
                            "Task not found"
                    )
            );

    if (!task.getProjectId()
            .equals(projectId)) {

        throw new RuntimeException(
                "Invalid project task"
        );
    }

    taskRepository.delete(task);
   }
}