import './Dashboard.css'
import Navbar from './Navbar'
import Stories from './Stories'
import InstaNotes from './InstaNotes'
import MusicStory from './MusicStory'
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
  const [myProfile, setMyProfile] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [viewingUser, setViewingUser] = useState(null)

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })

  const fetchPosts = async () => {
    try { const res = await axios.get(`${API_URL}/api/posts`, getAuthHeader()); setPosts(res.data) }
    catch (err) {} finally { setLoadingPosts(false) }
  }

  const fetchMyPosts = async () => {
    try { const res = await axios.get(`${API_URL}/api/posts/me`, getAuthHeader()); setMyPosts(res.data) }
    catch (err) {}
  }

  const fetchMyProfile = async () => {
    try { const res = await axios.get(`${API_URL}/api/users/me`, getAuthHeader()); setMyProfile(res.data) }
    catch (err) {}
  }

  const deletePost = async (id) => {
    try { await axios.delete(`${API_URL}/api/posts/${id}`, getAuthHeader()); setPosts(p => p.filter(x => x.id !== id)); setMyPosts(p => p.filter(x => x.id !== id)) }
    catch (err) {}
  }

  const toggleLike = (id) => {
    setLikedPosts(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const searchUsers = async (q) => {
    setSearchQuery(q)
    if (q.length < 2) { setSearchResults([]); return }
    try { const res = await axios.get(`${API_URL}/api/users/search?q=${q}`, getAuthHeader()); setSearchResults(res.data) }
    catch (err) {}
  }

  const viewUserProfile = async (username) => {
    try { const res = await axios.get(`${API_URL}/api/users/${username}`, getAuthHeader()); setViewingUser(res.data); setActivePage('viewProfile') }
    catch (err) {}
  }

  const followUser = async (userId) => {
    try { await axios.post(`${API_URL}/api/follow/${userId}`, {}, getAuthHeader()); if (viewingUser) setViewingUser({ ...viewingUser, isFollowing: true }) }
    catch (err) {}
  }

  const unfollowUser = async (userId) => {
    try { await axios.delete(`${API_URL}/api/follow/${userId}`, getAuthHeader()); if (viewingUser) setViewingUser({ ...viewingUser, isFollowing: false }) }
    catch (err) {}
  }

  const togglePrivacy = async () => {
    try {
      const res = await axios.put(`${API_URL}/api/users/me`, { isPublic: !myProfile.isPublic }, getAuthHeader())
      setMyProfile({ ...myProfile, ...res.data })
    } catch (err) {}
  }

  useEffect(() => { fetchPosts(); fetchMyPosts(); fetchMyProfile() }, [])
  const handlePostCreated = () => { fetchPosts(); fetchMyPosts(); setActivePage('home') }

  const timeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000)
    if (s < 60) return 'now'; if (s < 3600) return `${Math.floor(s/60)}m`; if (s < 86400) return `${Math.floor(s/3600)}h`; return `${Math.floor(s/86400)}d`
  }

  const gradients = [
    'linear-gradient(135deg, #667eea, #764ba2)', 'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)', 'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)', 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  ]

  return (
    <>
      <Navbar activePage={activePage} setActivePage={setActivePage} onLogout={onLogout} email={email} />
      <main className="ig-main">

        {/* HOME */}
        {activePage === 'home' && (
          <div className="ig-feed">
            <div className="ig-stories-row">
              <MusicStory email={email} />
              <Stories email={email} onCreateClick={() => setActivePage('create')} />
            </div>
            <InstaNotes />
            <div className="ig-posts">
              {loadingPosts && <div className="ig-loading"><div className="ig-spinner"></div></div>}
              {!loadingPosts && posts.length === 0 && (
                <div className="ig-empty-feed">
                  <h3>Welcome to MusicGram</h3>
                  <p>Follow people or share your first post</p>
                  <button className="ig-cta-btn" onClick={() => setActivePage('create')}>Create Post</button>
                </div>
              )}
              {posts.map((post, i) => (
                <article key={post.id} className="ig-post" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="ig-post-header">
                    <div className="ig-post-avatar-ring" style={{ background: gradients[i % 6] }}>
                      <div className="ig-post-avatar">{post.user.username?.[0]?.toUpperCase() || 'U'}</div>
                    </div>
                    <div className="ig-post-user" onClick={() => viewUserProfile(post.user.username)} style={{cursor:'pointer'}}>
                      <span className="ig-post-username">{post.user.username || post.user.email.split('@')[0]}</span>
                    </div>
                    {post.user.email === email && <button className="ig-post-delete" onClick={() => deletePost(post.id)}>×</button>}
                  </div>
                  {post.image && <div className="ig-post-media" onDoubleClick={() => toggleLike(post.id)}><img src={post.image} alt="" />{likedPosts.has(post.id) && <div className="ig-heart-animation">❤️</div>}</div>}
                  {post.audio && (
                    <div className="ig-post-audio-card" style={{ background: gradients[i % 6] }}>
                      <div className="ig-audio-content">
                        <div className="ig-audio-disc"><div className="ig-disc-inner">🎵</div></div>
                        <div className="ig-audio-info">
                          <span className="ig-audio-title">{post.audioName || post.caption || 'Now Playing'}</span>
                          <span className="ig-audio-artist">{post.user.username || post.user.email.split('@')[0]}</span>
                        </div>
                      </div>
                      <audio controls src={post.audio} className="ig-audio-player" />
                    </div>
                  )}
                  <div className="ig-post-actions">
                    <div className="ig-actions-left">
                      <button className={`ig-action-btn ${likedPosts.has(post.id) ? 'liked' : ''}`} onClick={() => toggleLike(post.id)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill={likedPosts.has(post.id) ? '#ed4956' : 'none'} stroke={likedPosts.has(post.id) ? '#ed4956' : 'currentColor'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                      </button>
                      <button className="ig-action-btn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></button>
                      <button className="ig-action-btn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
                    </div>
                    <button className="ig-action-btn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg></button>
                  </div>
                  {post.caption && !post.audio && <div className="ig-post-caption"><span className="ig-caption-user">{post.user.username || post.user.email.split('@')[0]}</span> {post.caption}</div>}
                  <div className="ig-post-time">{timeAgo(post.createdAt)}</div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* SEARCH / EXPLORE */}
        {activePage === 'search' && (
          <div className="ig-explore">
            <div className="ig-search-bar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => searchUsers(e.target.value)} />
            </div>

            {searchResults.length > 0 && (
              <div className="ig-search-results">
                {searchResults.map(user => (
                  <div key={user.id} className="ig-search-user" onClick={() => viewUserProfile(user.username)}>
                    <div className="ig-search-avatar">{user.username[0].toUpperCase()}</div>
                    <div className="ig-search-info">
                      <span className="ig-search-username">{user.username}</span>
                      <span className="ig-search-bio">{user.bio || (user.isPublic ? 'Public profile' : '🔒 Private')}</span>
                    </div>
                    <span className="ig-search-posts">{user._count.posts} posts</span>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length < 2 && (
              <div className="ig-explore-grid">
                {posts.filter(p => p.image).map((post, i) => (
                  <div key={post.id} className={`ig-explore-item ${i % 7 === 0 ? 'big' : ''}`}>
                    <img src={post.image} alt="" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW OTHER USER'S PROFILE */}
        {activePage === 'viewProfile' && viewingUser && (
          <div className="ig-profile">
            <div className="ig-profile-header">
              <div className="ig-profile-avatar-wrapper">
                <div className="ig-profile-avatar-ring"><div className="ig-profile-avatar">{viewingUser.username[0].toUpperCase()}</div></div>
              </div>
              <div className="ig-profile-info">
                <div className="ig-profile-top">
                  <h2>{viewingUser.username}</h2>
                  {!viewingUser.isOwnProfile && (
                    viewingUser.isFollowing ? (
                      <button className="ig-unfollow-btn" onClick={() => unfollowUser(viewingUser.id)}>Following</button>
                    ) : (
                      <button className="ig-follow-btn" onClick={() => followUser(viewingUser.id)}>Follow</button>
                    )
                  )}
                </div>
                <div className="ig-profile-stats">
                  <div className="ig-stat"><strong>{viewingUser._count.posts}</strong><span>posts</span></div>
                  <div className="ig-stat"><strong>{viewingUser._count.followers}</strong><span>followers</span></div>
                  <div className="ig-stat"><strong>{viewingUser._count.following}</strong><span>following</span></div>
                </div>
                <div className="ig-profile-bio">
                  <p className="ig-bio-name">{viewingUser.username}</p>
                  {viewingUser.bio && <p className="ig-bio-text">{viewingUser.bio}</p>}
                  {!viewingUser.isPublic && !viewingUser.isFollowing && !viewingUser.isOwnProfile && (
                    <p className="ig-private-label">🔒 This account is private</p>
                  )}
                </div>
              </div>
            </div>

            {/* Posts grid (only if public or following) */}
            {viewingUser.posts && viewingUser.posts.length > 0 ? (
              <div className="ig-profile-grid">
                {viewingUser.posts.map((post, i) => (
                  <div key={post.id} className="ig-grid-item">
                    {post.image && <img src={post.image} alt="" />}
                    {!post.image && post.audio && <div className="ig-grid-audio" style={{ background: gradients[i % 6] }}><span>🎵</span></div>}
                    {!post.image && !post.audio && <div className="ig-grid-text" style={{ background: gradients[i % 6] }}><p>{post.caption}</p></div>}
                  </div>
                ))}
              </div>
            ) : (
              !viewingUser.isPublic && !viewingUser.isFollowing && !viewingUser.isOwnProfile ? (
                <div className="ig-empty-feed"><h3>This Account is Private</h3><p>Follow to see their posts</p></div>
              ) : (
                <div className="ig-empty-feed"><p>No posts yet</p></div>
              )
            )}
            <button className="ig-back-link" onClick={() => setActivePage('search')}>← Back to search</button>
          </div>
        )}

        {/* CREATE */}
        {activePage === 'create' && (
          <div className="ig-create-page"><PostCreate onPostCreated={handlePostCreated} /></div>
        )}

        {/* MY PROFILE */}
        {activePage === 'profile' && (
          <div className="ig-profile">
            <div className="ig-profile-header">
              <div className="ig-profile-avatar-wrapper">
                <div className="ig-profile-avatar-ring"><div className="ig-profile-avatar">{myProfile?.username?.[0]?.toUpperCase() || email[0].toUpperCase()}</div></div>
              </div>
              <div className="ig-profile-info">
                <div className="ig-profile-top">
                  <h2>{myProfile?.username || email.split('@')[0]}</h2>
                  <button className="ig-edit-btn" onClick={togglePrivacy}>
                    {myProfile?.isPublic ? '🌐 Public' : '🔒 Private'}
                  </button>
                </div>
                <div className="ig-profile-stats">
                  <div className="ig-stat"><strong>{myProfile?._count?.posts || myPosts.length}</strong><span>posts</span></div>
                  <div className="ig-stat"><strong>{myProfile?._count?.followers || 0}</strong><span>followers</span></div>
                  <div className="ig-stat"><strong>{myProfile?._count?.following || 0}</strong><span>following</span></div>
                </div>
                <div className="ig-profile-bio">
                  <p className="ig-bio-name">{myProfile?.username || email.split('@')[0]}</p>
                  <p className="ig-bio-text">{myProfile?.bio || '🎵 Music is life'}</p>
                  <p className="ig-privacy-badge">{myProfile?.isPublic ? '🌐 Everyone can see your posts' : '🔒 Only followers can see your posts'}</p>
                </div>
              </div>
            </div>

            <div className="ig-profile-tabs">
              <button className="ig-tab active">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                POSTS
              </button>
              <button className="ig-tab">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                MUSIC
              </button>
            </div>

            <div className="ig-profile-grid">
              {myPosts.map((post, i) => (
                <div key={post.id} className="ig-grid-item" onClick={() => deletePost(post.id)}>
                  {post.image && <img src={post.image} alt="" />}
                  {!post.image && post.audio && <div className="ig-grid-audio" style={{ background: gradients[i % 6] }}><span>🎵</span></div>}
                  {!post.image && !post.audio && <div className="ig-grid-text" style={{ background: gradients[i % 6] }}><p>{post.caption}</p></div>}
                  <div className="ig-grid-overlay"><span>🗑️</span></div>
                </div>
              ))}
            </div>

            {myPosts.length === 0 && (
              <div className="ig-empty-feed">
                <h3>Share Music</h3>
                <p>When you share songs or photos, they appear here.</p>
                <button className="ig-cta-btn" onClick={() => setActivePage('create')}>Create Post</button>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  )
}

export default Dashboard
