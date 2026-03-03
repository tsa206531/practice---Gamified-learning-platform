package com.example.learningplatform.api;

import com.example.learningplatform.user.UserRepository;
import com.example.learningplatform.user.User;
import com.example.learningplatform.gamification.LevelService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

  private final UserRepository users;
  private final LevelService levelService;

  public AdminController(UserRepository users, LevelService levelService) {
    this.users = users;
    this.levelService = levelService;
  }

  @GetMapping("/metrics")
  @PreAuthorize("hasRole('ADMIN')")
  public Map<String, Object> metrics() {
    return Map.of(
      "status", "ok",
      "usersCount", users.count(),
      "serverTime", Instant.now().toString()
    );
  }

  public record GrantExpRequest(int delta, String reason) {}

  @PostMapping("/users/{id}/exp")
  @PreAuthorize("hasRole('ADMIN')")
  public Object grantExp(@PathVariable Long id, @RequestBody GrantExpRequest req) {
    User u = users.findById(id).orElse(null);
    if (u == null) return Map.of("error", "User not found");
    int delta = req != null ? req.delta() : 0;
    if (delta == 0) return Map.of("error", "delta must not be 0");
    int newExp = Math.max(0, u.getExp() + delta);
    u.setExp(newExp);
    u.setLevel(levelService.recalcLevel(newExp));
    users.save(u);
    return Map.of(
      "id", u.getId(),
      "name", u.getName(),
      "email", u.getEmail(),
      "exp", u.getExp(),
      "level", u.getLevel()
    );
  }
}
