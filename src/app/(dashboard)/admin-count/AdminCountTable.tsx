'use client'

import { useMemo, useState } from 'react'

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeftIcon, ChevronRightIcon, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePagination } from '@/hooks/use-pagination'
import { usePersistentState } from '@/hooks/use-persistent-state'

export type AdminCountRow = {
  sponsorName: string
  sponsorEmail: string
  sponsorCode: string
  vested: number
  pending: number
  delinquent: number
  awaiting: number
  total: number
}

export type AdminCountTotals = Pick<AdminCountRow, 'vested' | 'pending' | 'delinquent' | 'awaiting' | 'total'>

type SortKey = keyof AdminCountRow
type SortDirection = 'asc' | 'desc'

type AdminCountColumn = {
  key: SortKey
  label: string
  align?: 'left' | 'right'
  className?: string
}

const columns: AdminCountColumn[] = [
  { key: 'sponsorName', label: 'Sponsor name', className: 'hidden md:table-cell' },
  { key: 'sponsorEmail', label: 'Sponsor email', className: 'hidden md:table-cell' },
  { key: 'sponsorCode', label: 'Code' },
  { key: 'vested', label: 'Vested', align: 'right' },
  { key: 'pending', label: 'Pending', align: 'right' },
  { key: 'delinquent', label: 'Delinquent', align: 'right' },
  { key: 'awaiting', label: 'Awaiting', align: 'right' },
  { key: 'total', label: 'Total', align: 'right' }
]

const pageSizeOptions = [10, 25, 50, 100]

const fixedLeftColumnCount = 2
const fixedLeftColumnWidth = 20

const flexibleColumnWidth =
  (100 - fixedLeftColumnCount * fixedLeftColumnWidth) / (columns.length - fixedLeftColumnCount)

const adminCountColumnWidths = columns.map((_, index) =>
  index < fixedLeftColumnCount ? fixedLeftColumnWidth : flexibleColumnWidth
)

const getSortIcon = (isActive: boolean, direction: SortDirection) => {
  if (!isActive) return <ArrowUpDown className='size-3.5' />

  return direction === 'asc' ? <ArrowUp className='size-3.5' /> : <ArrowDown className='size-3.5' />
}

const compareValues = (firstValue: AdminCountRow[SortKey], secondValue: AdminCountRow[SortKey]) => {
  if (typeof firstValue === 'number' && typeof secondValue === 'number') {
    return firstValue - secondValue
  }

  return String(firstValue).localeCompare(String(secondValue), undefined, {
    numeric: true,
    sensitivity: 'base'
  })
}

const MobileCountValue = ({ label, value }: { label: string; value: number }) => (
  <div className='grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-center gap-2 rounded-md border px-3 py-2'>
    <div className='min-w-0 text-[11px] leading-tight font-semibold break-words uppercase opacity-80'>{label}</div>
    <div className='min-w-0 justify-self-end text-right text-lg leading-none font-extrabold break-words tabular-nums'>
      {value}
    </div>
  </div>
)

