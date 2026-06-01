import { UsersRound } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import db from '@/utils/db'
import { memberStatus } from '@/utils/types'

const AdminCount = async () => {
  const vestedMembersBySponsorCode = await db.member.groupBy({
    by: ['sponsorCode'],
    where: {
      memberStatus: memberStatus.Vested
    },
    _count: {
      _all: true
    },
    orderBy: {
      sponsorCode: 'asc'
    }
  })

  const sponsorCodes = vestedMembersBySponsorCode.map(item => item.sponsorCode)

  const sponsors = await db.profile.findMany({
    where: {
      sponsorCode: {
        in: sponsorCodes
      }
    },
    select: {
      sponsorCode: true,
      sponsorFirstName: true,
      sponsorLastAndMiddleName: true
    }
  })

  const sponsorsByCode = new Map(sponsors.map(sponsor => [sponsor.sponsorCode, sponsor]))
  const totalVestedMembers = vestedMembersBySponsorCode.reduce((total, item) => total + item._count._all, 0)

  return (
    <div className='space-y-6 py-8 sm:py-10'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-normal'>Vested members by sponsor code</h1>
          <p className='text-muted-foreground mt-2 text-sm'>
            Count of currently vested loved ones grouped by their sponsor code.
          </p>
        </div>
        <div className='border-border bg-muted/40 flex items-center gap-3 rounded-lg border px-4 py-3'>
          <UsersRound className='text-primary size-5' />
          <div>
            <p className='text-muted-foreground text-xs font-medium uppercase'>Total vested</p>
            <p className='text-xl font-semibold'>{totalVestedMembers}</p>
          </div>
        </div>
      </div>

      <div className='border-border overflow-hidden rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sponsor name</TableHead>
              <TableHead>Sponsor code</TableHead>
              <TableHead className='text-right'>Vested members</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vestedMembersBySponsorCode.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className='text-muted-foreground h-24 text-center'>
                  No vested members found.
                </TableCell>
              </TableRow>
            ) : (
              vestedMembersBySponsorCode.map(item => {
                const sponsor = sponsorsByCode.get(item.sponsorCode)

                const sponsorName = sponsor
                  ? `${sponsor.sponsorFirstName} ${sponsor.sponsorLastAndMiddleName}`
                  : 'Sponsor profile not found'

                return (
                  <TableRow key={item.sponsorCode}>
                    <TableCell className='font-medium'>{sponsorName}</TableCell>
                    <TableCell>{item.sponsorCode}</TableCell>
                    <TableCell className='text-right font-semibold'>{item._count._all}</TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default AdminCount
