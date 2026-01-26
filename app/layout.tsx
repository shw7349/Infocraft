import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'INFOCRAFT - 생활 정보 가이드',
    template: '%s | INFOCRAFT',
  },
  description: '생활금융, 제도, IT팁, 쇼핑가이드 등 유용한 정보를 제공합니다.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'INFOCRAFT',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
