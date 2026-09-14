import day from 'dayjs'

import { memberStatus, type MemberType } from './types'

export const awaitingPublicationVestingLongevityDays = 30

const millisecondsPerDay = 24 * 60 * 60 * 1000

type MemberLongevityFields = Pick<MemberType, 'createdAt' | 'manuallyVestedAt' | 'memberStatus'>

export const getAwaitingPublicationVestingCutoff = (now = new Date()) =>
  new Date(now.getTime() - awaitingPublicationVestingLongevityDays * millisecondsPerDay)

export const getMemberLongevityStartDate = (member: MemberLongevityFields) =>
  member.memberStatus === memberStatus.Vested && member.manuallyVestedAt ? member.manuallyVestedAt : member.createdAt

export const getMemberLongevityDays = (member: MemberLongevityFields, now = new Date()) =>
  Math.max(0, day(now).diff(day(getMemberLongevityStartDate(member)).startOf('day'), 'days'))
