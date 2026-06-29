'use client'

import { useActionState, useEffect, type ReactNode } from 'react'

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
  refreshOnMessage = false
}: {
  action: actionFunction
  children: ReactNode
  className?: string
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
    <form action={formAction} className={className}>
      {children}
    </form>
  )
}

export default FormContainer
