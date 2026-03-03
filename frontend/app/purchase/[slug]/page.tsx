"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'


import { MainLayout } from "@/components/main-layout"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Check, ChevronDown, CreditCard, Banknote, Calendar } from 'lucide-react'
import { useParams } from 'next/navigation'

const courseData = {
  "ai-bdd": {
    title: "AI x BDD：規格驅動全自動開發術",
    description: "這門課程要帶你「用半年的時間，徹底學會如何結合 TDD、BDD 與 AI，實現 100% 全自動化、高精準度的程式開發」。上完課後，你不只是理解方法，更能真正把 AI 落實到專案裡，從此不再困在無止盡的 Debug 與 Review，而是成為團隊裡能制定規格與標準的工程師。",
    units: [
      "單元一：規格驅動開發的前提",
      "單元二：100% 全自動化開發的脈絡：規格的光譜",
      "單元三：70% 自動化：測試驅動開發"
    ],
    price: 4990,
    originalPrice: 7990
  },
  "software-design-patterns": {
    title: "軟體設計模式精通之旅",
    description: "深入探索 23 種經典設計模式，從基礎到進階，掌握軟體架構的核心思維。",
    units: [
      "單元一：課程介紹 & 試聽",
      "單元二：副本零：冒險者指引",
      "單元三：副本一：行雲流水的設計思路"
    ],
    price: 5990,
    originalPrice: 8990
  }
}

