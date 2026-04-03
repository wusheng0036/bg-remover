import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染（处理 FormData）
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File
    
    if (!image) {
      return NextResponse.json(
        { error: '请上传图片' },
        { status: 400 }
      )
    }

    // 验证文件大小（5MB）
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '图片大小不能超过 5MB' },
        { status: 400 }
      )
    }

    // 验证文件类型
    const validTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!validTypes.includes(image.type)) {
      return NextResponse.json(
        { error: '只支持 PNG, JPG, WebP 格式' },
        { status: 400 }
      )
    }

    // 调用 Remove.bg API
    const removeBgFormData = new FormData()
    removeBgFormData.append('image_file', image)
    removeBgFormData.append('size', 'preview') // 使用预览尺寸（免费）

    const res = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVE_BG_API_KEY!,
      },
      body: removeBgFormData
    })

    console.log('Remove.bg API status:', res.status)

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      console.error('Remove.bg API error:', errData)
      
      if (res.status === 402) {
        return NextResponse.json(
          { error: 'API 额度已用完，请稍后再试' },
          { status: 402 }
        )
      }
      
      return NextResponse.json(
        { error: '处理失败，请重试' },
        { status: res.status }
      )
    }

    // 返回处理后的图片
    const imageBuffer = await res.arrayBuffer()
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="background-removed.png"'
      }
    })

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    )
  }
}