const AdminCountTable = ({ rows, totals }: { rows: AdminCountRow[]; totals: AdminCountTotals }) => {
  const [sortKey, setSortKey] = useState<SortKey>('sponsorName')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [search, setSearch] = usePersistentState('sagicam:admin-count:search', '')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const normalizedSearch = search.trim().toLowerCase()

  const filteredRows = useMemo(() => {
    if (!normalizedSearch) return rows

    return rows.filter(row =>
      [row.sponsorName, row.sponsorEmail, row.sponsorCode].join(' ').toLowerCase().includes(normalizedSearch)
    )
  }, [normalizedSearch, rows])

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((firstRow, secondRow) => {
      const comparison = compareValues(firstRow[sortKey], secondRow[sortKey])

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredRows, sortDirection, sortKey])

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

  const visibleTotals = useMemo<AdminCountTotals>(() => {
    if (!normalizedSearch) return totals

    return filteredRows.reduce(
      (currentTotals, row) => {
        currentTotals.vested += row.vested
        currentTotals.pending += row.pending
        currentTotals.delinquent += row.delinquent
        currentTotals.awaiting += row.awaiting
        currentTotals.total += row.total

        return currentTotals
      },
      {
        awaiting: 0,
        delinquent: 0,
        pending: 0,
        total: 0,
        vested: 0
      }
    )
  }, [filteredRows, normalizedSearch, totals])

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

  const handleSearchChange = (nextSearch: string) => {
    setSearch(nextSearch)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (nextPageSize: string) => {
    setPageSize(Number(nextPageSize))
    setCurrentPage(1)
  }

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  const handleExport = () => {
    const worksheetRows = [
      columns.map(column => column.label),
      ...sortedRows.map(row => columns.map(column => row[column.key])),
      [
        'Total',
        '',
        '',
        visibleTotals.vested,
        visibleTotals.pending,
        visibleTotals.delinquent,
        visibleTotals.awaiting,
        visibleTotals.total
      ]
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetRows)

    worksheet['!cols'] = adminCountColumnWidths.map(width => ({ wch: Math.max(10, Math.round(width * 1.5)) }))

    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Admin Count')
    XLSX.writeFile(workbook, 'admin-count.xlsx')
  }

  return (
    <div className='max-w-full min-w-0 space-y-3'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <form role='search' onSubmit={event => event.preventDefault()} className='min-w-0 flex-1'>
          <label htmlFor='admin-count-search' className='sr-only'>
            Search admin count
          </label>
          <Input
            id='admin-count-search'
            value={search}
            onChange={event => handleSearchChange(event.target.value)}
            placeholder='Search sponsor name, email, or code'
            className='bg-background h-10 w-full text-sm font-semibold'
          />
        </form>
        <Button type='button' size='sm' className='h-10' onClick={handleExport} disabled={sortedRows.length === 0}>
          <Download />
          Export
        </Button>
      </div>

      <div className='border-border max-w-full min-w-0 overflow-hidden rounded-lg border'>
        <div className='hidden overflow-x-auto md:block'>
          <Table className='[[&_td]:wrap-break-word table-fixed [&_td]:whitespace-normal [&_th]:wrap-break-word [&_th]:whitespace-normal'>
            <colgroup>
              {adminCountColumnWidths.map((width, index) => (
                <col key={index} style={{ width: `${width}%` }} />
              ))}
            </colgroup>
            <TableHeader>
              <TableRow className='bg-primary hover:bg-primary'>
                {columns.map(column => {
                  const isActive = sortKey === column.key

                  return (
                    <TableHead
                      key={column.key}
                      className={`text-primary-foreground ${column.className ?? ''}`}
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
                  <TableCell colSpan={adminCountColumnWidths.length} className='text-muted-foreground h-24 text-center'>
                    {normalizedSearch ? `No sponsor matching "${search.trim()}" found.` : 'No members found.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map(row => (
                  <TableRow key={row.sponsorCode} className='odd:bg-muted/30 even:bg-background'>
                    <TableCell className='hidden font-medium md:table-cell'>{row.sponsorName}</TableCell>
                    <TableCell className='hidden md:table-cell'>
                      {row.sponsorEmail && (
                        <a
                          className='text-primary underline-offset-4 hover:underline'
                          href={`mailto:${row.sponsorEmail}`}
                        >
                          {row.sponsorEmail}
                        </a>
                      )}
                    </TableCell>
                    <TableCell>{row.sponsorCode}</TableCell>
                    <TableCell className='text-right font-semibold'>{row.vested}</TableCell>
                    <TableCell className='text-right font-semibold'>{row.pending}</TableCell>
                    <TableCell className='text-right font-semibold'>{row.delinquent}</TableCell>
                    <TableCell className='text-right font-semibold'>{row.awaiting}</TableCell>
                    <TableCell className='text-right text-base font-extrabold'>{row.total}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {sortedRows.length > 0 && (
              <TableFooter>
                <TableRow className='text-base'>
                  <TableCell className='hidden font-extrabold md:table-cell'>Total</TableCell>
                  <TableCell className='hidden font-extrabold md:table-cell' />
                  <TableCell className='font-extrabold' />
                  <TableCell className='text-right font-extrabold'>{visibleTotals.vested}</TableCell>
                  <TableCell className='text-right font-extrabold'>{visibleTotals.pending}</TableCell>
                  <TableCell className='text-right font-extrabold'>{visibleTotals.delinquent}</TableCell>
                  <TableCell className='text-right font-extrabold'>{visibleTotals.awaiting}</TableCell>
                  <TableCell className='text-right text-lg font-extrabold'>{visibleTotals.total}</TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
        <div className='grid gap-3 p-2 sm:p-3 md:hidden'>
          {sortedRows.length === 0 ? (
            <div className='text-muted-foreground rounded-md border px-3 py-8 text-center text-sm sm:px-4 sm:py-10'>
              {normalizedSearch ? `No sponsor matching "${search.trim()}" found.` : 'No members found.'}
            </div>
          ) : (
            paginatedRows.map(row => (
              <article
                key={row.sponsorCode}
                className='bg-background overflow-hidden rounded-md border p-3 shadow-sm sm:p-4'
              >
                <div className='flex items-start justify-between gap-4'>
                  <div className='min-w-0'>
                    <div className='text-base font-extrabold break-words'>{row.sponsorName || row.sponsorCode}</div>
                    <div className='text-muted-foreground mt-1 text-xs font-semibold'>{row.sponsorCode}</div>
                  </div>
                  <div className='shrink-0 text-right text-2xl leading-none font-extrabold tabular-nums'>
                    {row.total}
                  </div>
                </div>
                <div className='mt-3 grid gap-1 text-sm'>
                  {row.sponsorEmail && (
                    <a
                      className='text-primary break-words underline-offset-4 hover:underline'
                      href={`mailto:${row.sponsorEmail}`}
                    >
                      {row.sponsorEmail}
                    </a>
                  )}
                </div>
                <div className='mt-4 grid gap-2'>
                  <MobileCountValue label='Vested' value={row.vested} />
                  <MobileCountValue label='Pending' value={row.pending} />
                  <MobileCountValue label='Delinquent' value={row.delinquent} />
                  <MobileCountValue label='Awaiting' value={row.awaiting} />
                </div>
              </article>
            ))
          )}
          {sortedRows.length > 0 && (
            <article className='bg-primary text-primary-foreground overflow-hidden rounded-md p-3 shadow-sm sm:p-4'>
              <div className='mb-3 text-base font-extrabold'>Total</div>
              <div className='grid gap-2'>
                <MobileCountValue label='Vested' value={visibleTotals.vested} />
                <MobileCountValue label='Pending' value={visibleTotals.pending} />
                <MobileCountValue label='Delinquent' value={visibleTotals.delinquent} />
                <MobileCountValue label='Awaiting' value={visibleTotals.awaiting} />
              </div>
              <div className='mt-3 flex items-center justify-between rounded-md bg-white px-3 py-2 text-black'>
                <span className='text-xs font-semibold uppercase'>All members</span>
                <span className='text-xl font-extrabold tabular-nums'>{visibleTotals.total}</span>
              </div>
            </article>
          )}
        </div>

        {sortedRows.length > 0 ? (
          <div className='bg-background flex flex-col gap-3 border-t px-3 py-3 lg:flex-row lg:items-center lg:justify-between'>
            <p className='text-muted-foreground text-sm font-semibold'>
              Showing {showingStart}-{pageEndIndex} of {sortedRows.length} sponsor(s)
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

export default AdminCountTable
