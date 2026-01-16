'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Stats {
  totalEntries: number
  totalTabs: number
  totalPages: number
  lastCheckin: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [secretUrl, setSecretUrl] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session && !session.user.isAdmin) {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user.isAdmin) {
      loadStats()
      loadSecretUrl()
    }
  }, [session])

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadSecretUrl = async () => {
    try {
      const res = await fetch('/api/admin/secret-url')
      const data = await res.json()
      setSecretUrl(data.url)
    } catch (error) {
      console.error('Error loading secret URL:', error)
    }
  }

  const handleCheckin = async () => {
    try {
      await fetch('/api/admin/checkin', { method: 'POST' })
      alert('Check-in başarılı!')
      loadStats()
    } catch (error) {
      alert('Check-in başarısız!')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  if (!session?.user.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="glass-card p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">
                🛡️ Admin Panel
              </h1>
              <p className="text-gray-600">
                Hoş geldiniz, {session.user.username}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="btn-secondary"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass-card p-6">
              <div className="text-3xl mb-2">📝</div>
              <div className="text-2xl font-bold text-gray-800">
                {stats.totalEntries}
              </div>
              <div className="text-gray-600">Toplam Girdi</div>
            </div>
            <div className="glass-card p-6">
              <div className="text-3xl mb-2">📑</div>
              <div className="text-2xl font-bold text-gray-800">
                {stats.totalTabs}
              </div>
              <div className="text-gray-600">Sekme</div>
            </div>
            <div className="glass-card p-6">
              <div className="text-3xl mb-2">📄</div>
              <div className="text-2xl font-bold text-gray-800">
                {stats.totalPages}
              </div>
              <div className="text-gray-600">Sayfa</div>
            </div>
            <div className="glass-card p-6">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-sm font-bold text-gray-800">
                {new Date(stats.lastCheckin).toLocaleDateString('tr-TR')}
              </div>
              <div className="text-gray-600">Son Check-in</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              ⏰ Check-in
            </h2>
            <p className="text-gray-600 mb-4">
              30 gün boyunca check-in yapmazsanız tüm girdiler otomatik olarak herkese açık olur.
            </p>
            <button onClick={handleCheckin} className="btn-primary w-full">
              Check-in Yap
            </button>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              🔐 Gizli URL
            </h2>
            <p className="text-gray-600 mb-4">
              Bu URL'yi kullanarak giriş yapmadan check-in yapabilirsiniz.
            </p>
            {secretUrl && (
              <input
                type="text"
                value={secretUrl}
                readOnly
                className="w-full px-4 py-2 bg-gray-50 rounded-lg text-sm mb-2"
                onClick={(e) => {
                  e.currentTarget.select()
                  navigator.clipboard.writeText(secretUrl)
                  alert('URL kopyalandı!')
                }}
              />
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            🚀 Hızlı Erişim
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/admin/entries" className="btn-secondary text-center">
              📝 Girdileri Yönet
            </a>
            <a href="/admin/tabs" className="btn-secondary text-center">
              📑 Sekmeleri Yönet
            </a>
            <a href="/admin/pages" className="btn-secondary text-center">
              📄 Sayfaları Yönet
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
