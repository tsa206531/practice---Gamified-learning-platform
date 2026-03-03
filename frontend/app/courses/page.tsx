import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"
import { BookOpen, Clock, Trophy, Star, Users, Play } from 'lucide-react'
import { ClientCourseActions } from './ClientCourseActions'
import Link from "next/link"

// Define the Course type to ensure strong typing across the page
const imageBySlug: Record<string, string> = {
  'software-design-patterns': 'https://world.waterballsa.tw/world/courses/course_0.png',
  'ai-bdd': 'https://world.waterballsa.tw/world/courses/course_4.png',
}

interface Course {
  id: number
  slug: string
  title: string
  description: string
  image: string
  level: string
  duration: string
  students: number
  rating: number
  units: number
  badges: number
  price: string
  highlights: string[]
}

const demoCourses: Course[] = [
  {
    id: 1,
    slug: "software-design-patterns",
    title: "軟體設計模式精通之旅",
    description: "深入探索 23 種經典設計模式,從基礎到進階，掌握軟體架構的核心思維。透過實戰專案學習如何在真實場景中應用設計模式。",
    image: "https://world.waterballsa.tw/world/courses/course_0.png",
    level: "進階",
    duration: "40 小時",
    students: 1250,
    rating: 4.9,
    units: 20,
    badges: 8,
    price: "NT$ 5,990",
    highlights: [
      "23 種設計模式完整解析",
      "真實專案實戰演練",
      "8 個道館挑戰",
      "老師親自批改作業"
    ]
  },
  {
    id: 2,
    slug: "ai-bdd",
    title: "AI x BDD：規格驅動全自動開發術",
    description: "結合 AI 技術與行為驅動開發（BDD），學習如何撰寫高品質的需求規格，並利用 AI 工具加速開發流程。",
    image: "https://world.waterballsa.tw/world/courses/course_4.png",
    level: "中階",
    duration: "30 小時",
    students: 890,
    rating: 4.8,
    units: 15,
    badges: 6,
    price: "NT$ 4,990",
    highlights: [
      "BDD 完整方法論",
      "AI 輔助開發實戰",
      "6 個道館挑戰",
      "自動化測試技巧"
    ]
  }
]

export default async function CoursesPage() {
  let courses: Course[] = demoCourses
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/api/courses`, { cache: "no-store" })
    if (res.ok) {
      const raw = await res.json()
      if (Array.isArray(raw)) {
        courses = raw.map((c: any, idx: number): Course => ({
          id: typeof c.id === 'number' ? c.id : idx + 1,
          slug: typeof c.slug === 'string' && c.slug ? c.slug : (typeof c.title === 'string' ? c.title.toLowerCase().replace(/\s+/g, '-') : `course-${idx+1}`),
          title: typeof c.title === 'string' && c.title ? c.title : (typeof c.name === 'string' ? c.name : '未命名課程'),
          description: typeof c.description === 'string' ? c.description : '這門課程尚未提供描述。',
          image: imageBySlug[(typeof c.slug === 'string' && c.slug) ? c.slug : (typeof c.title === 'string' ? c.title.toLowerCase().replace(/\s+/g, '-') : '')] || (typeof c.image === 'string' && c.image ? c.image : '/placeholder.jpg'),
          level: typeof c.level === 'string' && c.level ? c.level : '入門',
          duration: typeof c.duration === 'string' && c.duration ? c.duration : '—',
          students: Number.isFinite(Number(c.students)) ? Number(c.students) : 0,
          rating: Number.isFinite(Number(c.rating)) ? Number(c.rating) : 5,
          units: Number.isFinite(Number(c.units)) ? Number(c.units) : 0,
          badges: Number.isFinite(Number(c.badges)) ? Number(c.badges) : 0,
          price: typeof c.price === 'string' && c.price ? c.price : 'NT$ —',
          highlights: Array.isArray(c.highlights) ? c.highlights.filter((h: any) => typeof h === 'string') : [],
        }))
      }
    }
  } catch (err) {
    // Fallback to demo data when API is unreachable or fails
    courses = demoCourses
  }
  return (
    <MainLayout isLoggedIn={false}>
      <div className="flex flex-col">
        {/* Header Section */}
        <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
          <div className="container mx-auto px-6 py-16">
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-4 bg-primary text-primary-foreground">線上課程</Badge>
              <h1 className="mb-4 text-5xl font-bold text-balance">探索我們的課程</h1>
              <p className="text-xl text-muted-foreground text-pretty">
                由水球潘老師親自設計的遊戲化學習課程，從基礎到進階，帶你精通軟體開發技能
              </p>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="container mx-auto px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            {courses.map((course) => (
              <Card key={course.id} className="flex flex-col overflow-hidden transition-all hover:shadow-xl">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <img
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                  <div className="absolute right-4 top-4">
                    <Badge className="bg-primary text-primary-foreground">{course.level}</Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-2xl text-balance">{course.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-6">
                  {/* Course Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{course.duration}</div>
                        <div className="text-xs text-muted-foreground">課程時長</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10">
                        <BookOpen className="h-4 w-4 text-secondary" />
                      </div>
                      <div>
                        <div className="font-medium">{course.units} 單元</div>
                        <div className="text-xs text-muted-foreground">學習單元</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                        <Trophy className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <div className="font-medium">{course.badges} 徽章</div>
                        <div className="text-xs text-muted-foreground">道館挑戰</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                        <Users className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <div className="font-medium">{Number(course.students ?? 0).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">學員人數</div>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(course.rating)
                              ? "fill-accent text-accent"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{course.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({Number(course.students ?? 0).toLocaleString()} 評價)
                    </span>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-2">
                    <div className="text-sm font-semibold">課程亮點</div>
                    <ul className="space-y-1.5">
                      {course.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">{course.price}</span>
                    <span className="text-sm text-muted-foreground line-through">NT$ 8,990</span>
                  </div>
                </CardContent>

                <CardFooter className="gap-3">
                  <ClientCourseActions slug={course.slug} />
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/50">
          <div className="container mx-auto px-6 py-16">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-balance">為什麼選擇我們的課程？</h2>
              <p className="text-lg text-muted-foreground text-pretty">
                完整的學習體驗，讓你從入門到精通
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">高品質內容</CardTitle>
                  <CardDescription>
                    精心製作的課程影片與教材
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                    <Trophy className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-lg">實戰導向</CardTitle>
                  <CardDescription>
                    真實專案演練與道館挑戰
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">老師親批</CardTitle>
                  <CardDescription>
                    水球潘老師親自批改作業
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                    <Star className="h-6 w-6 text-success" />
                  </div>
                  <CardTitle className="text-lg">終身存取</CardTitle>
                  <CardDescription>
                    一次購買，永久學習
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-16">
          <Card className="overflow-hidden bg-gradient-to-br from-primary to-secondary">
            <CardContent className="p-12 text-center text-white">
              <h2 className="mb-4 text-3xl font-bold text-balance">還不確定要選哪個課程？</h2>
              <p className="mb-6 text-lg text-white/90 text-pretty">
                試聽我們的免費課程內容，體驗遊戲化學習的樂趣
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" variant="secondary">
                  免費試聽
                </Button>
                <Button size="lg" variant="outline" className="border-white bg-white/10 text-white hover:bg-white/20">
                  聯絡我們
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <Footer />
      </div>
    </MainLayout>
  )
}
