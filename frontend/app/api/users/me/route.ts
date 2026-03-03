import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null } catch { return null }
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Unable to reach user service', detail: String(e?.message || e) }, { status: 502 })
  }
  const data = await parseJsonSafe(res)
  return NextResponse.json(data ?? { error: 'Invalid response from user service' }, { status: res.status })
}

export async function PATCH(req: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const incoming = await req.json()
  const body = {
    name: String(incoming?.name || '').trim(),
    occupation: typeof incoming?.occupation === 'string' ? incoming.occupation.trim() : undefined,
    birthday: typeof incoming?.birthday === 'string' ? incoming.birthday.trim() : undefined,
    gender: typeof incoming?.gender === 'string' ? incoming.gender.trim() : undefined,
    location: typeof incoming?.location === 'string' ? incoming.location.trim() : undefined,
  }
  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/users/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Unable to reach user service', detail: String(e?.message || e) }, { status: 502 })
  }
  const data = await parseJsonSafe(res)
  return NextResponse.json(data ?? { error: 'Invalid response from user service' }, { status: res.status })
}
