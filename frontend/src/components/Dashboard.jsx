import './Dashboard.css'
import Navbar from './Navbar'
import InstaNotes from './InstaNotes'
import PostCreate from './PostCreate'
import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

function Dashboard({ email, onLogout }) {
  const [activePage, setActivePage] = useState('home')
  const [posts, setPosts] = useState([])
  const [myPosts, setMyPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/posts`, getAuthHeader())
      setPosts(res.data)
    } catch (err) {
      console.error('Failed to fetch posts:', err)
    } finally {
      setLoadingPosts(false)
    }
  }

  const fetchMyPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/posts/me`, getAuthHeader())
      setMyPosts(res.data)
    } catch (err) {
      console.error('Failed to fetch my posts:', err)
    }
  }

  const deletePost = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/posts/${id}`, getAuthHeader())
      setPosts(prev => prev.filter(p => p.id !== id))
      setMyPosts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Failed to delete post:', err)
    }
  }

  useEffect(() => {
    fetchPosts()
    fetchMyPosts()
  }, [])

  const handlePostCreated = () => {
    fetchPosts()
    fetchMyPosts()
    setActivePage('home')
  }

  const timeAgo = (dateStr) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <>
      <Navbar activePage={activePage} setActivePage={setActivePage} onLogout={onLogout} email={email} />
      <div className="dashboard">
        {/* HOME - Feed */}
        {activePage === 'home' && (
          <div className="feed-container">
            {/* Notes Section */}
            <InstaNotes />

            {/* Posts Feed */}
            <div className="posts-section">
              <h3 className="feed-title">Feed</h3>

              {loadingPosts && <div className="feed-loading">Loading posts...</div>}

              {!loadingPosts && posts.length === 0 && (
                <div className="feed-empty">
                  <span className="empty-icon">📷</span>
                  <p>No posts yet</p>
                  <p className="empty-sub">Be the first to share something!</p>
                  <button className="empty-btn" onClick={() => setActivePage('create')}>Create Post</button>
                </div>
              )}

              {posts.map(post => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="post-avatar">
                      {post.user.email[0].toUpperCase()}
                    </div>
                    <div className="post-user-info">
                      <span className="post-username">{post.user.email.split('@')[0]}</span>
                      <span className="post-time">{timeAgo(post.createdAt)}</span>
                    </div>
                  </div>

                  {post.image && (
                    <div className="post-image-container">
                      <img src={post.image} alt="Post" className="post-image" />
                    </div>
                  )}

                  {post.audio && (
                    <div className="post-audio-container">
                      <div className="audio-wave-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 18V5l12-2v13"/>
                          <circle cx="6" cy="18" r="3"/>
                          <circle cx="18" cy="16" r="3"/>
                        </svg>
                      </div>
                      <audio controls src={post.audio} className="post-audio" />
                    </div>
                  )}

                  {post.caption && (
                    <div className="post-caption">
                      <span className="caption-user">{post.user.email.split('@')[0]}</span>
                      {post.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CREATE */}
        {activePage === 'create' && (
          <div className="create-container">
            <PostCreate onPostCreated={handlePostCreated} />
          </div>
        )}

        {/* PROFILE */}
        {activePage === 'profile' && (
          <div className="profile-container">
            <div className="profile-header-section">
              <div className="profile-avatar-large">
                {email[0].toUpperCase()}
              </div>
              <div className="profile-stats">
                <h2 className="profile-name">{email.split('@')[0]}</h2>
                <p className="profile-email">{email}</p>
                <div className="profile-counts">
                  <div className="count-item">
                    <span className="count-number">{myPosts.length}</span>
                    <span className="count-label">Posts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-posts-section">
              <h3 className="profile-posts-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                Your Posts
              </h3>

              {myPosts.length === 0 && (
                <div className="feed-empty">
                  <p>No posts yet</p>
                  <button className="empty-btn" onClick={() => setActivePage('create')}>Share your first post</button>
                </div>
              )}

              <div className="profile-grid">
                {myPosts.map(post => (
                  <div key={post.id} className="profile-post-card">
                    {post.image && <img src={post.image} alt="" className="grid-image" />}
                    {!post.image && post.audio && (
                      <div className="grid-audio">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 18V5l12-2v13"/>
                          <circle cx="6" cy="18" r="3"/>
                          <circle cx="18" cy="16" r="3"/>
                        </svg>
                      </div>
                    )}
                    {!post.image && !post.audio && (
                      <div className="grid-text">
                        <p>{post.caption}</p>
                      </div>
                    )}
                    <button className="grid-delete" onClick={() => deletePost(post.id)}>🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Dashboard
