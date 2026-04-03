# 📦 Cloudflare Pages 部署指南

## 步骤 1: 获取 Remove.bg API Key

1. 访问 https://www.remove.bg/api
2. 注册账号（免费）
3. 获取 API Key（在 Dashboard 里）
4. 免费额度：每月 50 张高清，无限张预览（小图）

## 步骤 2: 推送到 GitHub

```bash
cd bg-remover
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bg-remover.git
git push -u origin main
```

## 步骤 3: Cloudflare Pages 部署

### 3.1 登录 Cloudflare

访问 https://dash.cloudflare.com/

### 3.2 创建 Pages 项目

1. 左侧菜单 → **Workers & Pages** → **Create application**
2. 选择 **Pages** 标签 → **Connect to Git**
3. 选择你的 `bg-remover` 仓库

### 3.3 配置构建设置

```
Build command: npm run build
Build output directory: out
Root directory: /
```

### 3.4 设置环境变量（重要！）

点击 **Advanced** → **Add variable**:

| Variable name | Value |
|--------------|-------|
| `REMOVE_BG_API_KEY` | 你的 API Key |

### 3.5 部署

点击 **Save and Deploy**

等待 2-3 分钟，部署完成后会给你一个 `https://xxx.pages.dev` 域名

## 步骤 4: 自定义域名（可选）

1. Pages 项目 → **Custom domains** → **Set up a custom domain**
2. 输入你的域名
3. 按提示配置 DNS（Cloudflare 自动处理）

## 步骤 5: 测试

访问你的部署地址，上传一张图片测试！

---

## 🐛 常见问题

### 构建失败

检查 `package.json` 里的依赖是否正确安装：
```bash
npm install
```

### API 调用失败

1. 确认环境变量已正确设置
2. 检查 API Key 是否有效
3. 查看 Cloudflare Pages 的 **Deployment logs**

### 图片太大

前端已限制 5MB，如需调整修改 `app/page.tsx` 里的 `maxSize`

### 访问速度慢

Cloudflare 全球 CDN 已自动启用，如果还慢可以考虑：
- 开启 Cloudflare 的 **Auto Minify**
- 启用 **Brotli** 压缩

---

## 📊 监控用量

访问 https://www.remove.bg/dashboard 查看 API 使用量

如果快要用完：
1. 升级 Remove.bg 套餐
2. 或者限制用户每日使用次数（需加后端逻辑）

---

*部署完成记得告诉我！* 🌀
