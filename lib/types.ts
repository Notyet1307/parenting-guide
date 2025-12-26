// lib/types.ts

export type Role = 'dad' | 'mom';

export interface UserConfig {
  role: Role | null;
  dueDate: string | null; // ISO Date string
  nickname?: string;
}

export interface TaskItem {
  id: string;
  content: string;
  isCompleted: boolean;
}

export interface WeeklyTasks {
  dad: string[];
  mom: string[];
}

export interface WeeklyContent {
  week: number;
  babySize: string;
  babySizeImage?: string;
  summary: string;
  tasks: WeeklyTasks;
  tips: string[];
}

export interface CustomTask {
  id: string;
  week: number;
  role: Role;
  content: string;
  isCompleted: boolean;
  createdAt: number;
}
