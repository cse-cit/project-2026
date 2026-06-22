package com.syncforge.task;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public Task createTask(@PathVariable String projectId,
                           @RequestBody CreateTaskRequest request) {

        return taskService.createTask(projectId, request);
    }

    @GetMapping
    public List<Task> getTasks(@PathVariable String projectId) {

        return taskService.getProjectTasks(projectId);
    }
    @PatchMapping("/{taskId}/status")
    public Task updateStatus(@PathVariable String taskId,
                             @RequestBody UpdateTaskStatusRequest request) {

        return taskService.updateTaskStatus(taskId, request);
    }
    @DeleteMapping("/{taskId}")
    public void deleteTask(
        @PathVariable String projectId,
        @PathVariable String taskId
    ) {

       taskService.deleteTask(
                    projectId,
                     taskId
        );
    }
}