'use client'

import { useState, useEffect, useCallback } from 'react'

interface Keyword {
  id: string
  keyword: string
  category: string
  priority: number
  _count?: { articles: number }
}

const categories = [
  { value: 'finance', label: '생활금융' },
  { value: 'policy', label: '제도' },
  { value: 'it-tips', label: 'IT팁' },
  { value: 'shopping', label: '쇼핑가이드' },
]

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newKeyword, setNewKeyword] = useState({
    keyword: '',
    category: 'finance',
    priority: 0,
  })

  const fetchKeywords = useCallback(async () => {
    try {
      const res = await fetch('/api/keywords')
      const data = await res.json()
      setKeywords(data)
    } catch {
      console.error('Failed to fetch keywords')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKeywords()
  }, [fetchKeywords])

  const handleAdd = async () => {
    if (!newKeyword.keyword.trim()) {
      alert('키워드를 입력하세요.')
      return
    }

    try {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKeyword),
      })

      if (res.ok) {
        setNewKeyword({ keyword: '', category: 'finance', priority: 0 })
        setShowForm(false)
        fetchKeywords()
      } else {
        const data = await res.json()
        alert(data.error || '추가 실패')
      }
    } catch {
      alert('추가 실패')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/keywords/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchKeywords()
      } else {
        alert('삭제 실패')
      }
    } catch {
      alert('삭제 실패')
    }
  }

  if (loading) {
    return <div className="p-8 text-center">로딩 중...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">키워드 관리</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
        >
          {showForm ? '취소' : '+ 키워드 추가'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-[var(--muted)] p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">키워드</label>
              <input
                type="text"
                value={newKeyword.keyword}
                onChange={(e) =>
                  setNewKeyword({ ...newKeyword, keyword: e.target.value })
                }
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
                placeholder="검색 키워드"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">카테고리</label>
              <select
                value={newKeyword.category}
                onChange={(e) =>
                  setNewKeyword({ ...newKeyword, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">우선순위</label>
              <input
                type="number"
                value={newKeyword.priority}
                onChange={(e) =>
                  setNewKeyword({ ...newKeyword, priority: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAdd}
                className="w-full px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keywords List */}
      {keywords.length > 0 ? (
        <div className="bg-[var(--muted)] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-4 font-medium">키워드</th>
                <th className="text-left p-4 font-medium w-32">카테고리</th>
                <th className="text-left p-4 font-medium w-24">우선순위</th>
                <th className="text-left p-4 font-medium w-24">글 수</th>
                <th className="text-right p-4 font-medium w-24">작업</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((kw) => (
                <tr
                  key={kw.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)]"
                >
                  <td className="p-4 font-medium">{kw.keyword}</td>
                  <td className="p-4 text-sm">
                    {categories.find((c) => c.value === kw.category)?.label ||
                      kw.category}
                  </td>
                  <td className="p-4 text-sm">{kw.priority}</td>
                  <td className="p-4 text-sm">{kw._count?.articles || 0}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(kw.id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-[var(--muted)] rounded-lg">
          <p className="text-[var(--muted-foreground)]">
            등록된 키워드가 없습니다.
          </p>
        </div>
      )}
    </div>
  )
}
