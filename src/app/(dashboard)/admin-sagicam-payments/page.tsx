import ContributionAssessmentForm from '@/components/dashboard/ContributionAssessmentForm'
import { memberStatus } from '@/utils/types'
import db from '@/utils/db'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
})

const decimalToNumber = (value: unknown) => Number(value ?? 0)

const AdminSagicamPayments = async () => {
  const vestedMembersCount = await db.member.count({
    where: {
      memberStatus: memberStatus.Vested
    }
  })

  const latestContributionAssessment = await db.contributionAssessment.findFirst({
    include: {
      groups: {
        orderBy: {
          sponsorCode: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const sponsorContributionPayments = await db.sponsorContributionPayment.findMany({
    orderBy: {
      sponsorCode: 'asc'
    }
  })

  const sponsorCodes = Array.from(
    new Set([
      ...(latestContributionAssessment?.groups.map(group => group.sponsorCode) ?? []),
      ...sponsorContributionPayments.map(payment => payment.sponsorCode)
    ])
  ).sort((firstCode, secondCode) =>
    firstCode.localeCompare(secondCode, undefined, {
      numeric: true,
      sensitivity: 'base'
    })
  )

  const sponsors = await db.profile.findMany({
    select: {
      sponsorCode: true,
      sponsorFirstName: true,
      sponsorLastAndMiddleName: true
    },
    where: {
      sponsorCode: {
        in: sponsorCodes
      }
    }
  })

  const sponsorsByCode = new Map(sponsors.map(sponsor => [sponsor.sponsorCode, sponsor]))
  const owedByCode = new Map(latestContributionAssessment?.groups.map(group => [group.sponsorCode, group]) ?? [])
  const receivedByCode = new Map(sponsorContributionPayments.map(payment => [payment.sponsorCode, payment]))

  const rows = sponsorCodes.map(sponsorCode => {
    const sponsor = sponsorsByCode.get(sponsorCode)
    const amountOwed = decimalToNumber(owedByCode.get(sponsorCode)?.amountOwed)
    const amountReceived = decimalToNumber(receivedByCode.get(sponsorCode)?.amountSent)

    return {
      amountOwed,
      amountReceived,
      balance: Number((amountOwed - amountReceived).toFixed(2)),
      sponsorCode,
      sponsorName: sponsor ? `${sponsor.sponsorFirstName} ${sponsor.sponsorLastAndMiddleName}` : ''
    }
  })

  const totals = rows.reduce(
    (currentTotals, row) => {
      currentTotals.amountOwed += row.amountOwed
      currentTotals.amountReceived += row.amountReceived
      currentTotals.balance += row.balance

      return currentTotals
    },
    {
      amountOwed: 0,
      amountReceived: 0,
      balance: 0
    }
  )

  return (
    <div className='space-y-6 py-8 sm:py-10'>
      <div>
        <h1 className='text-4xl font-semibold tracking-normal'>Sagicam Payments</h1>
        <p className='text-muted-foreground mt-2 text-sm'>
          Sponsor payment summary from the latest contribution assessment
          {latestContributionAssessment ? ` created on ${dateFormatter.format(latestContributionAssessment.createdAt)}` : ''}.
        </p>
      </div>

      <ContributionAssessmentForm vestedMembersCount={vestedMembersCount} />

      <div className='border-border overflow-hidden rounded-lg border'>
        <Table className='[[&_td]:wrap-break-word table-fixed [&_td]:whitespace-normal [&_th]:wrap-break-word [&_th]:whitespace-normal'>
          <colgroup>
            <col className='w-1/4' />
            <col className='w-1/4' />
            <col className='w-1/6' />
            <col className='w-1/6' />
            <col className='w-1/6' />
          </colgroup>
          <TableHeader>
            <TableRow className='bg-primary hover:bg-primary'>
              <TableHead className='text-primary-foreground'>Sponsor name</TableHead>
              <TableHead className='text-primary-foreground'>Sponsor code</TableHead>
              <TableHead className='text-primary-foreground text-right'>Amount owed by sponsor code</TableHead>
              <TableHead className='text-primary-foreground text-right'>Amount received</TableHead>
              <TableHead className='text-primary-foreground text-right'>Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='text-muted-foreground h-24 text-center'>
                  No Sagicam payments found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map(row => (
                <TableRow key={row.sponsorCode} className='odd:bg-muted/30 even:bg-background'>
                  <TableCell className='font-medium'>{row.sponsorName}</TableCell>
                  <TableCell>{row.sponsorCode}</TableCell>
                  <TableCell className='text-right font-semibold'>{currencyFormatter.format(row.amountOwed)}</TableCell>
                  <TableCell className='text-right font-semibold'>
                    {currencyFormatter.format(row.amountReceived)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      row.balance <= 0
                        ? 'bg-green-600/10 text-green-700 dark:text-green-300'
                        : 'bg-red-600/10 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {currencyFormatter.format(row.balance)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {rows.length > 0 && (
            <TableFooter>
              <TableRow className='text-base'>
                <TableCell className='font-extrabold'>Total</TableCell>
                <TableCell />
                <TableCell className='text-right font-extrabold'>
                  {currencyFormatter.format(totals.amountOwed)}
                </TableCell>
                <TableCell className='text-right font-extrabold'>
                  {currencyFormatter.format(totals.amountReceived)}
                </TableCell>
                <TableCell className='text-right font-extrabold'>
                  {currencyFormatter.format(totals.balance)}
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  )
}

export default AdminSagicamPayments
