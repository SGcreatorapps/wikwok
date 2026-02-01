import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';
import BottomNav from '../components/BottomNav';
import { Camera, Video, X, Loader2, Circle } from 'lucide-react';
import './Upload.css';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [storageNotice, setStorageNotice] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  const MAX_RECORDING_TIME = 60; // 60 seconds max

  // Check if mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    return () => {
      // Cleanup: stop camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Cannot access camera. Please make sure you have given permission.');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setFile(new File([blob], 'recorded-video.webm', { type: 'video/webm' }));
      setPreview(URL.createObjectURL(blob));
      setShowCamera(false);
      
      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
    
    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= MAX_RECORDING_TIME - 1) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const cancelCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
    setIsRecording(false);
    setRecordingTime(0);
    clearInterval(timerRef.current);
  };

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
      const response = await videoAPI.upload(formData);
      
      // Check if storage notice was returned (old video deleted)
      if (response.data.storageNotice) {
        setStorageNotice(response.data.storageNotice);
        // Show notice for 3 seconds then navigate
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload video');
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-content">
        <h1>Upload Video</h1>
        
        <div className="storage-disclaimer">
          <p>📱 <strong>Storage Policy:</strong> Maximum 100 videos per user. When you upload a new video and reach the limit, your oldest video will be automatically deleted to make room.</p>
        </div>

        {storageNotice && (
          <div className="storage-notice-alert">
            <p>⚠️ {storageNotice}</p>
            <p>Redirecting to home...</p>
          </div>
        )}
        
        {showCamera ? (
          <div className="camera-container">
            <div className="camera-header">
              <button onClick={cancelCamera} className="camera-close">
                <X size={24} />
              </button>
              {isRecording && (
                <div className="recording-indicator">
                  <Circle size={12} className="recording-dot" />
                  <span>{recordingTime}s / {MAX_RECORDING_TIME}s</span>
                </div>
              )}
            </div>
            
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="camera-preview"
            />
            
            <div className="camera-controls">
              {!isRecording ? (
                <button 
                  onClick={startRecording} 
                  className="record-btn"
                >
                  <Circle size={60} className="record-circle" />
                </button>
              ) : (
                <button 
                  onClick={stopRecording} 
                  className="stop-btn"
                >
                  <div className="stop-square" />
                </button>
              )}
            </div>
          </div>
        ) : !preview ? (
          <div className="upload-options">
            <div className="file-input-wrapper">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                id="video-input"
              />
              <label htmlFor="video-input" className="file-label">
                <Video size={40} className="upload-icon" />
                <p>Select Video</p>
              </label>
            </div>
            
            {isMobile && (
              <button onClick={startCamera} className="camera-btn">
                <Camera size={40} />
                <p>Record Video</p>
              </button>
            )}
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
