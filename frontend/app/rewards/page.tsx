import { MainLayout } from "@/components/main-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Footer } from "@/components/footer"
import { Gift, Clock, CheckCircle2, Calendar, Zap, Trophy, Star, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Mock tasks data
const availableTasks = [
  {
    id: 1,
    title: "連續學習挑戰",
    description: "連續 7 天完成至少一個課程單元",
    reward: "500 XP + 機會卡 x1",
    difficulty: "簡單",
    deadline: "2024-12-31",
    requirements: [
      "每天至少完成一個影片單元",
      "連續 7 天不可中斷",
      "可累計計算觀看時間"
    ],
    estimatedTime: "7 天",
  },
  {
    id: 2,
    title: "設計模式精通",
    description: "完成 5 個設計模式相關的道館挑戰",
    reward: "1000 XP + 專屬徽章",
    difficulty: "中等",
    deadline: "2024-12-31",
    requirements: [
      "完成創建型模式道館",
      "完成結構型模式道館",
      "完成行為型模式道館",
      "完成進階設計模式道館",
      "完成架構設計道館"
    ],
    estimatedTime: "30 天",
  },
  {
    id: 3,
    title: "社群貢獻者",
    description: "在 Discord 社群中幫助 10 位學員解答問題",
    reward: "800 XP + 貢獻者稱號",
    difficulty: "簡單",
    deadline: "2024-12-31",
    requirements: [
      "在 Discord 社群中活躍",
      "回答至少 10 個技術問題",
      "獲得至少 20 個感謝回應"
    ],
    estimatedTime: "14 天",
  },
  {
    id: 4,
    title: "完美作業",
    description: "連續 3 個道館挑戰獲得 A 級以上評分",
    reward: "1500 XP + 卓越徽章",
    difficulty: "困難",
    deadline: "2024-12-31",
    requirements: [
      "道館挑戰評分達到 A- 或以上",
      "連續 3 個道館不可中斷",
      "程式碼品質達到標準"
    ],
    estimatedTime: "45 天",
  },
]

const inProgressTasks = [
  {
    id: 5,
    title: "影片馬拉松",
    description: "在一週內完成 20 個影片單元",
    reward: "600 XP",
    progress: 12,
    total: 20,
    deadline: "2024-12-20",
    daysLeft: 3,
    canExtend: true,
    extensionCards: 2,
    requirements: [
      "完成 20 個影片單元觀看",
      "每個影片需觀看至 100%",
      "一週內完成挑戰"
    ],
  },
]

const pastTasks = [
  {
    id: 6,
    title: "新手啟航",
    description: "完成第一個課程單元",
    reward: "200 XP",
    completed: true,
    completedDate: "2024-11-15",
    claimed: true,
  },
  {
    id: 7,
    title: "初試道館",
    description: "通過第一個道館挑戰",
    reward: "500 XP + 首勝徽章",
    completed: true,
    completedDate: "2024-11-20",
    claimed: true,
  },
  {
    id: 8,
    title: "速度學習",
    description: "在三天內完成 10 個影片單元",
    reward: "400 XP",
    completed: false,
    failedDate: "2024-11-25",
    claimed: false,
  },
  {
    id: 9,
    title: "週末衝刺",
    description: "週末兩天完成 5 個單元",
    reward: "300 XP",
    completed: true,
    completedDate: "2024-12-01",
    claimed: false,
  },
]

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "簡單":
      return "bg-success text-success-foreground"
    case "中等":
      return "bg-accent text-accent-foreground"
    case "困難":
      return "bg-warning text-warning-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export default function RewardsPage() {
  return (
    <MainLayout isLoggedIn={true}>
      <div className="flex flex-col">
        {/* Header Section */}
        <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
          <div className="container mx-auto px-6 py-16">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Gift className="h-8 w-8 text-primary" />
                <Badge className="bg-primary text-primary-foreground">挑戰任務</Badge>
              </div>
              <h1 className="mb-4 text-5xl font-bold text-balance">獎勵任務</h1>
              <p className="text-xl text-muted-foreground text-pretty">
                接受挑戰任務，完成後獲得額外經驗值與獎勵
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-6 py-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{availableTasks.length}</div>
                  <div className="text-sm text-muted-foreground">可接任務</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{inProgressTasks.length}</div>
                  <div className="text-sm text-muted-foreground">進行中</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <CheckCircle2 className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {pastTasks.filter(t => t.completed).length}
                  </div>
                  <div className="text-sm text-muted-foreground">已完成</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tasks Content */}
        <section className="container mx-auto px-6 pb-12">
          <Tabs defaultValue="available" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="available">可接任務</TabsTrigger>
              <TabsTrigger value="progress">進行中</TabsTrigger>
              <TabsTrigger value="past">過去任務</TabsTrigger>
            </TabsList>

            {/* Available Tasks Tab */}
            <TabsContent value="available" className="space-y-4">
              <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-primary" />
                  <div className="text-sm">
                    <p className="font-semibold text-primary">一次只能進行一個任務</p>
                    <p className="text-muted-foreground">請先完成或放棄當前任務後，才能接受新任務</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {availableTasks.map((task) => (
                  <Card key={task.id} className="flex flex-col transition-all hover:shadow-lg">
                    <CardHeader>
                      <div className="mb-2 flex items-start justify-between">
                        <Badge className={getDifficultyColor(task.difficulty)}>
                          {task.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {task.estimatedTime}
                        </div>
                      </div>
                      <CardTitle className="text-balance">{task.title}</CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                      <div className="rounded-lg bg-accent/10 p-3">
                        <div className="flex items-center gap-2 font-semibold text-accent">
                          <Trophy className="h-5 w-5" />
                          獎勵：{task.reward}
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full" size="sm">
                            查看詳情
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{task.title}</DialogTitle>
                            <DialogDescription>{task.description}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="mb-2 font-semibold">達成條件</h4>
                              <ul className="space-y-2">
                                {task.requirements.map((req, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm">
                                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                    <span>{req}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="rounded-lg bg-muted p-3">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground">難度</div>
                                  <div className="font-semibold">{task.difficulty}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">預計時間</div>
                                  <div className="font-semibold">{task.estimatedTime}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">截止日期</div>
                                  <div className="font-semibold">{task.deadline}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">獎勵</div>
                                  <div className="font-semibold">{task.reward}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        disabled={inProgressTasks.length > 0}
                      >
                        {inProgressTasks.length > 0 ? "已有進行中任務" : "接受任務"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* In Progress Tasks Tab */}
            <TabsContent value="progress" className="space-y-4">
              {inProgressTasks.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Clock className="mb-4 h-16 w-16 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">目前沒有進行中的任務</h3>
                    <p className="text-muted-foreground">前往可接任務頁面選擇一個挑戰吧！</p>
                  </CardContent>
                </Card>
              ) : (
                inProgressTasks.map((task) => (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="mb-2 flex items-center justify-between">
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          進行中
                        </Badge>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">剩餘 {task.daysLeft} 天</span>
                        </div>
                      </div>
                      <CardTitle className="text-balance">{task.title}</CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium">完成進度</span>
                          <span className="text-muted-foreground">
                            {task.progress} / {task.total}
                          </span>
                        </div>
                        <Progress value={(task.progress / task.total) * 100} className="h-3" />
                      </div>

                      <div className="rounded-lg bg-accent/10 p-4">
                        <div className="mb-3 flex items-center gap-2 font-semibold">
                          <Trophy className="h-5 w-5 text-accent" />
                          <span>獎勵：{task.reward}</span>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              查看達成條件
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>達成條件</DialogTitle>
                            </DialogHeader>
                            <ul className="space-y-2">
                              {task.requirements.map((req, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {task.canExtend && (
                        <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
                          <div className="mb-3 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 shrink-0 text-warning" />
                            <div>
                              <p className="font-semibold text-warning">需要更多時間？</p>
                              <p className="text-sm text-muted-foreground">
                                使用機會卡延長 15 天期限（剩餘 {task.extensionCards} 張）
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="w-full">
                            延長期限（消耗 1 張機會卡）
                          </Button>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="gap-3">
                      <Button variant="outline" className="flex-1">
                        放棄任務
                      </Button>
                      <Button className="flex-1" disabled={task.progress < task.total}>
                        {task.progress >= task.total ? "完成任務" : "繼續挑戰"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Past Tasks Tab */}
            <TabsContent value="past" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {pastTasks.map((task) => (
                  <Card 
                    key={task.id} 
                    className={`transition-all ${
                      !task.completed ? "opacity-60" : ""
                    }`}
                  >
                    <CardHeader>
                      <div className="mb-2">
                        <Badge 
                          variant={task.completed ? "default" : "destructive"}
                          className={task.completed ? "bg-success text-success-foreground" : ""}
                        >
                          {task.completed ? (
                            <>
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              已完成
                            </>
                          ) : (
                            "未完成"
                          )}
                        </Badge>
                      </div>
                      <CardTitle className="text-balance">{task.title}</CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="rounded-lg bg-muted p-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {task.completed 
                            ? `完成於 ${task.completedDate}`
                            : `失敗於 ${task.failedDate}`
                          }
                        </div>
                      </div>
                      {task.completed && (
                        <div className="flex items-center gap-2 rounded-lg bg-accent/10 p-3">
                          <Zap className="h-5 w-5 text-accent" />
                          <span className="font-semibold">獎勵：{task.reward}</span>
                        </div>
                      )}
                    </CardContent>
                    {task.completed && !task.claimed && (
                      <CardFooter>
                        <Button className="w-full gap-2">
                          <Star className="h-4 w-4" />
                          領取獎勵
                        </Button>
                      </CardFooter>
                    )}
                    {task.claimed && (
                      <CardFooter>
                        <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-success/10 py-2 text-sm font-medium text-success">
                          <CheckCircle2 className="h-4 w-4" />
                          已領取獎勵
                        </div>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <Footer />
      </div>
    </MainLayout>
  )
}
