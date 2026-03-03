package com.example.learningplatform.course;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {
  private final CourseRepository repository;

  public CourseService(CourseRepository repository) {
    this.repository = repository;
  }

  public List<Course> listAll() {
    return repository.findAll();
  }
}
