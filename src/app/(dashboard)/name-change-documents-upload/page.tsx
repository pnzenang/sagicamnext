import { CheckCircle2, Download, FilePenLine, FileText, ShieldCheck, Upload, UserRound, XCircle } from 'lucide-react'

import FormContainer from '@/components/forms/FormContainer'
import { SubmitButton } from '@/components/forms/Buttons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  deleteNameChangeRequestAction,
  fetchNameChangeDocumentationPageAction,
  reviewNameChangeRequestAction,
  submitNameChangeRequestAction
} from '@/utils/actions'
import {
  nameChangeRequestReasonLabels,
  nameChangeRequestReasons,
  nameChangeRequestStatusLabels,
  type NameChangeRequestReason,
  type NameChangeRequestStatus
} from '@/utils/types'

type NameChangePageData = Awaited<ReturnType<typeof fetchNameChangeDocumentationPageAction>>
type NameChangeMember = NameChangePageData['members'][number]
type NameChangeRequest = NameChangePageData['requests'][number]

const documentAccept = '.pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,image/*'

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
})

const formatDateTime = (date: Date) => dateTimeFormatter.format(date)

const getReasonLabel = (reason: string) =>
  nameChangeRequestReasonLabels[reason as NameChangeRequestReason] ?? reason

const getStatusLabel = (status: string) =>
  nameChangeRequestStatusLabels[status as NameChangeRequestStatus] ?? status

const getStatusClassName = (status: string) => {
  if (status === 'approved') {
    return 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300'
  }

  if (status === 'rejected') {
    return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
  }

  return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
}

const RequestStatusBadge = ({ status }: { status: string }) => (
  <Badge variant='outline' className={cn('shrink-0 capitalize', getStatusClassName(status))}>
    {status === 'approved' ? <CheckCircle2 /> : null}
    {status === 'rejected' ? <XCircle /> : null}
    {getStatusLabel(status)}
  </Badge>
)

const AdminReviewControls = ({ request }: { request: NameChangeRequest }) => {
  if (request.status !== 'submitted') return null

  return (
    <div className='mt-4 grid gap-2 rounded-md border bg-white/60 p-3 dark:bg-black/10'>
      <div className='flex items-center gap-1.5 text-xs font-semibold'>
        <ShieldCheck className='size-3.5' />
        Admin review
      </div>
      <div className='grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)]'>
        <FormContainer action={reviewNameChangeRequestAction} refreshOnMessage>
          <input type='hidden' name='requestId' value={request.id} />
          <input type='hidden' name='status' value='approved' />
          <SubmitButton
            text='Approve'
            className='h-8 w-full bg-green-700 px-3 text-xs normal-case hover:bg-green-800 sm:w-auto'
          />
        </FormContainer>
        <FormContainer
          action={reviewNameChangeRequestAction}
          className='grid gap-2 sm:grid-cols-[1fr_auto]'
          refreshOnMessage
        >
          <input type='hidden' name='requestId' value={request.id} />
          <input type='hidden' name='status' value='rejected' />
          <Input
            name='rejectionReason'
            placeholder='Reason if rejected'
            defaultValue={request.rejectionReason ?? ''}
            className='h-8 text-xs'
          />
          <SubmitButton
            text='Reject'
            className='h-8 w-full bg-red-700 px-3 text-xs normal-case hover:bg-red-800 sm:w-auto'
          />
        </FormContainer>
      </div>
    </div>
  )
}

const NameChangeRequestCard = ({ isAdminUser, request }: { isAdminUser: boolean; request: NameChangeRequest }) => {
  const deleteRequest = deleteNameChangeRequestAction.bind(null, { requestId: request.id })
  const hasDocument = Boolean(request.cloudinaryPublicId && request.fileName)

  return (
    <div className='grid min-w-0 gap-4 rounded-md border bg-muted/20 p-4'>
      <div className='flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <div className='flex items-center gap-2 text-sm font-extrabold'>
            <FileText className='text-primary size-4' />
            <span className='break-words'>
              {request.currentFirstName} {request.currentLastAndMiddleNames}
            </span>
          </div>
          <div className='text-muted-foreground mt-1 grid gap-1 text-xs'>
            <span>Sponsor code: {request.sponsorCode}</span>
            <span>Matriculation: {request.member?.memberMatriculationNumber ?? 'Unavailable'}</span>
            <span>Submitted: {formatDateTime(request.createdAt)}</span>
          </div>
        </div>
        <RequestStatusBadge status={request.status} />
      </div>

      <div className='grid gap-2 text-sm sm:grid-cols-2'>
        <div className='rounded-md border bg-background/70 p-3'>
          <p className='text-muted-foreground text-xs font-semibold'>Current name</p>
          <p className='mt-1 font-extrabold break-words'>
            {request.currentFirstName} {request.currentLastAndMiddleNames}
          </p>
        </div>
        <div className='rounded-md border bg-background/70 p-3'>
          <p className='text-muted-foreground text-xs font-semibold'>Requested name</p>
          <p className='mt-1 font-extrabold break-words'>
            {request.requestedFirstName} {request.requestedLastAndMiddleNames}
          </p>
        </div>
      </div>

      <div className='grid gap-2 text-xs'>
        <p>
          <span className='text-muted-foreground font-semibold'>Reason:</span> {getReasonLabel(request.reason)}
        </p>
        {request.rejectionReason ? (
          <p className='rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
            {request.rejectionReason}
          </p>
        ) : null}
      </div>

      <div className='flex flex-wrap gap-2'>
        {hasDocument ? (
          <Button asChild variant='outline' size='sm' className='h-8'>
            <a href={`/name-change-documents-upload/${request.id}/download`}>
              <Download className='size-3.5' />
              Download document
            </a>
          </Button>
        ) : (
          <Badge variant='secondary'>No document uploaded</Badge>
        )}
        {request.status !== 'approved' ? (
          <FormContainer action={deleteRequest} refreshOnMessage>
            <SubmitButton text='Remove' className='h-8 bg-red-700 px-3 text-xs normal-case hover:bg-red-800' />
          </FormContainer>
        ) : null}
      </div>

      {isAdminUser ? <AdminReviewControls request={request} /> : null}
    </div>
  )
}

