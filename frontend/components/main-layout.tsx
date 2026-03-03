"use client"

import { ReactNode, useState } from "react"
import { SidebarNav } from "./sidebar-nav"
import { Header } from "./header"
import { Zap } from 'lucide-react'
import { Sheet, SheetContent } from "@/components/ui/sheet"

interface MainLayoutProps {
  children: ReactNode
  isLoggedIn?: boolean
}

export function MainLayout({ children, isLoggedIn = false }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden md:block w-64 shrink-0 border-r border-sidebar-border bg-sidebar">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            水球軟體學院<br />
            WATERBALLSA.TW
          </span>
        </div>
        <SidebarNav />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header isLoggedIn={isLoggedIn} onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                水球軟體學院666
              </span>
            </div>
            <SidebarNav />
          </SheetContent>
        </Sheet>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
