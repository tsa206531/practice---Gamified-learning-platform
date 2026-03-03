import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function GET() {
  // 取得 cookieStore（同步 API）
  const cookieStore = cookies()
  const token = (await cookieStore).get('token')?.value

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const res = await fetch(`${API_BASE}/api/admin/metrics`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    // 捕捉 fetch 錯誤，避免 build 過程失敗
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}
