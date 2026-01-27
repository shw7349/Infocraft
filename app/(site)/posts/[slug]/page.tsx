import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { compileMDXContent, extractHeadings, parseFrontmatter } from '@/lib/mdx'
import Breadcrumb from '@/components/site/Breadcrumb'
import TOC from '@/components/site/TOC'
import ArticleSchema from '@/components/site/ArticleSchema'

interface Props {
  params: Promise<{ slug: string }>
}

async function getArticle(slug: string) {
  try {
    const article = await prisma.article.findFirst({
      where: { slug, status: 'published' },
    })
    return article
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    return { title: '페이지를 찾을 수 없습니다' }
  }

  return {
    title: article.title,
    description: article.summary || `${article.title}에 대한 상세 정보`,
    openGraph: {
      title: article.title,
      description: article.summary || undefined,
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
    },
  }
}

export async function generateStaticParams() {
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'published' },
      select: { slug: true },
    })
    return articles.map((article) => ({ slug: article.slug }))
  } catch {
    return []
  }
}

const categoryNames: Record<string, string> = {
  finance: '생활금융',
  policy: '제도',
  'it-tips': 'IT팁',
  shopping: '쇼핑가이드',
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    notFound()
  }

  const { frontmatter, content: rawContent } = parseFrontmatter(article.content)
  const { content } = await compileMDXContent(article.content)
  const headings = extractHeadings(rawContent)
  let tags: string[] = []
  try {
    const parsed = JSON.parse(article.tags || '[]')
    tags = Array.isArray(parsed) ? parsed : article.tags.split(',').map((t: string) => t.trim())
  } catch {
    tags = article.tags ? article.tags.split(',').map((t: string) => t.trim()) : []
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return (
    <>
      <ArticleSchema
        title={article.title}
        description={article.summary || ''}
        datePublished={article.publishedAt?.toISOString() || article.createdAt.toISOString()}
        dateModified={article.updatedAt.toISOString()}
        url={`${siteUrl}/posts/${article.slug}`}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { name: categoryNames[article.category] || article.category, href: `/category/${article.category}` },
            { name: article.title },
          ]}
        />

        <div className="lg:grid lg:grid-cols-[1fr_200px] lg:gap-8">
          <article className="prose max-w-none">
            <header className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)]">
                <span className="px-2 py-1 bg-[var(--muted)] rounded">
                  {categoryNames[article.category] || article.category}
                </span>
                {article.publishedAt && (
                  <time dateTime={article.publishedAt.toISOString()}>
                    {new Date(article.publishedAt).toLocaleDateString('ko-KR')}
                  </time>
                )}
                {frontmatter.updated && (
                  <span>
                    (업데이트: {frontmatter.updated})
                  </span>
                )}
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-[var(--muted)] rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <div className="mdx-content">{content}</div>
          </article>

          <aside className="hidden lg:block">
            <TOC headings={headings} />
          </aside>
        </div>
      </div>
    </>
  )
}
