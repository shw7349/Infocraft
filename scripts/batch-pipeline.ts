/**
 * INFOCRAFT 일 배치 자동화 파이프라인
 *
 * 실행: npx tsx scripts/batch-pipeline.ts
 * cron: 15 23 * * * cd /path/to/project && npx tsx scripts/batch-pipeline.ts
 *
 * 3단계 순차 실행:
 *  1) Trend Fetch — 네이버 데이터랩 트렌드 수집
 *  2) Draft Generate — 상위 키워드로 Claude 초안 생성
 *  3) Quality Check — 품질검사 후 published/rejected 분류
 */

import { PrismaClient } from '@prisma/client'
import { fetchTrend, calculateHotScore } from '../lib/naver-datalab'
import { generateDraft } from '../lib/claude-content'
import { checkQuality } from '../lib/quality-check'
import { parseBatchFrontmatter } from '../lib/parse-frontmatter'

const prisma = new PrismaClient()

const MAX_DAILY_DRAFTS = 5
const YMYL_CATEGORIES = ['의학', '법률', '금융', '생활금융', '건강', '세금']

// ──────────────────────────────────────────
// 유틸
// ──────────────────────────────────────────

async function createBatchLog(jobType: string) {
  return prisma.batchLog.create({
    data: { jobType, status: 'running' },
  })
}

async function completeBatchLog(id: string, result: string) {
  return prisma.batchLog.update({
    where: { id },
    data: { status: 'completed', result, completedAt: new Date() },
  })
}

