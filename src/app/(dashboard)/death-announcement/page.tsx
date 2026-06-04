import Link from 'next/link'
import { ArrowRight, Ellipsis, Megaphone } from 'lucide-react'

import { Button } from '@/components/ui/button'

const DeathAnnouncementPage = () => {
  return (
    <section className='mx-auto flex w-full max-w-4xl flex-col gap-8 py-8 sm:py-12'>
      <div className='space-y-4'>
        <div className='inline-flex size-12 items-center justify-center rounded-md bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300'>
          <Megaphone className='size-6' aria-hidden='true' />
        </div>
        <div className='space-y-3'>
          <h1 className='text-2xl font-semibold sm:text-4xl'>Death Announcement</h1>
          <p className='text-muted-foreground max-w-2xl text-base leading-7 sm:text-lg'>
            To announce the passing of a loved one, go to the All Loved Ones page, find the loved one in the table, then
            click the 3 dots on that loved one row and choose Announce Member&apos;s Death.
          </p>
        </div>
      </div>

      <div className='border-border bg-muted/30 rounded-md border p-5 sm:p-6'>
        <ol className='space-y-4 text-sm leading-6 sm:text-base'>
          <li className='flex gap-3'>
            <span className='flex size-7 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white'>
              1
            </span>
            <span>Open the All Loved Ones page from the button below or from the dashboard sidebar.</span>
          </li>
          <li className='flex gap-3'>
            <span className='flex size-7 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white'>
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
            <span className='flex size-7 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white'>
              3
            </span>
            <span>Select Announce Member&apos;s Death and complete the death announcement form.</span>
          </li>
        </ol>
      </div>

      <div>
        <Button asChild size='lg' className='bg-purple-600 text-white hover:bg-purple-700'>
          <Link href='/all-members'>
            Go to All Loved Ones
            <ArrowRight aria-hidden='true' />
          </Link>
        </Button>
      </div>
    </section>
  )
}

export default DeathAnnouncementPage
