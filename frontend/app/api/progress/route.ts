import { NextRequest, NextResponse } from 'next/server'

// In-memory store for video progress (per dev server lifecycle)
// Keyed by `${userId||'anonymous'}:${videoId}`
// NOTE: This resets on server restart. Suitable for local development/MVP only.

type Range = [number, number] // [start, end)

type Progress = {
  videoId: string
  userId: string
  duration: number
  lastPosition: number
  watchedSeconds: number
  watchedRanges: Range[]
  isCompleted: boolean
  updatedAt: string
}

const store = new Map<string, Progress>()

function getKey(userId: string, videoId: string) {
  return `${userId || 'anonymous'}:${videoId}`
}

function normalizeRanges(ranges: Range[], maxDuration: number): Range[] {
  if (!ranges.length) return []
  const sorted = ranges
    .map(([s, e]) => [Math.max(0, Math.min(s, e)), Math.max(0, Math.max(s, e))] as Range)
    .filter(([s, e]) => e > s)
    .sort((a, b) => a[0] - b[0])
  const merged: Range[] = []
  for (const [s, e] of sorted) {
    const start = Math.max(0, s)
    const end = Math.min(maxDuration > 0 ? maxDuration : Number.MAX_SAFE_INTEGER, e)
    if (merged.length === 0) {
      merged.push([start, end])
      continue
    }
    const last = merged[merged.length - 1]
    if (start <= last[1] + 0.25 /* allow small overlap */) {
      last[1] = Math.max(last[1], end)
    } else {
      merged.push([start, end])
    }
  }
  return merged
}

function sumRanges(ranges: Range[]): number {
  let total = 0
  for (const [s, e] of ranges) total += Math.max(0, e - s)
  return total
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const videoId = searchParams.get('videoId') || ''
  const userId = searchParams.get('userId') || 'anonymous'
  if (!videoId) return NextResponse.json({ message: 'videoId is required' }, { status: 400 })
  const key = getKey(userId, videoId)
  const data = store.get(key)
  return NextResponse.json(data || null)
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const videoId = String(body?.videoId || '')
    const userId = String(body?.userId || 'anonymous')
    const currentTime = Number(body?.currentTime ?? NaN)
    const duration = Number(body?.duration ?? NaN)
    if (!videoId || Number.isNaN(currentTime) || Number.isNaN(duration)) {
      return NextResponse.json({ message: 'videoId, currentTime, duration are required' }, { status: 400 })
    }

    const key = getKey(userId, videoId)
    const prev = store.get(key)

    const safeDuration = duration > 0 ? duration : (prev?.duration || 0)
    const now = Date.now()
    const prevUpdatedAtMs = prev?.updatedAt ? Date.parse(prev.updatedAt) : 0
    const elapsedSec = prevUpdatedAtMs ? Math.max(0, (now - prevUpdatedAtMs) / 1000) : 0

    const prevLast = prev?.lastPosition ?? NaN
    let ranges = prev?.watchedRanges ? [...prev.watchedRanges] : []

    // Decide whether to add a new watched segment based on linear advance cap
    // Basic anti-seek: only accept forward progress, and cap per-heartbeat growth
    // Max advance per heartbeat: min(20s, elapsedSec * 1.5 + 2)
    const maxAdvance = Math.min(20, elapsedSec * 1.5 + 2)

    if (!Number.isNaN(prevLast)) {
      if (currentTime > prevLast) {
        const delta = currentTime - prevLast
        if (delta <= (maxAdvance || 15)) {
          // Accept as watched segment
          ranges.push([prevLast, currentTime])
        }
        // else: treat as seek forward, do not credit watched time
      } else {
        // currentTime <= prevLast -> seek backward or replay; no credit
      }
    }

    // Merge and bound ranges
    ranges = normalizeRanges(ranges, safeDuration)
    const watchedSeconds = Math.min(sumRanges(ranges), safeDuration || Number.MAX_SAFE_INTEGER)

    const tolerance = 2 // seconds
    const isCompleted = safeDuration > 0 && watchedSeconds >= Math.max(0, safeDuration - tolerance)

    const updated: Progress = {
      videoId,
      userId,
      duration: safeDuration,
      lastPosition: Number.isNaN(prevLast) ? currentTime : currentTime,
      watchedSeconds,
      watchedRanges: ranges,
      isCompleted,
      updatedAt: new Date(now).toISOString(),
    }

    store.set(key, updated)
    return NextResponse.json(updated, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Invalid JSON' }, { status: 400 })
  }
}
