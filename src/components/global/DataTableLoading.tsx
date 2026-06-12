import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface DataTableLoadingProps {
  columnCount: number
  rowCount?: number
}

const DataTableLoading = ({ columnCount, rowCount = 10 }: DataTableLoadingProps) => {
  return (
    <div className='w-full space-y-3 overflow-auto'>
      <div className='flex w-full items-center justify-between space-x-2 overflow-auto p-1'>
        <div className='flex flex-1 items-center space-x-2'>
          <Skeleton className='h-7 w-37.5 lg:w-62.5' />
          <Skeleton className='h-7 w-17.5 border-dashed' />
        </div>
        <Skeleton className='ml-auto hidden h-7 w-17.5 lg:flex' />
      </div>
      <div className='hidden overflow-x-auto rounded-md border md:block'>
        <Table>
          <TableHeader>
            {Array.from({ length: 1 }).map((_, i) => (
              <TableRow key={i} className='hover:bg-transparent'>
                {Array.from({ length: columnCount }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className='h-6 w-full' />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i} className='hover:bg-transparent'>
                {Array.from({ length: columnCount }).map((_, i) => (
                  <TableCell key={i}>
                    <Skeleton className='h-6 w-full' />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className='grid gap-3 md:hidden'>
        {Array.from({ length: Math.min(rowCount, 6) }).map((_, i) => (
          <div key={i} className='rounded-md border p-4'>
            <Skeleton className='h-5 w-2/3' />
            <div className='mt-4 grid gap-3'>
              {Array.from({ length: Math.min(columnCount, 5) }).map((_, i) => (
                <div key={i} className='flex items-center justify-between gap-4'>
                  <Skeleton className='h-4 w-1/3' />
                  <Skeleton className='h-4 w-1/2' />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className='flex w-full flex-col items-center justify-between gap-4 overflow-auto px-2 py-1 sm:flex-row sm:gap-8'>
        <div className='flex-1'>
          <Skeleton className='h-8 w-1/3' />
        </div>
      </div>
    </div>
  )
}

export default DataTableLoading
