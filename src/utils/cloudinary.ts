import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from 'cloudinary'

type CloudinaryResourceType = 'image' | 'raw' | 'video' | 'auto'

type CloudinaryStoredDocument = {
  deliveryType: string
  format?: string | null
  publicId: string
  resourceType: string
  secureUrl?: string | null
  version?: number | null
}

let isCloudinaryConfigured = false

const getRequiredCloudinaryEnv = (key: 'CLOUDINARY_API_KEY' | 'CLOUDINARY_API_SECRET' | 'CLOUDINARY_CLOUD_NAME') => {
  const value = process.env[key]?.trim()

  if (!value) {
    throw new Error('Cloudinary is not configured. Add the Cloudinary environment variables before uploading files.')
  }

  return value
}

const getCloudinary = () => {
  if (!isCloudinaryConfigured) {
    cloudinary.config({
      api_key: getRequiredCloudinaryEnv('CLOUDINARY_API_KEY'),
      api_secret: getRequiredCloudinaryEnv('CLOUDINARY_API_SECRET'),
      cloud_name: getRequiredCloudinaryEnv('CLOUDINARY_CLOUD_NAME'),
      secure: true
    })

    isCloudinaryConfigured = true
  }

  return cloudinary
}

const uploadBuffer = (buffer: Buffer, options: UploadApiOptions) =>
  new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = getCloudinary().uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        reject(new Error(error?.message ?? 'Cloudinary upload failed.'))

        return
      }

      resolve(result)
    })

    uploadStream.end(buffer)
  })

export const uploadDeathDocumentationToCloudinary = async ({
  buffer,
  deceasedMemberId,
  documentType,
  fileName,
  sponsorCode
}: {
  buffer: Buffer
  deceasedMemberId: string
  documentType: string
  fileName: string
  sponsorCode: string
}) => {
  const result = await uploadBuffer(buffer, {
    access_mode: 'authenticated',
    filename_override: fileName,
    folder: `sagicam/death-documentations/${sponsorCode}/${deceasedMemberId}`,
    invalidate: true,
    overwrite: true,
    public_id: documentType,
    resource_type: 'auto',
    type: 'authenticated',
    unique_filename: false,
    use_filename: false
  })

  return {
    deliveryType: result.type || 'authenticated',
    format: result.format || null,
    publicId: result.public_id,
    resourceType: result.resource_type,
    secureUrl: result.secure_url || null,
    version: result.version || null
  }
}

export const deleteDeathDocumentationFromCloudinary = async (document?: CloudinaryStoredDocument | null) => {
  if (!document?.publicId) return

  await getCloudinary().uploader.destroy(document.publicId, {
    invalidate: true,
    resource_type: document.resourceType as CloudinaryResourceType,
    type: document.deliveryType
  })
}

export const getDeathDocumentationSignedDownloadUrl = (document: CloudinaryStoredDocument) => {
  const expiresAt = Math.floor(Date.now() / 1000) + 5 * 60

  return getCloudinary().utils.private_download_url(document.publicId, document.format ?? '', {
    attachment: true,
    expires_at: expiresAt,
    resource_type: document.resourceType as CloudinaryResourceType,
    type: document.deliveryType
  })
}

export const isSameCloudinaryDocument = (
  first?: CloudinaryStoredDocument | null,
  second?: CloudinaryStoredDocument | null
) =>
  Boolean(
    first?.publicId &&
      second?.publicId &&
      first.publicId === second.publicId &&
      first.resourceType === second.resourceType &&
      first.deliveryType === second.deliveryType
  )
