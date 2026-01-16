'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface Entry {
  id: number
  title: string
  content: string
  isPublic: boolean
  createdAt: string
  page: {
    name: string
    tab: {
      name: string
    }
  }
}

interface Tab {
  id: number
  name: string
  position: number
}

interface Page {
  id: number
  name: string
  position: number
}

export default function Home() {
  const { data: session } = useSession()
  const [entries, setEntries] = useState<Entry[]>([])
  const [tabs, setTabs] = useState<Tab[]>([])
  const [pages, setPages] = useState<Page[]>([])
  const [selectedTab, setSelectedTab] = useState<number | null>(null)
  const [selectedPage, setSelectedPage] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [session])

  const loadData = async () => {
    try {
      // Load entries
      const entriesRes = await fetch('/api/entries/public')
      const entriesData = await entriesRes.json()
      setEntries(entriesData)

      // Load tabs if authenticated
      if (session) {
        const tabsRes = await fetch('/api/tabs')
        const tabsData = await tabsRes.json()
        setTabs(tabsData)
        if (tabsData.length > 0) {
          setSelectedTab(tabsData[0].id)
          loadPages(tabsData[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPages = async (tabId: number) => {
    try {
      const res = await fetch(`/api/pages/${tabId}`)
      const data = await res.json()
      setPages(data)
      if (data.length > 0) {
        setSelectedPage(data[0].id)
      }
    } catch (error) {
      console.error('Error loading pages:', error)
    }
  }

  const filteredEntries = entries.filter(entry => {
    if (!selectedTab || !selectedPage) return true
    return entry.page.tab.name === tabs.find(t => t.id === selectedTab)?.name &&
           entry.page.name === pages.find(p => p.id === selectedPage)?.name
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-card p-8 mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-3">
            📖 Son Defter
          </h1>
          <p className="text-gray-600 text-lg">Kişisel günlük defterim</p>
        </div>

        {/* Tabs */}
        {tabs.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <div className="flex flex-wrap gap-3">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedTab(tab.id)
                    loadPages(tab.id)
                  }}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    selectedTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Sidebar */}
          {pages.length > 0 && (
            <div className="lg:w-80">
              <div className="glass-card p-6 sticky top-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📄 Sayfalar</h3>
                <div className="space-y-2">
                  {pages.map(page => (
                    <button
                      key={page.id}
                      onClick={() => setSelectedPage(page.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        selectedPage === page.id
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page.name}
                    </button>
                  ))}
                </div>
                <div className="mt-6">
                  <Link href="/login" className="btn-secondary block text-center">
                    Giriş Yap
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Entries */}
          <div className="flex-1">
            {filteredEntries.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">
                  Henüz Girdi Yok
                </h2>
                <p className="text-gray-500">
                  Bu bölümde henüz günlük girdisi bulunmuyor.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredEntries.map(entry => (
                  <div key={entry.id} className="glass-card p-8 hover:shadow-2xl transition-shadow duration-300">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                      {entry.title}
                    </h2>
                    <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        📅 {new Date(entry.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {!entry.isPublic && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                          🔒 Özel
                        </span>
                      )}
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                        {entry.page.tab.name} → {entry.page.name}
                      </span>
                    </div>
                    <div
                      className="text-gray-700 leading-relaxed prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: entry.content }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
