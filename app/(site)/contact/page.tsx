import { Metadata } from 'next'
import Breadcrumb from '@/components/site/Breadcrumb'

export const metadata: Metadata = {
  title: '문의하기',
  description: 'INFOCRAFT 문의하기',
}

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ name: '문의하기' }]} />

      <article className="prose max-w-none">
        <h1>문의하기</h1>

        <p>
          INFOCRAFT에 대한 문의사항이 있으시면 아래 방법으로 연락해 주세요.
        </p>

        <h2>문의 안내</h2>
        <ul>
          <li>
            <strong>이메일:</strong> contact@infocraft.kr (예시)
          </li>
          <li>
            <strong>응답 시간:</strong> 영업일 기준 1-3일 내 답변
          </li>
        </ul>

        <h2>문의 전 확인사항</h2>
        <ul>
          <li>콘텐츠 오류 제보: 해당 페이지 URL과 오류 내용을 함께 알려주세요.</li>
          <li>제휴 문의: 제휴 목적과 회사/단체 정보를 포함해 주세요.</li>
          <li>기타 문의: 문의 내용을 구체적으로 작성해 주시면 빠른 답변이 가능합니다.</li>
        </ul>

        <div className="notice notice-info">
          <p>
            <strong>참고:</strong> 본 사이트는 정보 제공 목적으로 운영되며,
            법률, 의학, 금융 등 전문 상담은 제공하지 않습니다.
            전문적인 조언이 필요한 경우 해당 분야의 전문가에게 문의하시기 바랍니다.
          </p>
        </div>
      </article>
    </div>
  )
}
