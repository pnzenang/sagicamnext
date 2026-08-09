'use client'

import { useId, useMemo, useState, type ReactNode } from 'react'

import { ArrowUpDown, ChevronDown, ChevronUp, Download } from 'lucide-react'

import PaginationControls from '@/components/global/PaginationControls'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { usePagination } from '@/hooks/use-pagination'
import { cn } from '@/lib/utils'

type ContributionTableDocument = {
  fileName: string
  id: string
} | null

export type PublishedContributionDeathRow = {
  amountToContribute: number
  createdAt: string
  dateOfDeath: string
  deathCertificate: ContributionTableDocument
  deceasedPicture: ContributionTableDocument
  firstName: string
  id: string
  lastAndMiddleNames: string
  memberMatriculationNumber: string
  registrationDate: string
  sponsorCode: string
  sponsorName: string
}

export type PublishedContributionGroupRow = {
  accountAfterContribution: number
  accountBeforeContribution: number
  amountOwed: number
  sponsorCode: string
  sponsorName: string
  vestedMembersCount: number
}

type PublishedContributionTablesProps = {
  amountPerVestedMember: number
  deaths: PublishedContributionDeathRow[]
  groups: PublishedContributionGroupRow[]
  totalVestedMembers: number
}

type SortDirection = 'asc' | 'desc'
type DeathSortKey =
  | 'amountToContribute'
  | 'dateOfDeath'
  | 'deathCertificate'
  | 'deceasedPicture'
  | 'firstName'
  | 'lastAndMiddleNames'
  | 'memberMatriculationNumber'
  | 'registrationDate'
  | 'sponsorCode'
  | 'sponsorName'
type GroupSortKey =
  | 'accountAfterContribution'
  | 'accountBeforeContribution'
  | 'amountOwed'
  | 'sponsorCode'
  | 'vestedMembersCount'

type SortState<T extends string> = {
  direction: SortDirection
  key: T
}

type SortColumn<T extends string> = {
  align?: 'center' | 'left' | 'right'
  className?: string
  key: T
  label: string
  shortLabel?: string
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
})

const defaultGroupRowsPerPage = 10
const groupRowsPerPageOptions = [10, 25, 50, 100]

const deathSortColumns: SortColumn<DeathSortKey>[] = [
  {
    key: 'memberMatriculationNumber',
    label: 'Matriculation',
    shortLabel: 'Matric.',
    className: 'w-24 px-1.5 md:w-28 md:px-2'
  },
  { key: 'firstName', label: 'First Name', className: 'w-32 px-1.5 md:w-44 md:px-2 xl:w-52' },
  { key: 'lastAndMiddleNames', label: 'Last Name', className: 'hidden w-44 sm:table-cell md:w-64 xl:w-72' },
  { key: 'registrationDate', label: 'Registration Date', className: 'hidden lg:table-cell' },
  { key: 'dateOfDeath', label: 'Date of Death', shortLabel: 'Death', className: 'px-1.5 md:min-w-40 md:px-2' },
  {
    align: 'center',
    className: 'px-1.5 md:min-w-36 md:px-2',
    key: 'deathCertificate',
    label: 'Death Certificate',
    shortLabel: 'Cert.'
  },
  {
    align: 'center',
    className: 'px-1.5 md:min-w-36 md:px-2',
    key: 'deceasedPicture',
    label: 'Deceased Picture',
    shortLabel: 'Pic.'
  },
  {
    align: 'right',
    className: 'w-24 px-1 md:w-28 md:px-2',
    key: 'amountToContribute',
    label: 'Amount'
  },
  { key: 'sponsorCode', label: 'Sponsor Code', className: 'hidden w-20 px-1 md:table-cell md:w-24 md:px-2' }
]

const groupSortColumns: SortColumn<GroupSortKey>[] = [
  { key: 'sponsorCode', label: 'Code', className: 'px-1.5 md:min-w-20 md:px-2' },
  {
    align: 'right',
    className: 'px-1.5 md:min-w-40 md:px-2',
    key: 'vestedMembersCount',
    label: 'Vested Loved Ones',
    shortLabel: 'Vested'
  },
  {
    align: 'right',
    className: 'px-1.5 md:min-w-44 md:px-2',
    key: 'accountBeforeContribution',
    label: 'Account Before Contribution',
    shortLabel: 'Account Before'
  },
  {
    align: 'right',
    className: 'px-1.5 md:min-w-48 md:px-2',
    key: 'amountOwed',
    label: 'Amount To Contribute',
    shortLabel: 'Amount'
  },
  {
    align: 'right',
    className: 'px-1.5 md:min-w-44 md:px-2',
    key: 'accountAfterContribution',
    label: 'Account After Contribution',
    shortLabel: 'Account After'
  }
]

