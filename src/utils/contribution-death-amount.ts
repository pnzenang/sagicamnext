const millisecondsPerDay = 24 * 60 * 60 * 1000

type ContributionDeathDates = {
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

const parseDateOnly = (value: string) => {
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

  return Number.isNaN(date.getTime()) ? null : new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
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

export const getContributionDeathAmount = (dates: ContributionDeathDates) => {
  const longevityDays = getContributionDeathLongevityDays(dates)

  if (longevityDays < 180) return 1000
  if (longevityDays <= 364) return 2000

  return 6000
}
