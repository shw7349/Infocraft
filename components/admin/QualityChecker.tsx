'use client'

interface QualityIssue {
  type: 'error' | 'warning' | 'info'
  message: string
}

interface QualityCheckerProps {
  content: string
}

const forbiddenPhrases = [
  '반드시', '무조건', '100%', '확정', '절대',
  '보장', '확실히', '틀림없이',
]

const requiredSections = [
  { pattern: /##\s*(핵심|요약|결론)/i, name: '핵심 요약' },
  { pattern: /##\s*(FAQ|자주\s*묻는|질문)/i, name: 'FAQ 섹션' },
  { pattern: /##\s*(주의|면책|유의)/i, name: '주의사항/면책' },
  { pattern: /##\s*(출처|참고|공식)/i, name: '출처/참고 링크' },
]

export default function QualityChecker({ content }: QualityCheckerProps) {
  const issues: QualityIssue[] = []

  // Check forbidden phrases
  forbiddenPhrases.forEach((phrase) => {
    if (content.includes(phrase)) {
      issues.push({
        type: 'error',
        message: `금지 표현 발견: "${phrase}" - 단정적 표현을 피해주세요.`,
      })
    }
  })

  // Check required sections
  requiredSections.forEach((section) => {
    if (!section.pattern.test(content)) {
      issues.push({
        type: 'warning',
        message: `${section.name} 섹션이 없습니다.`,
      })
    }
  })

  // Check content length
  const wordCount = content.replace(/[#*`\[\]()]/g, '').split(/\s+/).length
  if (wordCount < 500) {
    issues.push({
      type: 'warning',
      message: `콘텐츠가 짧습니다 (${wordCount}단어). 최소 500단어 이상을 권장합니다.`,
    })
  }

  // Check for external links
  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g
  const links = content.match(linkPattern) || []
  if (links.length < 3) {
    issues.push({
      type: 'warning',
      message: `외부 링크가 부족합니다 (${links.length}개). 최소 3개 이상의 공식 출처를 포함해주세요.`,
    })
  }

  // Check headings structure
  const h2Count = (content.match(/^##\s+/gm) || []).length
  if (h2Count < 3) {
    issues.push({
      type: 'warning',
      message: `H2 제목이 부족합니다 (${h2Count}개). 구조화된 콘텐츠를 위해 최소 3개 이상 필요합니다.`,
    })
  }

  // Check FAQ count
  const faqMatch = content.match(/\*\*Q[.:]/gi) || content.match(/Q[.:]\s/gi) || []
  if (faqMatch.length < 5) {
    issues.push({
      type: 'info',
      message: `FAQ가 ${faqMatch.length}개 감지되었습니다. 최소 5개 이상을 권장합니다.`,
    })
  }

  if (issues.length === 0) {
    return (
      <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
        <p className="text-green-700 dark:text-green-400 font-medium">
          ✓ 품질 검사를 통과했습니다
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-sm mb-3">품질 검사 결과</h3>
      {issues.map((issue, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg text-sm ${
            issue.type === 'error'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              : issue.type === 'warning'
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
          }`}
        >
          <span className="font-medium">
            {issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>{' '}
          {issue.message}
        </div>
      ))}
    </div>
  )
}
