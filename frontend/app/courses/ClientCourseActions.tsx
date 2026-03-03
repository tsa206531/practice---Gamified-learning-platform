"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function getEntitlements(): string[] {
  try {
    const raw = localStorage.getItem('lp:entitlements')
    const list = raw ? (JSON.parse(raw) as string[]) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function ClientCourseActions({ slug }: { slug: string }) {
  const [entitled, setEntitled] = useState(false)

  useEffect(() => {
    setEntitled(getEntitlements().includes(slug))
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'lp:entitlements') {
        setEntitled(getEntitlements().includes(slug))
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [slug])

  const requiresPurchase = slug === 'ai-bdd'

  // 試聽課程按鈕邏輯
  const canPreview = !requiresPurchase || entitled

  // 第二顆按鈕：未購買顯示「立即購買」，已購買顯示「我要上課」
  const secondLabel = entitled ? '我要上課' : '立即購買'
  const secondHref = entitled ? `/course/${slug}` : `/purchase/${slug}`

  return (
    <div className="flex w-full gap-3">
      {canPreview ? (
        <Button variant="outline" className="flex-1 gap-2" asChild>
          <Link href={`/course/${slug}`}>試聽課程</Link>
        </Button>
      ) : (
        <Button variant="outline" className="flex-1 gap-2" disabled>
          試聽課程
        </Button>
      )}

      <Button className="flex-1" asChild>
        <Link href={secondHref}>{secondLabel}</Link>
      </Button>
    </div>
  )
}
