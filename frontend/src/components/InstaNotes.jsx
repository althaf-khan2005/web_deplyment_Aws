import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './InstaNotes.css'

const API_URL = import.meta.env.VITE_API_URL

function InstaNotes() {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [selectedColor, setSelectedColor] = useState(0)
  const [loading, setLoading] = useState(true)
  const inputRef = useRef(null)

  const colors = [
    { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', label: 'Purple' },
    { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', label: 'Pink' },
    { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', label: 'Blue' },
    { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', label: 'Green' },
    { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', label: 'Sunset' },
    { bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', label: 'Lavender' },
  ]

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })

  // Fetch notes from backend
  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/notes`, getAuthHeader())
      setNotes(res.data)
    } catch (err) {
      console.error('Failed to fetch notes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
    // Refresh every 60 seconds to update timers
    const interval = setInterval(fetchNotes, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showInput])

  const addNote = async (e) => {
    e.preventDefault()
    if (!newNote.trim()) return

    try {
      const res = await axios.post(`${API_URL}/api/notes`, {
        text: newNote.trim(),
        color: colors[selectedColor].bg
      }, getAuthHeader())

      setNotes(prev => [res.data, ...prev])
      setNewNote('')
      setShowInput(false)
    } catch (err) {
      console.error('Failed to create note:', err)
    }
  }

  const deleteNote = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/notes/${id}`, getAuthHeader())
      setNotes(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Failed to delete note:', err)
    }
  }

  const getTimeLeft = (expiresAt) => {
    const remaining = new Date(expiresAt) - Date.now()
    if (remaining <= 0) return '0s'
    
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m`
    return `${Math.floor(remaining / 1000)}s`
  }

  const getProgress = (createdAt, expiresAt) => {
    const total = new Date(expiresAt) - new Date(createdAt)
    const elapsed = Date.now() - new Date(createdAt)
    return Math.min(elapsed / total, 1)
  }

  const isExpiringSoon = (expiresAt) => {
    const remaining = new Date(expiresAt) - Date.now()
    return remaining < 60 * 60 * 1000 // less than 1 hour
  }

  return (
    <div className="insta-notes">
      <div className="notes-header">
        <h3 className="notes-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
          Music Notes
        </h3>
        <span className="notes-subtitle">🎵 Disappears in 24h</span>
      </div>

      {/* Add Note Button */}
      {!showInput && (
        <button className="add-note-btn" onClick={() => setShowInput(true)}>
          <span className="add-icon">♪</span>
          <span>Add a music note...</span>
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
              placeholder="🎶 What song is stuck in your head?"
              maxLength={200}
              rows={3}
            />
            <div className="char-count">{newNote.length}/200</div>
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

      {/* Loading State */}
      {loading && (
        <div className="notes-empty">
          <span className="empty-icon">⏳</span>
          <p>Loading notes...</p>
        </div>
      )}

      {/* Notes Feed */}
      {!loading && notes.length > 0 && (
        <div className="notes-feed">
          {notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              getTimeLeft={getTimeLeft}
              getProgress={getProgress}
              isExpiringSoon={isExpiringSoon}
              onDelete={deleteNote}
            />
          ))}
        </div>
      )}

      {!loading && notes.length === 0 && !showInput && (
        <div className="notes-empty">
          <span className="empty-icon">🎵</span>
          <p>No active music notes</p>
          <p className="empty-hint">Share a song — it disappears after 24 hours</p>
        </div>
      )}
    </div>
  )
}

function NoteCard({ note, getTimeLeft, getProgress, isExpiringSoon, onDelete }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(note.expiresAt))
  const [progress, setProgress] = useState(getProgress(note.createdAt, note.expiresAt))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(note.expiresAt))
      setProgress(getProgress(note.createdAt, note.expiresAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [note.expiresAt, note.createdAt])

  const expiring = isExpiringSoon(note.expiresAt)

  return (
    <div className={`note-card ${expiring ? 'fading' : ''}`}>
      <div className="note-progress-bar">
        <div
          className="note-progress-fill"
          style={{ width: `${(1 - progress) * 100}%`, background: note.color }}
        />
      </div>
      <div className="note-body" style={{ background: note.color }}>
        <p className="note-text">{note.text}</p>
        <button className="note-delete-btn" onClick={() => onDelete(note.id)} aria-label="Delete note">
          ×
        </button>
      </div>
      <div className="note-footer">
        <span className="note-timer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          {timeLeft}
        </span>
        {expiring && <span className="note-vanishing">Expiring soon...</span>}
      </div>
    </div>
  )
}

export default InstaNotes
