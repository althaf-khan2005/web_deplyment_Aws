import { useState, useEffect } from 'react'
import axios from 'axios'
import './Stories.css'

const API_URL = import.meta.env.VITE_API_URL

function Stories({ email, onCreateClick }) {
  const [stories, setStories] = useState([])

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/posts/stories`, getAuthHeader())
        setStories(res.data)
      } catch (err) { /* silent */ }
    }
    fetchStories()
  }, [])

  return (
    <div className="stories-container">
      <div className="stories-scroll">
        {/* Your story */}
        <div className="story-item" onClick={onCreateClick}>
          <div className="story-ring yours">
            <div className="story-avatar">
              <span className="story-letter">{email?.[0]?.toUpperCase()}</span>
            </div>
            <div className="story-add">+</div>
          </div>
          <span className="story-name">Your story</span>
        </div>

        {/* Dynamic stories from followed users */}
        {stories.map((story, i) => (
          <div key={story.user.id} className="story-item">
            <div className={`story-ring has-story gradient-${(i % 4) + 1}`}>
              <div className="story-avatar">
                {story.latestPost.audio ? (
                  <span className="story-emoji">🎵</span>
                ) : story.latestPost.image ? (
                  <span className="story-emoji">📷</span>
                ) : (
                  <span className="story-letter">{story.user.username[0].toUpperCase()}</span>
                )}
              </div>
            </div>
            <span className="story-name">{story.user.username}</span>
          </div>
        ))}

        {/* If no stories, show placeholders */}
        {stories.length === 0 && (
          <>
            {['🎵', '🎧', '🎸', '🎷', '🎹'].map((emoji, i) => (
              <div key={i} className="story-item story-placeholder">
                <div className={`story-ring has-story gradient-${(i % 4) + 1}`}>
                  <div className="story-avatar">
                    <span className="story-emoji">{emoji}</span>
                  </div>
                </div>
                <span className="story-name">discover</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default Stories
