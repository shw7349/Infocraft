'use client'

import { useEffect, useState } from 'react'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'

interface ArticlePreviewProps {
  content: string
}

export default function ArticlePreview({ content }: ArticlePreviewProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const compileMDX = async () => {
      try {
        const res = await fetch('/api/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        })

        const data = await res.json()

        if (data.error) {
          setError(data.error)
          setMdxSource(null)
        } else {
          setMdxSource(data)
          setError(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'MDX 파싱 오류')
        setMdxSource(null)
      }
    }

    const debounce = setTimeout(compileMDX, 300)
    return () => clearTimeout(debounce)
  }, [content])

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
        <p className="text-red-700 dark:text-red-400 text-sm">
          <strong>파싱 오류:</strong> {error}
        </p>
      </div>
    )
  }

  if (!mdxSource) {
    return (
      <div className="p-4 text-[var(--muted-foreground)]">
        미리보기 로딩 중...
      </div>
    )
  }

  return (
    <div className="prose max-w-none p-4 bg-[var(--background)] rounded-lg border border-[var(--border)] overflow-auto max-h-[600px]">
      <MDXRemote {...mdxSource} />
    </div>
  )
}
