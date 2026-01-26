import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
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
    return NextResponse.json(articles)
  } catch (error) {
    console.error('Failed to fetch articles:', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, slug, content, summary, category, tags, status } = body

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
    }

    const existingArticle = await prisma.article.findUnique({
      where: { slug },
    })

    if (existingArticle) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content: content || '',
        summary: summary || null,
        category: category || 'finance',
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
        status: status || 'draft',
        publishedAt: status === 'published' ? new Date() : null,
      },
    })

    return NextResponse.json(article)
  } catch (error) {
    console.error('Failed to create article:', error)
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}
