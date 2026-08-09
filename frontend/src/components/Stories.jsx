import './Stories.css'

function Stories({ email }) {
  // Fake stories data for UI (in real app, fetch from API)
  const stories = [
    { id: 'yours', name: 'Your story', avatar: email?.[0]?.toUpperCase(), isYours: true, hasStory: false },
    { id: 1, name: 'music_vibes', avatar: '🎵', hasStory: true },
    { id: 2, name: 'dj_beats', avatar: '🎧', hasStory: true },
    { id: 3, name: 'rock_fan', avatar: '🎸', hasStory: true },
    { id: 4, name: 'jazz_soul', avatar: '🎷', hasStory: true },
    { id: 5, name: 'piano_keys', avatar: '🎹', hasStory: true },
    { id: 6, name: 'drum_loop', avatar: '🥁', hasStory: true },
    { id: 7, name: 'bass_drop', avatar: '🔊', hasStory: true },
  ]

  return (
    <div className="stories-container">
      <div className="stories-scroll">
        {stories.map(story => (
          <div key={story.id} className="story-item">
            <div className={`story-ring ${story.hasStory ? 'has-story' : ''} ${story.isYours ? 'yours' : ''}`}>
              <div className="story-avatar">
                <span>{story.avatar}</span>
              </div>
              {story.isYours && !story.hasStory && (
                <div className="story-add">+</div>
              )}
            </div>
            <span className="story-name">{story.isYours ? 'Your story' : story.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Stories
