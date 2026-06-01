import { UsersRound } from 'lucide-react'

import db from '@/utils/db'
import { memberStatus } from '@/utils/types'
import AdminCountTable, { type AdminCountRow } from './AdminCountTable'

const statusColumns = [
  { key: memberStatus.Vested, label: 'Vested' },
  { key: memberStatus.Pending, label: 'Pending' },
  { key: memberStatus.Delinquent, label: 'Delinquent' },
  { key: memberStatus.Awaiting, label: 'Awaiting' }
] as const

type StatusKey = (typeof statusColumns)[number]['key']
type SponsorStatusCounts = Record<StatusKey, number>

const createEmptyStatusCounts = (): SponsorStatusCounts => ({
  [memberStatus.Vested]: 0,
  [memberStatus.Pending]: 0,
  [memberStatus.Delinquent]: 0,
  [memberStatus.Awaiting]: 0
})

const getStatusCountTotal = (counts: SponsorStatusCounts) =>
  statusColumns.reduce((total, column) => total + counts[column.key], 0)

const AdminCount = async () => {
  const memberCountsBySponsorCode = await db.member.groupBy({
    by: ['sponsorCode', 'memberStatus'],
    where: {
      memberStatus: {
        in: statusColumns.map(column => column.key)
      }
    },
    _count: {
      _all: true
    },
    orderBy: {
      sponsorCode: 'asc'
    }
  })

  const statusCountsBySponsorCode = new Map<string, SponsorStatusCounts>()

  memberCountsBySponsorCode.forEach(item => {
    const existingCounts = statusCountsBySponsorCode.get(item.sponsorCode) ?? createEmptyStatusCounts()

    existingCounts[item.memberStatus as StatusKey] = item._count._all
    statusCountsBySponsorCode.set(item.sponsorCode, existingCounts)
  })

  const sponsorCodes = Array.from(statusCountsBySponsorCode.keys())

  const sponsors = await db.profile.findMany({
    where: {
      sponsorCode: {
        in: sponsorCodes
      }
    },
    select: {
      sponsorCode: true,
      sponsorEmail: true,
      sponsorFirstName: true,
      sponsorLastAndMiddleName: true,
      sponsorPhoneNumber: true
    }
  })

  const sponsorsByCode = new Map(sponsors.map(sponsor => [sponsor.sponsorCode, sponsor]))

  const rows: AdminCountRow[] = sponsorCodes.map(sponsorCode => {
    const sponsor = sponsorsByCode.get(sponsorCode)
    const counts = statusCountsBySponsorCode.get(sponsorCode) ?? createEmptyStatusCounts()
    const sponsorName = sponsor ? `${sponsor.sponsorFirstName} ${sponsor.sponsorLastAndMiddleName}` : ''

    return {
      sponsorName,
      sponsorEmail: sponsor?.sponsorEmail ?? '',
      sponsorPhoneNumber: sponsor?.sponsorPhoneNumber ?? '',
      sponsorCode,
      vested: counts[memberStatus.Vested],
      pending: counts[memberStatus.Pending],
      delinquent: counts[memberStatus.Delinquent],
      awaiting: counts[memberStatus.Awaiting],
      total: getStatusCountTotal(counts)
    }
  })

  const statusTotals = rows.reduce(
    (totals, row) => {
      totals.vested += row.vested
      totals.pending += row.pending
      totals.delinquent += row.delinquent
      totals.awaiting += row.awaiting

      return totals
    },
    {
      vested: 0,
      pending: 0,
      delinquent: 0,
      awaiting: 0,
      total: 0
    }
  )

  const totalMembers = rows.reduce((total, row) => total + row.total, 0)

  statusTotals.total = totalMembers

  return (
    <div className='space-y-6 py-8 sm:py-10'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-4xl font-semibold tracking-normal'>Members by sponsor code</h1>
          <p className='text-muted-foreground mt-2 text-sm'>
            Count of loved ones grouped by sponsor code and loved ones status.
          </p>
        </div>
        <div className='border-border bg-muted/40 flex items-center gap-3 rounded-lg border px-4 py-3'>
          <UsersRound className='text-primary size-5' />
          <div>
            <p className='text-muted-foreground text-xs font-medium uppercase'>Total members</p>
            <p className='text-xl font-semibold'>{totalMembers}</p>
          </div>
        </div>
      </div>

      <AdminCountTable rows={rows} totals={statusTotals} />
    </div>
  )
}

export default AdminCount
