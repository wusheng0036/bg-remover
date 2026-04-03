# Task API 开发指南

## 开发步骤

### Day 1: 项目搭建

```bash
# 1. 创建项目结构
mkdir task-api && cd task-api
mkdir -p src/routers tests config scripts docs

# 2. 创建虚拟环境
python -m venv venv
source venv/bin/activate

# 3. 安装依赖
pip install fastapi uvicorn sqlalchemy pydantic pydantic-settings
pip freeze > requirements.txt

# 4. 初始化 Git
git init
echo "venv/" > .gitignore
echo "*.db" >> .gitignore
echo "__pycache__/" >> .gitignore
git add .
git commit -m "Initial commit"
```

### Day 2: 核心功能开发

- [x] 数据库模型设计
- [x] Pydantic 模型定义
- [x] CRUD 操作实现
- [x] API 路由开发

### Day 3: 测试与优化

```bash
# 安装测试依赖
pip install pytest pytest-asyncio httpx

# 运行测试
pytest -v

# 代码格式化
black src tests
flake8 src tests
```

### Day 4: 部署准备

```bash
# 构建 Docker 镜像
docker build -t task-api .

# 运行容器
docker run -p 8000:8000 task-api

# 或使用 docker-compose
docker-compose up -d
```

## 常用命令

```bash
# 开发模式启动
uvicorn src.main:app --reload

# 生产模式启动
uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4

# 测试
pytest

# 代码检查
black src tests
flake8 src tests
mypy src
```

## API 使用示例

```bash
# 创建任务
curl -X POST "http://localhost:8000/tasks/" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "完成项目文档",
    "description": "编写 API 文档和 README",
    "priority": "high",
    "due_date": "2024-12-31T23:59:00"
  }'

# 获取所有任务
curl "http://localhost:8000/tasks/"

# 更新任务状态
curl -X PATCH "http://localhost:8000/tasks/1/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'

# 删除任务
curl -X DELETE "http://localhost:8000/tasks/1"
```
