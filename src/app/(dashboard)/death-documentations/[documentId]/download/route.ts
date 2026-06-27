import { auth } from '@clerk/nextjs/server'

import { getDeathDocumentationSignedDownloadUrl } from '@/utils/cloudinary'
import db from '@/utils/db'

export const dynamic = 'force-dynamic'

const getSafeDownloadFileName = (fileName: string) => fileName.replace(/[^\w.\- ()]/g, '_').slice(0, 180) || 'document'

const getStoredCloudinaryDocument = (document: {
  cloudinaryDeliveryType?: string | null
  cloudinaryFormat?: string | null
  cloudinaryPublicId?: string | null
  cloudinaryResourceType?: string | null
  cloudinaryVersion?: number | null
  secureUrl?: string | null
}) => {
  if (!document.cloudinaryPublicId || !document.cloudinaryResourceType || !document.cloudinaryDeliveryType) return null

  return {
    deliveryType: document.cloudinaryDeliveryType,
    format: document.cloudinaryFormat,
    publicId: document.cloudinaryPublicId,
    resourceType: document.cloudinaryResourceType,
    secureUrl: document.secureUrl,
    version: document.cloudinaryVersion
  }
}

export const GET = async (_request: Request, { params }: { params: Promise<{ documentId: string }> }) => {
  const { userId } = await auth()

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { documentId } = await params

  const document = await db.deceasedMemberDocument.findUnique({
    select: {
      clerkId: true,
      cloudinaryDeliveryType: true,
      cloudinaryFormat: true,
      cloudinaryPublicId: true,
      cloudinaryResourceType: true,
      cloudinaryVersion: true,
      fileData: true,
      fileName: true,
      fileSize: true,
      mimeType: true,
      secureUrl: true
    },
    where: {
      id: documentId
    }
  })

  if (!document) {
    return new Response('Document not found', { status: 404 })
  }

  if (userId !== process.env.ADMIN_USER_ID && document.clerkId !== userId) {
    return new Response('Forbidden', { status: 403 })
  }

  const fileName = getSafeDownloadFileName(document.fileName)
  const cloudinaryDocument = getStoredCloudinaryDocument(document)

  if (cloudinaryDocument) {
    const signedUrl = getDeathDocumentationSignedDownloadUrl(cloudinaryDocument)
    const cloudinaryResponse = await fetch(signedUrl, { cache: 'no-store' })

    if (!cloudinaryResponse.ok || !cloudinaryResponse.body) {
      return new Response('Unable to download document from Cloudinary', { status: 502 })
    }

    return new Response(cloudinaryResponse.body, {
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(document.fileSize),
        'Content-Type': document.mimeType || cloudinaryResponse.headers.get('content-type') || 'application/octet-stream'
      }
    })
  }

  if (!document.fileData) {
    return new Response('Document file is missing', { status: 404 })
  }

  return new Response(document.fileData, {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': String(document.fileSize),
      'Content-Type': document.mimeType || 'application/octet-stream'
    }
  })
}
