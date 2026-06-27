'use client'
import { useId, useMemo, useState } from 'react'

import day from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

day.extend(advancedFormat)

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  FileSpreadsheetIcon,
  FileTextIcon,
  SearchIcon,
  UploadIcon
} from 'lucide-react'

import type { Column, ColumnDef, ColumnFiltersState, PaginationState, RowData } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getPaginationRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { usePagination } from '@/hooks/use-pagination'
import { usePersistentState } from '@/hooks/use-persistent-state'

import DeceasedSummaryCards, { type DeceasedSummary } from '@/components/dashboard/DeceasedSummaryCards'
import ResponsiveTableCards from '@/components/dashboard/ResponsiveTableCards'
import { TablePaginationControls } from '@/components/dashboard/TablePaginationControls'
import { cn } from '@/lib/utils'

import { type DeceasedMemberType } from '@/utils/types'
import RestoreDeceasedMemberButton from '@/components/global/RestoreDeceasedMemberButton'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
  }
}

const columns: ColumnDef<DeceasedMemberType>[] = [
  {
    header: 'Last Names',
    accessorKey: 'lastAndMiddleNames',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <div className='flex flex-col'>
          <span className='font-medium'>{row.getValue('lastAndMiddleNames')}</span>
        </div>
      </div>
    ),
    size: 150
  },
  {
    header: 'First Name',
    accessorKey: 'firstName',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <div className='flex flex-col'>
          <span className='font-medium'>{row.getValue('firstName')}</span>
        </div>
      </div>
    )
  },

  {
    header: 'Matriculation',
    accessorKey: 'memberMatriculationNumber',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <div className='flex flex-col'>
          <span className='font-medium'>{row.getValue('memberMatriculationNumber')}</span>
        </div>
      </div>
    ),
    size: 150
  },
  {
    header: 'Code',
    accessorKey: 'sponsorCode',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <div className='flex flex-col'>
          <span className='font-medium'>{row.getValue('sponsorCode')}</span>
        </div>
      </div>
    ),
    size: 120
  },

  {
    header: 'Place of Death (State)',
    accessorKey: 'placeOfDeath',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <div className='flex flex-col'>
          <span className='font-medium'>{row.getValue('placeOfDeath')}</span>
        </div>
      </div>
    ),
    size: 150
  },

  {
    accessorKey: 'registrationDate', // The key in your data object
    header: 'Registration Date',
    cell: ({ row }) => {
      const field = row.getValue('registrationDate') as string
      const fieldDate = new Date(field)

      const formattedRegistrationDate = day(fieldDate).format('MMM D, YYYY')

      return <div>{formattedRegistrationDate}</div>
    },
    size: 150
  },
  {
    accessorKey: 'dateOfDeath', // The key in your data object
    header: 'Date of Death',
    cell: ({ row }) => {
      const field = row.getValue('dateOfDeath') as string
      const fieldDate = new Date(field)

      const formattedDateOfDeath = day(fieldDate).format('MMM D, YYYY')

      return <div>{formattedDateOfDeath}</div>
    },
    size: 150
  },
  {
    accessorKey: 'createdAt', // The key in your data object
    header: 'Date Announced',
    cell: ({ row }) => {
      const field = row.getValue('createdAt') as Date

      const formattedAnnouncementDate = day(field).format('MMM D, YYYY')

      return <div>{formattedAnnouncementDate}</div>
    },
    size: 150
  },
  {
    header: 'contribution status',
    accessorKey: 'contributionStatus',
    cell: ({ row }) => {
      const contributionStatus = row.getValue('contributionStatus') as string

      const styles = {
        Received_And_In_Review:
          'bg-amber-600/10 text-amber-600 focus-visible:ring-amber-600/20 dark:bg-amber-600/10 dark:text-amber-600 dark:focus-visible:ring-amber-600/40 [a&]:hover:bg-amber-600/5 dark:[a&]:hover:bg-amber-600/5',
        Contribution_Denied:
          'bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/10 dark:text-destructive dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/5 dark:[a&]:hover:bg-destructive/5',
        Contribution_Underway:
          'bg-blue-600/10 text-blue-600 focus-visible:ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40 [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5',
        Contribution_Completed:
          'bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'
      }[contributionStatus]

      return (
        <Badge className={cn('rounded-sm border-none capitalize focus-visible:outline-none', styles)}>
          {row.getValue('contributionStatus')}
        </Badge>
      )
    },
    meta: {
      filterVariant: 'select'
    },
    size: 100
  },
  {
    header: 'Actions',
    accessorKey: 'id',
    cell: ({ row: { original } }) => <RowActions deceasedMember={original} />,
    size: 20
  }
]

