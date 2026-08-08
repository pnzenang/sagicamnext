'use client'

import { useMemo, useState } from 'react'

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileSpreadsheetIcon,
  PrinterIcon,
  SearchIcon
} from 'lucide-react'
import * as XLSX from 'xlsx'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePagination } from '@/hooks/use-pagination'
import { usePersistentState } from '@/hooks/use-persistent-state'

export type NewAdditionRow = {
  firstName: string
  id: string
  lastAndMiddleNames: string
  memberMatriculationNumber: string
  sponsorCode: string
  vestedAt: string
}

type SortKey = keyof NewAdditionRow
type SortDirection = 'asc' | 'desc'

type NewAdditionColumn = {
  key: SortKey
  label: string
  width: number
}

const columns: NewAdditionColumn[] = [
  { key: 'sponsorCode', label: 'Code', width: 8 },
  { key: 'memberMatriculationNumber', label: 'Matriculation', width: 14 },
  { key: 'firstName', label: 'First name', width: 15 },
  { key: 'lastAndMiddleNames', label: 'Last and middle names', width: 32 },
  { key: 'vestedAt', label: 'Vested date', width: 26 }
]

const selectionColumnWidth = 5
const pageSizeOptions = [10, 25, 50, 100]

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
})

const getSortIcon = (isActive: boolean, direction: SortDirection) => {
  if (!isActive) return <ArrowUpDown className='size-3.5' />

  return direction === 'asc' ? <ArrowUp className='size-3.5' /> : <ArrowDown className='size-3.5' />
}

const compareValues = (firstValue: NewAdditionRow[SortKey], secondValue: NewAdditionRow[SortKey]) =>
  String(firstValue).localeCompare(String(secondValue), undefined, {
    numeric: true,
    sensitivity: 'base'
  })

const formatDate = (date: string) => dateFormatter.format(new Date(date))

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const getWorksheetRows = (exportRows: NewAdditionRow[]) => [
  columns.map(column => column.label),
  ...exportRows.map(row => [
    row.sponsorCode,
    row.memberMatriculationNumber,
    row.firstName,
    row.lastAndMiddleNames,
    formatDate(row.vestedAt)
  ])
]

