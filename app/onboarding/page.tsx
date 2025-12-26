// app/onboarding/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveUserConfig } from "@/lib/store"
import { Role } from "@/lib/types"

export default function OnboardingPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role | null>(null)
  const [dueDate, setDueDate] = useState("")

  const handleSubmit = async () => {
    if (!role || !dueDate) return

    const config = { 
      role, 
      dueDate, 
      nickname: role === 'dad' ? '准爸爸' : '准妈妈' 
    }

    // 1. Save to LocalStorage (Immediate & Fallback)
    saveUserConfig(config)

    // 2. Try to save to Supabase (if logged in)
    try {
      const { updateProfile } = await import("@/app/actions/profile")
      await updateProfile(config)
    } catch (e) {
      console.log("Not logged in or sync failed, using local storage only")
    }

    // 跳转回首页，首页会检测 config 并显示 Dashboard
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            🌱
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">欢迎来到孕期导航</CardTitle>
          <CardDescription>
            只需两步，为您定制专属的孕期行动指南
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold">我是...</Label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => setRole('dad')}
                className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${
                  role === 'dad' 
                    ? "border-blue-500 bg-blue-50 text-blue-700" 
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="text-2xl mb-1">🧢</div>
                <div className="font-medium">准爸爸</div>
                <div className="text-xs text-slate-500 mt-1">负责执行与后勤</div>
              </div>
              <div 
                 onClick={() => setRole('mom')}
                 className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${
                  role === 'mom' 
                    ? "border-pink-500 bg-pink-50 text-pink-700" 
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="text-2xl mb-1">🎀</div>
                <div className="font-medium">准妈妈</div>
                <div className="text-xs text-slate-500 mt-1">负责感受与记录</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="dueDate" className="text-base font-semibold">预产期是...</Label>
            <Input 
              id="dueDate"
              type="date" 
              className="h-12 text-lg"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <p className="text-xs text-slate-500">如果不确定，可以填一个大概日期，后续可修改</p>
          </div>

          <Button 
            className="w-full h-12 text-lg mt-6" 
            onClick={handleSubmit}
            disabled={!role || !dueDate}
          >
            开启旅程
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
