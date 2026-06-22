package com.syncforge.project;

import com.syncforge.common.security.SecurityUtils;
import com.syncforge.notification.NotificationRepository;
import com.syncforge.notification.NotificationService;
import com.syncforge.task.TaskRepository;
import com.syncforge.user.Role;
import com.syncforge.user.User;
import com.syncforge.user.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository
            projectRepository;

    private final UserRepository
            userRepository;

    private final NotificationService
            notificationService;

    private final TaskRepository
            taskRepository;

    private final NotificationRepository
            notificationRepository;

    // =========================
    // CREATE PROJECT
    // =========================

    public Project createProject(
            String name,
            String description
    ) {

        User user =
                SecurityUtils
                        .getCurrentUser();

        ProjectMember ownerMember =
                ProjectMember.builder()
                        .userId(user.getId())
                        .role(Role.ADMIN)
                        .build();

        List<ProjectMember> members =
                new ArrayList<>();

        members.add(ownerMember);

        Project project =
                Project.builder()
                        .name(name)
                        .description(description)
                        .ownerId(user.getId())
                        .members(members)
                        .createdAt(
                                Instant.now()
                        )
                        .updatedAt(
                                Instant.now()
                        )
                        .build();

        return projectRepository
                .save(project);
    }

    // =========================
    // GET USER PROJECTS
    // =========================

    public List<Project>
    getUserProjects() {

        User user =
                SecurityUtils
                        .getCurrentUser();

        return projectRepository
                .findByMembersUserId(
                        user.getId()
                );
    }

    // =========================
    // ADD MEMBER
    // =========================

    public Project addMember(
            String projectId,
            AddMemberRequest request
    ) {

        Project project =
                projectRepository
                        .findById(projectId)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Project not found"
                                        )
                        );

        User user =
                userRepository
                        .findByEmail(
                                request.getUserId()
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found"
                                        )
                        );

        boolean alreadyMember =
                project.getMembers()
                        .stream()
                        .anyMatch(
                                member ->
                                        member.getUserId()
                                                .equals(
                                                        user.getId()
                                                )
                        );

        if (alreadyMember) {

            throw new RuntimeException(
                    "User already a project member"
            );
        }

        project.getMembers().add(

                new ProjectMember(
                        user.getId(),
                        Role.MEMBER
                )
        );

        Project savedProject =
                projectRepository
                        .save(project);

        // Send notification

        notificationService
                .sendNotification(

                        user.getId(),

                        "You were added to project '"
                                + project.getName()
                                + "'",

                        project.getId(),

                        project.getId()
                );

        return savedProject;
    }

    // =========================
    // DELETE PROJECT
    // =========================

    public void deleteProject(
            String projectId
    ) {

        User currentUser =
                SecurityUtils
                        .getCurrentUser();

        Project project =
                projectRepository
                        .findById(projectId)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Project not found"
                                        )
                        );

        // Only owner can delete

        if (!project.getOwnerId()
                .equals(currentUser.getId())) {

            throw new RuntimeException(
                    "Only project owner can delete project"
            );
        }

        // Delete all project tasks

        taskRepository.deleteByProjectId(
                projectId
        );

        // Delete project notifications

        notificationRepository
                .deleteByProjectId(
                        projectId
                );

        // Finally delete project

        projectRepository.delete(project);
    }
}