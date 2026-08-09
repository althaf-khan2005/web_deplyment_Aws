import { useState, useEffect } from 'react'
import axios from 'axios'
import './Stories.css'

const API_URL = import.meta.env.VITE_API_URL

function Stories({ email, onCreateClick }) {
  const [recentUsers, setRecentUsers] = useState([])

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/posts`, getAuthHeader())
        // Get unique users from recent posts
        const seen = new Set()
        const users = []
        for (const post of res.data) {
          if (!seen.has(post.user.email)) {
            seen.add(post.user.email)
            users.push({ email: post.user.email, hasAudio: !!post.audio, hasImage: !!post.image })
          }
          if (users.length >= 8) break
        }
        setRecentUsers(users)
      } catch (err) { /* silent */ }
    }
    fetchRecentPosts()
  }, [])

  return (
    <div className="stories-container">
      <div className="stories-scroll">
        {/* Your story - always first */}
        <div className="story-item" onClick={onCreateClick}>
          <div className="story-ring yours">
            <div className="story-avatar">
              <span className="story-letter">{email?.[0]?.toUpperCase()}</span>
            </div>
            <div className="story-add">+</div>
          </div>
          <span className="story-name">Your story</span>
        </div>

        {/* Dynamic users who recently posted */}
        {recentUsers.map((user, i) => (
          <div key={user.email} className="story-item">
            <div className={`story-ring has-story gradient-${(i % 4) + 1}`}>
              <div className="story-avatar">
                {user.hasAudio ? (
                  <span className="story-emoji">🎵</span>
                ) : (
                  <span className="story-letter">{user.email[0].toUpperCase()}</span>
                )}
              </div>
            </div>
            <span className="story-name">{user.email.split('@')[0]}</span>
          </div>
        ))}

        {/* Placeholder if no recent users */}
        {recentUsers.length === 0 && (
          <>
            {['🎵', '🎧', '🎸', '🎷', '🎹'].map((emoji, i) => (
              <div key={i} className="story-item">
                <div className={`story-ring has-story gradient-${(i % 4) + 1}`}>
                  <div className="story-avatar">
                    <span className="story-emoji">{emoji}</span>
                  </div>
                </div>
                <span className="story-name">music</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default Stories
