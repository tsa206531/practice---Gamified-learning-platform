package com.example.learningplatform.gamification;

import org.springframework.stereotype.Service;

@Service
public class LevelService {
  // Derived from PRD: level -> cumulative exp; we use cumulative thresholds
  // 1:0, 2:200, 3:500, 4:1500, 5:3000, 6:5000, 7:7000, 8:9000, 9:11000, 10:13000,
  // 11:15000, 12:17000, ..., 35:63000, 36:65000
  private static final int[] CUMULATIVE = new int[] {
      0,    // Lv1
      200,  // Lv2
      500,  // Lv3
      1500, // Lv4
      3000, // Lv5
      5000, // Lv6
      7000, // Lv7
      9000, // Lv8
      11000,// Lv9
      13000,// Lv10
      15000,// Lv11
      17000,// Lv12
      19000,// Lv13
      21000,// Lv14
      23000,// Lv15
      25000,// Lv16
      27000,// Lv17
      29000,// Lv18
      31000,// Lv19
      33000,// Lv20
      35000,// Lv21
      37000,// Lv22
      39000,// Lv23
      41000,// Lv24
      43000,// Lv25
      45000,// Lv26
      47000,// Lv27
      49000,// Lv28
      51000,// Lv29
      53000,// Lv30
      55000,// Lv31
      57000,// Lv32
      59000,// Lv33
      61000,// Lv34
      63000,// Lv35
      65000 // Lv36
  };

  public int recalcLevel(int exp) {
    if (exp < 0) exp = 0;
    // Levels are 1-based; find highest level with cumulative <= exp
    int level = 1;
    for (int i = 0; i < CUMULATIVE.length; i++) {
      if (exp >= CUMULATIVE[i]) {
        level = i + 1;
      } else {
        break;
      }
    }
    return level;
  }

  public int nextLevelCumulative(int level) {
    int idx = Math.min(level, CUMULATIVE.length - 1); // if max level, stick to last
    return CUMULATIVE[idx];
  }

  public int currentLevelCumulative(int level) {
    int idx = Math.max(0, Math.min(level - 1, CUMULATIVE.length - 1));
    return CUMULATIVE[idx];
  }
}
