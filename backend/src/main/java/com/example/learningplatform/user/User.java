package com.example.learningplatform.user;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "email", unique = true, nullable = false)
  private String email;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Enumerated(EnumType.STRING)
  @Column(name = "role", nullable = false)
  private Role role = Role.STUDENT;

  @Column(name = "name", nullable = false)
  private String name = "學員";

  @Column(name = "exp", nullable = false)
  private int exp = 0;

  @Column(name = "level", nullable = false)
  private int level = 1;

  @Column(name = "occupation")
  private String occupation;

  @Column(name = "birthday")
  private java.time.LocalDate birthday;

  @Column(name = "gender")
  private String gender;

  @Column(name = "location")
  private String location;

  @Column(name = "provider")
  private String provider;

  @Column(name = "provider_id")
  private String providerId;

  @Column(name = "avatar")
  private String avatar;

  @Column(name = "created_at", nullable = false)
  private java.time.Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private java.time.Instant updatedAt;

  public User() {}

  public User(String email, String passwordHash, Role role) {
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
  }

  @PrePersist
  public void prePersist() {
    var now = java.time.Instant.now();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @PreUpdate
  public void preUpdate() {
    this.updatedAt = java.time.Instant.now();
  }

  public Long getId() { return id; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getPasswordHash() { return passwordHash; }
  public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
  public Role getRole() { return role; }
  public void setRole(Role role) { this.role = role; }

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public int getExp() { return exp; }
  public void setExp(int exp) { this.exp = exp; }
  public int getLevel() { return level; }
  public void setLevel(int level) { this.level = level; }
  public java.time.Instant getCreatedAt() { return createdAt; }
  public java.time.Instant getUpdatedAt() { return updatedAt; }

  public String getOccupation() { return occupation; }
  public void setOccupation(String occupation) { this.occupation = occupation; }
  public java.time.LocalDate getBirthday() { return birthday; }
  public void setBirthday(java.time.LocalDate birthday) { this.birthday = birthday; }
  public String getGender() { return gender; }
  public void setGender(String gender) { this.gender = gender; }
  public String getLocation() { return location; }
  public void setLocation(String location) { this.location = location; }

  public String getProvider() { return provider; }
  public void setProvider(String provider) { this.provider = provider; }
  public String getProviderId() { return providerId; }
  public void setProviderId(String providerId) { this.providerId = providerId; }
  public String getAvatar() { return avatar; }
  public void setAvatar(String avatar) { this.avatar = avatar; }
}
