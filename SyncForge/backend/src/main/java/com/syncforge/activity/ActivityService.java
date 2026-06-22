package com.syncforge.activity;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;

    public void log(String userId, String message) {

        Activity activity = Activity.builder()
                .userId(userId)
                .message(message)
                .createdAt(Instant.now())
                .build();

        activityRepository.save(activity);
    }
}