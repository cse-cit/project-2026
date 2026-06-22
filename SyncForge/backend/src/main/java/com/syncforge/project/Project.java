package com.syncforge.project;

import com.syncforge.user.Role;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "projects")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    @Id
    private String id;

    private String name;

    private String description;

    private String ownerId;

    private List<ProjectMember> members;

    private Instant createdAt;

    private Instant updatedAt;
}