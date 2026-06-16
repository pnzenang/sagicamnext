import { Card } from '@/components/ui/card'

import MembersDataTable from '@/components/shadcn-studio/blocks/datatable-membersAdmin'
import { fetchMembersForAdmin } from '@/utils/actions'
import { memberStatus } from '@/utils/types'

const getMembershipSummary = (members: Awaited<ReturnType<typeof fetchMembersForAdmin>>) => ({
  awaiting: members.filter(member => member.memberStatus === memberStatus.Awaiting).length,
  delinquent: members.filter(member => member.memberStatus === memberStatus.Delinquent).length,
  pending: members.filter(member => member.memberStatus === memberStatus.Pending).length,
  total: members.length,
  vested: members.filter(member => member.memberStatus === memberStatus.Vested).length
})

const DataTablePreview = async () => {
  const members = await fetchMembersForAdmin()
  const membershipSummary = getMembershipSummary(members)

  return (
    <div className='max-w-full min-w-0 py-4 sm:py-10'>
      <div className='max-w-9xl mx-auto max-w-full min-w-0 space-y-4 px-0 sm:px-6 lg:px-8'>
        <Card className='max-w-9xl mx-auto max-w-full min-w-0 overflow-hidden py-0'>
          <MembersDataTable data={members} membershipSummary={membershipSummary} />
        </Card>
      </div>
    </div>
  )
}

export default DataTablePreview
