'use client'

import { useMemo, useState } from 'react'

import { ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  addSponsorRegistrationBalanceAdjustmentAction,
  resetSponsorRegistrationPaymentAction,
  verifySponsorRegistrationPaymentAction
} from '@/utils/actions'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

export type AdminSagicamRegistrationsRow = {
  awaitingPublication: number
  pendingMembers: number
  registrationAmountSent: number
  registrationAmountUsed: number
  registrationBalance: number
  registrationFeeOwed: number
  registrationReceived: number
  sponsorCode: string
  sponsorEmail: string
  vestedMembers: number
}

export type AdminSagicamRegistrationsTotals = Pick<
  AdminSagicamRegistrationsRow,
  | 'awaitingPublication'
  | 'pendingMembers'
  | 'registrationAmountSent'
  | 'registrationBalance'
  | 'registrationFeeOwed'
  | 'registrationReceived'
  | 'vestedMembers'
>

type SortKey = keyof AdminSagicamRegistrationsRow
type SortDirection = 'asc' | 'desc'

type AdminSagicamRegistrationsColumn = {
  key: SortKey
  label: string
  align?: 'left' | 'right'
}

const columns: AdminSagicamRegistrationsColumn[] = [
  { key: 'sponsorEmail', label: 'Email' },
  { key: 'sponsorCode', label: 'Code' },
  { key: 'vestedMembers', label: 'Vested', align: 'right' },
  { key: 'awaitingPublication', label: 'Awaiting', align: 'right' },
  { key: 'pendingMembers', label: 'Pending', align: 'right' },
  { key: 'registrationFeeOwed', label: 'Registration owed', align: 'right' },
  { key: 'registrationAmountSent', label: 'Registration sent', align: 'right' },
  { key: 'registrationReceived', label: 'Registration verified', align: 'right' },
  { key: 'registrationBalance', label: 'Registration balance', align: 'right' }
]

const balanceColumnWidth = 25
const contactColumnWidth = 12
const codeColumnWidth = 8

const regularColumnWidth = (100 - balanceColumnWidth - contactColumnWidth - codeColumnWidth) / (columns.length - 3)

const getColumnWidth = (columnKey: SortKey) => {
  if (columnKey === 'sponsorEmail') return contactColumnWidth
  if (columnKey === 'sponsorCode') return codeColumnWidth
  if (columnKey === 'registrationBalance') return balanceColumnWidth

  return regularColumnWidth
}

const getSortIcon = (isActive: boolean, direction: SortDirection) => {
  if (!isActive) return <ArrowUpDown className='size-3.5' />

  return direction === 'asc' ? <ArrowUp className='size-3.5' /> : <ArrowDown className='size-3.5' />
}

const compareValues = (
  firstValue: AdminSagicamRegistrationsRow[SortKey],
  secondValue: AdminSagicamRegistrationsRow[SortKey]
) => {
  if (typeof firstValue === 'number' && typeof secondValue === 'number') {
    return firstValue - secondValue
  }

  return String(firstValue).localeCompare(String(secondValue), undefined, {
    numeric: true,
    sensitivity: 'base'
  })
}

const getBalanceCardClassName = (balance: number) =>
  balance >= 0
    ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800/70 dark:bg-green-950/40 dark:text-green-200'
    : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800/70 dark:bg-red-950/40 dark:text-red-200'

