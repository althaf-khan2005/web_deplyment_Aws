import { useState, useRef } from 'react'
import axios from 'axios'
import './PostCreate.css'

const API_URL = import.meta.env.VITE_API_URL

function PostCreate({ onPostCreated }) {
  const [step, setStep] = useState(1) // 1=select, 2=preview/caption, 3=sharing
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
    if (file.size > 5 * 1024 * 1024) { setError('Image must be less than 5MB'); return }
    const reader = new FileReader()
    reader.onload = () => { setImagePreview(reader.result); setImageBase64(reader.result); setError(''); setStep(2) }
    reader.readAsDataURL(file)
  }

  const handleAudioSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('Audio must be less than 10MB'); return }
    const reader = new FileReader()
    reader.onload = () => { setAudioBase64(reader.result); setAudioName(file.name); setError(''); setStep(2) }
    reader.readAsDataURL(file)
  }

  const handleShare = async () => {
    if (!caption.trim() && !imageBase64 && !audioBase64) { setError('Add something to share'); return }
    setLoading(true); setError('')
    try {
      await axios.post(`${API_URL}/api/posts`, { caption: caption.trim() || null, image: imageBase64, audio: audioBase64 }, getAuthHeader())
      setCaption(''); setImagePreview(null); setImageBase64(null); setAudioBase64(null); setAudioName(''); setStep(1)
      if (onPostCreated) onPostCreated()
    } catch (err) { setError(err.response?.data?.message || 'Failed to share') }
    finally { setLoading(false) }
  }

  const reset = () => { setStep(1); setCaption(''); setImagePreview(null); setImageBase64(null); setAudioBase64(null); setAudioName(''); setError('') }

  return (
    <div className="ig-create">
      {/* Header */}
      <div className="ig-create-header">
        {step > 1 && <button className="ig-back-btn" onClick={reset}>←</button>}
        <h2>{step === 1 ? 'Create new post' : step === 2 ? 'New post' : 'Sharing...'}</h2>
        {step === 2 && (
          <button className="ig-share-btn" onClick={handleShare} disabled={loading}>
            {loading ? '...' : 'Share'}
          </button>
        )}
      </div>

      {/* Step 1: Select media */}
      {step === 1 && (
        <div className="ig-select-media">
          <div className="ig-media-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <p className="ig-drag-text">Drag photos and videos here</p>
          <div className="ig-select-buttons">
            <button className="ig-select-btn" onClick={() => imageRef.current?.click()}>
              Select Photo
            </button>
            <button className="ig-select-btn ig-select-audio" onClick={() => audioRef.current?.click()}>
              🎵 Select Song
            </button>
          </div>
          <input ref={imageRef} type="file" accept="image/*" onChange={handleImageSelect} hidden />
          <input ref={audioRef} type="file" accept="audio/*" onChange={handleAudioSelect} hidden />
        </div>
      )}

      {/* Step 2: Preview + Caption */}
      {step === 2 && (
        <div className="ig-preview-step">
          <div className="ig-preview-media">
            {imagePreview && <img src={imagePreview} alt="Preview" className="ig-preview-img" />}
            {audioBase64 && !imagePreview && (
              <div className="ig-audio-preview">
                <div className="ig-audio-visualizer">
                  <div className="bar"></div><div className="bar"></div><div className="bar"></div>
                  <div className="bar"></div><div className="bar"></div><div className="bar"></div>
                  <div className="bar"></div><div className="bar"></div>
                </div>
                <p className="ig-audio-name">{audioName}</p>
                <audio controls src={audioBase64} className="ig-audio-player" />
              </div>
            )}
          </div>
          <div className="ig-caption-section">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              maxLength={500}
            />
            <div className="ig-caption-footer">
              <span>{caption.length}/500</span>
            </div>
          </div>
        </div>
      )}

      {error && <div className="ig-create-error">{error}</div>}
    </div>
  )
}

export default PostCreate
