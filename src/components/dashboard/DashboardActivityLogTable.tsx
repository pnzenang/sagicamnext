'use client'

import { useMemo, useState } from 'react'

import { ArrowDown, ArrowUp, ArrowUpDown, SearchIcon } from 'lucide-react'

import PaginationControls from '@/components/global/PaginationControls'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePagination } from '@/hooks/use-pagination'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { cn } from '@/lib/utils'
import type { DashboardActivityLogRow } from '@/utils/types'

type SortKey = 'action' | 'actorEmail' | 'createdAt' | 'entityType' | 'sponsorLabel' | 'summary'
type SortDirection = 'asc' | 'desc'

type ActivityColumn = {
  key: SortKey
  label: string
  width: number
}

const pageSizeOptions = [10, 25, 50, 100]

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
})

const baseColumns: ActivityColumn[] = [
  { key: 'createdAt', label: 'When', width: 16 },
  { key: 'actorEmail', label: 'Who', width: 20 },
  { key: 'action', label: 'Action', width: 15 },
  { key: 'entityType', label: 'Area', width: 13 },
  { key: 'summary', label: 'Details', width: 36 }
]

const sponsorColumn: ActivityColumn = { key: 'sponsorLabel', label: 'Dashboard', width: 18 }

const getSortIcon = (isActive: boolean, direction: SortDirection) => {
  if (!isActive) return <ArrowUpDown className='size-3.5' aria-hidden='true' />

  return direction === 'asc' ? (
    <ArrowUp className='size-3.5' aria-hidden='true' />
  ) : (
    <ArrowDown className='size-3.5' aria-hidden='true' />
  )
}

const getCreatedAtLabel = (createdAt: string) => dateFormatter.format(new Date(createdAt))

const getActionLabel = (action: string) =>
  action
    .split('_')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const getEntityLabel = (entityType: string) =>
  entityType
    .split('_')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const getActorEmailLabel = (row: DashboardActivityLogRow) => row.actorEmail || 'Email unavailable'

const compareValues = (firstValue: string, secondValue: string) =>
  firstValue.localeCompare(secondValue, undefined, {
    numeric: true,
    sensitivity: 'base'
  })

const getSortValue = (row: DashboardActivityLogRow, key: SortKey) => {
  if (key === 'createdAt') return row.createdAt
  if (key === 'action') return getActionLabel(row.action)
  if (key === 'actorEmail') return getActorEmailLabel(row)
  if (key === 'entityType') return getEntityLabel(row.entityType)

  return row[key]
}

const ActivityMobileValue = ({ label, value }: { label: string; value: string }) => (
  <div className='grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-start gap-2'>
    <span className='text-muted-foreground min-w-0 text-xs leading-snug font-semibold uppercase'>{label}</span>
    <span className='min-w-0 justify-self-end text-right text-sm leading-snug font-semibold break-words'>{value}</span>
  </div>
)

