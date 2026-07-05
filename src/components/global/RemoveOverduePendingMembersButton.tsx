'use client'

import { useActionState, useEffect } from 'react'

import { useFormStatus } from 'react-dom'

import { AlertTriangle, Loader, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { removeOverduePendingMembersAction } from '@/utils/actions'
import { registrationPaymentDeadlineDays } from '@/utils/registration-payment-deadline'

type RemoveOverduePendingMembersButtonProps = {
  overdueCount: number
}

const RemoveOverduePendingMembersButton = ({ overdueCount }: RemoveOverduePendingMembersButtonProps) => {
  const router = useRouter()

  const [state, formAction] = useActionState(removeOverduePendingMembersAction, {
    message: ''
  })

  useEffect(() => {
    if (!state.message) return

    toast(state.message)
    router.refresh()
  }, [router, state.message])

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant='destructive'
          className='shrink-0 max-md:flex-1 max-md:justify-center'
          disabled={overdueCount === 0}
        >
          <Trash2 />
          Overdue Registration ({overdueCount})
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2'>
            <AlertTriangle className='text-destructive size-5' aria-hidden='true' />
            Remove overdue pending members?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will move {overdueCount} pending member{overdueCount === 1 ? '' : 's'} past the{' '}
            {registrationPaymentDeadlineDays}-day registration fee deadline to Removed Members and delete the active
            member record. If this is a mistake, the member can be restored from Removed Members within 48 hours.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={formAction}>
          <AlertDialogFooter>
            <AlertDialogCancel type='button'>Cancel</AlertDialogCancel>
            <RemoveOverduePendingSubmitButton disabled={overdueCount === 0} />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const RemoveOverduePendingSubmitButton = ({ disabled }: { disabled: boolean }) => {
  const { pending } = useFormStatus()

  return (
    <Button type='submit' disabled={disabled || pending} className='bg-destructive hover:bg-destructive/90 text-white'>
      {pending ? (
        <>
          <Loader className='animate-spin' />
          Removing...
        </>
      ) : (
        'Remove'
      )}
    </Button>
  )
}

export default RemoveOverduePendingMembersButton
