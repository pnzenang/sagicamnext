'use client'

import type { ReactNode } from 'react'

import { flexRender, type Cell, type Row, type Table as ReactTable } from '@tanstack/react-table'

import { cn } from '@/lib/utils'

type ResponsiveTableCardsProps<TData> = {
  accentClassName?: string
  emptyMessage: string
  getCardSubtitle?: (row: Row<TData>) => ReactNode
  getCardTitle?: (row: Row<TData>) => ReactNode
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
  table
}: ResponsiveTableCardsProps<TData>) => {
  const rows = table.getRowModel().rows

  if (!rows.length) {
    return (
      <div className='md:hidden'>
        <div className='text-muted-foreground rounded-md border px-4 py-10 text-center text-sm'>{emptyMessage}</div>
      </div>
    )
  }

  return (
    <div className='grid gap-3 md:hidden'>
      {rows.map(row => (
        <article key={row.id} className={cn('bg-background rounded-md border shadow-sm', accentClassName)}>
          {(getCardTitle || getCardSubtitle) && (
            <div className='border-b px-4 py-3'>
              {getCardTitle ? <div className='text-base font-extrabold break-words'>{getCardTitle(row)}</div> : null}
              {getCardSubtitle ? (
                <div className='text-muted-foreground mt-1 text-xs font-semibold break-words'>{getCardSubtitle(row)}</div>
              ) : null}
            </div>
          )}
          <div className='divide-y'>
            {row.getVisibleCells().map(cell => (
              <div key={cell.id} className='grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 px-4 py-3'>
                <div className='text-muted-foreground text-xs leading-snug font-semibold tracking-normal uppercase'>
                  {getCellLabel(cell)}
                </div>
                <div className='min-w-0 text-right text-sm leading-snug font-semibold break-words [&>*]:ml-auto'>
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
