import { getSagicamTimeZoneParts } from './sagicam-time-zone'

const millisecondsPerDay = 24 * 60 * 60 * 1000
const lateAnnouncementReductionAmount = 1000
const lateAnnouncementDaysLimit = 15

type ContributionDeathDates = {
  announcedAt?: Date | string | null
  dateOfDeath: string
  registrationDate: string
}

const createUtcDate = (year: number, month: number, day: number) => {
  const date = new Date(Date.UTC(year, month - 1, day))

  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null
  }

  return date
}

const parseDateOnly = (value: Date | string) => {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null

    const { day, month, year } = getSagicamTimeZoneParts(value)

    return createUtcDate(year, month, day)
  }

  const trimmedValue = value.trim()
  const slashDateMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmedValue)

  if (slashDateMatch) {
    const [, month, day, year] = slashDateMatch

    return createUtcDate(Number(year), Number(month), Number(day))
  }

  const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmedValue)

  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch

    return createUtcDate(Number(year), Number(month), Number(day))
  }

  const date = new Date(trimmedValue)

  if (Number.isNaN(date.getTime())) return null

  const { day, month, year } = getSagicamTimeZoneParts(date)

  return createUtcDate(year, month, day)
}

export const getContributionDeathLongevityDays = ({ dateOfDeath, registrationDate }: ContributionDeathDates) => {
  const registrationDateValue = parseDateOnly(registrationDate)
  const dateOfDeathValue = parseDateOnly(dateOfDeath)

  if (!registrationDateValue || !dateOfDeathValue) {
    throw new Error('Unable to calculate the contribution amount because registration date or date of death is invalid.')
  }

  const longevityDays = Math.floor((dateOfDeathValue.getTime() - registrationDateValue.getTime()) / millisecondsPerDay)

  if (longevityDays < 0) {
    throw new Error('Unable to calculate the contribution amount because date of death is before registration date.')
  }

  return longevityDays
}

const getContributionDeathAnnouncementDelayDays = ({
  announcedAt,
  dateOfDeath
}: Pick<ContributionDeathDates, 'announcedAt' | 'dateOfDeath'>) => {
  if (!announcedAt) return 0

  const announcementDateValue = parseDateOnly(announcedAt)
  const dateOfDeathValue = parseDateOnly(dateOfDeath)

  if (!announcementDateValue || !dateOfDeathValue) {
    throw new Error('Unable to calculate the contribution amount because announced date or date of death is invalid.')
  }

  const announcementDelayDays = Math.floor(
    (announcementDateValue.getTime() - dateOfDeathValue.getTime()) / millisecondsPerDay
  )

  if (announcementDelayDays < 0) {
    throw new Error('Unable to calculate the contribution amount because announced date is before date of death.')
  }

  return announcementDelayDays
}

export const getContributionDeathAmount = (dates: ContributionDeathDates) => {
  const longevityDays = getContributionDeathLongevityDays(dates)
  const calculatedAmount = longevityDays < 180 ? 1000 : longevityDays <= 364 ? 2000 : 6000
  const announcementDelayDays = getContributionDeathAnnouncementDelayDays(dates)

  if (announcementDelayDays > lateAnnouncementDaysLimit) return lateAnnouncementReductionAmount

  return calculatedAmount
}
