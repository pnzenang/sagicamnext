import ContributionAssessmentForm from '@/components/dashboard/ContributionAssessmentForm'
import { memberStatus } from '@/utils/types'
import db from '@/utils/db'
import AdminSagicamPaymentsTable, {
  type AdminSagicamPaymentsRow,
  type AdminSagicamPaymentsTotals
} from './AdminSagicamPaymentsTable'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
})

const decimalToNumber = (value: unknown) => Number(value ?? 0)
const registrationFeePerAwaitingMember = 40

const AdminSagicamPayments = async () => {
  const vestedMembersCount = await db.member.count({
    where: {
      memberStatus: memberStatus.Vested
    }
  })

  const latestContributionAssessment = await db.contributionAssessment.findFirst({
    include: {
      groups: {
        orderBy: {
          sponsorCode: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const sponsorContributionPayments = await db.sponsorContributionPayment.findMany({
    orderBy: {
      sponsorCode: 'asc'
    }
  })

  const memberCountsBySponsorCode = await db.member.groupBy({
    _count: {
      _all: true
    },
    by: ['sponsorCode', 'memberStatus'],
    orderBy: {
      sponsorCode: 'asc'
    },
    where: {
      memberStatus: {
        in: [memberStatus.Vested, memberStatus.Awaiting]
      }
    }
  })

  const statusCountsByCode = new Map<string, { awaitingPublication: number; vestedMembers: number }>()

  memberCountsBySponsorCode.forEach(item => {
    const currentCounts = statusCountsByCode.get(item.sponsorCode) ?? {
      awaitingPublication: 0,
      vestedMembers: 0
    }

    if (item.memberStatus === memberStatus.Vested) {
      currentCounts.vestedMembers = item._count._all
    }

    if (item.memberStatus === memberStatus.Awaiting) {
      currentCounts.awaitingPublication = item._count._all
    }

    statusCountsByCode.set(item.sponsorCode, currentCounts)
  })

  const sponsorCodes = Array.from(
    new Set([
      ...(latestContributionAssessment?.groups.map(group => group.sponsorCode) ?? []),
      ...sponsorContributionPayments.map(payment => payment.sponsorCode),
      ...statusCountsByCode.keys()
    ])
  ).sort((firstCode, secondCode) =>
    firstCode.localeCompare(secondCode, undefined, {
      numeric: true,
      sensitivity: 'base'
    })
  )

  const sponsors = await db.profile.findMany({
    select: {
      sponsorCode: true,
      sponsorEmail: true
    },
    where: {
      sponsorCode: {
        in: sponsorCodes
      }
    }
  })

  const sponsorsByCode = new Map(sponsors.map(sponsor => [sponsor.sponsorCode, sponsor]))
  const owedByCode = new Map(latestContributionAssessment?.groups.map(group => [group.sponsorCode, group]) ?? [])
  const receivedByCode = new Map(sponsorContributionPayments.map(payment => [payment.sponsorCode, payment]))

  const rows: AdminSagicamPaymentsRow[] = sponsorCodes.map(sponsorCode => {
    const sponsor = sponsorsByCode.get(sponsorCode)
    const amountOwed = decimalToNumber(owedByCode.get(sponsorCode)?.amountOwed)
    const amountReceived = decimalToNumber(receivedByCode.get(sponsorCode)?.amountSent)

    const statusCounts = statusCountsByCode.get(sponsorCode) ?? {
      awaitingPublication: 0,
      vestedMembers: 0
    }

    const registrationFeeOwed = statusCounts.awaitingPublication * registrationFeePerAwaitingMember
    const registrationReceived = 0

    return {
      amountOwed,
      amountReceived,
      awaitingPublication: statusCounts.awaitingPublication,
      balance: Number((amountReceived - amountOwed).toFixed(2)),
      registrationBalance: Number((registrationReceived - registrationFeeOwed).toFixed(2)),
      registrationFeeOwed,
      registrationReceived,
      sponsorCode,
      sponsorEmail: sponsor?.sponsorEmail ?? '',
      vestedMembers: statusCounts.vestedMembers
    }
  })

  const totals: AdminSagicamPaymentsTotals = rows.reduce(
    (currentTotals, row) => {
      currentTotals.amountOwed += row.amountOwed
      currentTotals.amountReceived += row.amountReceived
      currentTotals.awaitingPublication += row.awaitingPublication
      currentTotals.balance += row.balance
      currentTotals.registrationBalance += row.registrationBalance
      currentTotals.registrationFeeOwed += row.registrationFeeOwed
      currentTotals.registrationReceived += row.registrationReceived
      currentTotals.vestedMembers += row.vestedMembers

      return currentTotals
    },
    {
      amountOwed: 0,
      amountReceived: 0,
      awaitingPublication: 0,
      balance: 0,
      registrationBalance: 0,
      registrationFeeOwed: 0,
      registrationReceived: 0,
      vestedMembers: 0
    }
  )

  return (
    <div className='space-y-6 py-8 sm:py-10'>
      <div>
        <h1 className='text-4xl font-semibold tracking-normal'>Sagicam Payments</h1>
        <p className='text-muted-foreground mt-2 text-sm'>
          Sponsor payment summary from the latest contribution assessment
          {latestContributionAssessment ? ` created on ${dateFormatter.format(latestContributionAssessment.createdAt)}` : ''}.
        </p>
      </div>

      <ContributionAssessmentForm vestedMembersCount={vestedMembersCount} />

      <AdminSagicamPaymentsTable rows={rows} totals={totals} />
    </div>
  )
}

export default AdminSagicamPayments
