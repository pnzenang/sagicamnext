import { Card } from '@/components/ui/card'
import { fetchDeceasedMembersAction } from '@/utils/actions'
import { contributionStatus } from '@/utils/types'

import DeceasedMembersDataTable from '@/components/shadcn-studio/blocks/database-deceasedMembers'

const getDeceasedSummary = (deceasedMembers: Awaited<ReturnType<typeof fetchDeceasedMembersAction>>) => ({
  completed: deceasedMembers.filter(member => member.contributionStatus === contributionStatus.completed).length,
  denied: deceasedMembers.filter(member => member.contributionStatus === contributionStatus.denied).length,
  inReview: deceasedMembers.filter(member => member.contributionStatus === contributionStatus.review).length,
  total: deceasedMembers.length,
  underway: deceasedMembers.filter(member => member.contributionStatus === contributionStatus.underway).length
})

const DataTablePreview = async () => {
  const deceasedMembers = await fetchDeceasedMembersAction()
  const deceasedSummary = getDeceasedSummary(deceasedMembers)

  return (
    <div className='py-8 sm:py-10'>
      <div className='max-w-9xl mx-auto px-4 sm:px-6 lg:px-8'>
        <Card className='max-w-9xl mx-auto w-full py-0'>
          <DeceasedMembersDataTable data={deceasedMembers} deceasedSummary={deceasedSummary} />
        </Card>
      </div>
    </div>
  )
}

export default DataTablePreview
