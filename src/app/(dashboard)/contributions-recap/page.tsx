import { Card } from '@/components/ui/card'
import { fetchProfile } from '@/utils/actions'
import React from 'react'

const Contribution = async () => {
  const user = await fetchProfile()
  return (
    <section>
      <Card className='mx-auto my-2 max-w-7xl rounded-lg border bg-white p-4'>
        <h1 className='text-muted-foreground py-1 text-sm font-bold sm:text-3xl lg:text-5xl'>CONTRIBUTIONS RECAP</h1>
        <h1 className='text-muted-foreground text-sm font-bold sm:text-lg'>
          In this section, you can find a comprehensive overview of your contributions over the months. This recap
          provides a clear summary of your contributions, allowing you to track your payments and stay informed about
          your financial position.
        </h1>
      </Card>
      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vQf_SMlzTk7M2b90OBxjelqh_y0us5Klit1EdVm5Sm4E3LKbyo4eI0xpc9m1NVvtsJouTKJnHFdk7hc/pubhtml?widget=true&amp;headers=false'
        className='mx-auto h-160 w-full max-w-7xl items-center'
      ></iframe>
    </section>
  )
}

export default Contribution
