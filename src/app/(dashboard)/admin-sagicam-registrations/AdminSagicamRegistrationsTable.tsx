'use client'

import { useMemo, useState } from 'react'

import { ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, Plus, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
  sponsorPhoneNumber: string
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
  { key: 'sponsorPhoneNumber', label: 'Telephone' },
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

const regularColumnWidth =
  (100 - balanceColumnWidth - contactColumnWidth * 2 - codeColumnWidth) / (columns.length - 4)

const getColumnWidth = (columnKey: SortKey) => {
  if (columnKey === 'sponsorEmail' || columnKey === 'sponsorPhoneNumber') return contactColumnWidth
  if (columnKey === 'sponsorCode') return codeColumnWidth
  if (columnKey === 'registrationBalance') return balanceColumnWidth

  return regularColumnWidth
}

const getPhoneHref = (phoneNumber: string) => phoneNumber.replace(/[^\d+]/g, '')

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

const MobileValue = ({
  label,
  value,
  valueClassName
}: {
  label: string
  value: string | number
  valueClassName?: string
}) => (
  <div className='flex items-start justify-between gap-4'>
    <span className='text-muted-foreground min-w-0 text-xs leading-snug font-semibold uppercase'>{label}</span>
    <span className={`shrink-0 text-right text-sm leading-snug font-extrabold tabular-nums ${valueClassName ?? ''}`}>
      {value}
    </span>
  </div>
)

const EmailLink = ({ className = '', email }: { className?: string; email: string }) => {
  if (!email) return <span className={className}>-</span>

  return (
    <a href={`mailto:${email}`} className={`underline-offset-2 hover:underline ${className}`}>
      {email}
    </a>
  )
}

const PhoneLink = ({ className = '', phoneNumber }: { className?: string; phoneNumber: string }) => {
  if (!phoneNumber) return <span className={className}>-</span>

  return (
    <a href={`tel:${getPhoneHref(phoneNumber)}`} className={`underline-offset-2 hover:underline ${className}`}>
      {phoneNumber}
    </a>
  )
}

const ManualBalanceAdjustmentForm = ({ sponsorCode }: { sponsorCode: string }) => {
  const inputId = `registration-balance-amount-${sponsorCode}`

  return (
    <form action={addSponsorRegistrationBalanceAdjustmentAction} className='contents'>
      <input type='hidden' name='sponsorCode' value={sponsorCode} />
      <label htmlFor={inputId} className='sr-only'>
        Amount to manually add to registration balance
      </label>
      <Input
        id={inputId}
        name='balanceAmount'
        type='number'
        inputMode='decimal'
        min='0.01'
        step='0.01'
        placeholder='0.00'
        className='col-start-2 row-start-1 h-7 w-20 bg-background px-1.5 text-center text-[11px] text-foreground placeholder:text-muted-foreground'
        required
      />
      <Button
        type='submit'
        size='xs'
        variant='secondary'
        className='col-start-2 row-start-2 h-7 w-20 justify-center px-2 text-[11px]'
      >
        <Plus className='size-3' />
        Add
      </Button>
    </form>
  )
}

const RegistrationPaymentControls = ({ row }: { row: AdminSagicamRegistrationsRow }) => {
  const hasSubmittedPayment = row.registrationAmountSent > 0
  const hasPaymentValues = row.registrationAmountSent > 0 || row.registrationReceived > 0

  return (
    <div className='contents'>
      <form action={verifySponsorRegistrationPaymentAction} className='col-start-1 row-start-1 w-20'>
        <input type='hidden' name='sponsorCode' value={row.sponsorCode} />
        <Button
          type='submit'
          size='xs'
          variant='outline'
          disabled={!hasSubmittedPayment}
          className='h-7 w-full justify-center px-2 text-[11px]'
        >
          <CheckCircle2 className='size-3' />
          Verify
        </Button>
      </form>
      <form action={resetSponsorRegistrationPaymentAction} className='col-start-1 row-start-2 w-20'>
        <input type='hidden' name='sponsorCode' value={row.sponsorCode} />
        <Button
          type='submit'
          size='xs'
          variant='destructive'
          disabled={!hasPaymentValues}
          className='h-7 w-full justify-center px-2 text-[11px]'
        >
          <RotateCcw className='size-3' />
          Reset
        </Button>
      </form>
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

  const sortedRows = useMemo(() => {
    return [...rows].sort((firstRow, secondRow) => {
      const comparison = compareValues(firstRow[sortKey], secondRow[sortKey])

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [rows, sortDirection, sortKey])

  const handleSort = (nextSortKey: SortKey) => {
    if (nextSortKey === sortKey) {
      setSortDirection(currentDirection => (currentDirection === 'asc' ? 'desc' : 'asc'))

      return
    }

    setSortKey(nextSortKey)
    setSortDirection('asc')
  }

  return (
    <div className='border-border overflow-hidden rounded-lg border'>
      <div className='hidden overflow-x-auto md:block'>
        <Table className='[[&_td]:wrap-break-word table-fixed [&_td]:whitespace-normal [&_th]:wrap-break-word [&_th]:whitespace-normal'>
          <colgroup>
            {columns.map(column => (
              <col key={column.key} style={{ width: `${getColumnWidth(column.key)}%` }} />
            ))}
          </colgroup>
          <TableHeader>
            <TableRow className='h-16 bg-primary hover:bg-primary'>
              {columns.map(column => {
                const isActive = sortKey === column.key

                return (
                  <TableHead
                    key={column.key}
                    className='h-16 text-primary-foreground'
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
                  No Sagicam registrations found.
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
                      <ManualBalanceAdjustmentForm sponsorCode={row.sponsorCode} />
                      <span className='bg-background/80 col-start-3 row-span-2 row-start-1 flex min-w-0 self-stretch justify-self-stretch items-center justify-center rounded-md border border-current/20 px-2 py-2 text-center text-2xl leading-none font-black tabular-nums'>
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
                <TableCell />
                <TableCell className='font-extrabold'>Total</TableCell>
                <TableCell className='text-right font-extrabold'>{totals.vestedMembers}</TableCell>
                <TableCell className='text-right font-extrabold'>{totals.awaitingPublication}</TableCell>
                <TableCell className='text-right font-extrabold'>{totals.pendingMembers}</TableCell>
                <TableCell className='text-right font-extrabold'>
                  {currencyFormatter.format(totals.registrationFeeOwed)}
                </TableCell>
                <TableCell className='text-right font-extrabold'>
                  {currencyFormatter.format(totals.registrationAmountSent)}
                </TableCell>
                <TableCell className='text-right font-extrabold'>
                  {currencyFormatter.format(totals.registrationReceived)}
                </TableCell>
                <TableCell className='text-right font-extrabold'>
                  {currencyFormatter.format(totals.registrationBalance)}
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
      <div className='grid gap-3 p-3 md:hidden'>
        {sortedRows.length === 0 ? (
          <div className='text-muted-foreground rounded-md border px-4 py-10 text-center text-sm'>
            No Sagicam registrations found.
          </div>
        ) : (
          sortedRows.map(row => (
            <article key={row.sponsorCode} className='bg-background rounded-md border shadow-sm'>
              <div className='flex items-start justify-between gap-4 border-b px-4 py-3'>
                <div>
                  <div className='text-lg font-extrabold'>{row.sponsorCode}</div>
                  <EmailLink
                    email={row.sponsorEmail}
                    className='text-muted-foreground block break-all text-xs font-semibold'
                  />
                  <PhoneLink
                    phoneNumber={row.sponsorPhoneNumber}
                    className='text-muted-foreground block text-xs font-semibold'
                  />
                </div>
                <div className='text-right text-xs font-semibold'>
                  <div>{row.vestedMembers} vested</div>
                  <div>{row.awaitingPublication} awaiting</div>
                  <div>{row.pendingMembers} pending</div>
                </div>
              </div>
              <div className='grid gap-2 px-4 py-3'>
                <div className='text-sm font-extrabold'>Registration</div>
                <MobileValue label='Owed' value={currencyFormatter.format(row.registrationFeeOwed)} />
                <MobileValue
                  label='Sent'
                  value={currencyFormatter.format(row.registrationAmountSent)}
                  valueClassName={row.registrationAmountSent > 0 ? 'text-green-700 dark:text-green-300' : ''}
                />
                <MobileValue label='Verified' value={currencyFormatter.format(row.registrationReceived)} />
                <div
                  className={`mt-1 rounded-md p-3 ${
                    row.registrationBalance >= 0
                      ? 'bg-green-600/10 text-green-700 dark:text-green-300'
                      : 'bg-red-600/10 text-red-700 dark:text-red-300'
                  }`}
                >
                  <div className='grid grid-cols-[auto_auto_minmax(0,1fr)] grid-rows-[auto_auto] items-center justify-items-center gap-x-3 gap-y-1'>
                    <RegistrationPaymentControls row={row} />
                    <ManualBalanceAdjustmentForm sponsorCode={row.sponsorCode} />
                    <div className='bg-background/80 col-start-3 row-span-2 row-start-1 flex min-w-0 flex-col items-center justify-center self-stretch justify-self-stretch rounded-md border border-current/20 px-2 py-2 text-center'>
                      <div className='text-xs font-semibold uppercase'>Balance</div>
                      <div className='text-lg leading-none font-black tabular-nums'>
                        {currencyFormatter.format(row.registrationBalance)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
        {sortedRows.length > 0 && (
          <article className='rounded-md border bg-white px-4 py-3 text-black shadow-sm dark:bg-white dark:text-black'>
            <div className='mb-2 text-base font-extrabold'>Total</div>
            <div className='grid gap-2'>
              <MobileValue label='Vested' value={totals.vestedMembers} />
              <MobileValue label='Awaiting' value={totals.awaitingPublication} />
              <MobileValue label='Pending' value={totals.pendingMembers} />
              <MobileValue label='Registration owed' value={currencyFormatter.format(totals.registrationFeeOwed)} />
              <MobileValue label='Registration sent' value={currencyFormatter.format(totals.registrationAmountSent)} />
              <MobileValue label='Registration verified' value={currencyFormatter.format(totals.registrationReceived)} />
              <MobileValue label='Registration balance' value={currencyFormatter.format(totals.registrationBalance)} />
            </div>
          </article>
        )}
      </div>
    </div>
  )
}

export default AdminSagicamRegistrationsTable
