package com.syncforge.task;
import java.time.Instant;

public record CreateTaskRequest(

        String title,
        String description,
        String assignedTo,
        String priority,
        Instant dueDate

) {}