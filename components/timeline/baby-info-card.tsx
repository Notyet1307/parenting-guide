// components/timeline/baby-info-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WeeklyContent } from "@/lib/types"

interface BabyInfoCardProps {
  data: WeeklyContent;
}

export function BabyInfoCard({ data }: BabyInfoCardProps) {
  return (
    <Card className="w-full bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 border-0 shadow-lg ring-1 ring-purple-100/50 overflow-hidden relative">
      {data.babySizeImage && (
        <div className="absolute inset-0 z-0">
          <img 
            src={data.babySizeImage} 
            alt={data.babySize}
            className="w-full h-full object-cover opacity-15 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-purple-50/50 to-fuchsia-50/50" />
        </div>
      )}
      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-200/20 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
      <CardHeader className="pb-2 relative z-10">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-fuchsia-700 bg-clip-text text-transparent">
            第 {data.week} 周
          </CardTitle>
          <span className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-sm font-bold text-purple-700 shadow-sm border border-purple-100">
            {data.babySize}
          </span>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-slate-700 leading-relaxed font-medium">
          {data.summary}
        </p>
      </CardContent>
    </Card>
  )
}