const getPrintableDocument = ({
  generatedAt,
  printRows,
  title
}: {
  generatedAt: string
  printRows: NewAdditionRow[]
  title: string
}) => {
  const headerCells = columns.map(column => `<th>${escapeHtml(column.label)}</th>`).join('')

  const bodyRows = printRows
    .map(
      row => `
        <tr>
          <td>${escapeHtml(row.sponsorCode)}</td>
          <td>${escapeHtml(row.memberMatriculationNumber)}</td>
          <td>${escapeHtml(row.firstName)}</td>
          <td>${escapeHtml(row.lastAndMiddleNames)}</td>
          <td>${escapeHtml(formatDate(row.vestedAt))}</td>
        </tr>
      `
    )
    .join('')

  return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          @page { size: landscape; margin: 0.45in; }
          * { box-sizing: border-box; }
          body { color: #111827; font-family: Arial, Helvetica, sans-serif; font-size: 11px; margin: 0; }
          h1 { font-size: 20px; margin: 0 0 6px; }
          p { margin: 0 0 14px; }
          table { border-collapse: collapse; table-layout: fixed; width: 100%; }
          th, td { border: 1px solid #d1d5db; padding: 7px 8px; text-align: left; vertical-align: top; word-break: break-word; }
          th { background: #e5e7eb; font-weight: 700; }
          tbody tr:nth-child(even) { background: #f9fafb; }
          .meta { color: #4b5563; font-size: 10px; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p class="meta">${printRows.length} loved one${printRows.length === 1 ? '' : 's'} | Generated ${escapeHtml(
          generatedAt
        )}</p>
        <table>
          <thead>
            <tr>${headerCells}</tr>
          </thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </body>
    </html>`
}

const MobileValue = ({ label, value }: { label: string; value: string }) => (
  <div className='grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start gap-2'>
    <span className='text-muted-foreground min-w-0 text-xs leading-snug font-semibold uppercase'>{label}</span>
    <span className='min-w-0 justify-self-end text-right text-sm leading-snug font-semibold break-words'>
      {value}
    </span>
  </div>
)

const NewAdditionsTable = ({ monthKey, rows }: { monthKey: string; rows: NewAdditionRow[] }) => {
  const [sortKey, setSortKey] = useState<SortKey>('vestedAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [search, setSearch] = usePersistentState(`sagicam:new-additions:${monthKey}:search`, '')
  const [pageSize, setPageSize] = usePersistentState('sagicam:new-additions:page-size', 25)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({})

  const normalizedSearch = search.trim().toLowerCase()

  const filteredRows = useMemo(() => {
    if (!normalizedSearch) return rows

    return rows.filter(row =>
      [row.sponsorCode, row.memberMatriculationNumber, row.firstName, row.lastAndMiddleNames]
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

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize))
  const effectiveCurrentPage = Math.min(currentPage, totalPages)
  const pageStartIndex = (effectiveCurrentPage - 1) * pageSize
  const pageEndIndex = Math.min(pageStartIndex + pageSize, sortedRows.length)
  const paginatedRows = sortedRows.slice(pageStartIndex, pageEndIndex)
  const showingStart = sortedRows.length > 0 ? pageStartIndex + 1 : 0
  const selectedRows = sortedRows.filter(row => selectedRowIds[row.id])
  const selectedPageRowsCount = paginatedRows.filter(row => selectedRowIds[row.id]).length
  const areAllPageRowsSelected = paginatedRows.length > 0 && selectedPageRowsCount === paginatedRows.length
  const areSomePageRowsSelected = selectedPageRowsCount > 0 && !areAllPageRowsSelected

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
    setSortDirection(nextSortKey === 'vestedAt' ? 'desc' : 'asc')
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

  const handleRowSelectionChange = (rowId: string, selected: boolean) => {
    setSelectedRowIds(currentSelection => {
      const nextSelection = { ...currentSelection }

      if (selected) {
        nextSelection[rowId] = true
      } else {
        delete nextSelection[rowId]
      }

      return nextSelection
    })
  }

  const handlePageSelectionChange = (selected: boolean) => {
    setSelectedRowIds(currentSelection => {
      const nextSelection = { ...currentSelection }

      paginatedRows.forEach(row => {
        if (selected) {
          nextSelection[row.id] = true
        } else {
          delete nextSelection[row.id]
        }
      })

      return nextSelection
    })
  }

  const handleExportRows = (exportRows: NewAdditionRow[], fileScope: string) => {
    const worksheet = XLSX.utils.aoa_to_sheet(getWorksheetRows(exportRows))

    worksheet['!cols'] = [{ wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 28 }, { wch: 16 }]

    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'New Additions')
    XLSX.writeFile(workbook, `new-additions-${monthKey}-${fileScope}-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleExportFilteredRows = () => {
    handleExportRows(sortedRows, 'filtered')
  }

  const handleExportSelectedRows = () => {
    handleExportRows(selectedRows, 'selected')
  }

  const handlePrintRows = (printRows: NewAdditionRow[], title: string) => {
    const printWindow = window.open('', '_blank', 'width=1100,height=800')

    if (!printWindow) return

    printWindow.document.write(
      getPrintableDocument({
        generatedAt: new Date().toLocaleString(),
        printRows,
        title
      })
    )
    printWindow.document.close()
    printWindow.focus()
    window.setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const handlePrintFilteredRows = () => {
    handlePrintRows(sortedRows, `New Additions - ${monthKey}`)
  }

  const handlePrintSelectedRows = () => {
    handlePrintRows(selectedRows, `Selected New Additions - ${monthKey}`)
  }

  return (
    <div className='max-w-full min-w-0 space-y-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <form role='search' onSubmit={event => event.preventDefault()} className='min-w-0 flex-1'>
          <label htmlFor='new-additions-search' className='sr-only'>
            Search new additions
          </label>
          <div className='relative'>
            <Input
              id='new-additions-search'
              value={search}
              onChange={event => handleSearchChange(event.target.value)}
              placeholder='Search code, matriculation, first name, or last/middle name'
              className='bg-background h-10 w-full pr-3 pl-9 text-sm font-semibold'
            />
            <SearchIcon
              aria-hidden='true'
              className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2'
            />
          </div>
        </form>
        <div className='flex flex-wrap items-center gap-2'>
          <Badge variant='outline' className='h-10 w-fit rounded-md px-3 text-sm font-semibold'>
            {sortedRows.length} vested
          </Badge>
          {selectedRows.length > 0 ? (
            <Badge variant='secondary' className='h-10 w-fit rounded-md px-3 text-sm font-semibold'>
              {selectedRows.length} selected
            </Badge>
          ) : null}
          <Button
            type='button'
            className='h-10'
            onClick={handleExportFilteredRows}
            disabled={sortedRows.length === 0}
          >
            <FileSpreadsheetIcon />
            Export Page
          </Button>
          <Button
            type='button'
            className='h-10'
            onClick={handleExportSelectedRows}
            disabled={selectedRows.length === 0}
          >
            <FileSpreadsheetIcon />
            Export Selected
          </Button>
          <Button
            type='button'
            className='h-10'
            onClick={handlePrintFilteredRows}
            disabled={sortedRows.length === 0}
          >
            <PrinterIcon />
            Print PDF
          </Button>
          <Button
            type='button'
            className='h-10'
            onClick={handlePrintSelectedRows}
            disabled={selectedRows.length === 0}
          >
            <PrinterIcon />
            Print Selected
          </Button>
        </div>
      </div>

      <div className='border-border max-w-full min-w-0 overflow-hidden rounded-lg border'>
        <div className='hidden overflow-x-auto md:block'>
          <Table className='[[&_td]:wrap-break-word table-fixed [&_td]:whitespace-normal [&_th]:wrap-break-word [&_th]:whitespace-normal'>
            <colgroup>
              <col style={{ width: `${selectionColumnWidth}%` }} />
              {columns.map(column => (
                <col key={column.key} style={{ width: `${column.width}%` }} />
              ))}
            </colgroup>
            <TableHeader>
              <TableRow className='bg-primary hover:bg-primary'>
                <TableHead className='text-primary-foreground' title='Select'>
                  <Checkbox
                    aria-label='Select all visible new additions'
                    checked={areAllPageRowsSelected || (areSomePageRowsSelected && 'indeterminate')}
                    onCheckedChange={value => handlePageSelectionChange(Boolean(value))}
                  />
                </TableHead>
                {columns.map(column => {
                  const isActive = sortKey === column.key

                  return (
                    <TableHead
                      key={column.key}
                      className='text-primary-foreground'
                      title={column.label}
                      aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      <button
                        type='button'
                        className='flex w-full items-center gap-1.5 text-left font-semibold'
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
                  <TableCell colSpan={columns.length + 1} className='text-muted-foreground h-24 text-center'>
                    {normalizedSearch
                      ? `No vested loved one matching "${search.trim()}" found.`
                      : 'No loved ones vested this month.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={selectedRowIds[row.id] ? 'selected' : undefined}
                    className='odd:bg-background even:bg-muted/45 hover:bg-primary/10 data-[state=selected]:bg-primary/15'
                  >
                    <TableCell>
                      <Checkbox
                        aria-label={`Select ${row.firstName} ${row.lastAndMiddleNames}`}
                        checked={Boolean(selectedRowIds[row.id])}
                        onCheckedChange={value => handleRowSelectionChange(row.id, Boolean(value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant='secondary' className='rounded-md font-mono'>
                        {row.sponsorCode}
                      </Badge>
                    </TableCell>
                    <TableCell className='font-mono text-sm'>{row.memberMatriculationNumber}</TableCell>
                    <TableCell className='font-semibold'>{row.firstName}</TableCell>
                    <TableCell className='font-semibold'>{row.lastAndMiddleNames}</TableCell>
                    <TableCell className='font-semibold whitespace-nowrap'>{formatDate(row.vestedAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className='grid gap-3 p-2 sm:p-3 md:hidden'>
          {sortedRows.length === 0 ? (
            <div className='text-muted-foreground rounded-md border px-3 py-8 text-center text-sm sm:px-4 sm:py-10'>
              {normalizedSearch
                ? `No vested loved one matching "${search.trim()}" found.`
                : 'No loved ones vested this month.'}
            </div>
          ) : (
            paginatedRows.map((row, rowIndex) => (
              <article
                key={row.id}
                className={`overflow-hidden rounded-md border p-3 shadow-sm sm:p-4 ${
                  rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/45'
                }`}
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex min-w-0 items-start gap-3'>
                    <Checkbox
                      aria-label={`Select ${row.firstName} ${row.lastAndMiddleNames}`}
                      checked={Boolean(selectedRowIds[row.id])}
                      onCheckedChange={value => handleRowSelectionChange(row.id, Boolean(value))}
                      className='mt-1'
                    />
                    <div className='min-w-0'>
                      <div className='text-base font-extrabold break-words'>
                        {row.firstName} {row.lastAndMiddleNames}
                      </div>
                      <div className='text-muted-foreground mt-1 text-xs font-semibold break-words'>
                        {row.memberMatriculationNumber}
                      </div>
                    </div>
                  </div>
                  <Badge variant='secondary' className='shrink-0 rounded-md font-mono'>
                    {row.sponsorCode}
                  </Badge>
                </div>
                <div className='mt-4 grid gap-3'>
                  <MobileValue label='First name' value={row.firstName} />
                  <MobileValue label='Last and middle names' value={row.lastAndMiddleNames} />
                  <MobileValue label='Matriculation' value={row.memberMatriculationNumber} />
                  <MobileValue label='Vested date' value={formatDate(row.vestedAt)} />
                </div>
              </article>
            ))
          )}
        </div>

        {sortedRows.length > 0 ? (
          <div className='bg-background flex flex-col gap-3 border-t px-3 py-3 lg:flex-row lg:items-center lg:justify-between'>
            <p className='text-muted-foreground text-sm font-semibold'>
              Showing {showingStart}-{pageEndIndex} of {sortedRows.length} vested loved one
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

export default NewAdditionsTable
