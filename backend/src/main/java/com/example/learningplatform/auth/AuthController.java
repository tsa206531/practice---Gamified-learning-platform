package com.example.learningplatform.auth;

import com.example.learningplatform.user.Role;
import com.example.learningplatform.user.User;
import com.example.learningplatform.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UserRepository users;
  private final PasswordEncoder encoder;
  private final JwtService jwtService;
  private final AuthenticationManager authManager;

  public AuthController(UserRepository users, PasswordEncoder encoder, JwtService jwtService, AuthenticationManager authManager) {
    this.users = users;
    this.encoder = encoder;
    this.jwtService = jwtService;
    this.authManager = authManager;
  }

  public record RegisterRequest(String name, String email, String password, Role role) {}
  public record AuthResponse(String token, Long id, String name, String email, Role role, int exp, int level) {}
  public record LoginRequest(String email, String password) {}
  public record GoogleLoginRequest(String idToken) {}

  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
    if (req.email() == null || req.password() == null || req.email().isBlank() || req.password().isBlank()) {
      return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
    }
    if (users.existsByEmail(req.email())) {
      return ResponseEntity.status(409).body(Map.of("error", "Email already registered"));
    }
    Role role = req.role() != null ? req.role() : Role.STUDENT;
    User u = new User(req.email(), encoder.encode(req.password()), role);
    if (req.name() != null && !req.name().isBlank()) {
      u.setName(req.name());
    }
    users.save(u);
    String token = jwtService.generateToken(u.getEmail(), Map.of("role", u.getRole().name()));
    return ResponseEntity.ok(new AuthResponse(token, u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getExp(), u.getLevel()));
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest req) {
    Authentication auth = authManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(), req.password()));
    if (auth.isAuthenticated()) {
      User u = users.findByEmail(req.email()).orElseThrow();
      String token = jwtService.generateToken(u.getEmail(), Map.of("role", u.getRole().name()));
      return ResponseEntity.ok(new AuthResponse(token, u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getExp(), u.getLevel()));
    }
    return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
  }

  @GetMapping("/me")
  public ResponseEntity<?> me(@RequestHeader(name = "Authorization", required = false) String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      return ResponseEntity.status(401).body(Map.of("error", "Missing token"));
    }
    String token = authHeader.substring(7);
    var claims = jwtService.parseClaims(token);
    String email = claims.getSubject();
    User u = users.findByEmail(email).orElse(null);
    if (u == null) {
      return ResponseEntity.status(401).body(Map.of("error", "User not found"));
    }
    return ResponseEntity.ok(Map.of(
      "id", u.getId(),
      "name", u.getName(),
      "email", u.getEmail(),
      "role", u.getRole().name(),
      "exp", u.getExp(),
      "level", u.getLevel(),
      "avatar", u.getAvatar(),
      "provider", u.getProvider()
    ));
  }

  @PostMapping("/google")
  public ResponseEntity<?> google(@RequestBody GoogleLoginRequest req) {
    try {
      if (req == null || req.idToken() == null || req.idToken().isBlank()) {
        return ResponseEntity.badRequest().body(Map.of("error", "idToken is required"));
      }
      // MVP verification via Google tokeninfo endpoint
      HttpClient client = HttpClient.newHttpClient();
      HttpRequest httpReq = HttpRequest.newBuilder()
        .uri(URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + URLEncoder.encode(req.idToken(), StandardCharsets.UTF_8)))
        .GET().build();
      HttpResponse<String> httpRes = client.send(httpReq, HttpResponse.BodyHandlers.ofString());
      if (httpRes.statusCode() != 200) {
        return ResponseEntity.status(401).body(Map.of(
          "error", "Invalid Google token",
          "detail", "Google tokeninfo returned status " + httpRes.statusCode()
        ));
      }
      String body = httpRes.body();
      Map<String, Object> payload;
      try {
        payload = new ObjectMapper().readValue(body, Map.class);
      } catch (Exception ex) {
        return ResponseEntity.status(502).body(Map.of("error", "Unable to parse Google tokeninfo"));
      }

      String aud = payload.get("aud") != null ? String.valueOf(payload.get("aud")) : "";
      String email = payload.get("email") != null ? String.valueOf(payload.get("email")) : "";
      String emailVerified = payload.get("email_verified") != null ? String.valueOf(payload.get("email_verified")) : "false";
      String sub = payload.get("sub") != null ? String.valueOf(payload.get("sub")) : "";
      String name = payload.get("name") != null ? String.valueOf(payload.get("name")) : null;
      String picture = payload.get("picture") != null ? String.valueOf(payload.get("picture")) : null;

      String expectedClientId = System.getenv().getOrDefault("GOOGLE_CLIENT_ID", "");
      if (expectedClientId.isBlank()) {
        try { expectedClientId = new org.springframework.core.env.StandardEnvironment().getProperty("GOOGLE_CLIENT_ID", ""); } catch (Exception ignored) {}
      }
      if (!expectedClientId.isBlank() && !expectedClientId.equals(aud)) {
        return ResponseEntity.status(401).body(Map.of(
          "error", "Invalid Google token",
          "detail", "audience mismatch"
        ));
      }
      if (!"true".equalsIgnoreCase(emailVerified)) {
        return ResponseEntity.status(401).body(Map.of(
          "error", "Invalid Google token",
          "detail", "email not verified"
        ));
      }
      if (email.isBlank()) {
        return ResponseEntity.status(401).body(Map.of(
          "error", "Invalid Google token",
          "detail", "email missing"
        ));
      }

      User u = users.findByEmail(email).orElse(null);
      if (u == null) {
        u = new User(email, encoder.encode(java.util.UUID.randomUUID().toString()), Role.STUDENT);
      }
      u.setProvider("GOOGLE");
      u.setProviderId(sub);
      if (name != null && !name.isBlank()) u.setName(name);
      if (picture != null && !picture.isBlank()) u.setAvatar(picture);
      users.save(u);

      String token = jwtService.generateToken(u.getEmail(), Map.of("role", u.getRole().name()));
      return ResponseEntity.ok(new AuthResponse(token, u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getExp(), u.getLevel()));
    } catch (Exception ex) {
      return ResponseEntity.status(500).body(Map.of(
        "error", "Google auth failed",
        "detail", ex.getClass().getSimpleName()
      ));
    }
  }
}
