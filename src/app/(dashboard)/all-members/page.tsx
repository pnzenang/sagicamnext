import { ReceiptText } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import MembersDataTable from '@/components/shadcn-studio/blocks/datatable-members'
import { fetchMembers } from '@/utils/actions'
import { memberStatus } from '@/utils/types'

const REGISTRATION_FEE_PER_PENDING_MEMBER = 10
const ANTICIPATED_CONTRIBUTION_PER_PENDING_MEMBER = 30

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const getMembershipSummary = (members: Awaited<ReturnType<typeof fetchMembers>>) => ({
  awaiting: members.filter(member => member.memberStatus === memberStatus.Awaiting).length,
  delinquent: members.filter(member => member.memberStatus === memberStatus.Delinquent).length,
  pending: members.filter(member => member.memberStatus === memberStatus.Pending).length,
  total: members.length,
  vested: members.filter(member => member.memberStatus === memberStatus.Vested).length
})

const getCollectionSummary = (
  members: Awaited<ReturnType<typeof fetchMembers>>,
  membershipSummary: ReturnType<typeof getMembershipSummary>
) => {
  const firstMember = members[0] as { currentContributionAmountOwed?: number } | undefined
  const monthlyContributionAmount = firstMember?.currentContributionAmountOwed ?? 0
  const registrationFeesTotal = membershipSummary.pending * REGISTRATION_FEE_PER_PENDING_MEMBER
  const anticipatedContributionTotal = membershipSummary.pending * ANTICIPATED_CONTRIBUTION_PER_PENDING_MEMBER

  return {
    anticipatedContributionTotal,
    monthlyContributionAmount,
    pendingLovedOnes: membershipSummary.pending,
    registrationFeesTotal,
    totalAmount: monthlyContributionAmount + registrationFeesTotal + anticipatedContributionTotal
  }
}

const DataTablePreview = async () => {
  const members = await fetchMembers()
  const membershipSummary = getMembershipSummary(members)
  const collectionSummary = getCollectionSummary(members, membershipSummary)

  const amountDetails = [
    {
      label: 'Current monthly contribution',
      note: `${membershipSummary.vested.toLocaleString()} vested loved one(s) counted`,
      value: collectionSummary.monthlyContributionAmount
    },
    {
      label: 'Registration fees',
      note: `${collectionSummary.pendingLovedOnes.toLocaleString()} pending loved one(s) x ${currencyFormatter.format(REGISTRATION_FEE_PER_PENDING_MEMBER)}`,
      value: collectionSummary.registrationFeesTotal
    },
    {
      label: 'Anticipated contributions',
      note: `${collectionSummary.pendingLovedOnes.toLocaleString()} pending loved one(s) x ${currencyFormatter.format(ANTICIPATED_CONTRIBUTION_PER_PENDING_MEMBER)}`,
      value: collectionSummary.anticipatedContributionTotal
    }
  ]

  return (
    <div className='py-8 sm:py-10'>
      <div className='max-w-9xl mx-auto space-y-4 px-4 sm:px-6 lg:px-8'>
        <Card className='border-primary/30 bg-primary/10 py-0'>
          <CardHeader className='border-primary/20 border-b py-5'>
            <div className='flex items-start justify-between gap-4'>
              <div className='space-y-2'>
                <CardTitle className='text-2xl font-semibold tracking-normal'>Total amount to be collected</CardTitle>
                <p className='text-muted-foreground text-sm'>
                  Includes this month&apos;s contribution plus registration and anticipated contribution for pending
                  loved ones.
                </p>
              </div>
              <div className='border-primary/20 bg-background/80 text-primary flex size-11 shrink-0 items-center justify-center rounded-md border'>
                <ReceiptText className='size-5' aria-hidden='true' />
              </div>
            </div>
          </CardHeader>
          <CardContent className='grid gap-5 py-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-stretch'>
            <div className='border-primary/20 bg-background/80 rounded-lg border p-5'>
              <p className='text-muted-foreground text-sm font-semibold'>Total to collect</p>
              <p className='text-primary mt-2 text-4xl font-extrabold tracking-normal'>
                {currencyFormatter.format(collectionSummary.totalAmount)}
              </p>
              <p className='text-muted-foreground mt-3 text-sm'>
                {collectionSummary.pendingLovedOnes.toLocaleString()} pending loved one(s) included in the registration
                and anticipated contribution details.
              </p>
            </div>

            <div className='border-primary/20 bg-background/80 overflow-hidden rounded-lg border'>
              {amountDetails.map(detail => (
                <div
                  key={detail.label}
                  className='flex flex-col gap-2 border-b px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between'
                >
                  <div>
                    <p className='font-semibold'>{detail.label}</p>
                    <p className='text-muted-foreground text-sm'>{detail.note}</p>
                  </div>
                  <p className='text-primary text-lg font-extrabold sm:text-right'>
                    {currencyFormatter.format(detail.value)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className='max-w-9xl mx-auto w-full py-0'>
          <MembersDataTable data={members} membershipSummary={membershipSummary} />
        </Card>
      </div>
    </div>
  )
}

export default DataTablePreview
