import Link from 'next/link'
import { prisma } from '@/lib/prisma'

interface SearchParams {
  status?: string
}

async function getArticles(status?: string) {
  try {
    const where = status && status !== 'all' ? { status } : {}
    const articles = await prisma.article.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        category: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return articles
  } catch {
    return []
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

const categoryLabels: Record<string, string> = {
  finance: '생활금융',
  policy: '제도',
  'it-tips': 'IT팁',
  shopping: '쇼핑가이드',
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const currentStatus = params.status || 'all'
  const articles = await getArticles(currentStatus === 'all' ? undefined : currentStatus)

  const statuses = ['all', 'draft', 'review', 'approved', 'scheduled', 'published']

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">글 관리</h1>
        <Link
          href="/admin/articles/new"
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
        >
          + 새 글 작성
        </Link>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {statuses.map((status) => (
          <Link
            key={status}
            href={`/admin/articles?status=${status}`}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              currentStatus === status
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--muted)] hover:bg-[var(--border)]'
            }`}
          >
            {status === 'all' ? '전체' : statusLabels[status] || status}
          </Link>
        ))}
      </div>

      {/* Articles List */}
      {articles.length > 0 ? (
        <div className="bg-[var(--muted)] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-4 font-medium">제목</th>
                <th className="text-left p-4 font-medium w-24">카테고리</th>
                <th className="text-left p-4 font-medium w-24">상태</th>
                <th className="text-left p-4 font-medium w-32">수정일</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr
                  key={article.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)]"
                >
                  <td className="p-4">
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="font-medium hover:text-[var(--primary)]"
                    >
                      {article.title}
                    </Link>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      /{article.slug}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">
                      {categoryLabels[article.category] || article.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        statusColors[article.status] || 'bg-gray-200'
                      }`}
                    >
                      {statusLabels[article.status] || article.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[var(--muted-foreground)]">
                    {new Date(article.updatedAt).toLocaleDateString('ko-KR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-[var(--muted)] rounded-lg">
          <p className="text-[var(--muted-foreground)]">
            {currentStatus === 'all'
              ? '아직 작성된 글이 없습니다.'
              : `${statusLabels[currentStatus] || currentStatus} 상태의 글이 없습니다.`}
          </p>
          <Link
            href="/admin/articles/new"
            className="inline-block mt-4 text-[var(--primary)] hover:underline"
          >
            첫 번째 글 작성하기
          </Link>
        </div>
      )}
    </div>
  )
}
