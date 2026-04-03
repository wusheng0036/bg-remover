# Task API - 任务管理服务

一个极简的 RESTful 任务管理 API，支持增删改查、状态管理、优先级设置。

## 功能特性

- ✅ 任务的增删改查 (CRUD)
- ✅ 任务状态管理 (todo/in_progress/done)
- ✅ 优先级设置 (low/medium/high)
- ✅ 截止日期管理
- ✅ 数据持久化 (SQLite)
- ✅ 请求验证
- ✅ 自动 API 文档

## 技术栈

- **语言**: Python 3.11+
- **框架**: FastAPI
- **数据库**: SQLite + SQLAlchemy
- **验证**: Pydantic
- **测试**: pytest
- **部署**: Docker

## 快速开始

```bash
# 1. 克隆项目
git clone <repo-url>
cd task-api

# 2. 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. 安装依赖
pip install -r requirements.txt

# 4. 运行服务
uvicorn src.main:app --reload

# 5. 访问 API 文档
open http://localhost:8000/docs
```

## API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/tasks` | 获取所有任务 |
| POST | `/tasks` | 创建任务 |
| GET | `/tasks/{id}` | 获取单个任务 |
| PUT | `/tasks/{id}` | 更新任务 |
| DELETE | `/tasks/{id}` | 删除任务 |
| PATCH | `/tasks/{id}/status` | 更新任务状态 |

## 项目结构

```
task-api/
├── src/
│   ├── __init__.py
│   ├── main.py          # 应用入口
│   ├── models.py        # 数据库模型
│   ├── schemas.py       # Pydantic 模型
│   ├── crud.py          # 数据库操作
│   ├── database.py      # 数据库配置
│   └── routers/
│       └── tasks.py     # 任务路由
├── tests/
│   ├── __init__.py
│   ├── test_main.py
│   └── conftest.py
├── docs/
│   └── api.md
├── scripts/
│   └── init_db.py
├── config/
│   └── settings.py
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── requirements-dev.txt
├── README.md
└── .env.example
```

## 部署

### Docker 部署

```bash
docker-compose up -d
```

### 生产环境

```bash
# 使用 Gunicorn + Uvicorn
gunicorn src.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

## 开发计划

1. **Day 1**: 项目搭建、数据库设计、基础 CRUD
2. **Day 2**: 完善 API、添加验证、错误处理
3. **Day 3**: 编写测试、Docker 化
4. **Day 4**: 文档、部署脚本

## 许可证

MIT
