"use client"

import Link from "next/link"
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Home, BookOpen, User, Trophy, Gift, History, Layers, Map } from 'lucide-react'
import { useEffect, useState } from 'react'

const navItems = [
  { href: "/", label: "首頁", icon: Home },
  { href: "/courses", label: "課程頁", icon: BookOpen },
  { href: "/profile", label: "個人檔案", icon: User },
  { href: "/leaderboard", label: "排行榜", icon: Trophy },
  { href: "/rewards", label: "獎勵任務", icon: Gift },
  { href: "/challenges", label: "挑戰歷程", icon: History },
  { href: "/units", label: "所有單元", icon: Layers },
  { href: "/map", label: "挑戰道館", icon: Map },
]

export function SidebarNav() {
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState<boolean>(false)

  useEffect(() => {
    let active = true
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(async (res) => {
        if (!active) return
        setLoggedIn(res.ok)
      })
      .catch(() => setLoggedIn(false))
    return () => { active = false }
  }, [])

  const filtered = loggedIn
    ? navItems
    : navItems.filter((item) => item.href !== '/profile' && item.href !== '/rewards')

  return (
    <nav className="flex flex-col gap-2 p-4">
      {filtered.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-sidebar-accent",
              isActive
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-sidebar-foreground"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
