export const sagicamTimeZone = 'America/New_York'

const timeZonePartsFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
  minute: '2-digit',
  month: '2-digit',
  second: '2-digit',
  timeZone: sagicamTimeZone,
  year: 'numeric'
})

export const getSagicamTimeZoneParts = (date: Date) => {
  const parts = timeZonePartsFormatter.formatToParts(date)

  return {
    day: Number(parts.find(part => part.type === 'day')?.value ?? 1),
    hour: Number(parts.find(part => part.type === 'hour')?.value ?? 0),
    minute: Number(parts.find(part => part.type === 'minute')?.value ?? 0),
    month: Number(parts.find(part => part.type === 'month')?.value ?? 1),
    second: Number(parts.find(part => part.type === 'second')?.value ?? 0),
    year: Number(parts.find(part => part.type === 'year')?.value ?? 1970)
  }
}

const getSagicamTimeZoneOffsetMs = (date: Date) => {
  const parts = getSagicamTimeZoneParts(date)

  const sameWallTimeInUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)

  return sameWallTimeInUtc - date.getTime()
}

export const getSagicamZonedMonthBoundary = (year: number, monthIndex: number) => {
  const utcGuess = new Date(Date.UTC(year, monthIndex, 1))
  const firstPass = new Date(utcGuess.getTime() - getSagicamTimeZoneOffsetMs(utcGuess))

  return new Date(utcGuess.getTime() - getSagicamTimeZoneOffsetMs(firstPass))
}

export const getSagicamMonthRange = (periodDate = new Date()) => {
  const { month, year } = getSagicamTimeZoneParts(periodDate)
  const monthIndex = month - 1

  return {
    endsAt: getSagicamZonedMonthBoundary(year, monthIndex + 1),
    startsAt: getSagicamZonedMonthBoundary(year, monthIndex)
  }
}
