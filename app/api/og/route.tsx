/**
 * OG 이미지 (썸네일) 동적 생성 API
 *
 * 사용법: /api/og?title=제목&category=카테고리
 *
 * 결과: 1200x630 PNG 이미지
 */

import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// 카테고리별 색상 테마
const categoryThemes: Record<string, { bg: string; accent: string }> = {
  finance: { bg: '#1a365d', accent: '#63b3ed' },      // 진한 파랑
  policy: { bg: '#22543d', accent: '#68d391' },       // 진한 초록
  'it-tips': { bg: '#553c9a', accent: '#b794f4' },    // 보라
  shopping: { bg: '#9c4221', accent: '#fbd38d' },     // 주황/갈색
  default: { bg: '#1a202c', accent: '#a0aec0' },      // 기본 회색
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const title = searchParams.get('title') || 'INFOCRAFT'
    const category = searchParams.get('category') || 'default'
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const theme = categoryThemes[category] || categoryThemes.default

    // 제목 길이에 따른 폰트 크기 조절
    const titleLength = title.length
    let fontSize = 60
    if (titleLength > 30) fontSize = 48
    if (titleLength > 50) fontSize = 40
    if (titleLength > 70) fontSize = 32

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.bg,
            padding: '60px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* 상단 로고 영역 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                backgroundColor: theme.accent,
                color: theme.bg,
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              INFOCRAFT
            </div>
            <div
              style={{
                marginLeft: '16px',
                color: theme.accent,
                fontSize: '20px',
              }}
            >
              {getCategoryName(category)}
            </div>
          </div>

          {/* 제목 영역 */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              alignItems: 'center',
            }}
          >
            <h1
              style={{
                color: 'white',
                fontSize: `${fontSize}px`,
                fontWeight: 'bold',
                lineHeight: 1.3,
                margin: 0,
                wordBreak: 'keep-all',
              }}
            >
              {title}
            </h1>
          </div>

          {/* 하단 날짜 및 장식 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '40px',
            }}
          >
            <div
              style={{
                color: theme.accent,
                fontSize: '20px',
              }}
            >
              {date}
            </div>
            {/* 장식 요소 */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
              }}
            >
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: theme.accent,
                    borderRadius: '50%',
                    opacity: 1 - i * 0.3,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('OG Image generation error:', error)
    return new Response('이미지 생성 실패', { status: 500 })
  }
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    finance: '생활금융',
    policy: '제도',
    'it-tips': 'IT팁',
    shopping: '쇼핑가이드',
  }
  return names[category] || '정보'
}
