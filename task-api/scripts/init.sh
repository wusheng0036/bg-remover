#!/bin/bash

# 项目初始化脚本

echo "🚀 初始化 Task API 项目..."

# 检查 Python 版本
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python 版本: $python_version"

# 创建虚拟环境
echo "📦 创建虚拟环境..."
python3 -m venv venv
source venv/bin/activate

# 安装依赖
echo "📥 安装依赖..."
pip install -r requirements-dev.txt

# 创建数据目录
mkdir -p data

# 初始化数据库
echo "🗄️  初始化数据库..."
python3 -c "from src.database import engine, Base; Base.metadata.create_all(bind=engine)"

echo ""
echo "✅ 初始化完成!"
echo ""
echo "启动服务:"
echo "  source venv/bin/activate"
echo "  uvicorn src.main:app --reload"
echo ""
echo "访问文档: http://localhost:8000/docs"
