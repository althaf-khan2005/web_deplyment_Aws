import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import './MusicStory.css'

const API_URL = import.meta.env.VITE_API_URL

function MusicStory({ email, stories, onStoryPosted, onDeleteStory }) {
  const [showSheet, setShowSheet] = useState(false)
  const [showViewer, setShowViewer] = useState(false)
  const [viewingStories, setViewingStories] = useState(null)
  const [viewIndex, setViewIndex] = useState(0)
  const [step, setStep] = useState(1)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [selectedSong, setSelectedSong] = useState(null)
  const [songName, setSongName] = useState('')
  const [songDuration, setSongDuration] = useState(0)
  const [clipStart, setClipStart] = useState(0)
  const [bgColor, setBgColor] = useState(0)
  const [noteText, setNoteText] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [posting, setPosting] = useState(false)
  const [progress, setProgress] = useState(0)

  const audioRef = useRef(null)
  const photoRef = useRef(null)
  const songRef = useRef(null)
  const viewerAudioRef = useRef(null)
  const progressTimer = useRef(null)

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

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setProfilePhoto(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSongSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setSelectedSong(reader.result); setSongName(file.name.replace(/\.[^/.]+$/, '')); setStep(3) }
    reader.readAsDataURL(file)
  }

  const handleAudioLoaded = () => {
    if (audioRef.current) setSongDuration(audioRef.current.duration)
  }

  const playClip = () => { if (audioRef.current) { audioRef.current.currentTime = clipStart; audioRef.current.play(); setIsPlaying(true) } }
  const pauseClip = () => { if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false) } }

  const postStory = async () => {
    setPosting(true)
    try {
      await axios.post(`${API_URL}/api/stories`, {
        image: profilePhoto,
        audio: selectedSong,
        audioName: songName,
        text: noteText || `🎵 ${songName}`,
        bgColor: backgrounds[bgColor]
      }, getAuthHeader())
      setShowSheet(false); setStep(1); setSelectedSong(null); setSongName(''); setNoteText(''); setProfilePhoto(null)
      if (onStoryPosted) onStoryPosted()
    } catch (err) { console.error(err) }
    finally { setPosting(false) }
  }

  // Story Viewer
  const openStoryViewer = (storyGroup) => {
    setViewingStories(storyGroup)
    setViewIndex(0)
    setShowViewer(true)
    setProgress(0)
    startProgress()
  }

  const startProgress = () => {
    clearInterval(progressTimer.current)
    setProgress(0)
    progressTimer.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory()
          return 0
        }
        return prev + (100 / 300) // 30 seconds = 300 intervals at 100ms
      })
    }, 100)
  }

  const nextStory = () => {
    if (!viewingStories) return
    if (viewIndex < viewingStories.stories.length - 1) {
      setViewIndex(prev => prev + 1)
      setProgress(0)
    } else {
      closeViewer()
    }
  }

  const prevStory = () => {
    if (viewIndex > 0) { setViewIndex(prev => prev - 1); setProgress(0) }
  }

  const closeViewer = () => {
    setShowViewer(false); setViewingStories(null); clearInterval(progressTimer.current)
    if (viewerAudioRef.current) viewerAudioRef.current.pause()
  }

  useEffect(() => { return () => clearInterval(progressTimer.current) }, [])

  const timeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000)
    if (s < 60) return 'Just now'; if (s < 3600) return `${Math.floor(s/60)}m ago`; if (s < 86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`
  }

  const currentStory = viewingStories?.stories?.[viewIndex]

  return (
    <>
      {/* Story Circles in Feed */}
      <div className="ms-stories-row">
        {/* Your Story - Add button */}
        <div className="ms-story-circle" onClick={() => setShowSheet(true)}>
          <div className="ms-circle-ring add">
            <div className="ms-circle-avatar">{email[0].toUpperCase()}</div>
            <div className="ms-add-badge">+</div>
          </div>
          <span className="ms-circle-name">Your story</span>
        </div>

        {/* Other people's stories */}
        {stories?.map((group, i) => (
          <div key={group.user.id} className="ms-story-circle" onClick={() => openStoryViewer(group)}>
            <div className={`ms-circle-ring has-story gradient-${(i % 4) + 1}`}>
              <div className="ms-circle-avatar">{group.user.username?.[0]?.toUpperCase() || '?'}</div>
            </div>
            <span className="ms-circle-name">{group.user.username}</span>
          </div>
        ))}
      </div>

      {/* Story Viewer - Full Screen */}
      {showViewer && currentStory && (
        <div className="ms-viewer-overlay">
          <div className="ms-viewer" style={{ background: currentStory.bgColor || '#000' }}>
            {/* Progress bars */}
            <div className="ms-viewer-progress">
              {viewingStories.stories.map((_, idx) => (
                <div key={idx} className="ms-progress-bar">
                  <div className="ms-progress-fill" style={{ width: idx < viewIndex ? '100%' : idx === viewIndex ? `${progress}%` : '0%' }}></div>
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="ms-viewer-header">
              <div className="ms-viewer-user">
                <div className="ms-viewer-avatar">{viewingStories.user.username?.[0]?.toUpperCase()}</div>
                <span className="ms-viewer-name">{viewingStories.user.username}</span>
                <span className="ms-viewer-time">{timeAgo(currentStory.createdAt)}</span>
              </div>
              <div className="ms-viewer-actions">
                {viewingStories.isOwn && (
                  <button className="ms-viewer-delete" onClick={() => { onDeleteStory(currentStory.id); nextStory() }}>🗑️</button>
                )}
                <button className="ms-viewer-close" onClick={closeViewer}>×</button>
              </div>
            </div>

            {/* Content */}
            <div className="ms-viewer-content">
              {currentStory.image && <img src={currentStory.image} alt="" className="ms-viewer-img" />}
              {currentStory.text && <p className="ms-viewer-text">{currentStory.text}</p>}
              {currentStory.audio && (
                <div className="ms-viewer-audio">
                  <div className="ms-viewer-disc">🎵</div>
                  <span>{currentStory.audioName || 'Playing'}</span>
                  <audio ref={viewerAudioRef} src={currentStory.audio} autoPlay />
                </div>
              )}
            </div>

            {/* Tap areas */}
            <div className="ms-tap-left" onClick={prevStory}></div>
            <div className="ms-tap-right" onClick={nextStory}></div>
          </div>
        </div>
      )}

      {/* Bottom Sheet - Create Story */}
      {showSheet && (
        <div className="ms-overlay" onClick={() => setShowSheet(false)}>
          <div className="ms-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="ms-sheet-header">
              <div className="ms-sheet-handle"></div>
              {step > 1 && <button className="ms-back" onClick={() => setStep(step - 1)}>←</button>}
              <h3>{step === 1 ? 'New Story' : step === 2 ? 'Pick Song' : step === 3 ? 'Select Clip' : 'Share'}</h3>
              <button className="ms-close" onClick={() => setShowSheet(false)}>×</button>
            </div>

            {step === 1 && (
              <div className="ms-step-main">
                <div className="ms-photo-preview" onClick={() => photoRef.current?.click()}>
                  {profilePhoto ? <img src={profilePhoto} alt="" /> : <div className="ms-photo-placeholder"><span>📷</span><span>Add Photo</span></div>}
                </div>
                <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoSelect} hidden />
                <button className="ms-pick-song-btn" onClick={() => setStep(2)}>🎵 Add a Song</button>
                <button className="ms-text-only-btn" onClick={() => setStep(4)}>✍️ Text Only</button>
              </div>
            )}

            {step === 2 && (
              <div className="ms-step-pick">
                <div className="ms-pick-area" onClick={() => songRef.current?.click()}>
                  <span>🎵</span><p>Select from device</p><span className="ms-pick-hint">MP3, WAV, M4A</span>
                </div>
                <input ref={songRef} type="file" accept="audio/*" onChange={handleSongSelect} hidden />
              </div>
            )}

            {step === 3 && (
              <div className="ms-step-clip">
                <div className="ms-song-info"><div className="ms-song-disc spinning">🎵</div><div><span className="ms-song-name">{songName}</span></div></div>
                <audio ref={audioRef} src={selectedSong} onLoadedMetadata={handleAudioLoaded} />
                <div className="ms-clip-controls">
                  <input type="range" min="0" max={Math.max(0, songDuration - 30)} step="1" value={clipStart} onChange={(e) => setClipStart(parseFloat(e.target.value))} className="ms-clip-slider" />
                  <p className="ms-clip-label">Slide to pick 30s clip</p>
                </div>
                <button className="ms-play-btn" onClick={isPlaying ? pauseClip : playClip}>{isPlaying ? '⏸ Pause' : '▶ Preview'}</button>
                <button className="ms-next-btn" onClick={() => setStep(4)}>Next →</button>
              </div>
            )}

            {step === 4 && (
              <div className="ms-step-bg">
                <div className="ms-preview-card" style={{ background: backgrounds[bgColor] }}>
                  {profilePhoto && <img src={profilePhoto} alt="" className="ms-preview-img" />}
                  <p className="ms-preview-note">{noteText || (songName ? `🎵 ${songName}` : 'Your story')}</p>
                </div>
                <div className="ms-bg-picker">
                  {backgrounds.map((bg, i) => (
                    <button key={i} className={`ms-bg-dot ${bgColor === i ? 'selected' : ''}`} style={{ background: bg }} onClick={() => setBgColor(i)} />
                  ))}
                </div>
                <input className="ms-note-input" placeholder="Add text..." value={noteText} onChange={(e) => setNoteText(e.target.value)} maxLength={100} />
                <button className="ms-post-btn" onClick={postStory} disabled={posting}>{posting ? 'Posting...' : 'Share to Story'}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default MusicStory
