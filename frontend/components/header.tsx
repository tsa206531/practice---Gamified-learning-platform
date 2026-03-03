"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, ChevronDown, LogIn, Zap, Menu, Sun, Moon } from 'lucide-react'
import { getLevelInfo, readCombinedXp, listenXpUpdates, formatXp } from '@/lib/level-utils'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'

interface HeaderProps {
  isLoggedIn?: boolean
  onMenuToggle?: () => void
}

export function Header({ isLoggedIn = false, onMenuToggle }: HeaderProps) {
  const [sessionXp, setSessionXp] = useState(0)
  const [currentCourse] = useState("軟體設計模式精通之旅")
  const [auth, setAuth] = useState<{ loggedIn: boolean; role?: string; name?: string; email?: string; level?: number; exp?: number; avatar?: string; provider?: string }>({ loggedIn: false })

  useEffect(() => {
    let active = true
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(async (res) => {
        if (!active) return
        if (res.ok) {
          const data = await res.json()
          setAuth({ loggedIn: true, role: data.role, name: data.name, email: data.email, level: data.level, exp: data.exp, avatar: data.avatar, provider: data.provider })
        } else {
          setAuth({ loggedIn: false })
        }
      })
      .catch(() => setAuth({ loggedIn: false }))
    return () => { active = false }
  }, [])

  const showLoggedIn = auth.loggedIn || isLoggedIn

  // theme toggle support
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  // Load and listen for XP updates; show level-up toast when level increases
  useEffect(() => {
    if (typeof window === 'undefined') return
    let prevLevel = Number(sessionStorage.getItem('lp:last_level') || 0)
    const update = () => {
      const total = readCombinedXp(auth.exp)
      const { level } = getLevelInfo(total)
      if (prevLevel && level > prevLevel) {
        toast.success(`等級提升！Lv.${prevLevel} → Lv.${level}`)
      }
      sessionStorage.setItem('lp:last_level', String(level))
      setSessionXp(Number(sessionStorage.getItem('lp:xp_total') || 0))
    }
    update()
    const off = listenXpUpdates(() => update())
    return () => { off() }
  }, [auth.exp])
  const currentTheme = theme === 'system' ? systemTheme : theme
  const isAdmin = auth.role === 'ADMIN'

  // Merge backend exp with session XP, compute level
  const combinedXP = readCombinedXp(auth.exp)
  const info = getLevelInfo(combinedXP)
  const user = {
    name: auth.name || '使用者',
    level: info.level,
    currentXP: combinedXP,
    xpToNextLevel: info.needForNext ?? 0,
    avatar: auth.avatar || "/diverse-avatars.png",
  }

  const xpProgress = (user.currentXP / user.xpToNextLevel) * 100

  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 text-xs md:text-sm">
                <span className="hidden sm:inline">{currentCourse}</span>
                <span className="sm:hidden">課程</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => (window.location.href = '/course/software-design-patterns')}>
                軟體設計模式精通之旅
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => (window.location.href = '/course/ai-bdd')}>
                AI x BDD：規格驅動全自動開發術
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {showLoggedIn ? (
            <>
              <Button className="gap-2 hidden sm:flex">
                <Zap className="h-4 w-4" />
                前往挑戰
              </Button>

              {isAdmin && (
                <Button className="gap-2 hidden sm:flex" onClick={() => (window.location.href = '/admin')}>
                  Admin
                </Button>
              )}
              
              {/* Theme Toggle Button */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="切換主題"
                  onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
                >
                  {currentTheme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              )}

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-3 px-2">
                    <div className="hidden sm:flex flex-col items-end leading-tight">
                      <span className="text-[10px] text-muted-foreground">等級 {user.level}</span>
                      <span className="text-[11px] font-semibold">{user.currentXP.toLocaleString()} XP</span>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">等級 {info.level}</div>
                        {info.nextLevelStartXp !== null ? (
                          <div className="text-xs text-muted-foreground">距離下一級：還差 {formatXp(info.remainingToNext || 0)} XP</div>
                        ) : (
                          <div className="text-xs text-muted-foreground">已達最高等級</div>
                        )}
                      </div>
                      <div className="text-right text-xs text-muted-foreground">{formatXp(user.currentXP)} XP</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{user.name}</span>
                        
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">等級 {user.level}</span>
                        <span className="text-muted-foreground">
                          {user.currentXP}/{user.xpToNextLevel} XP
                        </span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div 
                          className="h-full bg-gradient-to-r from-secondary via-primary to-accent transition-all"
                          style={{ width: `${xpProgress}%` }}
                        />
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => (window.location.href = '/profile')}>個人檔案</DropdownMenuItem>
                  <DropdownMenuItem>邀請好友</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' })
                    window.location.href = '/auth/login'
                  }}>登出</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button className="gap-2" onClick={() => window.location.href='/auth/login'}>
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">登入</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
