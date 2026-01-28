/**
 * 콘텐츠 전처리기
 *
 * 네이버 블로그 스타일 마크다운을 HTML로 변환
 * - :::info, :::tip, :::warning, :::highlight → 컬러 박스
 * - ![alt](SECTION_IMAGE) → 동적 이미지 URL
 * - ==text== → 하이라이트
 */

/**
 * 컬러 박스 문법을 마크다운 인용문으로 변환
 * :::type → > [!TYPE] 형태로 변환 (GitHub Flavored Markdown alert 스타일)
 * 렌더링 후 CSS로 스타일링
 */
export function processCallouts(content: string): string {
  // :::type ... ::: 패턴 매칭
  const calloutRegex = /:::(info|tip|warning|highlight)\n([\s\S]*?):::/g

  return content.replace(calloutRegex, (_, type, innerContent) => {
    const typeEmoji: Record<string, string> = {
      info: '💡',
      tip: '✨',
      warning: '⚠️',
      highlight: '📌',
    }
    const emoji = typeEmoji[type] || '💡'

    // 인용문으로 변환 (각 줄 앞에 > 추가)
    const lines = innerContent.trim().split('\n')
    const quotedContent = lines.map((line: string) => `> ${line}`).join('\n')

    return `> ${emoji} **${type.toUpperCase()}**\n>\n${quotedContent}\n`
  })
}

/**
 * SECTION_IMAGE 플레이스홀더를 실제 이미지 URL로 변환
 */
export function processSectionImages(
  content: string,
  title: string,
  category: string
): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  // 각 이미지에 고유 텍스트 추출하여 OG 이미지 생성
  let imageIndex = 0

  return content.replace(
    /!\[([^\]]*)\]\(SECTION_IMAGE\)/g,
    (_, alt) => {
      imageIndex++
      const imageText = alt || `섹션 ${imageIndex}`
      const ogUrl = `${siteUrl}/api/og?title=${encodeURIComponent(imageText)}&category=${encodeURIComponent(category)}&date=`
      return `![${alt}](${ogUrl})`
    }
  )
}

/**
 * ==text== 하이라이트 문법 변환
 * HTML 대신 마크다운 굵게로 대체 (MDX 호환)
 */
export function processHighlights(content: string): string {
  return content.replace(/==([^=]+)==/g, '**$1**')
}

/**
 * 전체 콘텐츠 전처리
 */
export function processContent(
  content: string,
  options: {
    title: string
    category: string
  }
): string {
  let processed = content

  // 1. 컬러 박스 처리
  processed = processCallouts(processed)

  // 2. 섹션 이미지 처리
  processed = processSectionImages(processed, options.title, options.category)

  // 3. 하이라이트 처리
  processed = processHighlights(processed)

  return processed
}
