# 孕期导航 (Parenting Guide)

一个帮助准爸准妈从容度过孕期的智能助手。

![Status](https://img.shields.io/badge/Status-Beta-purple) ![Stack](https://img.shields.io/badge/Tech-Next.js%20%7C%20Supabase-blue)

## ✨ 当前能力 (Capabilities v0.2.0)

### ☁️ 混合云同步 (Hybrid Sync)
- **自动漫游**: 登录状态下，数据（预产期、角色、任务勾选、自定义任务）实时存入 Supabase 云端数据库。在你换手机、换电脑登录时，数据自动同步。
- **无缝降级**: 未登录或网络断开时，自动降级为 LocalStorage（本地存储），保证应用始终可用。

### 🔐 用户系统 (Auth)
- **注册/登录**: 支持邮箱/密码与 Supabase Auth 的完整集成。
- **身份管理**: 区分“准爸爸/准妈妈”角色，不同角色看到不同的系统任务清单。

### 📋 任务管理 (Task Management)
- **系统任务**: 每周预设的硬核任务清单（专业知识库）。
- **自定义任务**: 用户可手动添加临时待办（支持增删改查，且云端同步）。

### 🤰 智能时间轴
- 根据预产期自动计算当前孕周。
- 可视化展示本周宝宝大小（水果比喻）及发育概要。

## 🚀 部署流程 (Deployment Workflow)

本项目使用了 **Server Actions** 和 **SSR**，推荐使用 **Vercel** 进行部署。

### 1. 首次部署 (Setup)
1.  Fork 本仓库到你的 GitHub。
2.  在 [Vercel](https://vercel.com) 创建新项目，导入该仓库。
3.  在 **Environment Variables** 中填入以下变量（从 Supabase 后台获取）：
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4.  点击 **Deploy**。

### 2. 日常更新 (Routine Update)
只需将代码推送到 GitHub 的 `main` 分支，Vercel 会自动触发构建并更新线上版本。

```bash
git push origin main
```

## 🛠️ 本地开发 (Development)

1.  克隆仓库
2.  安装依赖: `npm install`
3.  配置 `.env.local` (参考上文环境变量)
4.  启动服务: `npm run dev`

打开 [http://localhost:3000](http://localhost:3000) 查看效果。
