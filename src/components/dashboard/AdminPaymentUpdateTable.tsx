'use client'

import { useId, useMemo, useState } from 'react'

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import PaginationControls from '@/components/global/PaginationControls'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePagination } from '@/hooks/use-pagination'
import { cn } from '@/lib/utils'
import type { AdminContributionPaymentUpdateRow } from '@/utils/admin-contribution-payment-update'

type SortKey = keyof AdminContributionPaymentUpdateRow
type SortDirection = 'asc' | 'desc'

type SortState = {
  direction: SortDirection
  key: SortKey
}

type PaymentUpdateColumn = {
  align?: 'left' | 'right'
  key: SortKey
  label: string
}

type AdminPaymentUpdateTableProps = {
  defaultSort?: SortState
  emptyMessage: string
  rows: AdminContributionPaymentUpdateRow[]
  title: string
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const defaultRowsPerPage = 10
const rowsPerPageOptions = [10, 25, 50, 100]

const columns: PaymentUpdateColumn[] = [
  { key: 'sponsorName', label: 'Sponsor' },
  { key: 'sponsorCode', label: 'Code' },
  { align: 'right', key: 'vestedMembers', label: 'Vested' },
  { align: 'right', key: 'contributionDue', label: 'Due' },
  { align: 'right', key: 'amountSent', label: 'Sent' },
  { align: 'right', key: 'amountVerified', label: 'Verified' },
  { align: 'right', key: 'balance', label: 'Contribution Balance' }
]

const getTotals = (rows: AdminContributionPaymentUpdateRow[]) =>
  rows.reduce(
    (totals, row) => ({
      amountSent: totals.amountSent + row.amountSent,
      amountVerified: totals.amountVerified + row.amountVerified,
      balance: totals.balance + row.balance,
      contributionDue: totals.contributionDue + row.contributionDue,
      vestedMembers: totals.vestedMembers + row.vestedMembers
    }),
    {
      amountSent: 0,
      amountVerified: 0,
      balance: 0,
      contributionDue: 0,
      vestedMembers: 0
    }
  )

const compareValues = (
  firstValue: AdminContributionPaymentUpdateRow[SortKey],
  secondValue: AdminContributionPaymentUpdateRow[SortKey]
) => {
  if (typeof firstValue === 'number' && typeof secondValue === 'number') return firstValue - secondValue

  return String(firstValue ?? '').localeCompare(String(secondValue ?? ''), undefined, {
    numeric: true,
    sensitivity: 'base'
  })
}

const getNextDirection = (sort: SortState, key: SortKey): SortDirection => {
  if (sort.key !== key) return 'asc'

  return sort.direction === 'asc' ? 'desc' : 'asc'
}

const SortIcon = ({ active, direction }: { active: boolean; direction: SortDirection }) => {
  if (!active) return <ArrowUpDown className='size-3 opacity-80' aria-hidden='true' />
  if (direction === 'asc') return <ArrowUp className='size-3 opacity-90' aria-hidden='true' />

  return <ArrowDown className='size-3 opacity-90' aria-hidden='true' />
}

const BalanceValue = ({ balance }: { balance: number }) => (
  <span
    className={cn(
      'inline-block max-w-full min-w-0 truncate font-black whitespace-nowrap tabular-nums',
      balance < 0 ? 'text-red-700 dark:text-red-300' : 'text-green-700'
    )}
    title={currencyFormatter.format(balance)}
  >
    {currencyFormatter.format(balance)}
  </span>
)

const AdminPaymentUpdateTable = ({
  defaultSort = { direction: 'asc', key: 'sponsorCode' },
  emptyMessage,
  rows,
  title
}: AdminPaymentUpdateTableProps) => {
  const rowsPerPageSelectId = useId()
  const [sort, setSort] = useState<SortState>(defaultSort)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage)
  const totals = useMemo(() => getTotals(rows), [rows])

  const sortedRows = useMemo(() => {
    const directionMultiplier = sort.direction === 'asc' ? 1 : -1

    return [...rows].sort((firstRow, secondRow) => {
      const primarySort = compareValues(firstRow[sort.key], secondRow[sort.key]) * directionMultiplier

      if (primarySort !== 0) return primarySort

      return compareValues(firstRow.sponsorCode, secondRow.sponsorCode)
    })
  }, [rows, sort])

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage))
  const activePage = Math.min(currentPage, totalPages)
  const pageStartIndex = (activePage - 1) * rowsPerPage
  const pageEndIndex = activePage * rowsPerPage

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: activePage,
    paginationItemsToDisplay: 3,
    totalPages
  })

  const handleSort = (key: SortKey) => {
    setCurrentPage(1)
    setSort(currentSort => ({
      direction: getNextDirection(currentSort, key),
      key
    }))
  }

  const handleSortDirectionToggle = () => {
    setCurrentPage(1)
    setSort(currentSort => ({
      ...currentSort,
      direction: currentSort.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value))
    setCurrentPage(1)
  }

  return (
    <Card data-payment-update-table-card className='w-full max-w-full min-w-0 overflow-hidden'>
      <CardHeader>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
          <CardTitle>{title}</CardTitle>
          {sortedRows.length > 0 ? (
            <div className='flex flex-col gap-3 sm:items-end print:hidden'>
              <div className='flex items-center justify-between gap-2 sm:justify-end'>
                <label
                  htmlFor={rowsPerPageSelectId}
                  className='text-muted-foreground text-sm font-medium whitespace-nowrap'
                >
                  Lines
                </label>
                <Select value={String(rowsPerPage)} onValueChange={handleRowsPerPageChange}>
                  <SelectTrigger id={rowsPerPageSelectId} size='sm' className='w-24'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align='end'>
                    {rowsPerPageOptions.map(option => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='flex flex-col gap-2 sm:hidden'>
                <p className='text-muted-foreground text-xs font-semibold'>Sort by</p>
                <div className='grid grid-cols-[minmax(0,1fr)_auto] gap-2'>
                  <Select value={sort.key} onValueChange={value => handleSort(value as SortKey)}>
                    <SelectTrigger size='sm' className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(column => (
                        <SelectItem key={column.key} value={column.key}>
                          {column.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type='button' variant='outline' size='sm' onClick={handleSortDirectionToggle}>
                    <SortIcon active direction={sort.direction} />
                    {sort.direction === 'asc' ? 'Asc' : 'Desc'}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className='min-w-0'>
        <div className='max-w-full overflow-hidden rounded-lg border'>
          <Table
            data-payment-update-table
            mobileCards
            className='w-full max-w-full min-w-0 table-fixed text-[10px] sm:min-w-0 sm:text-[11px] lg:text-xs sm:[&_td]:py-3 sm:[&_th]:py-2.5'
          >
            <colgroup>
              <col className='w-[5%]' />
              <col className='w-[31%]' />
              <col className='w-[7%]' />
              <col className='w-[6%]' />
              <col className='w-[12%]' />
              <col className='w-[12%]' />
              <col className='w-[10%]' />
              <col className='w-[17%]' />
            </colgroup>
            <TableHeader>
              <TableRow className='bg-primary hover:bg-primary'>
                <TableHead className='text-primary-foreground truncate px-1.5 text-right whitespace-nowrap'>
                  No.
                </TableHead>
                {columns.map(column => {
                  const isActive = sort.key === column.key

                  return (
                    <TableHead
                      key={column.key}
                      aria-sort={isActive ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                      className={cn(
                        'text-primary-foreground overflow-hidden whitespace-nowrap',
                        'px-1.5',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      <button
                        type='button'
                        onClick={() => handleSort(column.key)}
                        className={cn(
                          'text-primary-foreground inline-flex w-full min-w-0 items-center gap-0.5 overflow-hidden transition hover:opacity-85',
                          column.align === 'right' ? 'justify-end text-right' : 'justify-start text-left'
                        )}
                      >
                        <span className='min-w-0 truncate whitespace-nowrap'>{column.label}</span>
                        <SortIcon active={isActive} direction={sort.direction} />
                      </button>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRows.length > 0 ? (
                <>
                  {sortedRows.map((row, index) => (
                    <TableRow
                      key={row.sponsorCode}
                      className={cn(
                        'h-12 hover:bg-gray-300 print:table-row',
                        index >= pageStartIndex && index < pageEndIndex ? 'odd:bg-gray-200 even:bg-white' : 'hidden',
                        index % 2 === 0 ? 'print:bg-gray-200' : 'print:bg-white'
                      )}
                    >
                      <TableCell
                        data-label='No.'
                        className='overflow-hidden px-1.5 text-right font-semibold whitespace-nowrap tabular-nums'
                      >
                        {index + 1}
                      </TableCell>
                      <TableCell
                        data-label='Sponsor'
                        className='overflow-hidden px-1.5 font-semibold whitespace-nowrap'
                        title={row.sponsorName}
                      >
                        <span className='block min-w-0 truncate whitespace-nowrap'>{row.sponsorName}</span>
                      </TableCell>
                      <TableCell
                        data-label='Code'
                        className='overflow-hidden px-1.5 font-mono font-semibold whitespace-nowrap'
                        title={row.sponsorCode}
                      >
                        <span className='block min-w-0 truncate whitespace-nowrap'>{row.sponsorCode}</span>
                      </TableCell>
                      <TableCell
                        data-label='Vested'
                        className='overflow-hidden px-1.5 text-right font-semibold whitespace-nowrap tabular-nums'
                      >
                        {row.vestedMembers.toLocaleString('en-US')}
                      </TableCell>
                      <TableCell
                        data-label='Contribution Due'
                        className='overflow-hidden px-1.5 text-right font-semibold whitespace-nowrap tabular-nums'
                      >
                        {currencyFormatter.format(row.contributionDue)}
                      </TableCell>
                      <TableCell
                        data-label='Sent Not Verified'
                        className='overflow-hidden px-1.5 text-right font-semibold whitespace-nowrap tabular-nums'
                      >
                        {currencyFormatter.format(row.amountSent)}
                      </TableCell>
                      <TableCell
                        data-label='Verified'
                        className='overflow-hidden px-1.5 text-right font-semibold whitespace-nowrap tabular-nums'
                      >
                        {currencyFormatter.format(row.amountVerified)}
                      </TableCell>
                      <TableCell
                        data-label='Contribution Balance'
                        className='overflow-hidden px-1.5 text-right whitespace-nowrap'
                      >
                        <BalanceValue balance={row.balance} />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className='bg-primary/10 text-base font-black'>
                    <TableCell className='overflow-hidden px-1.5 font-black whitespace-nowrap' colSpan={3}>
                      Total
                    </TableCell>
                    <TableCell className='overflow-hidden px-1.5 text-right whitespace-nowrap tabular-nums'>
                      {totals.vestedMembers.toLocaleString('en-US')}
                    </TableCell>
                    <TableCell className='overflow-hidden px-1.5 text-right whitespace-nowrap tabular-nums'>
                      {currencyFormatter.format(totals.contributionDue)}
                    </TableCell>
                    <TableCell className='overflow-hidden px-1.5 text-right whitespace-nowrap tabular-nums'>
                      {currencyFormatter.format(totals.amountSent)}
                    </TableCell>
                    <TableCell className='overflow-hidden px-1.5 text-right whitespace-nowrap tabular-nums'>
                      {currencyFormatter.format(totals.amountVerified)}
                    </TableCell>
                    <TableCell className='overflow-hidden px-1.5 text-right whitespace-nowrap'>
                      <BalanceValue balance={totals.balance} />
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className='text-muted-foreground h-24 text-center'>
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {sortedRows.length > 0 ? (
          <div
            data-payment-update-pagination
            className='mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row print:hidden'
          >
            <p className='text-muted-foreground text-sm' aria-live='polite'>
              Showing {pageStartIndex + 1}-{Math.min(pageEndIndex, sortedRows.length)} of {sortedRows.length}
            </p>
            {totalPages > 1 ? (
              <PaginationControls
                activePage={activePage}
                canNext={activePage < totalPages}
                canPrevious={activePage > 1}
                getPageButtonClassName={isActive =>
                  isActive
                    ? undefined
                    : 'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40'
                }
                iconClassName='text-primary'
                labelClassName='text-primary max-sm:hidden'
                onNext={() => setCurrentPage(Math.min(totalPages, activePage + 1))}
                onPageChange={setCurrentPage}
                onPrevious={() => setCurrentPage(Math.max(1, activePage - 1))}
                pages={pages}
                showLeftEllipsis={showLeftEllipsis}
                showRightEllipsis={showRightEllipsis}
              />
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default AdminPaymentUpdateTable
