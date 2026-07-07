import { notFound } from 'next/navigation'
import Link from 'next/link'

import { ArrowLeft, Eye } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SponsorPaymentSummaryCards } from '@/components/dashboard/SponsorPaymentSections'
import MembersDataTable from '@/components/shadcn-studio/blocks/datatable-members'
import { fetchAdminSponsorDashboardPreviewAction } from '@/utils/actions'
import { memberStatus } from '@/utils/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type AdminSponsorViewPageProps = {
  params: Promise<{
    sponsorCode: string
  }>
}

const getMembershipSummary = (
  members: NonNullable<Awaited<ReturnType<typeof fetchAdminSponsorDashboardPreviewAction>>>['members']
) => ({
  awaiting: members.filter(member => member.memberStatus === memberStatus.Awaiting).length,
  delinquent: members.filter(member => member.memberStatus === memberStatus.Delinquent).length,
  pending: members.filter(member => member.memberStatus === memberStatus.Pending).length,
  total: members.length,
  vested: members.filter(member => member.memberStatus === memberStatus.Vested).length
})

const AdminSponsorViewPage = async ({ params }: AdminSponsorViewPageProps) => {
  const { sponsorCode } = await params
  const preview = await fetchAdminSponsorDashboardPreviewAction(decodeURIComponent(sponsorCode))

  if (!preview) {
    notFound()
  }

  const sponsorName = `${preview.sponsor.sponsorFirstName} ${preview.sponsor.sponsorLastAndMiddleName}`.trim()
  const sponsorContact = [preview.sponsor.sponsorEmail, preview.sponsor.sponsorPhoneNumber].filter(Boolean).join(' · ')
  const membershipSummary = getMembershipSummary(preview.members)

  return (
    <section className='max-w-full min-w-0 space-y-5 py-4 sm:py-10'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <Button asChild variant='ghost' size='sm' className='mb-2 w-fit px-0 hover:bg-transparent'>
            <Link href='/admin-count'>
              <ArrowLeft aria-hidden='true' />
              Admin Count
            </Link>
          </Button>
          <div className='flex min-w-0 flex-wrap items-center gap-2'>
            <h1 className='text-2xl font-extrabold tracking-normal sm:text-3xl'>Sponsor dashboard preview</h1>
            <Badge variant='secondary' className='rounded-md font-mono'>
              {preview.sponsor.sponsorCode}
            </Badge>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            Viewing the sponsor-facing dashboard for {sponsorName || preview.sponsor.sponsorCode}.
          </p>
          {sponsorContact ? (
            <p className='text-muted-foreground mt-1 text-xs font-semibold'>{sponsorContact}</p>
          ) : null}
        </div>
        <Badge variant='outline' className='w-fit rounded-md text-sm'>
          <Eye aria-hidden='true' />
          Read-only admin view
        </Badge>
      </div>
      <div className='max-w-9xl mx-auto max-w-full min-w-0 space-y-4 px-0 sm:px-6 lg:px-8'>
        <SponsorPaymentSummaryCards
          currentContribution={preview.currentContribution}
          currentRegistrationPayment={preview.currentRegistrationPayment}
        />
        <Card className='max-w-9xl mx-auto max-w-full min-w-0 overflow-hidden py-0'>
          <MembersDataTable
            currentContribution={preview.currentContribution}
            currentRegistrationPayment={preview.currentRegistrationPayment}
            data={preview.members}
            membershipSummary={membershipSummary}
            readOnly
          />
        </Card>
      </div>
    </section>
  )
}

export default AdminSponsorViewPage
