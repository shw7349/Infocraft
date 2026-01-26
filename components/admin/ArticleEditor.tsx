'use client'

import { useState, useCallback } from 'react'

interface ArticleEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
}

export default function ArticleEditor({ initialContent = '', onChange }: ArticleEditorProps) {
  const [content, setContent] = useState(initialContent)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    onChange?.(newContent)
  }, [onChange])

  const insertTemplate = useCallback(() => {
    const template = `---
title: "제목을 입력하세요"
slug: "url-slug"
date: "${new Date().toISOString().split('T')[0]}"
updated: "${new Date().toISOString().split('T')[0]}"
category: "finance"
tags: ["태그1", "태그2", "태그3", "태그4", "태그5"]
summary: "한 문장으로 요약"
---

# 제목

## 핵심 요약
- 핵심 포인트 1
- 핵심 포인트 2
- 핵심 포인트 3

## 한눈에 보는 결론

| 항목 | 내용 |
|------|------|
| 대상 | |
| 조건 | |
| 신청방법 | |

## 1) 개념 / 전제

내용을 작성하세요.

## 2) 준비물 / 조건

- 준비물 1
- 준비물 2

## 3) 단계별 방법

1. [ ] 1단계
2. [ ] 2단계
3. [ ] 3단계
4. [ ] 4단계
5. [ ] 5단계

## 4) 자주 하는 실수 / 예외

1. 실수 1
2. 실수 2
3. 실수 3
4. 실수 4
5. 실수 5

## 5) FAQ

**Q. 질문 1?**
A. 답변 1

**Q. 질문 2?**
A. 답변 2

**Q. 질문 3?**
A. 답변 3

**Q. 질문 4?**
A. 답변 4

**Q. 질문 5?**
A. 답변 5

**Q. 질문 6?**
A. 답변 6

## 주의사항 / 면책

> 본 콘텐츠는 참고용 정보이며, 정확한 내용은 공식 기관을 통해 확인하시기 바랍니다.

## 출처 / 참고 링크

- [공식 기관 1](URL)
- [공식 기관 2](URL)
- [공식 기관 3](URL)
`
    setContent(template)
    onChange?.(template)
  }, [onChange])

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="font-medium text-sm">콘텐츠 (MDX)</label>
        <button
          type="button"
          onClick={insertTemplate}
          className="text-xs px-2 py-1 bg-[var(--muted)] rounded hover:bg-[var(--border)]"
        >
          템플릿 삽입
        </button>
      </div>
      <textarea
        value={content}
        onChange={handleChange}
        className="w-full h-[500px] p-4 font-mono text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        placeholder="MDX 콘텐츠를 입력하세요..."
      />
      <p className="text-xs text-[var(--muted-foreground)]">
        {content.split(/\s+/).filter(Boolean).length} 단어
      </p>
    </div>
  )
}
