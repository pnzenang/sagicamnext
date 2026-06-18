import { Skeleton } from '@/components/ui/skeleton'

const DashboardLoading = () => {
  return (
    <div className='max-w-full min-w-0 space-y-6 py-4 sm:py-10'>
      <div className='space-y-2'>
        <Skeleton className='h-10 w-64 max-w-full' />
        <Skeleton className='h-4 w-96 max-w-full' />
      </div>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className='rounded-md border p-4'>
            <Skeleton className='h-5 w-2/3' />
            <Skeleton className='mt-4 h-8 w-1/2' />
            <Skeleton className='mt-3 h-3 w-full' />
          </div>
        ))}
      </div>
      <div className='rounded-md border p-3'>
        <Skeleton className='h-10 w-full' />
        <div className='mt-4 hidden gap-3 md:grid'>
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className='h-12 w-full' />
          ))}
        </div>
        <div className='mt-4 grid gap-3 md:hidden'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className='rounded-md border p-3'>
              <Skeleton className='h-5 w-1/2' />
              <Skeleton className='mt-3 h-4 w-full' />
              <Skeleton className='mt-2 h-4 w-4/5' />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardLoading
