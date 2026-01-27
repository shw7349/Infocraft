import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — 현재 배치 상태 확인
export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const running = await prisma.batchLog.findFirst({
    where: { status: 'running' },
    orderBy: { startedAt: 'desc' },
  })

  const lastCompleted = await prisma.batchLog.findFirst({
    where: { status: 'completed' },
    orderBy: { completedAt: 'desc' },
  })

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayLogs = await prisma.batchLog.findMany({
    where: { startedAt: { gte: todayStart } },
    orderBy: { startedAt: 'desc' },
  })

  return NextResponse.json({
    isRunning: !!running,
    running,
    lastCompleted,
    todayLogs,
  })
}
