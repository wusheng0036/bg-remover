export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    
    if (!image) {
      return new Response(JSON.stringify({ error: '请上传图片' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (image.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: '图片大小不能超过 5MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = env.REMOVE_BG_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key 未配置' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const removeBgFormData = new FormData();
    removeBgFormData.append('image_file', image);
    removeBgFormData.append('size', 'preview');

    const res = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: removeBgFormData
    });

    if (!res.ok) {
      if (res.status === 402) {
        return new Response(JSON.stringify({ error: 'API 额度已用完' }), {
          status: 402,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ error: '处理失败' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const imageBuffer = await res.arrayBuffer();
    
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="background-removed.png"'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
