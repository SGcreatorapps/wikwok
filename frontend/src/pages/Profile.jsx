import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import BottomNav from '../components/BottomNav';
import { LogOut, Edit3 } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isOwnProfile = !username || username === currentUser?.username;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const targetUsername = username || currentUser?.username;
        if (!targetUsername) {
          navigate('/login');
          return;
        }
        const response = await userAPI.getUser(targetUsername);
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, currentUser, navigate]);

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      const response = await userAPI.follow(profile.id);
      setProfile({ ...profile, isFollowing: response.data.following });
    } catch (error) {
      console.error('Failed to follow:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!profile) return <div className="loading">Profile not found</div>;

  const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
  
  // Helper to get full URL (handles both Cloudinary and local URLs)
  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-large">
          {profile.avatar ? (
            <img src={getFullUrl(profile.avatar)} alt={profile.username} />
          ) : (
            <div className="default-avatar-large">{profile.username[0].toUpperCase()}</div>
          )}
        </div>
        
        <h2 className="profile-username">@{profile.username}</h2>
        <p className="profile-display-name">{profile.displayName}</p>
        
        {profile.bio && <p className="profile-bio">{profile.bio}</p>}
        
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-value">{profile.videosCount || 0}</span>
            <span className="stat-label">Videos</span>
          </div>
          <div className="stat">
            <span className="stat-value">{profile.followersCount || 0}</span>
            <span className="stat-label">Followers</span>
          </div>
          <div className="stat">
            <span className="stat-value">{profile.followingCount || 0}</span>
            <span className="stat-label">Following</span>
          </div>
        </div>

        <div className="profile-actions">
          {isOwnProfile ? (
            <>
              <button className="edit-btn">
                <Edit3 size={18} />
                Edit Profile
              </button>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button 
              className={`follow-btn ${profile.isFollowing ? 'following' : ''}`}
              onClick={handleFollow}
            >
              {profile.isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      <div className="profile-videos">
        <h3>Videos</h3>
        {profile.videos?.length === 0 ? (
          <p className="no-videos">No videos yet</p>
        ) : (
          <div className="videos-grid">
            {profile.videos?.map(video => (
              <Link to={`/?video=${video.id}`} key={video.id} className="video-thumb">
                <video src={getFullUrl(video.videoUrl)} />
                <div className="video-thumb-overlay">
                  <span>{video.likesCount || 0} likes</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Profile;
