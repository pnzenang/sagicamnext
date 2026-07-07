'use client'

import { useEffect, useState } from 'react'

import { UserCheck } from 'lucide-react'

import FormContainer from '@/components/forms/FormContainer'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { restoreDeceasedMemberAction } from '@/utils/actions'
import { contributionStatus, type DeceasedMemberType } from '@/utils/types'

const DEATH_ANNOUNCEMENT_RESTORE_WINDOW_MS = 48 * 60 * 60 * 1000
const lockedContributionStatuses = new Set<string>([contributionStatus.underway, contributionStatus.completed])

const hasRestoreDetails = (deceasedMember: DeceasedMemberType) =>
  Boolean(
    deceasedMember.dateOfBirth &&
    deceasedMember.delegateRecommendation &&
    deceasedMember.memberStatus &&
    deceasedMember.originalMemberCreatedAt
  )

const getRestoreTimeRemaining = (deceasedMember: DeceasedMemberType, now: number) => {
  const announcedAt = new Date(deceasedMember.createdAt).getTime()

  if (!Number.isFinite(announcedAt)) return 0

  return Math.max(0, announcedAt + DEATH_ANNOUNCEMENT_RESTORE_WINDOW_MS - now)
}

const formatTimeRemaining = (milliseconds: number) => {
  const totalSeconds = Math.ceil(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${hours}h ${minutes}m ${seconds}s`
}

const RestoreDeceasedMemberButton = ({
  compact = false,
  deceasedMember
}: {
  compact?: boolean
  deceasedMember: DeceasedMemberType
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const restoreDeceasedMember = restoreDeceasedMemberAction.bind(null, { deceasedMemberId: deceasedMember.id })
  const memberName = `${deceasedMember.firstName} ${deceasedMember.lastAndMiddleNames}`.trim()
  const hasDetails = hasRestoreDetails(deceasedMember)
  const timeRemaining = getRestoreTimeRemaining(deceasedMember, now)
  const isCaseLocked = lockedContributionStatuses.has(deceasedMember.contributionStatus)
  const canRestore = hasDetails && timeRemaining > 0 && !isCaseLocked

  useEffect(() => {
    if (!isOpen) return

    const interval = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isOpen])

  useEffect(() => {
    if (!hasDetails) return

    const timeUntilExpiration = getRestoreTimeRemaining(deceasedMember, Date.now())

    if (timeUntilExpiration <= 0) return

    const timeout = window.setTimeout(() => {
      setNow(Date.now())
    }, timeUntilExpiration)

    return () => window.clearTimeout(timeout)
  }, [hasDetails, deceasedMember])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)

    if (open) setNow(Date.now())
  }

  if (!canRestore) return null

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip open={isOpen} onOpenChange={handleOpenChange}>
        <TooltipTrigger asChild>
          <div className='inline-flex'>
            <FormContainer action={restoreDeceasedMember}>
              <Button
                type='submit'
                size={compact ? 'icon' : 'sm'}
                variant='outline'
                className={
                  compact
                    ? 'size-9 rounded-full border-emerald-200 p-0 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800'
                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800'
                }
                aria-label='Restore death announcement'
              >
                <UserCheck className='size-4' aria-hidden='true' />
                {compact ? null : 'Restore'}
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
          <p>{memberName} can be restored within 48 hours of the death announcement.</p>
          <p className='font-semibold'>Time remaining: {formatTimeRemaining(timeRemaining)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default RestoreDeceasedMemberButton
