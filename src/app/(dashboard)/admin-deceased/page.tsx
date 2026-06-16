import { Card } from '@/components/ui/card'
import { fetchDeceasedMembersActionAdmin } from '@/utils/actions'
import { contributionStatus } from '@/utils/types'

import DeceasedMembersDataTable from '@/components/shadcn-studio/blocks/datatable-deceasedAdmin'

const getDeceasedSummary = (deceasedMembers: Awaited<ReturnType<typeof fetchDeceasedMembersActionAdmin>>) => ({
  completed: deceasedMembers.filter(member => member.contributionStatus === contributionStatus.completed).length,
  denied: deceasedMembers.filter(member => member.contributionStatus === contributionStatus.denied).length,
  inReview: deceasedMembers.filter(member => member.contributionStatus === contributionStatus.review).length,
  total: deceasedMembers.length,
  underway: deceasedMembers.filter(member => member.contributionStatus === contributionStatus.underway).length
})

const DataTablePreview = async () => {
  const deceasedMembers = await fetchDeceasedMembersActionAdmin()
  const deceasedSummary = getDeceasedSummary(deceasedMembers)

  return (
    <div className='max-w-full min-w-0 py-4 sm:py-10'>
      <div className='max-w-9xl mx-auto max-w-full min-w-0 px-0 sm:px-6 lg:px-8'>
        <Card className='max-w-9xl mx-auto max-w-full min-w-0 overflow-hidden py-0'>
          <DeceasedMembersDataTable data={deceasedMembers} deceasedSummary={deceasedSummary} />
        </Card>
      </div>
    </div>
  )
}

export default DataTablePreview
