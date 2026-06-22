package com.syncforge.comment;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public Comment addComment(@PathVariable String taskId,
                              @RequestBody AddCommentRequest request) {

        return commentService.addComment(taskId, request);
    }

    @GetMapping
    public List<Comment> getComments(@PathVariable String taskId) {

        return commentService.getComments(taskId);
    }
}