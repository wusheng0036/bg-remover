# 🌀 Background Remover

一键去除图片背景的在线工具，基于 Remove.bg API。

## ✨ 功能

- ✅ 拖拽上传图片
- ✅ 前后对比滑块预览
- ✅ 缩放/平移查看细节
- ✅ 多种背景预览（透明/白/黑）
- ✅ 一键下载 PNG
- ✅ 纯内存处理，不存储图片

## 🚀 快速开始

### 1. 获取 API Key

访问 [remove.bg API](https://www.remove.bg/api) 注册并获取免费 API Key（每月 50 张免费）

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 填入你的 API Key
```

### 3. 安装依赖

```bash
npm install
```

### 4. 本地开发

```bash
npm run dev
# 访问 http://localhost:3000
```

### 5. 构建

```bash
npm run build
```

## 📦 部署到 Cloudflare Pages

### 方式一：Git 部署（推荐）

1. 代码推送到 GitHub
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. 进入 Pages → Create a project → Connect to Git
4. 选择仓库，设置：
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Environment variables**: 添加 `REMOVE_BG_API_KEY`
5. 点击 Deploy

### 方式二：Wrangler CLI 部署

```bash
npm install -g wrangler
wrangler pages project create bg-remover
wrangler pages deployment create --project-name=bg-remover ./out
```

### 配置环境变量

在 Cloudflare Dashboard → Pages → 你的项目 → Settings → Environment variables 添加：
- `REMOVE_BG_API_KEY`: 你的 API Key

## 📁 项目结构

```
bg-remover/
├── app/
│   ├── page.tsx          # 主页面（上传 + 预览）
│   ├── layout.tsx        # 布局
│   ├── globals.css       # 全局样式
│   └── api/
│       └── remove/       # 去背景 API
│           └── route.ts
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

## 💰 成本

| 阶段 | 月处理量 | 成本 |
|------|---------|------|
| 免费 | 50 张 | $0 |
| 基础 | 500 张 | $9 |
| 专业 | 2000 张 | $29 |
| 企业 | 自定义 | 联系销售 |

## ⚠️ 注意事项

1. **图片大小限制**: 最大 5MB
2. **支持格式**: PNG, JPG, WebP
3. **API 限流**: 免费账户每秒 1 次请求
4. **隐私**: 图片不存储，处理完即删除

## 🛠️ 技术栈

- **前端**: Next.js 14 + React + TypeScript
- **样式**: TailwindCSS
- **组件**: 
  - `react-dropzone` - 拖拽上传
  - `react-compare-slider` - 对比滑块
  - `react-zoom-pan-pinch` - 缩放平移
- **API**: Remove.bg
- **部署**: Cloudflare Pages

## 📝 待办

- [ ] 批量处理
- [ ] 历史记录（LocalStorage）
- [ ] 背景替换（纯色/模板）
- [ ] 图片编辑（裁剪/旋转）
- [ ] 浏览器插件

## 📄 License

MIT

---

*Made with 🌀 by your AI assistant*
