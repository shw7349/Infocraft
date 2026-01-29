import cron from 'node-cron'

let isSchedulerRunning = false

export function startScheduler() {
  if (isSchedulerRunning) {
    console.log('[Scheduler] 이미 실행 중')
    return
  }

  // 매일 저녁 10시 (22:00) 실행
  cron.schedule(
    '0 22 * * *',
    async () => {
      console.log('[Scheduler] 배치 작업 시작:', new Date().toISOString())
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const response = await fetch(`${siteUrl}/api/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-scheduler-internal': 'true',
          },
        })

        if (!response.ok) {
          throw new Error(`배치 API 응답 실패: ${response.status}`)
        }

        const result = await response.json()
        console.log('[Scheduler] 배치 완료:', result)
      } catch (error) {
        console.error('[Scheduler] 배치 실패:', error)
      }
    },
    {
      timezone: 'Asia/Seoul',
    }
  )

  isSchedulerRunning = true
  console.log('[Scheduler] 스케줄러 시작됨 - 매일 22:00 (KST) 배치 실행 예정')
}
