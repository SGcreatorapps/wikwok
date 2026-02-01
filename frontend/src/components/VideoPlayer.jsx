import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { videoAPI } from '../services/api';
import { Heart, MessageCircle, Share2, Music2, Volume2, VolumeX, Play, Pause, Trash2, Link2, Check } from 'lucide-react';
import './VideoPlayer.css';

const VideoPlayer = ({ video, isActive }) => {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive]);

  useEffect(() => {
    if (user && video.id) {
      checkLikeStatus();
    }
  }, [user, video.id]);

  const checkLikeStatus = async () => {
    try {
      const response = await videoAPI.checkLike(video.id);
      setLiked(response.data.liked);
    } catch (error) {}
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    try {
      const response = await videoAPI.like(video.id);
      setLiked(response.data.liked);
      setLikesCount(prev => response.data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  const loadComments = async () => {
    try {
      const response = await videoAPI.getComments(video.id);
      setComments(response.data.comments);
    } catch (error) {}
  };

  const toggleComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    try {
      const response = await videoAPI.addComment(video.id, newComment);
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?video=${video.id}`;
    
    if (navigator.share) {
      // Use native share on mobile
      try {
        await navigator.share({
          title: `Video by ${video.user.username}`,
          url: shareUrl
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await videoAPI.delete(video.id);
      // Refresh page or remove video from feed
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete video:', error);
      alert('Failed to delete video');
    }
  };

  const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
  
  // Helper to get full video URL (handles both Cloudinary and local URLs)
  const getVideoUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url; // Already a full URL (Cloudinary)
    return `${API_URL}${url}`; // Local URL, prepend API URL
  };

  const isOwner = user && user.id === video.user.id;

  return (
    <div className="video-container">
      <video
        ref={videoRef}
        src={getVideoUrl(video.videoUrl)}
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlay}
        className="video-element"
      />
      
      {!isPlaying && (
        <div className="play-overlay" onClick={togglePlay}>
          <Play size={64} />
        </div>
      )}

      <div className="video-controls">
        <button onClick={toggleMute} className="mute-button">
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>

      <div className="video-overlay">
        <div className="video-info">
          <div className="user-info">
            <span className="username">@{video.user.username}</span>
            <span className="display-name">{video.user.displayName}</span>
          </div>
          <p className="caption">{video.caption}</p>
          <div className="music-info">
            <Music2 size={16} />
            <span>Original Sound - {video.user.username}</span>
          </div>
        </div>

        <div className="action-buttons">
          <div className="action-button" onClick={handleLike}>
            <Heart 
              size={32} 
              className={liked ? 'liked' : ''}
              fill={liked ? '#ff2b5e' : 'none'}
              color={liked ? '#ff2b5e' : 'white'}
            />
            <span>{likesCount}</span>
          </div>
          
          <div className="action-button" onClick={toggleComments}>
            <MessageCircle size={32} />
            <span>{video.commentsCount || 0}</span>
          </div>
          
          <div className="action-button" onClick={handleShare}>
            {copied ? <Check size={32} color="#00ff00" /> : <Share2 size={32} />}
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </div>

          {isOwner && (
            <div className="action-button delete-btn" onClick={handleDelete}>
              <Trash2 size={32} />
              <span>Delete</span>
            </div>
          )}

          <div className="avatar-circle">
            {video.user.avatar ? (
              <img src={getVideoUrl(video.user.avatar)} alt={video.user.username} />
            ) : (
              <div className="default-avatar">{video.user.username[0].toUpperCase()}</div>
            )}
          </div>
        </div>
      </div>

      {showComments && (
        <div className="comments-modal" onClick={() => setShowComments(false)}>
          <div className="comments-content" onClick={e => e.stopPropagation()}>
            <div className="comments-header">
              <h3>{video.commentsCount || 0} comments</h3>
              <button onClick={() => setShowComments(false)}>×</button>
            </div>
            
            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment.id} className="comment">
                  <div className="comment-avatar">
                    {comment.user.avatar ? (
                      <img src={getVideoUrl(comment.user.avatar)} alt={comment.user.username} />
                    ) : (
                      <div className="default-avatar">{comment.user.username[0].toUpperCase()}</div>
                    )}
                  </div>
                  <div className="comment-content">
                    <span className="comment-username">@{comment.user.username}</span>
                    <p>{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {user && (
              <form className="comment-form" onSubmit={submitComment}>
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                />
                <button type="submit" disabled={!newComment.trim()}>Post</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
