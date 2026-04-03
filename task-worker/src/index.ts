export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS 处理
    if (request.method === 'OPTIONS') {
      return handleCors();
    }

    try {
      // 路由匹配
      if (path === '/' || path === '/health') {
        return handleHealth(env);
      }

      if (path === '/tasks' && request.method === 'GET') {
        return handleGetTasks(env, url);
      }

      if (path === '/tasks' && request.method === 'POST') {
        return handleCreateTask(env, request);
      }

      if (path.match(/^\/tasks\/\d+$/) && request.method === 'GET') {
        const id = parseInt(path.split('/')[2]);
        return handleGetTask(env, id);
      }

      if (path.match(/^\/tasks\/\d+$/) && request.method === 'PUT') {
        const id = parseInt(path.split('/')[2]);
        return handleUpdateTask(env, id, request);
      }

      if (path.match(/^\/tasks\/\d+$/) && request.method === 'DELETE') {
        const id = parseInt(path.split('/')[2]);
        return handleDeleteTask(env, id);
      }

      if (path.match(/^\/tasks\/\d+\/status$/) && request.method === 'PATCH') {
        const id = parseInt(path.split('/')[2]);
        return handleUpdateTaskStatus(env, id, request);
      }

      return jsonResponse({ success: false, error: 'Not Found' }, 404);
    } catch (error) {
      console.error('Error:', error);
      return jsonResponse({ success: false, error: 'Internal Server Error' }, 500);
    }
  },
};

function handleCors(): Response {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

function jsonResponse(data: ApiResponse, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function handleHealth(env: Env): Promise<Response> {
  // 测试数据库连接
  try {
    const result = await env.DB.prepare('SELECT COUNT(*) as count FROM tasks').first();
    return jsonResponse({
      success: true,
      data: {
        status: 'healthy',
        environment: env.ENVIRONMENT,
        database: 'connected',
        taskCount: result?.count || 0,
      },
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      error: 'Database connection failed',
    }, 500);
  }
}

async function handleGetTasks(env: Env, url: URL): Promise<Response> {
  const status = url.searchParams.get('status');
  const priority = url.searchParams.get('priority');
  const limit = parseInt(url.searchParams.get('limit') || '100');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  let query = 'SELECT * FROM tasks';
  const params: any[] = [];
  const conditions: string[] = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  if (priority) {
    conditions.push('priority = ?');
    params.push(priority);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const { results } = await env.DB.prepare(query).bind(...params).all();

  // 获取总数
  let countQuery = 'SELECT COUNT(*) as count FROM tasks';
  if (conditions.length > 0) {
    countQuery += ' WHERE ' + conditions.join(' AND ');
  }
  const countResult = await env.DB.prepare(countQuery).bind(...params.slice(0, params.length - 2)).first();

  return jsonResponse({
    success: true,
    data: {
      tasks: results as Task[],
      pagination: {
        total: countResult?.count || 0,
        limit,
        offset,
      },
    },
  });
}

async function handleCreateTask(env: Env, request: Request): Promise<Response> {
  const body = await request.json();
  const { title, description, status, priority, due_date } = body;

  if (!title) {
    return jsonResponse({ success: false, error: 'Title is required' }, 400);
  }

  const result = await env.DB.prepare(`
    INSERT INTO tasks (title, description, status, priority, due_date)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    title,
    description || null,
    status || 'todo',
    priority || 'medium',
    due_date || null
  ).run();

  const task = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(result.meta?.last_row_id).first();

  return jsonResponse({ success: true, data: task }, 201);
}

async function handleGetTask(env: Env, id: number): Promise<Response> {
  const task = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();

  if (!task) {
    return jsonResponse({ success: false, error: 'Task not found' }, 404);
  }

  return jsonResponse({ success: true, data: task });
}

async function handleUpdateTask(env: Env, id: number, request: Request): Promise<Response> {
  const body = await request.json();
  const { title, description, status, priority, due_date } = body;

  // 检查任务是否存在
  const existing = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();
  if (!existing) {
    return jsonResponse({ success: false, error: 'Task not found' }, 404);
  }

  await env.DB.prepare(`
    UPDATE tasks
    SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    title ?? existing.title,
    description ?? existing.description,
    status ?? existing.status,
    priority ?? existing.priority,
    due_date ?? existing.due_date,
    id
  ).run();

  const task = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();
  return jsonResponse({ success: true, data: task });
}

async function handleDeleteTask(env: Env, id: number): Promise<Response> {
  const existing = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();
  if (!existing) {
    return jsonResponse({ success: false, error: 'Task not found' }, 404);
  }

  await env.DB.prepare('DELETE FROM tasks WHERE id = ?').bind(id).run();
  return jsonResponse({ success: true, data: { id, deleted: true } });
}

async function handleUpdateTaskStatus(env: Env, id: number, request: Request): Promise<Response> {
  const body = await request.json();
  const { status } = body;

  if (!status || !['todo', 'in_progress', 'done'].includes(status)) {
    return jsonResponse({ success: false, error: 'Invalid status' }, 400);
  }

  const existing = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();
  if (!existing) {
    return jsonResponse({ success: false, error: 'Task not found' }, 404);
  }

  await env.DB.prepare(`
    UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(status, id).run();

  const task = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();
  return jsonResponse({ success: true, data: task });
}
