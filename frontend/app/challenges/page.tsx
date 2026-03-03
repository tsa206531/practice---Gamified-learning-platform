"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Footer } from "@/components/footer"
import { History, MessageSquare, TrendingUp, Share2, Star, Calendar, FileText, Award , Loader2, Image as ImageIcon} from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { API_BASE } from "@/lib/api"

// 這是從後端 API 獲取的真實提交紀錄的格式
type RealSubmission = {
  challengeId: string
  imageUrl: string
  submittedAt: string
}

// 這是我們用來展示的、合併後的豐富資料格式
type DisplayChallenge = typeof challengeTemplate & { submittedImageUrl?: string };

// 一個豐富的「樣板」，用來填充老師評語和技能評級等靜態內容
const challengeTemplate = {
  id: 1,
  title: "第六章：架構設計道館",
  chapter: "Chapter 6",
  submittedDate: "2024-12-10",
  reviewedDate: "2024-12-12",
  status: "已批改",
  overallRating: "B+",
  teacherComment: "整體架構設計思維正確，能夠清楚劃分各層職責。在設計模式的應用上有不錯的理解，特別是在 Repository Pattern 的實作上展現了良好的抽象能力。建議在邊界上下文的定義上可以更細緻一些，避免不同 Context 之間產生過度耦合。另外，在錯誤處理的設計上，可以考慮使用更統一的異常處理機制。繼續保持這樣的學習態度，相信很快就能突破到 A 級！",
  ratings: [
    { skill: "需求結構化分析", rating: "B+", level: 17, change: "+1" },
    { skill: "區分結構與行為", rating: "A-", level: 19, change: "+2" },
    { skill: "抽象/萃取能力", rating: "B", level: 16, change: "+1" },
    { skill: "建立 Well-Defined Context", rating: "B+", level: 17, change: "+1" },
    { skill: "熟悉設計模式的 Form", rating: "A", level: 20, change: "+2" },
    { skill: "游刃有餘的開發能力", rating: "B+", level: 17, change: "+1" },
  ],
};

function getRatingColor(rating: string) {
  const firstChar = rating[0]
  if (firstChar === "A" || firstChar === "S") return "text-success"
  if (firstChar === "B") return "text-accent"
  if (firstChar === "C") return "text-warning"
  return "text-muted-foreground"
}

