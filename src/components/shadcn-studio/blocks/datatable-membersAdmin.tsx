'use client'
import { useActionState, useEffect, useId, useMemo, useState } from 'react'

import { useFormStatus } from 'react-dom'

import day from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

day.extend(advancedFormat)

import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Clock3,
  Ellipsis,
  Trash2,
  FileSpreadsheetIcon,
  FileTextIcon,
  SearchIcon,
  UploadIcon,
  XIcon,
  Cross,
  Loader,
  ShieldCheck,
  Pencil
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type {
  Column,
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowData,
  RowSelectionState
} from '@tanstack/react-table'
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
import { useRouter } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { usePagination } from '@/hooks/use-pagination'
import { usePersistentState } from '@/hooks/use-persistent-state'

import MembershipSummaryCards from '@/components/dashboard/MembershipSummaryCards'
import RemoveOverduePendingMembersButton from '@/components/global/RemoveOverduePendingMembersButton'
import ResponsiveTableCards from '@/components/dashboard/ResponsiveTableCards'
import { TablePaginationControls } from '@/components/dashboard/TablePaginationControls'
import { cn } from '@/lib/utils'
import {
  getOverdueRegistrationPaymentCreatedAtCutoff,
  getRegistrationPaymentCountdown,
  getRegistrationPaymentCountdownLabel,
  registrationPaymentDeadlineDays
} from '@/utils/registration-payment-deadline'
import { awaitingPublicationVestingLongevityDays } from '@/utils/sagicam-member-longevity'
import { getNameSearchValue, nameSearchColumnId, normalizeNameColumnFilters } from '@/utils/table-filters'
import {
  removeSelectedOverduePendingMembersAction,
  updateSelectedMembersStatusForAdminAction,
  vestEligibleAwaitingPublicationMembersAction
} from '@/utils/actions'
import { memberStatus, type MemberType } from '@/utils/types'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
    headerTitle?: string
  }
}

const getRegistrationPaymentWarning = (member: MemberType) => {
  if (member.memberStatus !== memberStatus.Pending) return ''

  const countdown = getRegistrationPaymentCountdown(member.createdAt)
  const countdownLabel = getRegistrationPaymentCountdownLabel(countdown.daysRemaining)

  return `${countdownLabel}.`
}

const getRegistrationPaymentSortValue = (member: MemberType) => {
  if (member.memberStatus !== memberStatus.Pending) return undefined

  return getRegistrationPaymentCountdown(member.createdAt).daysRemaining
}

const RegistrationPaymentWarningCell = ({ member }: { member: MemberType }) => {
  const warning = getRegistrationPaymentWarning(member)

  if (member.memberStatus !== memberStatus.Pending) return null

  return (
    <Badge
      variant='outline'
      className='border-destructive/30 bg-destructive/10 text-destructive dark:border-destructive/40 dark:bg-destructive/15 max-w-full shrink rounded-sm whitespace-normal'
    >
      <AlertTriangle aria-hidden='true' />
      {warning}
    </Badge>
  )
}

