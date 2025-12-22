// components/timeline/week-slider.tsx
"use client"


// Checking specific list: button card input label tabs scroll-area. Slider is MISSING.
// I need to install it.
// Implementation plan didn't list Slider explicitly in 'add' but listed 'Timeline' feature.
// I will use 'ScrollArea' for MVP week selection or install Slider.
// Slider is better. I should install it vertically or just use buttons?
// For MVP, maybe simple Previous/Next buttons or just a number input?
// Or I can auto-install Slider now.
// I'll stick to a simple clean interface: [ < ] Week X [ > ]
// Much simpler than a slider on mobile. This "Navigation" paradigm fits.

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface WeekSliderProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
}

export function WeekSlider({ currentWeek, onWeekChange }: WeekSliderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-4 bg-white rounded-xl shadow-sm border border-slate-100 mb-4">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => onWeekChange(Math.max(1, currentWeek - 1))}
        disabled={currentWeek <= 1}
      >
        <ChevronLeft className="h-6 w-6 text-slate-500" />
      </Button>
      
      <div className="text-center">
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Current Week</span>
        <div className="text-xl font-bold text-slate-800">{currentWeek}</div>
      </div>

      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => onWeekChange(Math.min(40, currentWeek + 1))}
        disabled={currentWeek >= 40}
      >
        <ChevronRight className="h-6 w-6 text-slate-500" />
      </Button>
    </div>
  )
}
