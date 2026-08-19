import DashboardActivityLogTable from '@/components/dashboard/DashboardActivityLogTable'
import { fetchSponsorDashboardActivityLogsAction } from '@/utils/actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ActivityLogPage = async () => {
  const rows = await fetchSponsorDashboardActivityLogsAction()

  return (
    <section className='max-w-full min-w-0 space-y-6 py-4 sm:py-10'>
      <div className='min-w-0'>
        <h1 className='text-3xl font-semibold tracking-normal sm:text-4xl'>Activity log</h1>
        <p className='text-muted-foreground mt-2 text-sm'>
          Recent sponsor and SAGICAM admin actions recorded for this dashboard.
        </p>
      </div>

      <DashboardActivityLogTable rows={rows} storageKey='sagicam:activity-log' />
    </section>
  )
}

export default ActivityLogPage
