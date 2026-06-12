'use client'

import { useMemo, useState } from 'react'

import { ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, CircleDollarSign, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  resetSponsorContributionPaymentAction,
  resetSponsorRegistrationPaymentAction,
  setSponsorContributionPaidAction,
  setSponsorRegistrationPaidAction,
  verifySponsorContributionPaymentAction,
  verifySponsorRegistrationPaymentAction
} from '@/utils/actions'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

export type AdminSagicamPaymentsRow = {
  amountOwed: number
  amountReceived: number
  awaitingPublication: number
  balance: number
  contributionAmountSent: number
  contributionAmountUsed: number
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

export type AdminSagicamPaymentsTotals = Pick<
  AdminSagicamPaymentsRow,
  | 'amountOwed'
  | 'amountReceived'
  | 'awaitingPublication'
  | 'balance'
  | 'contributionAmountSent'
  | 'pendingMembers'
  | 'registrationAmountSent'
  | 'registrationBalance'
  | 'registrationFeeOwed'
  | 'registrationReceived'
  | 'vestedMembers'
>

type SortKey = keyof AdminSagicamPaymentsRow
type SortDirection = 'asc' | 'desc'

type AdminSagicamPaymentsColumn = {
  key: SortKey
  label: string
  align?: 'left' | 'right'
}

const columns: AdminSagicamPaymentsColumn[] = [
  { key: 'sponsorCode', label: 'Code' },
  { key: 'vestedMembers', label: 'Vested', align: 'right' },
  { key: 'awaitingPublication', label: 'Awaiting', align: 'right' },
  { key: 'pendingMembers', label: 'Pending', align: 'right' },
  { key: 'amountOwed', label: 'Contribution owed', align: 'right' },
  { key: 'contributionAmountSent', label: 'Contribution sent', align: 'right' },
  { key: 'amountReceived', label: 'Contribution verified', align: 'right' },
  { key: 'balance', label: 'Contribution Balance', align: 'right' },
  { key: 'registrationFeeOwed', label: 'Registration owed', align: 'right' },
  { key: 'registrationAmountSent', label: 'Registration sent', align: 'right' },
  { key: 'registrationReceived', label: 'Registration verified', align: 'right' },
  { key: 'registrationBalance', label: 'Registration balance', align: 'right' }
]

const balanceColumnWidth = 15
const regularColumnWidth = (100 - balanceColumnWidth * 2) / (columns.length - 2)

const getColumnWidth = (columnKey: SortKey) =>
  columnKey === 'balance' || columnKey === 'registrationBalance' ? balanceColumnWidth : regularColumnWidth

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

const ContributionPaymentControls = ({ row }: { row: AdminSagicamPaymentsRow }) => {
  const hasSubmittedPayment = row.contributionAmountSent > 0
  const hasPaymentValues = row.contributionAmountSent > 0 || row.amountReceived > 0
  const canSetPaid = row.contributionAmountUsed > 0

  return (
    <div className='flex flex-col items-start gap-1'>
      <form action={verifySponsorContributionPaymentAction} className='w-20'>
        <input type='hidden' name='sponsorCode' value={row.sponsorCode} />
        <Button
          type='submit'
          size='xs'
          variant='outline'
          disabled={!hasSubmittedPayment}
          className='h-7 w-full justify-start px-2 text-[11px]'
        >
          <CheckCircle2 className='size-3' />
          Verify
        </Button>
      </form>
      <form action={setSponsorContributionPaidAction} className='w-20'>
        <input type='hidden' name='sponsorCode' value={row.sponsorCode} />
        <input type='hidden' name='contributionAmountUsed' value={row.contributionAmountUsed.toFixed(2)} />
        <Button
          type='submit'
          size='xs'
          variant='secondary'
          disabled={!canSetPaid}
          className='h-7 w-full justify-start px-2 text-[11px]'
        >
          <CircleDollarSign className='size-3' />
          Paid
        </Button>
      </form>
      <form action={resetSponsorContributionPaymentAction} className='w-20'>
        <input type='hidden' name='sponsorCode' value={row.sponsorCode} />
        <Button
          type='submit'
          size='xs'
          variant='destructive'
          disabled={!hasPaymentValues}
          className='h-7 w-full justify-start px-2 text-[11px]'
        >
          <RotateCcw className='size-3' />
          Reset
        </Button>
      </form>
    </div>
  )
}

const RegistrationPaymentControls = ({ row }: { row: AdminSagicamPaymentsRow }) => {
  const hasSubmittedPayment = row.registrationAmountSent > 0
  const hasPaymentValues = row.registrationAmountSent > 0 || row.registrationReceived > 0
  const canSetPaid = row.registrationAmountUsed > 0 || row.registrationFeeOwed > 0

  return (
    <div className='flex flex-col items-start gap-1'>
      <form action={verifySponsorRegistrationPaymentAction} className='w-20'>
        <input type='hidden' name='sponsorCode' value={row.sponsorCode} />
        <Button
          type='submit'
          size='xs'
          variant='outline'
          disabled={!hasSubmittedPayment}
          className='h-7 w-full justify-start px-2 text-[11px]'
        >
          <CheckCircle2 className='size-3' />
          Verify
        </Button>
      </form>
      <form action={setSponsorRegistrationPaidAction} className='w-20'>
        <input type='hidden' name='sponsorCode' value={row.sponsorCode} />
        <input
          type='hidden'
          name='registrationAmountOwed'
          value={(row.registrationAmountUsed + row.registrationFeeOwed).toFixed(2)}
        />
        <Button
          type='submit'
          size='xs'
          variant='secondary'
          disabled={!canSetPaid}
          className='h-7 w-full justify-start px-2 text-[11px]'
        >
          <CircleDollarSign className='size-3' />
          Paid
        </Button>
      </form>
      <form action={resetSponsorRegistrationPaymentAction} className='w-20'>
        <input type='hidden' name='sponsorCode' value={row.sponsorCode} />
        <Button
          type='submit'
          size='xs'
          variant='destructive'
          disabled={!hasPaymentValues}
          className='h-7 w-full justify-start px-2 text-[11px]'
        >
          <RotateCcw className='size-3' />
          Reset
        </Button>
      </form>
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
      <Table className='[[&_td]:wrap-break-word table-fixed [&_td]:whitespace-normal [&_th]:wrap-break-word [&_th]:whitespace-normal'>
        <colgroup>
          {columns.map(column => (
            <col key={column.key} style={{ width: `${getColumnWidth(column.key)}%` }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow className='bg-primary hover:bg-primary'>
            {columns.map(column => {
              const isActive = sortKey === column.key

              return (
                <TableHead
                  key={column.key}
                  className='text-primary-foreground'
                  aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <button
                    type='button'
                    className={`flex w-full items-center gap-1.5 text-left font-semibold ${column.align === 'right' ? 'justify-end text-right [&>span]:text-right' : 'justify-start'}`}
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
                No Sagicam payments found.
              </TableCell>
            </TableRow>
          ) : (
            sortedRows.map(row => (
              <TableRow key={row.sponsorCode} className='odd:bg-muted/30 even:bg-background'>
                <TableCell>{row.sponsorCode}</TableCell>
                <TableCell className='text-right font-semibold'>{row.vestedMembers}</TableCell>
                <TableCell className='text-right font-semibold'>{row.awaitingPublication}</TableCell>
                <TableCell className='text-right font-semibold'>{row.pendingMembers}</TableCell>
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
                  className={`text-right align-top font-semibold ${
                    row.balance >= 0
                      ? 'bg-green-600/10 text-green-700 dark:text-green-300'
                      : 'bg-red-600/10 text-red-700 dark:text-red-300'
                  }`}
                >
                  <div className='flex min-w-0 items-start justify-between gap-2'>
                    <ContributionPaymentControls row={row} />
                    <span className='shrink-0 text-right tabular-nums'>{currencyFormatter.format(row.balance)}</span>
                  </div>
                </TableCell>
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
                  className={`text-right align-top font-semibold ${
                    row.registrationBalance >= 0
                      ? 'bg-green-600/10 text-green-700 dark:text-green-300'
                      : 'bg-red-600/10 text-red-700 dark:text-red-300'
                  }`}
                >
                  <div className='flex min-w-0 items-start justify-between gap-2'>
                    <RegistrationPaymentControls row={row} />
                    <span className='shrink-0 text-right tabular-nums'>
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
              <TableCell className='font-extrabold'>Total</TableCell>
              <TableCell className='text-right font-extrabold'>{totals.vestedMembers}</TableCell>
              <TableCell className='text-right font-extrabold'>{totals.awaitingPublication}</TableCell>
              <TableCell className='text-right font-extrabold'>{totals.pendingMembers}</TableCell>
              <TableCell className='text-right font-extrabold'>{currencyFormatter.format(totals.amountOwed)}</TableCell>
              <TableCell className='text-right font-extrabold'>
                {currencyFormatter.format(totals.contributionAmountSent)}
              </TableCell>
              <TableCell className='text-right font-extrabold'>
                {currencyFormatter.format(totals.amountReceived)}
              </TableCell>
              <TableCell className='text-right font-extrabold'>{currencyFormatter.format(totals.balance)}</TableCell>
              <TableCell className='bg-white text-right font-extrabold text-black dark:bg-white dark:text-black'>
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
  )
}

export default AdminSagicamPaymentsTable
