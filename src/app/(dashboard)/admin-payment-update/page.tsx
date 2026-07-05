import AdminPaymentUpdateContent from '@/components/dashboard/AdminPaymentUpdateContent'
import { fetchAdminContributionPaymentUpdateRows } from '@/utils/admin-contribution-payment-update'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const paymentUpdateMonthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  timeZone: 'America/New_York',
  year: 'numeric'
})

const naturalCompare = (firstValue: string, secondValue: string) =>
  firstValue.localeCompare(secondValue, undefined, {
    numeric: true,
    sensitivity: 'base'
  })

const AdminPaymentUpdatePage = async () => {
  const rows = (await fetchAdminContributionPaymentUpdateRows()).sort((firstRow, secondRow) =>
    naturalCompare(firstRow.sponsorCode, secondRow.sponsorCode)
  )

  const monthYearLabel = paymentUpdateMonthFormatter.format(new Date())

  return <AdminPaymentUpdateContent monthYearLabel={monthYearLabel} rows={rows} />
}

export default AdminPaymentUpdatePage