const formatDate = (value: string | null) => {
  if (!value) return 'Not set'

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

const compareText = (left: string | null | undefined, right: string | null | undefined) =>
  String(left ?? '').localeCompare(String(right ?? ''), undefined, {
    numeric: true,
    sensitivity: 'base'
  })

const getDateTime = (value: string | null | undefined) => {
  if (!value) return null

  const time = new Date(value).getTime()

  return Number.isNaN(time) ? null : time
}

const compareDates = (left: string | null | undefined, right: string | null | undefined) => {
  const leftTime = getDateTime(left)
  const rightTime = getDateTime(right)

  if (leftTime !== null && rightTime !== null) return leftTime - rightTime
  if (leftTime !== null) return -1
  if (rightTime !== null) return 1

  return compareText(left, right)
}

const getNextDirection = <T extends string>(sort: SortState<T>, key: T): SortDirection => {
  if (sort.key !== key) return 'asc'

  return sort.direction === 'asc' ? 'desc' : 'asc'
}

const compareDeathRows = (
  left: PublishedContributionDeathRow,
  right: PublishedContributionDeathRow,
  key: DeathSortKey
) => {
  if (key === 'amountToContribute') return left.amountToContribute - right.amountToContribute
  if (key === 'dateOfDeath') return compareDates(left.dateOfDeath, right.dateOfDeath)
  if (key === 'registrationDate') return compareDates(left.registrationDate, right.registrationDate)
  if (key === 'deathCertificate') return compareText(left.deathCertificate?.fileName, right.deathCertificate?.fileName)
  if (key === 'deceasedPicture') return compareText(left.deceasedPicture?.fileName, right.deceasedPicture?.fileName)

  return compareText(left[key], right[key])
}

const compareGroupRows = (
  left: PublishedContributionGroupRow,
  right: PublishedContributionGroupRow,
  key: GroupSortKey
) => {
  if (key === 'accountAfterContribution') return left.accountAfterContribution - right.accountAfterContribution
  if (key === 'accountBeforeContribution') return left.accountBeforeContribution - right.accountBeforeContribution
  if (key === 'amountOwed') return left.amountOwed - right.amountOwed
  if (key === 'vestedMembersCount') return left.vestedMembersCount - right.vestedMembersCount

  return compareText(left[key], right[key])
}

const SortIcon = ({ active, direction }: { active: boolean; direction: SortDirection }) => {
  if (!active) return <ArrowUpDown className='size-3.5 opacity-70 print:hidden' aria-hidden='true' />
  if (direction === 'asc') return <ChevronUp className='size-3.5 opacity-80 print:hidden' aria-hidden='true' />

  return <ChevronDown className='size-3.5 opacity-80 print:hidden' aria-hidden='true' />
}

const ContributionTableDocumentLink = ({ document, label }: { document: ContributionTableDocument; label: string }) => {
  if (!document) {
    return (
      <span className='text-muted-foreground text-[10px] font-medium sm:text-xs'>
        <span className='sm:hidden print:hidden'>No</span>
        <span className='hidden sm:inline print:inline'>Missing</span>
      </span>
    )
  }

  const tooltipTitle = `${label}: ${document.fileName}`

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={`/death-documentations/${document.id}/download`}
          className='text-primary print:text-foreground inline-flex items-center justify-center gap-1 text-xs font-semibold underline-offset-4 hover:underline print:no-underline'
          aria-label={tooltipTitle}
        >
          <Download className='size-3.5 print:hidden' />
          <span className='hidden sm:inline print:hidden'>Download</span>
          <span className='hidden print:inline'>{document.fileName}</span>
        </a>
      </TooltipTrigger>
      <TooltipContent side='top' sideOffset={4}>
        {tooltipTitle}
      </TooltipContent>
    </Tooltip>
  )
}

function SortHeader<T extends string>({
  align = 'left',
  children,
  className,
  onSort,
  sort,
  sortKey,
  title
}: {
  align?: 'center' | 'left' | 'right'
  children: ReactNode
  className?: string
  onSort: (key: T) => void
  sort: SortState<T>
  sortKey: T
  title: string
}) {
  const active = sort.key === sortKey

  return (
    <TableHead
      aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={cn('text-primary-foreground', className)}
      title={title}
    >
      <button
        type='button'
        onClick={() => onSort(sortKey)}
        className={cn(
          'text-primary-foreground inline-flex w-full items-center gap-1 transition hover:opacity-85 print:pointer-events-none',
          align === 'center' && 'justify-center text-center',
          align === 'right' && 'justify-end text-right'
        )}
      >
        <span>{children}</span>
        <SortIcon active={active} direction={sort.direction} />
      </button>
    </TableHead>
  )
}

