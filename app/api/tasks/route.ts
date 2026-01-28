import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/tasks - List tasks with filters and pagination
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    // Filters
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assigneeId = searchParams.get('assigneeId')
    const dueDateFrom = searchParams.get('dueDateFrom')
    const dueDateTo = searchParams.get('dueDateTo')

    // Build where clause
    const where: any = {}
    if (status && ['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      where.status = status
    }
    if (priority && ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
      where.priority = priority
    }
    if (assigneeId) {
      where.assigneeId = assigneeId
    }
    if (dueDateFrom || dueDateTo) {
      where.dueDate = {}
      if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom)
      if (dueDateTo) where.dueDate.lte = new Date(dueDateTo)
    }

    // Query
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          article: { select: { id: true, title: true, slug: true, status: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          assignee: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.task.count({ where }),
    ])

    return NextResponse.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, status, priority, dueDate, articleId, assigneeId } = body

    // Validation
    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    const trimmedTitle = title.trim()
    if (trimmedTitle.length === 0) {
      return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 })
    }
    if (trimmedTitle.length > 200) {
      return NextResponse.json({ error: 'Title must be 200 characters or less' }, { status: 400 })
    }

    if (description && typeof description === 'string' && description.length > 2000) {
      return NextResponse.json({ error: 'Description must be 2000 characters or less' }, { status: 400 })
    }

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 })
    }

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` }, { status: 400 })
    }

    // Verify articleId exists if provided
    if (articleId) {
      const article = await prisma.article.findUnique({ where: { id: articleId } })
      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 400 })
      }
    }

    // Verify assigneeId exists if provided
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: assigneeId } })
      if (!assignee) {
        return NextResponse.json({ error: 'Assignee not found' }, { status: 400 })
      }
    }

    const task = await prisma.task.create({
      data: {
        title: trimmedTitle,
        description: description || null,
        status: status || 'PENDING',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        articleId: articleId || null,
        createdById: session.user.id,
        assigneeId: assigneeId || session.user.id,
      },
      include: {
        article: { select: { id: true, title: true, slug: true, status: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
