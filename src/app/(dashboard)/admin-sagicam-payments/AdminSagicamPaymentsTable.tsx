'use client'

import { useMemo, useState } from 'react'

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeftIcon,
  ChevronRightIcon,
  Download,
  RotateCcw
} from 'lucide-react'
import * as XLSX from 'xlsx'

import PrintButton from '@/components/global/PrintButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePagination } from '@/hooks/use-pagination'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { cn } from '@/lib/utils'
import { contributionCreditPerVestedMember } from '@/utils/sagicam-contribution-constants'
import {
  addSponsorContributionBalanceAdjustmentAction,
  adjustSponsorContributionAmountSentAction,
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
  cemail: string
  sponsorCode: string
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
  { key: 'cemail', label: 'cemail' },
  { key: 'sponsorCode', label: 'Code' },
  { key: 'vestedMembers', label: 'Vested', align: 'right' },
  { key: 'amountOwed', label: 'Contribution owed', align: 'right' },
  { key: 'contributionAmountSent', label: 'Contribution sent', align: 'right' },
  { key: 'amountReceived', label: 'Contribution verified', align: 'right' },
  { key: 'balance', label: 'Reserve / Deficit', align: 'right' }
]

const pageSizeOptions = [10, 25, 50, 100]

const exportColumnWidths: Partial<Record<SortKey, number>> = {
  amountOwed: 18,
  amountReceived: 22,
  balance: 22,
  cemail: 32,
  contributionAmountSent: 20,
  sponsorCode: 10,
  vestedMembers: 10
}

const balanceColumnWidth = 30
const codeColumnWidth = 6
const regularColumnWidth = (100 - balanceColumnWidth - codeColumnWidth) / (columns.length - 2)

const getColumnWidth = (columnKey: SortKey) => {
  if (columnKey === 'balance') return balanceColumnWidth
  if (columnKey === 'sponsorCode') return codeColumnWidth

  return regularColumnWidth
}

const getColumnStyle = (columnKey: SortKey) => ({ width: `${getColumnWidth(columnKey)}%` })

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

const getContributionReserveLabel = (balance: number) => {
  if (balance < 0) return 'Deficit'

  return 'Reserve'
}

const shouldShowReplenishAccountNotice = (balance: number, vestedMembers: number) =>
  balance > 0 && balance < getContributionBalanceTarget(vestedMembers)

const shouldShowNotInGoodStandingNotice = (balance: number) => balance < 0

const ContributionReserveLabel = ({ balance, vestedMembers }: { balance: number; vestedMembers: number }) => {
  if (shouldShowReplenishAccountNotice(balance, vestedMembers)) {
    return (
      <>
        LOW RESERVE<span className='normal-case'>(please replenish)</span>
      </>
    )
  }

  return getContributionReserveLabel(balance)
}

const getContributionBalanceStatusClassName = (balance: number, vestedMembers: number) => {
  if (balance >= getContributionBalanceTarget(vestedMembers)) {
    return 'bg-green-600/10 text-green-700 dark:text-green-300'
  }

  if (balance > 0) {
    return 'bg-amber-600/10 text-amber-600 dark:text-amber-600'
  }

  return 'bg-red-600/10 text-red-700 dark:text-red-300'
}