const SortControl = <T extends string>({
  columns,
  label,
  onSort,
  setDirection,
  sort
}: {
  columns: SortColumn<T>[]
  label: string
  onSort: (key: T) => void
  setDirection: (direction: SortDirection) => void
  sort: SortState<T>
}) => (
  <div className='flex flex-col gap-2 sm:hidden print:hidden'>
    <p className='text-muted-foreground text-xs font-semibold'>{label}</p>
    <div className='grid grid-cols-[minmax(0,1fr)_auto] gap-2'>
      <Select value={sort.key} onValueChange={value => onSort(value as T)}>
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
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => setDirection(sort.direction === 'asc' ? 'desc' : 'asc')}
      >
        {sort.direction === 'asc' ? <ChevronUp /> : <ChevronDown />}
        {sort.direction === 'asc' ? 'Asc' : 'Desc'}
      </Button>
    </div>
  </div>
)

const PublishedContributionTables = ({
  amountPerVestedMember,
  deaths,
  groups,
  totalVestedMembers
}: PublishedContributionTablesProps) => {
  const [deathSort, setDeathSort] = useState<SortState<DeathSortKey>>({
    direction: 'asc',
    key: 'lastAndMiddleNames'
  })

  const [groupSort, setGroupSort] = useState<SortState<GroupSortKey>>({
    direction: 'asc',
    key: 'sponsorCode'
  })

  const [groupCurrentPage, setGroupCurrentPage] = useState(1)
  const [groupRowsPerPage, setGroupRowsPerPage] = useState(defaultGroupRowsPerPage)
  const groupRowsPerPageSelectId = useId()

  const sortedDeaths = useMemo(() => {
    const directionMultiplier = deathSort.direction === 'asc' ? 1 : -1

    return [...deaths].sort((left, right) => {
      const primarySort = compareDeathRows(left, right, deathSort.key) * directionMultiplier

      if (primarySort !== 0) return primarySort

      return (
        compareText(left.lastAndMiddleNames, right.lastAndMiddleNames) ||
        compareText(left.firstName, right.firstName) ||
        compareText(left.memberMatriculationNumber, right.memberMatriculationNumber)
      )
    })
  }, [deaths, deathSort])

  const sortedGroups = useMemo(() => {
    const directionMultiplier = groupSort.direction === 'asc' ? 1 : -1

    return [...groups].sort((left, right) => {
      const primarySort = compareGroupRows(left, right, groupSort.key) * directionMultiplier

      if (primarySort !== 0) return primarySort

      return compareText(left.sponsorCode, right.sponsorCode)
    })
  }, [groups, groupSort])

  const groupTotalPages = Math.max(1, Math.ceil(sortedGroups.length / groupRowsPerPage))
  const activeGroupPage = Math.min(groupCurrentPage, groupTotalPages)

  const {
    pages: groupPages,
    showLeftEllipsis: showGroupLeftEllipsis,
    showRightEllipsis: showGroupRightEllipsis
  } = usePagination({
    currentPage: activeGroupPage,
    paginationItemsToDisplay: 3,
    totalPages: groupTotalPages
  })

  const handleDeathSort = (key: DeathSortKey) => {
    setDeathSort(currentSort => ({
      direction: getNextDirection(currentSort, key),
      key
    }))
  }

  const handleGroupSort = (key: GroupSortKey) => {
    setGroupSort(currentSort => ({
      direction: getNextDirection(currentSort, key),
      key
    }))
  }

  const handleGroupRowsPerPageChange = (value: string) => {
    setGroupRowsPerPage(Number(value))
    setGroupCurrentPage(1)
  }

  return (
    <>
      <Card data-sponsor-contribution-section className='w-full max-w-full min-w-0 overflow-hidden print:shadow-none'>
        <CardHeader>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
            <div>
              <CardTitle>Deaths Included In This Contribution</CardTitle>
              <CardDescription>
                These rows were saved when the admin clicked Publish Contribution for this contribution period.
              </CardDescription>
            </div>
            <SortControl
              columns={deathSortColumns}
              label='Sort deaths by'
              onSort={handleDeathSort}
              setDirection={direction => setDeathSort(currentSort => ({ ...currentSort, direction }))}
              sort={deathSort}
            />
          </div>
        </CardHeader>
        <CardContent className='min-w-0'>
          <div className='max-w-full overflow-hidden rounded-lg border md:overflow-x-auto print:overflow-visible'>
            <Table mobileCards className='min-w-0 table-fixed text-[11px] sm:text-xs md:min-w-max md:text-sm'>
              <TableHeader>
                <TableRow className='bg-primary hover:bg-primary print:bg-muted print:hover:bg-muted'>
                  {deathSortColumns.map(column => (
                    <SortHeader
                      key={column.key}
                      align={column.align}
                      className={column.className}
                      onSort={handleDeathSort}
                      sort={deathSort}
                      sortKey={column.key}
                      title={column.label}
                    >
                      {column.shortLabel ? (
                        <>
                          <span className='sm:hidden'>{column.shortLabel}</span>
                          <span className='hidden sm:inline'>{column.label}</span>
                        </>
                      ) : (
                        column.label
                      )}
                    </SortHeader>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDeaths.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className='text-muted-foreground h-24 text-center'>
                      No deceased-member rows were saved with this published table.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedDeaths.map(death => (
                    <TableRow key={death.id} className='odd:bg-muted/30 even:bg-background'>
                      <TableCell
                        data-label='Matriculation'
                        className='w-24 px-1.5 font-mono font-semibold break-all whitespace-normal md:w-28 md:px-2 md:text-sm md:whitespace-nowrap'
                      >
                        {death.memberMatriculationNumber}
                      </TableCell>
                      <TableCell
                        data-label='First Name'
                        className='w-32 px-1.5 font-semibold break-words whitespace-normal md:w-44 md:px-2 xl:w-52'
                      >
                        {death.firstName}
                      </TableCell>
                      <TableCell data-label='Last Name' className='w-44 font-semibold md:w-64 xl:w-72'>
                        {death.lastAndMiddleNames}
                      </TableCell>
                      <TableCell data-label='Registration Date' className='hidden whitespace-nowrap lg:table-cell'>
                        {formatDate(death.registrationDate)}
                      </TableCell>
                      <TableCell
                        data-label='Date of Death'
                        className='px-1.5 break-words whitespace-normal md:min-w-40 md:px-2 md:whitespace-nowrap'
                      >
                        {formatDate(death.dateOfDeath)}
                      </TableCell>
                      <TableCell data-label='Death Certificate' className='px-1.5 text-center md:min-w-36 md:px-2'>
                        <ContributionTableDocumentLink document={death.deathCertificate} label='Death certificate' />
                      </TableCell>
                      <TableCell data-label='Deceased Picture' className='px-1.5 text-center md:min-w-36 md:px-2'>
                        <ContributionTableDocumentLink document={death.deceasedPicture} label='Deceased picture' />
                      </TableCell>
                      <TableCell
                        data-label='Amount'
                        className='w-24 px-1 text-right font-semibold whitespace-nowrap md:w-28 md:px-2'
                      >
                        {currencyFormatter.format(death.amountToContribute)}
                      </TableCell>
                      <TableCell data-label='Sponsor Code' className='hidden w-20 px-1 md:table-cell md:w-24 md:px-2'>
                        <span className='block truncate font-mono font-semibold'>{death.sponsorCode}</span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card data-sponsor-contribution-section className='w-full max-w-full min-w-0 overflow-hidden print:shadow-none'>
        <CardHeader>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
            <div>
              <CardTitle>Amount Each Sponsor Should Contribute</CardTitle>
              <CardDescription>
                Each sponsor amount is based on {totalVestedMembers} vested loved one
                {totalVestedMembers === 1 ? '' : 's'} at {currencyFormatter.format(amountPerVestedMember)} per vested
                loved one.
              </CardDescription>
            </div>
            <div className='flex flex-col gap-3 sm:items-end print:hidden'>
              <div className='flex items-center justify-between gap-2 sm:justify-end'>
                <label
                  htmlFor={groupRowsPerPageSelectId}
                  className='text-muted-foreground text-sm font-medium whitespace-nowrap'
                >
                  Lines
                </label>
                <Select value={String(groupRowsPerPage)} onValueChange={handleGroupRowsPerPageChange}>
                  <SelectTrigger id={groupRowsPerPageSelectId} size='sm' className='w-24'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align='end'>
                    {groupRowsPerPageOptions.map(option => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <SortControl
                columns={groupSortColumns}
                label='Sort sponsors by'
                onSort={handleGroupSort}
                setDirection={direction => setGroupSort(currentSort => ({ ...currentSort, direction }))}
                sort={groupSort}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className='min-w-0'>
          <div className='max-w-full overflow-hidden rounded-lg border md:overflow-x-auto print:overflow-visible'>
            <Table
              data-sponsor-contribution-table
              mobileCards
              className='min-w-0 table-fixed text-xs md:min-w-max md:text-sm'
            >
              <TableHeader>
                <TableRow className='bg-primary hover:bg-primary print:bg-muted print:hover:bg-muted'>
                  <TableHead className='text-primary-foreground w-12 px-1.5 text-right md:px-2' title='No.'>
                    No.
                  </TableHead>
                  {groupSortColumns.map(column => (
                    <SortHeader
                      key={column.key}
                      align={column.align}
                      className={column.className}
                      onSort={handleGroupSort}
                      sort={groupSort}
                      sortKey={column.key}
                      title={column.label}
                    >
                      {column.shortLabel ? (
                        <>
                          <span className='sm:hidden'>{column.shortLabel}</span>
                          <span className='hidden sm:inline'>{column.label}</span>
                        </>
                      ) : (
                        column.label
                      )}
                    </SortHeader>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedGroups.map((group, index) => {
                  const isPageVisible =
                    index >= (activeGroupPage - 1) * groupRowsPerPage && index < activeGroupPage * groupRowsPerPage

                  return (
                    <TableRow
                      key={group.sponsorCode}
                      data-page-visible={isPageVisible ? 'true' : 'false'}
                      className={cn(
                        'h-12 hover:bg-gray-300 print:table-row',
                        isPageVisible && 'odd:bg-gray-200 even:bg-white',
                        index % 2 === 0 ? 'print:bg-gray-200' : 'print:bg-white'
                      )}
                    >
                      <TableCell data-label='No.' className='px-1.5 text-right font-semibold md:px-2'>
                        {index + 1}
                      </TableCell>
                      <TableCell
                        data-label='Code'
                        className='px-1.5 font-mono text-sm font-semibold md:min-w-20 md:px-2'
                      >
                        {group.sponsorCode}
                      </TableCell>
                      <TableCell
                        data-label='Vested Loved Ones'
                        className='px-1.5 text-right font-semibold tabular-nums md:min-w-40 md:px-2'
                      >
                        {group.vestedMembersCount}
                      </TableCell>
                      <TableCell
                        data-label='Account Before Contribution'
                        className='px-1.5 text-right font-semibold whitespace-nowrap tabular-nums md:min-w-44 md:px-2'
                      >
                        {currencyFormatter.format(group.accountBeforeContribution)}
                      </TableCell>
                      <TableCell
                        data-label='Amount'
                        className='px-1.5 text-right font-semibold whitespace-nowrap md:min-w-48 md:px-2'
                      >
                        {currencyFormatter.format(group.amountOwed)}
                      </TableCell>
                      <TableCell
                        data-label='Account After Contribution'
                        className='px-1.5 text-right font-semibold whitespace-nowrap tabular-nums md:min-w-44 md:px-2'
                      >
                        {currencyFormatter.format(group.accountAfterContribution)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {sortedGroups.length > 0 ? (
            <div className='mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row print:hidden'>
              <p className='text-muted-foreground text-sm' aria-live='polite'>
                Showing {(activeGroupPage - 1) * groupRowsPerPage + 1}-
                {Math.min(activeGroupPage * groupRowsPerPage, sortedGroups.length)} of {sortedGroups.length}
              </p>
              {groupTotalPages > 1 ? (
                <PaginationControls
                  activePage={activeGroupPage}
                  canNext={activeGroupPage < groupTotalPages}
                  canPrevious={activeGroupPage > 1}
                  getPageButtonClassName={isActive =>
                    isActive
                      ? undefined
                      : 'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40'
                  }
                  iconClassName='text-primary'
                  labelClassName='text-primary max-sm:hidden'
                  onNext={() => setGroupCurrentPage(Math.min(groupTotalPages, activeGroupPage + 1))}
                  onPageChange={setGroupCurrentPage}
                  onPrevious={() => setGroupCurrentPage(Math.max(1, activeGroupPage - 1))}
                  pages={groupPages}
                  showLeftEllipsis={showGroupLeftEllipsis}
                  showRightEllipsis={showGroupRightEllipsis}
                />
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  )
}

export default PublishedContributionTables
