/**
 * 서버사이드 품질검사 모듈
 *
 * components/admin/QualityChecker.tsx의 로직을 서버용으로 추출 +
 * 배치 전용 추가 규칙 (동일 카테고리 연속 제한, 키워드 남용 감지)
 */

export interface QualityIssue {
  type: 'error' | 'warning' | 'info'
  message: string
}

export interface QualityResult {
  passed: boolean
  issues: QualityIssue[]
  score: number // 0~100
}

const FORBIDDEN_PHRASES = [
  '반드시', '무조건', '100%', '확정', '절대',
  '보장', '확실히', '틀림없이',
]

const REQUIRED_SECTIONS = [
  { pattern: /##\s*(핵심|요약|결론)/i, name: '핵심 요약' },
  { pattern: /##\s*(FAQ|자주\s*묻는|질문)/i, name: 'FAQ 섹션' },
  { pattern: /##\s*(주의|면책|유의)/i, name: '주의사항/면책' },
  { pattern: /##\s*(출처|참고|공식)/i, name: '출처/참고 링크' },
]

// 배치 전용: 남용 감지 키워드
const OVERUSED_KEYWORDS = ['2026', '2025', '최신', '정리', '총정리', '완벽']

/**
 * 콘텐츠 품질검사 실행
 */
export function checkQuality(
  content: string,
  options?: {
    recentCategories?: string[] // 최근 생성된 글의 카테고리 목록
    currentCategory?: string
  }
): QualityResult {
  const issues: QualityIssue[] = []
  let score = 100

  // 1. 금지 표현 검사
  for (const phrase of FORBIDDEN_PHRASES) {
    if (content.includes(phrase)) {
      issues.push({
        type: 'error',
        message: `금지 표현 발견: "${phrase}"`,
      })
      score -= 15
    }
  }

  // 2. 필수 섹션 검사
  for (const section of REQUIRED_SECTIONS) {
    if (!section.pattern.test(content)) {
      issues.push({
        type: 'warning',
        message: `${section.name} 섹션이 없습니다.`,
      })
      score -= 10
    }
  }

  // 3. 분량 검사 (최소 500단어)
  const wordCount = content.replace(/[#*`\[\]()]/g, '').split(/\s+/).filter(Boolean).length
  if (wordCount < 500) {
    issues.push({
      type: 'warning',
      message: `콘텐츠가 짧습니다 (${wordCount}단어). 최소 500단어 이상 권장.`,
    })
    score -= 10
  }

  // 4. 외부 링크 검사 (최소 3개)
  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g
  const links = content.match(linkPattern) || []
  if (links.length < 3) {
    issues.push({
      type: 'warning',
      message: `외부 링크 부족 (${links.length}개). 최소 3개 이상 공식 출처 필요.`,
    })
    score -= 10
  }

  // 5. H2 구조 검사 (최소 3개)
  const h2Count = (content.match(/^##\s+/gm) || []).length
  if (h2Count < 3) {
    issues.push({
      type: 'warning',
      message: `H2 제목 부족 (${h2Count}개). 최소 3개 이상 필요.`,
    })
    score -= 5
  }

  // 6. FAQ 개수 검사 (최소 5개)
  const faqMatches = content.match(/\*\*Q[.:]/gi) || content.match(/Q[.:]\s/gi) || []
  if (faqMatches.length < 5) {
    issues.push({
      type: 'info',
      message: `FAQ ${faqMatches.length}개 감지. 최소 5개 이상 권장.`,
    })
    score -= 5
  }

  // 7. 배치 전용: 키워드 남용 감지
  for (const kw of OVERUSED_KEYWORDS) {
    const regex = new RegExp(kw, 'g')
    const matches = content.match(regex) || []
    if (matches.length > 5) {
      issues.push({
        type: 'warning',
        message: `"${kw}" 키워드가 ${matches.length}회 반복 (남용 의심).`,
      })
      score -= 5
    }
  }

  // 8. 배치 전용: 동일 카테고리 연속 생성 제한
  if (options?.recentCategories && options.currentCategory) {
    const recentSame = options.recentCategories.filter(
      (c) => c === options.currentCategory
    ).length
    if (recentSame >= 2) {
      issues.push({
        type: 'warning',
        message: `동일 카테고리("${options.currentCategory}") 연속 ${recentSame + 1}회 생성 시도. 카테고리 분산 필요.`,
      })
      score -= 10
    }
  }

  score = Math.max(0, score)
  const passed = score >= 60 && issues.filter((i) => i.type === 'error').length === 0

  return { passed, issues, score }
}
