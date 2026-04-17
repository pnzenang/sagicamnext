import DataTableLoading from '@/components/global/DataTableLoading'
import { Shell } from '@/components/global/Shell'

export default function IndexLoading() {
  return (
    <Shell>
      <DataTableLoading columnCount={3} />
    </Shell>
  )
}
