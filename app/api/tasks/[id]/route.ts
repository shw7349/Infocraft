import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/tasks/[id] - Get single task
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        article: { select: { id: true, title: true, slug: true, status: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to fetch task:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

// PUT /api/tasks/[id] - Update task
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const existingTask = await prisma.task.findUnique({ where: { id } })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check permission: only owner or admin can update
    const isAdmin = session.user.role === 'admin'
    if (existingTask.createdById !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'You do not have permission to update this task' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, status, priority, dueDate, articleId, assigneeId } = body

    // Build update data
    const updateData: any = {}

    // Validate and set title
    if (title !== undefined) {
      if (typeof title !== 'string') {
        return NextResponse.json({ error: 'Title must be a string' }, { status: 400 })
      }
      const trimmedTitle = title.trim()
      if (trimmedTitle.length === 0) {
        return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 })
      }
      if (trimmedTitle.length > 200) {
        return NextResponse.json({ error: 'Title must be 200 characters or less' }, { status: 400 })
      }
      updateData.title = trimmedTitle
    }

    // Validate and set description
    if (description !== undefined) {
      if (description !== null && typeof description === 'string' && description.length > 2000) {
        return NextResponse.json({ error: 'Description must be 2000 characters or less' }, { status: 400 })
      }
      updateData.description = description
    }

    // Validate and set status
    if (status !== undefined) {
      const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 })
      }
      updateData.status = status
    }

    // Validate and set priority
    if (priority !== undefined) {
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
      if (!validPriorities.includes(priority)) {
        return NextResponse.json({ error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` }, { status: 400 })
      }
      updateData.priority = priority
    }

    // Handle dueDate
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null
    }

    // Validate and set articleId
    if (articleId !== undefined) {
      if (articleId !== null) {
        const article = await prisma.article.findUnique({ where: { id: articleId } })
        if (!article) {
          return NextResponse.json({ error: 'Article not found' }, { status: 400 })
        }
      }
      updateData.articleId = articleId
    }

    // Validate and set assigneeId
    if (assigneeId !== undefined) {
      if (assigneeId !== null) {
        const assignee = await prisma.user.findUnique({ where: { id: assigneeId } })
        if (!assignee) {
          return NextResponse.json({ error: 'Assignee not found' }, { status: 400 })
        }
      }
      updateData.assigneeId = assigneeId
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        article: { select: { id: true, title: true, slug: true, status: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to update task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const existingTask = await prisma.task.findUnique({ where: { id } })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check permission: only owner or admin can delete
    const isAdmin = session.user.role === 'admin'
    if (existingTask.createdById !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'You do not have permission to delete this task' }, { status: 403 })
    }

    await prisma.task.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
