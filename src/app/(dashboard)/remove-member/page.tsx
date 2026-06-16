import Link from 'next/link'
import { ArrowRight, Ellipsis, UserMinus } from 'lucide-react'

import { Button } from '@/components/ui/button'

const RemoveMemberPage = () => {
  return (
    <section className='mx-auto flex w-full max-w-4xl min-w-0 flex-col gap-8 py-4 sm:py-12'>
      <div className='space-y-4'>
        <div className='bg-destructive/10 text-destructive inline-flex size-12 items-center justify-center rounded-md'>
          <UserMinus className='size-6' aria-hidden='true' />
        </div>
        <div className='space-y-3'>
          <h1 className='text-2xl font-semibold sm:text-4xl'>Remove Member</h1>
          <p className='text-muted-foreground max-w-2xl text-base leading-7 sm:text-lg'>
            To remove a loved one, go to the All Loved Ones page, find the loved one in the table, then click the 3 dots
            on that loved one row and choose Remove Member.
          </p>
        </div>
      </div>

      <div className='border-border bg-muted/30 max-w-full min-w-0 overflow-hidden rounded-md border p-4 sm:p-6'>
        <ol className='space-y-4 text-sm leading-6 sm:text-base'>
          <li className='flex gap-3'>
            <span className='bg-destructive text-destructive-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold'>
              1
            </span>
            <span>Open the All Loved Ones page from the button below or from the dashboard sidebar.</span>
          </li>
          <li className='flex gap-3'>
            <span className='bg-destructive text-destructive-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold'>
              2
            </span>
            <span className='flex flex-wrap items-center gap-2'>
              Find the correct loved one row and click the 3 dots button
              <span className='border-border bg-background inline-flex size-8 items-center justify-center rounded-md border'>
                <Ellipsis className='size-5' aria-hidden='true' />
              </span>
              on that row.
            </span>
          </li>
          <li className='flex gap-3'>
            <span className='bg-destructive text-destructive-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold'>
              3
            </span>
            <span>Select Remove Member and complete the removal form carefully.</span>
          </li>
        </ol>
      </div>

      <div>
        <Button asChild size='lg' variant='destructive'>
          <Link href='/all-members'>
            Go to All Loved Ones
            <ArrowRight aria-hidden='true' />
          </Link>
        </Button>
      </div>
    </section>
  )
}

export default RemoveMemberPage
