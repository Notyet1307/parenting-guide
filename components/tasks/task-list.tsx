// components/tasks/task-list.tsx
"use client"

import { useEffect, useState } from "react"
import { TaskItem } from "./task-item"
import { ScrollArea } from "@/components/ui/scroll-area" // Installed in Phase 1
import { saveTaskCompletion, loadTaskCompletion } from "@/lib/store"
import { Role } from "@/lib/types"

interface TaskListProps {
  tasks: string[];
  role: Role;
  week: number;
}

export function TaskList({ tasks, role, week }: TaskListProps) {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load completion status on mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCompletedMap(loadTaskCompletion());
  }, []);

  const handleToggle = (taskIndex: number, checked: boolean) => {
    // Generate a unique ID for the task based on content/week/role
    // Ideally this should be robust, for MVP index is fine if static data doesn't change much
    const taskId = `w${week}-${role}-${taskIndex}`;
    
    const newMap = { ...completedMap, [taskId]: checked };
    setCompletedMap(newMap);
    saveTaskCompletion(taskId, checked);
  };

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-slate-500 mb-3 px-1">
        {role === 'dad' ? "🧢 准爸任务" : "🎀 准妈任务"}
      </h3>
      <ScrollArea className="h-[300px] w-full pr-4">
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <TaskItem 
              key={`${week}-${role}-${index}`}
              id={`w${week}-${role}-${index}`}
              content={task}
              isCompleted={!!completedMap[`w${week}-${role}-${index}`]}
              onToggle={(checked) => handleToggle(index, checked)}
            />
          ))}
          {tasks.length === 0 && (
            <div className="text-center text-slate-400 py-8 text-sm border-2 border-dashed border-slate-100 rounded-lg">
              本周暂无特定任务，好好休息 🎉
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
