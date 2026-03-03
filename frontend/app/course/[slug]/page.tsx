"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import YouTube from 'react-youtube'
import { toast } from 'sonner'
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ColorfulProgress } from "@/components/colorful-progress"
import { ChevronRight, ChevronDown, Play, Lock, CheckCircle2, Clock } from 'lucide-react'
import { useParams } from 'next/navigation'

// --- Config: per course videos ---
const videoUrls = {
  "software-design-patterns": [
    "https://www.youtube.com/embed/W09vydJH6jo",
    "https://www.youtube.com/embed/VeyXKPQaEpw?si=ZmYVSm0kOuLqm3Cb",
    "https://www.youtube.com/embed/3GxftuDUBXM?si=DfCA7rkJjVEA3xiw",
    "https://www.youtube.com/embed/RMiSH7MSFNA?si=jXElAcLJqWrPLjC9",
    "https://www.youtube.com/embed/yOe-uywb2qs?si=fQRYE9TnkNIt1f5-",
  ],
  "ai-bdd": [
    "https://www.youtube.com/embed/UslcIlL-1xo?si=acO-GGvPXrP_pi1s",
    "https://www.youtube.com/embed/W09vydJH6jo",
    "https://www.youtube.com/embed/VeyXKPQaEpw?si=ZmYVSm0kOuLqm3Cb",
    "https://www.youtube.com/embed/3GxftuDUBXM?si=DfCA7rkJjVEA3xiw",
    "https://www.youtube.com/embed/RMiSH7MSFNA?si=jXElAcLJqWrPLjC9",
  ],
} as const

// --- Mock course content for the sidebar ---
const courseContent = {
  "software-design-patterns": {
    requiresPurchase: false,
    title: "軟體設計模式精通之旅",
    totalUnits: 20,
    completedUnits: 3,
    units: [
      {
        id: 1,
        title: "單元一：課程介紹 & 試聽",
        lessons: [
          { id: "1-1", title: "課程介紹：這門課手把手帶你成為架構設計的高手", duration: "15:32", completed: true, locked: false },
          { id: "1-2", title: "你該知道：在 AI 的時代下，只會下 prompt 絕對寫不出好 Code", duration: "12:45", completed: true, locked: false },
          { id: "1-3", title: "課程試聽：架構師該學的 C.A. 模式六大要素及模式思維", duration: "28:16", completed: true, locked: false }
        ]
      },
      {
        id: 2,
        title: "單元二：副本零：冒險者指引",
        lessons: [
          { id: "2-1", title: "平台使用手冊", duration: "10:24", completed: false, locked: false }
        ]
      },
      {
        id: 3,
        title: "單元三：副本一：行雲流水的設計思路",
        lessons: [
          { id: "3-1", title: "設計的關鍵是：把無形變有形", duration: "35:18", completed: false, locked: false }
        ]
      }
    ]
  },
  "ai-bdd": {
    requiresPurchase: true,
    title: "AI x BDD：規格驅動全自動開發術",
    totalUnits: 15,
    completedUnits: 2,
    units: [
      {
        id: 1,
        title: "單元一：規格驅動開發的前提",
        lessons: [
          { id: "1-1", title: "課程拆解：規格驅動開發三維大展開", duration: "18:45", completed: true, locked: false },
          { id: "1-2", title: "不釐清規格，AI 開發成效如何？", duration: "22:30", completed: true, locked: false }
        ]
      },
      {
        id: 2,
        title: "單元二：100% 全自動化開發的脈絡：規格的光譜",
        lessons: [
          { id: "2-1", title: "領域驅動設計：沒有「抽象」就沒法「協作」", duration: "31:12", completed: false, locked: false }
        ]
      },
      {
        id: 3,
        title: "單元三：70% 自動化：測試驅動開發",
        lessons: [
          { id: "3-1", title: "測試驅動開發 (TDD)：概念及 SOP", duration: "25:48", completed: false, locked: false },
          { id: "3-2", title: "寫 Gherkin Language：SOP", duration: "20:15", completed: false, locked: false }
        ]
      }
    ]
  }
}

type LessonState = 'notWatched' | 'watched' | 'claimed'

function extractYouTubeVideoId(url: string): string {
  try {
    const u = new URL(url)
    const host = u.hostname
    if (host.includes('youtu.be')) {
      return u.pathname.slice(1).split('?')[0]
    }
    if (u.pathname.startsWith('/embed/')) {
      return u.pathname.split('/embed/')[1].split('?')[0]
    }
    if (u.pathname === '/watch') {
      return u.searchParams.get('v') || ''
    }
  } catch { /* ignore */ }
  return ''
}

