import React from 'react'

import { Card } from '@/components/ui/card'
import { fetchProfile } from '@/utils/actions'

const Contribution = async () => {
  const user = await fetchProfile()

  return (
    <section className='max-w-full min-w-0 overflow-hidden'>
      <Card className='mx-auto my-2 max-w-full min-w-0 overflow-hidden rounded-lg border bg-white p-3 sm:p-4'>
        <h1 className='text-muted-foreground py-1 text-sm font-bold sm:text-3xl lg:text-5xl'>
          SPONSOR FINANCIAL POSITION
        </h1>
        <h1 className='text-muted-foreground text-sm font-bold sm:text-lg'>
          In this section, you can find a comprehensive overview of your contributions over the months. This recap
          provides a clear summary of your contributions, allowing you to track your payments and stay informed about
          your financial position.
        </h1>
      </Card>
      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vQf_SMlzTk7M2b90OBxjelqh_y0us5Klit1EdVm5Sm4E3LKbyo4eI0xpc9m1NVvtsJouTKJnHFdk7hc/pubhtml?widget=true&amp;headers=false'
        className='mx-auto mt-5 h-160 w-full max-w-full min-w-0 items-center rounded-lg border'
      ></iframe>
    </section>
  )
}

export default Contribution
