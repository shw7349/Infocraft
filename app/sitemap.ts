import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const categories = ['finance', 'policy', 'it-tips', 'shopping']
const staticPages = ['about', 'privacy', 'terms'] // 'contact' 임시 제외

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // Homepage
  entries.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  })

  // Static pages
  staticPages.forEach((page) => {
    entries.push({
      url: `${BASE_URL}/${page}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    })
  })

  // Category pages
  categories.forEach((category) => {
    entries.push({
      url: `${BASE_URL}/category/${category}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })

  // Article pages
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    })

    articles.forEach((article) => {
      entries.push({
        url: `${BASE_URL}/posts/${article.slug}`,
        lastModified: article.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })
  } catch {
    // Database not initialized yet
  }

  return entries
}
