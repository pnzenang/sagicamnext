import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../generated/prisma/client'

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient
}

const getCachedModels = (client: PrismaClient) =>
  (client as unknown as { _runtimeDataModel?: { models?: Record<string, { fields?: { name: string }[] }> } })
    ?._runtimeDataModel?.models

const hasCachedModelField = (client: PrismaClient, modelName: string, fieldName: string) =>
  Boolean(getCachedModels(client)?.[modelName]?.fields?.some(field => field.name === fieldName))

const getCachedInlineSchema = (client: PrismaClient) =>
  (client as unknown as { _engineConfig?: { inlineSchema?: string } })._engineConfig?.inlineSchema ?? ''

const hasCachedSchemaPattern = (client: PrismaClient, pattern: RegExp) => pattern.test(getCachedInlineSchema(client))

const shouldReuseCachedPrisma = (cachedPrisma?: PrismaClient) =>
  Boolean(
    cachedPrisma &&
    'contributionAssessmentDeath' in (cachedPrisma as unknown as Record<string, unknown>) &&
    'contributionAssessment' in (cachedPrisma as unknown as Record<string, unknown>) &&
    'contributionCalculationAdminFee' in (cachedPrisma as unknown as Record<string, unknown>) &&
    'contributionCalculationDeath' in (cachedPrisma as unknown as Record<string, unknown>) &&
    'deceasedMemberDocument' in (cachedPrisma as unknown as Record<string, unknown>) &&
    'memberTransferRequest' in (cachedPrisma as unknown as Record<string, unknown>) &&
    'nameChangeRequest' in (cachedPrisma as unknown as Record<string, unknown>) &&
    hasCachedModelField(cachedPrisma, 'DeceasedMemberDocument', 'cloudinaryPublicId') &&
    hasCachedModelField(cachedPrisma, 'MemberTransferRequest', 'receivingSponsorCode') &&
    hasCachedModelField(cachedPrisma, 'NameChangeRequest', 'cloudinaryPublicId') &&
    hasCachedModelField(cachedPrisma, 'ContributionAssessment', 'deathCount') &&
    hasCachedModelField(cachedPrisma, 'ContributionAssessment', 'dueDate') &&
    hasCachedModelField(cachedPrisma, 'Member', 'manuallyVestedAt') &&
    hasCachedModelField(cachedPrisma, 'RemovedMember', 'memberStatus') &&
    hasCachedModelField(cachedPrisma, 'DeceasedMember', 'memberStatus') &&
    hasCachedModelField(cachedPrisma, 'PaymentAlertReset', 'sponsorCode') &&
    hasCachedModelField(cachedPrisma, 'SponsorContributionPayment', 'lastSubmittedAt') &&
    hasCachedSchemaPattern(
      cachedPrisma,
      /model\s+SponsorContributionUsage\s+{[\s\S]*?sponsorCode\s+String\s+@unique[\s\S]*?}/
    ) &&
    hasCachedModelField(cachedPrisma, 'SponsorRegistrationPayment', 'lastSubmittedAt') &&
    'paymentAlertReset' in (cachedPrisma as unknown as Record<string, unknown>) &&
    'sponsorBalanceAdjustment' in (cachedPrisma as unknown as Record<string, unknown>) &&
    'sponsorContributionCredit' in (cachedPrisma as unknown as Record<string, unknown>) &&
    'sponsorContributionPayment' in (cachedPrisma as unknown as Record<string, unknown>) &&
    'sponsorContributionUsage' in (cachedPrisma as unknown as Record<string, unknown>) &&
    'sponsorPaymentLedgerEntry' in (cachedPrisma as unknown as Record<string, unknown>) &&
    'sponsorRegistrationPayment' in (cachedPrisma as unknown as Record<string, unknown>) &&
    'sponsorRegistrationUsage' in (cachedPrisma as unknown as Record<string, unknown>)
  )

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured.')
  }

  const adapter = new PrismaPg({
    connectionString
  })

  return new PrismaClient({
    adapter
  })
}

const getPrismaClient = () => {
  if (shouldReuseCachedPrisma(globalForPrisma.prisma)) {
    return globalForPrisma.prisma!
  }

  const prisma = createPrismaClient()

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

  return prisma
}

const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient()
    const value = Reflect.get(client, property, client)

    return typeof value === 'function' ? value.bind(client) : value
  },
  has(_target, property) {
    return property in getPrismaClient()
  },
  set(_target, property, value) {
    return Reflect.set(getPrismaClient(), property, value)
  }
})

export default prisma
