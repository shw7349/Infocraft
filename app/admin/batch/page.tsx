'use client'

import { useEffect, useState, useCallback } from 'react'

interface BatchLog {
  id: string
  jobType: string
  status: string
  result: string | null
  error: string | null
  startedAt: string
  completedAt: string | null
}

interface BatchStatus {
  isRunning: boolean
  running: BatchLog | null
  lastCompleted: BatchLog | null
  todayLogs: BatchLog[]
}

interface TrendKeyword {
  keywordId: string
  _max: { hotScore: number | null }
  keyword?: string
}

const JOB_TYPE_LABELS: Record<string, string> = {
  trend_fetch: '트렌드 수집',
  draft_generate: '초안 생성',
  quality_check: '품질 검사',
}

const STATUS_STYLES: Record<string, string> = {
  running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function BatchPage() {
  const [logs, setLogs] = useState<BatchLog[]>([])
  const [status, setStatus] = useState<BatchStatus | null>(null)
  const [isTriggering, setIsTriggering] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [logsRes, statusRes] = await Promise.all([
        fetch('/api/batch'),
        fetch('/api/batch/status'),
      ])
      if (logsRes.ok) setLogs(await logsRes.json())
      if (statusRes.ok) setStatus(await statusRes.json())
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000) // 10초마다 갱신
    return () => clearInterval(interval)
  }, [fetchData])

  async function triggerBatch() {
    setIsTriggering(true)
    setMessage(null)

    try {
      const res = await fetch('/api/batch', { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        setMessage(`배치 완료: ${JSON.stringify(data.summary)}`)
      } else {
        setMessage(`오류: ${data.error}`)
      }
    } catch (err) {
      setMessage('배치 실행 중 오류가 발생했습니다.')
    } finally {
      setIsTriggering(false)
      fetchData()
    }
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('ko-KR')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">배치 관리</h1>
        <button
          onClick={triggerBatch}
          disabled={isTriggering || status?.isRunning}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {isTriggering ? '실행 중...' : status?.isRunning ? '배치 진행 중' : '수동 배치 실행'}
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-lg bg-[var(--muted)] text-sm">
          {message}
        </div>
      )}

      {/* 현재 상태 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-[var(--border)]">
          <p className="text-sm text-[var(--muted-foreground)]">상태</p>
          <p className="text-lg font-bold mt-1">
            {status?.isRunning ? '실행 중' : '대기'}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border)]">
          <p className="text-sm text-[var(--muted-foreground)]">마지막 완료</p>
          <p className="text-lg font-bold mt-1">
            {status?.lastCompleted
              ? formatTime(status.lastCompleted.completedAt!)
              : '-'}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border)]">
          <p className="text-sm text-[var(--muted-foreground)]">오늘 실행 횟수</p>
          <p className="text-lg font-bold mt-1">
            {status?.todayLogs.length ?? 0}
          </p>
        </div>
      </div>

      {/* 오늘 실행 로그 */}
      {status?.todayLogs && status.todayLogs.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3">오늘 실행 로그</h2>
          <div className="space-y-2">
            {status.todayLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)]"
              >
                <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_STYLES[log.status] || ''}`}>
                  {log.status}
                </span>
                <span className="text-sm font-medium">
                  {JOB_TYPE_LABELS[log.jobType] || log.jobType}
                </span>
                <span className="text-sm text-[var(--muted-foreground)] flex-1">
                  {log.result || log.error || ''}
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {formatTime(log.startedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 전체 이력 테이블 */}
      <div>
        <h2 className="text-lg font-bold mb-3">배치 실행 이력</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 px-3">작업</th>
                <th className="text-left py-2 px-3">상태</th>
                <th className="text-left py-2 px-3">결과</th>
                <th className="text-left py-2 px-3">시작</th>
                <th className="text-left py-2 px-3">완료</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-[var(--border)]">
                  <td className="py-2 px-3">
                    {JOB_TYPE_LABELS[log.jobType] || log.jobType}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_STYLES[log.status] || ''}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[var(--muted-foreground)] max-w-xs truncate">
                    {log.error ? (
                      <span className="text-red-500">{log.error}</span>
                    ) : (
                      log.result || '-'
                    )}
                  </td>
                  <td className="py-2 px-3 text-[var(--muted-foreground)]">
                    {formatTime(log.startedAt)}
                  </td>
                  <td className="py-2 px-3 text-[var(--muted-foreground)]">
                    {log.completedAt ? formatTime(log.completedAt) : '-'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--muted-foreground)]">
                    배치 실행 이력이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
