import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../generated/prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

const cachedPrisma = globalForPrisma.prisma

const shouldReuseCachedPrisma =
  cachedPrisma &&
  'contributionAssessment' in (cachedPrisma as unknown as Record<string, unknown>) &&
  'sponsorContributionPayment' in (cachedPrisma as unknown as Record<string, unknown>)

const prisma =
  shouldReuseCachedPrisma && cachedPrisma
    ? cachedPrisma
    : new PrismaClient({
        adapter
      })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
