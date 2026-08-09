import { useState, useEffect, useRef } from 'react'
import './InstaNotes.css'

function InstaNotes() {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [selectedColor, setSelectedColor] = useState(0)
  const inputRef = useRef(null)

  const colors = [
    { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', label: 'Purple' },
    { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', label: 'Pink' },
    { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', label: 'Blue' },
    { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', label: 'Green' },
    { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', label: 'Sunset' },
    { bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', label: 'Lavender' },
  ]

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showInput])

  // Timer: remove notes after 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNotes(prev => prev.filter(note => Date.now() - note.createdAt < 30000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const addNote = (e) => {
    e.preventDefault()
    if (!newNote.trim()) return

    const note = {
      id: Date.now(),
      text: newNote.trim(),
      color: colors[selectedColor].bg,
      createdAt: Date.now(),
    }

    setNotes(prev => [note, ...prev])
    setNewNote('')
    setShowInput(false)
  }

  const getTimeLeft = (createdAt) => {
    const elapsed = Math.floor((Date.now() - createdAt) / 1000)
    const remaining = 30 - elapsed
    return remaining > 0 ? remaining : 0
  }

  const getProgress = (createdAt) => {
    const elapsed = (Date.now() - createdAt) / 30000
    return Math.min(elapsed, 1)
  }

  return (
    <div className="insta-notes">
      <div className="notes-header">
        <h3 className="notes-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          Quick Notes
        </h3>
        <span className="notes-subtitle">Disappears in 30s</span>
      </div>

      {/* Add Note Button */}
      {!showInput && (
        <button className="add-note-btn" onClick={() => setShowInput(true)}>
          <span className="add-icon">+</span>
          <span>Add a note...</span>
        </button>
      )}

      {/* Note Input */}
      {showInput && (
        <form onSubmit={addNote} className="note-input-container">
          <div className="note-input-card" style={{ background: colors[selectedColor].bg }}>
            <textarea
              ref={inputRef}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={120}
              rows={3}
            />
            <div className="char-count">{newNote.length}/120</div>
          </div>

          <div className="color-picker">
            {colors.map((color, i) => (
              <button
                key={i}
                type="button"
                className={`color-dot ${selectedColor === i ? 'selected' : ''}`}
                style={{ background: color.bg }}
                onClick={() => setSelectedColor(i)}
                aria-label={color.label}
              />
            ))}
          </div>

          <div className="note-actions">
            <button type="button" className="cancel-btn" onClick={() => { setShowInput(false); setNewNote('') }}>
              Cancel
            </button>
            <button type="submit" className="post-btn" disabled={!newNote.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Post
            </button>
          </div>
        </form>
      )}

      {/* Notes Feed */}
      {notes.length > 0 && (
        <div className="notes-feed">
          {notes.map(note => (
            <NoteCard key={note.id} note={note} getTimeLeft={getTimeLeft} getProgress={getProgress} />
          ))}
        </div>
      )}

      {notes.length === 0 && !showInput && (
        <div className="notes-empty">
          <span className="empty-icon">💭</span>
          <p>No active notes</p>
          <p className="empty-hint">Notes disappear after 30 seconds</p>
        </div>
      )}
    </div>
  )
}

function NoteCard({ note, getTimeLeft, getProgress }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(note.createdAt))
  const [progress, setProgress] = useState(getProgress(note.createdAt))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(note.createdAt))
      setProgress(getProgress(note.createdAt))
    }, 100)
    return () => clearInterval(interval)
  }, [note.createdAt])

  return (
    <div className={`note-card ${timeLeft <= 5 ? 'fading' : ''}`}>
      <div className="note-progress-bar">
        <div
          className="note-progress-fill"
          style={{ width: `${(1 - progress) * 100}%`, background: note.color }}
        />
      </div>
      <div className="note-body" style={{ background: note.color }}>
        <p className="note-text">{note.text}</p>
      </div>
      <div className="note-footer">
        <span className="note-timer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          {timeLeft}s
        </span>
        {timeLeft <= 5 && <span className="note-vanishing">Vanishing...</span>}
      </div>
    </div>
  )
}

export default InstaNotes
