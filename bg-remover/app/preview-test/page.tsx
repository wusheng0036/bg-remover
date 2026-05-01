'use client'
import { useState } from 'react'

export default function PreviewTest() {
  const [showOriginal, setShowOriginal] = useState(true)

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Preview Test</h1>
      
      <div className="space-y-4">
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Toggle: {showOriginal ? 'Original' : 'Processed'}
        </button>

        <div className="border-2 border-dashed p-8 text-center bg-checkerboard">
          <p className="mb-4">Checkerboard background test (transparent areas should show gray-white squares)</p>
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
