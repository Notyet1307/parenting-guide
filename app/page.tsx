// app/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadUserConfig, saveUserConfig, calculateCurrentWeek } from "@/lib/store"
import { UserConfig } from "@/lib/types"
import { getWeeklyData } from "@/lib/data"
import { WeekSlider } from "@/components/timeline/week-slider"
import { BabyInfoCard } from "@/components/timeline/baby-info-card"
import { TaskList } from "@/components/tasks/task-list"
import { WelcomeScreen } from "@/components/welcome-screen"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

export default function Dashboard() {
  const router = useRouter()
  const [config, setConfig] = useState<UserConfig | null>(null)
  const [currentWeek, setCurrentWeek] = useState<number>(4)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      // 1. Check Cloud Auth
      const { createClient } = await import("@/utils/supabase/client")
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        // Fetch Cloud Profile
        const { getProfile, updateProfile } = await import("@/app/actions/profile")
        const profile = await getProfile()
        
        // Strategy: Cloud > Local > Onboarding
        if (profile && profile.role && profile.dueDate) {
          // Case A: Cloud has data -> Sync DOWN to Local & Show Dashboard
          saveUserConfig(profile) 
          setConfig(profile)
          
          if (profile.dueDate) {
             const week = calculateCurrentWeek(profile.dueDate)
             setCurrentWeek(week)
           }
        } else {
          // Case B: Cloud empty. Check Local.
          const localConfig = loadUserConfig()
          if (localConfig.role && localConfig.dueDate) {
            // Case B1: Has Local Data (Legacy/Phase 1 User) -> Sync UP to Cloud & Show Dashboard
            console.log("Syncing local data to cloud...")
            setConfig(localConfig) // Show immediately for speed
            
            // Sync in background
            await updateProfile(localConfig)
            
            if (localConfig.dueDate) {
               const week = calculateCurrentWeek(localConfig.dueDate)
               setCurrentWeek(week)
            }
          } else {
            // Case B2: No Cloud, No Local -> Go to Onboarding
             router.push("/onboarding")
             return
          }
        }
      } else {
        // No Cloud Auth -> Check Local Storage
        const savedConfig = loadUserConfig()
        if (savedConfig.role && savedConfig.dueDate) {
           // Offline User -> Show Dashboard
           setConfig(savedConfig)
           if (savedConfig.dueDate) {
             const week = calculateCurrentWeek(savedConfig.dueDate)
             setCurrentWeek(week)
           }
        } else {
           // New User -> Show Welcome Screen
           // Do nothing, config stays null, render WelcomeScreen
        }
      }
      setLoading(false)
    }
    init()
  }, [router])

  const handleLogout = async () => {
    const { createClient } = await import("@/utils/supabase/client")
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    // Clear config to force re-evaluation or showing welcome screen? 
    // Actually, when logging out, we might want to keep local data or clear it? 
    // For now, let's reload the page to restart the init flow
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  // If no config found (and not loading), show Welcome Screen
  if (!config) {
    return <WelcomeScreen />
  }

  const weeklyContent = getWeeklyData(currentWeek) || {
    week: currentWeek,
    babySize: "未知",
    summary: "暂无本周数据",
    tasks: { dad: [], mom: [] },
    tips: []
  }

  const currentRoleTasks = config?.role === 'dad' ? weeklyContent.tasks.dad : weeklyContent.tasks.mom

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
