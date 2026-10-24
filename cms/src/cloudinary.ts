import type { Adapter, GenerateFileURL } from '@payloadcms/plugin-cloud-storage/types'
import { v2 as cloudinary } from 'cloudinary'

export const cloudinaryEnabled = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET,
)

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

// "sac/photo.jpg" -> "sac/photo": Cloudinary public ids carry no extension
const publicId = (path: string) => path.replace(/\.[^./]+$/, '')

// f_auto/q_auto: Cloudinary picks webp/avif per browser; w_1600,c_limit caps huge uploads
const urlFor = (filename: string, prefix?: string) =>
  `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_1600,c_limit/${publicId(
    prefix ? `${prefix}/${filename}` : filename,
  )}`

export const cloudinaryURL: GenerateFileURL = ({ filename, prefix }) => urlFor(filename, prefix)

export const cloudinaryAdapter: Adapter = () => ({
  name: 'cloudinary',

  handleUpload: async ({ file, storageFilePath }) => {
    await new Promise<void>((resolve, reject) =>
      cloudinary.uploader
        .upload_stream(
          { public_id: publicId(storageFilePath), resource_type: 'image', overwrite: true, invalidate: true },
          (err) => (err ? reject(err) : resolve()),
        )
        .end(file.buffer),
    )
  },

  handleDelete: async ({ storageFilePath }) => {
    await cloudinary.uploader.destroy(publicId(storageFilePath), { resource_type: 'image', invalidate: true })
  },

  generateURL: cloudinaryURL,

  // only hit when something asks Payload (not Cloudinary) for the file; just proxy it
  staticHandler: async (_req, { params }) => {
    const r = await fetch(urlFor(params.filename, params.prefix))
    return new Response(r.body, {
      status: r.status,
      headers: { 'content-type': r.headers.get('content-type') ?? 'image/jpeg' },
    })
  },
})