const BalanceCard = ({ balance, className }: { balance: number; className?: string }) => (
  <div
    className={cn(
      'inline-flex min-w-28 items-center justify-end rounded-md border px-3 py-2 text-base font-black tabular-nums shadow-sm',
      getBalanceCardClassName(balance),
      className
    )}
  >
    {currencyFormatter.format(balance)}
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

const ManualBalanceAdjustmentForm = ({
  layout = 'table',
  sponsorCode
}: {
  layout?: 'card' | 'table'
  sponsorCode: string
}) => {
  const inputId = `registration-balance-amount-${sponsorCode}`

  return (
    <form
      action={addSponsorRegistrationBalanceAdjustmentAction}
      className={layout === 'card' ? 'grid gap-1.5' : 'contents'}
    >
      <input type='hidden' name='sponsorCode' value={sponsorCode} />
      <label htmlFor={inputId} className='sr-only'>
        Amount to manually adjust registration balance
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

const RegistrationPaymentControls = ({
  layout = 'table',
  row
}: {
  layout?: 'card' | 'table'
  row: AdminSagicamRegistrationsRow
}) => {
  const hasSubmittedPayment = row.registrationAmountSent > 0
  const hasPaymentValues = row.registrationAmountSent > 0 || row.registrationReceived > 0

  return (
    <div className={layout === 'card' ? 'grid w-full shrink-0 grid-cols-2 gap-2 sm:w-56' : 'contents'}>
      <div className={layout === 'card' ? 'grid gap-1.5' : 'contents'}>
        <form
          action={verifySponsorRegistrationPaymentAction}
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
          action={resetSponsorRegistrationPaymentAction}
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
      <ManualBalanceAdjustmentForm layout={layout} sponsorCode={row.sponsorCode} />
    </div>
  )
}

const AdminSagicamRegistrationsTable = ({
  rows,
  totals
}: {
  rows: AdminSagicamRegistrationsRow[]
  totals: AdminSagicamRegistrationsTotals
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

  const visibleTotals = useMemo<AdminSagicamRegistrationsTotals>(() => {
    if (!normalizedCodeSearch) return totals

    return filteredRows.reduce(
      (currentTotals, row) => {
        currentTotals.awaitingPublication += row.awaitingPublication
        currentTotals.pendingMembers += row.pendingMembers
        currentTotals.registrationBalance += row.registrationBalance
        currentTotals.registrationAmountSent += row.registrationAmountSent
        currentTotals.registrationFeeOwed += row.registrationFeeOwed
        currentTotals.registrationReceived += row.registrationReceived
        currentTotals.vestedMembers += row.vestedMembers

        return currentTotals
      },
      {
        awaitingPublication: 0,
        pendingMembers: 0,
        registrationAmountSent: 0,
        registrationBalance: 0,
        registrationFeeOwed: 0,
        registrationReceived: 0,
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
                  <label htmlFor='registration-sponsor-code-search' className='sr-only'>
                    Search sponsor code
                  </label>
                  <Input
                    id='registration-sponsor-code-search'
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
                    : 'No Sagicam registrations found.'}
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map(row => (
                <TableRow key={row.sponsorCode} className='odd:bg-muted/30 even:bg-background'>
                  <TableCell className='text-sm font-semibold'>
                    <EmailLink email={row.sponsorEmail} className='break-all' />
                  </TableCell>
                  <TableCell>{row.sponsorCode}</TableCell>
                  <TableCell className='text-right font-semibold'>{row.vestedMembers}</TableCell>
                  <TableCell className='text-right font-semibold'>{row.awaitingPublication}</TableCell>
                  <TableCell className='text-right font-semibold'>{row.pendingMembers}</TableCell>
                  <TableCell className='text-right font-semibold'>
                    {currencyFormatter.format(row.registrationFeeOwed)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      row.registrationAmountSent > 0 ? 'text-green-700 dark:text-green-300' : ''
                    }`}
                  >
                    {currencyFormatter.format(row.registrationAmountSent)}
                  </TableCell>
                  <TableCell className='text-right font-semibold'>
                    {currencyFormatter.format(row.registrationReceived)}
                  </TableCell>
                  <TableCell
                    className={`text-center align-middle font-semibold ${
                      row.registrationBalance >= 0
                        ? 'bg-green-600/10 text-green-700 dark:text-green-300'
                        : 'bg-red-600/10 text-red-700 dark:text-red-300'
                    }`}
                  >
                    <div className='grid min-w-0 grid-cols-[auto_auto_minmax(0,1fr)] grid-rows-[auto_auto] items-center justify-items-center gap-x-2 gap-y-1'>
                      <RegistrationPaymentControls row={row} />
                      <span className='bg-background/80 col-start-3 row-span-2 row-start-1 flex min-w-0 items-center justify-center self-stretch justify-self-stretch rounded-md border border-current/20 px-2 py-2 text-center text-xl leading-none font-black tabular-nums'>
                        {currencyFormatter.format(row.registrationBalance)}
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
                <TableCell className='font-extrabold'>Total</TableCell>
                <TableCell className='text-right font-extrabold'>{visibleTotals.vestedMembers}</TableCell>
                <TableCell className='text-right font-extrabold'>{visibleTotals.awaitingPublication}</TableCell>
                <TableCell className='text-right font-extrabold'>{visibleTotals.pendingMembers}</TableCell>
                <TableCell className='text-right font-extrabold'>
                  {currencyFormatter.format(visibleTotals.registrationFeeOwed)}
                </TableCell>
                <TableCell className='text-right font-extrabold'>
                  {currencyFormatter.format(visibleTotals.registrationAmountSent)}
                </TableCell>
                <TableCell className='text-right font-extrabold'>
                  {currencyFormatter.format(visibleTotals.registrationReceived)}
                </TableCell>
                <TableCell className='text-right font-extrabold'>
                  {currencyFormatter.format(visibleTotals.registrationBalance)}
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
      <div className='grid gap-3 p-2 sm:p-3 md:hidden'>
        <form role='search' onSubmit={event => event.preventDefault()} className='rounded-md border bg-background p-2'>
          <label htmlFor='registration-sponsor-code-search-mobile' className='sr-only'>
            Search sponsor code
          </label>
          <Input
            id='registration-sponsor-code-search-mobile'
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
              : 'No Sagicam registrations found.'}
          </div>
        ) : (
          sortedRows.map(row => (
            <article key={row.sponsorCode} className='bg-background overflow-hidden rounded-md border shadow-sm'>
              <div className='flex flex-col gap-3 border-b px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-4'>
                <div className='w-full min-w-0'>
                  <div className='text-lg font-extrabold'>{row.sponsorCode}</div>
                  <EmailLink email={row.sponsorEmail} className='block text-xs font-semibold break-all' />
                </div>
                <RegistrationPaymentControls row={row} layout='card' />
              </div>
              <div className='grid gap-2 px-3 py-3 text-sm sm:px-4'>
                <div className='text-sm font-extrabold'>Registration</div>
                <MobileValue label='Vested' value={row.vestedMembers} />
                <MobileValue label='Awaiting' value={row.awaitingPublication} />
                <MobileValue label='Pending' value={row.pendingMembers} />
                <MobileValue label='Owed' value={currencyFormatter.format(row.registrationFeeOwed)} />
                <MobileValue
                  label='Sent'
                  value={currencyFormatter.format(row.registrationAmountSent)}
                  valueClassName={row.registrationAmountSent > 0 ? 'text-green-700 dark:text-green-300' : ''}
                />
                <MobileValue label='Verified' value={currencyFormatter.format(row.registrationReceived)} />
                <div className='grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start gap-2 border-t pt-3'>
                  <span className='text-muted-foreground text-xs font-semibold uppercase'>Registration balance</span>
                  <BalanceCard balance={row.registrationBalance} className='max-w-full justify-end justify-self-end' />
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
              <MobileValue label='Awaiting' value={visibleTotals.awaitingPublication} />
              <MobileValue label='Pending' value={visibleTotals.pendingMembers} />
              <MobileValue
                label='Registration owed'
                value={currencyFormatter.format(visibleTotals.registrationFeeOwed)}
              />
              <MobileValue
                label='Registration sent'
                value={currencyFormatter.format(visibleTotals.registrationAmountSent)}
              />
              <MobileValue
                label='Registration verified'
                value={currencyFormatter.format(visibleTotals.registrationReceived)}
              />
              <div className='grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start gap-2 border-t pt-3'>
                <span className='text-xs font-semibold uppercase'>Registration balance</span>
                <BalanceCard
                  balance={visibleTotals.registrationBalance}
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

export default AdminSagicamRegistrationsTable
