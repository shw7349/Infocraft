'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { name: '대시보드', href: '/admin', icon: '📊' },
  { name: '글 관리', href: '/admin/articles', icon: '📝' },
  { name: '키워드 관리', href: '/admin/keywords', icon: '🔑' },
  { name: '배치 관리', href: '/admin/batch', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-[var(--muted)] border-r border-[var(--border)] min-h-screen">
      <div className="p-4 border-b border-[var(--border)]">
        <Link href="/admin" className="text-xl font-bold text-[var(--primary)]">
          INFOCRAFT
        </Link>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">Admin</p>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[var(--primary)] text-white'
                      : 'hover:bg-[var(--background)]'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          ← 사이트 보기
        </Link>
      </div>
    </aside>
  )
}