const getBalanceCardClassName = (balance: number, vestedMembers: number) => {
  if (balance >= getContributionBalanceTarget(vestedMembers)) {
    return 'border-green-200 bg-green-50 text-green-800 dark:border-green-800/70 dark:bg-green-950/40 dark:text-green-200'
  }

  if (balance > 0) {
    return 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-600'
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
    data-admin-sagicam-balance-display
    className={cn(
      'inline-flex min-w-28 flex-col items-end justify-center rounded-md border px-3 py-2 text-base font-black shadow-sm',
      getBalanceCardClassName(balance, vestedMembers),
      className
    )}
  >
    <span className='mb-1 text-[10px] leading-tight font-extrabold uppercase'>
      <ContributionReserveLabel balance={balance} vestedMembers={vestedMembers} />
    </span>
    <span className='tabular-nums'>{currencyFormatter.format(balance)}</span>
    {shouldShowNotInGoodStandingNotice(balance) ? (
      <span className='mt-1 text-right text-[10px] leading-tight font-semibold'>(Not In Good Standing)</span>
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

const SentAmountAdjustmentForm = ({
  layout = 'table',
  sponsorCode
}: {
  layout?: 'card' | 'table'
  sponsorCode: string
}) => {
  const inputId = `contribution-sent-adjustment-${sponsorCode}`

  return (
    <form
      action={adjustSponsorContributionAmountSentAction}
      className={cn('grid gap-1.5 print:hidden', layout === 'card' ? '' : 'w-20 justify-items-end')}
    >
      <input type='hidden' name='sponsorCode' value={sponsorCode} />
      <label htmlFor={inputId} className='sr-only'>
        Amount to adjust contribution sent
      </label>
      <Input
        id={inputId}
        name='amountSentAdjustment'
        type='number'
        inputMode='decimal'
        step='0.01'
        placeholder='+/- 0.00'
        className={cn(
          'bg-background text-foreground placeholder:text-muted-foreground text-center text-[11px]',
          layout === 'card' ? 'h-8 px-2 text-xs' : 'h-7 w-20 px-1.5'
        )}
        required
      />
      <Button
        type='submit'
        size='xs'
        variant='secondary'
        className={cn('justify-center px-2 text-[11px]', layout === 'card' ? 'h-8 w-full' : 'h-7 w-20')}
      >
        <ArrowUpDown className='size-3' />
        Apply
      </Button>
    </form>
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
    <form action={action} className={cn('print:hidden', layout === 'card' ? 'grid gap-1.5' : 'contents')}>
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
    <div
      data-admin-sagicam-payment-actions
      className={cn('print:hidden', layout === 'card' ? 'grid w-full shrink-0 grid-cols-2 gap-2 sm:w-56' : 'contents')}
    >
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
  const [codeSearch, setCodeSearch] = usePersistentState('sagicam:admin-sagicam-payments:code-search', '')
  const [pageSize, setPageSize] = usePersistentState('sagicam:admin-sagicam-payments:page-size', 25)
  const [currentPage, setCurrentPage] = useState(1)

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

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize))
  const effectiveCurrentPage = Math.min(currentPage, totalPages)
  const pageStartIndex = (effectiveCurrentPage - 1) * pageSize
  const pageEndIndex = Math.min(pageStartIndex + pageSize, sortedRows.length)
  const paginatedRows = sortedRows.slice(pageStartIndex, pageEndIndex)
  const showingStart = sortedRows.length > 0 ? pageStartIndex + 1 : 0

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: effectiveCurrentPage,
    paginationItemsToDisplay: 3,
    totalPages
  })

  const handleSort = (nextSortKey: SortKey) => {
    if (nextSortKey === sortKey) {
      setSortDirection(currentDirection => (currentDirection === 'asc' ? 'desc' : 'asc'))
      setCurrentPage(1)

      return
    }

    setSortKey(nextSortKey)
    setSortDirection('asc')
    setCurrentPage(1)
  }

  const handleCodeSearchChange = (nextCodeSearch: string) => {
    setCodeSearch(nextCodeSearch)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (nextPageSize: string) => {
    setPageSize(Number(nextPageSize))
    setCurrentPage(1)
  }

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  const handleExportPage = () => {
    const totalRowByKey: Partial<Record<SortKey, string | number>> = {
      amountOwed: visibleTotals.amountOwed,
      amountReceived: visibleTotals.amountReceived,
      balance: visibleTotals.balance,
      contributionAmountSent: visibleTotals.contributionAmountSent,
      sponsorCode: 'Total',
      vestedMembers: visibleTotals.vestedMembers
    }

    const worksheetRows = [
      columns.map(column => column.label),
      ...sortedRows.map(row => columns.map(column => row[column.key])),
      columns.map(column => totalRowByKey[column.key] ?? '')
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetRows)

    worksheet['!cols'] = columns.map(column => ({ wch: exportColumnWidths[column.key] ?? 16 }))

    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sagicam Contributions')
    XLSX.writeFile(workbook, `sagicam-contributions-page-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className='max-w-full min-w-0 space-y-3'>
      <div className='flex flex-wrap justify-end gap-2 print:hidden'>
        <PrintButton label='Print PDF' disabled={sortedRows.length === 0} />
        <Button type='button' size='sm' onClick={handleExportPage} disabled={sortedRows.length === 0}>
          <Download />
          Export Page
        </Button>
      </div>

      <div
        data-admin-sagicam-payments-table-card
        className='border-border max-w-full min-w-0 overflow-hidden rounded-lg border'
      >
        <div className='hidden overflow-x-auto md:block print:block print:overflow-visible'>
          <Table
            data-admin-sagicam-payments-table
            className='[[&_td]:wrap-break-word table-fixed print:min-w-0 [&_td]:whitespace-normal [&_th]:wrap-break-word [&_th]:whitespace-normal'
          >
            <colgroup>
              {columns.map(column => (
                <col key={column.key} style={getColumnStyle(column.key)} />
              ))}
            </colgroup>
            <TableHeader>
              <TableRow className='bg-background hover:bg-background print:hidden'>
                <TableHead colSpan={columns.length} className='h-auto p-3'>
                  <form role='search' onSubmit={event => event.preventDefault()} className='w-full'>
                    <label htmlFor='contribution-sponsor-code-search' className='sr-only'>
                      Search sponsor code
                    </label>
                    <Input
                      id='contribution-sponsor-code-search'
                      value={codeSearch}
                      onChange={event => handleCodeSearchChange(event.target.value)}
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
                      style={getColumnStyle(column.key)}
                      title={column.label}
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
                sortedRows.map((row, rowIndex) => {
                  const isPageVisible = rowIndex >= pageStartIndex && rowIndex < pageEndIndex

                  return (
                    <TableRow
                      key={row.sponsorCode}
                      data-page-visible={isPageVisible ? 'true' : 'false'}
                      className='odd:bg-muted/30 even:bg-background print:table-row'
                    >
                      <TableCell className='text-sm font-semibold' style={getColumnStyle('cemail')}>
                        <EmailLink email={row.cemail} className='break-all' />
                      </TableCell>
                      <TableCell style={getColumnStyle('sponsorCode')}>{row.sponsorCode}</TableCell>
                      <TableCell className='text-right font-semibold' style={getColumnStyle('vestedMembers')}>
                        {row.vestedMembers}
                      </TableCell>
                      <TableCell className='text-right font-semibold' style={getColumnStyle('amountOwed')}>
                        {currencyFormatter.format(row.amountOwed)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${
                          row.contributionAmountSent > 0 ? 'text-green-700 dark:text-green-300' : ''
                        }`}
                        style={getColumnStyle('contributionAmountSent')}
                      >
                        <div
                          data-admin-sagicam-sent-cell
                          className='grid grid-cols-[minmax(5.75rem,1fr)_auto] items-center justify-items-end gap-2'
                        >
                          <span className='tabular-nums'>{currencyFormatter.format(row.contributionAmountSent)}</span>
                          <SentAmountAdjustmentForm sponsorCode={row.sponsorCode} />
                        </div>
                      </TableCell>
                      <TableCell className='text-right font-semibold' style={getColumnStyle('amountReceived')}>
                        {currencyFormatter.format(row.amountReceived)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-center align-middle font-semibold',
                          getContributionBalanceStatusClassName(row.balance, row.vestedMembers)
                        )}
                        style={getColumnStyle('balance')}
                      >
                        <div
                          data-admin-sagicam-balance-cell
                          className='grid min-w-0 grid-cols-[auto_auto_minmax(0,1fr)] grid-rows-[auto_auto] items-center justify-items-center gap-x-2 gap-y-1'
                        >
                          <ContributionPaymentControls row={row} />
                          <span
                            data-admin-sagicam-balance-display
                            className='bg-background/80 col-start-3 row-span-2 row-start-1 flex min-w-0 flex-col items-center justify-center self-stretch justify-self-stretch rounded-md border border-current/20 px-2 py-2 text-center text-xl leading-none font-black'
                          >
                            <span className='mb-1 text-[10px] leading-tight font-extrabold uppercase'>
                              <ContributionReserveLabel balance={row.balance} vestedMembers={row.vestedMembers} />
                            </span>
                            <span className='tabular-nums'>{currencyFormatter.format(row.balance)}</span>
                            {shouldShowNotInGoodStandingNotice(row.balance) ? (
                              <span className='mt-1 text-[10px] leading-tight font-semibold'>
                                (Not In Good Standing)
                              </span>
                            ) : null}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
            {sortedRows.length > 0 && (
              <TableFooter className='bg-white text-black dark:bg-white dark:text-black'>
                <TableRow className='bg-white text-base text-black hover:bg-white dark:bg-white dark:text-black dark:hover:bg-white'>
                  <TableCell style={getColumnStyle('cemail')} />
                  <TableCell className='font-extrabold' style={getColumnStyle('sponsorCode')}>
                    Total
                  </TableCell>
                  <TableCell className='text-right font-extrabold' style={getColumnStyle('vestedMembers')}>
                    {visibleTotals.vestedMembers}
                  </TableCell>
                  <TableCell className='text-right font-extrabold' style={getColumnStyle('amountOwed')}>
                    {currencyFormatter.format(visibleTotals.amountOwed)}
                  </TableCell>
                  <TableCell className='text-right font-extrabold' style={getColumnStyle('contributionAmountSent')}>
                    {currencyFormatter.format(visibleTotals.contributionAmountSent)}
                  </TableCell>
                  <TableCell className='text-right font-extrabold' style={getColumnStyle('amountReceived')}>
                    {currencyFormatter.format(visibleTotals.amountReceived)}
                  </TableCell>
                  <TableCell className='text-right font-extrabold' style={getColumnStyle('balance')}>
                    <BalanceCard balance={visibleTotals.balance} vestedMembers={visibleTotals.vestedMembers} />
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
        <div className='grid gap-3 p-2 sm:p-3 md:hidden print:hidden'>
          <form
            role='search'
            onSubmit={event => event.preventDefault()}
            className='bg-background rounded-md border p-2'
          >
            <label htmlFor='contribution-sponsor-code-search-mobile' className='sr-only'>
              Search sponsor code
            </label>
            <Input
              id='contribution-sponsor-code-search-mobile'
              value={codeSearch}
              onChange={event => handleCodeSearchChange(event.target.value)}
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
            paginatedRows.map(row => (
              <article key={row.sponsorCode} className='bg-background overflow-hidden rounded-md border shadow-sm'>
                <div className='flex flex-col gap-3 border-b px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-4'>
                  <div className='w-full min-w-0'>
                    <div className='text-lg font-extrabold'>{row.sponsorCode}</div>
                    <EmailLink email={row.cemail} className='block text-xs font-semibold break-all' />
                  </div>
                  <ContributionPaymentControls row={row} layout='card' />
                </div>
                <div className='grid gap-2 px-3 py-3 text-sm sm:px-4'>
                  <div className='text-sm font-extrabold'>Contribution</div>
                  <MobileValue label='Vested' value={row.vestedMembers} />
                  <MobileValue label='Owed' value={currencyFormatter.format(row.amountOwed)} />
                  <SentAmountAdjustmentForm sponsorCode={row.sponsorCode} layout='card' />
                  <MobileValue
                    label='Sent'
                    value={currencyFormatter.format(row.contributionAmountSent)}
                    valueClassName={row.contributionAmountSent > 0 ? 'text-green-700 dark:text-green-300' : ''}
                  />
                  <MobileValue label='Verified' value={currencyFormatter.format(row.amountReceived)} />
                  <div className='grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start gap-2 border-t pt-3'>
                    <span className='text-muted-foreground text-xs font-semibold uppercase'>
                      <ContributionReserveLabel balance={row.balance} vestedMembers={row.vestedMembers} />
                    </span>
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
                <MobileValue
                  label='Contribution verified'
                  value={currencyFormatter.format(visibleTotals.amountReceived)}
                />
                <div className='grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start gap-2 border-t pt-3'>
                  <span className='text-xs font-semibold uppercase'>
                    <ContributionReserveLabel
                      balance={visibleTotals.balance}
                      vestedMembers={visibleTotals.vestedMembers}
                    />
                  </span>
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
        {sortedRows.length > 0 ? (
          <div className='bg-background flex flex-col gap-3 border-t px-3 py-3 lg:flex-row lg:items-center lg:justify-between print:hidden'>
            <p className='text-muted-foreground text-sm font-semibold'>
              Showing {showingStart}-{pageEndIndex} of {sortedRows.length} sponsor
              {sortedRows.length === 1 ? '' : 's'}
            </p>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end'>
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground text-sm font-semibold whitespace-nowrap'>Rows per page</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className='bg-background h-9 w-24'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map(option => (
                      <SelectItem key={option} value={option.toString()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Pagination className='mx-0 w-auto justify-start sm:justify-end'>
                <PaginationContent className='w-max flex-nowrap'>
                  <PaginationItem>
                    <Button
                      type='button'
                      variant='ghost'
                      onClick={() => handlePageChange(effectiveCurrentPage - 1)}
                      disabled={effectiveCurrentPage === 1}
                      className='disabled:pointer-events-none disabled:opacity-50'
                      aria-label='Go to previous page'
                    >
                      <ChevronLeftIcon className='size-4' />
                      <span className='hidden sm:inline'>Previous</span>
                    </Button>
                  </PaginationItem>

                  {showLeftEllipsis ? (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : null}

                  {pages.map(page => {
                    const isActive = page === effectiveCurrentPage

                    return (
                      <PaginationItem key={page}>
                        <Button
                          type='button'
                          size='icon'
                          variant={isActive ? 'default' : 'outline'}
                          onClick={() => handlePageChange(page)}
                          aria-current={isActive ? 'page' : undefined}
                          aria-label={`Go to page ${page}`}
                        >
                          {page}
                        </Button>
                      </PaginationItem>
                    )
                  })}

                  {showRightEllipsis ? (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : null}

                  <PaginationItem>
                    <Button
                      type='button'
                      variant='ghost'
                      onClick={() => handlePageChange(effectiveCurrentPage + 1)}
                      disabled={effectiveCurrentPage === totalPages}
                      className='disabled:pointer-events-none disabled:opacity-50'
                      aria-label='Go to next page'
                    >
                      <span className='hidden sm:inline'>Next</span>
                      <ChevronRightIcon className='size-4' />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default AdminSagicamPaymentsTable
