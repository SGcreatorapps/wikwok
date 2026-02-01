import { useState, useEffect } from 'react';
import { X, Plus, Smartphone, Monitor } from 'lucide-react';
import './InstallPrompt.css';

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    // Don't show on PC
    if (!checkMobile) return;

    // Check if already installed or dismissed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;
    const isDismissed = localStorage.getItem('installPromptDismissed') === 'true';
    
    if (isInstalled || isDismissed) return;

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS - show prompt after 3 seconds if not installed
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !isInstalled) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User installed the app');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('installPromptDismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt || !isMobile) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="install-prompt-overlay">
      <div className="install-prompt">
        <button className="close-btn" onClick={handleDismiss}>
          <X size={20} />
        </button>
        
        <div className="prompt-icon">
          <Smartphone size={48} className="neon-text" />
        </div>
        
        <h2 className="neon-text">Add to Home Screen</h2>
        
        {isIOS ? (
          <div className="ios-instructions">
            <p>Tap the <strong>Share</strong> button</p>
            <p>Then tap <strong>Add to Home Screen</strong></p>
            <div className="arrow-down">↓</div>
          </div>
        ) : (
          <>
            <p>Install WikiWok on your phone for the best experience!</p>
            <button className="install-btn neon-border" onClick={handleInstall}>
              <Plus size={20} />
              Install App
            </button>
          </>
        )}
        
        <p className="hint">Quick access • Works offline • Full screen</p>
      </div>
    </div>
  );
};

export default InstallPrompt;
