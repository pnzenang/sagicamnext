'use client'

import { useMemo, useState } from 'react'

import { CheckCircle2, Download, FileText, Search, ShieldCheck, Upload, XCircle } from 'lucide-react'

import FormContainer from '@/components/forms/FormContainer'
import { SubmitButton } from '@/components/forms/Buttons'
import PaginationControls from '@/components/global/PaginationControls'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePagination } from '@/hooks/use-pagination'
import { cn } from '@/lib/utils'
import {
  deleteDeceasedMemberDocumentAction,
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

export type DeathDocumentationDocument = {
  createdAt: Date | string
  deceasedMemberId: string
  documentType: string
  fileName: string
  fileSize: number
  id: string
  mimeType: string
  rejectionReason?: string | null
  sponsorCode: string
  status: string
  updatedAt: Date | string
}

export type DeathDocumentationCase = {
  dateOfDeath: string
  documents: DeathDocumentationDocument[]
  firstName: string
  id: string
  lastAndMiddleNames: string
  memberMatriculationNumber: string
  placeOfDeath: string
  sponsorCode: string
}

const documentAccept = '.pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,image/*'

const fileSizeFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
})

const pageSizeOptions = [5, 10, 25, 50]

const formatDateTime = (date: Date | string) => dateTimeFormatter.format(new Date(date))

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

