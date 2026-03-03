package com.example.learningplatform.api;

import java.util.List;

public record CourseDto(
    int id,
    String slug,
    String title,
    String description,
    String image,
    String level,
    String duration,
    int students,
    double rating,
    int units,
    int badges,
    String price,
    List<String> highlights
) {}
