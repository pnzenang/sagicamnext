'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import type { Table as TanStackTable } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

type TablePaginationControlsProps<TData> = {
  table: TanStackTable<TData>
  pages: number[]
  showLeftEllipsis: boolean
  showRightEllipsis: boolean
  className?: string
  navigationClassName?: string
  pageButtonClassName?: string
  inactivePageButtonClassName?: string
}

export function TablePaginationControls<TData>({
  table,
  pages,
  showLeftEllipsis,
  showRightEllipsis,
  className,
  navigationClassName = 'text-primary',
  pageButtonClassName,
  inactivePageButtonClassName = 'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-red-300/40'
}: TablePaginationControlsProps<TData>) {
  const currentPage = table.getState().pagination.pageIndex + 1

  return (
    <Pagination className={className}>
      <PaginationContent className='flex-nowrap'>
        <PaginationItem>
          <Button
            className='disabled:pointer-events-none disabled:opacity-50'
            variant={'ghost'}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label='Go to previous page'
          >
            <ChevronLeftIcon aria-hidden='true' className={navigationClassName} />
            <span className={cn(navigationClassName, 'max-sm:hidden')}>Previous</span>
          </Button>
        </PaginationItem>

        {showLeftEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {pages.map(page => {
          const isActive = page === currentPage

          return (
            <PaginationItem key={page}>
              <Button
                size='icon'
                className={cn(pageButtonClassName, !isActive && inactivePageButtonClassName)}
                onClick={() => table.setPageIndex(page - 1)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </Button>
            </PaginationItem>
          )
        })}

        {showRightEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        <PaginationItem>
          <Button
            className='disabled:pointer-events-none disabled:opacity-50'
            variant={'ghost'}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label='Go to next page'
          >
            <span className={cn(navigationClassName, 'max-sm:hidden')}>Next</span>
            <ChevronRightIcon aria-hidden='true' className={navigationClassName} />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
