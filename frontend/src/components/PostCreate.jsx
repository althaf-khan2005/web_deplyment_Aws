import { useState, useRef } from 'react'
import axios from 'axios'
import './PostCreate.css'

const API_URL = import.meta.env.VITE_API_URL

function PostCreate({ onPostCreated }) {
  const [caption, setCaption] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [audioBase64, setAudioBase64] = useState(null)
  const [audioName, setAudioName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const imageRef = useRef(null)
  const audioRef = useRef(null)

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result)
      setImageBase64(reader.result)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const handleAudioSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError('Audio must be less than 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setAudioBase64(reader.result)
      setAudioName(file.name)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageBase64(null)
    if (imageRef.current) imageRef.current.value = ''
  }

  const removeAudio = () => {
    setAudioBase64(null)
    setAudioName('')
    if (audioRef.current) audioRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!caption.trim() && !imageBase64 && !audioBase64) {
      setError('Add a caption, photo, or song')
      return
    }

    setLoading(true)
    setError('')

    try {
      await axios.post(`${API_URL}/api/posts`, {
        caption: caption.trim() || null,
        image: imageBase64,
        audio: audioBase64
      }, getAuthHeader())

      // Reset form
      setCaption('')
      setImagePreview(null)
      setImageBase64(null)
      setAudioBase64(null)
      setAudioName('')
      if (onPostCreated) onPostCreated()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="post-create">
      <div className="create-header">
        <h2>Create Post</h2>
        <p>Share a photo or song with your followers</p>
      </div>

      <form onSubmit={handleSubmit} className="create-form">
        {/* Image Preview */}
        {imagePreview && (
          <div className="preview-container">
            <img src={imagePreview} alt="Preview" className="image-preview" />
            <button type="button" className="remove-btn" onClick={removeImage}>×</button>
          </div>
        )}

        {/* Audio Preview */}
        {audioBase64 && (
          <div className="audio-preview">
            <div className="audio-info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
              <span>{audioName}</span>
            </div>
            <audio controls src={audioBase64} className="audio-player" />
            <button type="button" className="remove-audio-btn" onClick={removeAudio}>Remove</button>
          </div>
        )}

        {/* Caption */}
        <div className="caption-input">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption... 🎵"
            maxLength={500}
            rows={3}
          />
          <span className="caption-count">{caption.length}/500</span>
        </div>

        {/* Upload Buttons */}
        <div className="upload-buttons">
          <button type="button" className="upload-btn photo-btn" onClick={() => imageRef.current?.click()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Photo</span>
          </button>
          <button type="button" className="upload-btn music-btn" onClick={() => audioRef.current?.click()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
            <span>Song</span>
          </button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          hidden
        />
        <input
          ref={audioRef}
          type="file"
          accept="audio/*"
          onChange={handleAudioSelect}
          hidden
        />

        {error && <div className="create-error">{error}</div>}

        {/* Submit */}
        <button type="submit" className="share-btn" disabled={loading || (!caption.trim() && !imageBase64 && !audioBase64)}>
          {loading ? (
            <span className="share-loader"></span>
          ) : (
            <>
              <span>Share</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default PostCreate
