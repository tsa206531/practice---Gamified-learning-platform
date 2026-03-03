import { NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

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
  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Unable to reach auth service', detail: String(e?.message || e) }, { status: 502 })
  }

  const data = await parseJsonSafe(res)
  if (!res.ok) {
    return NextResponse.json(data ?? { error: 'Registration failed' }, { status: res.status })
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
