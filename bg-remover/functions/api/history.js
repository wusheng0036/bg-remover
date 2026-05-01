export async function onRequestGet(context) {
  const { env, request } = context;
  
  // 从请求头获取用户信息
  const userEmail = request.headers.get('X-User-Email');
  
  if (!userEmail) {
    return new Response(JSON.stringify({ error: '未登录' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 从 KV 获取用户历史记录
    const historyKey = `history:${userEmail}`;
    const history = await env.USER_DATA?.get(historyKey, { type: 'json' }) || [];
    
    return Response.json({ 
      success: true, 
      data: history.slice(0, 50) // 最近50条
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  const { env, request } = context;
  
  const userEmail = request.headers.get('X-User-Email');
  
  if (!userEmail) {
    return new Response(JSON.stringify({ error: '未登录' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { imageUrl, originalName, createdAt } = await request.json();
    
    const historyKey = `history:${userEmail}`;
    const existingHistory = await env.USER_DATA?.get(historyKey, { type: 'json' }) || [];
    
    const newRecord = {
      id: Date.now().toString(),
      imageUrl,
      originalName,
      createdAt: createdAt || new Date().toISOString(),
    };
    
    const updatedHistory = [newRecord, ...existingHistory].slice(0, 100); // 最多保存100条
    
    await env.USER_DATA?.put(historyKey, JSON.stringify(updatedHistory));
    
    return Response.json({ success: true, data: newRecord });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestDelete(context) {
  const { env, request } = context;
  
  const userEmail = request.headers.get('X-User-Email');
  const url = new URL(request.url);
  const recordId = url.searchParams.get('id');
  
  if (!userEmail) {
    return new Response(JSON.stringify({ error: '未登录' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const historyKey = `history:${userEmail}`;
    const existingHistory = await env.USER_DATA?.get(historyKey, { type: 'json' }) || [];
    
    const updatedHistory = existingHistory.filter(record => record.id !== recordId);
    
    await env.USER_DATA?.put(historyKey, JSON.stringify(updatedHistory));
    
    return Response.json({ success: true });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
