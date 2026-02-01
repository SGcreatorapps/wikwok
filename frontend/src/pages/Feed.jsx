import { useState, useEffect, useRef, useCallback } from 'react';
import { videoAPI } from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import BottomNav from '../components/BottomNav';
// import Stories from '../components/Stories';
import './Feed.css';

const Feed = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cursor, setCursor] = useState(null);
  const containerRef = useRef(null);

  const fetchVideos = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await videoAPI.getFeed(cursor);
      console.log('Feed response:', response.data);
      setVideos(prev => cursor ? [...prev, ...response.data.videos] : response.data.videos);
      setCursor(response.data.nextCursor);
    } catch (err) {
      console.error('Failed to fetch videos:', err);
      setError(err.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, [cursor, loading]);

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const windowHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / windowHeight);
      
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }

      // Load more videos when near bottom
      if (scrollTop + windowHeight >= container.scrollHeight - windowHeight && cursor && !loading) {
        fetchVideos();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex, cursor, loading, fetchVideos]);

  return (
    <div className="feed-container" ref={containerRef}>
      {/* Debug Status Bar - Always Visible */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: '#ff2b5e',
        color: 'white',
        padding: '10px',
        zIndex: 9999,
        textAlign: 'center',
        fontSize: '14px'
      }}>
        {loading ? '⏳ Loading...' : ''}
        {error ? `❌ Error: ${error}` : ''}
        {!loading && !error ? `✅ ${videos.length} videos loaded` : ''}
      </div>

      {error && (
        <div style={{padding: '60px 20px 20px', color: 'red', textAlign: 'center'}}>
          Error: {error}
        </div>
      )}
      
      {!loading && videos.length === 0 && !error && (
        <div style={{padding: '80px 40px 40px', color: '#00ff41', textAlign: 'center'}}>
          <h2>No videos yet</h2>
          <p>Be the first to upload!</p>
        </div>
      )}

      <div className="videos-wrapper">
        {videos.map((video, index) => (
          <VideoPlayer
            key={video.id}
            video={video}
            isActive={index === currentIndex}
          />
        ))}
        {loading && <div className="loading-more">Loading...</div>}
      </div>
      <BottomNav />
    </div>
  );
};

export default Feed;
