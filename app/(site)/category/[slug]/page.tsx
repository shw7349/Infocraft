import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Breadcrumb from '@/components/site/Breadcrumb'

interface Props {
  params: Promise<{ slug: string }>
}

const categories: Record<string, { name: string; description: string }> = {
  finance: { name: '생활금융', description: '대출, 저축, 투자 등 금융 관련 정보' },
  policy: { name: '제도', description: '정부 지원금, 복지 제도 안내' },
  'it-tips': { name: 'IT팁', description: '유용한 IT 활용 팁과 가이드' },
  shopping: { name: '쇼핑가이드', description: '똑똑한 소비를 위한 쇼핑 정보' },
}

async function getArticlesByCategory(category: string) {
  try {
    const articles = await prisma.article.findMany({
      where: { category, status: 'published' },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        publishedAt: true,
      },
    })
    return articles
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = categories[slug]

  if (!category) {
    return { title: '카테고리를 찾을 수 없습니다' }
  }

  return {
    title: `${category.name} - INFOCRAFT`,
    description: category.description,
  }
}

export function generateStaticParams() {
  return Object.keys(categories).map((slug) => ({ slug }))
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = categories[slug]

  if (!category) {
    notFound()
  }

  const articles = await getArticlesByCategory(slug)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ name: category.name }]} />

      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{category.name}</h1>
        <p className="text-[var(--muted-foreground)]">{category.description}</p>
      </header>

      {articles.length > 0 ? (
        <div className="grid gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="p-4 border border-[var(--border)] rounded-lg hover:shadow-md transition-shadow"
            >
              <Link href={`/posts/${article.slug}`}>
                <h2 className="font-bold text-lg mb-2 hover:text-[var(--primary)]">
                  {article.title}
                </h2>
                {article.summary && (
                  <p className="text-[var(--muted-foreground)] mb-2 line-clamp-2">
                    {article.summary}
                  </p>
                )}
                {article.publishedAt && (
                  <time className="text-sm text-[var(--muted-foreground)]">
                    {new Date(article.publishedAt).toLocaleDateString('ko-KR')}
                  </time>
                )}
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          <p>이 카테고리에는 아직 게시된 글이 없습니다.</p>
        </div>
      )}
    </div>
  )
}
