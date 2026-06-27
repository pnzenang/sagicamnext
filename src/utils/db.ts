import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../generated/prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

const cachedPrisma = globalForPrisma.prisma

const cachedModels = (
  cachedPrisma as unknown as { _runtimeDataModel?: { models?: Record<string, { fields?: { name: string }[] }> } }
)?._runtimeDataModel?.models

const hasCachedModelField = (modelName: string, fieldName: string) =>
  Boolean(cachedModels?.[modelName]?.fields?.some(field => field.name === fieldName))

const shouldReuseCachedPrisma =
  cachedPrisma &&
  'contributionAssessment' in (cachedPrisma as unknown as Record<string, unknown>) &&
  hasCachedModelField('RemovedMember', 'memberStatus') &&
  hasCachedModelField('DeceasedMember', 'memberStatus') &&
  hasCachedModelField('PaymentAlertReset', 'sponsorCode') &&
  hasCachedModelField('SponsorContributionPayment', 'lastSubmittedAt') &&
  hasCachedModelField('SponsorRegistrationPayment', 'lastSubmittedAt') &&
  'paymentAlertReset' in (cachedPrisma as unknown as Record<string, unknown>) &&
  'sponsorBalanceAdjustment' in (cachedPrisma as unknown as Record<string, unknown>) &&
  'sponsorContributionCredit' in (cachedPrisma as unknown as Record<string, unknown>) &&
  'sponsorContributionPayment' in (cachedPrisma as unknown as Record<string, unknown>) &&
  'sponsorContributionUsage' in (cachedPrisma as unknown as Record<string, unknown>) &&
  'sponsorPaymentLedgerEntry' in (cachedPrisma as unknown as Record<string, unknown>) &&
  'sponsorRegistrationPayment' in (cachedPrisma as unknown as Record<string, unknown>) &&
  'sponsorRegistrationUsage' in (cachedPrisma as unknown as Record<string, unknown>)

const prisma =
  shouldReuseCachedPrisma && cachedPrisma
    ? cachedPrisma
    : new PrismaClient({
        adapter
      })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
