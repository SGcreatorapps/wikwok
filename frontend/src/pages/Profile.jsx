import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import BottomNav from '../components/BottomNav';
import { LogOut, Edit3, Camera, X, Loader2 } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: '', bio: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
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
        setEditForm({
          displayName: response.data.displayName || '',
          bio: response.data.bio || ''
        });
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

  const handleEditClick = () => {
    setIsEditing(true);
    setEditForm({
      displayName: profile.displayName || '',
      bio: profile.bio || ''
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const formData = new FormData();
      if (editForm.displayName) formData.append('displayName', editForm.displayName);
      if (editForm.bio !== undefined) formData.append('bio', editForm.bio);
      if (avatarFile) formData.append('avatar', avatarFile);

      const response = await userAPI.updateProfile(formData);
      
      // Update local state
      setProfile({ ...profile, ...response.data });
      
      // Update auth context
      updateUser(response.data);
      
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading"><Loader2 className="spin" size={32} /></div>;
  if (!profile) return <div className="loading">Profile not found</div>;

  const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
  
  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-large" onClick={isOwnProfile ? handleAvatarClick : undefined} style={isOwnProfile ? { cursor: 'pointer' } : {}}>
          {profile.avatar ? (
            <img src={getFullUrl(profile.avatar)} alt={profile.username} />
          ) : (
            <div className="default-avatar-large">{profile.username[0].toUpperCase()}</div>
          )}
          {isOwnProfile && (
            <div className="avatar-overlay">
              <Camera size={24} />
            </div>
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
              <button className="edit-btn" onClick={handleEditClick}>
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
      
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="edit-modal" onClick={() => setIsEditing(false)}>
          <div className="edit-modal-content" onClick={e => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>Edit Profile</h3>
              <button onClick={() => setIsEditing(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSaveProfile}>
              <div className="edit-avatar-section" onClick={handleAvatarClick}>
                <div className="edit-avatar-preview">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" />
                  ) : profile.avatar ? (
                    <img src={getFullUrl(profile.avatar)} alt={profile.username} />
                  ) : (
                    <div className="default-avatar-large">{profile.username[0].toUpperCase()}</div>
                  )}
                  <div className="avatar-change-overlay">
                    <Camera size={32} />
                    <span>Change Photo</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>

              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                  placeholder="Your display name"
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  placeholder="Tell us about yourself"
                  maxLength={150}
                  rows={3}
                />
                <span className="char-count">{editForm.bio?.length || 0}/150</span>
              </div>

              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? <><Loader2 className="spin" size={18} /> Saving...</> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
};

export default Profile;
