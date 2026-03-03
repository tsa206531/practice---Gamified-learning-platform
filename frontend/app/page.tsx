import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"
import { ArrowRight, BookOpen, Trophy, Zap, Award, Users, Target } from 'lucide-react'
import Link from "next/link"

export default function HomePage() {
  return (
    <MainLayout isLoggedIn={false}>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
          <div className="container mx-auto px-6 py-24">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-4 bg-primary text-primary-foreground" variant="default">
                遊戲化學習平台
              </Badge>
              <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-balance md:text-6xl">
                透過遊戲化學習
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {' '}提升你的技能等級
                </span>
              </h1>
              <p className="mb-8 text-xl text-muted-foreground text-pretty leading-relaxed">
                挑戰道館、獲得徽章、累積經驗值，讓學習變得更有趣！
                跟著水球潘老師一起探索軟體設計的奧秘。
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" className="gap-2">
                  開始學習之旅
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/courses">瀏覽課程</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-balance">平台特色</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              結合 Notion、寶可夢道館與 Duolingo 的學習體驗
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>影片學習系統</CardTitle>
                <CardDescription>
                  觀看高品質的課程影片，追蹤學習進度，完成後獲得經驗值獎勵
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <Trophy className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>道館挑戰</CardTitle>
                <CardDescription>
                  完成大單元後挑戰道館，通過後獲得徽章並提升技能等級
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>經驗值系統</CardTitle>
                <CardDescription>
                  完成任務累積 XP，升級解鎖更多內容，享受成長的快感
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <Award className="h-6 w-6 text-success" />
                </div>
                <CardTitle>技能評級</CardTitle>
                <CardDescription>
                  從 F- 到 ACE 共 34 級，老師親自批改作業並給予評級
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <CardTitle>競爭排行榜</CardTitle>
                <CardDescription>
                  與其他學員競爭，查看學習排行榜和本週成長排行榜
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>任務系統</CardTitle>
                <CardDescription>
                  接受各種挑戰任務，完成後獲得額外獎勵和成就感
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Instructor Section */}
        <section className="bg-muted/50">
          <div className="container mx-auto px-6 py-20">
            <div className="mx-auto max-w-4xl">
              <div className="grid gap-12 md:grid-cols-2 md:items-center">
                <div>
                  <img
                    src="https://world.waterballsa.tw/blog/avatar.webp"
                    alt="水球潘老師"
                    className="rounded-2xl shadow-xl"
                  />
                </div>
                <div className="space-y-6">
                  <Badge className="bg-secondary text-secondary-foreground">講師介紹</Badge>
                  <h2 className="text-4xl font-bold text-balance">水球潘</h2>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    資深軟體架構師，擁有超過 15 年的業界經驗。專精於軟體設計模式、
                    領域驅動設計（DDD）以及行為驅動開發（BDD）。致力於將複雜的技術
                    概念轉化為易懂的教學內容，幫助學員掌握軟體開發的核心技能。
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <span>超過 10,000 名學員</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Trophy className="h-4 w-4 text-primary" />
                      </div>
                      <span>平均評分 4.9/5.0</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Award className="h-4 w-4 text-primary" />
                      </div>
                      <span>100+ 企業培訓經驗</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Links Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-balance">加入我們的社群</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              與其他學員交流、分享學習心得、獲取最新資訊
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Discord 社群
                </CardTitle>
                <CardDescription>
                  即時討論、問題解答、活動公告
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="https://discord.gg" target="_blank" rel="noopener noreferrer">
                    加入 Discord
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-secondary" />
                  學習部落格
                </CardTitle>
                <CardDescription>
                  技術文章、學習心得、產業趨勢
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/blog">閱讀文章</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-accent" />
                  購買課程
                </CardTitle>
                <CardDescription>
                  查看所有課程方案與優惠
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/courses">立即購買</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-primary to-secondary">
          <div className="container mx-auto px-6 py-20 text-center">
            <h2 className="mb-6 text-4xl font-bold text-white text-balance">
              準備好開始你的學習之旅了嗎？
            </h2>
            <p className="mb-8 text-xl text-white/90 text-pretty">
              立即註冊，免費試聽精選課程內容
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" variant="secondary" className="gap-2">
                免費試聽
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white bg-white/10 text-white hover:bg-white/20">
                了解更多
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </MainLayout>
  )
}
