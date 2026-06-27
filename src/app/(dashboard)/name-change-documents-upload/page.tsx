import { FilePenLine, FileText, Upload } from 'lucide-react'

import NameChangeRequestCard from '@/components/dashboard/NameChangeRequestCard'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { fetchNameChangeDocumentationPageAction } from '@/utils/actions'

import SponsorNameChangeProposalForm from './NameChangeProposalForm'

const NameChangeDocumentationPage = async () => {
  const { members, requests } = await fetchNameChangeDocumentationPageAction()
  const requiredActionCount = requests.filter(request => request.status === 'documentation_requested').length

  return (
    <section className='grid w-full max-w-full min-w-0 gap-5 overflow-hidden px-0 py-4 sm:px-6 sm:py-8 lg:px-8'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-normal sm:text-3xl'>Name Change & Documentations</h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Submit proposed name corrections and upload documentation when SAGICAM requests it.
          </p>
        </div>
        <Badge variant='outline' className='w-fit text-sm'>
          {requests.length} request{requests.length === 1 ? '' : 's'}
        </Badge>
      </div>

      {requiredActionCount > 0 ? (
        <Card className='rounded-lg border-blue-200 bg-blue-50 py-0 dark:border-blue-900 dark:bg-blue-950/40'>
          <CardContent className='flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex min-w-0 items-start gap-3'>
              <FilePenLine className='mt-0.5 size-5 shrink-0 text-blue-700 dark:text-blue-300' />
              <div className='min-w-0'>
                <p className='font-extrabold text-blue-800 dark:text-blue-200'>Name change action required</p>
                <p className='text-sm text-blue-700 dark:text-blue-300'>
                  {requiredActionCount} request{requiredActionCount === 1 ? '' : 's'} need documentation uploaded.
                </p>
              </div>
            </div>
            <Badge variant='outline' className='w-fit border-blue-300 bg-white text-blue-800 dark:bg-black/20 dark:text-blue-200'>
              {requiredActionCount} required
            </Badge>
          </CardContent>
        </Card>
      ) : null}

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
          <h2 className='text-lg font-extrabold'>Your requests</h2>
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
              <NameChangeRequestCard key={request.id} request={request} isAdminUser={false} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default NameChangeDocumentationPage
