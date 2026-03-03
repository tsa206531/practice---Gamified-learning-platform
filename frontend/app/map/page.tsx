"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"
import { ColorfulProgress } from "@/components/colorful-progress"
import { Map, Trophy, Lock, CheckCircle2, Clock, Zap, Target, BookOpen, Code, Calendar, Upload, ChevronRight, Award, MessageSquare } from 'lucide-react'
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

// Mock gym data based on course units
const gyms = [
  {
    id: 1,
    title: "課程介紹道館",
    unit: "單元一",
    difficulty: "入門",
    description: "理解課程架構與學習路線規劃",
    prerequisites: [
      "觀看「課程介紹：這門課手把手帶你成為架構設計的高手」",
      "理解「在 AI 的時代下，只會下 prompt 絕對寫不出好 Code」",
      "試聽「架構師該學的 C.A. 模式六大要素及模式思維」"
    ],
    status: "completed",
    locked: false,
    badgeIcon: "🎓",
    challenges: [
      {
        id: "1-quick",
        type: "速戰速決",
        title: "概念測驗：課程架構理解",
        description: "馬上鍛鍊概念，及早獲得回饋",
        features: ["不需要實作程式碼", "選擇題與簡答題", "立即批改回饋"],
        timeLimit: "3天",
        xpReward: 100,
        question: `
### 課程架構理解測驗

請回答以下問題，展現你對課程架構的理解：

1. **什麼是 C.A. 模式的六大要素？請簡述每個要素的核心概念。**

2. **為什麼在 AI 時代，只會下 prompt 還不夠？架構設計能力為何仍然重要？**

3. **本課程的學習路線是如何規劃的？從哪些面向來培養架構設計能力？**

4. **你認為「把無形變有形」在軟體設計中是什麼意思？請舉一個簡單的例子。**

請在下方上傳你的答案檔案（PDF 或 Markdown 格式）
        `
      },
      {
        id: "1-practice",
        type: "實戰演練",
        title: "設計思維實作：學習規劃系統",
        description: "深刻鍛鍊內化思路，熟悉概念動手思考",
        features: ["完整程式碼實作", "1對1 Code Review", "掃除設計盲點"],
        timeLimit: "14天",
        xpReward: 300,
        question: `
### 學習規劃系統設計實作

設計並實作一個簡單的「學習規劃系統」，展現你對課程架構的理解：

#### 需求說明
1. 系統能記錄學習者的課程進度
2. 能為學習者推薦下一個應該學習的單元
3. 能追蹤學習者在六大要素上的能力成長

#### 技術要求
- 使用物件導向設計
- 清楚定義類別與職責
- 適當的抽象與封裝
- 包含單元測試

#### 提交內容
1. 完整的程式碼（含註解）
2. 設計說明文件（說明你的設計思維）
3. 單元測試程式碼
4. README 說明如何執行

請將所有檔案打包成 ZIP 上傳
        `
      }
    ]
  },
  {
    id: 2,
    title: "平台使用道館",
    unit: "單元二",
    difficulty: "入門",
    description: "熟悉學習平台的各項功能與學習策略",
    prerequisites: [
      "觀看「平台使用手冊」",
      "了解道館挑戰系統的運作方式",
      "理解技能評級系統的評分標準"
    ],
    status: "available",
    locked: false,
    badgeIcon: "🎮",
    challenges: [
      {
        id: "2-quick",
        type: "速戰速決",
        title: "平台功能理解測驗",
        description: "測試你對平台各項功能的理解",
        features: ["不需要實作程式碼", "選擇題與簡答題", "立即批改回饋"],
        timeLimit: "3天",
        xpReward: 100,
        question: `
### 平台功能理解測驗

請回答以下問題：

1. **道館挑戰的兩種模式有何不同？各適合什麼樣的學習情境？**

2. **技能評級系統有哪六個評分面向？請說明每個面向評估的重點。**

3. **如何有效利用平台的學習資源來提升自己的能力？**

4. **XP 系統和徽章系統的設計目的是什麼？對學習有什麼幫助？**

請在下方上傳你的答案檔案
        `
      },
      {
        id: "2-practice",
        type: "實戰演練",
        title: "學習管理系統設計",
        description: "設計一個類似的遊戲化學習平台",
        features: ["完整程式碼實作", "1對1 Code Review", "掃除設計盲點"],
        timeLimit: "14天",
        xpReward: 300,
        question: `
### 學習管理系統設計實作

參考本平台的設計，實作一個簡化版的學習管理系統：

#### 核心功能
1. 使用者註冊與登入
2. 課程進度追蹤
3. 作業提交與批改
4. 經驗值與等級系統

#### 技術要求
- 清晰的系統架構
- 合理的資料庫設計
- RESTful API 設計
- 基本的前端介面

#### 提交內容
1. 完整的程式碼
2. 系統架構說明文件
3. 資料庫 Schema
4. API 文件
5. 部署說明

請將所有檔案打包上傳
        `
      }
    ]
  },
  {
    id: 3,
    title: "設計思維道館",
    unit: "單元三",
    difficulty: "基礎",
    description: "掌握「把無形變有形」的設計核心思維",
    prerequisites: [
      "觀看「設計的關鍵是：把無形變有形」",
      "理解抽象化的核心概念",
      "學習如何將需求轉化為設計"
    ],
    status: "available",
    locked: false,
    badgeIcon: "💡",
    challenges: [
      {
        id: "3-quick",
        type: "速戰速決",
        title: "設計思維概念測驗",
        description: "測試你對設計思維的理解",
        features: ["不需要實作程式碼", "選擇題與簡答題", "立即批改回饋"],
        timeLimit: "3天",
        xpReward: 150,
        question: `
### 設計思維概念測驗

請回答以下問題：

1. **什麼是「把無形變有形」？在軟體設計中如何實踐這個概念？**

2. **抽象化在軟體設計中扮演什麼角色？請舉例說明。**

3. **如何從一個模糊的需求，逐步提煉出清晰的設計？請描述你的思考流程。**

4. **好的設計與壞的設計有什麼差別？請從「行雲流水」的角度分析。**

請在下方上傳你的答案檔案
        `
      },
      {
        id: "3-practice",
        type: "實戰演練",
        title: "購物車系統設計",
        description: "從需求分析到設計實作的完整流程",
        features: ["完整程式碼實作", "1對1 Code Review", "掃除設計盲點"],
        timeLimit: "14天",
        xpReward: 400,
        question: `
### 購物車系統設計實作

設計並實作一個購物車系統，展現「把無形變有形」的設計思維：

#### 業務需求
一個電商平台需要購物車功能：
- 使用者可以加入商品到購物車
- 可以調整商品數量
- 支援優惠券與促銷活動
- 計算總價與折扣
- 庫存檢查與預留

#### 設計要求
1. **需求分析文件**：將模糊的需求具體化
2. **領域模型設計**：識別關鍵實體與關係
3. **行為設計**：定義系統的核心流程
4. **實作程式碼**：將設計轉化為程式碼

#### 評分重點
- 需求結構化分析能力
- 抽象/萃取能力
- 設計的完整性與一致性
- 程式碼的可讀性

#### 提交內容
1. 需求分析文件
2. 設計文件（包含 UML 圖）
3. 完整程式碼
4. 單元測試
5. 設計決策說明

請將所有檔案打包上傳
        `
      }
    ]
  },
  {
    id: 4,
    title: "SOLID 原則道館",
    unit: "單元四",
    difficulty: "中階",
    description: "深入理解並實踐 SOLID 五大原則",
    prerequisites: [
      "學習完單元四的所有課程",
      "理解每個 SOLID 原則的定義",
      "能夠識別違反 SOLID 原則的程式碼"
    ],
    status: "locked",
    locked: true,
    badgeIcon: "🏛️",
    challenges: [
      {
        id: "4-quick",
        type: "速戰速決",
        title: "SOLID 原則識別測驗",
        description: "測試你識別設計問題的能力",
        features: ["不需要實作程式碼", "程式碼審查題", "立即批改回饋"],
        timeLimit: "3天",
        xpReward: 200,
        question: ""
      },
      {
        id: "4-practice",
        type: "實戰演練",
        title: "重構練習：SOLID 原則應用",
        description: "重構違反 SOLID 的程式碼",
        features: ["完整程式碼實作", "1對1 Code Review", "掃除設計盲點"],
        timeLimit: "14天",
        xpReward: 500,
        question: ""
      }
    ]
  },
  {
    id: 5,
    title: "創建型模式道館",
    unit: "單元五",
    difficulty: "中階",
    description: "掌握 Factory 與 Builder 模式的應用",
    prerequisites: [
      "完成 SOLID 原則道館",
      "學習 Factory Pattern",
      "學習 Builder Pattern",
      "理解創建型模式的應用場景"
    ],
    status: "locked",
    locked: true,
    badgeIcon: "🏭",
    challenges: []
  },
]

