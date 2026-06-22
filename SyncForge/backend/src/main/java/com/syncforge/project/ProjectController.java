package com.syncforge.project;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public Project createProject(@RequestParam String name,
                                 @RequestParam String description) {

        return projectService.createProject(name, description);
    }

    @GetMapping
    public List<Project> getProjects() {

        return projectService.getUserProjects();
    }

    @PostMapping("/{projectId}/members")
    public Project addMember(@PathVariable String projectId,
                             @RequestBody AddMemberRequest request) {

        return projectService.addMember(projectId, request);
    }
    @DeleteMapping("/{projectId}")
    public void deleteProject(
         @PathVariable String projectId
    ) {

      projectService.deleteProject(
              projectId
        );
    }
     
}
