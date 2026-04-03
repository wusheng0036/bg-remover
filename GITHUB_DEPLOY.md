# 🚀 GitHub + Cloudflare Pages 部署指南

## ✅ 第 1 步：在 GitHub 创建仓库

1. 访问：**https://github.com/new**
2. 仓库名：`bg-remover`
3. 设为 **Public** 或 **Private** 都可以
4. **不要** 初始化 README（我们已有代码）
5. 点击 **Create repository**

---

## ✅ 第 2 步：推送代码到 GitHub

### 方案 A：使用 HTTPS（推荐）

```bash
cd /root/.openclaw/workspace-ops

# 添加远程仓库（替换 yongdong 为你的实际 GitHub 用户名）
git remote add origin https://github.com/yongdong/bg-remover.git

# 推送代码
git push -u origin main
```

### 方案 B：使用 SSH（如果你配置了 SSH key）

```bash
cd /root/.openclaw/workspace-ops
git remote add origin git@github.com:yongdong/bg-remover.git
git push -u origin main
```

---

## ✅ 第 3 步：Cloudflare Pages 自动部署

1. 访问：**https://dash.cloudflare.com/**
2. 点击左侧 **Pages** → **Create a project**
3. 选择 **Connect to Git**
4. 选择你的 **bg-remover** 仓库
5. **Configure settings**:
   - **Framework preset**: `Next.js`
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `bg-remover`（如果代码在子目录）
6. 点击 **Save and Deploy**

---

## ✅ 第 4 步：设置 API Key

部署开始后：

1. 在 Cloudflare Dashboard → Pages → **bg-remover**
2. 点击 **Settings** → **Environment variables**
3. 点击 **Add variable**
4. 添加：
   - **Variable name**: `REMOVE_BG_API_KEY`
   - **Value**: 你的 Remove.bg API Key
5. 点击 **Save**
6. 回到 **Deployments** 标签
7. 点击最新的部署 → **Retry deployment**

---

## 🎯 快速命令汇总

```bash
# 1. 进入项目目录
cd /root/.openclaw/workspace-ops

# 2. 添加 GitHub 远程（替换用户名）
git remote add origin https://github.com/yongdong/bg-remover.git

# 3. 推送代码
git push -u origin main

# 4. 查看状态
git status
```

---

## 📝 注意事项

1. **GitHub 用户名**：可能是 `yongdong` 而不是邮箱，请在 GitHub 个人主页确认
2. **首次推送**：可能需要 GitHub 账号密码或 Personal Access Token
3. **构建时间**：首次部署大约需要 2-5 分钟

---

## 🔗 部署完成后的访问地址

```
https://bg-remover.pages.dev
```

可以在 Cloudflare Dashboard 自定义域名。

---

**作者**: 风火轮 🌀  
**更新日期**: 2026-04-03
