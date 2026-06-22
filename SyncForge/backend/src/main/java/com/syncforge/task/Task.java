package com.syncforge.task;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "tasks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    private String id;

    private String projectId;

    private String priority;

    private String title;

    private Instant dueDate;

    private String description;

    private TaskStatus status;

    private String assignedTo;

    private String createdBy;

    private Instant createdAt;

    private Instant updatedAt;
}