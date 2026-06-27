import { ArrowLeftRight } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

const MemberTransferPage = () => {
  return (
    <section className='grid w-full max-w-full min-w-0 gap-5 overflow-hidden px-0 py-4 sm:px-6 sm:py-8 lg:px-8'>
      <div>
        <h1 className='text-2xl font-extrabold tracking-normal sm:text-3xl'>Member Transfer</h1>
        <p className='text-muted-foreground mt-1 text-sm'>
          Sponsor member transfer requests will be available here.
        </p>
      </div>

      <Card className='rounded-lg'>
        <CardContent className='py-10 text-center'>
          <ArrowLeftRight className='text-muted-foreground mx-auto mb-3 size-8' />
          <p className='font-semibold'>Member transfer placeholder</p>
          <p className='text-muted-foreground mt-1 text-sm'>This page is ready for the transfer workflow.</p>
        </CardContent>
      </Card>
    </section>
  )
}

export default MemberTransferPage
