import db from './db'
import { fetchSponsorContributionSummary, type SponsorContributionSummary } from './sagicam-contribution-summary'
import { memberStatus } from './types'

const contributionDeficitStatusTimeZone = 'America/New_York'
const contributionDeficitGraceDay = 7

const datePartFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'numeric',
  timeZone: contributionDeficitStatusTimeZone,
  year: 'numeric'
})

const getZonedDateParts = (date = new Date()) => {
  const parts = datePartFormatter.formatToParts(date)

  return {
    day: Number(parts.find(part => part.type === 'day')?.value ?? 0),
    month: Number(parts.find(part => part.type === 'month')?.value ?? 0),
    year: Number(parts.find(part => part.type === 'year')?.value ?? 0)
  }
}

const getMonthIndex = ({ month, year }: { month: number; year: number }) => year * 12 + month - 1

const parseDate = (value: string | null) => {
  if (!value) return null

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

const getContributionDeficitOccurredAt = (summary: SponsorContributionSummary) => {
  const sortedDueMonths = [...summary.contributionDueMonths]
    .filter(month => parseDate(month.dueDate))
    .sort((firstMonth, secondMonth) => new Date(firstMonth.dueDate).getTime() - new Date(secondMonth.dueDate).getTime())

  const totalAssessedContribution = sortedDueMonths.reduce(
    (total, month) => Number((total + month.amount).toFixed(2)),
    0
  )

  const nonAssessmentAmountUsed = Number((summary.totalAmountUsed - totalAssessedContribution).toFixed(2))
  let runningBalance = Number(
    (
      summary.amountVerified +
      summary.vestedContributionCredit +
      summary.manualBalanceAdjustment -
      nonAssessmentAmountUsed
    ).toFixed(2)
  )

  for (const month of sortedDueMonths) {
    runningBalance = Number((runningBalance - month.amount).toFixed(2))

    if (runningBalance < 0) {
      return month.dueDate
    }
  }

  return summary.dueDate
}

export const isAfterContributionDeficitStatusDeadline = (
  deficitOccurredAt: string | null,
  currentDate = new Date()
) => {
  const deficitDate = parseDate(deficitOccurredAt)

  if (!deficitDate) return false

  const deficitMonthIndex = getMonthIndex(getZonedDateParts(deficitDate))
  const cutoffMonthIndex = deficitMonthIndex + 1
  const currentDateParts = getZonedDateParts(currentDate)
  const currentMonthIndex = getMonthIndex(currentDateParts)

  return (
    currentMonthIndex > cutoffMonthIndex ||
    (currentMonthIndex === cutoffMonthIndex && currentDateParts.day > contributionDeficitGraceDay)
  )
}

export const enforceContributionDeficitMemberStatuses = async (sponsorCodes?: string[]) => {
  const candidateSponsorCodes =
    sponsorCodes && sponsorCodes.length > 0
      ? Array.from(new Set(sponsorCodes))
      : (
          await db.member.groupBy({
            by: ['sponsorCode'],
            where: {
              memberStatus: {
                in: [memberStatus.Vested, memberStatus.Delinquent]
              }
            }
          })
        ).map(group => group.sponsorCode)

  if (candidateSponsorCodes.length === 0) {
    return {
      affectedSponsorCodes: [],
      updatedMembersCount: 0
    }
  }

  const contributionSummaries = await Promise.all(
    candidateSponsorCodes.map(sponsorCode => fetchSponsorContributionSummary(sponsorCode, { noStore: true }))
  )

  const deficitStatusGroups = contributionSummaries.reduce(
    (groups, summary) => {
      if (summary.balance >= 0) return groups

      const isAfterDeadline = isAfterContributionDeficitStatusDeadline(getContributionDeficitOccurredAt(summary))

      if (isAfterDeadline) {
        groups.afterDeadlineSponsorCodes.push(summary.sponsorCode)
      } else {
        groups.inGracePeriodSponsorCodes.push(summary.sponsorCode)
      }

      return groups
    },
    {
      afterDeadlineSponsorCodes: [] as string[],
      inGracePeriodSponsorCodes: [] as string[]
    }
  )

  if (
    deficitStatusGroups.afterDeadlineSponsorCodes.length === 0 &&
    deficitStatusGroups.inGracePeriodSponsorCodes.length === 0
  ) {
    return {
      affectedSponsorCodes: [],
      updatedMembersCount: 0
    }
  }

  const statusUpdates = [
    ...(deficitStatusGroups.afterDeadlineSponsorCodes.length > 0
      ? [
          db.member.updateMany({
            data: {
              memberStatus: memberStatus.Delinquent
            },
            where: {
              memberStatus: memberStatus.Vested,
              sponsorCode: {
                in: deficitStatusGroups.afterDeadlineSponsorCodes
              }
            }
          })
        ]
      : []),
    ...(deficitStatusGroups.inGracePeriodSponsorCodes.length > 0
      ? [
          db.member.updateMany({
            data: {
              memberStatus: memberStatus.Vested
            },
            where: {
              memberStatus: memberStatus.Delinquent,
              sponsorCode: {
                in: deficitStatusGroups.inGracePeriodSponsorCodes
              }
            }
          })
        ]
      : [])
  ]

  const updateResults = await db.$transaction(statusUpdates)

  return {
    affectedSponsorCodes: [
      ...deficitStatusGroups.afterDeadlineSponsorCodes,
      ...deficitStatusGroups.inGracePeriodSponsorCodes
    ],
    updatedMembersCount: updateResults.reduce((total, result) => total + result.count, 0)
  }
}
