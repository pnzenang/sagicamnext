import { Suspense } from 'react'

import { Card } from '@/components/ui/card'
import { fetchProfile, fetchRemovedMembersAction, fetchRemovedMembersActionAdmin } from '@/utils/actions'
import RemovedMembersDataTable from '@/components/shadcn-studio/blocks/datatable-removedAdmin'

const DataTablePreview = async () => {
  const removedMembers = await fetchRemovedMembersActionAdmin()
  const users = await fetchProfile()

  return (
    <div className='max-w-full min-w-0 py-4 sm:py-10'>
      <div className='max-w-9xl mx-auto max-w-full min-w-0 px-0 sm:px-6 lg:px-8'>
        <Card className='max-w-9xl mx-auto max-w-full min-w-0 overflow-hidden py-0'>
          <RemovedMembersDataTable data={removedMembers} />
        </Card>
      </div>
    </div>
  )
}

export default DataTablePreview