const DashboardActivityLogTable = ({
  rows,
  showSponsor = false,
  storageKey
}: {
  rows: DashboardActivityLogRow[]
  showSponsor?: boolean
  storageKey: string
}) => {
  const [search, setSearch] = usePersistentState(`${storageKey}:search`, '')
  const [pageSize, setPageSize] = usePersistentState(`${storageKey}:page-size`, 25)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const columns = useMemo(
    () => (showSponsor ? [baseColumns[0], baseColumns[1], sponsorColumn, ...baseColumns.slice(2)] : baseColumns),
    [showSponsor]
  )

  const normalizedSearch = search.trim().toLowerCase()

  const filteredRows = useMemo(() => {
    if (!normalizedSearch) return rows

    return rows.filter(row =>
      [
        getCreatedAtLabel(row.createdAt),
        getActorEmailLabel(row),
        row.sponsorLabel,
        row.sponsorCode,
        getActionLabel(row.action),
        getEntityLabel(row.entityType),
        row.summary
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)
    )
  }, [normalizedSearch, rows])

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((firstRow, secondRow) => {
      const comparison = compareValues(getSortValue(firstRow, sortKey), getSortValue(secondRow, sortKey))

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredRows, sortDirection, sortKey])

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize))
  const activePage = Math.min(currentPage, totalPages)
  const pageStartIndex = (activePage - 1) * pageSize
  const pageEndIndex = Math.min(pageStartIndex + pageSize, sortedRows.length)
  const paginatedRows = sortedRows.slice(pageStartIndex, pageEndIndex)
  const showingStart = sortedRows.length > 0 ? pageStartIndex + 1 : 0

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: activePage,
    paginationItemsToDisplay: 3,
    totalPages
  })

  const handleSearchChange = (nextSearch: string) => {
    setSearch(nextSearch)
    setCurrentPage(1)
  }

  const handleSort = (nextSortKey: SortKey) => {
    if (nextSortKey === sortKey) {
      setSortDirection(currentDirection => (currentDirection === 'asc' ? 'desc' : 'asc'))
      setCurrentPage(1)

      return
    }

    setSortKey(nextSortKey)
    setSortDirection(nextSortKey === 'createdAt' ? 'desc' : 'asc')
    setCurrentPage(1)
  }

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  return (
    <div className='max-w-full min-w-0 space-y-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <form role='search' onSubmit={event => event.preventDefault()} className='min-w-0 flex-1'>
          <label htmlFor='dashboard-activity-search' className='sr-only'>
            Search activity log
          </label>
          <div className='relative'>
            <Input
              id='dashboard-activity-search'
              value={search}
              onChange={event => handleSearchChange(event.target.value)}
              placeholder='Search by person, action, sponsor, or details'
              className='bg-background h-10 w-full pr-3 pl-9 text-sm font-semibold'
            />
            <SearchIcon
              aria-hidden='true'
              className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2'
            />
          </div>
        </form>
        <Badge variant='outline' className='h-10 w-fit rounded-md px-3 text-sm font-semibold'>
          {sortedRows.length} event{sortedRows.length === 1 ? '' : 's'}
        </Badge>
      </div>

      <div className='border-border max-w-full min-w-0 overflow-hidden rounded-lg border'>
        <div className='hidden overflow-x-auto lg:block'>
          <Table className='table-fixed [&_td]:whitespace-normal [&_th]:whitespace-normal'>
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
              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className='text-muted-foreground h-28 text-center'>
                    {normalizedSearch ? `No activity matching "${search.trim()}" found.` : 'No activity recorded yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map(row => (
                  <TableRow key={row.id} className='odd:bg-muted/30 even:bg-background align-top'>
                    <TableCell className='text-muted-foreground text-xs font-semibold whitespace-nowrap'>
                      {getCreatedAtLabel(row.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className='font-semibold break-all'>{getActorEmailLabel(row)}</div>
                    </TableCell>
                    {showSponsor ? (
                      <TableCell>
                        {row.sponsorCode ? (
                          <Badge variant='secondary' className='rounded-md font-mono whitespace-normal'>
                            {row.sponsorLabel || row.sponsorCode}
                          </Badge>
                        ) : (
                          <span className='text-muted-foreground'>Admin</span>
                        )}
                      </TableCell>
                    ) : null}
                    <TableCell>
                      <Badge variant='outline' className='rounded-md whitespace-normal'>
                        {getActionLabel(row.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-muted-foreground text-sm font-semibold break-words'>
                      {getEntityLabel(row.entityType)}
                    </TableCell>
                    <TableCell className='text-sm leading-relaxed break-words'>{row.summary}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className='grid gap-3 p-2 sm:p-3 lg:hidden'>
          {paginatedRows.length === 0 ? (
            <div className='text-muted-foreground rounded-md border px-3 py-8 text-center text-sm sm:px-4 sm:py-10'>
              {normalizedSearch ? `No activity matching "${search.trim()}" found.` : 'No activity recorded yet.'}
            </div>
          ) : (
            paginatedRows.map(row => (
              <article key={row.id} className='bg-background overflow-hidden rounded-md border p-3 shadow-sm sm:p-4'>
                <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='min-w-0'>
                    <div className='text-sm font-extrabold break-all'>{getActorEmailLabel(row)}</div>
                    <div className='text-muted-foreground mt-1 text-xs font-semibold'>
                      {getCreatedAtLabel(row.createdAt)}
                    </div>
                  </div>
                  <Badge variant='outline' className='w-fit rounded-md'>
                    {getActionLabel(row.action)}
                  </Badge>
                </div>
                <p className='mt-3 text-sm leading-relaxed break-words'>{row.summary}</p>
                <div className='mt-4 grid gap-3 border-t pt-3'>
                  {showSponsor ? <ActivityMobileValue label='Dashboard' value={row.sponsorLabel || 'Admin'} /> : null}
                  <ActivityMobileValue label='Area' value={getEntityLabel(row.entityType)} />
                </div>
              </article>
            ))
          )}
        </div>

        {sortedRows.length > 0 ? (
          <div className='bg-background flex flex-col gap-3 border-t px-3 py-3 lg:flex-row lg:items-center lg:justify-between'>
            <p className='text-muted-foreground text-sm font-semibold'>
              Showing {showingStart}-{pageEndIndex} of {sortedRows.length} event
              {sortedRows.length === 1 ? '' : 's'}
            </p>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end'>
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground text-sm font-semibold whitespace-nowrap'>Rows per page</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={nextPageSize => {
                    setPageSize(Number(nextPageSize))
                    setCurrentPage(1)
                  }}
                >
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
              <PaginationControls
                activePage={activePage}
                canNext={activePage < totalPages}
                canPrevious={activePage > 1}
                iconClassName='size-4'
                onNext={() => handlePageChange(activePage + 1)}
                onPageChange={handlePageChange}
                onPrevious={() => handlePageChange(activePage - 1)}
                pageButtonVariant={isActive => (isActive ? 'default' : 'outline')}
                pages={pages}
                showLeftEllipsis={showLeftEllipsis}
                showRightEllipsis={showRightEllipsis}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default DashboardActivityLogTable
