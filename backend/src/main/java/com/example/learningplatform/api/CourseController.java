package com.example.learningplatform.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CourseController {

  @GetMapping("/health")
  public Map<String, String> health() {
    return Map.of("status", "ok");
  }

  @GetMapping("/courses")
  public List<CourseDto> list() {
    // TODO: 這裡先回傳 mock 資料，之後應從資料庫讀取
    return List.of(
        new CourseDto(
            1,
            "software-design-patterns",
            "軟體設計模式精通之旅",
            "深入探索 23 種經典設計模式,從基礎到進階，掌握軟體架構的核心思維。透過實戰專案學習如何在真實場景中應用設計模式。",
            "https://world.waterballsa.tw/world/courses/course_0.png",
            "進階", "40 小時", 1250, 4.9, 20, 8, "NT$ 5,990",
            List.of("23 種設計模式完整解析", "真實專案實戰演練", "8 個道館挑戰", "老師親自批改作業")
        ),
        new CourseDto(
            2,
            "ai-bdd",
            "AI x BDD：規格驅動全自動開發術",
            "結合 AI 技術與行為驅動開發（BDD），學習如何撰寫高品質的需求規格，並利用 AI 工具加速開發流程。",
            "https://world.waterballsa.tw/world/courses/course_4.png",
            "中階", "30 小時", 890, 4.8, 15, 6, "NT$ 4,990",
            List.of("BDD 完整方法論", "AI 輔助開發實戰", "6 個道館挑戰", "自動化測試技巧")
        )
    );
  }
}
