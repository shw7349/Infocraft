import { Metadata } from 'next'
import Breadcrumb from '@/components/site/Breadcrumb'

export const metadata: Metadata = {
  title: '이용약관',
  description: 'INFOCRAFT 이용약관',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ name: '이용약관' }]} />

      <article className="prose max-w-none">
        <h1>이용약관</h1>

        <h2>제1조 (목적)</h2>
        <p>
          본 약관은 INFOCRAFT(이하 &apos;본 사이트&apos;)가 제공하는 서비스의
          이용과 관련하여 사이트와 이용자 간의 권리, 의무 및 책임사항을
          규정함을 목적으로 합니다.
        </p>

        <h2>제2조 (정의)</h2>
        <ul>
          <li>&apos;서비스&apos;란 본 사이트가 제공하는 모든 정보 콘텐츠를 의미합니다.</li>
          <li>&apos;이용자&apos;란 본 사이트에 접속하여 서비스를 이용하는 자를 의미합니다.</li>
        </ul>

        <h2>제3조 (서비스의 제공)</h2>
        <p>본 사이트는 다음과 같은 서비스를 제공합니다:</p>
        <ul>
          <li>생활 정보 콘텐츠 제공</li>
          <li>기타 본 사이트가 정하는 서비스</li>
        </ul>

        <h2>제4조 (면책사항)</h2>
        <ol>
          <li>
            본 사이트의 콘텐츠는 참고용 정보이며, 법률, 의학, 금융 등
            전문적인 조언을 대체하지 않습니다.
          </li>
          <li>
            본 사이트는 콘텐츠의 정확성, 완전성, 최신성을 보장하지 않으며,
            정보 이용으로 인한 손해에 대해 책임을 지지 않습니다.
          </li>
          <li>
            이용자는 본 사이트의 정보를 참고하되, 중요한 결정 전에
            반드시 공식 기관이나 전문가와 상담하시기 바랍니다.
          </li>
        </ol>

        <h2>제5조 (저작권)</h2>
        <ol>
          <li>
            본 사이트에 게시된 콘텐츠의 저작권은 본 사이트에 있습니다.
          </li>
          <li>
            이용자는 본 사이트의 콘텐츠를 개인적인 용도로만 사용할 수 있으며,
            상업적 목적으로 복제, 배포, 전송할 수 없습니다.
          </li>
        </ol>

        <h2>제6조 (이용자의 의무)</h2>
        <p>이용자는 다음 행위를 해서는 안 됩니다:</p>
        <ul>
          <li>허위 정보 제공</li>
          <li>타인의 권리 침해</li>
          <li>서비스 운영 방해</li>
          <li>관련 법령 위반</li>
        </ul>

        <h2>제7조 (약관의 변경)</h2>
        <p>
          본 약관은 필요에 따라 변경될 수 있으며, 변경 시 사이트를 통해
          공지합니다. 변경된 약관은 공지 후 효력이 발생합니다.
        </p>

        <h2>제8조 (분쟁 해결)</h2>
        <p>
          본 약관과 관련된 분쟁은 대한민국 법률에 따르며,
          관할 법원은 서울중앙지방법원으로 합니다.
        </p>

        <p className="text-sm text-[var(--muted-foreground)] mt-8">
          시행일자: 2025년 1월 1일
        </p>
      </article>
    </div>
  )
}
