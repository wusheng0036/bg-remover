export async function onRequestGet(context) {
  const { env, request } = context;
  
  const userEmail = request.headers.get('X-User-Email');
  
  if (!userEmail) {
    return new Response(JSON.stringify({ error: '未登录' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const historyKey = `history:${userEmail}`;
    const history = await env.USER_DATA?.get(historyKey, { type: 'json' }) || [];
    
    // 计算统计数据
    const totalProcessed = history.length;
    const today = new Date().toISOString().split('T')[0];
    const todayProcessed = history.filter(h => h.createdAt?.startsWith(today)).length;
    
    // 本月处理数量
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthlyProcessed = history.filter(h => h.createdAt?.startsWith(thisMonth)).length;
    
    // 获取用户配额信息
    const quotaKey = `quota:${userEmail}`;
    const quota = await env.USER_DATA?.get(quotaKey, { type: 'json' }) || {
      freeUsed: 0,
      freeLimit: 50,
      lastReset: new Date().toISOString()
    };
    
    return Response.json({
      success: true,
      data: {
        totalProcessed,
        todayProcessed,
        monthlyProcessed,
        quota: {
          freeUsed: quota.freeUsed,
          freeLimit: quota.freeLimit,
          freeRemaining: Math.max(0, quota.freeLimit - quota.freeUsed)
        }
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
