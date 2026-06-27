'use client'

import { useEffect, useState } from 'react'

import { UserCheck } from 'lucide-react'

import FormContainer from '@/components/forms/FormContainer'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { restoreRemovedMemberAction } from '@/utils/actions'
import type { RemovedMemberType } from '@/utils/types'

const MEMBER_REMOVAL_RESTORE_WINDOW_MS = 48 * 60 * 60 * 1000

const hasRestoreDetails = (removedMember: RemovedMemberType) =>
  Boolean(removedMember.nameOfBeneficiary && removedMember.delegateRecommendation && removedMember.memberStatus)

const getRestoreTimeRemaining = (removedMember: RemovedMemberType, now: number) => {
  const removedAt = new Date(removedMember.createdAt).getTime()

  if (!Number.isFinite(removedAt)) return 0

  return Math.max(0, removedAt + MEMBER_REMOVAL_RESTORE_WINDOW_MS - now)
}

const formatTimeRemaining = (milliseconds: number) => {
  const totalSeconds = Math.ceil(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${hours}h ${minutes}m ${seconds}s`
}

const RestoreRemovedMemberButton = ({ removedMember }: { removedMember: RemovedMemberType }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const restoreRemovedMember = restoreRemovedMemberAction.bind(null, { removedMemberId: removedMember.id })
  const memberName = `${removedMember.firstName} ${removedMember.lastAndMiddleNames}`.trim()
  const hasDetails = hasRestoreDetails(removedMember)
  const timeRemaining = getRestoreTimeRemaining(removedMember, now)
  const canRestore = hasDetails && timeRemaining > 0

  useEffect(() => {
    if (!isOpen) return

    const interval = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isOpen])

  useEffect(() => {
    if (!hasDetails) return

    const timeUntilExpiration = getRestoreTimeRemaining(removedMember, Date.now())

    if (timeUntilExpiration <= 0) return

    const timeout = window.setTimeout(() => {
      setNow(Date.now())
    }, timeUntilExpiration)

    return () => window.clearTimeout(timeout)
  }, [hasDetails, removedMember])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)

    if (open) setNow(Date.now())
  }

  if (!canRestore) return null

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip open={isOpen} onOpenChange={handleOpenChange}>
        <TooltipTrigger asChild>
          <div className='inline-flex'>
            <FormContainer action={restoreRemovedMember}>
              <Button
                type='submit'
                size='sm'
                variant='outline'
                className='border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800'
                aria-label='Restore removed loved one'
              >
                <UserCheck className='size-4' aria-hidden='true' />
                Restore
              </Button>
            </FormContainer>
          </div>
        </TooltipTrigger>
        <TooltipContent
          className='max-w-64 border border-emerald-200 bg-emerald-50 px-1 py-1 text-center leading-5 text-emerald-800 shadow-sm [&>svg]:bg-emerald-50 [&>svg]:fill-emerald-50'
          align='end'
          side='top'
          sideOffset={6}
        >
          <p>{memberName} can be restored within 48 hours of removal.</p>
          <p className='font-semibold'>Time remaining: {formatTimeRemaining(timeRemaining)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default RestoreRemovedMemberButton
