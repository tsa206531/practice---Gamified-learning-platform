package com.example.learningplatform.course;

import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class Course {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String slug;

  @Column(nullable = false)
  private String title;

  protected Course() {}

  public Course(String slug, String title) {
    this.slug = slug;
    this.title = title;
  }

  public Long getId() { return id; }
  public String getSlug() { return slug; }
  public String getTitle() { return title; }

  public void setSlug(String slug) { this.slug = slug; }
  public void setTitle(String title) { this.title = title; }
}
