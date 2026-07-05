const monthYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric'
})

const getSafeDate = (value?: Date | string | null) => {
  if (!value) return new Date()

  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? new Date() : date
}

export const getContributionTableLabel = (value?: Date | string | null) => {
  const monthYear = monthYearFormatter.format(getSafeDate(value))

  return `${monthYear}'s Contribution Table`
}
