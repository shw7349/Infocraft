import { NextRequest, NextResponse } from 'next/server'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    const contentWithoutFrontmatter = (content || '').replace(
      /^---[\s\S]*?---\n?/,
      ''
    )

    const result = await serialize(contentWithoutFrontmatter, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug],
      },
    })

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'MDX 파싱 오류'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
