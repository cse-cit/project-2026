package com.syncforge.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIService {

    @Value("${gemini.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateTaskDescription(String title) {

        try {

            System.out.println("=================================");
            System.out.println("AI REQUEST RECEIVED");
            System.out.println("TITLE: " + title);

            String url =
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
                            + apiKey;

            String prompt = """
                    Generate a professional software development task description.

                    Task Title:
                    %s

                    Rules:
                    - Keep response technical
                    - Keep response concise
                    - Maximum 50 words
                    - Do not use bullet points
                    """.formatted(title);

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of(
                                    "parts", List.of(
                                            Map.of(
                                                    "text",
                                                    prompt
                                            )
                                    )
                            )
                    )
            );

            HttpHeaders headers = new HttpHeaders();

            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(requestBody, headers);

            System.out.println("CALLING GEMINI API...");

            System.out.println("REQUEST BODY:");
            System.out.println(requestBody);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );
            System.out.println("STATUS CODE:");
            System.out.println(response.getStatusCode());

            System.out.println("GEMINI STATUS: " + response.getStatusCode());

            Map body = response.getBody();

            System.out.println("GEMINI RESPONSE BODY:");
            System.out.println(body);

            if (body == null) {
                return "Failed to generate description";
            }

            List<Map> candidates =
                    (List<Map>) body.get("candidates");

            if (candidates == null || candidates.isEmpty()) {
                return "No AI response received";
            }

            Map content =
                    (Map) candidates.get(0).get("content");

            List<Map> parts =
                    (List<Map>) content.get("parts");

            if (parts == null || parts.isEmpty()) {
                return "No AI text generated";
            }

            String result =
                    parts.get(0).get("text").toString();

            System.out.println("AI GENERATED:");
            System.out.println(result);

            System.out.println("=================================");

            return result;

        } catch (Exception e) {

            System.out.println("=================================");
            System.out.println("AI ERROR OCCURRED");
            System.out.println(e.getMessage());
            e.printStackTrace();
            System.out.println("=================================");

            return "Implement functionality for: " + title;
        }
    }
}