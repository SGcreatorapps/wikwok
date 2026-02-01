import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <Home size={28} />
        <span>Home</span>
      </Link>
      
      <Link to="/upload" className="nav-item upload-btn">
        <PlusSquare size={32} />
      </Link>
      
      <Link 
        to={user ? `/profile/${user.username}` : '/login'} 
        className={`nav-item ${location.pathname.includes('/profile') ? 'active' : ''}`}
      >
        <User size={28} />
        <span>Profile</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
