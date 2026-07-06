'use client'

import { useMemo, useState, type ReactNode } from 'react'

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  Eye,
  Mail,
  Phone,
  SearchIcon,
  type LucideIcon
} from 'lucide-react'

import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePagination } from '@/hooks/use-pagination'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { cn } from '@/lib/utils'

export type UsersContactsRow = {
  awaitingLovedOnes: number
  delinquentLovedOnes: number
  id: string
  pendingLovedOnes: number
  sponsorCode: string
  sponsorEmail: string
  sponsorName: string
  sponsorPhoneNumber: string
  totalLovedOnes: number
  vestedLovedOnes: number
}

type SortKey =
  | 'awaitingLovedOnes'
  | 'delinquentLovedOnes'
  | 'pendingLovedOnes'
  | 'sponsorCode'
  | 'sponsorEmail'
  | 'sponsorName'
  | 'sponsorPhoneNumber'
  | 'totalLovedOnes'
  | 'vestedLovedOnes'
type SortDirection = 'asc' | 'desc'

type UsersContactsColumn = {
  align?: 'left' | 'right'
  key: SortKey
  label: string
  width: number
}

const columns: UsersContactsColumn[] = [
  { key: 'sponsorName', label: 'Sponsor name', width: 20 },
  { key: 'sponsorCode', label: 'Code', width: 8 },
  { key: 'sponsorPhoneNumber', label: 'Phone number', width: 14 },
  { key: 'sponsorEmail', label: 'Email', width: 24 },
  { align: 'right', key: 'vestedLovedOnes', label: 'Vested', width: 6 },
  { align: 'right', key: 'awaitingLovedOnes', label: 'Awaiting', width: 7 },
  { align: 'right', key: 'pendingLovedOnes', label: 'Pending', width: 7 },
  { align: 'right', key: 'delinquentLovedOnes', label: 'Delinquent', width: 8 },
  { align: 'right', key: 'totalLovedOnes', label: 'Total', width: 6 }
]

const pageSizeOptions = [10, 25, 50, 100]

const getSortIcon = (isActive: boolean, direction: SortDirection) => {
  if (!isActive) return <ArrowUpDown className='size-3.5' />

  return direction === 'asc' ? <ArrowUp className='size-3.5' /> : <ArrowDown className='size-3.5' />
}

const compareValues = (firstValue: UsersContactsRow[SortKey], secondValue: UsersContactsRow[SortKey]) => {
  if (typeof firstValue === 'number' && typeof secondValue === 'number') {
    return firstValue - secondValue
  }

  return String(firstValue).localeCompare(String(secondValue), undefined, {
    numeric: true,
    sensitivity: 'base'
  })
}

const getTelHref = (phoneNumber: string) => {
  const normalizedPhoneNumber = phoneNumber.replace(/[^\d+]/g, '')

  return normalizedPhoneNumber ? `tel:${normalizedPhoneNumber}` : ''
}

const ContactLink = ({
  children,
  className,
  href,
  icon: Icon
}: {
  children: string
  className?: string
  href: string
  icon: LucideIcon
}) => {
  if (!children || !href) return <span className='text-muted-foreground'>-</span>

  return (
    <a
      className={cn(
        'text-primary inline-flex min-w-0 items-center gap-2 underline-offset-4 hover:underline',
        className
      )}
      href={href}
    >
      <Icon className='size-4 shrink-0' aria-hidden='true' />
      <span className='min-w-0 break-all'>{children}</span>
    </a>
  )
}

const MobileContactValue = ({ children, label }: { children: ReactNode; label: string }) => (
  <div className='grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start gap-2'>
    <span className='text-muted-foreground min-w-0 text-xs leading-snug font-semibold uppercase'>{label}</span>
    <span className='min-w-0 justify-self-end text-right text-sm leading-snug font-semibold break-words'>
      {children}
    </span>
  </div>
)

const MobileStatusCount = ({ className, label, value }: { className?: string; label: string; value: number }) => (
  <div className={cn('rounded-md border px-3 py-2 text-center', className)}>
    <div className='text-muted-foreground text-[11px] leading-tight font-semibold uppercase'>{label}</div>
    <div className='mt-1 text-xl leading-none font-extrabold tabular-nums'>{value}</div>
  </div>
)

