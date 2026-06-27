import { ArrowLeftRight, ShieldCheck } from 'lucide-react'

import MemberTransferRequestCard from '@/components/dashboard/MemberTransferRequestCard'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { fetchAdminMemberTransferPageAction } from '@/utils/actions'

const AdminMemberTransfersPage = async () => {
  const { requests } = await fetchAdminMemberTransferPageAction()
  const pendingAdminCount = requests.filter(request => request.status === 'receiving_sponsor_approved').length

  return (
    <section className='grid w-full max-w-full min-w-0 gap-5 overflow-hidden px-0 py-4 sm:px-6 sm:py-8 lg:px-8'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-normal sm:text-3xl'>Admin Member Transfers</h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Complete member transfers after the receiving sponsor approves the request.
          </p>
        </div>
        <Badge variant='outline' className='w-fit text-sm'>
          {requests.length} request{requests.length === 1 ? '' : 's'}
        </Badge>
      </div>

      {pendingAdminCount > 0 ? (
        <Card className='rounded-lg border-amber-200 bg-amber-50 py-0 dark:border-amber-900 dark:bg-amber-950/40'>
          <CardContent className='flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex min-w-0 items-start gap-3'>
              <ShieldCheck className='mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300' />
              <div className='min-w-0'>
                <p className='font-extrabold text-amber-800 dark:text-amber-200'>Admin transfer approval pending</p>
                <p className='text-sm text-amber-700 dark:text-amber-300'>
                  {pendingAdminCount} request{pendingAdminCount === 1 ? '' : 's'} waiting for admin approval.
                </p>
              </div>
            </div>
            <Badge variant='outline' className='w-fit border-amber-300 bg-white text-amber-800 dark:bg-black/20 dark:text-amber-200'>
              {pendingAdminCount} pending
            </Badge>
          </CardContent>
        </Card>
      ) : null}

      <div className='grid gap-3'>
        <div className='flex items-center gap-2'>
          <ArrowLeftRight className='text-primary size-5' />
          <h2 className='text-lg font-extrabold'>All member transfer requests</h2>
        </div>
        {requests.length === 0 ? (
          <Card className='rounded-lg'>
            <CardContent className='py-8 text-center'>
              <ArrowLeftRight className='text-muted-foreground mx-auto mb-3 size-8' />
              <p className='font-semibold'>No member transfer requests found.</p>
              <p className='text-muted-foreground mt-1 text-sm'>Sponsor-approved transfers will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-4 xl:grid-cols-2 2xl:grid-cols-3'>
            {requests.map(request => (
              <MemberTransferRequestCard key={request.id} isAdminUser request={request} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default AdminMemberTransfersPage
