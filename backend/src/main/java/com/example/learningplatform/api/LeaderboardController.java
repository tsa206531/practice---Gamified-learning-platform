package com.example.learningplatform.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

  public record LeaderboardItem(int id, String name, int exp, int level, int rank) {}
  public record LeaderboardResponse(List<LeaderboardItem> top, LeaderboardItem currentUser) {}

  @GetMapping
  public LeaderboardResponse getAllTime() {
    // TODO: 這裡先回傳 mock 資料，之後應從資料庫讀取
    List<LeaderboardItem> top = List.of(
        new LeaderboardItem(1, "神速學習者", 15200, 10, 1),
        new LeaderboardItem(2, "代碼詩人", 13800, 9, 2),
        new LeaderboardItem(3, "架構大師", 12500, 9, 3),
        new LeaderboardItem(4, "水球君", 11300, 8, 4),
        new LeaderboardItem(5, "測試驅動者", 9800, 7, 5),
        new LeaderboardItem(6, "前端魔法師", 8500, 7, 6),
        new LeaderboardItem(7, "重構忍者", 7200, 6, 7),
        new LeaderboardItem(8, "菜鳥工程師", 5100, 5, 8),
        new LeaderboardItem(9, "設計模式愛好者", 3500, 4, 9),
        new LeaderboardItem(10, "演算法探險家", 2100, 3, 10)
    );
    // 假設當前登入的使用者資訊
    LeaderboardItem currentUser = new LeaderboardItem(99, "我 (水球君)", 1800, 2, 42);
    return new LeaderboardResponse(top, currentUser);
  }
}
