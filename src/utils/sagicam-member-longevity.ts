export const awaitingPublicationVestingLongevityDays = 30

const millisecondsPerDay = 24 * 60 * 60 * 1000

export const getAwaitingPublicationVestingCutoff = (now = new Date()) =>
  new Date(now.getTime() - awaitingPublicationVestingLongevityDays * millisecondsPerDay)
