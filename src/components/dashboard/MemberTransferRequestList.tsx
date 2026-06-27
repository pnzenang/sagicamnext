'use client'

import { useMemo } from 'react'

import { ArrowLeftRight, Inbox, Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { memberTransferRequestStatusLabels, type MemberTransferRequestStatus } from '@/utils/types'

import MemberTransferRequestCard, { type MemberTransferRequestCardData } from './MemberTransferRequestCard'

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
        <div className='grid gap-4 xl:grid-cols-2 2xl:grid-cols-3'>
          {filteredRequests.map(request => (
            <MemberTransferRequestCard
              key={request.id}
              currentUserClerkId={currentUserClerkId}
              isAdminUser={isAdminUser}
              request={request}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MemberTransferRequestList
