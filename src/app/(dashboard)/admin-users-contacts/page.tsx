import { unstable_noStore as noStore } from 'next/cache'

import db from '@/utils/db'
import { memberStatus } from '@/utils/types'

import UsersContactsTable, { type UsersContactsRow } from './UsersContactsTable'

const statusColumns = [
  { key: memberStatus.Vested },
  { key: memberStatus.Awaiting },
  { key: memberStatus.Pending },
  { key: memberStatus.Delinquent }
] as const

type StatusKey = (typeof statusColumns)[number]['key']
type SponsorStatusCounts = Record<StatusKey, number>

const createEmptyStatusCounts = (): SponsorStatusCounts => ({
  [memberStatus.Awaiting]: 0,
  [memberStatus.Delinquent]: 0,
  [memberStatus.Pending]: 0,
  [memberStatus.Vested]: 0
})

const getStatusCountTotal = (counts: SponsorStatusCounts) =>
  statusColumns.reduce((total, column) => total + counts[column.key], 0)

const UsersContactsPage = async () => {
  noStore()

  const sponsors = await db.profile.findMany({
    orderBy: [{ sponsorLastAndMiddleName: 'asc' }, { sponsorFirstName: 'asc' }],
    select: {
      id: true,
      sponsorCode: true,
      sponsorEmail: true,
      sponsorFirstName: true,
      sponsorLastAndMiddleName: true,
      sponsorPhoneNumber: true
    }
  })

  const memberCountsBySponsorCode = await db.member.groupBy({
    _count: {
      _all: true
    },
    by: ['sponsorCode', 'memberStatus'],
    where: {
      memberStatus: {
        in: statusColumns.map(column => column.key)
      }
    }
  })

  const statusCountsBySponsorCode = new Map<string, SponsorStatusCounts>()

  memberCountsBySponsorCode.forEach(item => {
    const existingCounts = statusCountsBySponsorCode.get(item.sponsorCode) ?? createEmptyStatusCounts()

    existingCounts[item.memberStatus as StatusKey] = item._count._all
    statusCountsBySponsorCode.set(item.sponsorCode, existingCounts)
  })

  const rows: UsersContactsRow[] = sponsors.map(sponsor => {
    const counts = statusCountsBySponsorCode.get(sponsor.sponsorCode) ?? createEmptyStatusCounts()

    return {
      awaitingLovedOnes: counts[memberStatus.Awaiting],
      delinquentLovedOnes: counts[memberStatus.Delinquent],
      id: sponsor.id,
      pendingLovedOnes: counts[memberStatus.Pending],
      sponsorCode: sponsor.sponsorCode,
      sponsorEmail: sponsor.sponsorEmail,
      sponsorName: `${sponsor.sponsorFirstName} ${sponsor.sponsorLastAndMiddleName}`.trim(),
      sponsorPhoneNumber: sponsor.sponsorPhoneNumber,
      totalLovedOnes: getStatusCountTotal(counts),
      vestedLovedOnes: counts[memberStatus.Vested]
    }
  })

  return (
    <section className='max-w-full min-w-0 space-y-6 py-4 sm:py-10'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div className='min-w-0'>
          <h1 className='text-3xl font-semibold tracking-normal sm:text-4xl'>Users Contacts</h1>
          <p className='text-muted-foreground mt-2 text-sm'>
            Search sponsor names, phone numbers, emails, and sponsor codes from one admin directory.
          </p>
        </div>
      </div>

      <UsersContactsTable rows={rows} />
    </section>
  )
}

export default UsersContactsPage
