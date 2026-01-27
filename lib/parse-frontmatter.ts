/**
 * 배치 파이프라인용 frontmatter 파싱 유틸리티
 * Claude가 생성한 Markdown에서 title, slug, summary, tags를 추출
 */

export function parseBatchFrontmatter(
  content: string,
  fallbackKeyword: string
): { title: string; slug: string; summary: string; tags: string } {
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/)
  const fm: Record<string, string> = {}

  if (fmMatch) {
    const lines = fmMatch[1].split('\n')
    for (const line of lines) {
      const idx = line.indexOf(':')
      if (idx > 0) {
        const key = line.substring(0, idx).trim()
        const value = line
          .substring(idx + 1)
          .trim()
          .replace(/^["']|["']$/g, '')
        fm[key] = value
      }
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const title = fm.title || fallbackKeyword
  const slug =
    fm.slug ||
    fallbackKeyword
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9가-힣-]/g, '')
      .toLowerCase() +
      '-' +
      today.replace(/-/g, '')

  return {
    title,
    slug,
    summary: fm.summary || '',
    tags: fm.tags || fallbackKeyword,
  }
}
