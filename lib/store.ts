// lib/store.ts
import { UserConfig } from './types';

const STORAGE_KEY = 'parenting_app_config';
const TASKS_KEY = 'parenting_app_tasks';

export function saveUserConfig(config: UserConfig) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
}

export function loadUserConfig(): UserConfig {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return { role: null, dueDate: null };
}

export function calculateCurrentWeek(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  
  // 预产期是 40 周 (280天)
  // 怀孕天数 = 280 - (预产期 - 今天)
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const pregnantDays = 280 - diffDays;
  
  let currentWeek = Math.ceil(pregnantDays / 7);
  
  // 边界处理
  if (currentWeek < 1) currentWeek = 1;
  if (currentWeek > 40) currentWeek = 40;
  
  return currentWeek;
}

// Simple Task Storage: Key = "week-role-index" or similar?
// Let's store completed task IDs: "week4-dad-0"
export function saveTaskCompletion(taskId: string, isCompleted: boolean) {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(TASKS_KEY);
    const tasks = stored ? JSON.parse(stored) : {};
    tasks[taskId] = isCompleted;
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }
}

export function loadTaskCompletion(): Record<string, boolean> {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(TASKS_KEY);
    return stored ? JSON.parse(stored) : {};
  }
  return {};
}

// Custom Tasks Logic
import { CustomTask, Role } from './types';
const CUSTOM_TASKS_KEY = 'parenting_app_custom_tasks';

export function loadCustomTasks(week: number, role: Role): CustomTask[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(CUSTOM_TASKS_KEY);
    if (!stored) return [];
    
    const allTasks: CustomTask[] = JSON.parse(stored);
    return allTasks
      .filter(t => t.week === week && t.role === role)
      .sort((a, b) => a.createdAt - b.createdAt);
  }
  return [];
}

export function addCustomTask(week: number, role: Role, content: string): CustomTask {
  const newTask: CustomTask = {
    id: crypto.randomUUID(),
    week,
    role,
    content,
    isCompleted: false,
    createdAt: Date.now(),
  };

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(CUSTOM_TASKS_KEY);
    const allTasks: CustomTask[] = stored ? JSON.parse(stored) : [];
    allTasks.push(newTask);
    localStorage.setItem(CUSTOM_TASKS_KEY, JSON.stringify(allTasks));
  }
  return newTask;
}

export function deleteCustomTask(id: string) {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(CUSTOM_TASKS_KEY);
    if (stored) {
      let allTasks: CustomTask[] = JSON.parse(stored);
      allTasks = allTasks.filter(t => t.id !== id);
      localStorage.setItem(CUSTOM_TASKS_KEY, JSON.stringify(allTasks));
    }
  }
}

export function toggleCustomTaskCompletion(id: string, isCompleted: boolean) {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(CUSTOM_TASKS_KEY);
    if (stored) {
      const allTasks: CustomTask[] = JSON.parse(stored);
      const index = allTasks.findIndex(t => t.id === id);
      if (index !== -1) {
        allTasks[index].isCompleted = isCompleted;
        localStorage.setItem(CUSTOM_TASKS_KEY, JSON.stringify(allTasks));
      }
    }
  }
}
