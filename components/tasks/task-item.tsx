// components/tasks/task-item.tsx
"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface TaskItemProps {
  id: string;
  content: string;
  isCompleted: boolean;
  onToggle: (checked: boolean) => void;
}

export function TaskItem({ id, content, isCompleted, onToggle }: TaskItemProps) {
  return (
    <div className={`flex items-top space-x-3 p-3 rounded-lg border transition-all ${
      isCompleted ? "bg-slate-50 border-slate-100" : "bg-white border-slate-200 hover:border-slate-300"
    }`}>
      <Checkbox 
        id={id} 
        checked={isCompleted} 
        onCheckedChange={(checked) => onToggle(checked === true)}
        className="mt-1"
      />
      <div className="grid gap-1.5 leading-none">
        <Label 
          htmlFor={id} 
          className={`text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${
            isCompleted ? "text-slate-400 line-through" : "text-slate-700"
          }`}
        >
          {content}
        </Label>
      </div>
    </div>
  )
}
