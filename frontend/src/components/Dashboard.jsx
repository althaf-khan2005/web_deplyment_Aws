import './Dashboard.css'
import Navbar from './Navbar'
import MusicStory from './MusicStory'
import PostCreate from './PostCreate'
import { useState, useEffect, useRef } from 'react'
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
  const [playingPost, setPlayingPost] = useState(null)
  const [stories, setStories] = useState([])
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const audioRef = useRef(null)

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

  const fetchPosts = async () => { try { const r = await axios.get(`${API_URL}/api/posts`, getAuthHeader()); setPosts(r.data) } catch(e){} finally { setLoadingPosts(false) } }
  const fetchMyPosts = async () => { try { const r = await axios.get(`${API_URL}/api/posts/me`, getAuthHeader()); setMyPosts(r.data) } catch(e){} }
  const fetchMyProfile = async () => { try { const r = await axios.get(`${API_URL}/api/users/me`, getAuthHeader()); setMyProfile(r.data) } catch(e){} }
  const fetchStories = async () => { try { const r = await axios.get(`${API_URL}/api/stories`, getAuthHeader()); setStories(r.data) } catch(e){} }
  const deletePost = async (id) => { try { await axios.delete(`${API_URL}/api/posts/${id}`, getAuthHeader()); setPosts(p=>p.filter(x=>x.id!==id)); setMyPosts(p=>p.filter(x=>x.id!==id)) } catch(e){} }
  const deleteStory = async (id) => { try { await axios.delete(`${API_URL}/api/stories/${id}`, getAuthHeader()); fetchStories() } catch(e){} }
  const toggleLike = (id) => { setLikedPosts(p => { const n = new Set(p); n.has(id)?n.delete(id):n.add(id); return n }) }
  const searchUsers = async (q) => { setSearchQuery(q); if(q.length<2){setSearchResults([]);return}; try{const r=await axios.get(`${API_URL}/api/users/search?q=${q}`,getAuthHeader());setSearchResults(r.data)}catch(e){} }
  const viewUserProfile = async (username) => { try{const r=await axios.get(`${API_URL}/api/users/${username}`,getAuthHeader());setViewingUser(r.data);setActivePage('viewProfile')}catch(e){} }
  const followUser = async (id) => { try{await axios.post(`${API_URL}/api/follow/${id}`,{},getAuthHeader());if(viewingUser)setViewingUser({...viewingUser,isFollowing:true})}catch(e){} }
  const unfollowUser = async (id) => { try{await axios.delete(`${API_URL}/api/follow/${id}`,getAuthHeader());if(viewingUser)setViewingUser({...viewingUser,isFollowing:false})}catch(e){} }
  const togglePrivacy = async () => { try{const r=await axios.put(`${API_URL}/api/users/me`,{isPublic:!myProfile.isPublic},getAuthHeader());setMyProfile({...myProfile,...r.data})}catch(e){} }

  const togglePlay = (postId, audioSrc) => {
    if (playingPost === postId) { audioRef.current?.pause(); setPlayingPost(null) }
    else { if(audioRef.current){audioRef.current.pause();audioRef.current.src=audioSrc;audioRef.current.play()}; setPlayingPost(postId) }
  }

  // Songs page - scroll to change song
  const songPosts = posts.filter(p => p.audio)
  const nextSong = () => { if (currentSongIndex < songPosts.length - 1) { setCurrentSongIndex(prev => prev + 1); const next = songPosts[currentSongIndex + 1]; if(next) togglePlay(next.id, next.audio) } }
  const prevSong = () => { if (currentSongIndex > 0) { setCurrentSongIndex(prev => prev - 1); const prev2 = songPosts[currentSongIndex - 1]; if(prev2) togglePlay(prev2.id, prev2.audio) } }

  useEffect(() => { fetchPosts(); fetchMyPosts(); fetchMyProfile(); fetchStories() }, [])
  const handlePostCreated = () => { fetchPosts(); fetchMyPosts(); setActivePage('home') }
  const timeAgo = (d) => { const s=Math.floor((Date.now()-new Date(d))/1000); if(s<60)return'now';if(s<3600)return`${Math.floor(s/60)}m`;if(s<86400)return`${Math.floor(s/3600)}h`;return`${Math.floor(s/86400)}d` }
  const gradients = ['linear-gradient(135deg,#667eea,#764ba2)','linear-gradient(135deg,#f093fb,#f5576c)','linear-gradient(135deg,#4facfe,#00f2fe)','linear-gradient(135deg,#43e97b,#38f9d7)','linear-gradient(135deg,#fa709a,#fee140)','linear-gradient(135deg,#a18cd1,#fbc2eb)']

  return (
    <>
      <Navbar activePage={activePage} setActivePage={setActivePage} onLogout={onLogout} email={email} />
      <audio ref={audioRef} onEnded={() => setPlayingPost(null)} />

      <main className="ig-main">
        {/* HOME - Feed */}
        {activePage === 'home' && (
          <div className="ig-feed">
            <MusicStory email={email} stories={stories} onStoryPosted={fetchStories} onDeleteStory={deleteStory} />

            {posts.map((post, i) => (
              <article key={post.id} className="ig-post">
                <div className="ig-post-header">
                  <div className="ig-post-avatar-ring" style={{background:gradients[i%6]}}><div className="ig-post-avatar">{(post.user.username||post.user.email)[0].toUpperCase()}</div></div>
                  <div className="ig-post-user" onClick={()=>viewUserProfile(post.user.username)} style={{cursor:'pointer'}}>
                    <span className="ig-post-username">{post.user.username||post.user.email.split('@')[0]}</span>
                    <span className="ig-post-time-inline">{timeAgo(post.createdAt)}</span>
                  </div>
                  {post.user.email===email&&<button className="ig-post-delete" onClick={()=>deletePost(post.id)}>×</button>}
                </div>

                {post.image&&<div className="ig-post-media" onDoubleClick={()=>toggleLike(post.id)}><img src={post.image} alt=""/>{likedPosts.has(post.id)&&<div className="ig-heart-animation">❤️</div>}</div>}

                {post.audio&&(
                  <div className={`ig-song-card ${playingPost===post.id?'is-playing':''}`} style={{background:gradients[i%6]}} onClick={()=>togglePlay(post.id,post.audio)}>
                    <div className="ig-song-content">
                      <div className={`ig-song-disc ${playingPost===post.id?'spinning':''}`}>🎵</div>
                      <div className="ig-song-info"><span className="ig-song-title">{post.audioName||post.caption||'Untitled'}</span><span className="ig-song-artist">{post.user.username||post.user.email.split('@')[0]}</span></div>
                      <div className="ig-song-play-btn">{playingPost===post.id?<svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>:<svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21"/></svg>}</div>
                    </div>
                    {playingPost===post.id&&<div className="ig-song-waves">{Array.from({length:20}).map((_,j)=><div key={j} className="ig-wave-bar" style={{animationDelay:`${j*0.05}s`}}></div>)}</div>}
                  </div>
                )}

                <div className="ig-post-actions">
                  <div className="ig-actions-left">
                    <button className={`ig-action-btn ${likedPosts.has(post.id)?'liked':''}`} onClick={()=>toggleLike(post.id)}><svg width="24" height="24" viewBox="0 0 24 24" fill={likedPosts.has(post.id)?'#ed4956':'none'} stroke={likedPosts.has(post.id)?'#ed4956':'currentColor'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></button>
                    <button className="ig-action-btn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></button>
                    <button className="ig-action-btn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
                  </div>
                  <button className="ig-action-btn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg></button>
                </div>
                {post.caption&&<div className="ig-post-caption"><span className="ig-caption-user">{post.user.username||post.user.email.split('@')[0]}</span> {post.caption}</div>}
              </article>
            ))}
            {!loadingPosts&&posts.length===0&&<div className="ig-empty-feed"><h3>Welcome to MusicGram</h3><p>Share your first post</p><button className="ig-cta-btn" onClick={()=>setActivePage('create')}>Create</button></div>}
          </div>
        )}

        {/* SEARCH */}
        {activePage === 'search' && (
          <div className="ig-explore">
            <div className="ig-search-bar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="Search" value={searchQuery} onChange={(e)=>searchUsers(e.target.value)}/></div>
            {searchResults.length>0&&<div className="ig-search-results">{searchResults.map(u=><div key={u.id} className="ig-search-user" onClick={()=>viewUserProfile(u.username)}><div className="ig-search-avatar">{u.username[0].toUpperCase()}</div><div className="ig-search-info"><span className="ig-search-username">{u.username}</span><span className="ig-search-bio">{u._count.posts} posts • {u.isPublic?'Public':'Private'}</span></div></div>)}</div>}
            {searchQuery.length<2&&<div className="ig-explore-grid">{posts.map((p,i)=><div key={p.id} className="ig-explore-item">{p.image?<img src={p.image} alt=""/>:<div className="ig-explore-audio" style={{background:gradients[i%6]}}><span>🎵</span></div>}</div>)}</div>}
          </div>
        )}

        {/* SONGS - Like Reels, full screen swipe */}
        {activePage === 'songs' && (
          <div className="ig-songs-page">
            {songPosts.length === 0 ? (
              <div className="ig-empty-feed"><h3>No Songs Yet</h3><p>Share a song to see it here</p></div>
            ) : (
              <div className="ig-song-reel" style={{background: gradients[currentSongIndex % 6]}}>
                <div className="ig-reel-content">
                  <div className={`ig-reel-disc ${playingPost === songPosts[currentSongIndex]?.id ? 'spinning' : ''}`}>🎵</div>
                  <h2 className="ig-reel-title">{songPosts[currentSongIndex]?.audioName || songPosts[currentSongIndex]?.caption || 'Untitled'}</h2>
                  <p className="ig-reel-artist">{songPosts[currentSongIndex]?.user?.username || 'Unknown'}</p>

                  {playingPost === songPosts[currentSongIndex]?.id && (
                    <div className="ig-reel-waves">{Array.from({length:30}).map((_,j)=><div key={j} className="ig-wave-bar" style={{animationDelay:`${j*0.04}s`}}></div>)}</div>
                  )}

                  <button className="ig-reel-play" onClick={() => togglePlay(songPosts[currentSongIndex].id, songPosts[currentSongIndex].audio)}>
                    {playingPost === songPosts[currentSongIndex]?.id ? (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                    ) : (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21"/></svg>
                    )}
                  </button>
                </div>

                {/* Swipe up/down for next/prev */}
                <div className="ig-reel-nav">
                  <button onClick={prevSong} disabled={currentSongIndex===0}>↑ Prev</button>
                  <span>{currentSongIndex+1} / {songPosts.length}</span>
                  <button onClick={nextSong} disabled={currentSongIndex===songPosts.length-1}>↓ Next</button>
                </div>

                {/* Side actions */}
                <div className="ig-reel-actions">
                  <button onClick={()=>toggleLike(songPosts[currentSongIndex]?.id)}><svg width="28" height="28" viewBox="0 0 24 24" fill={likedPosts.has(songPosts[currentSongIndex]?.id)?'#ed4956':'none'} stroke={likedPosts.has(songPosts[currentSongIndex]?.id)?'#ed4956':'#fff'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></button>
                  <button><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></button>
                  <button><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MESSAGES */}
        {activePage === 'messages' && (
          <div className="ig-messages">
            <h2>Messages</h2>
            <p className="ig-msg-subtitle">Coming soon — stay tuned!</p>
            <div className="ig-msg-empty">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              <p>Your messages will appear here</p>
            </div>
          </div>
        )}

        {/* CREATE */}
        {activePage === 'create' && <div className="ig-create-page"><PostCreate onPostCreated={handlePostCreated} /></div>}

        {/* VIEW USER PROFILE */}
        {activePage === 'viewProfile' && viewingUser && (
          <div className="ig-profile">
            <div className="ig-profile-header">
              <div className="ig-profile-avatar-ring"><div className="ig-profile-avatar-big">{viewingUser.username[0].toUpperCase()}</div></div>
              <div className="ig-profile-info">
                <div className="ig-profile-top"><h2>{viewingUser.username}</h2>{!viewingUser.isOwnProfile&&(viewingUser.isFollowing?<button className="ig-unfollow-btn" onClick={()=>unfollowUser(viewingUser.id)}>Following</button>:<button className="ig-follow-btn" onClick={()=>followUser(viewingUser.id)}>Follow</button>)}</div>
                <div className="ig-profile-stats"><div className="ig-stat"><strong>{viewingUser._count.posts}</strong> posts</div><div className="ig-stat"><strong>{viewingUser._count.followers}</strong> followers</div><div className="ig-stat"><strong>{viewingUser._count.following}</strong> following</div></div>
                {!viewingUser.isPublic&&!viewingUser.isFollowing&&!viewingUser.isOwnProfile&&<p className="ig-private-label">🔒 This account is private</p>}
              </div>
            </div>
            {viewingUser.posts?.length>0&&<div className="ig-profile-grid">{viewingUser.posts.map((p,i)=><div key={p.id} className="ig-grid-item">{p.image?<img src={p.image} alt=""/>:<div className="ig-grid-audio" style={{background:gradients[i%6]}}><span>🎵</span></div>}</div>)}</div>}
            <button className="ig-back-link" onClick={()=>setActivePage('search')}>← Back</button>
          </div>
        )}

        {/* MY PROFILE */}
        {activePage === 'profile' && (
          <div className="ig-profile">
            <div className="ig-profile-header">
              <div className="ig-profile-avatar-ring"><div className="ig-profile-avatar-big">{(myProfile?.username||email)[0].toUpperCase()}</div></div>
              <div className="ig-profile-info">
                <div className="ig-profile-top"><h2>{myProfile?.username||email.split('@')[0]}</h2><button className="ig-edit-btn" onClick={togglePrivacy}>{myProfile?.isPublic?'🌐 Public':'🔒 Private'}</button></div>
                <div className="ig-profile-stats"><div className="ig-stat"><strong>{myPosts.length}</strong> posts</div><div className="ig-stat"><strong>{myProfile?._count?.followers||0}</strong> followers</div><div className="ig-stat"><strong>{myProfile?._count?.following||0}</strong> following</div></div>
                <p className="ig-bio-text">{myProfile?.bio||'🎵 Music lover'}</p>
              </div>
            </div>
            <div className="ig-profile-grid">{myPosts.map((p,i)=><div key={p.id} className="ig-grid-item" onClick={()=>deletePost(p.id)}>{p.image?<img src={p.image} alt=""/>:<div className="ig-grid-audio" style={{background:gradients[i%6]}}><span>🎵</span></div>}<div className="ig-grid-overlay">🗑️</div></div>)}</div>
            {myPosts.length===0&&<div className="ig-empty-feed"><h3>No Posts Yet</h3><button className="ig-cta-btn" onClick={()=>setActivePage('create')}>Share</button></div>}
          </div>
        )}
      </main>
    </>
  )
}

export default Dashboard
