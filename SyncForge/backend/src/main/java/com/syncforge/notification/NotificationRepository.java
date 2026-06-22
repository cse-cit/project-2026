package com.syncforge.notification;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository
        extends MongoRepository<Notification, String> {

    List<Notification>
    findByUserIdOrderByCreatedAtDesc(
            String userId
    );

    List<Notification>
    findTop20ByUserIdOrderByCreatedAtDesc(
            String userId
    );

    List<Notification>
    findByUserIdAndIsReadFalseOrderByCreatedAtDesc(
            String userId
    );

    void deleteByUserId(String userId);

    // Delete notifications
    // related to project
    void deleteByProjectId(
            String projectId
    );
}