const MemberNameChangeCard = ({ member }: { member: NameChangeMember }) => (
  <Card className='rounded-lg py-0'>
    <CardHeader className='border-b px-4 py-4'>
      <div className='flex items-start gap-3'>
        <UserRound className='text-primary mt-1 size-5 shrink-0' />
        <div className='min-w-0'>
          <CardTitle className='text-lg break-words'>
            {member.firstName} {member.lastAndMiddleNames}
          </CardTitle>
          <p className='text-muted-foreground mt-1 text-xs'>Matriculation: {member.memberMatriculationNumber}</p>
        </div>
      </div>
    </CardHeader>
    <CardContent className='px-4 py-4'>
      <FormContainer
        action={submitNameChangeRequestAction}
        className='grid gap-3'
        encType='multipart/form-data'
        refreshOnMessage
      >
        <input type='hidden' name='memberId' value={member.id} />
        <div className='grid gap-3 sm:grid-cols-2'>
          <div className='grid gap-1.5'>
            <Label htmlFor={`${member.id}-first-name`}>Corrected given names</Label>
            <Input id={`${member.id}-first-name`} name='requestedFirstName' defaultValue={member.firstName} required />
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor={`${member.id}-last-name`}>Corrected last and middle names</Label>
            <Input
              id={`${member.id}-last-name`}
              name='requestedLastAndMiddleNames'
              defaultValue={member.lastAndMiddleNames}
              required
            />
          </div>
        </div>
        <div className='grid gap-1.5'>
          <Label htmlFor={`${member.id}-reason`}>Reason</Label>
          <p className='text-muted-foreground text-xs'>
            Typo corrections apply immediately. Legal document changes are submitted for admin review.
          </p>
          <select
            id={`${member.id}-reason`}
            name='reason'
            defaultValue='typo_or_error'
            className='border-input bg-background ring-offset-background focus-visible:ring-ring h-9 rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
          >
            {nameChangeRequestReasons.map(reason => (
              <option key={reason} value={reason}>
                {nameChangeRequestReasonLabels[reason]}
              </option>
            ))}
          </select>
        </div>
        <div className='flex items-start gap-2 rounded-md border bg-muted/30 p-3'>
          <Checkbox id={`${member.id}-typo-confirmation`} name='typoCorrectionConfirmation' value='on' />
          <div className='grid gap-1'>
            <Label htmlFor={`${member.id}-typo-confirmation`} className='text-sm leading-snug'>
              I confirm this is only a typo correction and not a legal name change or a different person.
            </Label>
            <p className='text-muted-foreground text-xs'>Required when reason is Typo or correction.</p>
          </div>
        </div>
        <div className='grid gap-1.5'>
          <Label htmlFor={`${member.id}-document`}>Official name change document</Label>
          <p className='text-muted-foreground text-xs'>Required for legal document changes. PDF or image, up to 20 MB.</p>
          <Input id={`${member.id}-document`} name='documentFile' type='file' accept={documentAccept} />
        </div>
        <SubmitButton text='Save name correction' className='h-9 w-full text-sm normal-case' />
      </FormContainer>
    </CardContent>
  </Card>
)

const NameChangeDocumentationPage = async () => {
  const { isAdminUser, members, requests } = await fetchNameChangeDocumentationPageAction()

  return (
    <section className='grid w-full max-w-full min-w-0 gap-5 overflow-hidden px-0 py-4 sm:px-6 sm:py-8 lg:px-8'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-normal sm:text-3xl'>Name Change & Documentations</h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Correct typos directly or submit legal name changes with official documentation for admin review.
          </p>
        </div>
        <Badge variant='outline' className='w-fit text-sm'>
          {requests.length} request{requests.length === 1 ? '' : 's'}
        </Badge>
      </div>

      {!isAdminUser ? (
        <div className='grid gap-4 xl:grid-cols-2'>
          {members.length === 0 ? (
            <Card className='rounded-lg'>
              <CardContent className='py-8 text-center'>
                <Upload className='text-muted-foreground mx-auto mb-3 size-8' />
                <p className='font-semibold'>No loved ones found.</p>
                <p className='text-muted-foreground mt-1 text-sm'>Add a loved one before submitting a name change.</p>
              </CardContent>
            </Card>
          ) : (
            members.map(member => <MemberNameChangeCard key={member.id} member={member} />)
          )}
        </div>
      ) : null}

      <div className='grid gap-3'>
        <div className='flex items-center gap-2'>
          <FilePenLine className='text-primary size-5' />
          <h2 className='text-lg font-extrabold'>{isAdminUser ? 'All submitted requests' : 'Your requests'}</h2>
        </div>
        {requests.length === 0 ? (
          <Card className='rounded-lg'>
            <CardContent className='py-8 text-center'>
              <FileText className='text-muted-foreground mx-auto mb-3 size-8' />
              <p className='font-semibold'>No name change requests found.</p>
              <p className='text-muted-foreground mt-1 text-sm'>Submitted requests will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-4 xl:grid-cols-2 2xl:grid-cols-3'>
            {requests.map(request => (
              <NameChangeRequestCard key={request.id} request={request} isAdminUser={isAdminUser} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default NameChangeDocumentationPage
