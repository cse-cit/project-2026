package com.syncforge.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    @PostMapping("/generate-description")
    public Map<String, String> generateDescription(
            @RequestBody GenerateDescriptionRequest request
    ) {

        String result =
                aiService.generateTaskDescription(
                        request.getTitle()
                );

        return Map.of(
                "description",
                result
        );
    }
}