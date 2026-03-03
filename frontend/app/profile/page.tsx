"use client"
import { MainLayout } from "@/components/main-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getLevelInfo, readCombinedXp, listenXpUpdates, formatXp } from '@/lib/level-utils'
import { useEffect as useRovEffect, useState as useRovState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Footer } from "@/components/footer"
import { Mail, Calendar, MapPin, Github, Award, Trophy, Lock, Unlock, Download, CheckCircle2, Star, TrendingUp, User } from 'lucide-react'

// Mock user data
const userData = {
  name: "水球君",
  email: "waterball@example.com",
  studentId: "202412345",
  occupation: "軟體工程師",
  level: 5,
  completedGyms: 6,
  birthday: "1990-01-01",
  gender: "男",
  location: "台灣",
  githubUrl: "https://github.com/waterball",
  discordConnected: true,
  githubConnected: true,
  avatar: "/placeholder.svg?key=hg920",
}

const badges = [
  { id: 1, name: "設計模式入門", unlocked: true, chapter: "第一章", image: "/placeholder.svg?key=b1" },
  { id: 2, name: "創建型模式", unlocked: true, chapter: "第二章", image: "/placeholder.svg?key=b2" },
  { id: 3, name: "結構型模式", unlocked: true, chapter: "第三章", image: "/placeholder.svg?key=b3" },
  { id: 4, name: "行為型模式", unlocked: true, chapter: "第四章", image: "/placeholder.svg?key=b4" },
  { id: 5, name: "領域設計模式", unlocked: true, chapter: "第五章", image: "/placeholder.svg?key=b5" },
  { id: 6, "name": "重構設計", "unlocked": true, "chapter": "第六章", "image": "/placeholder.svg?key=b6" },
  { id: 7, name: "BDD 實踐", unlocked: false, chapter: "第七章", image: "/placeholder.svg?key=b7" },
  { id: 8, name: "AI 輔助開發", unlocked: false, chapter: "第八章", image: "/placeholder.svg?key=b8" },
  { id: 9, name: "測試驅動開發", unlocked: false, chapter: "第九章", image: "/placeholder.svg?key=b9" },
  { id: 10, name: "持續整合", unlocked: false, chapter: "第十章", image: "/placeholder.svg?key=b10" },
  { id: 11, name: "DevOps 實踐", unlocked: false, chapter: "第十一章", image: "/placeholder.svg?key=b11" },
  { id: 12, name: "微服務架構", unlocked: false, chapter: "第十二章", image: "/placeholder.svg?key=b12" },
  { id: 13, name: "前端部署", unlocked: false, chapter: "第十三章", image: "/placeholder.svg?key=b13" },
  { id: 14, name: "效能監控", unlocked: false, chapter: "第十四章", image: "/placeholder.svg?key=b14" },
  { id: 15, name: "安全防護設計", unlocked: false, chapter: "第十五章", image: "/placeholder.svg?key=b15" },
  { id: 16, name: "資料庫設計", unlocked: false, chapter: "第十六章", image: "/placeholder.svg?key=b16" },
  { id: 17, name: "API 設計", unlocked: false, chapter: "第十七章", image: "/placeholder.svg?key=b17" },
  { id: 18, name: "前端測試", unlocked: false, chapter: "第十八章", image: "/placeholder.svg?key=b18" },
  { id: 19, name: "後端測試", unlocked: false, chapter: "第十九章", image: "/placeholder.svg?key=b19" },
  { id: 20, name: "最終試煉", unlocked: false, chapter: "第二十章", image: "/placeholder.svg?key=b20" },
]

const skillRatings = [
  { skill: "需求結構化分析", rating: "B+", level: 17, progress: 75 },
  { skill: "區分結構與行為", rating: "A-", level: 19, progress: 85 },
  { skill: "抽象/萃取能力", rating: "B", level: 16, progress: 70 },
  { skill: "建立 Well-Defined Context", rating: "B+", level: 17, progress: 75 },
  { skill: "熟悉設計模式的 Form", rating: "A", level: 20, progress: 90 },
  { skill: "游刃有餘的開發能力", rating: "B+", level: 17, progress: 75 },
]

