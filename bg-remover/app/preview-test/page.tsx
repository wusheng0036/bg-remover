'use client'
import { useState } from 'react'

export default function PreviewTest() {
  const [showOriginal, setShowOriginal] = useState(true)

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">预览测试</h1>
      
      <div className="space-y-4">
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          切换：{showOriginal ? '原图' : '去背图'}
        </button>

        <div className="border-2 border-dashed p-8 text-center bg-checkerboard">
          <p className="mb-4">棋盘格背景测试（透明区域应该显示灰白格子）</p>
          <div 
            className="w-32 h-32 mx-auto"
            style={{ 
              background: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
              backgroundSize: '20px 20px'
            }}
          />
        </div>
      </div>
    </div>
  )
}
