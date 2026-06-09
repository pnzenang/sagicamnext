import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import db from '@/utils/db'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric'
})

const decimalToNumber = (value: unknown) => Number(value ?? 0)

const ContributionTable = async () => {
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

  const contributionRows =
    latestContributionAssessment?.groups.map(group => ({
      amountOwed: decimalToNumber(group.amountOwed),
      sponsorCode: group.sponsorCode,
      vestedMembersCount: group.vestedMembersCount
    })) ?? []

  const totalAmount = contributionRows.reduce((total, row) => total + row.amountOwed, 0)
  const totalVestedMembers = contributionRows.reduce((total, row) => total + row.vestedMembersCount, 0)

  return (
    <section className='space-y-5'>
      <Card className='mx-auto my-2 max-w-7xl rounded-lg border bg-white p-4'>
        <h1 className='text-muted-foreground py-1 text-sm font-bold sm:text-3xl lg:text-5xl'>CONTRIBUTION TABLE</h1>
        <h1 className='text-muted-foreground text-sm font-bold sm:text-lg'>
          In the contribution table below, you will find find your contribution amount for the present month following
          your 4-letter code and head to the contributions payments to record your payment when made.
        </h1>
      </Card>

      <Card className='mx-auto max-w-7xl rounded-lg border py-0'>
        <CardHeader className='border-b py-5'>
          <CardTitle className='text-xl font-semibold tracking-normal sm:text-2xl'>
            Each Sponsor Contribution For The Month
          </CardTitle>
          {latestContributionAssessment ? (
            <p className='text-muted-foreground text-sm'>
              Current contribution list created for {dateFormatter.format(latestContributionAssessment.createdAt)}.
              Each vested loved one is {currencyFormatter.format(decimalToNumber(latestContributionAssessment.amountPerVestedMember))}.
            </p>
          ) : (
            <p className='text-muted-foreground text-sm'>No monthly contribution has been created yet.</p>
          )}
        </CardHeader>
        <CardContent className='py-5'>
          <div className='overflow-hidden rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow className='bg-primary hover:bg-primary'>
                  <TableHead className='text-primary-foreground font-semibold'>Sponsor Code</TableHead>
                  <TableHead className='text-primary-foreground text-right font-semibold'>Vested Loved Ones</TableHead>
                  <TableHead className='text-primary-foreground text-right font-semibold'>
                    Contribution This Month
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributionRows.length > 0 ? (
                  contributionRows.map(row => (
                    <TableRow key={row.sponsorCode} className='odd:bg-muted/30'>
                      <TableCell className='font-semibold'>{row.sponsorCode}</TableCell>
                      <TableCell className='text-right font-medium'>{row.vestedMembersCount}</TableCell>
                      <TableCell className='text-right font-extrabold'>{currencyFormatter.format(row.amountOwed)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className='text-muted-foreground h-24 text-center'>
                      No sponsor contribution rows found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              {contributionRows.length > 0 && (
                <TableFooter>
                  <TableRow>
                    <TableCell className='font-extrabold'>Total</TableCell>
                    <TableCell className='text-right font-extrabold'>{totalVestedMembers}</TableCell>
                    <TableCell className='text-right font-extrabold'>{currencyFormatter.format(totalAmount)}</TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>

      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vT74FtT5PEcEtlD5lyq9rPxPzH3J5D6UcdAN9Z1qlh1dNVTs1_tZ6iisaAAVfYNt-qB4asfYUeR9SCV/pubhtml?widget=true&amp;headers=false'
        className='mx-auto mt-5 h-160 w-full max-w-19/20 items-center rounded-lg border'
      ></iframe>
    </section>
  )
}

export default ContributionTable
