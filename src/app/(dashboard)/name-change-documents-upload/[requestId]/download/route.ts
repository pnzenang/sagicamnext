import { auth } from '@clerk/nextjs/server'

import { getDeathDocumentationSignedDownloadUrl } from '@/utils/cloudinary'
import db from '@/utils/db'

export const dynamic = 'force-dynamic'

const getSafeDownloadFileName = (fileName: string) => fileName.replace(/[^\w.\- ()]/g, '_').slice(0, 180) || 'document'

const getStoredCloudinaryDocument = (request: {
  cloudinaryDeliveryType?: string | null
  cloudinaryFormat?: string | null
  cloudinaryPublicId?: string | null
  cloudinaryResourceType?: string | null
  cloudinaryVersion?: number | null
  secureUrl?: string | null
}) => {
  if (!request.cloudinaryPublicId || !request.cloudinaryResourceType || !request.cloudinaryDeliveryType) return null

  return {
    deliveryType: request.cloudinaryDeliveryType,
    format: request.cloudinaryFormat,
    publicId: request.cloudinaryPublicId,
    resourceType: request.cloudinaryResourceType,
    secureUrl: request.secureUrl,
    version: request.cloudinaryVersion
  }
}

export const GET = async (_request: Request, { params }: { params: Promise<{ requestId: string }> }) => {
  const { userId } = await auth()

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { requestId } = await params

  const request = await db.nameChangeRequest.findUnique({
    select: {
      clerkId: true,
      cloudinaryDeliveryType: true,
      cloudinaryFormat: true,
      cloudinaryPublicId: true,
      cloudinaryResourceType: true,
      cloudinaryVersion: true,
      fileName: true,
      fileSize: true,
      mimeType: true,
      secureUrl: true
    },
    where: {
      id: requestId
    }
  })

  if (!request) {
    return new Response('Document not found', { status: 404 })
  }

  if (userId !== process.env.ADMIN_USER_ID && request.clerkId !== userId) {
    return new Response('Forbidden', { status: 403 })
  }

  const cloudinaryDocument = getStoredCloudinaryDocument(request)

  if (!cloudinaryDocument || !request.fileName || !request.fileSize) {
    return new Response('Document file is missing', { status: 404 })
  }

  const signedUrl = getDeathDocumentationSignedDownloadUrl(cloudinaryDocument)
  const cloudinaryResponse = await fetch(signedUrl, { cache: 'no-store' })

  if (!cloudinaryResponse.ok || !cloudinaryResponse.body) {
    return new Response('Unable to download document from Cloudinary', { status: 502 })
  }

  return new Response(cloudinaryResponse.body, {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Disposition': `attachment; filename="${getSafeDownloadFileName(request.fileName)}"`,
      'Content-Length': String(request.fileSize),
      'Content-Type': request.mimeType || cloudinaryResponse.headers.get('content-type') || 'application/octet-stream'
    }
  })
}
