"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

declare global {
  interface Window { google?: any }
}

export function GoogleAuthButton() {
  const [ready, setReady] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!id) return
    const g = window.google
    if (!g || !g.accounts || !g.accounts.id) {
      // wait for script then retry
      const timer = setTimeout(() => setReady(r => !r), 400)
      return () => clearTimeout(timer)
    }
    try {
      g.accounts.id.initialize({
        client_id: id,
        callback: async (resp: any) => {
          const credential = resp?.credential
          if (!credential) return
          try {
            const res = await fetch('/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken: credential })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.error || 'Google login failed')
            window.location.href = '/'
          } catch (e:any) {
            alert(e?.message || String(e))
          }
        }
      })
      if (buttonRef.current) {
        buttonRef.current.innerHTML = ''
        g.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large', width: 360 })
      }
    } catch {}
  }, [ready])

  return (
    <div className="w-full flex justify-center">
      <div ref={buttonRef} />
    </div>
  )
}
