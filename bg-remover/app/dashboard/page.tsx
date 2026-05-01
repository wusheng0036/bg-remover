'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import GoogleLogin from './components/GoogleLogin'

interface User {
  name: string
  email: string
  picture: string
}

interface Stats {
  totalProcessed: number
  todayProcessed: number
  monthlyProcessed: number
  quota: {
    freeUsed: number
    freeLimit: number
    freeRemaining: number
  }
}

interface HistoryItem {
  id: string
  imageUrl: string
  originalName: string
  createdAt: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview')

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      fetchData(userData.email)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchData = async (email: string) => {
    try {
      const statsRes = await fetch('/api/stats', {
        headers: { 'X-User-Email': email }
      })
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      }

      const historyRes = await fetch('/api/history', {
        headers: { 'X-User-Email': email }
      })
      if (historyRes.ok) {
        const historyData = await historyRes.json()
        setHistory(historyData.data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHistory = async (id: string) => {
    if (!user) return
    
    try {
      const res = await fetch(`/api/history?id=${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Email': user.email }
      })
      
      if (res.ok) {
        setHistory(history.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('user')
    if (window.google) {
      window.google.accounts.id.disableAutoSelect()
    }
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in first</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 text-center border-b">
                <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-full mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>
              <nav className="p-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
                    activeTab === 'overview' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  📊 Overview
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
                    activeTab === 'history' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  📷 History
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'settings' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  ⚙️ Settings
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="text-3xl font-bold text-blue-600">
                      {stats?.totalProcessed || 0}
                    </div>
                    <div className="text-gray-500">Total Processed</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="text-3xl font-bold text-green-600">
                      {stats?.todayProcessed || 0}
                    </div>
                    <div className="text-gray-500">Today</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="text-3xl font-bold text-purple-600">
                      {stats?.monthlyProcessed || 0}
                    </div>
                    <div className="text-gray-500">This Month</div>
                  </div>
                </div>

                {/* Quota */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Free Quota</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Used / Total</span>
                    <span className="font-bold">
                      {stats?.quota?.freeUsed || 0} / {stats?.quota?.freeLimit || 50}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, ((stats?.quota?.freeUsed || 0) / (stats?.quota?.freeLimit || 50)) * 100)}%`
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {stats?.quota?.freeRemaining || 50} free images remaining
                  </p>
                </div>

                {/* Quick Action */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                  <Link
                    href="/"
                    className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    🚀 Process an Image
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Processing History</h3>
                {history.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-xl mb-4">📷</p>
                    <p>No processing history yet</p>
                    <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
                      Process your first image
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {history.map((item) => (
                      <div key={item.id} className="relative group">
                        <img
                          src={item.imageUrl}
                          alt={item.originalName}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <a
                            href={item.imageUrl}
                            download
                            className="bg-white text-gray-800 px-3 py-1 rounded text-sm"
                          >
                            Download
                          </a>
                          <button
                            onClick={() => handleDeleteHistory(item.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {new Date(item.createdAt).toLocaleDateString('en-US')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium text-gray-800">Name</p>
                      <p className="text-sm text-gray-500">{user.name}</p>
                    </div>
                    <span className="text-gray-400">Read-only</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium text-gray-800">Email</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <span className="text-gray-400">Read-only</span>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={handleSignOut}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
