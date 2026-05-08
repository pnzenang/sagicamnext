import { Card } from '@/components/ui/card'
import React from 'react'

const ContributionTable = () => {
  return (
    <section>
      <Card className='mx-auto my-2 max-w-7xl rounded-lg border bg-white p-4'>
        <h1 className='text-muted-foreground py-1 text-sm font-bold sm:text-3xl lg:text-5xl'>CONTRIBUTION TABLE</h1>
        <h1 className='text-muted-foreground text-sm font-bold sm:text-lg'>
          In the contribution table below, you will find find your contribution amount for the present month following
          your 4-letter code and head to the contributions payments to record your payment when made.
        </h1>
      </Card>
      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vT74FtT5PEcEtlD5lyq9rPxPzH3J5D6UcdAN9Z1qlh1dNVTs1_tZ6iisaAAVfYNt-qB4asfYUeR9SCV/pubhtml?gid=1224722656&amp;single=true&amp;widget=true&amp;headers=false'
        className='mx-auto mt-5 h-160 w-full max-w-19/20 items-center rounded-lg border'
      ></iframe>
    </section>
  )
}

export default ContributionTable