export default function CoursePage() {
  const params = useParams()
  const slug = params.slug as string
  const course = courseContent[slug as keyof typeof courseContent]

  const STORAGE_KEY = `lp:lessonStates:${slug}`
  const XP_KEY = `lp:xp_total`

  const [expandedUnits, setExpandedUnits] = useState<number[]>([1])
  const [currentLesson, setCurrentLesson] = useState(course?.units[0].lessons[0].id as string)
  const [lessonStates, setLessonStates] = useState<Record<string, LessonState>>({})
  const [claiming, setClaiming] = useState<string | null>(null)
  const [xp, setXp] = useState<number>(0)
  const [entitled, setEntitled] = useState<boolean>(false)

  // Per-lesson video progress (MVP) UI state
  const [watchedSeconds, setWatchedSeconds] = useState<number>(0)
  const [durationSeconds, setDurationSeconds] = useState<number>(0)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)
  const playerRef = useRef<any>(null)
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)

  // Build a flat index for lesson id -> video index
  const lessonIndexMap = useMemo(() => {
    const map: Record<string, number> = {}
    let idx = 0
    for (const unit of course.units) {
      for (const l of unit.lessons) {
        map[l.id] = idx++
      }
    }
    return map
  }, [course])

  // Initialize lesson states from storage or defaults
  useEffect(() => {
    const defaults: Record<string, LessonState> = {}
    for (const unit of course.units) {
      for (const l of unit.lessons) {
        defaults[l.id] = l.completed ? 'watched' : 'notWatched'
      }
    }
    try {
      if (typeof window !== 'undefined') {
        const raw = sessionStorage.getItem(STORAGE_KEY)
        const xpRaw = sessionStorage.getItem(XP_KEY)
        // load entitlements
        const entRaw = localStorage.getItem('lp:entitlements')
        const ent = entRaw ? (JSON.parse(entRaw) as string[]) : []
        setEntitled(Array.isArray(ent) && ent.includes(slug))
        if (raw) {
          const parsed = JSON.parse(raw) as Record<string, LessonState>
          setLessonStates({ ...defaults, ...parsed })
        } else {
          setLessonStates(defaults)
        }
        if (xpRaw) setXp(Number(xpRaw) || 0)
      } else {
        setLessonStates(defaults)
      }
    } catch {
      setLessonStates(defaults)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  // Persist lesson states
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && Object.keys(lessonStates).length) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lessonStates))
      }
    } catch { /* ignore */ }
  }, [STORAGE_KEY, lessonStates])

  // Persist XP
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(XP_KEY, String(xp))
      }
    } catch { /* ignore */ }
  }, [XP_KEY, xp])

  const toggleUnit = (unitId: number) => {
    setExpandedUnits(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    )
  }

  if (!course) {
    return <MainLayout><div className="p-8">課程不存在</div></MainLayout>
  }

  // Progress based on claimed lessons across whole course
  const totalLessonsInCourse = useMemo(() => course.units.reduce((acc, u) => acc + u.lessons.length, 0), [course])
  const claimedLessonsInCourse = useMemo(() => course.units.reduce((acc, u) => acc + u.lessons.filter(l => (lessonStates[l.id] === 'claimed')).length, 0), [course, lessonStates])
  const progress = totalLessonsInCourse > 0 ? (claimedLessonsInCourse / totalLessonsInCourse) * 100 : 0

  const handleClaim = (lessonId: string) => {
    const state = lessonStates[lessonId]
    if (state !== 'watched') return

    setClaiming(lessonId)
    // small delay to showcase animation
    setTimeout(() => {
      setLessonStates(prev => ({ ...prev, [lessonId]: 'claimed' }))
      setClaiming(null)
      const gained = 100
      setXp(prev => prev + gained)
      toast.success('恭喜！獲得了 100 EXP', {
        description: `目前累積：${xp + gained} EXP`
      })
    }, 180)
  }

  const currentVideoId = (() => {
    const urls = videoUrls[slug as keyof typeof videoUrls] || []
    const idx = lessonIndexMap[currentLesson] ?? 0
    const url = urls[idx] || urls[0] || ''
    return extractYouTubeVideoId(url)
  })()

  // Reset progress UI when lesson changes
  useEffect(() => {
    setWatchedSeconds(0)
    setDurationSeconds(0)
    setIsCompleted(false)
    // stop previous heartbeat when switching lessons
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
  }, [currentLesson])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
        heartbeatRef.current = null
      }
    }
  }, [])

  // Helper to send heartbeat to MVP API
  async function sendHeartbeat() {
    try {
      const player = playerRef.current
      if (!player) return
      const ct = await player.getCurrentTime()
      const dur = await player.getDuration()
      if (!dur || dur <= 0) return
      const res = await fetch('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: `${slug}:${currentLesson}`,
          userId: 'anonymous',
          currentTime: ct,
          duration: dur,
        })
      })
      if (!res.ok) return
      const data = await res.json()
      setWatchedSeconds(data?.watchedSeconds || 0)
      setDurationSeconds(data?.duration || dur)
      setIsCompleted(!!data?.isCompleted)
      // auto-mark watched when completed
      if (data?.isCompleted) {
        setLessonStates(prev => {
          const cur = prev[currentLesson]
          if (cur === 'claimed' || cur === 'watched') return prev
          return { ...prev, [currentLesson]: 'watched' }
        })
      }
    } catch { /* ignore */ }
  }

  return (
    <MainLayout isLoggedIn={true}>
      <div className="flex h-full flex-col lg:flex-row">
        {/* Video Player Section */}
        <div className="flex flex-1 flex-col">
          <div className="aspect-video bg-black">
            {((course as any).requiresPurchase && !entitled) ? (
              <div className="relative flex h-full w-full items-center justify-center">
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 flex flex-col items-center gap-4 text-center text-white">
                  <Lock className="h-10 w-10" />
                  <div className="text-2xl font-bold">此課程需購買後才能觀看</div>
                  <Button size="lg" className="bg-gradient-to-r from-[#FF8A00] to-[#FFA733]" onClick={() => (window.location.href = `/purchase/${slug}`)}>前往購買頁面</Button>
                </div>
              </div>
            ) : (
            <YouTube
              videoId={currentVideoId}
              className="w-full h-full"
              opts={{
                width: '100%',
                height: '100%',
                playerVars: { rel: 0, modestbranding: 1, playsinline: 1 }
              }}
              onReady={(e) => {
                playerRef.current = e.target
                // Start a 10s heartbeat
                if (heartbeatRef.current) clearInterval(heartbeatRef.current)
                heartbeatRef.current = setInterval(() => {
                  sendHeartbeat()
                }, 10000)
              }}
              onStateChange={(e) => {
                // If paused or buffering, we can still let heartbeat run; MVP keeps it simple
                // When video ends, send a final heartbeat and let existing UX continue
                if (e.data === 0 /* ended */) {
                  sendHeartbeat()
                }
              }}
              onEnd={() => {
                // Mark current lesson as watched (keep existing behavior)
                setLessonStates(prev => {
                  const cur = prev[currentLesson]
                  if (cur === 'claimed') return prev
                  return { ...prev, [currentLesson]: 'watched' }
                })

                // Auto-next UX (existing)
                const urls = videoUrls[slug as keyof typeof videoUrls] || []
                const idx = lessonIndexMap[currentLesson] ?? 0
                const isLast = idx >= urls.length - 1
                if (isLast) {
                  toast.success('恭喜你完成了本課所有單元！', { description: '點擊下方按鈕返回課程列表' })
                } else {
                  let cancelled = false
                  const id = toast.custom(() => (
                    <div className="relative w-[520px] max-w-[92vw] rounded-[14px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
                      <div className="absolute left-0 top-0 h-full w-2 bg-[#47C278]" />
                      <div className="p-6">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-8 w-8 text-[#47C278]" />
                          <div className="text-[28px] md:text-[32px] font-extrabold tracking-wide">單元完成！</div>
                        </div>
                        <div className="mt-2 text-xl text-neutral-700 dark:text-neutral-300">
                          將於 30 秒後自動播放下一部
                        </div>
                        <div className="mt-6 flex items-center justify-end gap-3">
                          <Button
                            variant="outline"
                            className="h-11 px-6 rounded-xl text-lg"
                            onClick={() => {
                              cancelled = true
                              toast.dismiss(id)
                            }}
                          >取消</Button>
                          <Button
                            className="h-11 px-6 rounded-xl text-lg bg-gradient-to-r from-[#FF8A00] to-[#FFA733] text-white shadow-[0_4px_8px_rgba(255,140,0,0.25)] hover:brightness-110"
                            onClick={() => {
                              cancelled = true
                              toast.dismiss(id)
                              const nextLessonId = Object.keys(lessonIndexMap)[idx + 1]
                              setCurrentLesson(nextLessonId)
                            }}
                          >下一部影片</Button>
                        </div>
                      </div>
                    </div>
                  ), { duration: 30000 })

                  setTimeout(() => {
                    if (!cancelled) {
                      toast.dismiss(id)
                      const nextLessonId = Object.keys(lessonIndexMap)[idx + 1]
                      setCurrentLesson(nextLessonId)
                    }
                  }, 30000)
                }
              }}
            />
            )}
          </div>

          {/* Course Info */}
          <div className="border-b bg-card p-4 md:p-6">
            <div className="mb-4">
              <Badge className="mb-2">正在學習</Badge>
              <h1 className="text-2xl font-bold text-balance md:text-3xl">{course.title}</h1>
            </div>

            <div className="space-y-4">
              {/* Course-wide claim progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">課程進度</span>
                  <span className="font-semibold">
                    已交付 {claimedLessonsInCourse} / 共 {totalLessonsInCourse} 單元
                  </span>
                </div>
                <ColorfulProgress value={progress} className="h-3" />
              </div>

              {/* Per-lesson watched percentage (MVP) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">已觀看百分比（目前單元）</span>
                  <span className="font-semibold">
                    {durationSeconds > 0 ? Math.round((watchedSeconds / durationSeconds) * 100) : 0}%
                  </span>
                </div>
                <ColorfulProgress value={durationSeconds > 0 ? (watchedSeconds / durationSeconds) * 100 : 0} className="h-2" />
                {isCompleted && (
                  <div className="text-xs text-[#47C278]">此單元已自動判定完成</div>
                )}
                <div className="text-xs text-muted-foreground">目前累積經驗值：{xp} EXP（前端暫存）</div>
              </div>
            </div>
          </div>

          {/* Lesson Description (desktop only) */}
          <div className="hidden flex-1 overflow-y-auto p-6 lg:block">
            <h2 className="mb-4 text-xl font-bold">課程說明</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground">
                這堂課程將帶你深入了解軟體設計的核心概念，從基礎到進階，逐步掌握架構設計的思維與實踐。
              </p>
            </div>
          </div>
        </div>

        {/* Course Content Sidebar */}
        <aside className="w-full border-l bg-card lg:w-96 lg:overflow-y-auto">
          <div className="border-b p-4">
            <h2 className="text-lg font-bold">課程內容</h2>
          </div>

          <div className="divide-y">
            {course.units.map((unit) => {
              const isExpanded = expandedUnits.includes(unit.id)
              const completedLessons = unit.lessons.filter(l => (lessonStates[l.id] === 'claimed')).length
              const totalLessons = unit.lessons.length

              return (
                <div key={unit.id}>
                  <button
                    onClick={() => toggleUnit(unit.id)}
                    className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                      {unit.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{unit.title}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{completedLessons}/{totalLessons} 完成</span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="bg-muted/30">
                      {unit.lessons.map((lesson) => {
                        const state = lessonStates[lesson.id] || (lesson.completed ? 'watched' : 'notWatched')
                        const isCurrent = currentLesson === lesson.id

                        const icon = (() => {
                          if (lesson.locked) return <Lock className="h-4 w-4 text-muted-foreground" />
                          if (state === 'claimed') return <CheckCircle2 className="h-5 w-5 text-[#E7B325]" />
                          if (state === 'watched') return <CheckCircle2 className="h-5 w-5 text-[#47C278]" />
                          return <Play className="h-4 w-4 text-muted-foreground" />
                        })()

                        const needsPurchase = (course as any).requiresPurchase && !entitled
                        const canClaim = !lesson.locked && state === 'watched' && !needsPurchase

                        return (
                          <div key={lesson.id} className={`flex items-center gap-3 px-4 py-3 ${isCurrent ? "bg-primary/5 border-l-2 border-primary" : ""}`}>
                            {/* Left icon (click to claim if watched) */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (canClaim) handleClaim(lesson.id)
                              }}
                              disabled={!canClaim}
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded transition-all disabled:opacity-50 ${
                                claiming === lesson.id ? 'scale-95' : 'hover:scale-105'
                              }`}
                              title={state === 'watched' ? '點擊交付，獲得 100 EXP' : undefined}
                            >
                              <span className={`${claiming === lesson.id ? 'animate-pulse' : ''}`}>{icon}</span>
                            </button>

                            {/* Title and duration (row click to play) */}
                            <button
                              onClick={() => {
                                if (lesson.locked) return
                                if ((course as any).requiresPurchase && !entitled) {
                                  toast.info('此課程需購買後才能觀看', {
                                    description: '前往購買頁面進行解鎖',
                                    action: {
                                      label: '前往購買',
                                      onClick: () => window.location.href = `/purchase/${slug}`
                                    }
                                  })
                                  return
                                }
                                setCurrentLesson(lesson.id)
                              }}
                              disabled={lesson.locked || ((course as any).requiresPurchase && !entitled)}
                              className="flex-1 min-w-0 text-left transition-colors hover:bg-muted/50 rounded disabled:cursor-not-allowed disabled:opacity-50 px-2 py-1"
                            >
                              <div className="text-sm font-medium truncate">{lesson.title}</div>
                              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{lesson.duration}</span>
                              </div>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </aside>
      </div>
    </MainLayout>
  )
}
