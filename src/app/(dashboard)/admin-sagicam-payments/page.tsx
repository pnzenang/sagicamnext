import { BellRing } from 'lucide-react'

import ContributionAssessmentForm from '@/components/dashboard/ContributionAssessmentForm'
import { Button } from '@/components/ui/button'
import { fetchContributionCalculationSummaryAction, resetContributionPaymentAlertAction } from '@/utils/actions'
import {
  contributionBalanceAdjustmentType,
  getContributionReserveDeficitBalance
} from '@/utils/sagicam-contribution-summary'
import { memberStatus } from '@/utils/types'
import db from '@/utils/db'
import AdminSagicamPaymentsTable, {
  type AdminSagicamPaymentsRow,
  type AdminSagicamPaymentsTotals
} from './AdminSagicamPaymentsTable'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
})

const alertTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
})

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const decimalToNumber = (value: unknown) => Number(value ?? 0)
const contributionPaymentAlertType = 'contribution'
const allPaymentAlertSponsorsCode = '__all__'
const defaultPaymentAlertResetAt = new Date(0)

type PaymentAlertCardProps = {
  action: (formData: FormData) => Promise<void>
  alerts: { amount: number; sponsorCode: string; submittedAt: Date }[]
  title: string
}

const PaymentAlertCard = ({ action, alerts, title }: PaymentAlertCardProps) => {
  const paymentLabel = alerts.length === 1 ? 'payment' : 'payments'

  return (
    <div className='border-primary/20 bg-primary/5 rounded-md border p-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <div className='flex items-center gap-2'>
            <BellRing className='text-primary size-5 shrink-0' />
            <h2 className='text-lg font-extrabold'>{title}</h2>
          </div>
          <p className='text-muted-foreground mt-1 text-sm font-semibold'>
            You have {alerts.length} {paymentLabel} from the following sponsors:
          </p>
        </div>
        <form action={action}>
          <Button type='submit' size='sm' variant='outline' disabled={alerts.length === 0} className='w-full sm:w-auto'>
            Reset all
          </Button>
        </form>
      </div>
      {alerts.length > 0 ? (
        <div className='mt-4 grid grid-cols-1 gap-2 xl:grid-cols-2'>
          {alerts.map(alert => (
            <div
              key={`${alert.sponsorCode}-${alert.submittedAt.toISOString()}`}
              className='bg-background grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-md border px-3 py-2 text-sm font-extrabold sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center'
            >
              <span className='min-w-0 break-words'>{alert.sponsorCode}</span>
              <span className='text-primary shrink-0 text-right tabular-nums'>
                {currencyFormatter.format(alert.amount)}
              </span>
              <span className='text-muted-foreground col-span-2 shrink-0 text-left text-xs font-semibold sm:col-span-1 sm:text-right'>
                {alertTimeFormatter.format(alert.submittedAt)}
              </span>
              <form action={action} className='col-span-2 sm:col-span-3'>
                <input type='hidden' name='sponsorCode' value={alert.sponsorCode} />
                <Button type='submit' size='sm' variant='outline' className='h-8 w-full text-xs sm:w-auto'>
                  Reset this sponsor
                </Button>
              </form>
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
  const [vestedMembersCount, contributionCalculationSummary] = await Promise.all([
    db.member.count({
      where: {
        memberStatus: memberStatus.Vested
      }
    }),
    fetchContributionCalculationSummaryAction()
  ])

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

  const sponsorBalanceAdjustments = await db.sponsorBalanceAdjustment.findMany({
    where: {
      balanceType: contributionBalanceAdjustmentType
    },
    orderBy: {
      sponsorCode: 'asc'
    }
  })

  const paymentAlertResets = await db.paymentAlertReset.findMany({
    where: {
      alertType: contributionPaymentAlertType
    }
  })

  const paymentAlertResetByTypeAndSponsor = new Map(
    paymentAlertResets.map(reset => [`${reset.alertType}:${reset.sponsorCode}`, reset.resetAt])
  )

  const getContributionPaymentAlertResetAt = (sponsorCode: string) => {
    const globalResetAt =
      paymentAlertResetByTypeAndSponsor.get(`${contributionPaymentAlertType}:${allPaymentAlertSponsorsCode}`) ??
      defaultPaymentAlertResetAt

    const sponsorResetAt =
      paymentAlertResetByTypeAndSponsor.get(`${contributionPaymentAlertType}:${sponsorCode}`) ??
      defaultPaymentAlertResetAt

    return sponsorResetAt > globalResetAt ? sponsorResetAt : globalResetAt
  }

  const contributionPaymentAlerts = sponsorContributionPayments
    .filter(
      payment =>
        decimalToNumber(payment.amountSent) > 0 &&
        Boolean(payment.lastSubmittedAt) &&
        payment.lastSubmittedAt! > getContributionPaymentAlertResetAt(payment.sponsorCode)
    )
    .map(payment => ({
      amount: decimalToNumber(payment.amountSent),
      sponsorCode: payment.sponsorCode,
      submittedAt: payment.lastSubmittedAt!
    }))

  const memberCountsBySponsorCode = await db.member.groupBy({
    _count: {
      _all: true
    },
    by: ['sponsorCode', 'memberStatus'],
    orderBy: {
      sponsorCode: 'asc'
    },
    where: {
      memberStatus: memberStatus.Vested
    }
  })

  const vestedMembersByCode = new Map<string, number>()

  memberCountsBySponsorCode.forEach(item => {
    vestedMembersByCode.set(item.sponsorCode, item._count._all)
  })

  const sponsorCodes = Array.from(
    new Set([
      ...(latestContributionAssessment?.groups.map(group => group.sponsorCode) ?? []),
      ...contributionTotalsBySponsorCode.map(group => group.sponsorCode),
      ...sponsorContributionUsages.map(usage => usage.sponsorCode),
      ...contributionCreditsBySponsorCode.map(credit => credit.sponsorCode),
      ...sponsorContributionPayments.map(payment => payment.sponsorCode),
      ...sponsorBalanceAdjustments.map(adjustment => adjustment.sponsorCode),
      ...vestedMembersByCode.keys()
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

  const latestContributionGroupByCode = new Map(
    latestContributionAssessment?.groups.map(group => [group.sponsorCode, group]) ?? []
  )

  const contributionTotalByCode = new Map(
    contributionTotalsBySponsorCode.map(group => [group.sponsorCode, decimalToNumber(group._sum.amountOwed)])
  )

  const contributionUsageByCode = new Map(
    sponsorContributionUsages.map(usage => [usage.sponsorCode, decimalToNumber(usage.amountUsed)])
  )

  const contributionCreditByCode = new Map(
    contributionCreditsBySponsorCode.map(credit => [credit.sponsorCode, decimalToNumber(credit._sum.amountCredited)])
  )

  const contributionPaymentByCode = new Map(sponsorContributionPayments.map(payment => [payment.sponsorCode, payment]))

  const balanceAdjustmentByCode = new Map(
    sponsorBalanceAdjustments.map(adjustment => [adjustment.sponsorCode, decimalToNumber(adjustment.amount)])
  )

  const amountPerVestedMember = decimalToNumber(latestContributionAssessment?.amountPerVestedMember)

  const rows: AdminSagicamPaymentsRow[] = sponsorCodes.map(sponsorCode => {
    const sponsor = sponsorsByCode.get(sponsorCode)
    const latestContributionGroup = latestContributionGroupByCode.get(sponsorCode)
    const latestVestedMembersCount = latestContributionGroup?.vestedMembersCount ?? 0

    const amountOwed = latestContributionGroup
      ? decimalToNumber(latestContributionGroup.amountOwed)
      : Number((amountPerVestedMember * latestVestedMembersCount).toFixed(2))

    const contributionPayment = contributionPaymentByCode.get(sponsorCode)
    const amountVerified = decimalToNumber(contributionPayment?.amountVerified)
    const vestedContributionCredit = contributionCreditByCode.get(sponsorCode) ?? 0

    const totalAmountUsed = Number(
      ((contributionTotalByCode.get(sponsorCode) ?? 0) + (contributionUsageByCode.get(sponsorCode) ?? 0)).toFixed(2)
    )

    const manualBalanceAdjustment = balanceAdjustmentByCode.get(sponsorCode) ?? 0
    const vestedMembers = vestedMembersByCode.get(sponsorCode) ?? 0

    return {
      amountOwed,
      amountReceived: amountVerified,
      balance: getContributionReserveDeficitBalance({
        amountUsed: totalAmountUsed,
        amountVerified,
        manualBalanceAdjustment,
        vestedContributionCredit,
        vestedMembersCount: vestedMembers
      }),
      contributionCredit: vestedContributionCredit,
      contributionAmountUsed: totalAmountUsed,
      contributionAmountSent: decimalToNumber(contributionPayment?.amountSent),
      cemail: sponsor?.sponsorEmail ?? '',
      sponsorCode,
      vestedMembers
    }
  })

  const totals: AdminSagicamPaymentsTotals = rows.reduce(
    (currentTotals, row) => {
      currentTotals.amountOwed += row.amountOwed
      currentTotals.amountReceived += row.amountReceived
      currentTotals.balance += row.balance
      currentTotals.contributionAmountSent += row.contributionAmountSent
      currentTotals.vestedMembers += row.vestedMembers

      return currentTotals
    },
    {
      amountOwed: 0,
      amountReceived: 0,
      balance: 0,
      contributionAmountSent: 0,
      vestedMembers: 0
    }
  )

  return (
    <div className='max-w-full min-w-0 space-y-6 py-4 sm:py-10'>
      <div className='min-w-0'>
        <h1 className='text-4xl font-semibold tracking-normal'>Sagicam Contributions</h1>
        <p className='text-muted-foreground mt-2 text-sm'>
          Sponsor contribution summary from the latest contribution assessment
          {latestContributionAssessment
            ? ` created on ${dateFormatter.format(latestContributionAssessment.createdAt)}`
            : ''}
          .
        </p>
      </div>

      <ContributionAssessmentForm
        calculationDeathCount={contributionCalculationSummary.deathCount}
        monthlyContributionTotal={contributionCalculationSummary.totalAmount}
        vestedMembersCount={vestedMembersCount}
      />

      <div className='max-w-full min-w-0'>
        <PaymentAlertCard
          title='Contribution Payment Alerts'
          alerts={contributionPaymentAlerts}
          action={resetContributionPaymentAlertAction}
        />
      </div>

      <AdminSagicamPaymentsTable rows={rows} totals={totals} />
    </div>
  )
}

export default AdminSagicamPayments
