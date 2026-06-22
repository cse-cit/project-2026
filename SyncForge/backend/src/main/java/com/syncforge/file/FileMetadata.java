package com.syncforge.file;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "files")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileMetadata {

    @Id
    private String id;

    private String taskId;

    private String fileName;

    private long fileSize;

    private String fileType;

    private String filePath;

    private String uploadedBy;

    private Instant createdAt;
}