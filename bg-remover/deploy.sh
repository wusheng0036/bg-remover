#!/bin/bash
# 🚀 Cloudflare Pages 一键部署脚本
# 完全自动化部署 bg-remover 到 Cloudflare Pages

set -e

echo "🌀 开始部署到 Cloudflare Pages..."
echo ""

# 检查是否已登录
echo "📝 检查 Cloudflare 登录状态..."
if ! npx wrangler whoami 2>/dev/null | grep -q "logged in"; then
    echo "⚠️  未登录，正在打开浏览器认证..."
    echo "👉 请在浏览器中完成 Cloudflare 登录授权"
    npx wrangler login
fi

echo "✅ 登录成功！"
echo ""

# 进入项目目录
cd "$(dirname "$0")"

# 检查构建
if [ ! -d ".next" ]; then
    echo "🔨 首次构建..."
    npm run build
fi

# 创建或更新部署
echo "🚀 正在部署到 Cloudflare Pages..."
echo ""

# 尝试创建项目（如果不存在）
npx wrangler pages project create bg-remover 2>/dev/null || echo "ℹ️  项目已存在，跳过创建"

# 部署
echo "📦 上传文件中..."
npx wrangler pages deployment create --project-name=bg-remover ./.next

echo ""
echo "✅ 部署完成！"
echo ""
echo "🌐 访问地址："
echo "   https://bg-remover.<your-subdomain>.pages.dev"
echo ""
echo "📝 下一步："
echo "   1. 在 Cloudflare Dashboard 设置 REMOVE_BG_API_KEY 环境变量"
echo "   2. 访问 https://dash.cloudflare.com/ → Pages → bg-remover"
echo ""