const DeceasedMembersDataTable = ({
  data,
  deceasedSummary
}: {
  data: DeceasedMemberType[]
  deceasedSummary: DeceasedSummary
}) => {
  const [columnFilters, setColumnFilters] = usePersistentState<ColumnFiltersState>(
    'sagicam:deceased-members:column-filters',
    []
  )

  const pageSize = 100

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      pagination
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination
  })

  const exportToCSV = () => {
    const selectedRows = table.getSelectedRowModel().rows

    const dataToExport =
      selectedRows.length > 0
        ? selectedRows.map(row => row.original)
        : table.getFilteredRowModel().rows.map(row => row.original)

    const csv = Papa.unparse(dataToExport, {
      header: true
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `payments-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToExcel = () => {
    const selectedRows = table.getSelectedRowModel().rows

    const dataToExport =
      selectedRows.length > 0
        ? selectedRows.map(row => row.original)
        : table.getFilteredRowModel().rows.map(row => row.original)

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments')

    const cols = [{ wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 15 }]

    worksheet['!cols'] = cols

    XLSX.writeFile(workbook, `payments-export-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportCurrentPageToExcel = () => {
    const dataToExport = table.getRowModel().rows.map(row => {
      const deceasedMember = row.original

      return {
        Code: deceasedMember.sponsorCode,
        Matriculation: deceasedMember.memberMatriculationNumber,
        'Last Names': deceasedMember.lastAndMiddleNames,
        'First Name': deceasedMember.firstName,
        'Place of Death': deceasedMember.placeOfDeath,
        'Registration Date': day(deceasedMember.registrationDate).format('MMM D, YYYY'),
        'Date of Death': day(deceasedMember.dateOfDeath).format('MMM D, YYYY'),
        'Date Announced': day(deceasedMember.createdAt).format('MMM D, YYYY'),
        'Contribution Status': deceasedMember.contributionStatus
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deceased Members')

    worksheet['!cols'] = [
      { wch: 14 },
      { wch: 18 },
      { wch: 24 },
      { wch: 18 },
      { wch: 24 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 28 }
    ]

    XLSX.writeFile(workbook, `deceased-members-page-export-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportToJSON = () => {
    const selectedRows = table.getSelectedRowModel().rows

    const dataToExport =
      selectedRows.length > 0
        ? selectedRows.map(row => row.original)
        : table.getFilteredRowModel().rows.map(row => row.original)

    const json = JSON.stringify(dataToExport, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `payments-export-${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: table.getPageCount(),
    paginationItemsToDisplay: 2
  })

  return (
    <div className='max-w-full min-w-0 overflow-hidden rounded border border-purple-500'>
      <div className='min-w-0 border-b'>
        <div className='flex flex-col gap-4 border-b p-3 sm:p-6'>
          <span className='text-2xl font-semibold text-purple-500 sm:text-4xl lg:text-6xl'>
            All Deceased Loved Ones
          </span>
          <DeceasedSummaryCards {...deceasedSummary} />
          <div className='flex items-center justify-between gap-3 px-0 py-3 max-sm:flex-col sm:px-6 sm:py-4'>
            <p
              className='text-sm font-extrabold whitespace-normal text-purple-400 sm:whitespace-nowrap'
              aria-live='polite'
            >
              <span>{table.getRowCount().toString()} Deceased Loved One(s) Found</span>
            </p>

            <div className='flex w-full max-w-full min-w-0 flex-wrap items-center justify-start gap-2 overflow-hidden sm:w-auto sm:flex-nowrap sm:justify-end'>
              <TablePaginationControls
                table={table}
                pages={pages}
                showLeftEllipsis={showLeftEllipsis}
                showRightEllipsis={showRightEllipsis}
                navigationClassName='text-purple-500'
                pageButtonClassName='bg-purple-500 hover:bg-purple-400'
                className='mx-0 w-auto justify-start sm:justify-end'
              />
              <Button
                className='text-primary focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 shrink-0 bg-purple-500/10 hover:bg-purple-400/20 max-md:flex-1 max-md:justify-center'
                onClick={exportCurrentPageToExcel}
                disabled={table.getRowModel().rows.length === 0}
              >
                <FileSpreadsheetIcon />
                Export Page
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className='text-primary focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 bg-purple-500/10 hover:bg-purple-400/20 max-md:flex-1 max-md:justify-center'>
                    <UploadIcon />
                    Export All
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={exportToCSV}>
                    <FileTextIcon className='mr-2 size-4' />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToExcel}>
                    <FileSpreadsheetIcon className='mr-2 size-4' />
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportToJSON}>
                    <FileTextIcon className='mr-2 size-4' />
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className='grid grid-cols-1 gap-6 max-md:*:last:col-span-full sm:grid-cols-2 md:grid-cols-3'>
            {/* <Filter column={table.getColumn('dateOfBirth')!} /> */}
          </div>
        </div>
        <div className='flex min-w-0 flex-col items-start gap-4 p-3 sm:p-6 md:flex-row md:items-center md:justify-between'>
          <div className='flex w-full min-w-0 flex-col justify-start gap-2 md:flex-1 md:flex-row md:flex-nowrap md:items-center'>
            <Filter column={table.getColumn('lastAndMiddleNames')!} />
            <Filter column={table.getColumn('firstName')!} />
            <Filter column={table.getColumn('sponsorCode')!} />
            <Filter column={table.getColumn('contributionStatus')!} />
          </div>
          <div className='flex w-full min-w-0 flex-wrap items-center gap-2 md:w-auto md:shrink-0 md:flex-nowrap md:justify-end md:gap-4'>
            <div className='flex min-w-0 items-center gap-2 max-md:flex-1'>
              <Label htmlFor='#rowSelect' className=''>
                Show
              </Label>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={value => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger id='rowSelect' className='w-fit whitespace-nowrap max-md:w-full'>
                  <SelectValue placeholder='Select number of results' />
                </SelectTrigger>
                <SelectContent className='[&_*[role=option]]:pr-8 [&_*[role=option]]:pl-2 [&_*[role=option]>span]:right-2 [&_*[role=option]>span]:left-auto'>
                  {[5, 10, 25, 50, 100].map(pageSize => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className='hidden overflow-x-auto md:block'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className='h-14 border-t bg-purple-500 hover:bg-purple-400'>
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead
                        key={header.id}
                        style={{ width: `${header.getSize()}px` }}
                        className='font-extrabold text-white first:pl-4 last:px-4'
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <div
                            className={cn(
                              header.column.getCanSort() &&
                                'flex h-full cursor-pointer items-center justify-start gap-1.5 select-none'
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                            onKeyDown={e => {
                              if (header.column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
                                e.preventDefault()
                                header.column.getToggleSortingHandler()?.(e)
                              }
                            }}
                            tabIndex={header.column.getCanSort() ? 0 : undefined}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <ArrowUp className='shrink-0 opacity-60' size={16} aria-hidden='true' />,
                              desc: <ArrowDown className='shrink-0 opacity-60' size={16} aria-hidden='true' />
                            }[header.column.getIsSorted() as string] ?? (
                              <ArrowUpDown className='shrink-0 opacity-60' size={16} aria-hidden='true' />
                            )}
                          </div>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className='hover:bg-purple-300/30'
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className='h-14 first:w-12.5 first:pl-4 last:w-29 last:px-4'>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24 text-center'>
                    No Deceased Loved Ones Found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <ResponsiveTableCards
          table={table}
          emptyMessage='No Deceased Loved Ones Found.'
          accentClassName='border-purple-200 dark:border-purple-900/60'
          getCardTitle={row => {
            const member = row.original

            return `${member.firstName} ${member.lastAndMiddleNames}`
          }}
          getCardSubtitle={row => row.original.memberMatriculationNumber}
        />
        <div className='flex max-w-full min-w-0 justify-center overflow-hidden border-t px-2 py-4 sm:px-6'>
          <TablePaginationControls
            table={table}
            pages={pages}
            showLeftEllipsis={showLeftEllipsis}
            showRightEllipsis={showRightEllipsis}
            navigationClassName='text-purple-500'
            pageButtonClassName='bg-purple-500 hover:bg-purple-400'
          />
        </div>
      </div>
    </div>
  )
}

export default DeceasedMembersDataTable

function Filter({ column }: { column: Column<any, unknown> }) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()
  const { filterVariant } = column.columnDef.meta ?? {}
  const columnHeader = typeof column.columnDef.header === 'string' ? column.columnDef.header : ''

  const sortedUniqueValues = useMemo(() => {
    if (filterVariant === 'range') return []

    const values = Array.from(column.getFacetedUniqueValues().keys())

    const flattenedValues = values.reduce((acc: string[], curr) => {
      if (Array.isArray(curr)) {
        return [...acc, ...curr]
      }

      return [...acc, curr]
    }, [])

    return Array.from(new Set(flattenedValues)).sort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [column.getFacetedUniqueValues(), filterVariant])

  if (filterVariant === 'select') {
    return (
      <div className='w-full min-w-0 space-y-2 rounded border border-purple-500 md:max-w-none md:flex-1 xl:max-w-2xs'>
        {/* <Label htmlFor={`${id}-select`}>Select {columnHeader}</Label> */}
        <Select
          value={columnFilterValue?.toString() ?? 'all'}
          onValueChange={value => {
            column.setFilterValue(value === 'all' ? undefined : value)
          }}
        >
          <SelectTrigger id={`${id}-select`} className='w-full capitalize'>
            <SelectValue placeholder={`Select ${columnHeader}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All</SelectItem>
            {sortedUniqueValues.map(value => (
              <SelectItem key={String(value)} value={String(value)} className='capitalize'>
                {String(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className='w-full min-w-0 rounded border border-purple-500 md:max-w-none md:flex-1 xl:max-w-2xs'>
      <Label htmlFor={`${id}-input`} className='sr-only'>
        {columnHeader}
      </Label>
      <div className='relative'>
        <Input
          id={`${id}-input`}
          className='peer pl-9'
          value={(columnFilterValue ?? '') as string}
          onChange={e => column.setFilterValue(e.target.value)}
          placeholder={`Search ${columnHeader.toLowerCase()}`}
          type='text'
        />
        <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
          <SearchIcon size={16} />
        </div>
      </div>
    </div>
  )
}

function RowActions({ deceasedMember }: { deceasedMember: DeceasedMemberType }) {
  return <RestoreDeceasedMemberButton deceasedMember={deceasedMember} />
}
