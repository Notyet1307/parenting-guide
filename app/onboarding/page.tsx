// app/onboarding/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveUserConfig } from "@/lib/store"
import { Role } from "@/lib/types"
import { PartnerPairing } from "@/components/settings/partner-pairing"

export default function OnboardingPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role | null>(null)
  const [dueDate, setDueDate] = useState("")
  const [user, setUser] = useState<any>(null)
  const [isUpdateMode, setIsUpdateMode] = useState(false)

  useEffect(() => {
    // Check Auth & Load Config
    const init = async () => {
      // 1. Auth Status
      const { createClient } = await import("@/utils/supabase/client")
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // 2. Load existing config (Local or Cloud)
      // Since Dashboard syncs them, LocalStorage should be up to date generally
      // But let's fetch from Store first for speed
      const { loadUserConfig } = await import("@/lib/store")
      const existing = loadUserConfig()
      if (existing && existing.role && existing.dueDate) {
        setRole(existing.role)
        setDueDate(existing.dueDate)
        setIsUpdateMode(true)
      }
    }
    init()
  }, [])

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
      if (user) {
        const { updateProfile } = await import("@/app/actions/profile")
        await updateProfile(config)
      }
    } catch (e) {
      console.log("Not logged in or sync failed, using local storage only")
    }

    // 跳转回首页
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 gap-6">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            🌱
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            {isUpdateMode ? "个人设置" : "欢迎来到孕期导航"}
          </CardTitle>
          <CardDescription>
            {isUpdateMode ? "修改您的角色和预产期信息" : "为您定制专属的孕期行动指南"}
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
          </div>

          <Button 
            className="w-full h-12 text-lg mt-6" 
            onClick={handleSubmit}
            disabled={!role || !dueDate}
          >
            {isUpdateMode ? "保存设置" : "开启旅程"}
          </Button>
        </CardContent>
      </Card>
      
      {/* Partner Pairing Section (Only if Logged In) */}
      {user && (
         <div className="w-full max-w-md">
            <div className="flex items-center gap-2 mb-2 px-1">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">高级功能</span>
               <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            {/* Dynamic Import or standard import? Standard is fine since it's client component */}
             <PartnerPairing />
         </div>
      )}
    </div>
  )
}
