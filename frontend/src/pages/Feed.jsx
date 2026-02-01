import { useState, useEffect, useRef, useCallback } from 'react';
import { videoAPI } from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import BottomNav from '../components/BottomNav';
import Stories from '../components/Stories';
import './Feed.css';

const Feed = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cursor, setCursor] = useState(null);
  const containerRef = useRef(null);

  const fetchVideos = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await videoAPI.getFeed(cursor);
      setVideos(prev => cursor ? [...prev, ...response.data.videos] : response.data.videos);
      setCursor(response.data.nextCursor);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
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
      <Stories />
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
