'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

type BgColor = 'transparent' | 'white' | 'black'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [original, setOriginal] = useState<string | null>(null)
  const [processed, setProcessed] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bgColor, setBgColor] = useState<BgColor>('transparent')

  const onDrop = useCallback((files: File[]) => {
    if (files.length === 0) return
    
    const file = files[0]
    setSelectedFile(file)
    setError(null)
    setProcessed(null)
    
    const originalUrl = URL.createObjectURL(file)
    setOriginal(originalUrl)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024
  })

  const handleRemoveBackground = async () => {
    if (!selectedFile) return
    
    setProcessing(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      
      const res = await fetch('/api/remove', {
        method: 'POST',
        body: formData
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '处理失败')
      }
      
      const blob = await res.blob()
      const processedUrl = URL.createObjectURL(blob)
      setProcessed(processedUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : '处理失败，请重试')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!processed) return
    const link = document.createElement('a')
    link.href = processed
    link.download = 'background-removed.png'
    link.click()
  }

  const handleReset = () => {
    setSelectedFile(null)
    setOriginal(null)
    setProcessed(null)
    setError(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="py-8 px-4 text-center relative">
        {/* Login Button - Top Right */}
        <div className="absolute top-4 right-4 flex items-center gap-3">
          <button
            className="bg-white hover:bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium transition-all shadow-md border border-gray-200 flex items-center gap-2"
          >
            👤 登录
          </button>
        </div>
        
        <h1 className="text-5xl font-bold text-gray-800 mb-3">
          AI 一键去除图片背景
        </h1>
        <p className="text-xl text-gray-600">3 秒抠图，无需 PS，支持 4K 高清</p>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Upload Zone */}
        {!original && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all shadow-lg
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-white'}`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="text-7xl">📁</div>
              {isDragActive ? (
                <p className="text-xl text-blue-600 font-medium">松开上传...</p>
              ) : (
                <>
                  <p className="text-xl text-gray-700 font-medium">拖拽图片到这里，或点击选择</p>
                  <p className="text-sm text-gray-500">支持 PNG, JPG, WebP（最大 5MB）</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Preview & Process Button */}
        {original && !processed && !processing && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">📷 原图预览</h2>
              </div>
              <div className="bg-checkerboard p-6" style={{ minHeight: '400px' }}>
                <img
                  src={original}
                  alt="Original"
                  className="max-w-full h-auto mx-auto rounded-lg shadow-md"
                  style={{ maxHeight: '500px' }}
                />
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRemoveBackground}
                disabled={processing}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-10 py-4 rounded-xl font-semibold transition-all shadow-lg text-lg flex items-center gap-3"
              >
                ✨ 开始去除背景
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-10 py-4 rounded-xl font-semibold transition-all text-lg"
              >
                🔄 重新选择
              </button>
            </div>
          </div>
        )}

        {/* Processing */}
        {processing && (
          <div className="text-center py-16">
            <div className="animate-spin text-7xl mb-6">⏳</div>
            <p className="text-2xl text-gray-700 font-medium">正在去除背景...</p>
            <p className="text-gray-500 mt-2">通常需要 2-5 秒</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center max-w-2xl mx-auto">
            <p className="text-red-600 text-lg font-medium">❌ {error}</p>
            <button 
              onClick={handleReset} 
              className="mt-4 text-blue-600 hover:underline font-medium"
            >
              重新上传
            </button>
          </div>
        )}

        {/* Result - Side by Side Layout */}
        {original && processed && !processing && (
          <div className="space-y-6">
            {/* Side by Side Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original Image */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-checkerboard p-4" style={{ minHeight: '400px' }}>
                  <img
                    src={original}
                    alt="Original"
                    className="w-full h-auto object-contain rounded-lg"
                    style={{ maxHeight: '500px' }}
                  />
                </div>
              </div>

              {/* Processed Image */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className={`p-4 ${
                  bgColor === 'transparent' ? 'bg-checkerboard' : 
                  bgColor === 'white' ? 'bg-white' : 'bg-black'
                }`} style={{ minHeight: '400px' }}>
                  <img
                    src={processed}
                    alt="Processed"
                    className="w-full h-auto object-contain rounded-lg"
                    style={{ maxHeight: '500px' }}
                  />
                </div>
              </div>
            </div>

            {/* Background Color Controls */}
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="text-sm text-gray-600 font-medium">处理结果背景:</span>
                <button
                  onClick={() => setBgColor('transparent')}
                  className={`px-5 py-2 rounded-lg font-medium transition-all ${
                    bgColor === 'transparent' 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⬜ 透明
                </button>
                <button
                  onClick={() => setBgColor('white')}
                  className={`px-5 py-2 rounded-lg font-medium transition-all ${
                    bgColor === 'white' 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⬜ 白色
                </button>
                <button
                  onClick={() => setBgColor('black')}
                  className={`px-5 py-2 rounded-lg font-medium transition-all ${
                    bgColor === 'black' 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⬛ 黑色
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleDownload}
                className="bg-green-500 hover:bg-green-600 text-white px-10 py-4 rounded-xl font-semibold transition-all shadow-lg text-lg"
              >
                📥 下载 PNG
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-10 py-4 rounded-xl font-semibold transition-all text-lg"
              >
                🔄 重新上传
              </button>
            </div>
          </div>
        )}

        {/* Features */}
        {!original && (
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="font-bold text-xl text-gray-800 mb-2">快速处理</h3>
              <p className="text-gray-600">通常 2-5 秒完成</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="font-bold text-xl text-gray-800 mb-2">隐私安全</h3>
              <p className="text-gray-600">图片不存储，处理完即删除</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="font-bold text-xl text-gray-800 mb-2">完全免费</h3>
              <p className="text-gray-600">无限制使用</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm">
        Powered by Remove.bg API
      </footer>
    </main>
  )
}
