import db from './db'
import { fetchSponsorContributionSummary } from './sagicam-contribution-summary'
import { memberStatus } from './types'

const contributionDeficitStatusTimeZone = 'America/New_York'

const getCurrentDayOfMonth = (date = new Date()) => {
  const formattedDay = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    timeZone: contributionDeficitStatusTimeZone
  }).format(date)

  return Number(formattedDay)
}

export const isAfterContributionDeficitStatusDeadline = (date = new Date()) => getCurrentDayOfMonth(date) > 25

export const enforceContributionDeficitMemberStatuses = async (sponsorCodes?: string[]) => {
  if (!isAfterContributionDeficitStatusDeadline()) {
    return {
      affectedSponsorCodes: [],
      updatedMembersCount: 0
    }
  }

  const candidateSponsorCodes =
    sponsorCodes && sponsorCodes.length > 0
      ? Array.from(new Set(sponsorCodes))
      : (
          await db.member.groupBy({
            by: ['sponsorCode'],
            where: {
              memberStatus: memberStatus.Vested
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

  const deficitSponsorCodes = contributionSummaries
    .filter(summary => summary.balance < 0)
    .map(summary => summary.sponsorCode)

  if (deficitSponsorCodes.length === 0) {
    return {
      affectedSponsorCodes: [],
      updatedMembersCount: 0
    }
  }

  const updateResult = await db.member.updateMany({
    data: {
      memberStatus: memberStatus.Delinquent
    },
    where: {
      memberStatus: memberStatus.Vested,
      sponsorCode: {
        in: deficitSponsorCodes
      }
    }
  })

  return {
    affectedSponsorCodes: deficitSponsorCodes,
    updatedMembersCount: updateResult.count
  }
}
