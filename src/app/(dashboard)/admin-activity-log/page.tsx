import DashboardActivityLogTable from '@/components/dashboard/DashboardActivityLogTable'
import { fetchAdminDashboardActivityLogsAction } from '@/utils/actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const AdminActivityLogPage = async () => {
  const rows = await fetchAdminDashboardActivityLogsAction()

  return (
    <section className='max-w-full min-w-0 space-y-6 py-4 sm:py-10'>
      <div className='min-w-0'>
        <h1 className='text-3xl font-semibold tracking-normal sm:text-4xl'>Admin activity log</h1>
        <p className='text-muted-foreground mt-2 text-sm'>
          Recent sponsor and SAGICAM admin actions across all dashboards.
        </p>
      </div>

      <DashboardActivityLogTable rows={rows} showSponsor storageKey='sagicam:admin-activity-log' />
    </section>
  )
}

export default AdminActivityLogPage
