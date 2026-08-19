import { unstable_noStore as noStore } from 'next/cache'

import AutoRefreshAt from '@/components/dashboard/AutoRefreshAt'
import db from '@/utils/db'
import { memberStatus } from '@/utils/types'

import NewAdditionsTable, { type NewAdditionRow } from './NewAdditionsTable'

const newAdditionsTimeZone = 'America/New_York'

const monthTitleFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  timeZone: newAdditionsTimeZone,
  year: 'numeric'
})

const timeZonePartsFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
  minute: '2-digit',
  month: '2-digit',
  second: '2-digit',
  timeZone: newAdditionsTimeZone,
  year: 'numeric'
})

const getTimeZoneParts = (date: Date) => {
  const parts = timeZonePartsFormatter.formatToParts(date)

  return {
    day: Number(parts.find(part => part.type === 'day')?.value ?? 1),
    hour: Number(parts.find(part => part.type === 'hour')?.value ?? 0),
    minute: Number(parts.find(part => part.type === 'minute')?.value ?? 0),
    month: Number(parts.find(part => part.type === 'month')?.value ?? 1),
    second: Number(parts.find(part => part.type === 'second')?.value ?? 0),
    year: Number(parts.find(part => part.type === 'year')?.value ?? 1970)
  }
}

const getTimeZoneOffsetMs = (date: Date) => {
  const parts = getTimeZoneParts(date)

  const sameWallTimeInUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  )

  return sameWallTimeInUtc - date.getTime()
}

const getZonedMonthBoundary = (year: number, monthIndex: number) => {
  const utcGuess = new Date(Date.UTC(year, monthIndex, 1))

  return new Date(utcGuess.getTime() - getTimeZoneOffsetMs(utcGuess))
}

const getCurrentMonthRange = () => {
  const now = new Date()
  const { month, year } = getTimeZoneParts(now)
  const monthIndex = month - 1
  const monthStart = getZonedMonthBoundary(year, monthIndex)
  const nextMonthStart = getZonedMonthBoundary(year, monthIndex + 1)
  const monthKey = `${year}-${String(month).padStart(2, '0')}`

  return { monthKey, monthStart, nextMonthStart }
}

const NewAdditions = async () => {
  noStore()

  const { monthKey, monthStart, nextMonthStart } = getCurrentMonthRange()

  const members = await db.member.findMany({
    orderBy: [{ manuallyVestedAt: 'desc' }, { lastAndMiddleNames: 'asc' }, { firstName: 'asc' }],
    select: {
      firstName: true,
      id: true,
      lastAndMiddleNames: true,
      manuallyVestedAt: true,
      memberMatriculationNumber: true,
      sponsorCode: true
    },
    where: {
      manuallyVestedAt: {
        gte: monthStart,
        lt: nextMonthStart,
        not: null
      },
      memberStatus: memberStatus.Vested
    }
  })

  const rows: NewAdditionRow[] = members.flatMap(member =>
    member.manuallyVestedAt
      ? [
          {
            firstName: member.firstName,
            id: member.id,
            lastAndMiddleNames: member.lastAndMiddleNames,
            memberMatriculationNumber: member.memberMatriculationNumber,
            sponsorCode: member.sponsorCode,
            vestedAt: member.manuallyVestedAt.toISOString()
          }
        ]
      : []
  )

  return (
    <section className='max-w-full min-w-0 space-y-6 py-4 sm:py-10'>
      <AutoRefreshAt refreshAt={nextMonthStart.toISOString()} />

      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div className='min-w-0'>
          <h1 className='text-3xl font-semibold tracking-normal sm:text-4xl'>
            Sagicam New Additions - {monthTitleFormatter.format(monthStart)}
          </h1>
          <p className='text-muted-foreground mt-2 text-sm'>
            Loved ones manually moved from Awaiting Publication to Vested during the current month.
          </p>
        </div>
      </div>

      <NewAdditionsTable rows={rows} monthKey={monthKey} />
    </section>
  )
}

export default NewAdditions
