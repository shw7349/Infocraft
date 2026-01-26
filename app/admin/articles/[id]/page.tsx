'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import ArticleEditor from '@/components/admin/ArticleEditor'
import ArticlePreview from '@/components/admin/ArticlePreview'
import QualityChecker from '@/components/admin/QualityChecker'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  summary: string | null
  category: string
  tags: string
  status: string
}

const categories = [
  { value: 'finance', label: '생활금융' },
  { value: 'policy', label: '제도' },
  { value: 'it-tips', label: 'IT팁' },
  { value: 'shopping', label: '쇼핑가이드' },
]

const statuses = [
  { value: 'draft', label: '초안' },
  { value: 'review', label: '검토중' },
  { value: 'approved', label: '승인' },
  { value: 'scheduled', label: '예약' },
  { value: 'published', label: '발행' },
]

export default function ArticleEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const isNew = id === 'new'

  const [article, setArticle] = useState<Article>({
    id: '',
    title: '',
    slug: '',
    content: '',
    summary: '',
    category: 'finance',
    tags: '[]',
    status: 'draft',
  })
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'quality'>('edit')

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/articles/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            alert('글을 찾을 수 없습니다.')
            router.push('/admin/articles')
          } else {
            setArticle(data)
            setContent(data.content)
          }
        })
        .catch(() => {
          alert('글을 불러오는데 실패했습니다.')
          router.push('/admin/articles')
        })
        .finally(() => setLoading(false))
    }
  }, [id, isNew, router])

  const handleSave = useCallback(async () => {
    if (!article.title || !article.slug) {
      alert('제목과 슬러그는 필수입니다.')
      return
    }

    setSaving(true)
    try {
      const method = isNew ? 'POST' : 'PUT'
      const url = isNew ? '/api/articles' : `/api/articles/${id}`

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...article, content }),
      })

      const data = await res.json()

      if (data.error) {
        alert(data.error)
      } else {
        alert('저장되었습니다.')
        if (isNew) {
          router.push(`/admin/articles/${data.id}`)
        } else {
          setArticle(data)
        }
      }
    } catch {
      alert('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }, [article, content, id, isNew, router])

  const handleDelete = useCallback(async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (data.error) {
        alert(data.error)
      } else {
        router.push('/admin/articles')
      }
    } catch {
      alert('삭제에 실패했습니다.')
    }
  }, [id, router])

  if (loading) {
    return <div className="p-8 text-center">로딩 중...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isNew ? '새 글 작성' : '글 편집'}
        </h1>
        <div className="flex gap-2">
          {!isNew && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
            >
              삭제
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">제목</label>
          <input
            type="text"
            value={article.title}
            onChange={(e) => setArticle({ ...article, title: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
            placeholder="글 제목"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">슬러그 (URL)</label>
          <input
            type="text"
            value={article.slug}
            onChange={(e) => setArticle({ ...article, slug: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
            placeholder="url-slug"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">카테고리</label>
          <select
            value={article.category}
            onChange={(e) => setArticle({ ...article, category: e.target.value })}
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
          <label className="block text-sm font-medium mb-1">상태</label>
          <select
            value={article.status}
            onChange={(e) => setArticle({ ...article, status: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">요약</label>
        <input
          type="text"
          value={article.summary || ''}
          onChange={(e) => setArticle({ ...article, summary: e.target.value })}
          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg"
          placeholder="한 문장으로 요약"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'edit'
              ? 'border-b-2 border-[var(--primary)] font-medium'
              : 'text-[var(--muted-foreground)]'
          }`}
        >
          편집
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'preview'
              ? 'border-b-2 border-[var(--primary)] font-medium'
              : 'text-[var(--muted-foreground)]'
          }`}
        >
          미리보기
        </button>
        <button
          onClick={() => setActiveTab('quality')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'quality'
              ? 'border-b-2 border-[var(--primary)] font-medium'
              : 'text-[var(--muted-foreground)]'
          }`}
        >
          품질 검사
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'edit' && (
        <ArticleEditor initialContent={content} onChange={setContent} />
      )}
      {activeTab === 'preview' && <ArticlePreview content={content} />}
      {activeTab === 'quality' && <QualityChecker content={content} />}
    </div>
  )
}
