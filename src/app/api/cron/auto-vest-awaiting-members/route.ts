import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import {
  autoVestEligibleAwaitingMembers,
  awaitingPublicationAutoVestingLongevityDays
} from '@/utils/auto-vest-awaiting-members'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const autoVestingTimeZone = 'America/New_York'

const dayFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  timeZone: autoVestingTimeZone
})

const isFirstDayInAutoVestingTimeZone = (date: Date) => Number(dayFormatter.format(date)) === 1

const revalidateAutoVestingPages = () => {
  revalidatePath('/admin-count')
  revalidatePath('/admin-members')
  revalidatePath('/admin-sagicam-payments')
  revalidatePath('/admin-sagicam-registrations')
  revalidatePath('/admin-users-contacts')
  revalidatePath('/all-members')
  revalidatePath('/contributions-payments')
  revalidatePath('/new-additions')
  revalidatePath('/registration-payments')
}

export const GET = async (request: NextRequest) => {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured.' }, { status: 500 })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const forceRun = request.nextUrl.searchParams.get('force') === 'true'

  if (!forceRun && !isFirstDayInAutoVestingTimeZone(now)) {
    return NextResponse.json({
      ok: true,
      reason: `Automatic vesting only runs on the 1st of the month in ${autoVestingTimeZone}.`,
      skipped: true
    })
  }

  const result = await autoVestEligibleAwaitingMembers(now)

  if (result.promotedCount > 0) {
    revalidateAutoVestingPages()
  }

  return NextResponse.json({
    ok: true,
    ...result,
    longevityDaysRequired: awaitingPublicationAutoVestingLongevityDays,
    timeZone: autoVestingTimeZone
  })
}
