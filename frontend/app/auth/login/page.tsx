"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogIn, UserPlus, MessageCircle, Globe } from 'lucide-react'
import Script from 'next/script'
import { MainLayout } from '@/components/main-layout'
import { GoogleAuthButton } from '@/components/google-auth-button'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

type Mode = 'login' | 'register'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login' ? { email, password } : { name, email, password, role }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {mode === 'login' ? '登入你的帳號' : '建立新帳號'}
            </h1>
            <p className="text-sm text-muted-foreground">以電子郵件與密碼{mode === 'login' ? '登入' : '註冊'}，角色包含管理員、學生、老師</p>
          </div>

          <div className="relative flex items-center justify-center py-2">
            <span className="text-xs text-muted-foreground bg-background px-2">或使用 Email</span>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">暱稱</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} required={mode==='register'} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">角色</Label>
                  <select id="role" className="w-full h-9 rounded-md border bg-transparent px-3 text-sm" value={role} onChange={e => setRole(e.target.value as any)}>
                    <option value="STUDENT">學生</option>
                    <option value="TEACHER">老師</option>
                    <option value="ADMIN">管理員</option>
                  </select>
                </div>
              </>
            )}
            {error && <div className="text-sm text-destructive">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {mode === 'login' ? <><LogIn className="h-4 w-4" /> 登入</> : <><UserPlus className="h-4 w-4" /> 註冊</>}
            </Button>

            <div className="relative flex items-center justify-center py-2">
              <span className="text-xs text-muted-foreground bg-background px-2">或使用社群登入</span>
            </div>

            <div className="grid gap-3">
              <GoogleAuthButton />
            </div>
          </form>

          <div className="mt-4 text-center text-sm">
            {mode === 'login' ? (
              <button className="text-primary underline-offset-4 hover:underline" onClick={() => setMode('register')}>還沒有帳號？點此註冊</button>
            ) : (
              <button className="text-primary underline-offset-4 hover:underline" onClick={() => setMode('login')}>已有帳號？點此登入</button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
