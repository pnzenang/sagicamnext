import day from 'dayjs'

import { memberStatus, type MemberType } from './types'

export const awaitingPublicationVestingLongevityDays = 30
export const memberLongevityStartDate = new Date(2026, 9, 1)

const millisecondsPerDay = 24 * 60 * 60 * 1000

type MemberLongevityFields = Pick<MemberType, 'memberStatus'> & {
  createdAt: Date | string
}

type MemberLongevityDuration = {
  days: number
  months: number
  years: number
}

export const getAwaitingPublicationVestingCutoff = (now = new Date()) => {
  const cutoffAt = new Date(now.getTime() - awaitingPublicationVestingLongevityDays * millisecondsPerDay)

  return cutoffAt < memberLongevityStartDate ? new Date(0) : cutoffAt
}

// Longevity does not count before October 1, 2026. The vested timestamp is tracked separately.
export const getMemberLongevityStartDate = (member: MemberLongevityFields) => {
  const createdAt = member.createdAt instanceof Date ? member.createdAt : new Date(member.createdAt)

  return createdAt < memberLongevityStartDate ? memberLongevityStartDate : createdAt
}

export const getMemberLongevityDays = (member: MemberLongevityFields, now = new Date()) =>
  Math.max(0, day(now).diff(day(getMemberLongevityStartDate(member)).startOf('day'), 'days'))

const pluralizeDurationUnit = (value: number, unit: string) => `${value} ${unit}${value > 1 ? 's' : ''}`

const subtractOneMonthFromDuration = ({ days, months, years }: MemberLongevityDuration): MemberLongevityDuration => {
  if (months > 0) {
    return {
      days,
      months: months - 1,
      years
    }
  }

  if (years > 0) {
    return {
      days,
      months: 11,
      years: years - 1
    }
  }

  return {
    days,
    months,
    years
  }
}

const shouldShowLongevityInDaysOnly = (member: MemberLongevityFields) =>
  member.memberStatus === memberStatus.Pending || member.memberStatus === memberStatus.Awaiting

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
  if (shouldShowLongevityInDaysOnly(member)) {
    return pluralizeDurationUnit(getMemberLongevityDays(member, now), 'day')
  }

  const { days, months, years } = subtractOneMonthFromDuration(getMemberLongevityDuration(member, now))

  const formattedDurationParts = [
    { unit: 'year', value: years },
    { unit: 'month', value: months },
    { unit: 'day', value: days }
  ]
    .filter(({ value }) => value > 0)
    .map(({ unit, value }) => pluralizeDurationUnit(value, unit))

  return formattedDurationParts.length > 0 ? formattedDurationParts.join(', ') : pluralizeDurationUnit(0, 'day')
}
