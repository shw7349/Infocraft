import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { articleId } = body

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    if (article.status !== 'approved') {
      return NextResponse.json({ error: 'Article must be approved before publishing' }, { status: 400 })
    }

    // Create MDX file in content directory
    const contentDir = path.join(process.cwd(), 'content')
    await fs.mkdir(contentDir, { recursive: true })

    const filePath = path.join(contentDir, `${article.slug}.mdx`)
    await fs.writeFile(filePath, article.content, 'utf-8')

    // Update article status
    await prisma.article.update({
      where: { id: articleId },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    })

    // Create review log
    await prisma.reviewLog.create({
      data: {
        articleId,
        action: 'published',
        comment: 'Article published to content directory',
      },
    })

    return NextResponse.json({ success: true, filePath })
  } catch (error) {
    console.error('Failed to publish article:', error)
    return NextResponse.json({ error: 'Failed to publish article' }, { status: 500 })
  }
}
