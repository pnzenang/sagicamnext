'use client'

import { useMemo, useState } from 'react'

import { ArrowDown, ArrowUp, ArrowUpDown, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'

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

  const handleExport = () => {
    const worksheetRows = [
      columns.map(column => column.label),
      ...sortedRows.map(row => columns.map(column => row[column.key])),
      ['Total', '', '', totals.vested, totals.pending, totals.delinquent, totals.awaiting, totals.total]
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetRows)

    worksheet['!cols'] = adminCountColumnWidths.map(width => ({ wch: Math.max(10, Math.round(width * 1.5)) }))

    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Admin Count')
    XLSX.writeFile(workbook, 'admin-count.xlsx')
  }

  return (
    <div className='max-w-full min-w-0 space-y-3'>
      <div className='flex justify-end'>
        <Button type='button' size='sm' onClick={handleExport} disabled={sortedRows.length === 0}>
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
                    No members found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedRows.map(row => (
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
                  <TableCell className='text-right font-extrabold'>{totals.vested}</TableCell>
                  <TableCell className='text-right font-extrabold'>{totals.pending}</TableCell>
                  <TableCell className='text-right font-extrabold'>{totals.delinquent}</TableCell>
                  <TableCell className='text-right font-extrabold'>{totals.awaiting}</TableCell>
                  <TableCell className='text-right text-lg font-extrabold'>{totals.total}</TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
        <div className='grid gap-3 p-2 sm:p-3 md:hidden'>
          {sortedRows.length === 0 ? (
            <div className='text-muted-foreground rounded-md border px-3 py-8 text-center text-sm sm:px-4 sm:py-10'>
              No members found.
            </div>
          ) : (
            sortedRows.map(row => (
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
                <MobileCountValue label='Vested' value={totals.vested} />
                <MobileCountValue label='Pending' value={totals.pending} />
                <MobileCountValue label='Delinquent' value={totals.delinquent} />
                <MobileCountValue label='Awaiting' value={totals.awaiting} />
              </div>
              <div className='mt-3 flex items-center justify-between rounded-md bg-white px-3 py-2 text-black'>
                <span className='text-xs font-semibold uppercase'>All members</span>
                <span className='text-xl font-extrabold tabular-nums'>{totals.total}</span>
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminCountTable
