import Link from 'next/link'
import { prisma } from '@/lib/prisma'

const categories = [
  { name: '생활금융', slug: 'finance', description: '대출, 저축, 투자 등 금융 정보' },
  { name: '제도', slug: 'policy', description: '정부 지원금, 복지 제도 안내' },
  { name: 'IT팁', slug: 'it-tips', description: '유용한 IT 활용 팁' },
  { name: '쇼핑가이드', slug: 'shopping', description: '똑똑한 소비를 위한 가이드' },
]

async function getRecentArticles() {
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        category: true,
        publishedAt: true,
      },
    })
    return articles
  } catch {
    return []
  }
}

export default async function HomePage() {
  const articles = await getRecentArticles()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="text-center py-12 mb-12 border-b border-[var(--border)]">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          생활에 필요한 정보를 한눈에
        </h1>
        <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
          생활금융, 제도, IT팁 등 알아두면 유용한 정보를
          알기 쉽게 정리하여 제공합니다.
        </p>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6">카테고리</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="p-4 border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors"
            >
              <h3 className="font-bold mb-1">{cat.name}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                {cat.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Articles */}
      <section>
        <h2 className="text-xl font-bold mb-6">최근 글</h2>
        {articles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {articles.map((article) => (
              <article
                key={article.id}
                className="p-4 border border-[var(--border)] rounded-lg hover:shadow-md transition-shadow"
              >
                <Link href={`/posts/${article.slug}`}>
                  <span className="text-xs text-[var(--primary)] font-medium">
                    {article.category}
                  </span>
                  <h3 className="font-bold mt-1 mb-2 hover:text-[var(--primary)]">
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                      {article.summary}
                    </p>
                  )}
                  {article.publishedAt && (
                    <time className="text-xs text-[var(--muted-foreground)] mt-2 block">
                      {new Date(article.publishedAt).toLocaleDateString('ko-KR')}
                    </time>
                  )}
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[var(--muted-foreground)]">
            <p>아직 게시된 글이 없습니다.</p>
          </div>
        )}
      </section>
    </div>
  )
}
