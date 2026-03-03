"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MainLayout } from '@/components/main-layout'
import { toast } from 'sonner'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [sessionXp, setSessionXp] = useState(0)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('lp:xp_total')
      setSessionXp(Number(raw || 0))
    } catch {}
  }, [])

  function addXp(amount: number) {
    try {
      const cur = Number(sessionStorage.getItem('lp:xp_total') || 0)
      const next = cur + amount
      sessionStorage.setItem('lp:xp_total', String(next))
      setSessionXp(next)
      toast.success(`已獲得 +${amount} EXP`, { description: `本次學習累計：${next.toLocaleString()} XP` })
      // optional: broadcast custom event for same-tab listeners
      window.dispatchEvent(new CustomEvent('xp-update', { detail: { total: next } }))
    } catch (e) {
      toast.error('更新 XP 失敗')
    }
  }

  function removeEntitlement(slug: string) {
    try {
      const raw = localStorage.getItem('lp:entitlements')
      const list = raw ? (JSON.parse(raw) as string[]) : []
      const next = (Array.isArray(list) ? list : []).filter(s => s !== slug)
      localStorage.setItem('lp:entitlements', JSON.stringify(next))
      toast.success('已移除購買紀錄', { description: slug })
      // 可選：廣播事件讓同分頁即時更新
      window.dispatchEvent(new CustomEvent('entitlements-update', { detail: { entitlements: next } }))
    } catch (e) {
      toast.error('移除失敗')
    }
  }

  async function fetchMetrics() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/admin/metrics')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-4">Admin 測試頁面</h1>
        <p className="text-sm text-muted-foreground mb-6">按下按鈕會帶 JWT 呼叫 /api/admin/metrics，僅 ADMIN 角色可成功。</p>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Button onClick={fetchMetrics} disabled={loading}>
            {loading ? '讀取中...' : '呼叫 /api/admin/metrics'}
          </Button>

          <Button variant="secondary" onClick={() => addXp(100)}>+100 EXP</Button>
          <Button variant="secondary" onClick={() => addXp(300)}>+300 EXP</Button>
          <Button variant="destructive" onClick={() => removeEntitlement('ai-bdd')}>移除 AI x BDD 購買紀錄</Button>
          <span className="text-sm text-muted-foreground">本次學習 XP：<span className="font-semibold">{sessionXp.toLocaleString()}</span></span>
        </div>

        <div className="mt-6">
          {error && <div className="text-destructive">錯誤：{error}</div>}
          {result && (
            <pre className="p-4 rounded-md bg-muted overflow-auto text-xs">{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
