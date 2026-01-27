import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fetchTrend, calculateHotScore } from '@/lib/naver-datalab'
import { generateDraft } from '@/lib/claude-content'
import { checkQuality } from '@/lib/quality-check'
import { parseBatchFrontmatter } from '@/lib/parse-frontmatter'

const MAX_DAILY_DRAFTS = 5
const YMYL_CATEGORIES = ['의학', '법률', '금융', '생활금융', '건강', '세금']

// GET — 최근 배치 실행 로그 조회
export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const logs = await prisma.batchLog.findMany({
    orderBy: { startedAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(logs)
}

// POST — 수동 배치 트리거
export async function POST() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const running = await prisma.batchLog.findFirst({
    where: { status: 'running' },
  })
  if (running) {
    return NextResponse.json(
      { error: '이미 실행 중인 배치가 있습니다.', runningJob: running },
      { status: 409 }
    )
  }

  try {
    await prisma.keyword.updateMany({ data: { dailyGeneratedCount: 0 } })

    // Step 1: Trend Fetch
    const step1Log = await prisma.batchLog.create({
      data: { jobType: 'trend_fetch', status: 'running' },
    })

    const keywords = await prisma.keyword.findMany({
      orderBy: { priority: 'desc' },
    })

    let topKeywordIds: string[] = []

    if (keywords.length > 0) {
      const keywordGroups = keywords.map((k) => ({
        groupName: k.keyword,
        keywords: [k.keyword],
      }))

      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)

      const fmt = (d: Date) => d.toISOString().split('T')[0]
      const results = await fetchTrend(keywordGroups, fmt(startDate), fmt(endDate), 'date')

      let savedCount = 0
      for (const result of results) {
        const kw = keywords.find((k) => k.keyword === result.title)
        if (!kw) continue
        for (const dp of result.data) {
          const hotScore = calculateHotScore(result.data)
          await prisma.keywordTrend.upsert({
            where: { keywordId_period: { keywordId: kw.id, period: dp.period } },
            update: { ratio: dp.ratio, hotScore },
            create: { keywordId: kw.id, period: dp.period, ratio: dp.ratio, hotScore },
          })
          savedCount++
        }
        await prisma.keyword.update({
          where: { id: kw.id },
          data: { lastCheckedAt: new Date() },
        })
      }

      await prisma.batchLog.update({
        where: { id: step1Log.id },
        data: {
          status: 'completed',
          result: `${keywords.length}개 키워드 조회, ${savedCount}개 트렌드 저장`,
          completedAt: new Date(),
        },
      })

      const topKeywords = await prisma.keywordTrend.groupBy({
        by: ['keywordId'],
        _max: { hotScore: true },
        orderBy: { _max: { hotScore: 'desc' } },
        take: MAX_DAILY_DRAFTS * 2,
      })
      topKeywordIds = topKeywords.map((t) => t.keywordId)
    } else {
      await prisma.batchLog.update({
        where: { id: step1Log.id },
        data: { status: 'completed', result: 'seed 키워드 없음', completedAt: new Date() },
      })
    }

    // Step 2: Draft Generate
    const step2Log = await prisma.batchLog.create({
      data: { jobType: 'draft_generate', status: 'running' },
    })

    const createdArticleIds: string[] = []

    if (topKeywordIds.length > 0) {
      const candidates = await prisma.keyword.findMany({
        where: { id: { in: topKeywordIds } },
        include: { articles: { where: { status: { in: ['draft', 'review', 'published'] } } } },
        orderBy: { priority: 'desc' },
      })

      const filtered = candidates.filter((k) => k.articles.length === 0)
      let ymylCount = 0
      const selected: typeof filtered = []

      for (const k of filtered) {
        if (selected.length >= MAX_DAILY_DRAFTS) break
        const isYmyl = YMYL_CATEGORIES.includes(k.category)
        if (isYmyl && ymylCount >= 1) continue
        if (isYmyl) ymylCount++
        selected.push(k)
      }

      for (const kw of selected) {
        try {
          const content = await generateDraft(kw.keyword, kw.category)
          const { title, slug, summary, tags } = parseBatchFrontmatter(content, kw.keyword)
          const article = await prisma.article.create({
            data: { title, slug, content, summary, category: kw.category, tags, status: 'draft', keywordId: kw.id },
          })
          createdArticleIds.push(article.id)
          await prisma.keyword.update({
            where: { id: kw.id },
            data: { lastGeneratedAt: new Date(), dailyGeneratedCount: { increment: 1 } },
          })
        } catch {
          // 개별 실패는 건너뜀
        }
      }
    }

    await prisma.batchLog.update({
      where: { id: step2Log.id },
      data: {
        status: 'completed',
        result: `${createdArticleIds.length}개 초안 생성`,
        completedAt: new Date(),
      },
    })

    // Step 3: Quality Check → 통과 시 published
    const step3Log = await prisma.batchLog.create({
      data: { jobType: 'quality_check', status: 'running' },
    })

    let publishedCount = 0
    let rejectedCount = 0

    if (createdArticleIds.length > 0) {
      const articles = await prisma.article.findMany({
        where: { id: { in: createdArticleIds } },
      })
      const recentCategories = articles.map((a) => a.category)

      for (const article of articles) {
        const result = checkQuality(article.content, {
          recentCategories,
          currentCategory: article.category,
        })
        if (result.passed) {
          await prisma.article.update({
            where: { id: article.id },
            data: { status: 'published', publishedAt: new Date() },
          })
          await prisma.reviewLog.create({
            data: {
              articleId: article.id,
              action: 'auto_published',
              comment: `배치 품질검사 통과 (${result.score}점) → 자동 발행`,
            },
          })
          publishedCount++
        } else {
          await prisma.article.update({
            where: { id: article.id },
            data: { status: 'rejected' },
          })
          const issuesSummary = result.issues.map((i) => i.message).join('; ')
          await prisma.reviewLog.create({
            data: {
              articleId: article.id,
              action: 'auto_rejected',
              comment: `미통과 (${result.score}점): ${issuesSummary}`,
            },
          })
          rejectedCount++
        }
      }
    }

    await prisma.batchLog.update({
      where: { id: step3Log.id },
      data: {
        status: 'completed',
        result: `${publishedCount}개 발행, ${rejectedCount}개 반려`,
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      summary: {
        trendFetch: `${keywords.length}개 키워드 처리`,
        draftGenerate: `${createdArticleIds.length}개 초안 생성`,
        qualityCheck: `${publishedCount}개 발행, ${rejectedCount}개 반려`,
      },
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}

