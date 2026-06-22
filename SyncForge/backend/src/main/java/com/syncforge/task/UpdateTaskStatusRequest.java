package com.syncforge.task;

public record UpdateTaskStatusRequest(
        TaskStatus status
) {}