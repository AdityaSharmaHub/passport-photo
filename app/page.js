'use client'

import { Camera, DownloadIcon, InfoIcon, RotateCcwIcon, WandSparklesIcon } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [originalImageUrl, setOriginalImageUrl] = useState('')
  const [processedImageUrl, setProcessedImageUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [src, setSrc] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      // Create preview URL for original image
      const url = URL.createObjectURL(file)
      setOriginalImageUrl(url)
      setProcessedImageUrl('') // Clear previous processed image
    }
  }

  const handleCreatePassportPhoto = async () => {
    if (!selectedFile) {
      alert('Please select an image first!')
      return
    }

    setIsUploading(true)
    setIsProcessing(true)

    try {
      // Upload image to Cloudinary
      const formData = new FormData()
      formData.append('file', selectedFile)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      const uploadResult = await uploadResponse.json()
      setIsUploading(false)
      setIsProcessing(true)

      // Process the uploaded image
      const processResponse = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId: uploadResult.public_id })
      })

      if (!processResponse.ok) {
        throw new Error('Processing failed')
      }

      const processResult = await processResponse.json()
      setProcessedImageUrl(processResult.processedUrl)

    } catch (error) {
      console.error('Error:', error)
      alert('Error creating passport photo. Please try again.')
    }
  }

  async function waitForImage(url) {
    let ready = false;
    while (!ready) {
      try {
        const res = await fetch(url, { method: "HEAD" });
        if (res.ok) {
          ready = true;
          setIsProcessing(false);
        } else {
          await new Promise((r) => setTimeout(r, 2000)); // retry in 2s
        }
      } catch {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    return url;
  }


  const handleReset = () => {
    setSelectedFile(null)
    setOriginalImageUrl('')
    setProcessedImageUrl('')
    setIsProcessing(false)
    setIsUploading(false)
    setSrc('')
    // Clear the file input
    document.querySelector('input[type="file"]').value = ''
  }

  const handleDownload = async () => {
    if (!processedImageUrl) return

    try {
      const response = await fetch(processedImageUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/jpeg,image/png,image/*'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()

      if (blob.size === 0) {
        throw new Error('Downloaded file is empty')
      }

      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `passport-photo-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      alert(`Error downloading image: ${error.message}`)
    }
  }


  useEffect(() => {
    if (processedImageUrl) {
      waitForImage(processedImageUrl).then(setSrc);
    }
  }, [processedImageUrl]);

  return (
    <div className="min-h-screen bg-linear-to-r from-blue-400 to-indigo-400 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Camera className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-indigo-950">
            Passport Photo Maker
          </h1>
        </div>

        {/* File Upload Section */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Upload Your Photo</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-indigo-500 cursor-pointer bg-indigo-50 hover:bg-indigo-100 border border-indigo-400 rounded-lg p-4 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: <span>{selectedFile.name}</span>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">2. Create Passport Photo</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleCreatePassportPhoto}
              disabled={!selectedFile || isProcessing}
              className="bg-indigo-500 text-white px-6 py-3 rounded-md hover:bg-indigo-600 disabled:bg-indigo-400 disabled:cursor-not-allowed cursor-pointer font-medium"
            >
              {isUploading ?
                <span className='flex items-center'>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-50" cx="12" cy="12" r="10" stroke="#ffffff" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="#615fff" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
                : isProcessing ?
                  <span className='flex items-center'>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-50" cx="12" cy="12" r="10" stroke="#ffffff" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="#615fff" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span> : <span className='flex items-center gap-2'><WandSparklesIcon className='w-5 h-5' /> Create Passport Photo</span>}
            </button>

            {src && (
              <button
                onClick={handleDownload}
                className="bg-green-600 text-white px-6 py-3 rounded-md cursor-pointer hover:bg-green-700 font-medium flex items-center gap-2"
              >
                <DownloadIcon className='w-5 h-5' />
                Download Photo
              </button>
            )}

            {src && (
              <button
                onClick={handleReset}
                className="bg-white text-indigo-500 border border-indigo-600 px-6 py-3 rounded-md hover:bg-indigo-100 cursor-pointer font-medium flex items-center gap-2"
              >
                <RotateCcwIcon className='w-5 h-5' />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Image Preview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original Image */}
          <div className="bg-white py-6 px-7 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Original Image</h3>
            {originalImageUrl ? (
              <img
                src={originalImageUrl}
                alt="Original"
                className="w-full max-h-96 aspect-[3/4] object-contain border border-neutral-500 bg-white rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-indigo-100 flex items-center justify-center border  border-indigo-400 rounded-md">
                <p className="text-indigo-500 font-medium">No image selected</p>
              </div>
            )}
          </div>

          {/* Processed Image */}
          <div className="bg-white py-6 px-7 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Passport Photo</h3>
            {src ? (
              <img
                src={src}
                alt="Processed passport photo"
                className="w-full h-auto max-h-96 aspect-[3/4] object-contain border border-neutral-500 bg-white rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-indigo-100 flex items-center justify-center border border-indigo-400 rounded-md">
                <p className="text-indigo-500 font-medium">
                  {isProcessing ?
                    <span className='flex items-center'>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#615fff" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="#615fff" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span> : "Processed image will appear here"}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className='p-4 bg-white/30 rounded-lg mt-8 shadow'>
          <p className='text-base flex items-center gap-2'>
            <InfoIcon className='w-4 h-4' />
            Remove Background + Add White Background + Face Crop + Enhance Image</p>
        </div>

        <footer className='text-center mt-10 text-gray-800 font-medium'>Made with ❤️ by Aditya Sharma</footer>
      </div>
    </div>
  )
}