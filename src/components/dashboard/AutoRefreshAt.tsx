'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

const AutoRefreshAt = ({ refreshAt }: { refreshAt?: string | null }) => {
  const router = useRouter()

  useEffect(() => {
    if (!refreshAt) return

    const refreshDelay = Math.max(new Date(refreshAt).getTime() - Date.now() + 250, 0)
    const refreshTimeout = window.setTimeout(() => router.refresh(), refreshDelay)

    return () => window.clearTimeout(refreshTimeout)
  }, [refreshAt, router])

  return null
}

export default AutoRefreshAt
