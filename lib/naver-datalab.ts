/**
 * 네이버 데이터랩 통합 검색어 트렌드 API 클라이언트
 *
 * API 문서: https://developers.naver.com/docs/serviceapi/datalab/search/search.md
 * - POST https://openapi.naver.com/v1/datalab/search
 * - 최대 5개 keywordGroup per request
 * - ratio: 구간별 검색량 상대적 비율 (최대값 100)
 */

const API_URL = 'https://openapi.naver.com/v1/datalab/search'

interface KeywordGroup {
  groupName: string
  keywords: string[]
}

interface TrendDataPoint {
  period: string
  ratio: number
}

interface TrendResult {
  title: string
  keywords: string[]
  data: TrendDataPoint[]
}

interface NaverDatalabResponse {
  startDate: string
  endDate: string
  timeUnit: string
  results: TrendResult[]
}

export interface TrendWithScore {
  groupName: string
  keywords: string[]
  data: TrendDataPoint[]
  hotScore: number
}

/**
 * 네이버 데이터랩 검색어 트렌드 조회
 * keywordGroups가 5개를 초과하면 배치 분할 호출
 */
export async function fetchTrend(
  keywordGroups: KeywordGroup[],
  startDate: string,
  endDate: string,
  timeUnit: 'date' | 'week' | 'month' = 'date'
): Promise<TrendResult[]> {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET

  if (!clientId || !clientSecret || clientId.startsWith('your-') || clientSecret.startsWith('your-')) {
    throw new Error('NAVER_CLIENT_ID, NAVER_CLIENT_SECRET 환경변수를 실제 값으로 설정하세요.')
  }

  const results: TrendResult[] = []

  // API 최대 5그룹 제한 → 배치 분할
  for (let i = 0; i < keywordGroups.length; i += 5) {
    const batch = keywordGroups.slice(i, i + 5)

    const body = {
      startDate,
      endDate,
      timeUnit,
      keywordGroups: batch,
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `네이버 데이터랩 API 오류 (${response.status}): ${errorText}`
      )
    }

    const data: NaverDatalabResponse = await response.json()
    results.push(...data.results)

    // 연속 호출 시 rate limit 방지
    if (i + 5 < keywordGroups.length) {
      await sleep(200)
    }
  }

  return results
}

/**
 * hot_score 계산: 최근 7일 평균 ratio 대비 상승률
 *
 * 계산 방식:
 *   이전 7일 평균 vs 최근 7일 평균 → 상승률(%)
 *   데이터가 14일 미만이면 최근 ratio 평균을 그대로 사용
 */
export function calculateHotScore(data: TrendDataPoint[]): number {
  if (data.length === 0) return 0

  if (data.length < 14) {
    // 데이터 부족 시 최근 데이터 평균
    const recent = data.slice(-7)
    return average(recent.map((d) => d.ratio))
  }

  const recent7 = data.slice(-7)
  const prev7 = data.slice(-14, -7)

  const recentAvg = average(recent7.map((d) => d.ratio))
  const prevAvg = average(prev7.map((d) => d.ratio))

  if (prevAvg === 0) return recentAvg

  // 상승률(%) 기반 스코어
  const growthRate = ((recentAvg - prevAvg) / prevAvg) * 100
  // 절대값 + 상승률 가중 결합
  return recentAvg * 0.4 + Math.max(growthRate, 0) * 0.6
}

/**
 * 트렌드 결과에 hotScore를 부여하여 반환
 */
export function scoreTrends(results: TrendResult[]): TrendWithScore[] {
  return results.map((r) => ({
    groupName: r.title,
    keywords: r.keywords,
    data: r.data,
    hotScore: calculateHotScore(r.data),
  }))
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
