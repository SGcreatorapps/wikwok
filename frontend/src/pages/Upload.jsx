import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';
import BottomNav from '../components/BottomNav';
import './Upload.css';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('caption', caption);

    try {
      await videoAPI.upload(formData);
      navigate('/');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-content">
        <h1>Upload Video</h1>
        
        {!preview ? (
          <div className="file-input-wrapper">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              id="video-input"
            />
            <label htmlFor="video-input" className="file-label">
              <div className="upload-icon">+</div>
              <p>Select a video to upload</p>
            </label>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="upload-form">
            <video src={preview} controls className="video-preview" />
            <textarea
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
            />
            <div className="upload-actions">
              <button type="button" onClick={() => { setFile(null); setPreview(null); }}>
                Cancel
              </button>
              <button type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Post'}
              </button>
            </div>
          </form>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Upload;
