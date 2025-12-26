// app/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadUserConfig, calculateCurrentWeek } from "@/lib/store"
import { UserConfig } from "@/lib/types"
import { getWeeklyData } from "@/lib/data"
import { WeekSlider } from "@/components/timeline/week-slider"
import { BabyInfoCard } from "@/components/timeline/baby-info-card"
import { TaskList } from "@/components/tasks/task-list"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

export default function Dashboard() {
  const router = useRouter()
  const [config, setConfig] = useState<UserConfig | null>(null)
  const [currentWeek, setCurrentWeek] = useState<number>(4)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check Supabase Auth
    const checkAuth = async () => {
      const { createClient } = await import("@/utils/supabase/client")
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkAuth()

    // Check if user is aboard
    const savedConfig = loadUserConfig()
    if (!savedConfig.role || !savedConfig.dueDate) {
      router.push("/onboarding")
      return
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConfig(savedConfig)
    
    // Calculate current week based on due date
    if (savedConfig.dueDate) {
      const week = calculateCurrentWeek(savedConfig.dueDate)
      setCurrentWeek(week)
    }
    
    setLoading(false)
  }, [router])

  const handleLogout = async () => {
    const { createClient } = await import("@/utils/supabase/client")
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

  if (loading || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  const weeklyContent = getWeeklyData(currentWeek) || {
    week: currentWeek,
    babySize: "未知",
    summary: "暂无本周数据",
    tasks: { dad: [], mom: [] },
    tips: []
  }

  const currentRoleTasks = config.role === 'dad' ? weeklyContent.tasks.dad : weeklyContent.tasks.mom

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20 font-sans selection:bg-purple-100">
      <div className="fixed inset-0 bg-gradient-to-b from-purple-50/30 to-slate-50/50 pointer-events-none z-0" />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 py-3 sticky top-0 z-50 shadow-sm">
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">孕期导航</h1>
          <p className="text-xs text-slate-500 font-medium">
            {config.nickname} · 距预产期还有 <span className="text-purple-600 font-bold">{40 - currentWeek}</span> 周
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
             <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs text-slate-500">
               退出
             </Button>
          ) : (
             <Button variant="ghost" size="sm" onClick={() => router.push('/login')} className="text-xs text-purple-600">
               登录
             </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => router.push("/onboarding")} className="hover:bg-slate-100 rounded-full">
            <Settings className="h-5 w-5 text-slate-400" />
          </Button>
        </div>
      </header>

      <div className="p-4 max-w-md mx-auto space-y-6 relative z-10">
        {/* Timeline Section */}
        <section className="space-y-4">
          <WeekSlider currentWeek={currentWeek} onWeekChange={setCurrentWeek} />
          <BabyInfoCard data={weeklyContent} />
        </section>

        {/* Task Section */}
        <section className="bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
              本周任务
            </h2>
            <span className="text-xs bg-purple-50 text-purple-600 font-semibold px-2.5 py-1 rounded-full border border-purple-100">
              {currentRoleTasks.length} 个待办
            </span>
          </div>
          
          <TaskList 
            tasks={currentRoleTasks}
            role={config.role!} 
            week={currentWeek}
            user={user}
          />
        </section>

        {/* Knowledge Card Section */}
        {weeklyContent.tips.length > 0 && (
          <section className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl p-5 border border-amber-100/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/10 rounded-full blur-xl -mr-5 -mt-5 pointer-events-none" />
            <h2 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2 relative z-10">
              <span className="text-lg">💡</span> 知识卡片
            </h2>
            <ul className="space-y-3 relative z-10">
              {weeklyContent.tips.map((tip, idx) => (
                <li key={idx} className="text-sm text-amber-900/90 leading-relaxed flex items-start group">
                  <span className="mr-2 mt-1 w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform"></span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}
