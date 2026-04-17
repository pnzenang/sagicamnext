import { Suspense } from 'react'

import { Card } from '@/components/ui/card'
import {
  fetchDeceasedMembersAction,
  fetchDeceasedMembersActionAdmin,
  fetchProfile,
  fetchRemovedMembersAction
} from '@/utils/actions'

import DeceasedMembersDataTable from '@/components/shadcn-studio/blocks/datatable-deceasedAdmin'

const DataTablePreview = async () => {
  const deceasedMembers = await fetchDeceasedMembersActionAdmin()
  const users = await fetchProfile()

  return (
    <div className='py-8 sm:py-10'>
      <div className='max-w-9xl mx-auto px-4 sm:px-6 lg:px-8'>
        <Card className='max-w-9xl mx-auto w-full py-0'>
          <DeceasedMembersDataTable data={deceasedMembers} />
        </Card>
      </div>
    </div>
  )
}

export default DataTablePreview
