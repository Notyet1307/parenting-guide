# Implementation Plan: 孕期导航仪 MVP

基于已确认的 `PROJECT_SPEC.md` 和 `PRODUCT_CONSTITUTION.md`，制定以下实施计划。

## 1. 技术架构 (Technical Architecture)

*   **Runtime**: Node.js (Latest LTS)
*   **Framework**: Next.js 14+ (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **UI Library**: Shadcn/UI (Radix Primitives)
*   **State Management**: React Context (for MVP) + LocalStorage (Data Persistence)
*   **Icons**: Lucide React

## 2. 目录结构 (Directory Structure)

```
Parenting_Website/
├── app/
│   ├── layout.tsx       # Root Layout (Fonts, Metadata)
│   ├── page.tsx         # Landing Page / Dashboard (Conditional)
│   ├── onboarding/      # P0: User Init (Due Date, Role)
│   │   └── page.tsx
│   └── globals.css      # Tailwind Imports
├── components/
│   ├── ui/              # Shadcn components (Button, Card, etc.)
│   ├── timeline/        # P0: Timeline Feature
│   │   ├── week-slider.tsx
│   │   └── baby-info-card.tsx
│   ├── tasks/           # P0: Task Feature
│   │   ├── task-list.tsx
│   │   └── task-item.tsx
│   └── shared/          # Header, Footer
├── lib/
│   ├── utils.ts         # Shadcn utils
│   ├── types.ts         # TS Interfaces (User, Task, Timeline)
│   ├── data.ts          # Static Data (Weekly Tasks, Timeline Info)
│   └── store.ts         # LocalStorage Logic
└── public/              # Static Assets
```

## 3. 数据模型设计 (MVP: Client-Side Only)

由于 MVP 不涉及后端数据库，我们将数据存储在 LocalStorage 中，并通过 `lib/data.ts` 提供静态内容。

### `UserConfig` (LocalStorage)
```typescript
interface UserConfig {
  role: 'dad' | 'mom';
  dueDate: string; // ISO Date
  nickname?: string;
}
```

### `WeeklyData` (Static Data in `data.ts`)
```typescript
interface WeeklyContent {
  week: number;
  babySize: string; // e.g., "Seed", "Blueberry"
  summary: string; // P0-1: 本周重点
  tasks: {
    dad: string[]; // P0-2: 准爸任务
    mom: string[]; // P0-2: 准妈任务
  };
  tips: string[]; // P0-3: 知识卡片
}
```

## 4. 开发步骤 (Step-by-Step)

### Phase 1: Foundation (预计 10 mins)
*   [ ] **Init**: 初始化 Next.js 项目 (Clean boilerplate)
*   [ ] **Setup**: 配置 Tailwind CSS & Lucide Icons
*   [ ] **UI**: 安装核心 Shadcn 组件 (Button, Card, Input, Label, Tabs, ScrollArea)

### Phase 2: Core Components (预计 30 mins)
*   [ ] **Data**: 编写 `lib/data.ts` (模拟前 12 周的数据)
*   [ ] **Utils**: 编写 `lib/store.ts` (处理孕周计算、本地存储)
*   [ ] **Feature**: 开发 `Timeline` 组件 (展示当前周数、水果比喻)
*   [ ] **Feature**: 开发 `TaskList` 组件 (区分角色，支持打钩)

### Phase 3: Integration & Pages (预计 20 mins)
*   [ ] **Page**: 开发 `Onboarding` 页面 (输入预产期，选择角色)
*   [ ] **Page**: 开发主页面 (Dashboard)，整合 Timeline + TaskList
*   [ ] **Logic**: 实现"Onboarding -> Dashboard"的跳转逻辑 (基于 LocalStorage)

## 5. 验证计划 (Verification)
*   **功能验证**:
    *   输入不同预产期，确认"当前孕周"计算正确。
    *   切换 Role (Dad/Mom)，确认看到的任务列表不同。
    *   刷新页面，确认数据（角色、预产期、打钩状态）不丢失。
*   **UI 验证**:
    *   手机/桌面端布局是否均正常（Responsive）。

---

**准备好后，请指示"批准"，我们将开始执行 Phase 1。**
