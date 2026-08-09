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
    await axios.delete(`${API_URL}/api/posts/${id}`, getAuthHeader())
    setPosts(prev => prev.filter(p => p.id !== id))
    setMyPosts(prev => prev.filter(p => p.id !== id))
  }

  useEffect(() => { fetchPosts(); fetchMyPosts() }, [])

  const handlePostCreated = () => { fetchPosts(); fetchMyPosts(); setActivePage('home') }

  const timeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000)
    if (s < 60) return 'now'
    if (s < 3600) return `${Math.floor(s/60)}m`
    if (s < 86400) return `${Math.floor(s/3600)}h`
    return `${Math.floor(s/86400)}d`
  }

  return (
    <>
      <Navbar activePage={activePage} setActivePage={setActivePage} onLogout={onLogout} email={email} />
      
      <main className="ig-main">
        {/* HOME FEED */}
        {activePage === 'home' && (
          <div className="ig-feed">
            <Stories email={email} />
            <InstaNotes />
            
            {/* Posts */}
            <div className="ig-posts">
              {loadingPosts && <div className="ig-loading">Loading...</div>}
              
              {!loadingPosts && posts.length === 0 && (
                <div className="ig-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p>No posts yet</p>
                  <button onClick={() => setActivePage('create')}>Share your first post</button>
                </div>
              )}

              {posts.map(post => (
                <article key={post.id} className="ig-post">
                  {/* Post Header */}
                  <div className="ig-post-header">
                    <div className="ig-post-avatar">{post.user.email[0].toUpperCase()}</div>
                    <div className="ig-post-user">
                      <span className="ig-post-username">{post.user.email.split('@')[0]}</span>
                    </div>
                    <button className="ig-post-more">•••</button>
                  </div>

                  {/* Post Media */}
                  {post.image && (
                    <div className="ig-post-media">
                      <img src={post.image} alt="" />
                    </div>
                  )}
                  {post.audio && (
                    <div className="ig-post-audio">
                      <div className="ig-post-audio-icon">🎵</div>
                      <audio controls src={post.audio} />
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="ig-post-actions">
                    <div className="ig-actions-left">
                      <button className="ig-action-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

                  {/* Caption */}
                  {post.caption && (
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
            <div className="ig-explore-grid">
              {posts.filter(p => p.image).map(post => (
                <div key={post.id} className="ig-explore-item">
                  <img src={post.image} alt="" />
                </div>
              ))}
              {posts.filter(p => p.image).length === 0 && (
                <div className="ig-empty" style={{gridColumn: '1/-1'}}>
                  <p>No content to explore yet</p>
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
              <div className="ig-profile-avatar">
                {email[0].toUpperCase()}
              </div>
              <div className="ig-profile-info">
                <div className="ig-profile-top">
                  <h2>{email.split('@')[0]}</h2>
                  <button className="ig-edit-btn">Edit profile</button>
                </div>
                <div className="ig-profile-stats">
                  <span><strong>{myPosts.length}</strong> posts</span>
                  <span><strong>0</strong> followers</span>
                  <span><strong>0</strong> following</span>
                </div>
                <div className="ig-profile-bio">
                  <p className="ig-bio-name">{email.split('@')[0]}</p>
                  <p className="ig-bio-text">🎵 Music lover | 🎸 Guitar player</p>
                </div>
              </div>
            </div>

            {/* Posts Grid */}
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
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                </svg>
                SAVED
              </button>
            </div>

            <div className="ig-profile-grid">
              {myPosts.map(post => (
                <div key={post.id} className="ig-grid-item" onClick={() => deletePost(post.id)}>
                  {post.image && <img src={post.image} alt="" />}
                  {!post.image && post.audio && <div className="ig-grid-audio">🎵</div>}
                  {!post.image && !post.audio && <div className="ig-grid-text">{post.caption}</div>}
                </div>
              ))}
            </div>

            {myPosts.length === 0 && (
              <div className="ig-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <h3>Share Photos</h3>
                <p>When you share photos, they will appear on your profile.</p>
                <button onClick={() => setActivePage('create')}>Share your first photo</button>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  )
}

export default Dashboard
