package com.syncforge.activity;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityRepository activityRepository;

    @GetMapping
    public List<Activity> getActivity() {

        return activityRepository.findTop10ByOrderByCreatedAtDesc();

    }
}