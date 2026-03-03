"use client"

import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star } from 'lucide-react'
import { API_BASE } from '@/lib/api'
import { readCombinedXp } from '@/lib/level-utils'

type LeaderboardItem = { id: number; name: string; exp: number; level: number; rank: number; }

export default function LeaderboardPage() {
  const [items, setItems] = useState<LeaderboardItem[]>([])
  const [currentUser, setCurrentUser] = useState<LeaderboardItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        // 同時取得排行榜資料和當前使用者資料
        const [leaderboardRes, meRes] = await Promise.all([
          fetch(`${API_BASE}/api/leaderboard`, { cache: 'no-store' }),
          fetch('/api/users/me', { cache: 'no-store' })
        ]);

        const leaderboardData = await leaderboardRes.json();
        if (!active) return

        if (!leaderboardRes.ok || !leaderboardData.top) {
          throw new Error(leaderboardData?.error || '無法載入排行榜');
        }

        let topPlayers: LeaderboardItem[] = leaderboardData.top;
        let loggedInUser: LeaderboardItem | null = null;

        if (meRes.ok) {
          const meData = await meRes.json();
          // 結合 SessionStorage 的經驗值
          const myCombinedXp = readCombinedXp(meData.exp);

          // 以局部常數建立當前使用者的排行榜項目，避免陣列型別被擴成含 null 的 union
          const user: LeaderboardItem = { ...meData, exp: Number(myCombinedXp ?? 0), rank: 0, level: meData.level || 1 };

          // 將使用者加入列表並重新排序排名（濾掉可能的 null/undefined）
          const filteredTop = topPlayers.filter((p): p is LeaderboardItem => !!p && p.id !== user.id);
          const combinedList: LeaderboardItem[] = [...filteredTop, user];
          combinedList.sort((a, b) => Number(b?.exp ?? 0) - Number(a?.exp ?? 0));
          topPlayers = combinedList.map((player, index) => ({ ...player, rank: index + 1 }));
          loggedInUser = topPlayers.find(p => p.id === user.id) || null;
        }

        setItems(topPlayers);
        setCurrentUser(loggedInUser);

      } catch (e: any) {
        if (active) setError(String(e?.message || e))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-10">
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            <Badge className="bg-primary text-primary-foreground">學習排行榜</Badge>
          </div>
          <h1 className="text-3xl font-bold">排行榜</h1>
          <p className="text-muted-foreground">依累積經驗值排名</p>
        </div>

        {loading && (
          <div className="text-center text-muted-foreground">載入中...</div>
        )}
        {error && !loading && (
          <div className="text-center text-destructive">{error}</div>
        )}

        {!loading && !error && (
          <Card>
            <CardHeader>
              <CardTitle>前 {Math.min(items.length, 100)} 名</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {items.map((u, idx) => (
                  <div key={u.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-4">
                      <div className="w-8 text-right font-bold">{u.rank}</div>
                      <Avatar className="h-8 w-8">
                        {/* 目前無頭像資料，使用暱稱首字母 */}
                        <AvatarFallback>{(u.name || 'U')[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">等級 {u.level}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-secondary font-semibold">
                      <Star className="h-4 w-4" />
                      {Number(u.exp ?? 0).toLocaleString()} XP
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            {currentUser && (
              <div className="border-t-2 border-dashed border-primary/50 bg-primary/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 text-right font-bold text-primary">{currentUser.rank}</div>
                    <Avatar className="h-8 w-8 border-2 border-primary">
                      <AvatarFallback className="bg-primary/20">{(currentUser.name || 'U')[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-primary">{currentUser.name}</div>
                      <div className="text-xs text-muted-foreground">等級 {currentUser.level}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-primary">
                    <Star className="h-4 w-4" />
                    {Number(currentUser.exp ?? 0).toLocaleString()} XP
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
