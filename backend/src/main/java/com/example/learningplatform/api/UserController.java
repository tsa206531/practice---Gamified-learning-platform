package com.example.learningplatform.api;

import com.example.learningplatform.user.User;
import com.example.learningplatform.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserRepository users;
  private final org.springframework.security.crypto.password.PasswordEncoder encoder;

  public UserController(UserRepository users, org.springframework.security.crypto.password.PasswordEncoder encoder) {
    this.users = users;
    this.encoder = encoder;
  }

  @GetMapping("/me")
  public ResponseEntity<?> getMe(@AuthenticationPrincipal UserDetails principal) {
    if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    User u = users.findByEmail(principal.getUsername()).orElse(null);
    if (u == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    
    Map<String, Object> body = new HashMap<>();
    body.put("id", u.getId());
    body.put("name", u.getName());
    body.put("email", u.getEmail());
    body.put("role", u.getRole().name());
    body.put("exp", u.getExp());
    body.put("level", u.getLevel());
    body.put("occupation", u.getOccupation());
    body.put("birthday", u.getBirthday());
    body.put("gender", u.getGender());
    body.put("location", u.getLocation());
    body.put("avatar", u.getAvatar());
    body.put("provider", u.getProvider());
    return ResponseEntity.ok(body);
  }

  public record UpdateMeRequest(String name, String occupation, String birthday, String gender, String location) {}

  @PatchMapping("/me")
  public ResponseEntity<?> updateMe(@AuthenticationPrincipal UserDetails principal, @RequestBody UpdateMeRequest req) {
    if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    User u = users.findByEmail(principal.getUsername()).orElse(null);
    if (u == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    if (req.name() != null && !req.name().isBlank()) {
      u.setName(req.name().trim());
    }
    if (req.occupation() != null) {
      String occ = req.occupation().trim();
      u.setOccupation(occ.isEmpty() ? null : occ);
    }
    if (req.gender() != null) {
      String g = req.gender().trim();
      u.setGender(g.isEmpty() ? null : g);
    }
    if (req.location() != null) {
      String loc = req.location().trim();
      u.setLocation(loc.isEmpty() ? null : loc);
    }
    if (req.birthday() != null) {
      String b = req.birthday().trim();
      if (b.isEmpty()) {
        u.setBirthday(null);
      } else {
        try {
          u.setBirthday(java.time.LocalDate.parse(b));
        } catch (Exception ignored) {
          // ignore invalid date format
        }
      }
    }
    users.save(u);
    Map<String, Object> body = new HashMap<>();
    body.put("id", u.getId());
    body.put("name", u.getName());
    body.put("email", u.getEmail());
    body.put("role", u.getRole().name());
    body.put("exp", u.getExp());
    body.put("level", u.getLevel());
    body.put("occupation", u.getOccupation());
    body.put("birthday", u.getBirthday());
    body.put("gender", u.getGender());
    body.put("location", u.getLocation());
    return ResponseEntity.ok(body);
  }

  public record ChangePasswordRequest(String currentPassword, String newPassword) {}

  @PostMapping("/me/password")
  public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserDetails principal, @RequestBody ChangePasswordRequest req) {
    if (principal == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    if (req == null || req.currentPassword() == null || req.newPassword() == null || req.currentPassword().isBlank() || req.newPassword().isBlank()) {
      return ResponseEntity.badRequest().body(Map.of("error", "currentPassword and newPassword are required"));
    }
    if (req.newPassword().length() < 8) {
      return ResponseEntity.badRequest().body(Map.of("error", "New password must be at least 8 characters"));
    }
    User u = users.findByEmail(principal.getUsername()).orElse(null);
    if (u == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    if (!encoder.matches(req.currentPassword(), u.getPasswordHash())) {
      return ResponseEntity.status(400).body(Map.of("error", "Current password is incorrect"));
    }
    u.setPasswordHash(encoder.encode(req.newPassword()));
    users.save(u);
    return ResponseEntity.ok(Map.of("message", "Password updated"));
  }
}
