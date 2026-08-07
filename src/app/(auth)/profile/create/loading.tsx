import { Skeleton } from '@/components/ui/skeleton'

export default function CreateProfileLoading() {
  return (
    <section className='bg-muted flex min-h-dvh w-full items-center justify-center px-4 py-10'>
      <div className='bg-background w-full max-w-5xl rounded-lg border p-4 shadow-sm sm:p-8'>
        <div className='mb-8 flex flex-col items-center'>
          <Skeleton className='size-20 rounded-full' />
          <Skeleton className='mt-4 h-10 w-80 max-w-full' />
          <Skeleton className='mt-3 h-4 w-full max-w-3xl' />
          <Skeleton className='mt-2 h-4 w-3/4 max-w-2xl' />
        </div>
        <div className='grid gap-4 md:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className='space-y-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-10 w-full' />
            </div>
          ))}
        </div>
        <div className='mt-4 grid gap-4 md:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className='space-y-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-10 w-full' />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
