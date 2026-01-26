import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const article = await prisma.article.findUnique({
      where: { id },
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Failed to fetch article:', error)
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { title, slug, content, summary, category, tags, status, scheduledAt } = body

    const existingArticle = await prisma.article.findUnique({
      where: { id },
    })

    if (!existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Check if slug is taken by another article
    if (slug !== existingArticle.slug) {
      const slugTaken = await prisma.article.findUnique({
        where: { slug },
      })
      if (slugTaken) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
      }
    }

    // Determine publishedAt
    let publishedAt = existingArticle.publishedAt
    if (status === 'published' && existingArticle.status !== 'published') {
      publishedAt = new Date()
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        summary: summary || null,
        category,
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        publishedAt,
      },
    })

    // Create review log if status changed
    if (existingArticle.status !== status) {
      await prisma.reviewLog.create({
        data: {
          articleId: id,
          action: status,
          comment: `Status changed from ${existingArticle.status} to ${status}`,
        },
      })
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Failed to update article:', error)
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await prisma.article.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete article:', error)
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
