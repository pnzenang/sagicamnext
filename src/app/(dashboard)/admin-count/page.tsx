import { UsersRound } from 'lucide-react'

import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import db from '@/utils/db'
import { memberStatus } from '@/utils/types'

const statusColumns = [
  { key: memberStatus.Vested, label: 'Vested' },
  { key: memberStatus.Pending, label: 'Pending' },
  { key: memberStatus.Delinquent, label: 'Not in good standing' },
  { key: memberStatus.Awaiting, label: 'Awaiting publication' }
] as const

const adminCountColumnCount = 9

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

  const statusTotals = sponsorCodes.reduce((totals, sponsorCode) => {
    const counts = statusCountsBySponsorCode.get(sponsorCode) ?? createEmptyStatusCounts()

    statusColumns.forEach(column => {
      totals[column.key] += counts[column.key]
    })

    return totals
  }, createEmptyStatusCounts())

  const totalMembers = memberCountsBySponsorCode.reduce((total, item) => total + item._count._all, 0)

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

      <div className='border-border overflow-hidden rounded-lg border'>
        <Table className='table-fixed [&_td]:break-words [&_td]:whitespace-normal [&_th]:break-words [&_th]:whitespace-normal'>
          <colgroup>
            {Array.from({ length: adminCountColumnCount }).map((_, index) => (
              <col key={index} style={{ width: `${100 / adminCountColumnCount}%` }} />
            ))}
          </colgroup>
          <TableHeader>
            <TableRow className='bg-primary hover:bg-primary'>
              <TableHead className='text-primary-foreground'>Sponsor name</TableHead>
              <TableHead className='text-primary-foreground'>Sponsor email</TableHead>
              <TableHead className='text-primary-foreground'>Telephone number</TableHead>
              <TableHead className='text-primary-foreground'>Sponsor code</TableHead>
              {statusColumns.map(column => (
                <TableHead key={column.key} className='text-primary-foreground text-right'>
                  {column.label}
                </TableHead>
              ))}
              <TableHead className='text-primary-foreground text-right'>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sponsorCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={adminCountColumnCount} className='text-muted-foreground h-24 text-center'>
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              sponsorCodes.map(sponsorCode => {
                const sponsor = sponsorsByCode.get(sponsorCode)
                const counts = statusCountsBySponsorCode.get(sponsorCode) ?? createEmptyStatusCounts()

                const sponsorName = sponsor
                  ? `${sponsor.sponsorFirstName} ${sponsor.sponsorLastAndMiddleName}`
                  : 'Sponsor profile not found'

                return (
                  <TableRow key={sponsorCode} className='odd:bg-muted/30 even:bg-background'>
                    <TableCell className='font-medium'>{sponsorName}</TableCell>
                    <TableCell>{sponsor?.sponsorEmail ?? ''}</TableCell>
                    <TableCell>{sponsor?.sponsorPhoneNumber ?? ''}</TableCell>
                    <TableCell>{sponsorCode}</TableCell>
                    {statusColumns.map(column => (
                      <TableCell key={column.key} className='text-right font-semibold'>
                        {counts[column.key]}
                      </TableCell>
                    ))}
                    <TableCell className='text-right font-extrabold'>{getStatusCountTotal(counts)}</TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
          {sponsorCodes.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell className='font-extrabold'>Total</TableCell>
                <TableCell className='font-extrabold' />
                <TableCell className='font-extrabold' />
                <TableCell className='font-extrabold' />
                {statusColumns.map(column => (
                  <TableCell key={column.key} className='text-right font-extrabold'>
                    {statusTotals[column.key]}
                  </TableCell>
                ))}
                <TableCell className='text-right font-extrabold'>{totalMembers}</TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  )
}

export default AdminCount
