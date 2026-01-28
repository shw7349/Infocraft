import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import matter from 'gray-matter'

export interface ArticleFrontmatter {
  title: string
  slug: string
  date: string
  updated?: string
  category: string
  tags: string[]
  summary: string
}

export async function compileMDXContent(source: string) {
  const { content, frontmatter } = await compileMDX<ArticleFrontmatter>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        ],
      },
    },
  })

  return { content, frontmatter }
}

export function parseFrontmatter(source: string) {
  const { data, content } = matter(source)
  // gray-matter가 Date 객체로 파싱하는 것을 문자열로 변환
  const frontmatter = {
    ...data,
    date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : data.date,
    updated: data.updated instanceof Date ? data.updated.toISOString().split('T')[0] : data.updated,
  } as ArticleFrontmatter
  return { frontmatter, content }
}

export function extractHeadings(content: string) {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  const headings: { level: number; text: string; id: string }[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2]
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
    headings.push({ level, text, id })
  }

  return headings
}
