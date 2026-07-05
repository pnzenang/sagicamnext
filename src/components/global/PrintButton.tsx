'use client'

import type { ComponentProps } from 'react'

import { Printer } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PrintButtonProps = ComponentProps<typeof Button> & {
  label?: string
}

const PrintButton = ({ className, label = 'Print', onClick, size = 'sm', type = 'button', ...props }: PrintButtonProps) => {
  return (
    <Button
      type={type}
      size={size}
      onClick={event => {
        onClick?.(event)

        if (!event.defaultPrevented) {
          window.print()
        }
      }}
      className={cn('print:hidden', className)}
      {...props}
    >
      <Printer />
      {label}
    </Button>
  )
}

export default PrintButton
