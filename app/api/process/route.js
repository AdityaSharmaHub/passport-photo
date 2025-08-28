import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(request) {
  try {
    const { publicId } = await request.json()

    if (!publicId) {
      return Response.json({ error: 'No public ID provided' }, { status: 400 })
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    
    const transformation = 'c_auto,g_face,w_350,h_450,z_0.75/e_background_removal:fineedges_y/b_white/e_auto_brightness:80/e_auto_contrast:80/e_auto_color:80/e_upscale/q_auto:best,f_jpg'
    const processedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`

    return Response.json({
      processedUrl: processedUrl
    })

  } catch (error) {
    return Response.json(
      { error: 'Processing failed' },
      { status: 500 }
    )
  }
}
