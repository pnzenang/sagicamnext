'use client'

import { useMemo, useState } from 'react'

import { CircleDollarSign, Filter, type LucideIcon, UsersRound } from 'lucide-react'

import AdminPaymentUpdateTable from '@/components/dashboard/AdminPaymentUpdateTable'
import PrintButton from '@/components/global/PrintButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { AdminContributionPaymentUpdateRow } from '@/utils/admin-contribution-payment-update'

type BalanceFilter = 'all' | 'negative' | 'positive' | 'zero'

type AdminPaymentUpdateContentProps = {
  monthYearLabel: string
  rows: AdminContributionPaymentUpdateRow[]
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const filterOptions: Record<
  BalanceFilter,
  {
    emptyMessage: string
    label: string
    title: string
  }
> = {
  all: {
    emptyMessage: 'No sponsor contribution balances are available.',
    label: 'All',
    title: 'All Sponsor Balances'
  },
  negative: {
    emptyMessage: 'No sponsors currently have a negative contribution balance.',
    label: 'Negative Balance',
    title: 'Sponsors With Negative Balance'
  },
  positive: {
    emptyMessage: 'No sponsors currently have a positive amount.',
    label: 'Positive Amount',
    title: 'Sponsors With Positive Amount'
  },
  zero: {
    emptyMessage: 'No sponsors currently have a zero contribution balance.',
    label: 'Zero Balance',
    title: 'Sponsors With Zero Balance'
  }
}

const isZeroBalance = (balance: number) => Math.abs(balance) < 0.005

const getFilteredRows = (rows: AdminContributionPaymentUpdateRow[], filter: BalanceFilter) => {
  if (filter === 'negative') return rows.filter(row => row.balance < -0.005)
  if (filter === 'positive') return rows.filter(row => row.balance > 0.005)
  if (filter === 'zero') return rows.filter(row => isZeroBalance(row.balance))

  return rows
}

const SummaryCard = ({
  icon: Icon,
  label,
  tone = 'default',
  value
}: {
  icon: LucideIcon
  label: string
  tone?: 'default' | 'danger' | 'success'
  value: string
}) => (
  <Card
    className={cn(
      tone === 'danger' && 'border-red-200 bg-red-50 text-red-950 dark:border-red-900/70 dark:bg-red-950/30',
      tone === 'success' &&
        'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/70 dark:bg-emerald-950/30'
    )}
  >
    <CardHeader className='space-y-1'>
      <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
        <Icon className='size-4' />
        {label}
      </CardTitle>
    </CardHeader>
    <CardContent className='text-2xl font-black'>{value}</CardContent>
  </Card>
)

const FilterCard = ({
  filter,
  onFilterChange,
  sponsorCount
}: {
  filter: BalanceFilter
  onFilterChange: (filter: BalanceFilter) => void
  sponsorCount: number
}) => (
  <Card>
    <CardHeader className='space-y-1'>
      <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
        <Filter className='size-4' />
        Balance View
      </CardTitle>
    </CardHeader>
    <CardContent className='space-y-2'>
      <Select value={filter} onValueChange={value => onFilterChange(value as BalanceFilter)}>
        <SelectTrigger id='payment-update-balance-filter' className='w-full sm:w-64'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(filterOptions) as BalanceFilter[]).map(option => (
            <SelectItem key={option} value={option}>
              {filterOptions[option].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className='text-muted-foreground text-sm font-semibold'>{sponsorCount.toLocaleString('en-US')} sponsors</p>
    </CardContent>
  </Card>
)

const AdminPaymentUpdateContent = ({ monthYearLabel, rows }: AdminPaymentUpdateContentProps) => {
  const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>('all')

  const filteredRows = useMemo(() => getFilteredRows(rows, balanceFilter), [balanceFilter, rows])
  const totalBalance = useMemo(() => filteredRows.reduce((total, row) => total + row.balance, 0), [filteredRows])
  const selectedFilter = filterOptions[balanceFilter]

  return (
    <section
      data-payment-update-print
      className='flex w-full min-w-0 flex-col gap-6 overflow-hidden py-8 sm:py-10 print:gap-3 print:overflow-visible print:py-0'
    >
      <div className='flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <h1 className='text-xl font-semibold tracking-normal break-words md:text-4xl print:text-2xl'>
            {monthYearLabel} Payment Update
          </h1>
          <p className='text-muted-foreground mt-2 max-w-4xl text-sm leading-6 break-words sm:text-base print:text-xs print:leading-5'>
            Track sponsors by contribution balance status.
          </p>
        </div>
        {rows.length > 0 ? <PrintButton label='Print PDF' className='w-fit' /> : null}
      </div>

      {rows.length === 0 ? (
        <Card className='w-full max-w-full min-w-0'>
          <CardContent className='text-muted-foreground py-10 text-center text-sm'>
            The payment update will appear here after the admin publishes the contribution table.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className='grid gap-3 md:grid-cols-2'>
            <FilterCard sponsorCount={filteredRows.length} filter={balanceFilter} onFilterChange={setBalanceFilter} />
            <SummaryCard
              icon={balanceFilter === 'all' ? UsersRound : CircleDollarSign}
              label='Total Balance'
              tone={totalBalance < 0 ? 'danger' : totalBalance > 0 ? 'success' : 'default'}
              value={currencyFormatter.format(totalBalance)}
            />
          </div>

          <AdminPaymentUpdateTable
            key={balanceFilter}
            title={selectedFilter.title}
            emptyMessage={selectedFilter.emptyMessage}
            defaultSort={{ direction: 'asc', key: 'sponsorCode' }}
            rows={filteredRows}
          />
        </>
      )}
    </section>
  )
}

export default AdminPaymentUpdateContent
