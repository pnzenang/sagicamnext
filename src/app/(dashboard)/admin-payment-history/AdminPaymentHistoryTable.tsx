'use client'

import { useMemo, useState } from 'react'

import { ArrowDown, ArrowUp, ArrowUpDown, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

export type AdminPaymentHistoryRow = {
  amountAdjusted: number | null
  amountSet: number | null
  amountVerified: number | null
  createdAt: string
  createdAtLabel: string
  eventType: string
  id: string
  note: string
  paymentType: string
  source: string
  sponsorCode: string
  sponsorEmail: string
  sponsorName: string
}

export type AdminPaymentHistoryTotals = {
  amountAdjusted: number
  amountSet: number
  amountVerified: number
  transactionCount: number
}

type SortKey = keyof AdminPaymentHistoryRow
type SortDirection = 'asc' | 'desc'

type AdminPaymentHistoryColumn = {
  key: SortKey
  label: string
  align?: 'left' | 'right'
}

const columns: AdminPaymentHistoryColumn[] = [
  { key: 'createdAt', label: 'Date' },
  { key: 'sponsorCode', label: 'Code' },
  { key: 'sponsorName', label: 'Sponsor' },
  { key: 'paymentType', label: 'Type' },
  { key: 'eventType', label: 'Action' },
  { key: 'amountSet', label: 'Amount set by sponsor', align: 'right' },
  { key: 'amountAdjusted', label: 'Amount adjusted', align: 'right' },
  { key: 'amountVerified', label: 'Amount verified', align: 'right' },
  { key: 'note', label: 'Note' }
]

const exportColumnWidths: Partial<Record<SortKey, number>> = {
  amountAdjusted: 18,
  amountSet: 24,
  amountVerified: 18,
  createdAt: 22,
  eventType: 20,
  note: 42,
  paymentType: 16,
  sponsorCode: 12,
  sponsorEmail: 32,
  sponsorName: 26
}

const columnWidths: Partial<Record<SortKey, number>> = {
  amountAdjusted: 12,
  amountSet: 13,
  amountVerified: 12,
  createdAt: 13,
  eventType: 12,
  note: 16,
  paymentType: 9,
  sponsorCode: 7,
  sponsorName: 13
}

const getColumnStyle = (columnKey: SortKey) => ({ width: `${columnWidths[columnKey] ?? 10}%` })

const getSortIcon = (isActive: boolean, direction: SortDirection) => {
  if (!isActive) return <ArrowUpDown className='size-3.5' />

  return direction === 'asc' ? <ArrowUp className='size-3.5' /> : <ArrowDown className='size-3.5' />
}

const compareValues = (firstValue: AdminPaymentHistoryRow[SortKey], secondValue: AdminPaymentHistoryRow[SortKey]) => {
  if (typeof firstValue === 'number' && typeof secondValue === 'number') {
    return firstValue - secondValue
  }

  if (firstValue === null && secondValue === null) return 0
  if (firstValue === null) return -1
  if (secondValue === null) return 1

  return String(firstValue).localeCompare(String(secondValue), undefined, {
    numeric: true,
    sensitivity: 'base'
  })
}

const formatAmount = (amount: number | null) => (amount === null ? '-' : currencyFormatter.format(amount))

const getAmountClassName = (amount: number | null) =>
  cn(
    'font-semibold tabular-nums',
    amount === null && 'text-muted-foreground font-medium',
    amount !== null && amount < 0 && 'text-red-700 dark:text-red-300',
    amount !== null && amount > 0 && 'text-green-700 dark:text-green-300'
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

const SummaryStat = ({ label, value }: { label: string; value: string | number }) => (
  <div className='bg-background rounded-md border p-4'>
    <div className='text-muted-foreground text-xs font-semibold uppercase'>{label}</div>
    <div className='mt-2 text-2xl font-extrabold tracking-normal tabular-nums'>{value}</div>
  </div>
)

const AdminPaymentHistoryTable = ({
  rows,
  totals
}: {
  rows: AdminPaymentHistoryRow[]
  totals: AdminPaymentHistoryTotals
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [search, setSearch] = useState('')

  const normalizedSearch = search.trim().toLowerCase()

  const filteredRows = useMemo(() => {
    if (!normalizedSearch) return rows

    return rows.filter(row =>
      [
        row.createdAtLabel,
        row.eventType,
        row.note,
        row.paymentType,
        row.source,
        row.sponsorCode,
        row.sponsorEmail,
        row.sponsorName
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)
    )
  }, [normalizedSearch, rows])

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((firstRow, secondRow) => {
      const comparison = compareValues(firstRow[sortKey], secondRow[sortKey])

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredRows, sortDirection, sortKey])

  const visibleTotals = useMemo<AdminPaymentHistoryTotals>(() => {
    if (!normalizedSearch) return totals

    return filteredRows.reduce(
      (currentTotals, row) => {
        currentTotals.amountAdjusted += row.amountAdjusted ?? 0
        currentTotals.amountSet += row.amountSet ?? 0
        currentTotals.amountVerified += row.amountVerified ?? 0
        currentTotals.transactionCount += 1

        return currentTotals
      },
      {
        amountAdjusted: 0,
        amountSet: 0,
        amountVerified: 0,
        transactionCount: 0
      }
    )
  }, [filteredRows, normalizedSearch, totals])

  const handleSort = (nextSortKey: SortKey) => {
    if (nextSortKey === sortKey) {
      setSortDirection(currentDirection => (currentDirection === 'asc' ? 'desc' : 'asc'))

      return
    }

    setSortKey(nextSortKey)
    setSortDirection(nextSortKey === 'createdAt' ? 'desc' : 'asc')
  }

  const handleExport = () => {
    const worksheetRows = [
      [
        'Date',
        'Sponsor code',
        'Sponsor name',
        'Sponsor email',
        'Payment type',
        'Action',
        'Source',
        'Amount set by sponsor',
        'Amount adjusted',
        'Amount verified',
        'Note'
      ],
      ...sortedRows.map(row => [
        row.createdAtLabel,
        row.sponsorCode,
        row.sponsorName,
        row.sponsorEmail,
        row.paymentType,
        row.eventType,
        row.source,
        row.amountSet ?? '',
        row.amountAdjusted ?? '',
        row.amountVerified ?? '',
        row.note
      ]),
      [
        'Total',
        '',
        '',
        '',
        '',
        '',
        '',
        visibleTotals.amountSet,
        visibleTotals.amountAdjusted,
        visibleTotals.amountVerified,
        `${visibleTotals.transactionCount} transaction(s)`
      ]
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetRows)

    worksheet['!cols'] = [
      { wch: exportColumnWidths.createdAt },
      { wch: exportColumnWidths.sponsorCode },
      { wch: exportColumnWidths.sponsorName },
      { wch: exportColumnWidths.sponsorEmail },
      { wch: exportColumnWidths.paymentType },
      { wch: exportColumnWidths.eventType },
      { wch: 12 },
      { wch: exportColumnWidths.amountSet },
      { wch: exportColumnWidths.amountAdjusted },
      { wch: exportColumnWidths.amountVerified },
      { wch: exportColumnWidths.note }
    ]

    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment History')
    XLSX.writeFile(workbook, `sagicam-payment-history-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className='max-w-full min-w-0 space-y-4'>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <SummaryStat label='Transactions' value={visibleTotals.transactionCount} />
        <SummaryStat label='Amount set by sponsors' value={currencyFormatter.format(visibleTotals.amountSet)} />
        <SummaryStat label='Amount adjusted' value={currencyFormatter.format(visibleTotals.amountAdjusted)} />
        <SummaryStat label='Amount verified' value={currencyFormatter.format(visibleTotals.amountVerified)} />
      </div>

      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <form role='search' onSubmit={event => event.preventDefault()} className='min-w-0 flex-1'>
          <label htmlFor='payment-history-search' className='sr-only'>
            Search payment history
          </label>
          <Input
            id='payment-history-search'
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder='Search sponsor, code, type, action, or note'
            className='bg-background h-10 w-full text-sm font-semibold'
          />
        </form>
        <Button type='button' size='sm' onClick={handleExport} disabled={sortedRows.length === 0}>
          <Download />
          Export
        </Button>
      </div>

      <div className='border-border max-w-full min-w-0 overflow-hidden rounded-lg border'>
        <div className='hidden overflow-x-auto xl:block'>
          <Table className='[[&_td]:wrap-break-word table-fixed [&_td]:whitespace-normal [&_th]:wrap-break-word [&_th]:whitespace-normal'>
            <colgroup>
              {columns.map(column => (
                <col key={column.key} style={getColumnStyle(column.key)} />
              ))}
            </colgroup>
            <TableHeader>
              <TableRow className='bg-primary hover:bg-primary h-16'>
                {columns.map(column => {
                  const isActive = sortKey === column.key

                  return (
                    <TableHead
                      key={column.key}
                      className='text-primary-foreground h-16'
                      style={getColumnStyle(column.key)}
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
                    {normalizedSearch
                      ? `No payment history matching "${search.trim()}" found.`
                      : 'No payment history found.'}
                  </TableCell>
                </TableRow>
              ) : (
                sortedRows.map(row => (
                  <TableRow key={row.id} className='odd:bg-muted/30 even:bg-background'>
                    <TableCell className='text-xs font-semibold' style={getColumnStyle('createdAt')}>
                      {row.createdAtLabel}
                    </TableCell>
                    <TableCell className='font-extrabold' style={getColumnStyle('sponsorCode')}>
                      {row.sponsorCode}
                    </TableCell>
                    <TableCell className='text-sm' style={getColumnStyle('sponsorName')}>
                      <div className='font-semibold'>{row.sponsorName || '-'}</div>
                      {row.sponsorEmail ? (
                        <a
                          href={`mailto:${row.sponsorEmail}`}
                          className='text-primary text-xs break-all underline-offset-2 hover:underline'
                        >
                          {row.sponsorEmail}
                        </a>
                      ) : null}
                    </TableCell>
                    <TableCell className='text-sm font-semibold' style={getColumnStyle('paymentType')}>
                      {row.paymentType}
                    </TableCell>
                    <TableCell className='text-sm font-semibold' style={getColumnStyle('eventType')}>
                      <div>{row.eventType}</div>
                      <div className='text-muted-foreground text-xs'>{row.source}</div>
                    </TableCell>
                    <TableCell className='text-right' style={getColumnStyle('amountSet')}>
                      <span className={getAmountClassName(row.amountSet)}>{formatAmount(row.amountSet)}</span>
                    </TableCell>
                    <TableCell className='text-right' style={getColumnStyle('amountAdjusted')}>
                      <span className={getAmountClassName(row.amountAdjusted)}>{formatAmount(row.amountAdjusted)}</span>
                    </TableCell>
                    <TableCell className='text-right' style={getColumnStyle('amountVerified')}>
                      <span className={getAmountClassName(row.amountVerified)}>{formatAmount(row.amountVerified)}</span>
                    </TableCell>
                    <TableCell className='text-muted-foreground text-xs' style={getColumnStyle('note')}>
                      {row.note || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {sortedRows.length > 0 && (
              <TableFooter className='bg-white text-black dark:bg-white dark:text-black'>
                <TableRow className='bg-white text-base text-black hover:bg-white dark:bg-white dark:text-black dark:hover:bg-white'>
                  <TableCell className='font-extrabold' style={getColumnStyle('createdAt')}>
                    Total
                  </TableCell>
                  <TableCell style={getColumnStyle('sponsorCode')} />
                  <TableCell style={getColumnStyle('sponsorName')} />
                  <TableCell style={getColumnStyle('paymentType')} />
                  <TableCell className='font-semibold' style={getColumnStyle('eventType')}>
                    {visibleTotals.transactionCount} transaction(s)
                  </TableCell>
                  <TableCell className='text-right font-extrabold' style={getColumnStyle('amountSet')}>
                    {currencyFormatter.format(visibleTotals.amountSet)}
                  </TableCell>
                  <TableCell className='text-right font-extrabold' style={getColumnStyle('amountAdjusted')}>
                    {currencyFormatter.format(visibleTotals.amountAdjusted)}
                  </TableCell>
                  <TableCell className='text-right font-extrabold' style={getColumnStyle('amountVerified')}>
                    {currencyFormatter.format(visibleTotals.amountVerified)}
                  </TableCell>
                  <TableCell style={getColumnStyle('note')} />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>

        <div className='grid gap-3 p-2 sm:p-3 xl:hidden'>
          {sortedRows.length === 0 ? (
            <div className='text-muted-foreground rounded-md border px-3 py-8 text-center text-sm sm:px-4 sm:py-10'>
              {normalizedSearch ? `No payment history matching "${search.trim()}" found.` : 'No payment history found.'}
            </div>
          ) : (
            sortedRows.map(row => (
              <article key={row.id} className='bg-background overflow-hidden rounded-md border shadow-sm'>
                <div className='flex flex-col gap-2 border-b px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-4'>
                  <div className='min-w-0'>
                    <div className='text-lg font-extrabold'>{row.sponsorCode}</div>
                    <div className='text-sm font-semibold break-words'>{row.sponsorName || '-'}</div>
                    {row.sponsorEmail ? (
                      <a
                        href={`mailto:${row.sponsorEmail}`}
                        className='text-primary text-xs break-all underline-offset-2 hover:underline'
                      >
                        {row.sponsorEmail}
                      </a>
                    ) : null}
                  </div>
                  <div className='text-muted-foreground shrink-0 text-left text-xs font-semibold sm:text-right'>
                    {row.createdAtLabel}
                  </div>
                </div>
                <div className='grid gap-2 px-3 py-3 text-sm sm:px-4'>
                  <MobileValue label='Type' value={row.paymentType} />
                  <MobileValue label='Action' value={row.eventType} />
                  <MobileValue label='Source' value={row.source} />
                  <MobileValue
                    label='Amount set by sponsor'
                    value={formatAmount(row.amountSet)}
                    valueClassName={getAmountClassName(row.amountSet)}
                  />
                  <MobileValue
                    label='Amount adjusted'
                    value={formatAmount(row.amountAdjusted)}
                    valueClassName={getAmountClassName(row.amountAdjusted)}
                  />
                  <MobileValue
                    label='Amount verified'
                    value={formatAmount(row.amountVerified)}
                    valueClassName={getAmountClassName(row.amountVerified)}
                  />
                  {row.note ? (
                    <div className='border-t pt-3'>
                      <div className='text-muted-foreground text-xs font-semibold uppercase'>Note</div>
                      <div className='mt-1 text-sm font-semibold break-words'>{row.note}</div>
                    </div>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPaymentHistoryTable
