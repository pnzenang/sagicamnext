import { ArrowLeftRight, CheckCircle2, Clock3, ShieldCheck, XCircle } from 'lucide-react'

import FormContainer from '@/components/forms/FormContainer'
import { SubmitButton } from '@/components/forms/Buttons'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  cancelMemberTransferRequestAction,
  reviewAdminMemberTransferRequestAction,
  reviewIncomingMemberTransferRequestAction
} from '@/utils/actions'
import { memberTransferRequestStatusLabels, type MemberTransferRequestStatus } from '@/utils/types'

export type MemberTransferRequestCardData = {
  id: string
  adminReviewedAt?: Date | null
  createdAt: Date
  currentFirstName: string
  currentLastAndMiddleNames: string
  initiatingClerkId: string
  initiatingSponsorCode: string
  member?: {
    clerkId?: string
    firstName: string
    lastAndMiddleNames: string
    memberMatriculationNumber: string
    sponsorCode: string
  } | null
  memberMatriculationNumber: string
  receivingClerkId: string
  receivingReviewedAt?: Date | null
  receivingSponsorCode: string
  rejectionReason?: string | null
  status: string
}

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
})

export const formatTransferRequestDateTime = (date: Date) => dateTimeFormatter.format(date)

export const getTransferRequestMemberName = (request: MemberTransferRequestCardData) =>
  `${request.currentFirstName} ${request.currentLastAndMiddleNames}`.trim()

const getStatusLabel = (status: string) =>
  memberTransferRequestStatusLabels[status as MemberTransferRequestStatus] ?? status

const getStatusClassName = (status: string) => {
  if (status === 'admin_approved') {
    return 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300'
  }

  if (status === 'admin_rejected' || status === 'cancelled' || status === 'receiving_sponsor_rejected') {
    return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
  }

  if (status === 'receiving_sponsor_approved') {
    return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
  }

  return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300'
}

export const RequestStatusBadge = ({ status }: { status: string }) => (
  <Badge variant='outline' className={cn('shrink-0 capitalize', getStatusClassName(status))}>
    {status === 'admin_approved' ? <CheckCircle2 /> : null}
    {status === 'admin_rejected' || status === 'cancelled' || status === 'receiving_sponsor_rejected' ? (
      <XCircle />
    ) : null}
    {status === 'receiving_sponsor_pending' || status === 'receiving_sponsor_approved' ? <Clock3 /> : null}
    {getStatusLabel(status)}
  </Badge>
)

const ReleasingSponsorControls = ({
  compact = false,
  request
}: {
  compact?: boolean
  request: MemberTransferRequestCardData
}) => {
  if (request.status !== 'receiving_sponsor_pending') return null

  return (
    <div className={cn('grid gap-2 rounded-md border bg-white/60 dark:bg-black/10', compact ? 'p-2' : 'p-3')}>
      <div className='flex items-center gap-1.5 text-xs font-semibold'>
        <ArrowLeftRight className='size-3.5' />
        Current sponsor release review
      </div>
      <div className={cn('grid gap-2', compact ? '' : 'sm:grid-cols-2')}>
        <FormContainer action={reviewIncomingMemberTransferRequestAction} refreshOnMessage>
          <input type='hidden' name='requestId' value={request.id} />
          <input type='hidden' name='status' value='receiving_sponsor_approved' />
          <SubmitButton
            text='Approve release'
            className='h-8 w-full bg-green-700 px-3 text-xs normal-case hover:bg-green-800'
          />
        </FormContainer>
        <FormContainer action={reviewIncomingMemberTransferRequestAction} className='grid gap-2' refreshOnMessage>
          <input type='hidden' name='requestId' value={request.id} />
          <input type='hidden' name='status' value='receiving_sponsor_rejected' />
          <SubmitButton
            text='Reject release'
            className='h-8 w-full bg-red-700 px-3 text-xs normal-case hover:bg-red-800'
          />
          <Textarea
            name='rejectionReason'
            placeholder='Reason if rejected'
            defaultValue={request.rejectionReason ?? ''}
            className={cn('text-xs', compact ? 'min-h-14' : 'min-h-16')}
          />
        </FormContainer>
      </div>
    </div>
  )
}

const AdminTransferControls = ({
  compact = false,
  request
}: {
  compact?: boolean
  request: MemberTransferRequestCardData
}) => {
  if (request.status !== 'receiving_sponsor_approved') return null

  return (
    <div className={cn('grid gap-2 rounded-md border bg-white/60 dark:bg-black/10', compact ? 'p-2' : 'p-3')}>
      <div className='flex items-center gap-1.5 text-xs font-semibold'>
        <ShieldCheck className='size-3.5' />
        Admin review
      </div>
      <div className={cn('grid gap-2', compact ? '' : 'sm:grid-cols-2')}>
        <FormContainer action={reviewAdminMemberTransferRequestAction} refreshOnMessage>
          <input type='hidden' name='requestId' value={request.id} />
          <input type='hidden' name='status' value='admin_approved' />
          <SubmitButton
            text='Complete transfer'
            className='h-8 w-full bg-green-700 px-3 text-xs normal-case hover:bg-green-800'
          />
        </FormContainer>
        <FormContainer action={reviewAdminMemberTransferRequestAction} className='grid gap-2' refreshOnMessage>
          <input type='hidden' name='requestId' value={request.id} />
          <input type='hidden' name='status' value='admin_rejected' />
          <SubmitButton
            text='Reject transfer'
            className='h-8 w-full bg-red-700 px-3 text-xs normal-case hover:bg-red-800'
          />
          <Textarea
            name='rejectionReason'
            placeholder='Reason if rejected'
            defaultValue={request.rejectionReason ?? ''}
            className={cn('text-xs', compact ? 'min-h-14' : 'min-h-16')}
          />
        </FormContainer>
      </div>
    </div>
  )
}

const SponsorCancelTransferControl = ({
  compact = false,
  request
}: {
  compact?: boolean
  request: MemberTransferRequestCardData
}) => {
  if (!['receiving_sponsor_pending', 'receiving_sponsor_approved'].includes(request.status)) return null

  const cancelRequest = cancelMemberTransferRequestAction.bind(null, { requestId: request.id })

  return (
    <FormContainer action={cancelRequest} refreshOnMessage>
      <SubmitButton
        text='Cancel request'
        className={cn('h-8 w-full bg-red-700 px-3 text-xs normal-case hover:bg-red-800', compact ? '' : 'sm:w-fit')}
      />
    </FormContainer>
  )
}

export const MemberTransferRequestActions = ({
  className,
  compact = false,
  currentUserClerkId,
  emptyLabel = null,
  isAdminUser,
  request
}: {
  className?: string
  compact?: boolean
  currentUserClerkId?: string
  emptyLabel?: string | null
  isAdminUser: boolean
  request: MemberTransferRequestCardData
}) => {
  const isInitiatingSponsor = currentUserClerkId === request.initiatingClerkId
  const isReceivingSponsor = currentUserClerkId === request.receivingClerkId

  const hasReceivingSponsorAction =
    isReceivingSponsor && ['receiving_sponsor_pending', 'receiving_sponsor_approved'].includes(request.status)

  const hasReleasingSponsorAction = isInitiatingSponsor && request.status === 'receiving_sponsor_pending'
  const hasAdminAction = isAdminUser && request.status === 'receiving_sponsor_approved'

  if (!hasReceivingSponsorAction && !hasReleasingSponsorAction && !hasAdminAction) {
    if (!emptyLabel) return null

    return <span className={cn('text-muted-foreground text-xs font-semibold', className)}>{emptyLabel}</span>
  }

  return (
    <div className={cn('grid gap-2', className)}>
      {hasReceivingSponsorAction ? <SponsorCancelTransferControl compact={compact} request={request} /> : null}
      {hasReleasingSponsorAction ? <ReleasingSponsorControls compact={compact} request={request} /> : null}
      {hasAdminAction ? <AdminTransferControls compact={compact} request={request} /> : null}
    </div>
  )
}

const MemberTransferRequestCard = ({
  currentUserClerkId,
  isAdminUser,
  request
}: {
  currentUserClerkId?: string
  isAdminUser: boolean
  request: MemberTransferRequestCardData
}) => {
  const memberName = getTransferRequestMemberName(request)

  return (
    <div className='bg-muted/20 grid min-w-0 gap-4 rounded-md border p-4'>
      <div className='flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <div className='flex items-center gap-2 text-sm font-extrabold'>
            <ArrowLeftRight className='text-primary size-4' />
            <span className='break-words'>{memberName}</span>
          </div>
          <div className='text-muted-foreground mt-1 grid gap-1 text-xs'>
            <span>Matriculation: {request.memberMatriculationNumber}</span>
            <span>Submitted: {formatTransferRequestDateTime(request.createdAt)}</span>
          </div>
        </div>
        <RequestStatusBadge status={request.status} />
      </div>

      <div className='grid gap-2 text-sm sm:grid-cols-2'>
        <div className='bg-background/70 rounded-md border p-3'>
          <p className='text-muted-foreground text-xs font-semibold'>Present sponsor code</p>
          <p className='mt-1 font-extrabold break-words'>{request.initiatingSponsorCode}</p>
        </div>
        <div className='bg-background/70 rounded-md border p-3'>
          <p className='text-muted-foreground text-xs font-semibold'>Receiving sponsor code</p>
          <p className='mt-1 font-extrabold break-words'>{request.receivingSponsorCode}</p>
        </div>
      </div>

      {request.rejectionReason ? (
        <p className='rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
          {request.rejectionReason}
        </p>
      ) : null}

      <MemberTransferRequestActions
        currentUserClerkId={currentUserClerkId}
        isAdminUser={isAdminUser}
        request={request}
      />
    </div>
  )
}

export default MemberTransferRequestCard
