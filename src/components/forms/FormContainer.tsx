'use client'

import { useActionState, useEffect } from 'react'

import { toast } from 'sonner'

import type { actionFunction } from '@/utils/types'

const initialState = {
  message: ''
}

const FormContainer = ({ action, children }: { action: actionFunction; children: React.ReactNode }) => {
  const [state, formAction] = useActionState(action, initialState)

  useEffect(() => {
    if (state.message) {
      toast(state.message)
    }
  }, [state])

  return <form action={formAction}>{children}</form>
}

export default FormContainer
