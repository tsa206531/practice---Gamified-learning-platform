import { NextRequest, NextResponse } from 'next/server'

// In-memory store for submissions while the dev server lives
// Note: This resets on server restart. Suitable for local development only.

type Submission = {
  challengeId: string
  imageUrl: string
  submittedAt: string
}

const store: Submission[] = []

export async function GET() {
  return NextResponse.json(store, { status: 200 })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { challengeId, imageUrl } = body || {}
    if (!challengeId || !imageUrl) {
      return NextResponse.json({ message: 'challengeId and imageUrl are required' }, { status: 400 })
    }
    const submission: Submission = {
      challengeId: String(challengeId),
      imageUrl: String(imageUrl),
      submittedAt: new Date().toISOString(),
    }
    store.unshift(submission)
    return NextResponse.json(submission, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Invalid JSON' }, { status: 400 })
  }
}
