import day from 'dayjs'

import { memberStatus, type MemberType } from './types'

export const awaitingPublicationVestingLongevityDays = 30

const millisecondsPerDay = 24 * 60 * 60 * 1000

type MemberLongevityFields = Pick<MemberType, 'createdAt' | 'manuallyVestedAt' | 'memberStatus'>

type MemberLongevityDuration = {
  days: number
  months: number
  years: number
}

export const getAwaitingPublicationVestingCutoff = (now = new Date()) =>
  new Date(now.getTime() - awaitingPublicationVestingLongevityDays * millisecondsPerDay)

export const getMemberLongevityStartDate = (member: MemberLongevityFields) =>
  member.memberStatus === memberStatus.Vested && member.manuallyVestedAt ? member.manuallyVestedAt : member.createdAt

export const getMemberLongevityDays = (member: MemberLongevityFields, now = new Date()) =>
  Math.max(0, day(now).diff(day(getMemberLongevityStartDate(member)).startOf('day'), 'days'))

const pluralizeDurationUnit = (value: number, unit: string) => `${value} ${unit}${value === 1 ? '' : 's'}`

export const getMemberLongevityDuration = (
  member: MemberLongevityFields,
  now = new Date()
): MemberLongevityDuration => {
  const startDate = day(getMemberLongevityStartDate(member)).startOf('day')
  const endDate = day(now).startOf('day')

  if (endDate.isBefore(startDate)) {
    return {
      days: 0,
      months: 0,
      years: 0
    }
  }

  const years = endDate.diff(startDate, 'year')
  const afterYears = startDate.add(years, 'year')
  const months = endDate.diff(afterYears, 'month')
  const afterMonths = afterYears.add(months, 'month')
  const days = endDate.diff(afterMonths, 'day')

  return {
    days,
    months,
    years
  }
}

export const formatMemberLongevity = (member: MemberLongevityFields, now = new Date()) => {
  const { days, months, years } = getMemberLongevityDuration(member, now)

  return [
    pluralizeDurationUnit(years, 'year'),
    pluralizeDurationUnit(months, 'month'),
    pluralizeDurationUnit(days, 'day')
  ].join(', ')
}
