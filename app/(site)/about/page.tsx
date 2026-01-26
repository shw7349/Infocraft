import { Metadata } from 'next'
import Breadcrumb from '@/components/site/Breadcrumb'

export const metadata: Metadata = {
  title: '소개',
  description: 'INFOCRAFT 사이트 소개',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ name: '소개' }]} />

      <article className="prose max-w-none">
        <h1>소개</h1>

        <p>
          INFOCRAFT는 생활에 필요한 다양한 정보를 알기 쉽게 정리하여 제공하는
          정보 사이트입니다.
        </p>

        <h2>운영 목적</h2>
        <ul>
          <li>복잡한 제도와 정책을 쉽게 이해할 수 있도록 안내</li>
          <li>실생활에 유용한 금융, IT, 쇼핑 정보 제공</li>
          <li>신뢰할 수 있는 공식 출처를 기반으로 한 정보 정리</li>
        </ul>

        <h2>콘텐츠 원칙</h2>
        <ul>
          <li>과장 없이 사실에 기반한 정보 제공</li>
          <li>공식 기관의 자료를 참고하여 작성</li>
          <li>정기적인 내용 업데이트로 최신성 유지</li>
        </ul>

        <h2>면책 안내</h2>
        <p>
          본 사이트의 모든 콘텐츠는 참고용 정보이며, 법률, 의학, 금융 등
          전문 분야의 조언을 대체하지 않습니다. 정확한 내용은 반드시
          관련 공식 기관이나 전문가를 통해 확인하시기 바랍니다.
        </p>

        <h2>문의</h2>
        <p>
          사이트 이용 중 문의사항이 있으시면{' '}
          <a href="/contact">문의하기</a> 페이지를 이용해 주세요.
        </p>
      </article>
    </div>
  )
}
