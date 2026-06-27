import { CheckCircle2, Download, FilePenLine, FileText, ShieldCheck, Upload, XCircle } from 'lucide-react'

import FormContainer from '@/components/forms/FormContainer'
import { SubmitButton } from '@/components/forms/Buttons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  deleteNameChangeRequestAction,
  fetchNameChangeDocumentationPageAction,
  reviewNameChangeRequestAction,
  uploadNameChangeDocumentationAction
} from '@/utils/actions'
import {
  nameChangeRequestStatusLabels,
  type NameChangeRequestStatus
} from '@/utils/types'

import SponsorNameChangeProposalForm from './NameChangeProposalForm'

type NameChangePageData = Awaited<ReturnType<typeof fetchNameChangeDocumentationPageAction>>
type NameChangeRequest = NameChangePageData['requests'][number]

const documentAccept = '.pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,image/*'

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
})

const formatDateTime = (date: Date) => dateTimeFormatter.format(date)

const getStatusLabel = (status: string) =>
  nameChangeRequestStatusLabels[status as NameChangeRequestStatus] ?? status

const getStatusClassName = (status: string) => {
  if (status === 'approved') {
    return 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300'
  }

  if (status === 'rejected') {
    return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
  }

  if (status === 'documentation_requested') {
    return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300'
  }

  return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
}

const RequestStatusBadge = ({ status }: { status: string }) => (
  <Badge variant='outline' className={cn('shrink-0 capitalize', getStatusClassName(status))}>
    {status === 'approved' ? <CheckCircle2 /> : null}
    {status === 'rejected' ? <XCircle /> : null}
    {status === 'documentation_requested' ? <FileText /> : null}
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
      <div className='grid gap-2 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)]'>
        <FormContainer action={reviewNameChangeRequestAction} refreshOnMessage>
          <input type='hidden' name='requestId' value={request.id} />
          <input type='hidden' name='status' value='approved' />
          <SubmitButton
            text='Approve'
            className='h-8 w-full bg-green-700 px-3 text-xs normal-case hover:bg-green-800 sm:w-auto'
          />
        </FormContainer>
        <FormContainer action={reviewNameChangeRequestAction} className='grid gap-2' refreshOnMessage>
          <input type='hidden' name='requestId' value={request.id} />
          <input type='hidden' name='status' value='documentation_requested' />
          <Textarea
            name='rejectionReason'
            placeholder='Documentation note for sponsor'
            defaultValue={request.rejectionReason ?? ''}
            className='min-h-16 text-xs'
          />
          <SubmitButton
            text='Request documentation'
            className='h-8 w-full bg-blue-700 px-3 text-xs normal-case hover:bg-blue-800'
          />
        </FormContainer>
        <FormContainer
          action={reviewNameChangeRequestAction}
          className='grid gap-2'
          refreshOnMessage
        >
          <input type='hidden' name='requestId' value={request.id} />
          <input type='hidden' name='status' value='rejected' />
          <Textarea
            name='rejectionReason'
            placeholder='Reason if rejected'
            defaultValue={request.rejectionReason ?? ''}
            className='min-h-16 text-xs'
          />
          <SubmitButton
            text='Reject'
            className='h-8 w-full bg-red-700 px-3 text-xs normal-case hover:bg-red-800'
          />
        </FormContainer>
      </div>
    </div>
  )
}

const getRequestNoteClassName = (status: string) =>
  status === 'rejected'
    ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
    : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300'

const NameChangeRequestCard = ({ isAdminUser, request }: { isAdminUser: boolean; request: NameChangeRequest }) => {
  const deleteRequest = deleteNameChangeRequestAction.bind(null, { requestId: request.id })
  const hasDocument = Boolean(request.cloudinaryPublicId && request.fileName)
  const canUploadDocumentation = !isAdminUser && request.status === 'documentation_requested'

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
        {request.rejectionReason ? (
          <p className={cn('rounded-md border px-2 py-1.5', getRequestNoteClassName(request.status))}>
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
          <Badge variant={request.documentRequired ? 'outline' : 'secondary'}>
            {request.documentRequired ? 'Documentation requested' : 'No document uploaded'}
          </Badge>
        )}
        {request.status !== 'approved' ? (
          <FormContainer action={deleteRequest} refreshOnMessage>
            <SubmitButton text='Remove' className='h-8 bg-red-700 px-3 text-xs normal-case hover:bg-red-800' />
          </FormContainer>
        ) : null}
      </div>

      {canUploadDocumentation ? (
        <FormContainer
          action={uploadNameChangeDocumentationAction}
          className='grid gap-2 rounded-md border bg-background/70 p-3'
          encType='multipart/form-data'
          refreshOnMessage
        >
          <input type='hidden' name='requestId' value={request.id} />
          <div className='grid gap-1.5'>
            <Label htmlFor={`${request.id}-document`}>Upload requested documentation</Label>
            <p className='text-muted-foreground text-xs'>PDF or image, up to 20 MB.</p>
            <Input id={`${request.id}-document`} name='documentFile' type='file' accept={documentAccept} required />
          </div>
          <SubmitButton text='Upload documentation' className='h-8 w-full text-xs normal-case sm:w-fit' />
        </FormContainer>
      ) : null}

      {isAdminUser ? <AdminReviewControls request={request} /> : null}
    </div>
  )
}

const NameChangeDocumentationPage = async () => {
  const { isAdminUser, members, requests } = await fetchNameChangeDocumentationPageAction()

  return (
    <section className='grid w-full max-w-full min-w-0 gap-5 overflow-hidden px-0 py-4 sm:px-6 sm:py-8 lg:px-8'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-normal sm:text-3xl'>Name Change & Documentations</h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Sponsors submit proposed name changes for admin review. Admin can approve, reject, or request documentation.
          </p>
        </div>
        <Badge variant='outline' className='w-fit text-sm'>
          {requests.length} request{requests.length === 1 ? '' : 's'}
        </Badge>
      </div>

      <div className='grid gap-4'>
        {members.length === 0 ? (
          <Card className='rounded-lg'>
            <CardContent className='py-8 text-center'>
              <Upload className='text-muted-foreground mx-auto mb-3 size-8' />
              <p className='font-semibold'>No loved ones found.</p>
              <p className='text-muted-foreground mt-1 text-sm'>Add a loved one before submitting a name change.</p>
            </CardContent>
          </Card>
        ) : (
          <SponsorNameChangeProposalForm members={members} />
        )}
      </div>

      <div className='grid gap-3'>
        <div className='flex items-center gap-2'>
          <FilePenLine className='text-primary size-5' />
          <h2 className='text-lg font-extrabold'>{isAdminUser ? 'All name change requests' : 'Your requests'}</h2>
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
