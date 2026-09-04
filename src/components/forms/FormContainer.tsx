'use client'

import { useActionState, useEffect, type FormEventHandler, type ReactNode } from 'react'

import { useRouter } from 'next/navigation'

import { toast } from 'sonner'

import type { actionFunction } from '@/utils/types'

const initialState = {
  message: ''
}

const FormContainer = ({
  action,
  children,
  className,
  onSubmit,
  refreshOnMessage = false
}: {
  action: actionFunction
  children: ReactNode
  className?: string
  onSubmit?: FormEventHandler<HTMLFormElement>
  refreshOnMessage?: boolean
}) => {
  const router = useRouter()
  const [state, formAction] = useActionState(action, initialState)

  useEffect(() => {
    if (state.message) {
      toast(state.message)

      if (refreshOnMessage) {
        router.refresh()
      }
    }
  }, [refreshOnMessage, router, state])

  return (
    <form action={formAction} className={className} onSubmit={onSubmit}>
      {children}
    </form>
  )
}

export default FormContainer
