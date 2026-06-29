import { CheckCircle2, Download, FileText, ShieldCheck, Upload, XCircle } from 'lucide-react'

import FormContainer from '@/components/forms/FormContainer'
import { SubmitButton } from '@/components/forms/Buttons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  deleteDeceasedMemberDocumentAction,
  fetchDeathDocumentationCasesAction,
  reviewDeceasedMemberDocumentAction,
  uploadDeceasedMemberDocumentAction
} from '@/utils/actions'
import {
  deceasedMemberDocumentLabels,
  deceasedMemberDocumentStatusLabels,
  deceasedMemberDocumentTypes,
  type DeceasedMemberDocumentStatus,
  type DeceasedMemberDocumentType
} from '@/utils/types'

type DeathDocumentationCase = Awaited<ReturnType<typeof fetchDeathDocumentationCasesAction>>['deceasedMembers'][number]
type DeathDocumentationDocument = DeathDocumentationCase['documents'][number]

const documentAccept = '.pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,image/*'

const fileSizeFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
})

const formatDateTime = (date: Date) => dateTimeFormatter.format(date)

const formatFileSize = (fileSize: number) => {
  if (fileSize < 1024) return `${fileSize} B`

  if (fileSize < 1024 * 1024) return `${fileSizeFormatter.format(fileSize / 1024)} KB`

  return `${fileSizeFormatter.format(fileSize / (1024 * 1024))} MB`
}

const getDocumentStatusLabel = (status: string) =>
  deceasedMemberDocumentStatusLabels[status as DeceasedMemberDocumentStatus] ?? status

const getDocumentStatusClassName = (status: string) => {
  if (status === 'approved') {
    return 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300'
  }

  if (status === 'rejected') {
    return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
  }

  return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
}

const getUploadedDocumentCount = (deceasedMember: DeathDocumentationCase) =>
  deceasedMemberDocumentTypes.filter(documentType =>
    deceasedMember.documents.some(uploadedDocument => uploadedDocument.documentType === documentType)
  ).length

