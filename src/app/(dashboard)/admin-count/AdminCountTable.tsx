'use client'

import { useMemo, useState } from 'react'

import { ArrowDown, ArrowUp, ArrowUpDown, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export type AdminCountRow = {
  sponsorName: string
  sponsorEmail: string
  sponsorPhoneNumber: string
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
}

const columns: AdminCountColumn[] = [
  { key: 'sponsorName', label: 'Sponsor name' },
  { key: 'sponsorEmail', label: 'Sponsor email' },
  { key: 'sponsorPhoneNumber', label: 'Telephone' },
  { key: 'sponsorCode', label: 'Code' },
  { key: 'vested', label: 'Vested', align: 'right' },
  { key: 'pending', label: 'Pending', align: 'right' },
  { key: 'delinquent', label: 'Delinquent', align: 'right' },
  { key: 'awaiting', label: 'Awaiting', align: 'right' },
  { key: 'total', label: 'Total', align: 'right' }
]

const adminCountColumnWidths = [20, 20, 15, 5, ...Array.from({ length: 5 }, () => 8)]

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
      ['Total', '', '', '', totals.vested, totals.pending, totals.delinquent, totals.awaiting, totals.total]
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetRows)

    worksheet['!cols'] = adminCountColumnWidths.map(width => ({ wch: Math.max(10, Math.round(width * 1.5)) }))

    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Admin Count')
    XLSX.writeFile(workbook, 'admin-count.xlsx')
  }

  return (
    <div className='space-y-3'>
      <div className='flex justify-end'>
        <Button type='button' size='sm' onClick={handleExport} disabled={sortedRows.length === 0}>
          <Download />
          Export
        </Button>
      </div>

      <div className='border-border overflow-hidden rounded-lg border'>
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
                    className='text-primary-foreground'
                    aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <button
                      type='button'
                      className={`flex w-full items-center gap-1.5 text-left font-semibold ${column.align === 'right' ? 'justify-end text-right' : 'justify-start'}`}
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
                  <TableCell className='font-medium'>{row.sponsorName}</TableCell>
                  <TableCell>
                    {row.sponsorEmail && (
                      <a
                        className='text-primary underline-offset-4 hover:underline'
                        href={`mailto:${row.sponsorEmail}`}
                      >
                        {row.sponsorEmail}
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.sponsorPhoneNumber && (
                      <a
                        className='text-primary underline-offset-4 hover:underline'
                        href={`tel:${row.sponsorPhoneNumber}`}
                      >
                        {row.sponsorPhoneNumber}
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
                <TableCell className='font-extrabold'>Total</TableCell>
                <TableCell className='font-extrabold' />
                <TableCell className='font-extrabold' />
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
    </div>
  )
}

export default AdminCountTable