function GymCard({ gym }: { gym: typeof gyms[0] }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "入門": return "bg-success text-success-foreground"
      case "基礎": return "bg-accent text-accent-foreground"
      case "中階": return "bg-warning text-warning-foreground"
      case "進階": return "bg-destructive text-destructive-foreground"
      default: return "bg-secondary text-secondary-foreground"
    }
  }

  const getStatusDisplay = () => {
    if (gym.locked) {
      return {
        icon: <Lock className="h-6 w-6" />,
        text: "未解鎖",
        color: "text-muted-foreground"
      }
    }
    if (gym.status === "completed") {
      return {
        icon: <CheckCircle2 className="h-6 w-6" />,
        text: "已完成",
        color: "text-success"
      }
    }
    return {
      icon: <Trophy className="h-6 w-6" />,
      text: "可挑戰",
      color: "text-primary"
    }
  }

  const statusDisplay = getStatusDisplay()

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-lg ${gym.locked ? "opacity-60" : ""}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg text-4xl ${
            gym.locked ? "bg-muted" : "bg-gradient-to-br from-primary/20 to-secondary/20"
          }`}>
            {gym.locked ? "🔒" : gym.badgeIcon}
          </div>
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{gym.unit}</Badge>
              <Badge className={getDifficultyColor(gym.difficulty)}>
                {gym.difficulty}
              </Badge>
              <Badge variant="secondary" className={`gap-1 ${statusDisplay.color}`}>
                {statusDisplay.icon}
                {statusDisplay.text}
              </Badge>
            </div>
            <CardTitle className="text-balance">{gym.title}</CardTitle>
            <CardDescription className="mt-2">
              {gym.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Prerequisites */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <h4 className="mb-2 flex items-center gap-2 font-semibold text-sm">
            <BookOpen className="h-4 w-4 text-primary" />
            挑戰前準備
          </h4>
          <ul className="space-y-1.5">
            {gym.prerequisites.map((prereq, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{prereq}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Challenge Modes */}
        {!gym.locked && gym.challenges && gym.challenges.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">選擇挑戰模式</h4>
            <div className="grid gap-2 md:grid-cols-2">
              {gym.challenges.map((challenge) => (
                <Dialog key={challenge.id}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-auto flex-col items-start gap-2 p-4 text-left"
                      disabled={gym.status === "completed"}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                          {challenge.type === "速戰速決" ? (
                            <Zap className="h-4 w-4 text-accent" />
                          ) : (
                            <Code className="h-4 w-4 text-primary" />
                          )}
                          <span className="font-semibold">{challenge.type}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          +{challenge.xpReward} XP
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {challenge.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        限時 {challenge.timeLimit}
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] overflow-y-auto max-w-3xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {challenge.type === "速戰速決" ? (
                          <Zap className="h-5 w-5 text-accent" />
                        ) : (
                          <Code className="h-5 w-5 text-primary" />
                        )}
                        {challenge.title}
                      </DialogTitle>
                      <DialogDescription>
                        {gym.title} - {challenge.type}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Challenge Info */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="mb-2 font-semibold text-sm">挑戰特色</h4>
                              <ul className="space-y-1.5">
                                {challenge.features.map((feature, index) => (
                                  <li key={index} className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-success" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between rounded-lg border p-3">
                                <span className="text-sm text-muted-foreground">完成期限</span>
                                <span className="font-semibold flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {challenge.timeLimit}
                                </span>
                              </div>
                              <div className="flex items-center justify-between rounded-lg border p-3">
                                <span className="text-sm text-muted-foreground">獲得獎勵</span>
                                <span className="font-semibold flex items-center gap-1">
                                  <Award className="h-4 w-4 text-primary" />
                                  +{challenge.xpReward} XP
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Question */}
                      {challenge.question && (
                        <div>
                          <h4 className="mb-3 flex items-center gap-2 font-semibold">
                            <Target className="h-5 w-5 text-primary" />
                            題目內容
                          </h4>
                          <Card>
                            <CardContent className="p-4">
                              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                                {challenge.question}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {/* Upload Section */}
                      <div>
                        <h4 className="mb-3 flex items-center gap-2 font-semibold">
                          <Upload className="h-5 w-5 text-primary" />
                          提交作業
                        </h4>
                        <Card>
                          <CardContent className="p-6"><ChallengeUpload challenge={challenge} /></CardContent>
                        </Card>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <Button
                          className="flex-1 gap-2"
                          size="lg"
                          onClick={async () => {
                            const imageUrl = (document.querySelector(`#picture-preview-${challenge.id}`) as HTMLImageElement)?.src;
                            if (!imageUrl) {
                              toast.error("請先上傳圖片再提交作業。");
                              return;
                            }
                            try {
                              const res = await fetch('/api/submissions', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ challengeId: challenge.title, imageUrl }),
                              });
                              if (!res.ok) throw new Error("提交失敗");
                              toast.success("作業提交成功！");
                            } catch (e) {
                              toast.error("提交過程中發生錯誤。");
                            }
                          }}>
                          <Upload className="h-4 w-4" /> 提交作業
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                          <Link href="/challenges">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            查看歷程
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ChallengeUpload({ challenge }: { challenge: any }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
      setUploadedImageUrl(null) // 清除舊的預覽
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("請先選擇一個圖片檔案。")
      return
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset || cloudName === '您的CloudinaryCloudName') {
      toast.error("Cloudinary 設定不正確，請檢查 .env.local 檔案。")
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("upload_preset", uploadPreset)

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error("圖片上傳失敗")
      }

      const data = await response.json()
      setUploadedImageUrl(data.secure_url) // 關鍵步驟：儲存回傳的圖片 URL
      toast.success("圖片上傳成功！")
    } catch (error: any) {
      toast.error(error.message || "上傳過程中發生錯誤。")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="picture">選擇圖片</Label>
        <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      </div>
      {selectedFile && <p className="text-sm text-muted-foreground">已選擇: {selectedFile.name}</p>}
      <Button onClick={handleUpload} disabled={uploading || !selectedFile}>
        {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 上傳中...</> : "上傳圖片"}
      </Button>
      {uploadedImageUrl && (
        <div className="mt-4 rounded border p-4">
          <h4 className="mb-2 font-semibold">上傳結果預覽：</h4>
          <img id={`picture-preview-${challenge.id}`} src={uploadedImageUrl} alt="Uploaded preview" className="max-w-full rounded-md" />
        </div>
      )}
    </div>
  )
}

