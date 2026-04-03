# 🚀 Cloudflare Pages 部署指南

## 方式一：Git 部署（推荐 ⭐）

### 1. 推送到 GitHub

```bash
cd /root/.openclaw/workspace-ops

# 初始化 Git（如果还没有）
git init
git config user.email "yongdong0889@gmail.com"
git config user.name "风火轮"

# 添加远程仓库（替换为你的 GitHub 仓库）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 推送代码
git add -A
git commit -m "Initial commit"
git push -u origin main
```

### 2. 在 Cloudflare Dashboard 部署

1. 访问：**https://dash.cloudflare.com/**
2. 点击左侧 **Pages** → **Create a project**
3. 选择 **Connect to Git**
4. 选择你的仓库
5. 配置构建设置：
   - **Framework preset**: `Next.js`
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `bg-remover`（可选，如果代码在子目录）
6. 点击 **Save and Deploy**

### 3. 设置环境变量

在 Cloudflare Dashboard → Pages → 你的项目 → **Settings** → **Environment variables**：

添加：
- `REMOVE_BG_API_KEY` = 你的 Remove.bg API Key

---

## 方式二：Wrangler CLI 直接部署

### 1. 更新 wrangler.toml

```toml
name = "bg-remover"
compatibility_date = "2024-01-01"

[vars]
REMOVE_BG_API_KEY = "your_api_key"
```

### 2. 执行部署命令

```bash
cd /root/.openclaw/workspace-ops/bg-remover

# 登录 Cloudflare
npx wrangler login

# 创建项目（首次）
npx wrangler pages project create bg-remover

# 部署
npx wrangler pages deployment create --project-name=bg-remover ./.next
```

---

## 📁 项目结构

```
bg-remover/
├── app/
│   ├── page.tsx          # 主页面（带右上角登录按钮 ✅）
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       └── remove/
│           └── route.ts  # Edge Runtime API
├── wrangler.toml         # Cloudflare 配置
├── package.json
├── next.config.js
└── .env.example
```

---

## ✅ 已完成的修改

1. **登录按钮移至右上角** - 使用绝对定位
2. **API 改为 Edge Runtime** - 兼容 Cloudflare Pages Functions
3. **代码已提交到 Git** - 随时可以推送

---

## 🔗 访问地址

部署成功后，你的网站地址将是：
```
https://bg-remover.<your-subdomain>.pages.dev
```

可以在 Cloudflare Dashboard 自定义域名。

---

## ⚠️ 注意事项

1. **API Key 安全**：不要在代码中硬编码 API Key，使用环境变量
2. **构建输出**：Next.js 14 使用 `.next` 目录，不是 `out`
3. **Edge Runtime**：`/api/remove` 使用 Edge Runtime，支持 Cloudflare

---

**作者**: 风火轮 🌀  
**更新日期**: 2026-04-03
