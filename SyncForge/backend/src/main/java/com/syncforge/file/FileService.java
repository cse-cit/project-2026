package com.syncforge.file;

import com.syncforge.common.security.SecurityUtils;
import com.syncforge.project.ProjectSecurityService;
import com.syncforge.task.Task;
import com.syncforge.task.TaskRepository;
import com.syncforge.user.User;
import com.syncforge.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

@Service
@RequiredArgsConstructor
public class FileService {

    private final FileRepository fileRepository;
    private final TaskRepository taskRepository;
    private final ProjectSecurityService projectSecurityService;
    private final NotificationService notificationService;

    // ✅ Absolute path (safe)
    private final String UPLOAD_DIR = System.getProperty("user.home") + "/syncforge-uploads/";

    public FileMetadata uploadFile(String taskId, MultipartFile file) throws IOException {

        // 🔍 Validate task
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // 🔒 Access control
        projectSecurityService.validateProjectMember(task.getProjectId());

        // 🔒 File size limit (5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File too large");
        }

        // 🔒 File type validation
        String contentType = file.getContentType();
        if (contentType != null) {
            if (!(contentType.startsWith("image/") ||
                    contentType.equals("application/pdf"))) {

                throw new RuntimeException("Invalid file type");
            }
        }

        // 🔒 Sanitize original filename
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) {
            throw new RuntimeException("Invalid file name");
        }

        originalFileName = originalFileName.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");

        // 🔒 Unique filename
        String fileName = UUID.randomUUID() + "_" + originalFileName;

        // 📁 Ensure directory exists
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            boolean created = uploadDir.mkdirs();
            if (!created) {
                throw new RuntimeException("Failed to create upload directory");
            }
        }

        // 📁 Absolute file path
        File destination = new File(UPLOAD_DIR + fileName);

        // 💾 Save file
        file.transferTo(destination);

        // 👤 Current user
        User user = SecurityUtils.getCurrentUser();

        // 🧾 Save metadata
        FileMetadata metadata = FileMetadata.builder()
                .taskId(taskId)
                .fileName(originalFileName)
                .fileType(contentType)
                .fileSize(file.getSize())
                .filePath(destination.getAbsolutePath())
                .uploadedBy(user.getId())
                .createdAt(Instant.now())
                .build();

        FileMetadata savedFile = fileRepository.save(metadata);

        // 🔔 FIXED NOTIFICATION LOGIC
        if (task.getAssignedTo() != null && !task.getAssignedTo().equals(user.getId())) {

            notificationService.sendNotification(
                    task.getAssignedTo(),
                    "File uploaded to task '" + task.getTitle() + "'",
                    task.getId(),
                    task.getProjectId()

            );
        }

        return savedFile;
    }

    public List<FileMetadata> getFiles(String taskId) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        projectSecurityService.validateProjectMember(task.getProjectId());

        return fileRepository.findByTaskId(taskId);
    }

    public ResponseEntity<Resource> downloadFile(String taskId, String fileId) throws IOException {

        FileMetadata file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        // 🔒 Validate task match
        if (!file.getTaskId().equals(taskId)) {
            throw new RuntimeException("Invalid file access");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        projectSecurityService.validateProjectMember(task.getProjectId());

        File diskFile = new File(file.getFilePath());

        if (!diskFile.exists()) {
            throw new RuntimeException("File missing on server");
        }

        Resource resource = new UrlResource(diskFile.toURI());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.getFileName() + "\"")
                .header(HttpHeaders.CONTENT_TYPE, file.getFileType())
                .body(resource);
    }
}