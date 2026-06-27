'use client'

import { useActionState, useEffect, type FormHTMLAttributes, type ReactNode } from 'react'

import { toast } from 'sonner'

import type { actionFunction } from '@/utils/types'

const initialState = {
  message: ''
}

const FormContainer = ({
  action,
  children,
  className,
  encType
}: {
  action: actionFunction
  children: ReactNode
  className?: string
  encType?: FormHTMLAttributes<HTMLFormElement>['encType']
}) => {
  const [state, formAction] = useActionState(action, initialState)

  useEffect(() => {
    if (state.message) {
      toast(state.message)
    }
  }, [state])

  return (
    <form action={formAction} className={className} encType={encType}>
      {children}
    </form>
  )
}

export default FormContainer
