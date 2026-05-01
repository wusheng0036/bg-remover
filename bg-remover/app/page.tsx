'use client'
import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import GoogleLogin from './components/GoogleLogin'

type BgColor = 'transparent' | 'white' | 'black'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [original, setOriginal] = useState<string | null>(null)
  const [processed, setProcessed] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bgColor, setBgColor] = useState<BgColor>('transparent')
  const [user, setUser] = useState<any>(null)
  const [quota, setQuota] = useState({ used: 0, limit: 50 })

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

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
        throw new Error(err.error || 'Processing failed')
      }
      
      const blob = await res.blob()
      const processedUrl = URL.createObjectURL(blob)
      setProcessed(processedUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed, please try again')
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
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            🌀 BG Remover
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-800">
              Pricing
            </Link>
            <Link href="/faq" className="text-gray-600 hover:text-gray-800">
              FAQ
            </Link>
            <GoogleLogin />
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="py-8 px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-3">
          AI Background Remover
        </h1>
        <p className="text-xl text-gray-600">Remove image backgrounds in 3 seconds, no Photoshop needed, 4K HD support</p>
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
                <p className="text-xl text-blue-600 font-medium">Drop to upload...</p>
              ) : (
                <>
                  <p className="text-xl text-gray-700 font-medium">Drag & drop image here, or click to select</p>
                  <p className="text-sm text-gray-500">Supports PNG, JPG, WebP (max 5MB)</p>
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
                <h2 className="text-lg font-semibold text-gray-800">📷 Original Preview</h2>
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
                ✨ Remove Background
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-10 py-4 rounded-xl font-semibold transition-all text-lg"
              >
                🔄 Reselect
              </button>
            </div>
          </div>
        )}

        {/* Processing */}
        {processing && (
          <div className="text-center py-16">
            <div className="animate-spin text-7xl mb-6">⏳</div>
            <p className="text-2xl text-gray-700 font-medium">Removing background...</p>
            <p className="text-gray-500 mt-2">Usually takes 2-5 seconds</p>
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
              Re-upload
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
                <span className="text-sm text-gray-600 font-medium">Preview background:</span>
                <button
                  onClick={() => setBgColor('transparent')}
                  className={`px-5 py-2 rounded-lg font-medium transition-all ${
                    bgColor === 'transparent' 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⬜ Transparent
                </button>
                <button
                  onClick={() => setBgColor('white')}
                  className={`px-5 py-2 rounded-lg font-medium transition-all ${
                    bgColor === 'white' 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⬜ White
                </button>
                <button
                  onClick={() => setBgColor('black')}
                  className={`px-5 py-2 rounded-lg font-medium transition-all ${
                    bgColor === 'black' 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⬛ Black
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleDownload}
                className="bg-green-500 hover:bg-green-600 text-white px-10 py-4 rounded-xl font-semibold transition-all shadow-lg text-lg"
              >
                📥 Download PNG
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-10 py-4 rounded-xl font-semibold transition-all text-lg"
              >
                🔄 Upload New
              </button>
            </div>
          </div>
        )}

        {/* Features */}
        {!original && (
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="font-bold text-xl text-gray-800 mb-2">Fast Processing</h3>
              <p className="text-gray-600">Complete in 2-5 seconds</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="font-bold text-xl text-gray-800 mb-2">Privacy & Security</h3>
              <p className="text-gray-600">Images not stored, deleted after processing</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="font-bold text-xl text-gray-800 mb-2">HD Output</h3>
              <p className="text-gray-600">Supports 4K HD images</p>
            </div>
          </div>
        )}

        {/* Pricing CTA */}
        {!original && (
          <div className="mt-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Need more credits?</h2>
            <p className="text-lg mb-6">Upgrade to Pro for 500 HD images per month, no watermark</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/pricing"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                View Pricing
              </Link>
              <Link
                href="/faq"
                className="bg-blue-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">🌀 BG Remover</h3>
              <p className="text-gray-400">AI-powered background removal tool. Remove backgrounds in 3 seconds, no Photoshop needed.</p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/faq" className="hover:text-white">Help Center</Link></li>
                <li><a href="mailto:support@imagebackgroundremover.guru" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>© 2026 BG Remover. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
