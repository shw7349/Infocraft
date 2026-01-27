import { Metadata } from 'next'
import Breadcrumb from '@/components/site/Breadcrumb'

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: 'INFOCRAFT 개인정보처리방침',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ name: '개인정보처리방침' }]} />

      <article className="prose max-w-none">
        <h1>개인정보처리방침</h1>

        <p>
          INFOCRAFT(이하 &apos;본 사이트&apos;)는 이용자의 개인정보 보호를
          중요하게 생각하며, 관련 법령을 준수합니다.
        </p>

        <h2>1. 수집하는 개인정보</h2>
        <p>본 사이트는 다음과 같은 정보를 수집할 수 있습니다:</p>
        <ul>
          <li>문의 시: 이메일 주소, 문의 내용</li>
          <li>자동 수집: 접속 IP, 브라우저 정보, 방문 기록 (Google Analytics 등)</li>
        </ul>

        <h2>2. 개인정보의 이용 목적</h2>
        <ul>
          <li>문의에 대한 응답</li>
          <li>사이트 개선을 위한 통계 분석</li>
          <li>서비스 제공 및 운영</li>
        </ul>

        <h2>3. 개인정보의 보유 기간</h2>
        <p>
          수집된 개인정보는 이용 목적 달성 후 지체 없이 파기합니다.
          단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
        </p>

        <h2>4. 개인정보의 제3자 제공</h2>
        <p>
          본 사이트는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.
          다만, 다음의 경우는 예외로 합니다:
        </p>
        <ul>
          <li>이용자가 사전에 동의한 경우</li>
          <li>법령에 의해 요구되는 경우</li>
        </ul>

        <h2>5. 쿠키의 사용</h2>
        <p>
          본 사이트는 서비스 개선을 위해 쿠키를 사용할 수 있습니다.
          브라우저 설정을 통해 쿠키 사용을 거부할 수 있으나,
          일부 서비스 이용에 제한이 있을 수 있습니다.
        </p>

        <h2>6. 개인정보 보호책임자</h2>
        <p>
          개인정보 관련 문의사항은 <a href="/contact">문의하기</a> 페이지를
          통해 연락해 주시기 바랍니다.
        </p>

        <h2>7. 방침의 변경</h2>
        <p>
          본 개인정보처리방침은 법령 및 서비스 변경에 따라 수정될 수 있으며,
          변경 시 사이트를 통해 공지합니다.
        </p>

        <p className="text-sm text-[var(--muted-foreground)] mt-8">
          시행일자: 2025년 1월 1일
        </p>
      </article>
    </div>
  )
}
