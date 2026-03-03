package com.example.learningplatform.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.servlet.http.HttpServletResponse;

import com.example.learningplatform.user.UserRepository;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
    http
      .csrf(csrf -> csrf.disable())
      .cors(cors -> {})
      .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .exceptionHandling(ex -> ex
        .authenticationEntryPoint((request, response, authException) -> {
          response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
          response.setContentType("application/json");
          response.getWriter().write("{\"error\":\"Unauthorized\"}");
        })
        .accessDeniedHandler((request, response, accessDeniedException) -> {
          response.setStatus(HttpServletResponse.SC_FORBIDDEN);
          response.setContentType("application/json");
          response.getWriter().write("{\"error\":\"Forbidden\"}");
        })
      )
      .authorizeHttpRequests(auth -> auth
        .requestMatchers("/api/health", "/actuator/health", "/api/auth/**", "/api/courses", "/api/leaderboard", "/api/leaderboard/**").permitAll()
        .anyRequest().authenticated()
      )
      .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }

  private final java.util.List<String> corsAllowedOrigins;
  private final java.util.List<String> corsAllowedMethods;
  private final java.util.List<String> corsAllowedHeaders;

  public SecurityConfig(
      @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins}") java.util.List<String> corsAllowedOrigins,
      @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-methods}") java.util.List<String> corsAllowedMethods,
      @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-headers}") java.util.List<String> corsAllowedHeaders) {
    this.corsAllowedOrigins = corsAllowedOrigins;
    this.corsAllowedMethods = corsAllowedMethods;
    this.corsAllowedHeaders = corsAllowedHeaders;
  }

  @Bean
  public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
    var configuration = new org.springframework.web.cors.CorsConfiguration();
    configuration.setAllowCredentials(true);
    configuration.setAllowedOrigins(corsAllowedOrigins);
    configuration.setAllowedMethods(corsAllowedMethods);
    configuration.setAllowedHeaders(corsAllowedHeaders);
    var source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

  @Bean
  public UserDetailsService userDetailsService(UserRepository users) {
    return username -> users.findByEmail(username)
      .map(u -> org.springframework.security.core.userdetails.User
        .withUsername(u.getEmail())
        .password(u.getPasswordHash())
        .roles(u.getRole().name())
        .build())
      .orElseThrow(() -> new UsernameNotFoundException("User not found"));
  }

  @Bean
  public AuthenticationProvider authenticationProvider(UserDetailsService uds, PasswordEncoder encoder) {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
    provider.setUserDetailsService(uds);
    provider.setPasswordEncoder(encoder);
    return provider;
  }

  @Bean
  public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
    return config.getAuthenticationManager();
  }
}
