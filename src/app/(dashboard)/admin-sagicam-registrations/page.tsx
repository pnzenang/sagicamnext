import { BellRing } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { resetRegistrationPaymentAlertAction } from '@/utils/actions'
import {
  fetchSponsorRegistrationSummary,
  registrationBalanceAdjustmentType,
  registrationFeePerEligibleMember
} from '@/utils/sagicam-registration-summary'
import { memberStatus } from '@/utils/types'
import db from '@/utils/db'
import AdminSagicamRegistrationsTable, {
  type AdminSagicamRegistrationsRow,
  type AdminSagicamRegistrationsTotals
} from './AdminSagicamRegistrationsTable'

const decimalToNumber = (value: unknown) => Number(value ?? 0)
const registrationPaymentAlertType = 'registration'
const allPaymentAlertSponsorsCode = '__all__'
const defaultPaymentAlertResetAt = new Date(0)

const alertTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
})

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

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
            Reset
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

const AdminSagicamRegistrations = async () => {
  const sponsorRegistrationPayments = await db.sponsorRegistrationPayment.findMany({
    orderBy: {
      sponsorCode: 'asc'
    }
  })

  const sponsorBalanceAdjustments = await db.sponsorBalanceAdjustment.findMany({
    where: {
      balanceType: registrationBalanceAdjustmentType
    },
    orderBy: {
      sponsorCode: 'asc'
    }
  })

  const sponsorRegistrationUsages = await db.sponsorRegistrationUsage.findMany({
    select: {
      sponsorCode: true
    }
  })

  const paymentAlertResets = await db.paymentAlertReset.findMany({
    where: {
      alertType: registrationPaymentAlertType
    }
  })

  const paymentAlertResetByTypeAndSponsor = new Map(
    paymentAlertResets.map(reset => [`${reset.alertType}:${reset.sponsorCode}`, reset.resetAt])
  )

  const getRegistrationPaymentAlertResetAt = (sponsorCode: string) => {
    const globalResetAt =
      paymentAlertResetByTypeAndSponsor.get(`${registrationPaymentAlertType}:${allPaymentAlertSponsorsCode}`) ??
      defaultPaymentAlertResetAt

    const sponsorResetAt =
      paymentAlertResetByTypeAndSponsor.get(`${registrationPaymentAlertType}:${sponsorCode}`) ??
      defaultPaymentAlertResetAt

    return sponsorResetAt > globalResetAt ? sponsorResetAt : globalResetAt
  }

  const registrationPaymentAlerts = sponsorRegistrationPayments
    .filter(
      payment =>
        decimalToNumber(payment.amountSent) > 0 &&
        Boolean(payment.lastSubmittedAt) &&
        payment.lastSubmittedAt! > getRegistrationPaymentAlertResetAt(payment.sponsorCode)
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
      ...sponsorRegistrationPayments.map(payment => payment.sponsorCode),
      ...sponsorBalanceAdjustments.map(adjustment => adjustment.sponsorCode),
      ...sponsorRegistrationUsages.map(usage => usage.sponsorCode),
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
      sponsorEmail: true
    },
    where: {
      sponsorCode: {
        in: sponsorCodes
      }
    }
  })

  const sponsorsByCode = new Map(sponsors.map(sponsor => [sponsor.sponsorCode, sponsor]))

  const registrationSummaries = await Promise.all(
    sponsorCodes.map(sponsorCode => fetchSponsorRegistrationSummary(sponsorCode, { noStore: true }))
  )

  const registrationSummaryByCode = new Map(registrationSummaries.map(summary => [summary.sponsorCode, summary]))

  const rows: AdminSagicamRegistrationsRow[] = sponsorCodes.map(sponsorCode => {
    const sponsor = sponsorsByCode.get(sponsorCode)
    const registrationSummary = registrationSummaryByCode.get(sponsorCode)

    const statusCounts = statusCountsByCode.get(sponsorCode) ?? {
      awaitingPublication: 0,
      pendingMembers: 0,
      vestedMembers: 0
    }

    return {
      awaitingPublication: statusCounts.awaitingPublication,
      pendingMembers: statusCounts.pendingMembers,
      registrationAmountSent: registrationSummary?.amountReceived ?? 0,
      registrationAmountUsed: registrationSummary?.amountUsed ?? 0,
      registrationBalance: registrationSummary?.balance ?? 0,
      registrationFeeOwed: statusCounts.pendingMembers * registrationFeePerEligibleMember,
      registrationReceived: registrationSummary?.amountVerified ?? 0,
      sponsorCode,
      sponsorEmail: sponsor?.sponsorEmail ?? '',
      vestedMembers: statusCounts.vestedMembers
    }
  })

  const totals: AdminSagicamRegistrationsTotals = rows.reduce(
    (currentTotals, row) => {
      currentTotals.awaitingPublication += row.awaitingPublication
      currentTotals.pendingMembers += row.pendingMembers
      currentTotals.registrationBalance += row.registrationBalance
      currentTotals.registrationAmountSent += row.registrationAmountSent
      currentTotals.registrationFeeOwed += row.registrationFeeOwed
      currentTotals.registrationReceived += row.registrationReceived
      currentTotals.vestedMembers += row.vestedMembers

      return currentTotals
    },
    {
      awaitingPublication: 0,
      pendingMembers: 0,
      registrationBalance: 0,
      registrationAmountSent: 0,
      registrationFeeOwed: 0,
      registrationReceived: 0,
      vestedMembers: 0
    }
  )

  return (
    <div className='max-w-full min-w-0 space-y-6 py-4 sm:py-10'>
      <div className='min-w-0'>
        <h1 className='text-4xl font-semibold tracking-normal'>Sagicam Registrations</h1>
        <p className='text-muted-foreground mt-2 text-sm'>Sponsor registration payment summary.</p>
      </div>

      <div className='max-w-full min-w-0'>
        <PaymentAlertCard
          title='Registration Payment Alerts'
          alerts={registrationPaymentAlerts}
          action={resetRegistrationPaymentAlertAction}
        />
      </div>

      <AdminSagicamRegistrationsTable rows={rows} totals={totals} />
    </div>
  )
}

export default AdminSagicamRegistrations
