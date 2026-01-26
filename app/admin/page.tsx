import { prisma } from '@/lib/prisma'

async function getStats() {
  try {
    const [total, draft, review, published] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'draft' } }),
      prisma.article.count({ where: { status: 'review' } }),
      prisma.article.count({ where: { status: 'published' } }),
    ])

    const recentArticles = await prisma.article.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    })

    return { total, draft, review, published, recentArticles }
  } catch {
    return { total: 0, draft: 0, review: 0, published: 0, recentArticles: [] }
  }
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-200 text-gray-700',
  review: 'bg-yellow-200 text-yellow-700',
  approved: 'bg-blue-200 text-blue-700',
  scheduled: 'bg-purple-200 text-purple-700',
  published: 'bg-green-200 text-green-700',
}

const statusLabels: Record<string, string> = {
  draft: '초안',
  review: '검토중',
  approved: '승인',
  scheduled: '예약',
  published: '발행됨',
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-[var(--muted)] rounded-lg">
          <p className="text-sm text-[var(--muted-foreground)]">전체 글</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="p-4 bg-[var(--muted)] rounded-lg">
          <p className="text-sm text-[var(--muted-foreground)]">초안</p>
          <p className="text-3xl font-bold text-gray-600">{stats.draft}</p>
        </div>
        <div className="p-4 bg-[var(--muted)] rounded-lg">
          <p className="text-sm text-[var(--muted-foreground)]">검토 대기</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.review}</p>
        </div>
        <div className="p-4 bg-[var(--muted)] rounded-lg">
          <p className="text-sm text-[var(--muted-foreground)]">발행됨</p>
          <p className="text-3xl font-bold text-green-600">{stats.published}</p>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-[var(--muted)] rounded-lg p-4">
        <h2 className="font-bold mb-4">최근 업데이트된 글</h2>
        {stats.recentArticles.length > 0 ? (
          <div className="space-y-2">
            {stats.recentArticles.map((article) => (
              <a
                key={article.id}
                href={`/admin/articles/${article.id}`}
                className="flex items-center justify-between p-3 bg-[var(--background)] rounded hover:shadow-md transition-shadow"
              >
                <span className="font-medium">{article.title}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      statusColors[article.status] || 'bg-gray-200'
                    }`}
                  >
                    {statusLabels[article.status] || article.status}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {new Date(article.updatedAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-[var(--muted-foreground)] text-center py-4">
            아직 작성된 글이 없습니다.
          </p>
        )}
      </div>
    </div>
  )
}
