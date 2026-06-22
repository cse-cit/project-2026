package com.syncforge.dashboard;

import com.syncforge.project.ProjectRepository;
import com.syncforge.task.TaskRepository;
import com.syncforge.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    @GetMapping
    public Map<String, Object> getDashboard(Authentication auth) {

    User user = (User) auth.getPrincipal();
    String userId = user.getId();

    long projectCount = projectRepository.countByMembersUserId(userId);

    long taskCount = taskRepository.count();

    long completed = taskRepository.countByStatus("DONE");

    long todo = taskRepository.countByStatus("TODO");
    long inProgress = taskRepository.countByStatus("IN_PROGRESS");

    long pending = todo + inProgress;

    Map<String, Object> response = new HashMap<>();

    response.put("projects", projectCount);
    response.put("tasks", taskCount);
    response.put("completed", completed);
    response.put("pending", pending);

    return response;
   } 
}