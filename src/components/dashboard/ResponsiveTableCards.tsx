'use client'

import type { ReactNode } from 'react'

import { flexRender, type Cell, type Row, type Table as ReactTable } from '@tanstack/react-table'

import { cn } from '@/lib/utils'

type ResponsiveTableCardsProps<TData> = {
  accentClassName?: string
  emptyMessage: string
  getCardSubtitle?: (row: Row<TData>) => ReactNode
  getCardTitle?: (row: Row<TData>) => ReactNode
  keepColumnsOnMobile?: boolean
  table: ReactTable<TData>
}

const getFallbackLabel = (id: string) =>
  id
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())

const getCellLabel = <TData, TValue>(cell: Cell<TData, TValue>) => {
  const header = cell.column.columnDef.header

  return typeof header === 'string' ? header : getFallbackLabel(cell.column.id)
}

const ResponsiveTableCards = <TData,>({
  accentClassName,
  emptyMessage,
  getCardSubtitle,
  getCardTitle,
  keepColumnsOnMobile = true,
  table
}: ResponsiveTableCardsProps<TData>) => {
  const rows = table.getRowModel().rows

  if (!rows.length) {
    return (
      <div className='p-2 sm:p-3 md:hidden'>
        <div className='text-muted-foreground rounded-md border px-3 py-8 text-center text-sm sm:px-4 sm:py-10'>
          {emptyMessage}
        </div>
      </div>
    )
  }

  return (
    <div className='grid gap-3 p-2 sm:p-3 md:hidden'>
      {rows.map(row => (
        <article
          key={row.id}
          className={cn('bg-background overflow-hidden rounded-md border shadow-sm', accentClassName)}
        >
          {(getCardTitle || getCardSubtitle) && (
            <div className='border-b px-3 py-3 sm:px-4'>
              {getCardTitle ? <div className='text-base font-extrabold break-words'>{getCardTitle(row)}</div> : null}
              {getCardSubtitle ? (
                <div className='text-muted-foreground mt-1 text-xs font-semibold break-words'>
                  {getCardSubtitle(row)}
                </div>
              ) : null}
            </div>
          )}
          <div className='divide-y'>
            {row.getVisibleCells().map(cell => (
              <div
                key={cell.id}
                className={cn(
                  'grid px-3 py-2.5 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-3 sm:px-4 sm:py-3',
                  keepColumnsOnMobile ? 'grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-2' : 'gap-1.5'
                )}
              >
                <div className='text-muted-foreground text-xs leading-snug font-semibold tracking-normal uppercase'>
                  {getCellLabel(cell)}
                </div>
                <div
                  className={cn(
                    'min-w-0 text-sm leading-snug font-semibold break-words',
                    keepColumnsOnMobile
                      ? 'flex justify-end text-right [&>*]:ml-auto [&>*]:max-w-full [&>*]:justify-end [&>*]:text-right'
                      : 'text-left sm:text-right sm:[&>*]:ml-auto'
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}

export default ResponsiveTableCards
