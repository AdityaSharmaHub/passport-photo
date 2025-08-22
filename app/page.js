'use client'

import { useState } from 'react'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [originalImageUrl, setOriginalImageUrl] = useState('')
  const [processedImageUrl, setProcessedImageUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

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
    } finally {
      setIsProcessing(false)
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Passport Photo Maker
        </h1>

        {/* File Upload Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Upload Your Photo</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 cursor-pointer hover:bg-neutral-100 border-2 border-white hover:border-neutral-200 rounded p-4 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">2. Create Passport Photo</h2>
          <div className="flex gap-4">
            <button
              onClick={handleCreatePassportPhoto}
              disabled={!selectedFile || isProcessing}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer font-medium"
            >
              {isUploading ? 'Uploading...' : isProcessing ? 'Processing...' : 'Create Passport Photo'}
            </button>

            {processedImageUrl && (
              <button
                onClick={handleDownload}
                className="bg-green-600 text-white px-6 py-3 rounded-md cursor-pointer hover:bg-green-700 font-medium"
              >
                Download Photo
              </button>
            )}
          </div>
        </div>

        {/* Image Preview Section */}
        <div className="grid grid-cols-2 gap-6">
          {/* Original Image */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Original Image</h3>
            {originalImageUrl ? (
              <img
                src={originalImageUrl}
                alt="Original"
                className="w-full h-auto max-h-96 object-contain border rounded-md"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 flex items-center justify-center border rounded-md">
                <p className="text-gray-500">No image selected</p>
              </div>
            )}
          </div>

          {/* Processed Image */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Passport Photo</h3>
            {processedImageUrl ? (
              <img
                src={processedImageUrl}
                alt="Processed passport photo"
                className="w-full h-auto max-h-96 object-contain border rounded-md"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 flex items-center justify-center border rounded-md">
                <p className="text-gray-500">
                  {isProcessing ? 'Processing...' : 'Processed image will appear here'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-6 rounded-lg mt-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-800">How it works:</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• Upload any photo with a person's face</li>
            <li>• Click "Create Passport Photo" to automatically process</li>
            <li>• The app will remove background, crop to passport size, and enhance the image</li>
            <li>• Download the final passport-ready photo</li>
          </ul>
        </div>
      </div>
    </div>
  )
}