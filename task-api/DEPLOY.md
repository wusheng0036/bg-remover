# Task API - 完整部署指南

## 🚀 一键部署

### 方式一：快速启动（推荐用于开发和测试）

```bash
cd task-api

# 前台启动（带热重载，开发模式）
./quickstart.sh start

# 或后台启动
./quickstart.sh daemon

# 查看状态
./quickstart.sh status

# 测试 API
./quickstart.sh test

# 查看日志
./quickstart.sh logs
./quickstart.sh tail

# 停止服务
./quickstart.sh stop
```

### 方式二：生产部署（推荐用于生产环境）

```bash
cd task-api

# 一键安装（创建系统服务）
sudo ./deploy.sh install

# 启动服务
sudo ./deploy.sh start

# 查看状态
./deploy.sh status

# 查看日志
./deploy.sh logs
./deploy.sh tail

# 重启服务
sudo ./deploy.sh restart

# 停止服务
sudo ./deploy.sh stop

# 卸载服务
sudo ./deploy.sh uninstall
```

---

## 📁 项目结构

```
task-api/
├── 📄 README.md              # 项目说明
├── 📄 requirements.txt       # 生产依赖
├── 📄 requirements-dev.txt   # 开发依赖
├── 🐳 Dockerfile            # Docker 构建
├── 🐳 docker-compose.yml    # 容器编排
│
├── 🚀 quickstart.sh         # 快速启动脚本
├── 🚀 deploy.sh             # 生产部署脚本 ⭐
│
├── src/                     # 源代码
│   ├── main.py             # 应用入口
│   ├── models.py           # 数据库模型
│   ├── schemas.py          # Pydantic 模型
│   ├── crud.py             # 数据库操作
│   ├── database.py         # 数据库配置
│   └── routers/
│       └── tasks.py        # 任务路由
│
├── tests/                   # 测试代码
├── config/                  # 配置文件
├── scripts/                 # 辅助脚本
└── docs/                    # 文档
```

---

## 🔧 部署脚本功能对比

| 功能 | quickstart.sh | deploy.sh |
|------|---------------|-----------|
| 安装到系统 | ❌ | ✅ |
| 创建系统服务 | ❌ | ✅ |
| 自动创建用户 | ❌ | ✅ |
| 日志轮转 | ❌ | ✅ |
| 开机自启 | ❌ | ✅ |
| 端口检查 | ✅ | ✅ |
| 进程管理 | ✅ | ✅ |
| 异常处理 | ✅ | ✅ |
| 适合场景 | 开发/测试 | 生产环境 |

---

## 📝 部署脚本详细说明

### deploy.sh - 生产部署脚本

```bash
# 安装服务（只需执行一次）
sudo ./deploy.sh install

# 服务管理
sudo ./deploy.sh start      # 启动
sudo ./deploy.sh stop       # 停止
sudo ./deploy.sh restart    # 重启
sudo ./deploy.sh status     # 查看状态

# 日志管理
./deploy.sh logs            # 查看最近 50 行
./deploy.sh logs 100        # 查看最近 100 行
./deploy.sh tail            # 实时监控

# 其他
sudo ./deploy.sh update     # 更新服务
sudo ./deploy.sh uninstall  # 卸载服务
```

**环境变量：**
- `APP_PORT` - 服务端口（默认：8000）
- `APP_WORKERS` - 工作进程数（默认：4）

**示例：**
```bash
sudo APP_PORT=8080 APP_WORKERS=8 ./deploy.sh start
```

### quickstart.sh - 快速启动脚本

```bash
# 开发模式（前台运行，带热重载）
./quickstart.sh start

# 后台运行
./quickstart.sh daemon

# 其他命令
./quickstart.sh stop        # 停止
./quickstart.sh status      # 状态
./quickstart.sh logs        # 日志
./quickstart.sh tail        # 实时监控
./quickstart.sh test        # 测试 API
```

**环境变量：**
- `PORT` - 服务端口（默认：8000）
- `WORKERS` - 工作进程数（默认：1）
- `HOST` - 监听地址（默认：0.0.0.0）

---

## 🌐 API 端点

启动后访问：`http://localhost:8000`

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/` | 服务信息 |
| GET | `/health` | 健康检查 |
| GET | `/docs` | API 文档 (Swagger) |
| GET | `/redoc` | API 文档 (ReDoc) |
| GET | `/tasks` | 获取任务列表 |
| POST | `/tasks` | 创建任务 |
| GET | `/tasks/{id}` | 获取单个任务 |
| PUT | `/tasks/{id}` | 更新任务 |
| DELETE | `/tasks/{id}` | 删除任务 |
| PATCH | `/tasks/{id}/status` | 更新任务状态 |

---

## 🧪 测试示例

```bash
# 1. 创建任务
curl -X POST "http://localhost:8000/tasks/" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "完成项目文档",
    "description": "编写 API 文档和部署指南",
    "priority": "high",
    "due_date": "2024-12-31T23:59:00"
  }'

# 2. 获取所有任务
curl "http://localhost:8000/tasks/"

# 3. 更新任务状态
curl -X PATCH "http://localhost:8000/tasks/1/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'

# 4. 删除任务
curl -X DELETE "http://localhost:8000/tasks/1"
```

---

## 🐳 Docker 部署

```bash
# 构建镜像
docker build -t task-api .

# 运行容器
docker run -d -p 8000:8000 -v $(pwd)/data:/app/data task-api

# 或使用 docker-compose
docker-compose up -d
```

---

## 📊 监控与日志

### 日志文件位置

- **quickstart.sh**: `./logs/app.log`
- **deploy.sh**: `/opt/task-api/logs/`
  - `app.log` - 应用日志
  - `error.log` - 错误日志
  - `access.log` - 访问日志

### 查看日志

```bash
# 查看最新日志
./quickstart.sh logs
./deploy.sh logs

# 实时监控
./quickstart.sh tail
./deploy.sh tail

# 直接查看文件
tail -f logs/app.log
tail -f /opt/task-api/logs/app.log
```

---

## 🔒 安全建议

1. **修改默认端口**：生产环境不要使用 8000 端口
2. **配置防火墙**：只开放必要的端口
3. **使用 HTTPS**：生产环境配置 SSL 证书
4. **定期备份**：备份 SQLite 数据库文件
5. **更新依赖**：定期更新 Python 依赖包

---

## 🆘 故障排除

### 端口被占用

```bash
# 查看占用端口的进程
lsof -i :8000

# 杀死进程
kill -9 <PID>
```

### 权限问题

```bash
# 修复权限
sudo chown -R $(whoami):$(whoami) /opt/task-api
```

### 服务无法启动

```bash
# 查看详细错误
./deploy.sh logs

# 手动测试
python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000
```

---

## ✅ 部署检查清单

- [ ] 选择部署方式（quickstart/deploy/docker）
- [ ] 配置端口（避免冲突）
- [ ] 检查系统要求（Python 3.8+）
- [ ] 执行部署脚本
- [ ] 验证服务状态
- [ ] 测试 API 接口
- [ ] 配置日志监控
- [ ] 设置备份策略

---

**作者**: 风火轮 🌀  
**版本**: 1.0.0  
**更新日期**: 2024-03-23
