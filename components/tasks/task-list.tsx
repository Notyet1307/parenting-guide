// components/tasks/task-list.tsx
"use client"

import { useEffect, useState } from "react"
import { TaskItem } from "./task-item"
import { ScrollArea } from "@/components/ui/scroll-area" 
import { saveTaskCompletion, loadTaskCompletion, loadCustomTasks, addCustomTask, deleteCustomTask, toggleCustomTaskCompletion } from "@/lib/store"
import { Role, CustomTask } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface TaskListProps {
  tasks: string[];
  role: Role;
  week: number;
}

export function TaskList({ tasks, role, week, user }: TaskListProps & { user?: any }) {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
  const [newTaskContent, setNewTaskContent] = useState("");

  // Load Data
  useEffect(() => {
    if (user) {
      // Logged in: Load from Supabase
      const fetchTasks = async () => {
         const { getTasks } = await import("@/app/actions/tasks")
         const { system, custom } = await getTasks(week)
         
         // Convert system tasks map
         const sysMap: Record<string, boolean> = {}
         system.forEach((t: any) => {
           sysMap[t.task_id] = t.is_completed
         })
         setCompletedMap(sysMap)

         // Convert custom tasks
         setCustomTasks(custom.map((t: any) => ({
           id: t.id,
           week: t.week,
           role: role, // Assuming role filter isn't strict for custom tasks stored in DB currently, or we can filter
           content: t.content,
           isCompleted: t.is_completed,
           createdAt: t.created_at
         })))
      }
      fetchTasks()
    } else {
      // Guest: Load from LocalStorage
      setCompletedMap(loadTaskCompletion());
      setCustomTasks(loadCustomTasks(week, role));
    }
  }, [week, role, user]);

  const handleSystemToggle = async (taskIndex: number, checked: boolean) => {
    const taskId = `w${week}-${role}-${taskIndex}`;
    
    // Optimistic Update
    const newMap = { ...completedMap, [taskId]: checked };
    setCompletedMap(newMap);
    
    if (user) {
       // Sync to Supabase
       const { toggleSystemTask } = await import("@/app/actions/tasks")
       await toggleSystemTask(taskId, checked, week)
    } else {
       // Sync to LocalStorage
       saveTaskCompletion(taskId, checked);
    }
  };

  const handleAddCustomTask = async () => {
    if (!newTaskContent.trim()) return;

    if (user) {
      // Supabase
      const { addCustomTask: addAction } = await import("@/app/actions/tasks")
      await addAction(newTaskContent.trim(), week)
      // Re-fetch or simplistic refresh. For smooth UX, better to re-fetch or append optimistic
      // Let's just trigger a re-fetch or waiting for server action revalidatePath might auto-refresh this if it was a server component.
      // Since this is client component state, we need to manually update or re-fetch.
      // Re-fetching is easier for consistency.
      const { getTasks } = await import("@/app/actions/tasks")
      const { custom } = await getTasks(week)
      setCustomTasks(custom.map((t: any) => ({
           id: t.id,
           week: t.week,
           role: role,
           content: t.content,
           isCompleted: t.is_completed,
           createdAt: t.created_at
      })))
    } else {
      // LocalStorage
      const task = addCustomTask(week, role, newTaskContent.trim());
      setCustomTasks([...customTasks, task]);
    }
    setNewTaskContent("");
  };

  const handleDeleteCustomTask = async (id: string) => {
    // Optimistic
    setCustomTasks(customTasks.filter(t => t.id !== id));

    if (user) {
      const { deleteCustomTask: deleteAction } = await import("@/app/actions/tasks")
      await deleteAction(id)
    } else {
      deleteCustomTask(id);
    }
  };

  const handleCustomToggle = async (id: string, checked: boolean) => {
    // Optimistic
    setCustomTasks(customTasks.map(t => 
      t.id === id ? { ...t, isCompleted: checked } : t
    ));

    if (user) {
      const { toggleCustomTask: toggleAction } = await import("@/app/actions/tasks")
      await toggleAction(id, checked)
    } else {
      toggleCustomTaskCompletion(id, checked);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-slate-500 mb-3 px-1">
        {role === 'dad' ? "🧢 准爸任务" : "🎀 准妈任务"}
      </h3>
      <ScrollArea className="h-[350px] w-full pr-4">
        <div className="space-y-3 pb-4">
          {/* System Tasks */}
          {tasks.map((task, index) => (
            <TaskItem 
              key={`sys-${week}-${role}-${index}`}
              id={`w${week}-${role}-${index}`}
              content={task}
              isCompleted={!!completedMap[`w${week}-${role}-${index}`]}
              onToggle={(checked) => handleSystemToggle(index, checked)}
            />
          ))}

          {/* Custom Tasks */}
          {customTasks.map((task) => (
            <TaskItem 
              key={task.id}
              id={task.id}
              content={task.content}
              isCompleted={task.isCompleted}
              onToggle={(checked) => handleCustomToggle(task.id, checked)}
              onDelete={() => handleDeleteCustomTask(task.id)}
            />
          ))}

          {tasks.length === 0 && customTasks.length === 0 && (
            <div className="text-center text-slate-400 py-8 text-sm border-2 border-dashed border-slate-100 rounded-lg">
              本周暂无特定任务，好好休息 🎉
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="mt-4 flex gap-2 pt-4 border-t border-slate-100">
        <Input 
          placeholder="添加自定义任务..." 
          value={newTaskContent}
          onChange={(e) => setNewTaskContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTask()}
          className="bg-slate-50 border-slate-200"
        />
        <Button onClick={handleAddCustomTask} size="icon" className="shrink-0 bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