const UsersContactsTable = ({ rows }: { rows: UsersContactsRow[] }) => {
  const [sortKey, setSortKey] = useState<SortKey>('sponsorName')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [search, setSearch] = usePersistentState('sagicam:users-contacts:search', '')
  const [pageSize, setPageSize] = usePersistentState('sagicam:users-contacts:page-size', 25)
  const [currentPage, setCurrentPage] = useState(1)

  const normalizedSearch = search.trim().toLowerCase()

  const filteredRows = useMemo(() => {
    if (!normalizedSearch) return rows

    return rows.filter(row =>
      [row.sponsorName, row.sponsorCode, row.sponsorPhoneNumber, row.sponsorEmail]
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

  return (
    <div className='max-w-full min-w-0 space-y-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <form role='search' onSubmit={event => event.preventDefault()} className='min-w-0 flex-1'>
          <label htmlFor='users-contacts-search' className='sr-only'>
            Search users contacts
          </label>
          <div className='relative'>
            <Input
              id='users-contacts-search'
              value={search}
              onChange={event => handleSearchChange(event.target.value)}
              placeholder='Search sponsor name, code, phone, or email'
              className='bg-background h-10 w-full pr-3 pl-9 text-sm font-semibold'
            />
            <SearchIcon
              aria-hidden='true'
              className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2'
            />
          </div>
        </form>
        <Badge variant='outline' className='h-10 w-fit rounded-md px-3 text-sm font-semibold'>
          {sortedRows.length} sponsor{sortedRows.length === 1 ? '' : 's'}
        </Badge>
      </div>

      <div className='border-border max-w-full min-w-0 overflow-hidden rounded-lg border'>
        <div className='hidden overflow-x-auto md:block'>
          <Table className='[[&_td]:wrap-break-word table-fixed [&_td]:whitespace-normal [&_th]:wrap-break-word [&_th]:whitespace-normal'>
            <colgroup>
              {columns.map(column => (
                <col key={column.key} style={{ width: `${column.width}%` }} />
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
                        className={cn(
                          'flex w-full items-center gap-1.5 font-semibold',
                          column.align === 'right' ? 'justify-end text-right' : 'justify-start text-left'
                        )}
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
                    {normalizedSearch ? `No sponsor matching "${search.trim()}" found.` : 'No sponsor contacts found.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map(row => (
                  <TableRow key={row.id} className='odd:bg-muted/30 even:bg-background'>
                    <TableCell className='font-medium'>{row.sponsorName}</TableCell>
                    <TableCell>
                      <div className='flex min-w-0 flex-col items-start gap-2'>
                        <Badge variant='secondary' className='rounded-md font-mono'>
                          {row.sponsorCode}
                        </Badge>
                        <Button asChild size='xs' variant='outline' className='h-7 gap-1 px-2 text-xs'>
                          <Link href={`/admin-sponsor-view/${encodeURIComponent(row.sponsorCode)}`}>
                            <Eye aria-hidden='true' />
                            View
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ContactLink href={getTelHref(row.sponsorPhoneNumber)} icon={Phone}>
                        {row.sponsorPhoneNumber}
                      </ContactLink>
                    </TableCell>
                    <TableCell>
                      <ContactLink href={`mailto:${row.sponsorEmail}`} icon={Mail}>
                        {row.sponsorEmail}
                      </ContactLink>
                    </TableCell>
                    <TableCell className='text-right font-extrabold tabular-nums'>{row.vestedLovedOnes}</TableCell>
                    <TableCell className='text-right font-extrabold tabular-nums'>{row.awaitingLovedOnes}</TableCell>
                    <TableCell className='text-right font-extrabold tabular-nums'>{row.pendingLovedOnes}</TableCell>
                    <TableCell className='text-right font-extrabold tabular-nums'>{row.delinquentLovedOnes}</TableCell>
                    <TableCell className='text-right text-base font-black tabular-nums'>{row.totalLovedOnes}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className='grid gap-3 p-2 sm:p-3 md:hidden'>
          {sortedRows.length === 0 ? (
            <div className='text-muted-foreground rounded-md border px-3 py-8 text-center text-sm sm:px-4 sm:py-10'>
              {normalizedSearch ? `No sponsor matching "${search.trim()}" found.` : 'No sponsor contacts found.'}
            </div>
          ) : (
            paginatedRows.map(row => (
              <article key={row.id} className='bg-background overflow-hidden rounded-md border p-3 shadow-sm sm:p-4'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <div className='text-base font-extrabold break-words'>{row.sponsorName}</div>
                    <div className='text-muted-foreground mt-1 text-xs font-semibold'>{row.sponsorCode}</div>
                  </div>
                  <div className='flex shrink-0 flex-col items-end gap-2'>
                    <Badge variant='secondary' className='rounded-md font-mono'>
                      {row.sponsorCode}
                    </Badge>
                    <Button asChild size='xs' variant='outline' className='h-7 gap-1 px-2 text-xs'>
                      <Link href={`/admin-sponsor-view/${encodeURIComponent(row.sponsorCode)}`}>
                        <Eye aria-hidden='true' />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className='mt-4 grid gap-3'>
                  <MobileContactValue label='Phone'>
                    <ContactLink
                      className='justify-end text-right'
                      href={getTelHref(row.sponsorPhoneNumber)}
                      icon={Phone}
                    >
                      {row.sponsorPhoneNumber}
                    </ContactLink>
                  </MobileContactValue>
                  <MobileContactValue label='Email'>
                    <ContactLink className='justify-end text-right' href={`mailto:${row.sponsorEmail}`} icon={Mail}>
                      {row.sponsorEmail}
                    </ContactLink>
                  </MobileContactValue>
                </div>
                <div className='mt-4 grid grid-cols-2 gap-2'>
                  <MobileStatusCount label='Vested' value={row.vestedLovedOnes} />
                  <MobileStatusCount label='Awaiting' value={row.awaitingLovedOnes} />
                  <MobileStatusCount label='Pending' value={row.pendingLovedOnes} />
                  <MobileStatusCount label='Delinquent' value={row.delinquentLovedOnes} />
                  <MobileStatusCount
                    className='bg-primary/5 border-primary/20 col-span-2'
                    label='Total'
                    value={row.totalLovedOnes}
                  />
                </div>
              </article>
            ))
          )}
        </div>

        {sortedRows.length > 0 ? (
          <div className='bg-background flex flex-col gap-3 border-t px-3 py-3 lg:flex-row lg:items-center lg:justify-between'>
            <p className='text-muted-foreground text-sm font-semibold'>
              Showing {showingStart}-{pageEndIndex} of {sortedRows.length} sponsor contact
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

export default UsersContactsTable
