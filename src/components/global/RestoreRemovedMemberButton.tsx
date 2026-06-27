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
  const isExpired = hasDetails && timeRemaining <= 0

  const buttonClass = canRestore
    ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800'
    : 'border-red-200 text-red-700 opacity-100 hover:bg-red-50 hover:text-red-800 disabled:opacity-80'

  const tooltipClass = canRestore
    ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm [&>svg]:bg-emerald-50 [&>svg]:fill-emerald-50'
    : isExpired
      ? 'border border-red-200 bg-red-50 text-red-700 shadow-sm [&>svg]:bg-red-50 [&>svg]:fill-red-50'
      : undefined

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
                disabled={!canRestore}
                className={buttonClass}
                aria-label='Restore removed loved one'
              >
                <UserCheck className='size-4' aria-hidden='true' />
                Restore
              </Button>
            </FormContainer>
          </div>
        </TooltipTrigger>
        <TooltipContent
          className={`max-w-64 px-1 py-1 text-center leading-5 ${tooltipClass ?? ''}`}
          align='end'
          side='top'
          sideOffset={6}
        >
          {canRestore && (
            <>
              <p>{memberName} can be restored within 48 hours of removal.</p>
              <p className='font-semibold'>Time remaining: {formatTimeRemaining(timeRemaining)}</p>
            </>
          )}
          {isExpired && <p className='font-semibold'>{memberName} cannot be restored after 48 hours have elapsed.</p>}
          {!hasDetails && (
            <p className='font-semibold'>
              {memberName} cannot be restored because the original restoration details are missing.
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default RestoreRemovedMemberButton