async function failBatchLog(id: string, error: string) {
  return prisma.batchLog.update({
    where: { id },
    data: { status: 'failed', error, completedAt: new Date() },
  })
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

// ──────────────────────────────────────────
// Step 1: Trend Fetch Job
// ──────────────────────────────────────────

async function trendFetchJob(): Promise<string[]> {
  const log = await createBatchLog('trend_fetch')
  console.log('[Step 1] 트렌드 수집 시작')

  try {
    const keywords = await prisma.keyword.findMany({
      orderBy: { priority: 'desc' },
    })

    if (keywords.length === 0) {
      await completeBatchLog(log.id, 'seed 키워드 없음')
      console.log('[Step 1] seed 키워드가 없습니다. 키워드를 먼저 등록하세요.')
      return []
    }

    const keywordGroups = keywords.map((k) => ({
      groupName: k.keyword,
      keywords: [k.keyword],
    }))

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const results = await fetchTrend(
      keywordGroups,
      formatDate(startDate),
      formatDate(endDate),
      'date'
    )

    let savedCount = 0
    for (const result of results) {
      const keyword = keywords.find((k) => k.keyword === result.title)
      if (!keyword) continue

      for (const dp of result.data) {
        const hotScore = calculateHotScore(result.data)
        await prisma.keywordTrend.upsert({
          where: {
            keywordId_period: { keywordId: keyword.id, period: dp.period },
          },
          update: { ratio: dp.ratio, hotScore },
          create: {
            keywordId: keyword.id,
            period: dp.period,
            ratio: dp.ratio,
            hotScore,
          },
        })
        savedCount++
      }

      await prisma.keyword.update({
        where: { id: keyword.id },
        data: { lastCheckedAt: new Date() },
      })
    }

    const summary = `${keywords.length}개 키워드 조회, ${savedCount}개 트렌드 저장`
    await completeBatchLog(log.id, summary)
    console.log(`[Step 1] 완료: ${summary}`)

    const topKeywords = await prisma.keywordTrend.groupBy({
      by: ['keywordId'],
      _max: { hotScore: true },
      orderBy: { _max: { hotScore: 'desc' } },
      take: MAX_DAILY_DRAFTS * 2,
    })

    return topKeywords.map((t) => t.keywordId)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    await failBatchLog(log.id, errorMsg)
    console.error('[Step 1] 실패:', errorMsg)
    return []
  }
}

// ──────────────────────────────────────────
// Step 2: Draft Generate Job
// ──────────────────────────────────────────

async function draftGenerateJob(
  candidateKeywordIds: string[]
): Promise<string[]> {
  const log = await createBatchLog('draft_generate')
  console.log('[Step 2] 초안 생성 시작')

  try {
    if (candidateKeywordIds.length === 0) {
      await completeBatchLog(log.id, '후보 키워드 없음')
      console.log('[Step 2] 후보 키워드가 없습니다.')
      return []
    }

    const candidates = await prisma.keyword.findMany({
      where: { id: { in: candidateKeywordIds } },
      include: {
        articles: {
          where: { status: { in: ['draft', 'review', 'published'] } },
        },
      },
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

    if (selected.length === 0) {
      await completeBatchLog(log.id, '생성 가능 키워드 없음 (모두 중복/YMYL 초과)')
      console.log('[Step 2] 생성 가능한 키워드가 없습니다.')
      return []
    }

    const createdArticleIds: string[] = []

    for (const keyword of selected) {
      console.log(`  → 초안 생성 중: "${keyword.keyword}" (${keyword.category})`)

      try {
        const content = await generateDraft(keyword.keyword, keyword.category)
        const { title, slug, summary, tags } = parseBatchFrontmatter(
          content,
          keyword.keyword
        )

        const article = await prisma.article.create({
          data: {
            title,
            slug,
            content,
            summary,
            category: keyword.category,
            tags,
            status: 'draft',
            keywordId: keyword.id,
          },
        })

        createdArticleIds.push(article.id)

        await prisma.keyword.update({
          where: { id: keyword.id },
          data: {
            lastGeneratedAt: new Date(),
            dailyGeneratedCount: { increment: 1 },
          },
        })

        console.log(`  ✓ 생성 완료: ${title}`)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`  ✗ 생성 실패 (${keyword.keyword}): ${msg}`)
      }
    }

    const summary = `${selected.length}개 시도, ${createdArticleIds.length}개 생성 완료`
    await completeBatchLog(log.id, summary)
    console.log(`[Step 2] 완료: ${summary}`)
    return createdArticleIds
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    await failBatchLog(log.id, errorMsg)
    console.error('[Step 2] 실패:', errorMsg)
    return []
  }
}

// ──────────────────────────────────────────
// Step 3: Quality Check Job
// 통과 → published (사이트에 바로 노출)
// 실패 → rejected
// ──────────────────────────────────────────

async function qualityCheckJob(articleIds: string[]): Promise<void> {
  const log = await createBatchLog('quality_check')
  console.log('[Step 3] 품질검사 시작')

  try {
    if (articleIds.length === 0) {
      await completeBatchLog(log.id, '검사 대상 없음')
      console.log('[Step 3] 검사 대상 글이 없습니다.')
      return
    }

    const articles = await prisma.article.findMany({
      where: { id: { in: articleIds } },
    })

    const recentCategories = articles.map((a) => a.category)

    let publishedCount = 0
    let rejectedCount = 0

    for (const article of articles) {
      const result = checkQuality(article.content, {
        recentCategories,
        currentCategory: article.category,
      })

      if (result.passed) {
        // 통과 → 바로 published (사이트 노출)
        await prisma.article.update({
          where: { id: article.id },
          data: {
            status: 'published',
            publishedAt: new Date(),
          },
        })
        await prisma.reviewLog.create({
          data: {
            articleId: article.id,
            action: 'auto_published',
            comment: `배치 품질검사 통과 (${result.score}점) → 자동 발행`,
          },
        })
        publishedCount++
        console.log(`  ✓ 발행 완료: "${article.title}" (${result.score}점)`)
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
            comment: `품질검사 미통과 (${result.score}점): ${issuesSummary}`,
          },
        })
        rejectedCount++
        console.log(
          `  ✗ 반려: "${article.title}" (${result.score}점)`
        )
      }
    }

    const summary = `${articles.length}개 검사, ${publishedCount}개 발행, ${rejectedCount}개 반려`
    await completeBatchLog(log.id, summary)
    console.log(`[Step 3] 완료: ${summary}`)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    await failBatchLog(log.id, errorMsg)
    console.error('[Step 3] 실패:', errorMsg)
  }
}

// ──────────────────────────────────────────
// Main
// ──────────────────────────────────────────

async function main() {
  console.log('========================================')
  console.log('INFOCRAFT 일 배치 파이프라인 시작')
  console.log(`실행 시간: ${new Date().toISOString()}`)
  console.log('========================================\n')

  try {
    await prisma.keyword.updateMany({
      data: { dailyGeneratedCount: 0 },
    })

    const topKeywordIds = await trendFetchJob()
    console.log('')

    const articleIds = await draftGenerateJob(topKeywordIds)
    console.log('')

    await qualityCheckJob(articleIds)

    console.log('\n========================================')
    console.log('배치 파이프라인 완료')
    console.log('========================================')
  } catch (err) {
    console.error('배치 파이프라인 오류:', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
