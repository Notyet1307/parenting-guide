"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export function WelcomeScreen() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-2 shadow-inner">
            <span className="text-4xl">👶</span>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              孕期导航
            </CardTitle>
            <CardDescription className="text-lg">
              准爸准妈的智能行动指南
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200"
            onClick={() => router.push("/login")}
          >
            登录 / 注册
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">或者</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full h-12 text-lg border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            onClick={() => router.push("/onboarding")}
          >
            离线试用
          </Button>
          <p className="text-xs text-center text-slate-400 mt-4">
            登录后可实现多端数据同步，离线数据仅保存在本机
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
