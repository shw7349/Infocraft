'use client'

import Link from 'next/link'
import { useState } from 'react'

const categories = [
  { name: '생활금융', slug: 'finance' },
  { name: '제도', slug: 'policy' },
  { name: 'IT팁', slug: 'it-tips' },
  { name: '쇼핑가이드', slug: 'shopping' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[var(--background)] border-b border-[var(--border)]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-[var(--primary)]">
            INFOCRAFT
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="text-sm font-medium hover:text-[var(--primary)] transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="메뉴 열기"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-[var(--border)]">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="block py-2 text-sm font-medium hover:text-[var(--primary)]"
                onClick={() => setIsMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