const columns: ColumnDef<MemberType>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        aria-label='Select all visible members'
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(Boolean(value))}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label='Select member'
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(Boolean(value))}
      />
    ),
    enableHiding: false,
    enableSorting: false,
    size: 40
  },
  {
    id: nameSearchColumnId,
    header: 'Names',
    accessorFn: getNameSearchValue
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
    meta: {
      filterVariant: 'select',
      headerTitle: 'Sponsor Code'
    },
    size: 60
  },
  {
    header: 'Matric.',
    accessorKey: 'memberMatriculationNumber',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <div className='flex flex-col'>
          <span className='font-medium'>{row.getValue('memberMatriculationNumber')}</span>
        </div>
      </div>
    ),
    meta: {
      headerTitle: 'Matriculation Number'
    },
    size: 100
  },
  {
    header: 'Last',
    accessorKey: 'lastAndMiddleNames',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <div className='flex flex-col'>
          <span className='font-medium'>{row.getValue('lastAndMiddleNames')}</span>
        </div>
      </div>
    ),
    meta: {
      headerTitle: 'Last and Middle Names'
    },
    size: 160
  },
  {
    header: 'First',
    accessorKey: 'firstName',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <div className='flex flex-col'>
          <span className='font-medium'>{row.getValue('firstName')}</span>
        </div>
      </div>
    ),
    meta: {
      headerTitle: 'First Name'
    },
    size: 160
  },

  {
    accessorKey: 'createdAt', // The key in your data object
    header: 'Days',
    cell: ({ row }) => {
      const field = row.getValue('createdAt') as Date
      const time = day(Date.now())

      const formattedLongevity = new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 2 }).format(
        time.diff(field.toDateString(), 'days')
      )

      return <div>{formattedLongevity}</div>
    },
    meta: {
      headerTitle: 'Longevity (Days)'
    },
    size: 80
  },
  {
    header: 'Rec.',
    accessorKey: 'delegateRecommendation',
    cell: ({ row }) => {
      const recommendation = row.getValue('delegateRecommendation') as string

      const styles = {
        transfer: 'text-blue-500 bg-transparent ',
        confirm: ' text-muted-foreground bg-transparent',
        Confirm:
          'bg-green-600/10 text-zinc-600 focus-visible:ring-zinc-600/20 dark:bg-zinc-400/10 dark:text-zinc-400 dark:focus-visible:ring-zinc-400/40 [a&]:hover:bg-zinc-600/5 dark:[a&]:hover:bg-zinc-400/5',
        Transfer_From_Sagi:
          'bg-orange-600/10 text-orange-600 focus-visible:ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:focus-visible:ring-orange-400/40 [a&]:hover:bg-orange-600/5 dark:[a&]:hover:bg-orange-400/5',
        Transfer_Out:
          'bg-blue-600/10 text-blue-600 focus-visible:ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40 [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5',
        Transfer_In:
          'bg-purple-600/10 text-purple-600 focus-visible:ring-purple-600/20 dark:bg-purple-400/10 dark:text-purple-400 dark:focus-visible:ring-purple-400/40 [a&]:hover:bg-purple-600/5 dark:[a&]:hover:bg-purple-400/5'
      }[recommendation]

      return (
        <Badge className={cn('rounded-sm border capitalize focus-visible:outline-none', styles)}>
          {row.getValue('delegateRecommendation')}
        </Badge>
      )
    },
    meta: {
      filterVariant: 'select',
      headerTitle: 'Recommendation'
    },
    size: 100
  },

  {
    header: 'Status',
    accessorKey: 'memberStatus',
    cell: ({ row }) => {
      const status = row.getValue('memberStatus') as string

      const styles = {
        vested:
          'bg-teal-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5',
        pending:
          'bg-amber-600/10 text-amber-600 focus-visible:ring-amber-600/20 dark:bg-amber-600/10 dark:text-amber-600 dark:focus-visible:ring-amber-600/40 [a&]:hover:bg-amber-600/5 dark:[a&]:hover:bg-amber-600/5',
        not_in_good_standing:
          'bg-red-600/10 text-red-600 focus-visible:ring-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5',
        awaiting_publication:
          'bg-blue-600/10 text-blue-600 focus-visible:ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40 [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5'
      }[status]

      return (
        <Badge className={cn('rounded-sm border-none font-bold capitalize focus-visible:outline-none', styles)}>
          {row.getValue('memberStatus')}
        </Badge>
      )
    },
    meta: {
      filterVariant: 'select',
      headerTitle: 'Member Status'
    },
    size: 110
  },
  {
    id: 'registrationPaymentWarning',
    header: `Reg. Dues (${registrationPaymentDeadlineDays}d)`,
    accessorFn: row => getRegistrationPaymentSortValue(row),
    cell: ({ row }) => <RegistrationPaymentWarningCell member={row.original} />,
    meta: {
      headerTitle: `Registration Dues (${registrationPaymentDeadlineDays} days)`
    },
    sortUndefined: 'last',
    size: 110
  },
  {
    header: 'Actions',
    accessorKey: 'id',
    cell: ({ row: { original } }) => {
      // Destructuring 'id' directly from the row data
      const { id } = original

      return <RowActions memberId={id} />
    },
    size: 65
  }
]

