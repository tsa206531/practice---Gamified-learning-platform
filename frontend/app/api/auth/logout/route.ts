import { NextResponse } from 'next/server'

export async function POST() {
  const resp = NextResponse.json({ ok: true })
  resp.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: 0 })
  resp.cookies.set('mock_user', '', { httpOnly: true, path: '/', maxAge: 0 })
  return resp
}
