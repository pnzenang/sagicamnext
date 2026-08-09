import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { resetContributionCalculationAction } from '@/utils/actions'

export const dynamic = 'force-dynamic'

export const POST = async (request: NextRequest) => {
  const formData = await request.formData()
  const result = await resetContributionCalculationAction({ message: '' }, formData)

  if (
    result.message === 'No contribution values found to reset.' ||
    result.message.startsWith('Contribution reset successfully.')
  ) {
    return NextResponse.redirect(new URL('/admin-sagicam-payments', request.url), 303)
  }

  return new Response(result.message, { status: 400 })
}
