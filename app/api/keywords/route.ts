import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const keywords = await prisma.keyword.findMany({
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        _count: {
          select: { articles: true },
        },
      },
    })
    return NextResponse.json(keywords)
  } catch (error) {
    console.error('Failed to fetch keywords:', error)
    return NextResponse.json({ error: 'Failed to fetch keywords' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { keyword, category, priority } = body

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
    }

    const existingKeyword = await prisma.keyword.findUnique({
      where: { keyword },
    })

    if (existingKeyword) {
      return NextResponse.json({ error: 'Keyword already exists' }, { status: 400 })
    }

    const newKeyword = await prisma.keyword.create({
      data: {
        keyword,
        category: category || 'finance',
        priority: priority || 0,
      },
    })

    return NextResponse.json(newKeyword)
  } catch (error) {
    console.error('Failed to create keyword:', error)
    return NextResponse.json({ error: 'Failed to create keyword' }, { status: 500 })
  }
}
