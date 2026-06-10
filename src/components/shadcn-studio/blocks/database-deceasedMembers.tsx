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
  ChevronLeftIcon,
  ChevronRightIcon,
  Ellipsis,
  Trash2,
  FileSpreadsheetIcon,
  FileTextIcon,
  SearchIcon,
  UploadIcon,
  Cross,
  Eye,
  Pencil
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

import Link from 'next/link'

import { id } from 'zod/v4/locales'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { usePagination } from '@/hooks/use-pagination'

import DeceasedSummaryCards, { type DeceasedSummary } from '@/components/dashboard/DeceasedSummaryCards'
import { cn } from '@/lib/utils'

import { type DeceasedMemberType } from '@/utils/types'
import { deleteDeceasedMemberAction } from '@/utils/actions'
import FormContainer from '@/components/forms/FormContainer'

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
          'bg-amber-600/10 text-amber-600 focus-visible:ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:focus-visible:ring-amber-400/40 [a&]:hover:bg-amber-600/5 dark:[a&]:hover:bg-amber-400/5',
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
  }

  // {
  //   header: 'Actions',
  //   accessorKey: 'id',
  //   cell: ({ row: { original } }) => {
  //     // Destructuring 'id' directly from the row data
  //     const { id } = original

  //     return <RowActions deceasedMemberId={id} />
  //   },
  //   size: 20
  // }
]

const DeceasedMembersDataTable = ({
  data,
  deceasedSummary
}: {
  data: DeceasedMemberType[]
  deceasedSummary: DeceasedSummary
}) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

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
    <div className='w-full rounded border border-purple-500'>
      <div className='border-b'>
        <div className='flex flex-col gap-4 border-b p-6'>
          <span className='text-2xl font-semibold text-purple-500 sm:text-4xl lg:text-6xl'>
            All Deceased Loved Ones
          </span>
          <DeceasedSummaryCards {...deceasedSummary} />
          <div className='flex items-center justify-between gap-3 px-6 py-4 max-sm:flex-col'>
            <p className='text-sm font-extrabold whitespace-nowrap text-purple-400' aria-live='polite'>
              <span>{table.getRowCount().toString()} Deceased Loved One(s) Found</span>
            </p>

            <div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      className='disabled:pointer-events-none disabled:opacity-50'
                      variant={'ghost'}
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      aria-label='Go to previous page'
                    >
                      <ChevronLeftIcon aria-hidden='true' className='text-purple-500' />
                      <span className='text-purple-500 max-sm:hidden'>Previous</span>
                    </Button>
                  </PaginationItem>

                  {showLeftEllipsis && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {pages.map(page => {
                    const isActive = page === table.getState().pagination.pageIndex + 1

                    return (
                      <PaginationItem key={page}>
                        <Button
                          size='icon'
                          className='bg-purple-500 hover:bg-purple-400'
                          onClick={() => table.setPageIndex(page - 1)}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          {page}
                        </Button>
                      </PaginationItem>
                    )
                  })}

                  {showRightEllipsis && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <Button
                      className='disabled:pointer-events-none disabled:opacity-50'
                      variant={'ghost'}
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      aria-label='Go to next page'
                    >
                      <span className='text-purple-500 max-sm:hidden'>Next</span>
                      <ChevronRightIcon aria-hidden='true' className='text-purple-500' />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
          <div className='grid grid-cols-1 gap-6 max-md:*:last:col-span-full sm:grid-cols-2 md:grid-cols-3'>
            {/* <Filter column={table.getColumn('dateOfBirth')!} /> */}
          </div>
        </div>
        <div className='flex items-start gap-4 p-6 max-sm:flex-col sm:items-center sm:justify-between'>
          <div className='flex w-6/7 flex-col justify-start gap-2 sm:flex-row sm:items-center'>
            <Filter column={table.getColumn('lastAndMiddleNames')!} />
            <Filter column={table.getColumn('firstName')!} />
            <Filter column={table.getColumn('sponsorCode')!} />
            <Filter column={table.getColumn('contributionStatus')!} />
          </div>
          <div className='flex items-center gap-4 sm:justify-between'>
            <div className='flex items-center gap-2'>
              <Label htmlFor='#rowSelect' className=''>
                Show
              </Label>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={value => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger id='rowSelect' className='w-fit whitespace-nowrap'>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className='text-primary focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 bg-purple-500/10 hover:bg-purple-400/20'>
                  <UploadIcon />
                  Export
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
                              'flex h-full cursor-pointer items-center justify-between gap-2 select-none'
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
                          }[header.column.getIsSorted() as string] ?? <ArrowUpDown className='shrink-0 opacity-60' size={16} aria-hidden='true' />}
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
      <div className='w-full max-w-2xs space-y-2 rounded border border-purple-500'>
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
    <div className='w-full max-w-2xs rounded border border-purple-500'>
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

function RowActions({ deceasedMemberId }: { deceasedMemberId: string }) {
  const deleteDeceasedMember = deleteDeceasedMemberAction.bind(null, { deceasedMemberId })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='flex'>
          <Button size='icon' variant='ghost' className='rounded-full p-2' aria-label='Edit item'>
            <Ellipsis className='size-6' aria-hidden='true' />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='rounded border border-purple-500'>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href={`/admin-deceased/${deceasedMemberId}/edit`}>
              <span className='flex justify-center gap-3 pl-4 text-blue-500'>
                <Pencil className='text-blue-500' />
                Edit Case Status
              </span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FormContainer action={deleteDeceasedMember}>
              <Button
                size='default'
                variant='ghost'
                className='text-destructive flex justify-center gap-3 rounded-full hover:bg-transparent'

                // aria-label='Edit '
              >
                <Trash2 className='text-destructive size-4' aria-hidden='true' />
                <p>remove deceased Loved Ones</p>
              </Button>
            </FormContainer>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