export default function PurchasePage() {
  const params = useParams()
  const slug = params.slug as string
  const course = courseData[slug as keyof typeof courseData]
  
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [installments, setInstallments] = useState("3")
  const [invoiceNumber, setInvoiceNumber] = useState("")

  const orderId = "20251117033625467e"
  const paymentDeadline = "2025年11月20日 12:00 AM"
  
  const installmentOptions = [
    { period: "3", amount: 1664 },
    { period: "6", amount: 832 },
    { period: "9", amount: 555 },
    { period: "12", amount: 416 },
    { period: "18", amount: 278 },
    { period: "24", amount: 208 }
  ]

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2 && paymentMethod) {
      setStep(3)
    }
  }

  const handlePayment = () => {
    setStep(3)
  }

  if (!course) {
    return <MainLayout><div className="p-8">課程不存在</div></MainLayout>
  }

  return (
    <MainLayout isLoggedIn={false}>
      <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        {/* Progress Steps */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "建立訂單" },
              { num: 2, label: "完成支付" },
              { num: 3, label: "開始上課" }
            ].map((item, index) => (
              <div key={item.num} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-colors ${
                      step >= item.num
                        ? "bg-gradient-to-r from-primary to-secondary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > item.num ? <Check className="h-5 w-5" /> : item.num}
                  </div>
                  <span className="mt-2 text-xs md:text-sm font-medium text-center">{item.label}</span>
                </div>
                {index < 2 && (
                  <div className="flex-1 mx-2">
                    <div className="relative h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full transition-all duration-500 ${
                          step > item.num
                            ? "w-full bg-gradient-to-r from-primary to-secondary"
                            : "w-0"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Order Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-balance">{course.title}</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {course.units.map((unit, index) => (
                  <div key={index} className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{unit}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-semibold">課程售價</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm text-muted-foreground line-through">
                      NT$ {Number(course.originalPrice ?? 0).toLocaleString()}
                    </span>
                    <span className="text-3xl font-bold text-primary">
                      NT$ {Number(course.price ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-accent/10 p-4">
                  <div className="flex items-start gap-2">
                    <CreditCard className="mt-0.5 h-5 w-5 text-accent" />
                    <div className="text-sm">
                      <div className="font-semibold text-accent">付款提示</div>
                      <div className="text-muted-foreground">
                        使用銀角零卡分期付款，最低每期只需付 {Math.ceil(Number(course.price ?? 0) / 24)} 元
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleNextStep}>
                下一步：選取付款方式
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>完成支付</CardTitle>
              <CardDescription>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>訂單編號</span>
                    <span className="font-mono font-semibold">{orderId}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>付款截止時間</span>
                    <span className="font-semibold text-destructive">{paymentDeadline}</span>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-primary/5 p-4">
                <p className="text-sm text-muted-foreground">
                  恭喜你，訂單已建立完成，請你於三日內付款。
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">選取付款方式</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50">
                      <RadioGroupItem value="atm" id="atm" />
                      <Label htmlFor="atm" className="flex flex-1 cursor-pointer items-center gap-2">
                        <Banknote className="h-5 w-5 text-muted-foreground" />
                        <span>ATM 匯款</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50">
                      <RadioGroupItem value="credit" id="credit" />
                      <Label htmlFor="credit" className="flex flex-1 cursor-pointer items-center gap-2">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <span>信用卡（一次付清）</span>
                      </Label>
                    </div>

                    <div className="rounded-lg border">
                      <div className="flex items-center space-x-3 p-4 hover:bg-muted/50">
                        <RadioGroupItem value="installment" id="installment" />
                        <Label htmlFor="installment" className="flex flex-1 cursor-pointer items-center gap-2">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <span>銀角零卡分期</span>
                        </Label>
                      </div>

                      {paymentMethod === "installment" && (
                        <div className="border-t bg-muted/30 p-4">
                          <Label className="mb-3 block text-sm font-medium">選取分期期數</Label>
                          <RadioGroup value={installments} onValueChange={setInstallments}>
                            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                              {installmentOptions.map((option) => (
                                <div
                                  key={option.period}
                                  className="flex items-center space-x-2 rounded-lg border bg-background p-3 hover:bg-muted/50"
                                >
                                  <RadioGroupItem value={option.period} id={`period-${option.period}`} />
                                  <Label
                                    htmlFor={`period-${option.period}`}
                                    className="flex-1 cursor-pointer text-sm"
                                  >
                                    <div className="font-semibold">{option.period} 期</div>
                                    <div className="text-xs text-muted-foreground">
                                      每期 ${option.amount}
                                    </div>
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </RadioGroup>
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label htmlFor="invoice" className="text-base font-semibold">
                  發票資訊（選填）
                </Label>
                <Input
                  id="invoice"
                  placeholder="統一編號、手機載具、自然人憑證、捐贈碼"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  try {
                    const raw = localStorage.getItem('lp:entitlements')
                    const list = raw ? (JSON.parse(raw) as string[]) : []
                    const next = Array.from(new Set([...(Array.isArray(list) ? list : []), slug]))
                    localStorage.setItem('lp:entitlements', JSON.stringify(next))
                    toast.success('購買成功，已解鎖課程！')
                    setStep(3)
                  } catch {
                    toast.error('購買流程失敗，請重試')
                  }
                }}
                disabled={!paymentMethod}
              >
                模擬購買並完成支付
              </Button>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  付款後的平日一天內（假日則一至兩天內）會立即幫您對帳，若對帳無誤則會於約定之開學日程為您啟動此帳號的正式使用資格，也會透過訊息來引導您享受此旅程。
                </p>
                <p>
                  若您有其他購買相關的問題，歡迎寄信至{" "}
                  <a href="mailto:1234@waterballsa.tw" className="text-primary hover:underline">
                    1234@waterballsa.tw
                  </a>{" "}
                  詢問。
                </p>
              </div>

              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 hover:bg-muted/50">
                  <span className="text-sm font-medium">網際網路課程購買暨服務契約</span>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 rounded-lg border bg-muted/30 p-4">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>第一條：契約當事人</p>
                    <p>本契約當事人為學習道館平台（以下簡稱「甲方」）與購買課程之學員（以下簡稱「乙方」）。</p>
                    <p>第二條：服務內容</p>
                    <p>甲方提供線上學習課程服務，乙方購買後可於平台上觀看課程影片及使用相關學習資源。</p>
                    <p>第三條：付款方式</p>
                    <p>乙方可選擇一次付清或分期付款方式購買課程。分期付款需符合相關金融機構之審核標準。</p>
                    <p className="mt-4 text-xs">
                      以上為契約節錄內容，完整契約條款請洽客服人員索取。
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                <Check className="h-10 w-10 text-white" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-balance">付款成功！</h2>
              <p className="mb-8 text-lg text-muted-foreground text-pretty">
                恭喜你完成課程購買，現在可以開始學習了
              </p>
              <div className="space-y-3">
                <Button size="lg" className="w-full max-w-sm" asChild>
                  <a href={`/course/${slug}`}>前往課程</a>
                </Button>
                <Button size="lg" variant="outline" className="w-full max-w-sm" asChild>
                  <a href="/courses">瀏覽更多課程</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
