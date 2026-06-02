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
    <div className='py-8 sm:py-10'>
      <div className='max-w-9xl mx-auto space-y-4 px-4 sm:px-6 lg:px-8'>
        <Card className='max-w-9xl mx-auto w-full py-0'>
          <MembersDataTable data={members} membershipSummary={membershipSummary} />
        </Card>
      </div>
    </div>
  )
}

export default DataTablePreview
