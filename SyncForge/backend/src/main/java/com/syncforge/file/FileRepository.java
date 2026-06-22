package com.syncforge.file;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FileRepository extends MongoRepository<FileMetadata, String> {

    List<FileMetadata> findByTaskId(String taskId);
}