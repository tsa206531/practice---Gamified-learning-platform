import { NextResponse } from 'next/server'
import path from 'node:path'
import { readFile } from 'node:fs/promises'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
const MOCK_AUTH = String(process.env.MOCK_AUTH || 'false') === 'true'

const mockUsers: Record<string, { key: string; role: 'STUDENT' | 'ADMIN' }> = {
  'waterball@example.com': { key: 'waterball', role: 'STUDENT' },
  'alice@example.com': { key: 'alice', role: 'STUDENT' },
  'bob@example.com': { key: 'bob', role: 'STUDENT' },
}

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const body = await req.json()

  if (MOCK_AUTH) {
    const email = String(body?.email || '')
    const user = mockUsers[email]
    if (!user) {
      return NextResponse.json({ error: 'Login failed' }, { status: 403 })
    }
    // optional: check password === 'password' if you want
    try {
      const file = path.join(process.cwd(), 'frontend', 'data', 'users', `${user.key}.json`)
      await readFile(file, 'utf-8') // ensure exists
    } catch {
      return NextResponse.json({ error: 'Mock user not found' }, { status: 404 })
    }
    const resp = NextResponse.json({ email, role: user.role, mock: true })
    const secure = process.env.NODE_ENV === 'production'
    // set a mock token for UI flows that check presence
    resp.cookies.set('token', 'mock-token', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure,
      maxAge: 60 * 60 * 24 * 7,
    })
    // also remember which mock user is logged in
    resp.cookies.set('mock_user', user.key, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure,
      maxAge: 60 * 60 * 24 * 7,
    })
    return resp
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Unable to reach auth service', detail: String(e?.message || e) }, { status: 502 })
  }

  const data = await parseJsonSafe(res)
  if (!res.ok) {
    return NextResponse.json(data ?? { error: 'Login failed' }, { status: res.status })
  }
  if (!data || !data.token) {
    return NextResponse.json({ error: 'Invalid response from auth service' }, { status: 502 })
  }
  const resp = NextResponse.json({ email: data.email, role: data.role })
  const secure = process.env.NODE_ENV === 'production'
  resp.cookies.set('token', data.token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure,
    maxAge: 60 * 60 * 24 * 7
  })
  return resp
}
