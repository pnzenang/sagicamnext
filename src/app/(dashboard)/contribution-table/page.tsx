import { CalendarDays, DollarSign, HeartHandshake, Table2, Users } from 'lucide-react'

import PublishedContributionTables from '@/components/dashboard/PublishedContributionTables'
import PrintButton from '@/components/global/PrintButton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchPublishedContributionTableAction } from '@/utils/actions'
import { getContributionTableLabel } from '@/utils/contribution-table-label'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
})

const formatDate = (value: string | null) => {
  if (!value) return 'Not set'

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

const ContributionTable = async () => {
  const publishedTable = await fetchPublishedContributionTableAction()

  if (!publishedTable) {
    const contributionTableLabel = getContributionTableLabel()

    return (
      <section className='flex w-full min-w-0 flex-col gap-6 overflow-hidden py-8 sm:py-10'>
        <div className='min-w-0'>
          <h1 className='text-xl font-semibold tracking-normal break-words md:text-4xl'>{contributionTableLabel}</h1>
          <p className='text-muted-foreground mt-2 max-w-4xl text-sm leading-6 break-words sm:text-base'>
            The contribution table will appear here after the admin publishes it.
          </p>
        </div>

        <Card className='w-full max-w-full min-w-0'>
          <CardContent className='text-muted-foreground py-10 text-center text-sm'>
            No contribution table has been published yet.
          </CardContent>
        </Card>
      </section>
    )
  }

  const contributionTableLabel = getContributionTableLabel(publishedTable.dueDate ?? publishedTable.createdAt)
  const deathAmountTotal = publishedTable.deaths.reduce((total, death) => total + death.amountToContribute, 0)

  const adminFee =
    publishedTable.totalVestedMembers > 0
      ? (publishedTable.totalAmount - deathAmountTotal) / publishedTable.totalVestedMembers
      : 0

  const adminFeePerDeath = publishedTable.deathCount > 0 ? adminFee / publishedTable.deathCount : 0

  return (
    <section
      data-contribution-table-print
      className='flex w-full min-w-0 flex-col gap-6 overflow-hidden py-8 sm:py-10 print:gap-3 print:overflow-visible print:py-0'
    >
      <div className='flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <Badge className='print:text-foreground mb-3 w-fit print:border print:bg-transparent' variant='secondary'>
            Published {formatDate(publishedTable.createdAt)}
          </Badge>
          <h1 className='text-xl font-semibold tracking-normal break-words md:text-4xl print:text-2xl'>
            {contributionTableLabel}
          </h1>
          <p className='text-muted-foreground mt-2 max-w-4xl text-sm leading-6 break-words sm:text-base print:text-xs print:leading-5'>
            Review the deceased loved ones included in the published contribution calculation and the amount each
            sponsor is expected to contribute.
          </p>
        </div>
        <PrintButton label='Print PDF' className='w-fit' />
      </div>

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-5 print:mb-3'>
        <Card>
          <CardHeader className='space-y-1'>
            <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
              <HeartHandshake className='text-primary size-4' />
              Deaths
            </CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-black'>{publishedTable.deathCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className='space-y-1'>
            <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
              <Users className='text-primary size-4' />
              Vested Loved Ones
            </CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-black'>{publishedTable.totalVestedMembers}</CardContent>
        </Card>
        <Card>
          <CardHeader className='space-y-1'>
            <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
              <DollarSign className='text-primary size-4' />
              Admin Fee Per Death
            </CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-black'>{currencyFormatter.format(adminFeePerDeath)}</CardContent>
        </Card>
        <Card>
          <CardHeader className='space-y-1'>
            <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
              <Table2 className='text-primary size-4' />
              Total Contribution
            </CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-black'>
            {currencyFormatter.format(publishedTable.totalAmount)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='space-y-1'>
            <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
              <CalendarDays className='text-primary size-4' />
              Due Date
            </CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-black'>{formatDate(publishedTable.dueDate)}</CardContent>
        </Card>
      </div>

      <PublishedContributionTables
        amountPerVestedMember={publishedTable.amountPerVestedMember}
        deaths={publishedTable.deaths}
        groups={publishedTable.groups}
        totalVestedMembers={publishedTable.totalVestedMembers}
      />
    </section>
  )
}

export default ContributionTable
