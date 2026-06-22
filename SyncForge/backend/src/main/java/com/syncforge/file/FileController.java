package com.syncforge.file;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/tasks/{taskId}/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping
    public FileMetadata uploadFile(@PathVariable String taskId,
                                   @RequestParam("file") MultipartFile file) throws IOException {

        return fileService.uploadFile(taskId, file);
    }

    @GetMapping
    public List<FileMetadata> getFiles(@PathVariable String taskId) {

        return fileService.getFiles(taskId);
    }

    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable String taskId,
                                                 @PathVariable String fileId) throws IOException {

        return fileService.downloadFile(taskId, fileId);
    }
}