export default function MapPage() {
  const completedGyms = gyms.filter(g => g.status === "completed").length
  const totalGyms = gyms.length
  const progress = (completedGyms / totalGyms) * 100

  return (
    <MainLayout isLoggedIn={true}>
      <div className="flex flex-col">
        {/* Header Section */}
        <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
          <div className="container mx-auto px-6 py-16">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Map className="h-8 w-8 text-primary" />
                <Badge className="bg-primary text-primary-foreground">道館挑戰</Badge>
              </div>
              <h1 className="mb-4 text-5xl font-bold text-balance">挑戰道館</h1>
              <p className="text-xl text-muted-foreground text-pretty">
                完成道館挑戰，獲得徽章與技能評級，成為架構設計大師
              </p>
            </div>
          </div>
        </section>

        {/* Progress Overview */}
        <section className="container mx-auto px-6 py-8">
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">挑戰進度</h3>
                      <p className="text-sm text-muted-foreground">
                        已完成 {completedGyms} / {totalGyms} 道館
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">{Math.round(progress)}%</div>
                    </div>
                  </div>
                  <ColorfulProgress value={progress} className="h-4" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border bg-muted/50 p-4 text-center">
                    <Trophy className="mx-auto mb-2 h-8 w-8 text-primary" />
                    <div className="text-2xl font-bold">{completedGyms}</div>
                    <div className="text-xs text-muted-foreground">徽章收集</div>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-4 text-center">
                    <Zap className="mx-auto mb-2 h-8 w-8 text-accent" />
                    <div className="text-2xl font-bold">{completedGyms * 400}</div>
                    <div className="text-xs text-muted-foreground">總獲得 XP</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Gyms List */}
        <section className="container mx-auto px-6 pb-12">
          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-bold">所有道館</h2>
            <p className="text-muted-foreground">
              選擇適合你的挑戰模式，開始你的學習之旅
            </p>
          </div>
          <div className="space-y-6">
            {gyms.map((gym) => (
              <GymCard key={gym.id} gym={gym} />
            ))}
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-muted/50">
          <div className="container mx-auto px-6 py-12">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent" />
                    速戰速決模式
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    適合快速驗證概念理解的學習者
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>馬上鍛鍊概念，及早獲得回饋</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>不需要實作程式碼</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>限時 3 天內完成</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    實戰演練模式
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    適合想要深入掌握技能的學習者
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>深刻鍛鍊內化思路</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>熟悉概念動手思考</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>1對1 Code Review 掃除盲點</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>限時 14 天內完成</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </MainLayout>
  )
}
