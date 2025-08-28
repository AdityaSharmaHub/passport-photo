import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'passport-photos',
          resource_type: 'auto',
          eager: [
            {
              width: 350,
              height: 450,
              crop: "auto",
              gravity: "face",
              zoom: 0.75,
              effect: "background_removal:fineedges_y",
              background: "white",
              effect: "auto_brightness:80",
              effect: "auto_contrast:80",
              effect: "auto_color:80",
              effect: "upscale",
              quality: "auto:best",
              format: "jpg",
            },
          ],
          eager_async: false,
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    return Response.json({
      public_id: result.public_id,
      url: result.secure_url
    })

  } catch (error) {
    console.error('Upload error:', error)
    return Response.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}