'use client'

import { useEffect, useState } from 'react'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'

interface ArticlePreviewProps {
  content: string
}

export default function ArticlePreview({ content }: ArticlePreviewProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const compileMDX = async () => {
      try {
        // Remove frontmatter for preview
        const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n?/, '')

        const result = await serialize(contentWithoutFrontmatter, {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug],
          },
        })
        setMdxSource(result)
        setError(null)
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