function getChangeIcon(change: string) {
  if (change.startsWith("+")) {
    return <TrendingUp className="h-4 w-4 text-success" />
  }
  return null
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<DisplayChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAndCombineData() {
      try {
        const res = await fetch('/api/submissions', { cache: "no-store" })
        if (!res.ok) {
          throw new Error("無法獲取提交紀錄")
        }
        const realSubmissions: RealSubmission[] = await res.json()

        // 將真實提交紀錄與樣板結合
        const combinedData = realSubmissions.map((submission, index) => {
          // 深度複製樣板，避免互相影響
          const newChallenge = JSON.parse(JSON.stringify(challengeTemplate));

          // 覆蓋/新增真實資料
          newChallenge.id = index; // 使用 index 作為 key
          newChallenge.title = submission.challengeId; // 使用真實的挑戰標題
          newChallenge.submittedDate = new Date(submission.submittedAt).toLocaleDateString('zh-TW');
          newChallenge.submittedImageUrl = submission.imageUrl; // 新增真實的圖片 URL

          return newChallenge;
        });

        // 將紀錄反向排序，讓最新的在最前面
        setChallenges(combinedData.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()));

      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAndCombineData()
  }, [])

  return (
    <MainLayout isLoggedIn={true}>
      <div className="flex flex-col">
        {/* Header Section */}
        <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
          <div className="container mx-auto px-6 py-16">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 flex items-center justify-center gap-2">
                <History className="h-8 w-8 text-primary" />
                <Badge className="bg-primary text-primary-foreground">作業回饋</Badge>
              </div>
              <h1 className="mb-4 text-5xl font-bold text-balance">挑戰歷程</h1>
              <p className="text-xl text-muted-foreground text-pretty">
                查看老師對你的道館挑戰評語與技能評級進度
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-6 py-8">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{challenges.length}</div>
                    <div className="text-sm text-muted-foreground">已完成挑戰</div>
                  </div>
                  <Award className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">B+</div>
                    <div className="text-sm text-muted-foreground">平均評級</div>
                  </div>
                  <Star className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">+{challenges.length}</div>
                    <div className="text-sm text-muted-foreground">本月成長</div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">17</div>
                    <div className="text-sm text-muted-foreground">平均等級</div>
                  </div>
                  <FileText className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Challenge History */}
        <section className="container mx-auto px-6 pb-12">
          <div className="space-y-6">
            {loading && (
              <div className="flex justify-center items-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">載入紀錄中...</span>
              </div>
            )}

            {error && (
              <div className="text-center text-destructive p-10">{error}</div>
            )}

            {!loading && !error && challenges.length === 0 && (
              <div className="text-center text-muted-foreground p-10">
                目前尚無任何挑戰紀錄，快去地圖頁面挑戰道館吧！
              </div>
            )}

            {!loading && !error && challenges.map((challenge) => (
              <Card key={challenge.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="outline">{challenge.chapter}</Badge>
                        <Badge className="bg-success text-success-foreground">
                          {challenge.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-balance">{challenge.title}</CardTitle>
                      <CardDescription className="mt-2 flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          提交：{challenge.submittedDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          批改：{challenge.reviewedDate}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getRatingColor(challenge.overallRating)}`}>
                          {challenge.overallRating}
                        </div>
                        <div className="text-xs text-muted-foreground">總體評級</div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Share2 className="h-4 w-4" />
                        分享
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 p-6">
                  {/* Submitted Image Section */}
                  {challenge.submittedImageUrl && (
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-primary" />
                        您提交的圖片
                      </h3>
                      <div className="overflow-hidden rounded-lg border">
                        <img
                          src={challenge.submittedImageUrl}
                          alt={`Submission for ${challenge.title}`}
                          className="w-full h-auto max-h-96 object-contain bg-muted/20"
                        />
                      </div>
                    </div>
                  )}

                  {/* Teacher Comment */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg?key=teacher" />
                        <AvatarFallback>水</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">水球潘老師</div>
                        <div className="text-sm text-muted-foreground">講師評語</div>
                      </div>
                    </div>
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <p className="leading-relaxed text-foreground">{challenge.teacherComment}</p>
                    </div>
                  </div>

                  {/* Skill Ratings */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">技能評級詳情</h3>
                    <div className="grid gap-4 md:grid-cols-2">                      
                      {challenge.ratings.map((rating: { skill: string; rating: string; level: number; change: string }, index: number) => (
                        <div key={index} className="rounded-lg border p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-primary" />
                              <span className="font-medium">{rating.skill}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`text-base font-bold ${getRatingColor(rating.rating)}`}
                              >
                                {rating.rating}
                              </Badge>
                              {rating.change !== "0" && (
                                <Badge variant="secondary" className="gap-1">
                                  {getChangeIcon(rating.change)}
                                  {rating.change}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>等級進度</span>
                              <span>{rating.level}/34</span>
                            </div>
                            <Progress value={(rating.level / 34) * 100} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          {!loading && challenges.length > 0 && (
            <div className="mt-8 text-center">
              <Button variant="outline" size="lg" disabled>
                載入更多歷程
              </Button>
            </div>
          )}
        </section>

        {/* Info Section */}
        <section className="bg-muted/50">
          <div className="container mx-auto px-6 py-12">
            <Card>
              <CardHeader>
                <CardTitle>關於技能評級系統</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold">評級說明</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>共 34 級評級，從 F- 到 ACE</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>每個道館挑戰都會獲得 6 個面向的評分</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>由水球潘老師親自批改並給予評級</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">如何提升評級</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>仔細閱讀老師的評語與建議</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>針對弱項進行加強練習</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>持續完成更多道館挑戰累積經驗</span>
                      </li>
                    </ul>
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
