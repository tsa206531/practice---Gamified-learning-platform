package com.example.learningplatform.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    // 使用 ConcurrentHashMap 在記憶體中模擬資料庫儲存
    private static final Map<Long, List<SubmissionDto>> submissionsByUser = new ConcurrentHashMap<>();

    public record SubmissionRequest(String challengeId, String imageUrl) {}
    public record SubmissionDto(String challengeId, String imageUrl, LocalDateTime submittedAt) {}

    @PostMapping
    public ResponseEntity<Void> submit(@RequestBody SubmissionRequest request) {
        // 在真實應用中，userId 應該從 JWT token 中獲取
        // 為了 Demo 方便，我們假設使用者 ID 為 1
        long userId = 1L;

        List<SubmissionDto> userSubmissions = submissionsByUser.computeIfAbsent(userId, k -> new ArrayList<>());
        userSubmissions.add(new SubmissionDto(request.challengeId(), request.imageUrl(), LocalDateTime.now()));

        return ResponseEntity.ok().build();
    }

    @GetMapping
    public List<SubmissionDto> getSubmissions() {
        // 同樣，userId 應該從 JWT token 中獲取
        long userId = 1L;
        return submissionsByUser.getOrDefault(userId, List.of());
    }
}
