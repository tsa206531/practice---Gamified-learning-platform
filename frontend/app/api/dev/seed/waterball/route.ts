import { NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function POST() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'waterball@example.com',
        password: 'password',
        role: 'STUDENT'
      })
    })
    if (res.status === 409) {
      // already exists is fine
      return NextResponse.json({ ok: true, message: 'User already exists' })
    }
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      return NextResponse.json(data ?? { error: 'Seed failed' }, { status: res.status })
    }
    return NextResponse.json({ ok: true, email: 'waterball@example.com' })
  } catch (e: any) {
    return NextResponse.json({ error: 'Unable to reach backend', detail: String(e?.message || e) }, { status: 502 })
  }
}