const ReviewDocumentControls = ({ uploadedDocument }: { uploadedDocument: DeathDocumentationDocument }) => (
  <div className='mt-3 grid gap-2 rounded-md border bg-white/60 p-2 dark:bg-black/10'>
    <div className='flex items-center gap-1.5 text-xs font-semibold'>
      <ShieldCheck className='size-3.5' />
      Admin review
    </div>
    <div className='grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)]'>
      <FormContainer action={reviewDeceasedMemberDocumentAction} refreshOnMessage>
        <input type='hidden' name='documentId' value={uploadedDocument.id} />
        <input type='hidden' name='status' value='approved' />
        <SubmitButton
          text='Approve'
          className='h-8 w-full bg-green-700 px-3 text-xs normal-case hover:bg-green-800 sm:w-auto'
        />
      </FormContainer>
      <FormContainer
        action={reviewDeceasedMemberDocumentAction}
        className='grid gap-2 sm:grid-cols-[1fr_auto]'
        refreshOnMessage
      >
        <input type='hidden' name='documentId' value={uploadedDocument.id} />
        <input type='hidden' name='status' value='rejected' />
        <Input
          name='rejectionReason'
          placeholder='Reason if rejected'
          defaultValue={uploadedDocument.status === 'rejected' ? uploadedDocument.rejectionReason ?? '' : ''}
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

const DocumentationSlot = ({
  deceasedMember,
  documentType,
  isAdminUser,
  uploadedDocument
}: {
  deceasedMember: DeathDocumentationCase
  documentType: DeceasedMemberDocumentType
  isAdminUser: boolean
  uploadedDocument?: DeathDocumentationDocument
}) => {
  const inputId = `${deceasedMember.id}-${documentType}`

  const deleteDocument = uploadedDocument
    ? deleteDeceasedMemberDocumentAction.bind(null, { documentId: uploadedDocument.id })
    : null

  return (
    <div className='grid min-w-0 gap-4 rounded-md border bg-muted/20 p-4'>
      <div className='flex min-w-0 items-start justify-between gap-3'>
        <div className='min-w-0'>
          <div className='flex items-center gap-2 text-sm font-extrabold'>
            <FileText className='text-primary size-4' />
            <span className='break-words'>{deceasedMemberDocumentLabels[documentType]}</span>
          </div>
          {uploadedDocument ? (
            <p className='text-muted-foreground mt-1 text-xs break-words'>
              {uploadedDocument.fileName} · {formatFileSize(uploadedDocument.fileSize)}
            </p>
          ) : (
            <p className='text-muted-foreground mt-1 text-xs'>Not uploaded yet</p>
          )}
        </div>
        {uploadedDocument ? (
          <Badge variant='outline' className={cn('shrink-0 capitalize', getDocumentStatusClassName(uploadedDocument.status))}>
            {uploadedDocument.status === 'approved' ? <CheckCircle2 /> : null}
            {uploadedDocument.status === 'rejected' ? <XCircle /> : null}
            {getDocumentStatusLabel(uploadedDocument.status)}
          </Badge>
        ) : null}
      </div>

      {uploadedDocument ? (
        <div className='grid gap-2 text-xs'>
          <p className='text-muted-foreground'>Uploaded {formatDateTime(uploadedDocument.updatedAt)}</p>
          {uploadedDocument.rejectionReason ? (
            <p className='rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
              {uploadedDocument.rejectionReason}
            </p>
          ) : null}
          <div className='flex flex-wrap gap-2'>
            <Button asChild variant='outline' size='sm' className='h-8'>
              <a href={`/death-documentations/${uploadedDocument.id}/download`}>
                <Download className='size-3.5' />
                Download
              </a>
            </Button>
            {deleteDocument ? (
              <FormContainer action={deleteDocument} refreshOnMessage>
                <SubmitButton
                  text='Remove'
                  className='h-8 bg-red-700 px-3 text-xs normal-case hover:bg-red-800'
                />
              </FormContainer>
            ) : null}
          </div>
        </div>
      ) : null}

      <FormContainer
        action={uploadDeceasedMemberDocumentAction}
        className='grid gap-2'
        refreshOnMessage
      >
        <input type='hidden' name='deceasedMemberId' value={deceasedMember.id} />
        <input type='hidden' name='documentType' value={documentType} />
        <Label htmlFor={inputId}>{uploadedDocument ? 'Replace file' : 'Choose file'}</Label>
        <p className='text-muted-foreground text-xs'>PDF or image, up to 20 MB.</p>
        <Input id={inputId} name='documentFile' type='file' accept={documentAccept} required />
        <SubmitButton
          text={uploadedDocument ? 'Replace document' : 'Upload document'}
          className='h-9 w-full text-sm normal-case'
        />
      </FormContainer>

      {isAdminUser && uploadedDocument ? <ReviewDocumentControls uploadedDocument={uploadedDocument} /> : null}
    </div>
  )
}

const DeceasedMemberDocumentationCard = ({
  deceasedMember,
  isAdminUser
}: {
  deceasedMember: DeathDocumentationCase
  isAdminUser: boolean
}) => {
  const uploadedCount = getUploadedDocumentCount(deceasedMember)
  const documentsByType = new Map(deceasedMember.documents.map(uploadedDocument => [uploadedDocument.documentType, uploadedDocument]))

  return (
    <Card className='rounded-lg py-0'>
      <CardHeader className='border-b px-4 py-4 sm:px-6'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
          <div className='min-w-0'>
            <CardTitle className='text-xl break-words'>
              {deceasedMember.firstName} {deceasedMember.lastAndMiddleNames}
            </CardTitle>
            <div className='text-muted-foreground mt-2 grid gap-1 text-sm sm:grid-cols-2'>
              <span>Sponsor code: {deceasedMember.sponsorCode}</span>
              <span>Matriculation: {deceasedMember.memberMatriculationNumber}</span>
              <span>Date of death: {deceasedMember.dateOfDeath}</span>
              <span>Place of death: {deceasedMember.placeOfDeath}</span>
            </div>
          </div>
          <Badge variant={uploadedCount === deceasedMemberDocumentTypes.length ? 'default' : 'secondary'} className='shrink-0'>
            {uploadedCount} / {deceasedMemberDocumentTypes.length} uploaded
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='px-4 py-4 sm:px-6'>
        <div className='grid w-full min-w-0 gap-4 lg:grid-cols-2 2xl:grid-cols-4'>
          {deceasedMemberDocumentTypes.map(documentType => (
            <DocumentationSlot
              key={documentType}
              deceasedMember={deceasedMember}
              documentType={documentType}
              isAdminUser={isAdminUser}
              uploadedDocument={documentsByType.get(documentType)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const DeathDocumentationsPage = async () => {
  const { deceasedMembers, isAdminUser } = await fetchDeathDocumentationCasesAction()
  const totalRequiredDocuments = deceasedMembers.length * deceasedMemberDocumentTypes.length
  const uploadedDocuments = deceasedMembers.reduce((total, deceasedMember) => total + getUploadedDocumentCount(deceasedMember), 0)

  return (
    <section className='grid w-full max-w-full min-w-0 gap-5 overflow-hidden px-0 py-4 sm:px-6 sm:py-8 lg:px-8'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-normal sm:text-3xl'>Death Documentations</h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Upload the four required documents for each deceased loved one.
          </p>
        </div>
        <Badge variant='outline' className='w-fit text-sm'>
          {uploadedDocuments} / {totalRequiredDocuments} documents uploaded
        </Badge>
      </div>

      {deceasedMembers.length === 0 ? (
        <Card className='rounded-lg'>
          <CardContent className='py-8 text-center'>
            <Upload className='text-muted-foreground mx-auto mb-3 size-8' />
            <p className='font-semibold'>No death announcements found.</p>
            <p className='text-muted-foreground mt-1 text-sm'>
              Death documentation will appear here after a death announcement is submitted.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-5'>
          {deceasedMembers.map(deceasedMember => (
            <DeceasedMemberDocumentationCard
              key={deceasedMember.id}
              deceasedMember={deceasedMember}
              isAdminUser={isAdminUser}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default DeathDocumentationsPage
