import ContributionAssessmentForm from '@/components/dashboard/ContributionAssessmentForm'
import { Button } from '@/components/ui/button'
import { resetContributionPaymentAlertAction, resetRegistrationPaymentAlertAction } from '@/utils/actions'
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
const contributionPaymentAlertType = 'contribution'
const registrationFeePerAwaitingMember = 40
const registrationPaymentAlertType = 'registration'
const defaultPaymentAlertResetAt = new Date(0)

type PaymentAlertCardProps = {
  action: (formData: FormData) => Promise<void>
  sponsorCodes: string[]
  title: string
}

const PaymentAlertCard = ({ action, sponsorCodes, title }: PaymentAlertCardProps) => {
  const paymentLabel = sponsorCodes.length === 1 ? 'payment' : 'payments'

  return (
    <div className='border-primary/20 bg-primary/5 rounded-md border p-4'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-lg font-extrabold'>{title}</h2>
          <p className='text-muted-foreground mt-1 text-sm font-semibold'>
            You have {sponsorCodes.length} {paymentLabel} from the following sponsors:
          </p>
        </div>
        <form action={action}>
          <Button type='submit' size='sm' variant='outline' disabled={sponsorCodes.length === 0}>
            Reset
          </Button>
        </form>
      </div>
      {sponsorCodes.length > 0 ? (
        <div className='mt-4 grid grid-cols-2 gap-2'>
          {sponsorCodes.map(sponsorCode => (
            <div key={sponsorCode} className='bg-background rounded-md border px-3 py-2 text-sm font-extrabold'>
              {sponsorCode}
            </div>
          ))}
        </div>
      ) : (
        <p className='text-muted-foreground mt-4 rounded-md border border-dashed px-3 py-4 text-center text-sm'>
          No new payments since the last reset.
        </p>
      )}
    </div>
  )
}

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

  const contributionTotalsBySponsorCode = await db.contributionAssessmentGroup.groupBy({
    _sum: {
      amountOwed: true
    },
    by: ['sponsorCode'],
    orderBy: {
      sponsorCode: 'asc'
    }
  })

  const sponsorContributionUsages = await db.sponsorContributionUsage.findMany({
    orderBy: {
      sponsorCode: 'asc'
    }
  })

  const contributionCreditsBySponsorCode = await db.sponsorContributionCredit.groupBy({
    _sum: {
      amountCredited: true
    },
    by: ['sponsorCode'],
    orderBy: {
      sponsorCode: 'asc'
    }
  })

  const sponsorRegistrationPayments = await db.sponsorRegistrationPayment.findMany({
    orderBy: {
      sponsorCode: 'asc'
    }
  })

  const paymentAlertResets = await db.paymentAlertReset.findMany({
    where: {
      alertType: {
        in: [contributionPaymentAlertType, registrationPaymentAlertType]
      }
    }
  })

  const paymentAlertResetByType = new Map(paymentAlertResets.map(reset => [reset.alertType, reset.resetAt]))

  const contributionPaymentAlertResetAt =
    paymentAlertResetByType.get(contributionPaymentAlertType) ?? defaultPaymentAlertResetAt

  const registrationPaymentAlertResetAt =
    paymentAlertResetByType.get(registrationPaymentAlertType) ?? defaultPaymentAlertResetAt

  const contributionPaymentAlertSponsorCodes = sponsorContributionPayments
    .filter(
      payment =>
        decimalToNumber(payment.amountSent) > 0 &&
        Boolean(payment.lastSubmittedAt) &&
        payment.lastSubmittedAt! > contributionPaymentAlertResetAt
    )
    .map(payment => payment.sponsorCode)

  const registrationPaymentAlertSponsorCodes = sponsorRegistrationPayments
    .filter(
      payment =>
        decimalToNumber(payment.amountSent) > 0 &&
        Boolean(payment.lastSubmittedAt) &&
        payment.lastSubmittedAt! > registrationPaymentAlertResetAt
    )
    .map(payment => payment.sponsorCode)

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
        in: [memberStatus.Vested, memberStatus.Awaiting, memberStatus.Pending]
      }
    }
  })

  const removedRegistrationUsedCountsBySponsorCode = await db.removedMember.groupBy({
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

  const deceasedRegistrationUsedCountsBySponsorCode = await db.deceasedMember.groupBy({
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

  const statusCountsByCode = new Map<
    string,
    { awaitingPublication: number; pendingMembers: number; vestedMembers: number }
  >()

  const archivedRegistrationUsedCountsByCode = new Map<string, number>()

  memberCountsBySponsorCode.forEach(item => {
    const currentCounts = statusCountsByCode.get(item.sponsorCode) ?? {
      awaitingPublication: 0,
      pendingMembers: 0,
      vestedMembers: 0
    }

    if (item.memberStatus === memberStatus.Vested) {
      currentCounts.vestedMembers = item._count._all
    }

    if (item.memberStatus === memberStatus.Awaiting) {
      currentCounts.awaitingPublication = item._count._all
    }

    if (item.memberStatus === memberStatus.Pending) {
      currentCounts.pendingMembers = item._count._all
    }

    statusCountsByCode.set(item.sponsorCode, currentCounts)
  })

  ;[...removedRegistrationUsedCountsBySponsorCode, ...deceasedRegistrationUsedCountsBySponsorCode].forEach(item => {
    archivedRegistrationUsedCountsByCode.set(
      item.sponsorCode,
      (archivedRegistrationUsedCountsByCode.get(item.sponsorCode) ?? 0) + item._count._all
    )
  })

  const sponsorCodes = Array.from(
    new Set([
      ...(latestContributionAssessment?.groups.map(group => group.sponsorCode) ?? []),
      ...contributionTotalsBySponsorCode.map(group => group.sponsorCode),
      ...sponsorContributionUsages.map(usage => usage.sponsorCode),
      ...contributionCreditsBySponsorCode.map(credit => credit.sponsorCode),
      ...sponsorContributionPayments.map(payment => payment.sponsorCode),
      ...sponsorRegistrationPayments.map(payment => payment.sponsorCode),
      ...statusCountsByCode.keys(),
      ...archivedRegistrationUsedCountsByCode.keys()
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
      sponsorEmail: true,
      sponsorPhoneNumber: true
    },
    where: {
      sponsorCode: {
        in: sponsorCodes
      }
    }
  })

  const sponsorsByCode = new Map(sponsors.map(sponsor => [sponsor.sponsorCode, sponsor]))
  const owedByCode = new Map(latestContributionAssessment?.groups.map(group => [group.sponsorCode, group]) ?? [])

  const totalOwedByCode = new Map(
    contributionTotalsBySponsorCode.map(group => [group.sponsorCode, group._sum.amountOwed])
  )

  const usedByCode = new Map(sponsorContributionUsages.map(usage => [usage.sponsorCode, usage.amountUsed]))

  const contributionCreditByCode = new Map(
    contributionCreditsBySponsorCode.map(credit => [credit.sponsorCode, credit._sum.amountCredited])
  )

  const receivedByCode = new Map(sponsorContributionPayments.map(payment => [payment.sponsorCode, payment]))
  const registrationPaymentsByCode = new Map(sponsorRegistrationPayments.map(payment => [payment.sponsorCode, payment]))

  const rows: AdminSagicamPaymentsRow[] = sponsorCodes.map(sponsorCode => {
    const sponsor = sponsorsByCode.get(sponsorCode)
    const amountOwed = decimalToNumber(owedByCode.get(sponsorCode)?.amountOwed)
    const contributionPayment = receivedByCode.get(sponsorCode)
    const contributionAmountSent = decimalToNumber(contributionPayment?.amountSent)
    const amountReceived = decimalToNumber(contributionPayment?.amountVerified)

    const totalContributionUsed = Number(
      (decimalToNumber(totalOwedByCode.get(sponsorCode)) + decimalToNumber(usedByCode.get(sponsorCode))).toFixed(2)
    )

    const registrationPayment = registrationPaymentsByCode.get(sponsorCode)

    const statusCounts = statusCountsByCode.get(sponsorCode) ?? {
      awaitingPublication: 0,
      pendingMembers: 0,
      vestedMembers: 0
    }

    const vestedContributionCredit = decimalToNumber(contributionCreditByCode.get(sponsorCode))

    const registrationFeeOwed = statusCounts.pendingMembers * registrationFeePerAwaitingMember

    const registrationAmountUsed =
      (statusCounts.awaitingPublication +
        statusCounts.vestedMembers +
        (archivedRegistrationUsedCountsByCode.get(sponsorCode) ?? 0)) *
      registrationFeePerAwaitingMember

    const registrationAmountSent = decimalToNumber(registrationPayment?.amountSent)
    const registrationReceived = decimalToNumber(registrationPayment?.amountVerified)

    return {
      amountOwed,
      amountReceived,
      awaitingPublication: statusCounts.awaitingPublication,
      balance: Number((amountReceived + vestedContributionCredit - totalContributionUsed).toFixed(2)),
      contributionCredit: vestedContributionCredit,
      contributionAmountUsed: totalContributionUsed,
      contributionAmountSent,
      pendingMembers: statusCounts.pendingMembers,
      registrationAmountUsed,
      registrationBalance: Number((registrationReceived - registrationAmountUsed).toFixed(2)),
      registrationAmountSent,
      registrationFeeOwed,
      registrationReceived,
      sponsorCode,
      sponsorEmail: sponsor?.sponsorEmail ?? '',
      sponsorPhoneNumber: sponsor?.sponsorPhoneNumber ?? '',
      vestedMembers: statusCounts.vestedMembers
    }
  })

  const totals: AdminSagicamPaymentsTotals = rows.reduce(
    (currentTotals, row) => {
      currentTotals.amountOwed += row.amountOwed
      currentTotals.amountReceived += row.amountReceived
      currentTotals.awaitingPublication += row.awaitingPublication
      currentTotals.balance += row.balance
      currentTotals.contributionAmountSent += row.contributionAmountSent
      currentTotals.pendingMembers += row.pendingMembers
      currentTotals.registrationBalance += row.registrationBalance
      currentTotals.registrationAmountSent += row.registrationAmountSent
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
      contributionAmountSent: 0,
      pendingMembers: 0,
      registrationBalance: 0,
      registrationAmountSent: 0,
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
          {latestContributionAssessment
            ? ` created on ${dateFormatter.format(latestContributionAssessment.createdAt)}`
            : ''}
          .
        </p>
      </div>

      <ContributionAssessmentForm vestedMembersCount={vestedMembersCount} />

      <div className='grid gap-4 lg:grid-cols-2'>
        <PaymentAlertCard
          title='Contribution Payment Alerts'
          sponsorCodes={contributionPaymentAlertSponsorCodes}
          action={resetContributionPaymentAlertAction}
        />
        <PaymentAlertCard
          title='Registration Payment Alerts'
          sponsorCodes={registrationPaymentAlertSponsorCodes}
          action={resetRegistrationPaymentAlertAction}
        />
      </div>

      <AdminSagicamPaymentsTable rows={rows} totals={totals} />
    </div>
  )
}

export default AdminSagicamPayments
