export const registrationPaymentDeadlineDays = 60
export const registrationPaymentDeadlineLabel = 'sixty (60) days'

const millisecondsPerDay = 24 * 60 * 60 * 1000

export const getRegistrationPaymentDeadline = (memberCreatedAt: Date | string) => {
  const createdAt = new Date(memberCreatedAt)

  return new Date(createdAt.getTime() + registrationPaymentDeadlineDays * millisecondsPerDay)
}

const startOfLocalDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const formatDayCount = (days: number) => `${days} day${days === 1 ? '' : 's'}`

export const getOverdueRegistrationPaymentCreatedAtCutoff = (now = new Date()) =>
  new Date(startOfLocalDay(now).getTime() - registrationPaymentDeadlineDays * millisecondsPerDay)

export const getRegistrationPaymentCountdown = (memberCreatedAt: Date | string, now = new Date()) => {
  const deadline = getRegistrationPaymentDeadline(memberCreatedAt)

  const daysRemaining = Math.ceil(
    (startOfLocalDay(deadline).getTime() - startOfLocalDay(now).getTime()) / millisecondsPerDay
  )

  return { deadline, daysRemaining }
}

export const getRegistrationPaymentCountdownLabel = (daysRemaining: number) => {
  if (daysRemaining > 0) return `${formatDayCount(daysRemaining)} remaining`
  if (daysRemaining === 0) return 'Due today'

  return `Overdue by ${formatDayCount(Math.abs(daysRemaining))}`
}
