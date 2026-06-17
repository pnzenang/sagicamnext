'use client'

import { useMemo, useState } from 'react'

import { ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { contributionCreditPerVestedMember } from '@/utils/sagicam-contribution-constants'
import {
  addSponsorContributionBalanceAdjustmentAction,
  resetSponsorContributionPaymentAction,
  verifySponsorContributionPaymentAction
} from '@/utils/actions'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

export type AdminSagicamPaymentsRow = {
  amountOwed: number
  amountReceived: number
  balance: number
  contributionAmountSent: number
  contributionAmountUsed: number
  contributionCredit: number
  sponsorCode: string
  sponsorEmail: string
  sponsorPhoneNumber: string
  vestedMembers: number
}

export type AdminSagicamPaymentsTotals = Pick<
  AdminSagicamPaymentsRow,
  'amountOwed' | 'amountReceived' | 'balance' | 'contributionAmountSent' | 'vestedMembers'
>

type SortKey = keyof AdminSagicamPaymentsRow
type SortDirection = 'asc' | 'desc'

type AdminSagicamPaymentsColumn = {
  key: SortKey
  label: string
  align?: 'left' | 'right'
}

const columns: AdminSagicamPaymentsColumn[] = [
  { key: 'sponsorEmail', label: 'Email' },
  { key: 'sponsorPhoneNumber', label: 'Telephone' },
  { key: 'sponsorCode', label: 'Code' },
  { key: 'vestedMembers', label: 'Vested', align: 'right' },
  { key: 'amountOwed', label: 'Contribution owed', align: 'right' },
  { key: 'contributionAmountSent', label: 'Contribution sent', align: 'right' },
  { key: 'amountReceived', label: 'Contribution verified', align: 'right' },
  { key: 'balance', label: 'Contribution Balance', align: 'right' }
]

const balanceColumnWidth = 25
const contactColumnWidth = 12
const codeColumnWidth = 8

const regularColumnWidth = (100 - balanceColumnWidth - contactColumnWidth * 2 - codeColumnWidth) / (columns.length - 4)

const getColumnWidth = (columnKey: SortKey) => {
  if (columnKey === 'sponsorEmail' || columnKey === 'sponsorPhoneNumber') return contactColumnWidth
  if (columnKey === 'sponsorCode') return codeColumnWidth
  if (columnKey === 'balance') return balanceColumnWidth

  return regularColumnWidth
}

const getPhoneHref = (phoneNumber: string) => phoneNumber.replace(/[^\d+]/g, '')

const getSortIcon = (isActive: boolean, direction: SortDirection) => {
  if (!isActive) return <ArrowUpDown className='size-3.5' />

  return direction === 'asc' ? <ArrowUp className='size-3.5' /> : <ArrowDown className='size-3.5' />
}

const compareValues = (firstValue: AdminSagicamPaymentsRow[SortKey], secondValue: AdminSagicamPaymentsRow[SortKey]) => {
  if (typeof firstValue === 'number' && typeof secondValue === 'number') {
    return firstValue - secondValue
  }

  return String(firstValue).localeCompare(String(secondValue), undefined, {
    numeric: true,
    sensitivity: 'base'
  })
}

const getContributionBalanceTarget = (vestedMembers: number) => contributionCreditPerVestedMember * vestedMembers

const shouldShowReplenishAccountNotice = (balance: number, vestedMembers: number) =>
  balance > 0 && balance < getContributionBalanceTarget(vestedMembers)

const getContributionBalanceStatusClassName = (balance: number, vestedMembers: number) => {
  if (balance >= getContributionBalanceTarget(vestedMembers)) {
    return 'bg-green-600/10 text-green-700 dark:text-green-300'
  }

  if (balance > 0) {
    return 'bg-amber-500/10 text-amber-500 dark:text-amber-500'
  }

  return 'bg-red-600/10 text-red-700 dark:text-red-300'
}

const getBalanceCardClassName = (balance: number, vestedMembers: number) => {
  if (balance >= getContributionBalanceTarget(vestedMembers)) {
    return 'border-green-200 bg-green-50 text-green-800 dark:border-green-800/70 dark:bg-green-950/40 dark:text-green-200'
  }

  if (balance > 0) {
    return 'border-amber-200 bg-amber-50 text-amber-500 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-500'
  }

  return 'border-red-200 bg-red-50 text-red-800 dark:border-red-800/70 dark:bg-red-950/40 dark:text-red-200'
}

const BalanceCard = ({
  balance,
  className,
  vestedMembers
}: {
  balance: number
  className?: string
  vestedMembers: number
}) => (
  <div
    className={cn(
      'inline-flex min-w-28 flex-col items-end justify-center rounded-md border px-3 py-2 text-base font-black shadow-sm',
      getBalanceCardClassName(balance, vestedMembers),
      className
    )}
  >
    <span className='tabular-nums'>{currencyFormatter.format(balance)}</span>
    {shouldShowReplenishAccountNotice(balance, vestedMembers) ? (
      <span className='mt-1 text-right text-[10px] leading-tight font-semibold'>(Please replenish account)</span>
    ) : null}
  </div>
)

const MobileValue = ({
  label,
  value,
  valueClassName
}: {
  label: string
  value: string | number
  valueClassName?: string
}) => (
  <div className='grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start gap-2'>
    <span className='text-muted-foreground min-w-0 text-xs leading-snug font-semibold uppercase'>{label}</span>
    <span
      className={cn(
        'min-w-0 justify-self-end text-right text-sm leading-snug font-extrabold break-words tabular-nums',
        valueClassName
      )}
    >
      {value}
    </span>
  </div>
)

const EmailLink = ({ className = '', email }: { className?: string; email: string }) => {
  if (!email) return <span className={`text-primary ${className}`}>-</span>

  return (
    <a href={`mailto:${email}`} className={`text-primary underline-offset-2 hover:underline ${className}`}>
      {email}
    </a>
  )
}

const PhoneLink = ({ className = '', phoneNumber }: { className?: string; phoneNumber: string }) => {
  if (!phoneNumber) return <span className={`text-primary ${className}`}>-</span>

  return (
    <a
      href={`tel:${getPhoneHref(phoneNumber)}`}
      className={`text-primary underline-offset-2 hover:underline ${className}`}
    >
      {phoneNumber}
    </a>
  )
}

const ManualBalanceAdjustmentForm = ({
  action,
  balanceType,
  layout = 'table',
  sponsorCode
}: {
  action: (formData: FormData) => Promise<void>
  balanceType: 'contribution'
  layout?: 'card' | 'table'
  sponsorCode: string
}) => {
  const inputId = `${balanceType}-balance-amount-${sponsorCode}`

  return (
    <form action={action} className={layout === 'card' ? 'grid gap-1.5' : 'contents'}>
      <input type='hidden' name='sponsorCode' value={sponsorCode} />
      <label htmlFor={inputId} className='sr-only'>
        Amount to manually adjust {balanceType} balance
      </label>
      <Input
        id={inputId}
        name='balanceAmount'
        type='number'
        inputMode='decimal'
        step='0.01'
        placeholder='+/- 0.00'
        className={cn(
          'bg-background text-foreground placeholder:text-muted-foreground text-center text-[11px]',
          layout === 'card' ? 'h-8 px-2 text-xs' : 'col-start-2 row-start-1 h-7 w-20 px-1.5'
        )}
        required
      />
      <Button
        type='submit'
        size='xs'
        variant='secondary'
        className={cn(
          'justify-center px-2 text-[11px]',
          layout === 'card' ? 'h-8 w-full' : 'col-start-2 row-start-2 h-7 w-20'
        )}
      >
        <ArrowUpDown className='size-3' />
        Apply
      </Button>
    </form>
  )
}

const ContributionPaymentControls = ({
  layout = 'table',
  row
}: {
  layout?: 'card' | 'table'
  row: AdminSagicamPaymentsRow
}) => {
  const hasSubmittedPayment = row.contributionAmountSent > row.amountReceived
  const hasPaymentValues = row.contributionAmountSent > 0 || row.amountReceived > 0 || row.contributionAmountUsed > 0

  return (
    <div className={layout === 'card' ? 'grid w-full shrink-0 grid-cols-2 gap-2 sm:w-56' : 'contents'}>
      <div className={layout === 'card' ? 'grid gap-1.5' : 'contents'}>
        <form
          action={verifySponsorContributionPaymentAction}
          className={layout === 'card' ? undefined : 'col-start-1 row-start-1 w-20'}
        >
          <input type='hidden' name='sponsorCode' value={row.sponsorCode} />
          <Button
            type='submit'
            size='xs'
            variant='outline'
            disabled={!hasSubmittedPayment}
            className={cn('w-full justify-center px-2 text-[11px]', layout === 'card' ? 'h-8' : 'h-7')}
          >
            <CheckCircle2 className='size-3' />
            Verify
          </Button>
        </form>
        <form
          action={resetSponsorContributionPaymentAction}
          className={layout === 'card' ? undefined : 'col-start-1 row-start-2 w-20'}
        >
          <input type='hidden' name='sponsorCode' value={row.sponsorCode} />
          <Button
            type='submit'
            size='xs'
            variant='destructive'
            disabled={!hasPaymentValues}
            className={cn('w-full justify-center px-2 text-[11px]', layout === 'card' ? 'h-8' : 'h-7')}
          >
            <RotateCcw className='size-3' />
            Reset
          </Button>
        </form>
      </div>
      <ManualBalanceAdjustmentForm
        action={addSponsorContributionBalanceAdjustmentAction}
        balanceType='contribution'
        layout={layout}
        sponsorCode={row.sponsorCode}
      />
    </div>
  )
}

const AdminSagicamPaymentsTable = ({
  rows,
  totals
}: {
  rows: AdminSagicamPaymentsRow[]
  totals: AdminSagicamPaymentsTotals
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('sponsorCode')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [codeSearch, setCodeSearch] = useState('')

  const normalizedCodeSearch = codeSearch.trim().toLowerCase()

  const filteredRows = useMemo(() => {
    if (!normalizedCodeSearch) return rows

    return rows.filter(row => row.sponsorCode.toLowerCase().includes(normalizedCodeSearch))
  }, [normalizedCodeSearch, rows])

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((firstRow, secondRow) => {
      const comparison = compareValues(firstRow[sortKey], secondRow[sortKey])

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredRows, sortDirection, sortKey])

  const visibleTotals = useMemo<AdminSagicamPaymentsTotals>(() => {
    if (!normalizedCodeSearch) return totals

    return filteredRows.reduce(
      (currentTotals, row) => {
        currentTotals.amountOwed += row.amountOwed
        currentTotals.amountReceived += row.amountReceived
        currentTotals.balance += row.balance
        currentTotals.contributionAmountSent += row.contributionAmountSent
        currentTotals.vestedMembers += row.vestedMembers

        return currentTotals
      },
      {
        amountOwed: 0,
        amountReceived: 0,
        balance: 0,
        contributionAmountSent: 0,
        vestedMembers: 0
      }
    )
  }, [filteredRows, normalizedCodeSearch, totals])

  const handleSort = (nextSortKey: SortKey) => {
    if (nextSortKey === sortKey) {
      setSortDirection(currentDirection => (currentDirection === 'asc' ? 'desc' : 'asc'))

      return
    }

    setSortKey(nextSortKey)
    setSortDirection('asc')
  }

  return (
    <div className='border-border max-w-full min-w-0 overflow-hidden rounded-lg border'>
      <div className='hidden overflow-x-auto md:block'>
        <Table className='[[&_td]:wrap-break-word table-fixed [&_td]:whitespace-normal [&_th]:wrap-break-word [&_th]:whitespace-normal'>
          <colgroup>
            {columns.map(column => (
              <col key={column.key} style={{ width: `${getColumnWidth(column.key)}%` }} />
            ))}
          </colgroup>
          <TableHeader>
            <TableRow className='bg-background hover:bg-background'>
              <TableHead colSpan={columns.length} className='h-auto p-3'>
                <form role='search' onSubmit={event => event.preventDefault()} className='w-full'>
                  <label htmlFor='contribution-sponsor-code-search' className='sr-only'>
                    Search sponsor code
                  </label>
                  <Input
                    id='contribution-sponsor-code-search'
                    value={codeSearch}
                    onChange={event => setCodeSearch(event.target.value)}
                    placeholder='Search sponsor code, e.g. MLNO'
                    className='bg-background h-10 w-full text-sm font-semibold'
                  />
                </form>
              </TableHead>
            </TableRow>
            <TableRow className='bg-primary hover:bg-primary h-16'>
              {columns.map(column => {
                const isActive = sortKey === column.key

                return (
                  <TableHead
                    key={column.key}
                    className='text-primary-foreground h-16'
                    aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <button
                      type='button'
                      className={`flex min-h-12 w-full items-center gap-1.5 text-left font-semibold ${column.align === 'right' ? 'justify-end text-right [&>span]:text-right' : 'justify-start'}`}
                      onClick={() => handleSort(column.key)}
                    >
                      <span>{column.label}</span>
                      {getSortIcon(isActive, sortDirection)}
                    </button>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className='text-muted-foreground h-24 text-center'>
                  {normalizedCodeSearch
                    ? `No sponsor code matching "${codeSearch.trim()}" found.`
                    : 'No Sagicam contributions found.'}
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map(row => (
                <TableRow key={row.sponsorCode} className='odd:bg-muted/30 even:bg-background'>
                  <TableCell className='text-sm font-semibold'>
                    <EmailLink email={row.sponsorEmail} className='break-all' />
                  </TableCell>
                  <TableCell className='text-sm font-semibold'>
                    <PhoneLink phoneNumber={row.sponsorPhoneNumber} />
                  </TableCell>
                  <TableCell>{row.sponsorCode}</TableCell>
                  <TableCell className='text-right font-semibold'>{row.vestedMembers}</TableCell>
                  <TableCell className='text-right font-semibold'>{currencyFormatter.format(row.amountOwed)}</TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      row.contributionAmountSent > 0 ? 'text-green-700 dark:text-green-300' : ''
                    }`}
                  >
                    {currencyFormatter.format(row.contributionAmountSent)}
                  </TableCell>
                  <TableCell className='text-right font-semibold'>
                    {currencyFormatter.format(row.amountReceived)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center align-middle font-semibold',
                      getContributionBalanceStatusClassName(row.balance, row.vestedMembers)
                    )}
                  >
                    <div className='grid min-w-0 grid-cols-[auto_auto_minmax(0,1fr)] grid-rows-[auto_auto] items-center justify-items-center gap-x-2 gap-y-1'>
                      <ContributionPaymentControls row={row} />
                      <span className='bg-background/80 col-start-3 row-span-2 row-start-1 flex min-w-0 flex-col items-center justify-center self-stretch justify-self-stretch rounded-md border border-current/20 px-2 py-2 text-center text-xl leading-none font-black'>
                        <span className='tabular-nums'>{currencyFormatter.format(row.balance)}</span>
                        {shouldShowReplenishAccountNotice(row.balance, row.vestedMembers) ? (
                          <span className='mt-1 text-[10px] leading-tight font-semibold'>
                            (Please replenish account)
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {sortedRows.length > 0 && (
            <TableFooter className='bg-white text-black dark:bg-white dark:text-black'>
              <TableRow className='bg-white text-base text-black hover:bg-white dark:bg-white dark:text-black dark:hover:bg-white'>
                <TableCell />
                <TableCell />
                <TableCell className='font-extrabold'>Total</TableCell>
                <TableCell className='text-right font-extrabold'>{visibleTotals.vestedMembers}</TableCell>
                <TableCell className='text-right font-extrabold'>
                  {currencyFormatter.format(visibleTotals.amountOwed)}
                </TableCell>
                <TableCell className='text-right font-extrabold'>
                  {currencyFormatter.format(visibleTotals.contributionAmountSent)}
                </TableCell>
                <TableCell className='text-right font-extrabold'>
                  {currencyFormatter.format(visibleTotals.amountReceived)}
                </TableCell>
                <TableCell className='text-right font-extrabold'>
                  <BalanceCard balance={visibleTotals.balance} vestedMembers={visibleTotals.vestedMembers} />
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
      <div className='grid gap-3 p-2 sm:p-3 md:hidden'>
        <form role='search' onSubmit={event => event.preventDefault()} className='rounded-md border bg-background p-2'>
          <label htmlFor='contribution-sponsor-code-search-mobile' className='sr-only'>
            Search sponsor code
          </label>
          <Input
            id='contribution-sponsor-code-search-mobile'
            value={codeSearch}
            onChange={event => setCodeSearch(event.target.value)}
            placeholder='Search sponsor code, e.g. MLNO'
            className='bg-background h-9 text-sm font-semibold'
          />
        </form>
        {sortedRows.length === 0 ? (
          <div className='text-muted-foreground rounded-md border px-3 py-8 text-center text-sm sm:px-4 sm:py-10'>
            {normalizedCodeSearch
              ? `No sponsor code matching "${codeSearch.trim()}" found.`
              : 'No Sagicam contributions found.'}
          </div>
        ) : (
          sortedRows.map(row => (
            <article key={row.sponsorCode} className='bg-background overflow-hidden rounded-md border shadow-sm'>
              <div className='flex flex-col gap-3 border-b px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-4'>
                <div className='w-full min-w-0'>
                  <div className='text-lg font-extrabold'>{row.sponsorCode}</div>
                  <EmailLink email={row.sponsorEmail} className='block text-xs font-semibold break-all' />
                  <PhoneLink phoneNumber={row.sponsorPhoneNumber} className='block text-xs font-semibold' />
                </div>
                <ContributionPaymentControls row={row} layout='card' />
              </div>
              <div className='grid gap-2 px-3 py-3 text-sm sm:px-4'>
                <div className='text-sm font-extrabold'>Contribution</div>
                <MobileValue label='Vested' value={row.vestedMembers} />
                <MobileValue label='Owed' value={currencyFormatter.format(row.amountOwed)} />
                <MobileValue
                  label='Sent'
                  value={currencyFormatter.format(row.contributionAmountSent)}
                  valueClassName={row.contributionAmountSent > 0 ? 'text-green-700 dark:text-green-300' : ''}
                />
                <MobileValue label='Verified' value={currencyFormatter.format(row.amountReceived)} />
                <div className='grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start gap-2 border-t pt-3'>
                  <span className='text-muted-foreground text-xs font-semibold uppercase'>Contribution Balance</span>
                  <BalanceCard
                    balance={row.balance}
                    vestedMembers={row.vestedMembers}
                    className='max-w-full justify-end justify-self-end'
                  />
                </div>
              </div>
            </article>
          ))
        )}
        {sortedRows.length > 0 && (
          <article className='rounded-md border bg-white px-3 py-3 text-black shadow-sm sm:px-4 dark:bg-white dark:text-black'>
            <div className='mb-2 text-base font-extrabold'>Total</div>
            <div className='grid gap-2'>
              <MobileValue label='Vested' value={visibleTotals.vestedMembers} />
              <MobileValue label='Contribution owed' value={currencyFormatter.format(visibleTotals.amountOwed)} />
              <MobileValue
                label='Contribution sent'
                value={currencyFormatter.format(visibleTotals.contributionAmountSent)}
              />
              <MobileValue label='Contribution verified' value={currencyFormatter.format(visibleTotals.amountReceived)} />
              <div className='grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start gap-2 border-t pt-3'>
                <span className='text-xs font-semibold uppercase'>Contribution balance</span>
                <BalanceCard
                  balance={visibleTotals.balance}
                  vestedMembers={visibleTotals.vestedMembers}
                  className='max-w-full justify-end justify-self-end'
                />
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  )
}

export default AdminSagicamPaymentsTable
