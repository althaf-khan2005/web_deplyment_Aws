import './Dashboard.css'
import Navbar from './Navbar'
import Stories from './Stories'
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
  const [likedPosts, setLikedPosts] = useState(new Set())

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/posts`, getAuthHeader())
      setPosts(res.data)
    } catch (err) { console.error(err) }
    finally { setLoadingPosts(false) }
  }

  const fetchMyPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/posts/me`, getAuthHeader())
      setMyPosts(res.data)
    } catch (err) { console.error(err) }
  }

  const deletePost = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/posts/${id}`, getAuthHeader())
      setPosts(prev => prev.filter(p => p.id !== id))
      setMyPosts(prev => prev.filter(p => p.id !== id))
    } catch (err) { console.error(err) }
  }

  const toggleLike = (id) => {
    setLikedPosts(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => { fetchPosts(); fetchMyPosts() }, [])

  const handlePostCreated = () => { fetchPosts(); fetchMyPosts(); setActivePage('home') }

  const timeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000)
    if (s < 60) return 'Just now'
    if (s < 3600) return `${Math.floor(s / 60)} minutes ago`
    if (s < 86400) return `${Math.floor(s / 3600)} hours ago`
    return `${Math.floor(s / 86400)} days ago`
  }

  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  ]

  return (
    <>
      <Navbar activePage={activePage} setActivePage={setActivePage} onLogout={onLogout} email={email} />

      <main className="ig-main">
        {/* HOME FEED */}
        {activePage === 'home' && (
          <div className="ig-feed">
            <Stories email={email} onCreateClick={() => setActivePage('create')} />
            <InstaNotes />

            <div className="ig-posts">
              {loadingPosts && (
                <div className="ig-loading">
                  <div className="ig-spinner"></div>
                </div>
              )}

              {!loadingPosts && posts.length === 0 && (
                <div className="ig-empty-feed">
                  <div className="ig-empty-icon">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M9 18V5l12-2v13"/>
                      <circle cx="6" cy="18" r="3"/>
                      <circle cx="18" cy="16" r="3"/>
                    </svg>
                  </div>
                  <h3>Welcome to MusicGram</h3>
                  <p>Share your first song or photo</p>
                  <button className="ig-cta-btn" onClick={() => setActivePage('create')}>
                    Create Post
                  </button>
                </div>
              )}

              {posts.map((post, index) => (
                <article key={post.id} className="ig-post" style={{ animationDelay: `${index * 0.1}s` }}>
                  {/* Header */}
                  <div className="ig-post-header">
                    <div className="ig-post-avatar-ring" style={{ background: gradients[index % gradients.length] }}>
                      <div className="ig-post-avatar">
                        {post.user.email[0].toUpperCase()}
                      </div>
                    </div>
                    <div className="ig-post-user">
                      <span className="ig-post-username">{post.user.email.split('@')[0]}</span>
                      <span className="ig-post-location">🎵 MusicGram</span>
                    </div>
                    {post.user.email === email && (
                      <button className="ig-post-delete" onClick={() => deletePost(post.id)}>×</button>
                    )}
                  </div>

                  {/* Media */}
                  {post.image && (
                    <div className="ig-post-media" onDoubleClick={() => toggleLike(post.id)}>
                      <img src={post.image} alt="" />
                      {likedPosts.has(post.id) && <div className="ig-heart-animation">❤️</div>}
                    </div>
                  )}

                  {post.audio && (
                    <div className="ig-post-audio-card" style={{ background: gradients[index % gradients.length] }}>
                      <div className="ig-audio-content">
                        <div className="ig-audio-disc">
                          <div className="ig-disc-inner">🎵</div>
                        </div>
                        <div className="ig-audio-info">
                          <span className="ig-audio-title">{post.caption || 'Now Playing'}</span>
                          <span className="ig-audio-artist">{post.user.email.split('@')[0]}</span>
                        </div>
                      </div>
                      <audio controls src={post.audio} className="ig-audio-player" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="ig-post-actions">
                    <div className="ig-actions-left">
                      <button className={`ig-action-btn ${likedPosts.has(post.id) ? 'liked' : ''}`} onClick={() => toggleLike(post.id)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill={likedPosts.has(post.id) ? '#ed4956' : 'none'} stroke={likedPosts.has(post.id) ? '#ed4956' : 'currentColor'} strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                        </svg>
                      </button>
                      <button className="ig-action-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                        </svg>
                      </button>
                      <button className="ig-action-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="22" y1="2" x2="11" y2="13"/>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                      </button>
                    </div>
                    <button className="ig-action-btn">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                      </svg>
                    </button>
                  </div>

                  {/* Likes */}
                  {likedPosts.has(post.id) && (
                    <div className="ig-post-likes">
                      Liked by <strong>you</strong>
                    </div>
                  )}

                  {/* Caption */}
                  {post.caption && !post.audio && (
                    <div className="ig-post-caption">
                      <span className="ig-caption-user">{post.user.email.split('@')[0]}</span>
                      {' '}{post.caption}
                    </div>
                  )}

                  <div className="ig-post-time">{timeAgo(post.createdAt)}</div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* EXPLORE */}
        {activePage === 'search' && (
          <div className="ig-explore">
            <h2 className="ig-explore-title">Explore</h2>
            <div className="ig-explore-grid">
              {posts.map((post, i) => (
                <div key={post.id} className={`ig-explore-item ${i % 5 === 0 ? 'big' : ''}`}>
                  {post.image && <img src={post.image} alt="" />}
                  {!post.image && post.audio && (
                    <div className="ig-explore-audio" style={{ background: gradients[i % gradients.length] }}>
                      <span>🎵</span>
                    </div>
                  )}
                  {!post.image && !post.audio && (
                    <div className="ig-explore-text" style={{ background: gradients[i % gradients.length] }}>
                      <p>{post.caption}</p>
                    </div>
                  )}
                </div>
              ))}
              {posts.length === 0 && (
                <div className="ig-empty-feed" style={{ gridColumn: '1/-1' }}>
                  <p>Nothing to explore yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CREATE */}
        {activePage === 'create' && (
          <div className="ig-create-page">
            <PostCreate onPostCreated={handlePostCreated} />
          </div>
        )}

        {/* PROFILE */}
        {activePage === 'profile' && (
          <div className="ig-profile">
            <div className="ig-profile-header">
              <div className="ig-profile-avatar-wrapper">
                <div className="ig-profile-avatar-ring">
                  <div className="ig-profile-avatar">
                    {email[0].toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="ig-profile-info">
                <div className="ig-profile-top">
                  <h2>{email.split('@')[0]}</h2>
                  <button className="ig-edit-btn">Edit profile</button>
                </div>
                <div className="ig-profile-stats">
                  <div className="ig-stat"><strong>{myPosts.length}</strong><span>posts</span></div>
                  <div className="ig-stat"><strong>128</strong><span>followers</span></div>
                  <div className="ig-stat"><strong>96</strong><span>following</span></div>
                </div>
                <div className="ig-profile-bio">
                  <p className="ig-bio-name">{email.split('@')[0]}</p>
                  <p className="ig-bio-text">🎵 Music is life | 🎸 Share your vibes</p>
                  <p className="ig-bio-link">🔗 musicgram.app</p>
                </div>
              </div>
            </div>

            <div className="ig-profile-tabs">
              <button className="ig-tab active">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                POSTS
              </button>
              <button className="ig-tab">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
                MUSIC
              </button>
            </div>

            <div className="ig-profile-grid">
              {myPosts.map((post, i) => (
                <div key={post.id} className="ig-grid-item" onClick={() => deletePost(post.id)}>
                  {post.image && <img src={post.image} alt="" />}
                  {!post.image && post.audio && (
                    <div className="ig-grid-audio" style={{ background: gradients[i % gradients.length] }}>
                      <span>🎵</span>
                    </div>
                  )}
                  {!post.image && !post.audio && (
                    <div className="ig-grid-text" style={{ background: gradients[i % gradients.length] }}>
                      <p>{post.caption}</p>
                    </div>
                  )}
                  <div className="ig-grid-overlay">
                    <span>🗑️ Delete</span>
                  </div>
                </div>
              ))}
            </div>

            {myPosts.length === 0 && (
              <div className="ig-empty-feed">
                <div className="ig-empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
                <h3>Share Music</h3>
                <p>When you share songs or photos, they appear here.</p>
                <button className="ig-cta-btn" onClick={() => setActivePage('create')}>Share your first post</button>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  )
}

export default Dashboard
