import db from './db'
import { contributionCreditPerVestedMember } from './sagicam-contribution-constants'
import { memberStatus } from './types'

export const awaitingPublicationAutoVestingLongevityDays = 30

const millisecondsPerDay = 24 * 60 * 60 * 1000

export type AutoVestedMember = {
  firstName: string
  id: string
  lastAndMiddleNames: string
  memberMatriculationNumber: string
  sponsorCode: string
}

export type AutoVestAwaitingMembersResult = {
  cutoffAt: string
  eligibleCount: number
  promotedCount: number
  promotedMembers: AutoVestedMember[]
}

export const getAwaitingPublicationAutoVestingCutoff = (now = new Date()) =>
  new Date(now.getTime() - awaitingPublicationAutoVestingLongevityDays * millisecondsPerDay)

export const autoVestEligibleAwaitingMembers = async (now = new Date()): Promise<AutoVestAwaitingMembersResult> => {
  const cutoffAt = getAwaitingPublicationAutoVestingCutoff(now)

  const eligibleMembers = await db.member.findMany({
    orderBy: {
      createdAt: 'asc'
    },
    select: {
      firstName: true,
      id: true,
      lastAndMiddleNames: true,
      memberMatriculationNumber: true,
      sponsorCode: true
    },
    where: {
      createdAt: {
        lte: cutoffAt
      },
      memberStatus: memberStatus.Awaiting
    }
  })

  const promotedMembers: AutoVestedMember[] = []

  if (eligibleMembers.length > 0) {
    await db.$transaction(async tx => {
      for (const member of eligibleMembers) {
        const updatedMember = await tx.member.updateMany({
          data: {
            memberStatus: memberStatus.Vested
          },
          where: {
            createdAt: {
              lte: cutoffAt
            },
            id: member.id,
            memberStatus: memberStatus.Awaiting
          }
        })

        if (updatedMember.count === 0) {
          continue
        }

        await tx.sponsorContributionCredit.upsert({
          create: {
            amountCredited: contributionCreditPerVestedMember,
            memberMatriculationNumber: member.memberMatriculationNumber,
            sponsorCode: member.sponsorCode
          },
          update: {
            amountCredited: contributionCreditPerVestedMember,
            sponsorCode: member.sponsorCode
          },
          where: {
            memberMatriculationNumber: member.memberMatriculationNumber
          }
        })

        promotedMembers.push(member)
      }
    })
  }

  return {
    cutoffAt: cutoffAt.toISOString(),
    eligibleCount: eligibleMembers.length,
    promotedCount: promotedMembers.length,
    promotedMembers
  }
}
