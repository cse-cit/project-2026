package com.syncforge.project;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProjectDetailsResponse {

    private String id;
    private String name;
    private String description;

    private int totalTasks;
    private int totalFiles;

    private List<ProjectMember> members;
}