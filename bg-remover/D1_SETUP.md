# D1 数据库部署完成 ✅

## 数据库信息

| 项目 | 值 |
|------|-----|
| 名称 | `task-database` |
| UUID | `c992aed2-c495-4302-95c6-4ef88eeee220` |
| 区域 | WEUR (西欧) |
| 创建时间 | 2026-04-03 |

## 表结构

已创建 `tasks` 表，包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| title | VARCHAR(200) | 任务标题 |
| description | TEXT | 任务描述 |
| status | VARCHAR(20) | 状态 (todo/in_progress/done) |
| priority | VARCHAR(20) | 优先级 (low/medium/high) |
| due_date | DATETIME | 截止日期 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

## 索引

- `idx_tasks_status` - 状态索引
- `idx_tasks_priority` - 优先级索引
- `idx_tasks_due_date` - 截止日期索引

## wrangler.toml 配置

```toml
[[d1_databases]]
binding = "DB"
database_name = "task-database"
database_id = "c992aed2-c495-4302-95c6-4ef88eeee220"
```

## 使用示例

### 在 Worker 中查询

```javascript
// 查询所有任务
const { results } = await env.DB.prepare("SELECT * FROM tasks").all();

// 创建任务
await env.DB.prepare(
  "INSERT INTO tasks (title, description, status, priority) VALUES (?, ?, ?, ?)"
).bind(title, description, 'todo', 'medium').run();

// 更新任务
await env.DB.prepare(
  "UPDATE tasks SET status = ? WHERE id = ?"
).bind('in_progress', taskId).run();
```

### 本地开发

```bash
# 本地测试 D1
wrangler d1 execute task-database --local --file=schema.sql

# 远程执行 SQL
wrangler d1 execute task-database --remote --file=schema.sql
```

## API Token

Token 已保存在 `.env.cloudflare` 文件中。

⚠️ **安全提示**: 不要将此文件提交到 Git！

## 下一步

1. 更新 Worker 代码使用 D1 数据库
2. 部署到 Cloudflare Workers
3. 配置自定义域名（可选）

---

**作者**: 风火轮 🌀  
**创建日期**: 2026-04-03
