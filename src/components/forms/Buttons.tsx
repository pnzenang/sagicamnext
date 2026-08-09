'use client'

import type { ComponentProps } from 'react'

import { Loader } from 'lucide-react'
import { useFormStatus } from 'react-dom'

import { Button } from '../ui/button'

type SubmitButtonProps = ComponentProps<typeof Button> & {
  text?: string
}

export const SubmitButton = ({
  className = '',
  disabled,
  size = 'lg',
  text = 'submit',
  ...props
}: SubmitButtonProps) => {
  const { pending } = useFormStatus()

  return (
    <Button
      type='submit'
      disabled={pending || disabled}
      aria-busy={pending}
      className={`capitalize ${className}`}
      size={size}
      {...props}
    >
      {pending ? (
        <>
          <Loader className='size-4 shrink-0 animate-spin' aria-hidden='true' />
          <span>Please wait...</span>
        </>
      ) : (
        text
      )}
    </Button>
  )
}