const getTableColumnWidth = (columnSize: number, totalSize: number) => `${(columnSize / totalSize) * 100}%`

type MembershipSummary = {
  awaiting: number
  delinquent: number
  pending: number
  total: number
  vested: number
}

const MembersDataTable = ({
  data,
  membershipSummary
}: {
  data: MemberType[]
  membershipSummary: MembershipSummary
}) => {
  const [columnFilters, setColumnFilters] = usePersistentState<ColumnFiltersState>(
    'sagicam:admin-members:column-filters',
    []
  )

  const normalizedColumnFilters = useMemo(() => normalizeNameColumnFilters(columnFilters), [columnFilters])

  const [autoVestState, autoVestFormAction] = useActionState(vestEligibleAwaitingPublicationMembersAction, {
    message: ''
  })

  const [bulkStatusState, bulkStatusFormAction] = useActionState(updateSelectedMembersStatusForAdminAction, {
    message: ''
  })

  const [bulkRemoveOverdueState, bulkRemoveOverdueFormAction] = useActionState(
    removeSelectedOverduePendingMembersAction,
    {
      message: ''
    }
  )

  const pageSize = 100

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize
  })

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const router = useRouter()

  const table = useReactTable({
    data,
    columns,
    getRowId: row => row.id,
    state: {
      columnFilters: normalizedColumnFilters,
      pagination,
      rowSelection
    },
    initialState: {
      columnVisibility: {
        [nameSearchColumnId]: false
      }
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    enableRowSelection: true,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination
  })

  const selectedMembers = table.getSelectedRowModel().rows.map(row => row.original)
  const selectedMemberIds = selectedMembers.map(member => member.id)
  const selectedMembersPayload = JSON.stringify(selectedMemberIds)
  const selectedMembersCount = selectedMemberIds.length
  const selectedOverdueCutoffTime = getOverdueRegistrationPaymentCreatedAtCutoff().getTime()

  const selectedOverduePendingCount = selectedMembers.filter(
    member =>
      member.memberStatus === memberStatus.Pending &&
      new Date(member.createdAt).getTime() < selectedOverdueCutoffTime
  ).length

  useEffect(() => {
    if (bulkStatusState.message || bulkRemoveOverdueState.message) {
      setRowSelection({})
      router.refresh()
    }
  }, [bulkRemoveOverdueState.message, bulkStatusState.message, router])

  const eligibleAutoVestCount = useMemo(() => {
    const now = day()

    return data.filter(
      member =>
        member.memberStatus === memberStatus.Awaiting &&
        now.diff(day(member.createdAt), 'days') >= awaitingPublicationVestingLongevityDays
    ).length
  }, [data])

  const overduePendingMembersCount = useMemo(() => {
    const overdueCutoffTime = getOverdueRegistrationPaymentCreatedAtCutoff().getTime()

    return data.filter(
      member => member.memberStatus === memberStatus.Pending && new Date(member.createdAt).getTime() < overdueCutoffTime
    ).length
  }, [data])

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

  const exportFilteredPageToExcel = () => {
    const dataToExport = table.getFilteredRowModel().rows.map(row => {
      const member = row.original

      return {
        Code: member.sponsorCode,
        Matriculation: member.memberMatriculationNumber,
        'Last Names': member.lastAndMiddleNames,
        'First Name': member.firstName,
        'Longevity(Days)': day(Date.now()).diff(day(member.createdAt), 'days'),
        Recommendation: row.getValue('delegateRecommendation'),
        Status: member.memberStatus,
        [`Registration Dues (${registrationPaymentDeadlineDays} days)`]: getRegistrationPaymentWarning(member)
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Loved Ones')

    worksheet['!cols'] = [
      { wch: 14 },
      { wch: 18 },
      { wch: 24 },
      { wch: 18 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 28 }
    ]

    XLSX.writeFile(workbook, `loved-ones-filtered-export-${new Date().toISOString().split('T')[0]}.xlsx`)
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
    <div className='border-primary max-w-full min-w-0 overflow-hidden rounded border'>
      <div className='min-w-0 border-b'>
        <div className='flex flex-col gap-4 border-b p-3 sm:p-6'>
          <span className='text-2xl font-semibold sm:text-4xl lg:text-6xl'>All Registered Loved Ones (Admin)</span>
          <MembershipSummaryCards {...membershipSummary} />
          <div className='flex flex-col items-start gap-3 px-0 py-3 sm:px-6 sm:py-4 md:flex-row md:items-center md:justify-between'>
            <p
              className='text-primary text-sm font-extrabold whitespace-normal md:shrink-0 md:whitespace-nowrap'
              aria-live='polite'
            >
              <span>{table.getRowCount().toString()} Member(s) Found</span>
            </p>

            <div className='flex w-full max-w-full min-w-0 flex-wrap items-center justify-start gap-2 overflow-hidden md:w-auto md:flex-nowrap md:justify-end'>
              <TablePaginationControls
                table={table}
                pages={pages}
                showLeftEllipsis={showLeftEllipsis}
                showRightEllipsis={showRightEllipsis}
                className='mx-0 w-auto justify-start md:justify-end'
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className='shrink-0 bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-700/30 max-md:flex-1 max-md:justify-center'
                    disabled={eligibleAutoVestCount === 0}
                  >
                    <ShieldCheck />
                    Vest 30+ Days ({eligibleAutoVestCount})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Move eligible loved ones to Vested?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will move {eligibleAutoVestCount} loved one
                      {eligibleAutoVestCount === 1 ? '' : 's'} from Awaiting Publication to Vested and apply the $30
                      contribution credit to each related sponsor.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <form action={autoVestFormAction}>
                    <AlertDialogFooter>
                      <AlertDialogCancel type='button'>Cancel</AlertDialogCancel>
                      <AutoVestSubmitButton disabled={eligibleAutoVestCount === 0} />
                    </AlertDialogFooter>
                  </form>
                </AlertDialogContent>
              </AlertDialog>
              <RemoveOverduePendingMembersButton overdueCount={overduePendingMembersCount} />
              <Button
                className='bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 shrink-0 max-md:flex-1 max-md:justify-center'
                onClick={exportFilteredPageToExcel}
              >
                <FileSpreadsheetIcon />
                Export Page
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className='bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 max-md:flex-1 max-md:justify-center'>
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
          {selectedMembersCount > 0 ? (
            <div className='flex w-full max-w-full min-w-0 flex-wrap items-center justify-start gap-2 overflow-hidden rounded-md border bg-background/60 p-2'>
              <BulkStatusActionButton
                className='bg-blue-700 text-white hover:bg-blue-800 focus-visible:ring-blue-700/30'
                disabled={false}
                formAction={bulkStatusFormAction}
                icon={Clock3}
                memberIdsPayload={selectedMembersPayload}
                selectedCount={selectedMembersCount}
                status={memberStatus.Awaiting}
                text='Make Awaiting'
              />
              <BulkStatusActionButton
                className='bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-700/30'
                disabled={false}
                formAction={bulkStatusFormAction}
                icon={ShieldCheck}
                memberIdsPayload={selectedMembersPayload}
                selectedCount={selectedMembersCount}
                status={memberStatus.Vested}
                text='Make Vested'
              />
              <BulkStatusActionButton
                className='bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-700/30'
                disabled={false}
                formAction={bulkStatusFormAction}
                icon={AlertCircle}
                memberIdsPayload={selectedMembersPayload}
                selectedCount={selectedMembersCount}
                status={memberStatus.Delinquent}
                text='Make Delinquent'
              />
              <BulkRemoveOverdueActionButton
                className='bg-zinc-900 text-white hover:bg-zinc-950 focus-visible:ring-zinc-900/30'
                disabled={selectedOverduePendingCount === 0}
                formAction={bulkRemoveOverdueFormAction}
                icon={Trash2}
                memberIdsPayload={selectedMembersPayload}
                selectedCount={selectedOverduePendingCount}
                text='Remove Overdue'
              />
            </div>
          ) : null}
          {autoVestState.message ? (
            <p className='text-primary text-sm font-semibold' aria-live='polite'>
              {autoVestState.message}
            </p>
          ) : null}
          {bulkStatusState.message ? (
            <p className='text-primary text-sm font-semibold' aria-live='polite'>
              {bulkStatusState.message}
            </p>
          ) : null}
          {bulkRemoveOverdueState.message ? (
            <p className='text-primary text-sm font-semibold' aria-live='polite'>
              {bulkRemoveOverdueState.message}
            </p>
          ) : null}
          <div className='grid grid-cols-1 gap-6 max-md:*:last:col-span-full sm:grid-cols-2 md:grid-cols-3'>
            {/* <Filter column={table.getColumn('dateOfBirth')!} /> */}
          </div>
        </div>
        <div className='flex min-w-0 flex-col items-start gap-4 p-3 sm:p-6 md:flex-row md:items-center md:justify-between'>
          <div className='flex w-full min-w-0 flex-col justify-start gap-2 md:flex-1 md:flex-row md:flex-nowrap md:items-center'>
            <Filter column={table.getColumn('sponsorCode')!} />
            <Filter column={table.getColumn(nameSearchColumnId)!} />
            <Filter column={table.getColumn('delegateRecommendation')!} />
            <Filter column={table.getColumn('memberStatus')!} />
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
          <Table className='w-full min-w-0 table-fixed text-xs [&_td]:whitespace-normal [&_th]:whitespace-normal'>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className='bg-primary hover:bg-primary/80 h-12 border-t'>
                  {headerGroup.headers.map(header => {
                    const headerTitle =
                      header.column.columnDef.meta?.headerTitle ??
                      (typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : undefined)

                    const headerGroupSize = headerGroup.headers.reduce(
                      (total, currentHeader) => total + currentHeader.getSize(),
                      0
                    )

                    return (
                      <TableHead
                        key={header.id}
                        style={{ width: getTableColumnWidth(header.getSize(), headerGroupSize) }}
                        title={headerTitle}
                        className='h-12 overflow-hidden px-1.5 py-2 text-xs leading-tight font-extrabold text-white first:pl-2 last:pr-2'
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <div
                            className={cn(
                              header.column.getCanSort() &&
                                'flex h-full min-w-0 cursor-pointer items-center justify-start gap-1 select-none'
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
                              asc: <ArrowUp className='shrink-0 opacity-60' size={14} aria-hidden='true' />,
                              desc: <ArrowDown className='shrink-0 opacity-60' size={14} aria-hidden='true' />
                            }[header.column.getIsSorted() as string] ?? (
                              <ArrowUpDown className='shrink-0 opacity-60' size={14} aria-hidden='true' />
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
                table.getRowModel().rows.map(row => {
                  const visibleCells = row.getVisibleCells()
                  const rowSize = visibleCells.reduce((total, cell) => total + cell.column.getSize(), 0)

                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className='hover:bg-primary/30'
                    >
                      {visibleCells.map(cell => (
                        <TableCell
                          key={cell.id}
                          style={{ width: getTableColumnWidth(cell.column.getSize(), rowSize) }}
                          className='h-12 overflow-hidden px-1.5 py-1.5 text-xs break-words first:pl-2 last:pr-2'
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24 text-center'>
                    No Member Found, add members.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <ResponsiveTableCards
          table={table}
          emptyMessage='No Member Found, add members.'
          keepColumnsOnMobile
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
          />
        </div>
      </div>
    </div>
  )
}

export default MembersDataTable

function AutoVestSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button
      type='submit'
      disabled={disabled || pending}
      className='bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-700/30'
    >
      {pending ? (
        <>
          <Loader className='animate-spin' />
          Please wait...
        </>
      ) : (
        'Move to Vested'
      )}
    </Button>
  )
}

function BulkStatusActionButton({
  className,
  disabled,
  formAction,
  icon: Icon,
  memberIdsPayload,
  selectedCount,
  status,
  text
}: {
  className: string
  disabled: boolean
  formAction: (formData: FormData) => void
  icon: LucideIcon
  memberIdsPayload: string
  selectedCount: number
  status: memberStatus
  text: string
}) {
  return (
    <form action={formAction} className='contents'>
      <input type='hidden' name='memberIds' value={memberIdsPayload} />
      <input type='hidden' name='memberStatus' value={status} />
      <BulkStatusSubmitButton
        className={className}
        disabled={disabled}
        icon={Icon}
        selectedCount={selectedCount}
        text={text}
      />
    </form>
  )
}

function BulkRemoveOverdueActionButton({
  className,
  disabled,
  formAction,
  icon: Icon,
  memberIdsPayload,
  selectedCount,
  text
}: {
  className: string
  disabled: boolean
  formAction: (formData: FormData) => void
  icon: LucideIcon
  memberIdsPayload: string
  selectedCount: number
  text: string
}) {
  return (
    <form action={formAction} className='contents'>
      <input type='hidden' name='memberIds' value={memberIdsPayload} />
      <BulkStatusSubmitButton
        className={className}
        disabled={disabled}
        icon={Icon}
        selectedCount={selectedCount}
        text={text}
      />
    </form>
  )
}

function BulkStatusSubmitButton({
  className,
  disabled,
  icon: Icon,
  selectedCount,
  text
}: {
  className: string
  disabled: boolean
  icon: LucideIcon
  selectedCount: number
  text: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      type='submit'
      disabled={disabled || pending}
      className={cn('shrink-0 max-md:flex-1 max-md:justify-center', className)}
    >
      {pending ? <Loader className='animate-spin' /> : <Icon />}
      {pending ? 'Updating...' : `${text} (${selectedCount})`}
    </Button>
  )
}

function Filter({ column }: { column: Column<any, unknown> }) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()
  const { filterVariant } = column.columnDef.meta ?? {}
  const columnHeader = typeof column.columnDef.header === 'string' ? column.columnDef.header : ''
  const textFilterValue = (columnFilterValue ?? '') as string

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
      <div className='border-primary w-full min-w-0 space-y-2 rounded border md:max-w-none md:flex-1 xl:max-w-2xs'>
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
    <div className='border-primary w-full min-w-0 rounded border md:max-w-none md:flex-1 xl:max-w-2xs'>
      <Label htmlFor={`${id}-input`} className='sr-only'>
        {columnHeader}
      </Label>
      <div className='relative'>
        <Input
          id={`${id}-input`}
          className='peer px-9'
          value={textFilterValue}
          onChange={e => column.setFilterValue(e.target.value)}
          placeholder={`Search ${columnHeader.toLowerCase()}`}
          type='text'
        />
        <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
          <SearchIcon size={16} />
        </div>
        {textFilterValue ? (
          <button
            type='button'
            aria-label={`Clear ${columnHeader.toLowerCase()} search`}
            className='text-muted-foreground/80 hover:text-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 flex items-center justify-center pr-3 transition-colors outline-none focus-visible:ring-[3px]'
            onClick={() => column.setFilterValue(undefined)}
          >
            <XIcon size={16} />
          </button>
        ) : null}
      </div>
    </div>
  )
}

function RowActions({ memberId }: { memberId: string }) {
  const currentDay = new Date().getDate()
  const shouldShow = currentDay >= 12

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='flex'>
          <Button size='icon' variant='ghost' className='rounded-full p-2' aria-label='Edit item'>
            <Ellipsis className='size-6' aria-hidden='true' />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='center' className='border-primary rounded border'>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href={`/admin-members/${memberId}/edit`}>
              <span className='flex gap-3 text-blue-500'>
                <Pencil className='text-blue-500' />
                View and Edit Member&apos;s Details
              </span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={`/admin-members/${memberId}/deathAnnouncement`}>
              <span className='flex gap-3 text-purple-500'>
                <Cross className='text-purple-500' />
                Announce Member&apos;s Death
              </span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Link href={`/admin-members/${memberId}/removeMember`}>
              <span className='flex flex-row gap-3 text-red-500'>
                <Trash2 className='text-red-500' />
                Remove Member
              </span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
