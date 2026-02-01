import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Stories.css';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch stories from backend (placeholder for now)
    const mockStories = [
      { id: 1, username: 'user1', avatar: '', hasStory: true },
      { id: 2, username: 'user2', avatar: '', hasStory: true },
      { id: 3, username: 'user3', avatar: '', hasStory: false },
    ];
    setStories(mockStories);
  }, []);

  const handleStoryClick = (story) => {
    if (story.hasStory) {
      setActiveStory(story);
      setProgress(0);
      
      // Auto-advance progress
      if (progressRef.current) clearInterval(progressRef.current);
      progressRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressRef.current);
            setActiveStory(null);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
    } else {
      navigate(`/profile/${story.username}`);
    }
  };

  return (
    <div className="stories-container">
      <div className="stories-list">
        {/* Add Story Button */}
        <div className="story-item add-story">
          <div className="story-ring">
            <div className="story-avatar">
              <span>+</span>
            </div>
          </div>
          <span className="story-username">Add Story</span>
        </div>

        {/* User Stories */}
        {stories.map(story => (
          <div 
            key={story.id} 
            className={`story-item ${story.hasStory ? 'has-story' : ''}`}
            onClick={() => handleStoryClick(story)}
          >
            <div className={`story-ring ${story.hasStory ? 'active' : ''}`}>
              <div className="story-avatar">
                {story.avatar ? (
                  <img src={story.avatar} alt={story.username} />
                ) : (
                  <span>{story.username[0].toUpperCase()}</span>
                )}
              </div>
            </div>
            <span className="story-username">{story.username}</span>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="story-viewer" onClick={() => setActiveStory(null)}>
          <div className="story-progress">
            <div 
              className="story-progress-bar" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="story-content">
            <h3>@{activeStory.username}</h3>
            <p>Story content here...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;
