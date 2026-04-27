import { Card } from '@/components/ui/card'
import React from 'react'

const NewAdditions = () => {
  return (
    <div>
      <Card className='mx-auto my-2 max-w-7xl rounded-lg border bg-white p-4'>
        <h1 className='text-muted-foreground py-1 text-sm font-bold sm:text-3xl lg:text-5xl'>
          NEWLY VESTED LOVED ONES
        </h1>
        <h1 className='text-muted-foreground text-sm font-bold sm:text-lg'>
          In this section, you can find The list of monthly newly registered from all the sponsors.
        </h1>
      </Card>
      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vQT8xQUCPYKSCCB9ggChdonRC76QEN1p0dFCQqiEO_Ox5Afo7OrVMiiVZfjkV5Pr7jSFcpv9BjE0nSx/pubhtml?widget=true&amp;headers=false'
        className='mx-auto mt-5 h-160 w-full max-w-19/20 items-center rounded-lg border'
      ></iframe>
    </div>
  )
}

export default NewAdditions