const levelInfo = [
  { level: 1, cumulative: 0, required: 200 },
  { level: 2, cumulative: 200, required: 300 },
  { level: 3, cumulative: 500, required: 1000 },
  { level: 4, cumulative: 1500, required: 1500 },
  { level: 5, cumulative: 3000, required: 2000 },
  { level: 6, cumulative: 5000, required: 2000 },
  { level: 7, cumulative: 7000, required: 2000 },
  { level: 8, cumulative: 9000, required: 2000 },
  { level: 9, cumulative: 11000, required: 2000 },
  { level: 10, cumulative: 13000, required: 2000 },
]

import { useEffect, useState } from 'react'

type UserProfile = {
  id: number;
  name: string;
  email: string;
  studentId?: string;
  occupation?: string;
  level: number;
  exp: number;
  avatar?: string;
  birthday?: string;
  gender?: string;
  location?: string;
  provider?: string;
}

function getEntitlements(): string[] {
  try {
    const raw = localStorage.getItem('lp:entitlements')
    const list = raw ? (JSON.parse(raw) as string[]) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function OrderHistory() {
  const [list, setList] = useState<string[]>([])
  useEffect(() => {
    setList(getEntitlements())
  }, [])
  if (!list.length) return (
    <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">目前尚無訂單紀錄</div>
  )
  const courseTitle: Record<string, string> = {
    'ai-bdd': 'AI x BDD：規格驅動全自動開發術',
    'software-design-patterns': '軟體設計模式精通之旅'
  }
  return (
    <div className="space-y-3">
      {list.map((slug) => (
        <div key={slug} className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <div className="font-semibold">{courseTitle[slug] || slug}</div>
            <div className="text-xs text-muted-foreground">已購買課程</div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={`/course/${slug}`}>前往課程</a>
          </Button>
        </div>
      ))}
    </div>
  )
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', occupation: '', birthday: '', gender: '', location: '' })
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
  const [pwdMsg, setPwdMsg] = useState<string | null>(null)
  
  useEffect(() => {
    let active = true
    fetch('/api/users/me', { cache: 'no-store' })
      .then(async res => {
        const data = await res.json()
        if (!active) return
        if (res.ok) {
          setUser(data)
          setForm({
            name: data.name || '',
            occupation: data.occupation || '',
            birthday: data.birthday ? String(data.birthday).split('T')[0] : '',
            gender: data.gender || '',
            location: data.location || '',
          })
        }
        else setError(data?.error || 'Unauthorized')
      })
      .catch(e => setError(String(e)))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  async function save() {
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Update failed')
      setUser(data)
      toast.success('已變更成功')
    } catch (e:any) {
      setError(String(e?.message || e))
      toast.error(String(e?.message || '更新失敗'))
    }
  }

  if (loading) return <MainLayout><div className="p-6">載入中...</div></MainLayout>
  if (error || !user) return <MainLayout><div className="p-6 text-destructive">{error || 'Unauthorized'}</div></MainLayout>

  return (
    <MainLayout isLoggedIn={true}>
      <div className="flex flex-col">
        {/* Profile Header */}
        <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
          <div className="container mx-auto px-6 py-12">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-3xl">{(user.name || 'U')[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <div className="mb-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  {user.studentId && (
                    <Badge className="bg-primary text-primary-foreground">
                      #{user.studentId}
                    </Badge>
                  )}
                </div>
                <p className="mb-4 text-lg text-muted-foreground">{user.occupation || '尚未設定職業'}</p>
                <div className="flex flex-wrap items-center justify-center gap-6 md:justify-start">
                 {user.provider && (
                   <div className="text-center">
                     <div className="text-sm text-muted-foreground">登入來源</div>
                     <div className="text-sm font-medium">{user.provider}</div>
                   </div>
                 )}
                  <div className="text-center">
                    {(() => {
                      const combined = readCombinedXp(user.exp)
                      const info = getLevelInfo(combined)
                      return (
                        <>
                          <div className="text-2xl font-bold text-primary">等級 {info.level}</div>
                          <div className="text-sm text-muted-foreground">距離下一級：{info.nextLevelStartXp !== null ? `還差 ${formatXp(info.remainingToNext || 0)} XP` : '已達最高等級'}</div>
                        </>
                      )
                    })()}
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">{userData.completedGyms}/20</div> {/* This seems to be mock data */}
                    <div className="text-sm text-muted-foreground">突破道館數</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{formatXp(readCombinedXp(user.exp))}</div>
                    <div className="text-sm text-muted-foreground">總經驗值（含本次學習）</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Profile Content */}
        <section className="container mx-auto px-6 py-12">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic"><User className="mr-2 h-4 w-4" />基本資料</TabsTrigger>
              <TabsTrigger value="badges"><Award className="mr-2 h-4 w-4" />道館徽章</TabsTrigger>
              <TabsTrigger value="skills"><Star className="mr-2 h-4 w-4" />技能評級</TabsTrigger>
              <TabsTrigger value="certificates"><Trophy className="mr-2 h-4 w-4" />證書</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>個人資料</CardTitle>
                  <CardDescription>管理你的帳戶資料與偏好設定</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">暱稱</Label>
                      <Input id="name" value={form.name} onChange={handleFormChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">職業</Label>
                      <Input id="occupation" value={form.occupation} onChange={handleFormChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex gap-2">
                        <Mail className="mt-2.5 h-5 w-5 text-muted-foreground" />
                        <Input id="email" type="email" value={user.email || ''} disabled />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthday">生日</Label>
                      <div className="flex gap-2">
                        <Calendar className="mt-2.5 h-5 w-5 text-muted-foreground" />
                        <Input id="birthday" type="date" value={form.birthday} onChange={handleFormChange} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">性別</Label>
                      <Input id="gender" value={form.gender} onChange={handleFormChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">地區</Label>
                      <div className="flex gap-2">
                        <MapPin className="mt-2.5 h-5 w-5 text-muted-foreground" />
                        <Input id="location" value={form.location} onChange={handleFormChange} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-6">
                    <h3 className="font-semibold">綁定帳號</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <Github className="h-5 w-5" />
                          <div>
                            <div className="font-medium">GitHub</div>
                            <div className="text-sm text-muted-foreground">
                              {userData.githubConnected ? userData.githubUrl : "未綁定"}
                            </div>
                          </div>
                        </div>
                        <Button variant={userData.githubConnected ? "destructive" : "default"} size="sm">
                          {userData.githubConnected ? "解除綁定" : "綁定"}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                          </svg>
                          <div>
                            <div className="font-medium">Discord</div>
                            <div className="text-sm text-muted-foreground">
                              {userData.discordConnected ? "已綁定" : "未綁定"}
                            </div>
                          </div>
                        </div>
                        <Button variant={userData.discordConnected ? "destructive" : "default"} size="sm">
                          {userData.discordConnected ? "解除綁定" : "綁定"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-6">
                    <h3 className="font-semibold">訂單紀錄</h3>
                    <OrderHistory />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline">取消</Button>
                    <Button onClick={save}>儲存變更</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Badges Tab */}
            <TabsContent value="badges" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>道館徽章牆</CardTitle>
                  <CardDescription>完成道館挑戰以解鎖徽章，收集全部 20 枚徽章即可獲得神秘獎勵！</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium">
                        收集進度
                      </span>
                      <span className="text-muted-foreground">
                        {badges.filter(b => b.unlocked).length} / {badges.length}
                      </span>
                    </div>
                    <Progress 
                      value={(badges.filter(b => b.unlocked).length / badges.length) * 100} 
                      className="h-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
                    {badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="group relative flex flex-col items-center gap-2"
                      >
                        <div
                          className={`relative flex h-20 w-20 items-center justify-center rounded-full border-4 transition-all ${
                            badge.unlocked
                              ? "border-accent bg-gradient-to-br from-accent/20 to-accent/10 shadow-lg hover:scale-110"
                              : "border-muted bg-muted/50 grayscale"
                          }`}
                        >
                          {badge.unlocked ? (
                            <Trophy className="h-8 w-8 text-accent" />
                          ) : (
                            <Lock className="h-6 w-6 text-muted-foreground" />
                          )}
                          {badge.unlocked && (
                            <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-success">
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium line-clamp-2">{badge.name}</div>
                          <div className="text-xs text-muted-foreground">{badge.chapter}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>技能評級系統</CardTitle>
                  <CardDescription>共 34 級評級，從 F- 到 ACE，由水球潘老師親自評鑑。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {skillRatings.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <Star className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">{skill.skill}</div>
                            <div className="text-sm text-muted-foreground">Level {skill.level}/34</div>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="text-lg font-bold"
                        >
                          {skill.rating}
                        </Badge>
                      </div>
                      <Progress value={skill.progress} className="h-2" />
                    </div>
                  ))}

                  <div className="mt-8 rounded-lg border bg-muted/50 p-6">
                    <h3 className="mb-4 font-semibold">等級系統說明</h3>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-5 gap-2">
                        <Badge variant="outline">F-, F, F+</Badge>
                        <Badge variant="outline">E-, E, E+</Badge>
                        <Badge variant="outline">D-, D, D+</Badge>
                        <Badge variant="outline">C-, C, C+</Badge>
                        <Badge variant="outline">B-, B, B+</Badge>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        <Badge variant="outline">A-, A, A+</Badge>
                        <Badge variant="outline">AA-, AA, AA+</Badge>
                        <Badge variant="outline">AAA-, AAA, AAA+</Badge>
                        <Badge variant="outline">S-, S, S+</Badge>
                        <Badge variant="outline">SS-, SS, SS+</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <Badge variant="outline">SSS-, SSS, SSS+</Badge>
                        <Badge variant="default" className="bg-accent text-accent-foreground">ACE</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-lg border bg-card p-6">
                    <h3 className="mb-4 font-semibold">等級與經驗值對照表</h3>
                    <div className="space-y-3">
                      {levelInfo.map((info) => (
                        <div key={info.level} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="w-16">Lv.{info.level}</Badge>
                            <span className="text-muted-foreground">
                              累積 {Number(info.cumulative ?? 0).toLocaleString()} XP
                            </span>
                          </div>
                          <span className="text-muted-foreground">
                            需 {Number(info.required ?? 0).toLocaleString()} XP
                          </span>
                        </div>
                      ))}
                      <div className="pt-2 text-xs text-muted-foreground">
                        * 11 級以上每級皆需 2,000 XP
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Certificates Tab */}
            <TabsContent value="certificates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>課程證書</CardTitle>
                  <CardDescription>解鎖所有道館徽章後，即可獲得該課程證書。</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Certificate Card */}
                    <div className="relative overflow-hidden rounded-xl border-2 border-muted bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/10 p-8">
                      <div className="absolute right-0 top-0 opacity-10">
                        <Trophy className="h-64 w-64 text-primary" />
                      </div>
                      <div className="relative space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                            <Award className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">軟體設計模式精通之旅</h3>
                            <p className="text-muted-foreground">Software Design Patterns Master Certificate</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">完成進度</span>
                            <span className="text-muted-foreground">6 / 20 道館</span>
                          </div>
                          <Progress value={30} className="h-3" />
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Unlock className="h-4 w-4" />
                          <span>完成剩餘 14 個道館以解鎖證書</span>
                        </div>

                        <div className="flex gap-3">
                          <Button disabled className="gap-2">
                            <Download className="h-4 w-4" />
                            下載證書
                          </Button>
                          <Button variant="secondary" disabled>分享證書
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* AI x BDD Certificate */}
                    <div className="relative overflow-hidden rounded-xl border-2 border-muted bg-gradient-to-br from-secondary/10 via-accent/5 to-primary/10 p-8 opacity-60">
                      <div className="absolute right-0 top-0 opacity-10">
                        <Trophy className="h-64 w-64 text-secondary" />
                      </div>
                      <div className="relative space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-primary">
                            <Lock className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">AI x BDD 開發證書</h3>
                            <p className="text-muted-foreground">AI x BDD Development Certificate</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">完成進度</span>
                            <span className="text-muted-foreground">0 / 15 道館</span>
                          </div>
                          <Progress value={0} className="h-3" />
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Lock className="h-4 w-4" />
                          <span>尚未解鎖此課程</span>
                        </div>
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className="rounded-lg border bg-muted/50 p-6">
                      <div className="flex gap-4">
                        <TrendingUp className="h-6 w-6 shrink-0 text-primary" />
                        <div className="space-y-2">
                          <h4 className="font-semibold">如何獲得證書？</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>1. 完成課程中所有影片單元的學習</li>
                            <li>2. 解鎖所有道館挑戰並獲得徽章</li>
                            <li>3. 等待教師對作業的評鑑與回饋</li>
                            <li>4. 系統將自動核發你的專屬課程證書</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        <Footer />
      </div>
    </MainLayout>
  )
}
