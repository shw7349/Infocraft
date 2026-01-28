'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ArticleThumbnailProps {
  title: string
  category: string
  date?: string | null
  className?: string
}

export default function ArticleThumbnail({
  title,
  category,
  date,
  className = '',
}: ArticleThumbnailProps) {
  const [error, setError] = useState(false)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const ogUrl = `${siteUrl}/api/og?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}&date=${date?.split('T')[0] || ''}`

  // 이미지 로드 실패 시 폴백 표시
  if (error) {
    return (
      <div
        className={`bg-[var(--muted)] flex items-center justify-center ${className}`}
        style={{ aspectRatio: '1200/630' }}
      >
        <span className="text-[var(--muted-foreground)] text-sm">
          {category}
        </span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: '1200/630' }}>
      <Image
        src={ogUrl}
        alt={title}
        fill
        className="object-cover"
        onError={() => setError(true)}
        unoptimized // OG 이미지는 이미 최적화되어 있음
      />
    </div>
  )
}
