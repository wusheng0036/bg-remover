#!/bin/bash
# 跨境电商 AI 助手 - 部署脚本

echo "🚀 开始部署跨境电商 AI 助手..."

# 1. 检查 Node.js
echo "📦 检查 Node.js..."
node -v || { echo "❌ Node.js 未安装"; exit 1; }

# 2. 安装依赖
echo "📦 安装依赖..."
cd /root/.openclaw/workspace-ops/crossborder-ai-agent
npm install --production

# 3. 检查配置文件
echo "⚙️  检查配置文件..."
if [ ! -f config/.env ]; then
    echo "⚠️  配置文件不存在，从模板复制..."
    cp config/default.env config/.env
    echo "📝 请编辑 config/.env 填入你的配置"
fi

# 4. 创建数据目录
echo "📁 创建数据目录..."
mkdir -p data logs

# 5. 启动服务
echo "🚀 启动服务..."
npm start

echo "✅ 部署完成！"