const getCaseSearchText = (deceasedMember: DeathDocumentationCase) =>
  [
    deceasedMember.firstName,
    deceasedMember.lastAndMiddleNames,
    deceasedMember.memberMatriculationNumber,
    deceasedMember.sponsorCode,
    deceasedMember.placeOfDeath
  ]
    .join(' ')
    .toLowerCase()

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
  canManageUploads,
  canReviewDocuments,
  deceasedMember,
  documentType,
  uploadedDocument
}: {
  canManageUploads: boolean
  canReviewDocuments: boolean
  deceasedMember: DeathDocumentationCase
  documentType: DeceasedMemberDocumentType
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
            {canManageUploads && deleteDocument ? (
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

      {canManageUploads ? (
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
      ) : null}

      {canReviewDocuments && uploadedDocument ? <ReviewDocumentControls uploadedDocument={uploadedDocument} /> : null}
    </div>
  )
}

const DeceasedMemberDocumentationCard = ({
  canManageUploads,
  canReviewDocuments,
  deceasedMember,
  slotGridClassName
}: {
  canManageUploads: boolean
  canReviewDocuments: boolean
  deceasedMember: DeathDocumentationCase
  slotGridClassName?: string
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
        <div className={cn('grid w-full min-w-0 gap-4 lg:grid-cols-2 2xl:grid-cols-4', slotGridClassName)}>
          {deceasedMemberDocumentTypes.map(documentType => (
            <DocumentationSlot
              key={documentType}
              canManageUploads={canManageUploads}
              canReviewDocuments={canReviewDocuments}
              deceasedMember={deceasedMember}
              documentType={documentType}
              uploadedDocument={documentsByType.get(documentType)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

type DeathDocumentationCasesProps = {
  canManageUploads: boolean
  canReviewDocuments: boolean
  deceasedMembers: DeathDocumentationCase[]
  description: string
  emptyDescription: string
  emptyTitle: string
  title: string
}

const DeathDocumentationCases = ({
  canManageUploads,
  canReviewDocuments,
  deceasedMembers,
  description,
  emptyDescription,
  emptyTitle,
  title
}: DeathDocumentationCasesProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(pageSizeOptions[0])
  const totalRequiredDocuments = deceasedMembers.length * deceasedMemberDocumentTypes.length
  const uploadedDocuments = deceasedMembers.reduce((total, deceasedMember) => total + getUploadedDocumentCount(deceasedMember), 0)
  const normalizedSearchQuery = searchQuery.trim().toLowerCase()

  const filteredDeceasedMembers = useMemo(() => {
    if (!normalizedSearchQuery) return deceasedMembers

    return deceasedMembers.filter(deceasedMember => getCaseSearchText(deceasedMember).includes(normalizedSearchQuery))
  }, [deceasedMembers, normalizedSearchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredDeceasedMembers.length / pageSize))
  const activePage = Math.min(currentPage, totalPages)
  const pageStartIndex = (activePage - 1) * pageSize
  const pageEndIndex = Math.min(pageStartIndex + pageSize, filteredDeceasedMembers.length)
  const paginatedDeceasedMembers = filteredDeceasedMembers.slice(pageStartIndex, pageEndIndex)
  const hasSearchQuery = normalizedSearchQuery.length > 0

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: activePage,
    paginationItemsToDisplay: 3,
    totalPages
  })

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setCurrentPage(1)
  }

  return (
    <section className='grid w-full max-w-full min-w-0 shrink-0 gap-5 overflow-visible px-0 py-4 sm:px-6 sm:py-8 lg:px-8'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-normal sm:text-3xl'>{title}</h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            {description}
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
            <p className='font-semibold'>{emptyTitle}</p>
            <p className='text-muted-foreground mt-1 text-sm'>
              {emptyDescription}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4'>
          <Card className='rounded-lg py-0'>
            <CardContent className='grid gap-3 px-3 py-3 sm:px-4'>
              <div className='grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center'>
                <div className='relative min-w-0'>
                  <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                  <Input
                    value={searchQuery}
                    onChange={event => handleSearchChange(event.target.value)}
                    placeholder='Search by deceased name, code, or place of death'
                    className='h-10 pl-9'
                    aria-label='Search by deceased name, code, or place of death'
                  />
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-muted-foreground text-sm font-semibold whitespace-nowrap'>Entries per page</span>
                  <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className='bg-background h-10 w-24'>
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
              </div>

              <p className='text-muted-foreground text-sm font-medium' aria-live='polite'>
                {filteredDeceasedMembers.length > 0
                  ? `Showing ${pageStartIndex + 1}-${pageEndIndex} of ${filteredDeceasedMembers.length} case${
                      filteredDeceasedMembers.length === 1 ? '' : 's'
                    }`
                  : 'No cases match your search'}
              </p>
            </CardContent>
          </Card>

          {filteredDeceasedMembers.length === 0 ? (
            <Card className='rounded-lg'>
              <CardContent className='py-8 text-center'>
                <Search className='text-muted-foreground mx-auto mb-3 size-8' />
                <p className='font-semibold'>No matching death documentation cases found.</p>
                <p className='text-muted-foreground mt-1 text-sm'>
                  {hasSearchQuery ? 'Search by deceased name, sponsor code, matriculation code, or place of death.' : emptyDescription}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className='grid gap-5'>
              {paginatedDeceasedMembers.map(deceasedMember => (
                <DeceasedMemberDocumentationCard
                  key={deceasedMember.id}
                  canManageUploads={canManageUploads}
                  canReviewDocuments={canReviewDocuments}
                  deceasedMember={deceasedMember}
                  slotGridClassName={canReviewDocuments ? '2xl:grid-cols-2' : undefined}
                />
              ))}
            </div>
          )}

          {filteredDeceasedMembers.length > 0 ? (
            <div className='flex max-w-full flex-col items-center justify-between gap-3 rounded-lg border bg-background px-3 py-3 sm:flex-row'>
              <p className='text-muted-foreground text-sm font-semibold' aria-live='polite'>
                Page {activePage} of {totalPages}
              </p>
              <PaginationControls
                activePage={activePage}
                canNext={activePage < totalPages}
                canPrevious={activePage > 1}
                getPageButtonClassName={isActive => (isActive ? undefined : 'bg-primary/10 text-primary hover:bg-primary/20')}
                iconClassName='text-primary'
                onNext={() => setCurrentPage(Math.min(totalPages, activePage + 1))}
                onPageChange={setCurrentPage}
                onPrevious={() => setCurrentPage(Math.max(1, activePage - 1))}
                pages={pages}
                showLeftEllipsis={showLeftEllipsis}
                showRightEllipsis={showRightEllipsis}
              />
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}

export default DeathDocumentationCases
