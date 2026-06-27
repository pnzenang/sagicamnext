import { ArrowLeftRight, Inbox } from 'lucide-react'

import AutoRefreshAt from '@/components/dashboard/AutoRefreshAt'
import MemberTransferRequestList from '@/components/dashboard/MemberTransferRequestList'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { fetchMemberTransferPageAction } from '@/utils/actions'

import MemberTransferRequestForm from './MemberTransferRequestForm'

const MemberTransferPage = async () => {
  const { members, nextCancelledTransferRefreshAt, profile, requests, sponsors } = await fetchMemberTransferPageAction()

  const incomingActionCount = requests.filter(
    request => request.receivingClerkId === profile.clerkId && request.status === 'receiving_sponsor_pending'
  ).length

  return (
    <section className='grid w-full max-w-full min-w-0 gap-5 overflow-hidden px-0 py-4 sm:px-6 sm:py-8 lg:px-8'>
      <AutoRefreshAt refreshAt={nextCancelledTransferRefreshAt} />

      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-normal sm:text-3xl'>Member Transfer</h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Request a loved one transfer and review transfer requests sent to your sponsor code.
          </p>
        </div>
        <Badge variant='outline' className='w-fit text-sm'>
          {requests.length} request{requests.length === 1 ? '' : 's'}
        </Badge>
      </div>

      {incomingActionCount > 0 ? (
        <Card className='rounded-lg border-blue-200 bg-blue-50 py-0 dark:border-blue-900 dark:bg-blue-950/40'>
          <CardContent className='flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex min-w-0 items-start gap-3'>
              <Inbox className='mt-0.5 size-5 shrink-0 text-blue-700 dark:text-blue-300' />
              <div className='min-w-0'>
                <p className='font-extrabold text-blue-800 dark:text-blue-200'>Transfer approval required</p>
                <p className='text-sm text-blue-700 dark:text-blue-300'>
                  {incomingActionCount} request{incomingActionCount === 1 ? '' : 's'} need your approval.
                </p>
              </div>
            </div>
            <Badge variant='outline' className='w-fit border-blue-300 bg-white text-blue-800 dark:bg-black/20 dark:text-blue-200'>
              {incomingActionCount} required
            </Badge>
          </CardContent>
        </Card>
      ) : null}

      {members.length === 0 ? (
        <Card className='rounded-lg'>
          <CardContent className='py-8 text-center'>
            <ArrowLeftRight className='text-muted-foreground mx-auto mb-3 size-8' />
            <p className='font-semibold'>No loved ones available to transfer.</p>
            <p className='text-muted-foreground mt-1 text-sm'>Your active loved ones will appear here.</p>
          </CardContent>
        </Card>
      ) : sponsors.length === 0 ? (
        <Card className='rounded-lg'>
          <CardContent className='py-8 text-center'>
            <ArrowLeftRight className='text-muted-foreground mx-auto mb-3 size-8' />
            <p className='font-semibold'>No receiving sponsors found.</p>
            <p className='text-muted-foreground mt-1 text-sm'>Another sponsor profile is required before a transfer can be requested.</p>
          </CardContent>
        </Card>
      ) : (
        <MemberTransferRequestForm members={members} sponsors={sponsors} />
      )}

      <div className='grid gap-3'>
        <div className='flex items-center gap-2'>
          <ArrowLeftRight className='text-primary size-5' />
          <h2 className='text-lg font-extrabold'>Transfer requests</h2>
        </div>
        <MemberTransferRequestList
          currentUserClerkId={profile.clerkId}
          emptyDescription='Submitted and incoming requests will appear here.'
          emptyIcon='inbox'
          emptyTitle='No member transfer requests found.'
          isAdminUser={false}
          requests={requests}
          searchPlaceholder='Search name, matriculation, sponsor code, or status'
          storageKey='sagicam:member-transfer:request-search'
        />
      </div>
    </section>
  )
}

export default MemberTransferPage
