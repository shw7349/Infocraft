# INFOCRAFT

한국어 정보 제공 사이트 + Admin 검수 시스템

## 프로젝트 개요

INFOCRAFT는 AI와 사람 검수를 통해 운영되는 한국어 정보 사이트입니다.
Google 검색 품질 및 애드센스 정책을 준수하며, 자동화된 콘텐츠 생성-검수-발행 파이프라인을 제공합니다.

### 주요 기능

- **공개 사이트**: SEO 최적화된 정보 콘텐츠 제공
- **Admin 시스템**: 콘텐츠 작성, 검수, 발행 관리
- **품질 검사**: 금지 표현, 필수 섹션 자동 검사
- **MDX 지원**: Markdown + JSX 콘텐츠 작성

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | SQLite + Prisma |
| Auth | NextAuth.js (Google OAuth) |
| Content | MDX (next-mdx-remote) |

---

## 프로젝트 구조

```
INFOCRAFT/
├── app/
│   ├── (site)/                 # 공개 사이트
│   │   ├── page.tsx            # 홈페이지
│   │   ├── posts/[slug]/       # 게시글 상세
│   │   ├── category/[slug]/    # 카테고리별 목록
│   │   ├── about/              # 소개
│   │   ├── privacy/            # 개인정보처리방침
│   │   ├── terms/              # 이용약관
│   │   └── contact/            # 문의하기
│   ├── admin/                  # Admin 시스템
│   │   ├── page.tsx            # 대시보드
│   │   ├── articles/           # 글 관리
│   │   ├── articles/[id]/      # 글 편집기
│   │   ├── keywords/           # 키워드 관리
│   │   └── login/              # 로그인
│   ├── api/                    # API 라우트
│   │   ├── auth/               # 인증
│   │   ├── articles/           # 글 CRUD
│   │   ├── keywords/           # 키워드 CRUD
│   │   └── publish/            # 발행
│   ├── sitemap.ts              # 사이트맵 자동 생성
│   ├── robots.ts               # robots.txt
│   ├── layout.tsx              # 루트 레이아웃
│   └── globals.css             # 글로벌 스타일
├── components/
│   ├── site/                   # 사이트 컴포넌트
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── TOC.tsx             # 목차
│   │   ├── Breadcrumb.tsx
│   │   └── ArticleSchema.tsx   # JSON-LD 스키마
│   └── admin/                  # Admin 컴포넌트
│       ├── Sidebar.tsx
│       ├── ArticleEditor.tsx   # MDX 편집기
│       ├── ArticlePreview.tsx  # 실시간 미리보기
│       └── QualityChecker.tsx  # 품질 검사
├── lib/
│   ├── prisma.ts               # Prisma 클라이언트
│   ├── auth.ts                 # NextAuth 설정
│   └── mdx.ts                  # MDX 유틸리티
├── prisma/
│   └── schema.prisma           # DB 스키마
├── config/
│   └── app.properties          # 설정 파일
├── content/                    # 발행된 MDX 파일
├── public/                     # 정적 파일
├── middleware.ts               # 인증 미들웨어
└── types/
    └── next-auth.d.ts          # 타입 정의
```

---

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 설정

`config/app.properties` 파일을 열고 설정값을 입력합니다:

```properties
# 사이트 설정
SITE_URL=http://localhost:3000
SITE_NAME=INFOCRAFT

# 데이터베이스
DATABASE_URL=file:./dev.db

# NextAuth.js (시크릿 키 생성: openssl rand -base64 32)
AUTH_SECRET=your-generated-secret-key

# Google OAuth (Google Cloud Console에서 발급)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

### 3. 환경 변수 동기화 및 DB 초기화

```bash
# 한 번에 설정 (권장)
npm run setup

# 또는 개별 실행
npm run env:sync      # properties → .env 동기화
npm run db:generate   # Prisma 클라이언트 생성
npm run db:push       # 데이터베이스 생성/동기화
```

### 4. 개발 서버 실행

```bash
npm run dev
```

- 사이트: http://localhost:3000
- Admin: http://localhost:3000/admin

### 5. 프로덕션 빌드

```bash
npm run build
npm start
```

---

## 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (Turbopack) |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 프로덕션 서버 실행 |
| `npm run setup` | 초기 설정 (env 동기화 + DB 초기화) |
| `npm run env:sync` | properties → .env 동기화 |
| `npm run db:push` | DB 스키마 동기화 |
| `npm run db:studio` | Prisma Studio 실행 |
| `npm run db:generate` | Prisma 클라이언트 생성 |

---

## Google OAuth 설정 방법

### 1. Google Cloud Console 접속
https://console.cloud.google.com/

### 2. 프로젝트 생성
- 새 프로젝트 생성 또는 기존 프로젝트 선택

### 3. OAuth 동의 화면 설정
- APIs & Services > OAuth consent screen
- User Type: External 선택
- 앱 이름, 사용자 지원 이메일 입력
- 범위: email, profile, openid 추가

### 4. OAuth 클라이언트 ID 생성
- APIs & Services > Credentials
- Create Credentials > OAuth client ID
- Application type: Web application
- Authorized redirect URIs 추가:
  - 개발: `http://localhost:3000/api/auth/callback/google`
  - 프로덕션: `https://your-domain.com/api/auth/callback/google`

### 5. 설정 파일에 입력
`config/app.properties` 파일에 Client ID와 Secret 입력

---

## 콘텐츠 상태 흐름

```
draft → review → approved → scheduled → published
 (초안)  (검토중)  (승인됨)    (예약)      (발행됨)
```

---

## 품질 검사 항목

### 금지 표현 (에러)
- 반드시, 무조건, 100%, 확정, 절대, 보장, 확실히, 틀림없이

### 필수 섹션 (경고)
- 핵심 요약
- FAQ 섹션
- 주의사항/면책
- 출처/참고 링크

### 콘텐츠 품질 (정보)
- 최소 500단어 이상 권장
- 외부 링크 3개 이상 권장
- H2 제목 3개 이상 권장
- FAQ 5개 이상 권장

---

## 데이터베이스 모델

### Article (글)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String | 고유 ID |
| title | String | 제목 |
| slug | String | URL 슬러그 |
| content | String | MDX 콘텐츠 |
| summary | String? | 요약 |
| category | String | 카테고리 |
| tags | String | 태그 (JSON) |
| status | String | 상태 |
| publishedAt | DateTime? | 발행일 |

### Keyword (키워드)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String | 고유 ID |
| keyword | String | 키워드 |
| category | String | 카테고리 |
| priority | Int | 우선순위 |

---

## 카테고리

| 슬러그 | 이름 | 설명 |
|--------|------|------|
| finance | 생활금융 | 대출, 저축, 투자 정보 |
| policy | 제도 | 정부 지원금, 복지 제도 |
| it-tips | IT팁 | IT 활용 팁 |
| shopping | 쇼핑가이드 | 쇼핑 정보 |

---

## 라이선스

Private - All Rights Reserved

---

## 문의

프로젝트 관련 문의사항은 관리자에게 연락하세요.
