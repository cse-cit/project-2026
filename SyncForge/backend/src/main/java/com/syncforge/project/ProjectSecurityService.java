package com.syncforge.project;

import com.syncforge.common.security.SecurityUtils;
import com.syncforge.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectSecurityService {

    private final ProjectRepository projectRepository;

    public void validateProjectMember(String projectId) {

        User user = SecurityUtils.getCurrentUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        boolean isMember = project.getMembers().stream()
                .anyMatch(member -> member.getUserId().equals(user.getId()));

        if (!isMember) {
            throw new RuntimeException("Access denied: not a project member");
        }
    }
}