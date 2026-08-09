import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import './MusicStory.css'

const API_URL = import.meta.env.VITE_API_URL

function MusicStory({ email }) {
  const [showSheet, setShowSheet] = useState(false)
  const [step, setStep] = useState(1) // 1=main, 2=pick song, 3=select clip, 4=set background
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [selectedSong, setSelectedSong] = useState(null)
  const [songName, setSongName] = useState('')
  const [songDuration, setSongDuration] = useState(0)
  const [clipStart, setClipStart] = useState(0)
  const [clipEnd, setClipEnd] = useState(30)
  const [bgColor, setBgColor] = useState(0)
  const [noteText, setNoteText] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [posting, setPosting] = useState(false)

  const audioRef = useRef(null)
  const photoRef = useRef(null)
  const songRef = useRef(null)

  const backgrounds = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    'linear-gradient(135deg, #0c0c0c, #1a1a2e)',
    'linear-gradient(135deg, #2d1b69, #11001c)',
  ]

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })

  // Handle profile photo selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setProfilePhoto(reader.result)
    reader.readAsDataURL(file)
  }

  // Handle song selection from device
  const handleSongSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 15 * 1024 * 1024) { alert('Song must be under 15MB'); return }

    const reader = new FileReader()
    reader.onload = () => {
      setSelectedSong(reader.result)
      setSongName(file.name.replace(/\.[^/.]+$/, ''))
      setStep(3) // go to clip selector
    }
    reader.readAsDataURL(file)
  }

  // Audio loaded - get duration
  const handleAudioLoaded = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration
      setSongDuration(dur)
      setClipEnd(Math.min(30, dur))
    }
  }

  // Play clip preview
  const playClip = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = clipStart
    audioRef.current.play()
    setIsPlaying(true)
  }

  const pauseClip = () => {
    if (!audioRef.current) return
    audioRef.current.pause()
    setIsPlaying(false)
  }

  // Monitor playback to stop at clipEnd
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const handleTime = () => {
      setCurrentTime(audio.currentTime)
      if (audio.currentTime >= clipEnd) {
        audio.pause()
        setIsPlaying(false)
      }
    }
    audio.addEventListener('timeupdate', handleTime)
    return () => audio.removeEventListener('timeupdate', handleTime)
  }, [clipEnd])

  // Handle clip start change
  const handleClipStartChange = (val) => {
    const start = parseFloat(val)
    setClipStart(start)
    if (start + 30 <= songDuration) {
      setClipEnd(start + 30)
    } else {
      setClipEnd(songDuration)
    }
  }

  // Post the music story
  const postMusicStory = async () => {
    setPosting(true)
    try {
      await axios.post(`${API_URL}/api/posts`, {
        caption: noteText || `🎵 ${songName}`,
        audio: selectedSong,
        audioName: songName,
        image: profilePhoto
      }, getAuthHeader())
      
      // Reset everything
      setShowSheet(false)
      setStep(1)
      setSelectedSong(null)
      setSongName('')
      setNoteText('')
      setProfilePhoto(null)
      setClipStart(0)
    } catch (err) {
      console.error(err)
    } finally {
      setPosting(false)
    }
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="music-story">
      {/* Circle Avatar with Music Icon */}
      <div className="ms-trigger" onClick={() => setShowSheet(true)}>
        <div className="ms-avatar-ring">
          <div className="ms-avatar">
            {profilePhoto ? (
              <img src={profilePhoto} alt="You" />
            ) : (
              <span>{email[0].toUpperCase()}</span>
            )}
          </div>
        </div>
        <div className="ms-music-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
        <span className="ms-label">Music</span>
      </div>

      {/* Bottom Sheet */}
      {showSheet && (
        <div className="ms-overlay" onClick={() => setShowSheet(false)}>
          <div className="ms-sheet" onClick={(e) => e.stopPropagation()}>
            {/* Sheet Header */}
            <div className="ms-sheet-header">
              <div className="ms-sheet-handle"></div>
              {step > 1 && step < 4 && <button className="ms-back" onClick={() => setStep(step - 1)}>←</button>}
              <h3>
                {step === 1 && 'Music Story'}
                {step === 2 && 'Pick a Song'}
                {step === 3 && 'Select 30s Clip'}
                {step === 4 && 'Background & Note'}
              </h3>
              <button className="ms-close" onClick={() => setShowSheet(false)}>×</button>
            </div>

            {/* Step 1: Main - Set photo + choose action */}
            {step === 1 && (
              <div className="ms-step-main">
                <div className="ms-photo-section">
                  <div className="ms-photo-preview" onClick={() => photoRef.current?.click()}>
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" />
                    ) : (
                      <div className="ms-photo-placeholder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span>Add Photo</span>
                      </div>
                    )}
                  </div>
                  <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoSelect} hidden />
                  <p className="ms-photo-hint">Your profile photo on the story</p>
                </div>

                <button className="ms-pick-song-btn" onClick={() => setStep(2)}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>
                  Choose a Song
                </button>
              </div>
            )}

            {/* Step 2: Pick song from device */}
            {step === 2 && (
              <div className="ms-step-pick">
                <div className="ms-pick-area" onClick={() => songRef.current?.click()}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>
                  <p>Tap to select a song</p>
                  <span>From your device • MP3, WAV, M4A</span>
                </div>
                <input ref={songRef} type="file" accept="audio/*" onChange={handleSongSelect} hidden />
              </div>
            )}

            {/* Step 3: Select 30s clip */}
            {step === 3 && (
              <div className="ms-step-clip">
                <div className="ms-song-info">
                  <div className="ms-song-disc spinning">🎵</div>
                  <div className="ms-song-details">
                    <span className="ms-song-name">{songName}</span>
                    <span className="ms-song-duration">{formatTime(songDuration)}</span>
                  </div>
                </div>

                {/* Hidden audio element */}
                <audio ref={audioRef} src={selectedSong} onLoadedMetadata={handleAudioLoaded} />

                {/* Waveform / Clip Selector */}
                <div className="ms-clip-selector">
                  <div className="ms-clip-visual">
                    <div className="ms-clip-bars">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div
                          key={i}
                          className={`ms-bar ${i / 40 >= clipStart / songDuration && i / 40 <= clipEnd / songDuration ? 'active' : ''}`}
                          style={{ height: `${20 + Math.random() * 60}%` }}
                        />
                      ))}
                    </div>
                    <div
                      className="ms-clip-highlight"
                      style={{
                        left: `${(clipStart / songDuration) * 100}%`,
                        width: `${((clipEnd - clipStart) / songDuration) * 100}%`
                      }}
                    />
                  </div>

                  <div className="ms-clip-controls">
                    <span className="ms-clip-time">{formatTime(clipStart)}</span>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, songDuration - 30)}
                      step="1"
                      value={clipStart}
                      onChange={(e) => handleClipStartChange(e.target.value)}
                      className="ms-clip-slider"
                    />
                    <span className="ms-clip-time">{formatTime(clipEnd)}</span>
                  </div>

                  <p className="ms-clip-label">Drag to select your 30-second clip</p>
                </div>

                {/* Play Preview */}
                <button className="ms-play-btn" onClick={isPlaying ? pauseClip : playClip}>
                  {isPlaying ? '⏸ Pause' : '▶ Preview Clip'}
                </button>

                {/* Current playback indicator */}
                {isPlaying && (
                  <div className="ms-playing-indicator">
                    Playing: {formatTime(currentTime)} / {formatTime(clipEnd)}
                  </div>
                )}

                <button className="ms-next-btn" onClick={() => setStep(4)}>
                  Next: Set Background →
                </button>
              </div>
            )}

            {/* Step 4: Background + Note text */}
            {step === 4 && (
              <div className="ms-step-bg">
                <div className="ms-preview-card" style={{ background: backgrounds[bgColor] }}>
                  <div className="ms-preview-photo">
                    {profilePhoto ? <img src={profilePhoto} alt="" /> : <span>{email[0].toUpperCase()}</span>}
                  </div>
                  <p className="ms-preview-note">{noteText || '🎵 ' + songName}</p>
                  <div className="ms-preview-song">
                    <span className="ms-mini-disc">🎵</span>
                    <span>{songName}</span>
                  </div>
                </div>

                {/* Background picker */}
                <div className="ms-bg-picker">
                  {backgrounds.map((bg, i) => (
                    <button
                      key={i}
                      className={`ms-bg-dot ${bgColor === i ? 'selected' : ''}`}
                      style={{ background: bg }}
                      onClick={() => setBgColor(i)}
                    />
                  ))}
                </div>

                {/* Note text */}
                <input
                  type="text"
                  className="ms-note-input"
                  placeholder="Add a note... (optional)"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  maxLength={100}
                />

                {/* Post */}
                <button className="ms-post-btn" onClick={postMusicStory} disabled={posting}>
                  {posting ? 'Sharing...' : 'Share Music Story'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MusicStory
