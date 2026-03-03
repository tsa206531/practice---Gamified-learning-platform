"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"
import { ColorfulProgress } from "@/components/colorful-progress"
import { Layers, Play, Lock, CheckCircle2, Clock, BookOpen, ChevronRight } from 'lucide-react'
import Link from "next/link"

// Mock data for units based on current course selection
const coursesData = {
  "software-design-patterns": {
    title: "軟體設計模式精通之旅",
    totalUnits: 20,
    completedUnits: 3,
    units: [
      {
        id: 1,
        title: "單元一：課程介紹 & 試聽",
        description: "了解課程架構與學習路線，試聽核心內容",
        duration: "56:33",
        lessons: 3,
        status: "completed",
        locked: false,
      },
      {
        id: 2,
        title: "單元二：副本零：冒險者指引",
        description: "學習平台使用方式與學習策略",
        duration: "10:24",
        lessons: 1,
        status: "in-progress",
        locked: false,
      },
      {
        id: 3,
        title: "單元三：副本一：行雲流水的設計思路",
        description: "掌握設計的核心思維：把無形變有形",
        duration: "35:18",
        lessons: 1,
        status: "not-started",
        locked: false,
      },
      {
        id: 4,
        title: "單元四：SOLID 原則的本質",
        description: "深入理解物件導向設計的五大原則",
        duration: "128:45",
        lessons: 5,
        status: "not-started",
        locked: false,
      },
      {
        id: 5,
        title: "單元五：創建型模式 - Factory & Builder",
        description: "學習如何優雅地創建複雜物件",
        duration: "95:30",
        lessons: 4,
        status: "not-started",
        locked: true,
      },
      {
        id: 6,
        title: "單元六：結構型模式 - Adapter & Decorator",
        description: "掌握系統結構的設計技巧",
        duration: "112:20",
        lessons: 4,
        status: "not-started",
        locked: true,
      },
      {
        id: 7,
        title: "單元七：行為型模式 - Strategy & Observer",
        description: "了解物件間的互動設計",
        duration: "145:15",
        lessons: 6,
        status: "not-started",
        locked: true,
      },
      {
        id: 8,
        title: "單元八：進階架構設計思維",
        description: "從設計模式到架構設計的躍進",
        duration: "98:40",
        lessons: 3,
        status: "not-started",
        locked: true,
      },
    ]
  },
  "ai-bdd": {
    title: "AI x BDD：規格驅動全自動開發術",
    totalUnits: 15,
    completedUnits: 2,
    units: [
      {
        id: 1,
        title: "單元一：規格驅動開發的前提",
        description: "理解為何規格如此重要",
        duration: "41:15",
        lessons: 2,
        status: "completed",
        locked: false,
      },
      {
        id: 2,
        title: "單元二：100% 全自動化開發的脈絡：規格的光譜",
        description: "從領域驅動設計到測試驅動開發",
        duration: "31:12",
        lessons: 1,
        status: "in-progress",
        locked: false,
      },
      {
        id: 3,
        title: "單元三：70% 自動化：測試驅動開發",
        description: "掌握 TDD 的核心概念與實踐",
        duration: "46:03",
        lessons: 2,
        status: "not-started",
        locked: false,
      },
      {
        id: 4,
        title: "單元四：BDD 與 Gherkin Language",
        description: "用自然語言描述需求與測試",
        duration: "52:30",
        lessons: 3,
        status: "not-started",
        locked: false,
      },
      {
        id: 5,
        title: "單元五：AI 輔助開發實戰",
        description: "讓 AI 成為你的開發夥伴",
        duration: "78:45",
        lessons: 4,
        status: "not-started",
        locked: true,
      },
    ]
  }
}

export default function UnitsPage() {
  // In real app, this would come from context/state based on header selection
  const [selectedCourse] = useState<keyof typeof coursesData>("software-design-patterns")
  const courseData = coursesData[selectedCourse]

  const progress = (courseData.completedUnits / courseData.totalUnits) * 100

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success text-success-foreground">已完成</Badge>
      case "in-progress":
        return <Badge className="bg-accent text-accent-foreground">學習中</Badge>
      default:
        return <Badge variant="outline">未開始</Badge>
    }
  }

  const getStatusIcon = (status: string, locked: boolean) => {
    if (locked) return <Lock className="h-5 w-5 text-muted-foreground" />
    if (status === "completed") return <CheckCircle2 className="h-5 w-5 text-success" />
    if (status === "in-progress") return <Play className="h-5 w-5 text-accent" />
    return <Play className="h-5 w-5 text-muted-foreground" />
  }

  return (
    <MainLayout isLoggedIn={true}>
      <div className="flex flex-col">
        {/* Header Section */}
        <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
          <div className="container mx-auto px-6 py-16">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Layers className="h-8 w-8 text-primary" />
                <Badge className="bg-primary text-primary-foreground">課程單元</Badge>
              </div>
              <h1 className="mb-4 text-5xl font-bold text-balance">{courseData.title}</h1>
              <p className="text-xl text-muted-foreground text-pretty">
                查看並學習所有課程單元內容
              </p>
            </div>
          </div>
        </section>

        {/* Progress Overview */}
        <section className="container mx-auto px-6 py-8">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">整體學習進度</h3>
                    <p className="text-sm text-muted-foreground">
                      已完成 {courseData.completedUnits} / {courseData.totalUnits} 單元
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{Math.round(progress)}%</div>
                  </div>
                </div>
                <ColorfulProgress value={progress} className="h-4" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Units List */}
        <section className="container mx-auto px-6 pb-12">
          <div className="space-y-4">
            {courseData.units.map((unit) => (
              <Card 
                key={unit.id} 
                className={`transition-all hover:shadow-lg ${
                  unit.locked ? "opacity-60" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      {getStatusIcon(unit.status, unit.locked)}
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline">單元 {unit.id}</Badge>
                        {getStatusBadge(unit.status)}
                        {unit.locked && <Badge variant="secondary" className="gap-1">
                          <Lock className="h-3 w-3" />
                          未解鎖
                        </Badge>}
                      </div>
                      <CardTitle className="text-balance">{unit.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {unit.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {unit.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {unit.lessons} 課程
                      </span>
                    </div>
                    <Link href={`/course/${selectedCourse}`}>
                      <Button 
                        disabled={unit.locked}
                        className="gap-2"
                      >
                        {unit.status === "completed" ? "重新學習" : "開始學習"}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-muted/50">
          <div className="container mx-auto px-6 py-12">
            <Card>
              <CardHeader>
                <CardTitle>學習建議</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <h4 className="mb-2 font-semibold flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      循序漸進
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      建議按照單元順序學習，確保基礎概念紮實
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      實作練習
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      學完每個單元後，記得完成對應的道館挑戰
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      溫故知新
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      可隨時回來複習已完成的單元內容
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </MainLayout>
  )
}
