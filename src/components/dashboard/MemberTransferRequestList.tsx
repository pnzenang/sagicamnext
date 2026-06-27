'use client'

import { useMemo } from 'react'

import { ArrowLeftRight, Inbox, Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { memberTransferRequestStatusLabels, type MemberTransferRequestStatus } from '@/utils/types'

import MemberTransferRequestCard, {
  formatTransferRequestDateTime,
  getTransferRequestMemberName,
  MemberTransferRequestActions,
  RequestStatusBadge,
  type MemberTransferRequestCardData
} from './MemberTransferRequestCard'

type EmptyIcon = 'inbox' | 'transfer'

const getStatusLabel = (status: string) =>
  memberTransferRequestStatusLabels[status as MemberTransferRequestStatus] ?? status

const getRequestSearchValue = (request: MemberTransferRequestCardData) =>
  [
    request.currentFirstName,
    request.currentLastAndMiddleNames,
    request.initiatingSponsorCode,
    request.member?.firstName,
    request.member?.lastAndMiddleNames,
    request.member?.memberMatriculationNumber,
    request.member?.sponsorCode,
    request.memberMatriculationNumber,
    request.receivingSponsorCode,
    request.rejectionReason,
    getStatusLabel(request.status),
    request.status
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

const EmptyStateIcon = ({ icon }: { icon: EmptyIcon }) => {
  const Icon = icon === 'inbox' ? Inbox : ArrowLeftRight

  return <Icon className='text-muted-foreground mx-auto mb-3 size-8' />
}

const MemberTransferRequestTable = ({
  currentUserClerkId,
  isAdminUser,
  requests
}: {
  currentUserClerkId?: string
  isAdminUser: boolean
  requests: MemberTransferRequestCardData[]
}) => (
  <div className='bg-background hidden overflow-hidden rounded-lg border md:block'>
    <Table className='min-w-[1120px] table-fixed [&_td]:whitespace-normal [&_th]:whitespace-normal'>
      <TableHeader>
        <TableRow className='bg-primary hover:bg-primary/90 h-12'>
          <TableHead className='w-[18%] px-4 font-extrabold text-white'>Member</TableHead>
          <TableHead className='w-[12%] px-4 font-extrabold text-white'>Matriculation</TableHead>
          <TableHead className='w-[12%] px-4 font-extrabold text-white'>Present sponsor</TableHead>
          <TableHead className='w-[12%] px-4 font-extrabold text-white'>Receiving sponsor</TableHead>
          <TableHead className='w-[15%] px-4 font-extrabold text-white'>Status</TableHead>
          <TableHead className='w-[12%] px-4 font-extrabold text-white'>Submitted</TableHead>
          <TableHead className='w-[19%] px-4 font-extrabold text-white'>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map(request => (
          <TableRow key={request.id} className='hover:bg-primary/10'>
            <TableCell className='px-4 py-4 align-top'>
              <div className='flex min-w-0 items-start gap-2'>
                <ArrowLeftRight className='text-primary mt-0.5 size-4 shrink-0' />
                <span className='font-extrabold break-words'>{getTransferRequestMemberName(request)}</span>
              </div>
            </TableCell>
            <TableCell className='px-4 py-4 align-top font-mono text-xs font-semibold break-all'>
              {request.memberMatriculationNumber}
            </TableCell>
            <TableCell className='px-4 py-4 align-top text-sm font-semibold break-words'>
              {request.initiatingSponsorCode}
            </TableCell>
            <TableCell className='px-4 py-4 align-top text-sm font-semibold break-words'>
              {request.receivingSponsorCode}
            </TableCell>
            <TableCell className='px-4 py-4 align-top'>
              <div className='grid gap-2'>
                <RequestStatusBadge status={request.status} />
                {request.rejectionReason ? (
                  <p className='rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
                    {request.rejectionReason}
                  </p>
                ) : null}
              </div>
            </TableCell>
            <TableCell className='text-muted-foreground px-4 py-4 align-top text-xs font-semibold'>
              {formatTransferRequestDateTime(request.createdAt)}
            </TableCell>
            <TableCell className='px-4 py-4 align-top'>
              <MemberTransferRequestActions
                className='min-w-0'
                compact
                currentUserClerkId={currentUserClerkId}
                emptyLabel='No action needed'
                isAdminUser={isAdminUser}
                request={request}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
)

const MemberTransferRequestList = ({
  currentUserClerkId,
  emptyDescription,
  emptyIcon,
  emptyTitle,
  isAdminUser,
  requests,
  searchPlaceholder,
  storageKey
}: {
  currentUserClerkId?: string
  emptyDescription: string
  emptyIcon: EmptyIcon
  emptyTitle: string
  isAdminUser: boolean
  requests: MemberTransferRequestCardData[]
  searchPlaceholder: string
  storageKey: string
}) => {
  const [search, setSearch] = usePersistentState(storageKey, '')
  const normalizedSearch = search.trim().toLowerCase()

  const filteredRequests = useMemo(() => {
    if (!normalizedSearch) return requests

    return requests.filter(request => getRequestSearchValue(request).includes(normalizedSearch))
  }, [normalizedSearch, requests])

  const searchInputId = `${storageKey.replace(/[^a-z0-9-]/gi, '-')}-search`

  return (
    <div className='grid gap-3'>
      {requests.length > 0 ? (
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <form role='search' onSubmit={event => event.preventDefault()} className='min-w-0 flex-1'>
            <label htmlFor={searchInputId} className='sr-only'>
              Search transfer requests
            </label>
            <div className='relative'>
              <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
              <Input
                id={searchInputId}
                type='search'
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className='bg-background h-10 pl-9 text-sm font-semibold'
              />
            </div>
          </form>
          {normalizedSearch ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-10 w-full sm:w-fit'
              onClick={() => setSearch('')}
            >
              <X />
              Clear
            </Button>
          ) : null}
        </div>
      ) : null}

      {normalizedSearch ? (
        <p className='text-muted-foreground text-xs'>
          Showing {filteredRequests.length} of {requests.length} request{requests.length === 1 ? '' : 's'}.
        </p>
      ) : null}

      {requests.length === 0 ? (
        <Card className='rounded-lg'>
          <CardContent className='py-8 text-center'>
            <EmptyStateIcon icon={emptyIcon} />
            <p className='font-semibold'>{emptyTitle}</p>
            <p className='text-muted-foreground mt-1 text-sm'>{emptyDescription}</p>
          </CardContent>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card className='rounded-lg'>
          <CardContent className='py-8 text-center'>
            <Search className='text-muted-foreground mx-auto mb-3 size-8' />
            <p className='font-semibold'>No transfer requests match your search.</p>
            <p className='text-muted-foreground mt-1 text-sm'>
              Try another name, matriculation number, sponsor code, or status.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className='grid gap-4 md:hidden'>
            {filteredRequests.map(request => (
              <MemberTransferRequestCard
                key={request.id}
                currentUserClerkId={currentUserClerkId}
                isAdminUser={isAdminUser}
                request={request}
              />
            ))}
          </div>
          <MemberTransferRequestTable
            currentUserClerkId={currentUserClerkId}
            isAdminUser={isAdminUser}
            requests={filteredRequests}
          />
        </>
      )}
    </div>
  )
}

export default MemberTransferRequestList
