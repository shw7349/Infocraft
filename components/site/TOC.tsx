'use client'

import { useEffect, useState } from 'react'

interface Heading {
  level: number
  text: string
  id: string
}

interface TOCProps {
  headings: Heading[]
}

export default function TOC({ headings }: TOCProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -80% 0px' }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className="sticky top-20 hidden lg:block">
      <h2 className="font-bold text-sm mb-3 text-[var(--muted-foreground)]">
        목차
      </h2>
      <ul className="space-y-2 text-sm border-l-2 border-[var(--border)]">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 2) * 12 + 12}px` }}
          >
            <a
              href={`#${heading.id}`}
              className={`block py-1 transition-colors ${
                activeId === heading.id
                  ? 'text-[var(--primary)] border-l-2 border-[var(--primary)] -ml-[2px] pl-[14px]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
