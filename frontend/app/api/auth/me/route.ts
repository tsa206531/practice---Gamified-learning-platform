import { NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
const MOCK_AUTH = String(process.env.MOCK_AUTH || 'false') === 'true'

import { cookies } from 'next/headers'
import path from 'node:path'
import { readFile } from 'node:fs/promises'

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (MOCK_AUTH) {
    const mockUserKey = cookieStore.get('mock_user')?.value
    if (!mockUserKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
      const file = path.join(process.cwd(), 'frontend', 'data', 'users', `${mockUserKey}.json`)
      const json = await readFile(file, 'utf-8')
      const user = JSON.parse(json)
      return NextResponse.json({
        email: `${user.username || mockUserKey}@example.com`,
        role: 'STUDENT',
        name: user.name,
        avatar: user.avatar,
        mock: true,
      }, { status: 200 })
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Unable to reach auth service', detail: String(e?.message || e) }, { status: 502 })
  }
  const data = await parseJsonSafe(res)
  return NextResponse.json(data ?? { error: 'Invalid response from auth service' }, { status: res.status })
}
