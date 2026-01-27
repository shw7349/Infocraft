import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--muted)]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-3">INFOCRAFT</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              생활에 필요한 유용한 정보를 알기 쉽게 정리하여 제공합니다.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold mb-3">바로가기</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-[var(--muted-foreground)] hover:text-[var(--primary)]">
                  소개
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[var(--muted-foreground)] hover:text-[var(--primary)]">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold mb-3">정책</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-[var(--muted-foreground)] hover:text-[var(--primary)]">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[var(--muted-foreground)] hover:text-[var(--primary)]">
                  이용약관
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border)] text-center text-sm text-[var(--muted-foreground)]">
          <p>&copy; {currentYear} INFOCRAFT. All rights reserved.</p>
          <p className="mt-1">
            본 사이트의 정보는 참고용이며, 정확한 내용은 공식 기관을 통해 확인하시기 바랍니다.
          </p>
        </div>
      </div>
    </footer>
  )
}
