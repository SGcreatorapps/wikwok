import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, User, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <Home size={24} />
        <span>Home</span>
      </Link>
      
      <Link to="/search" className={`nav-item ${location.pathname === '/search' ? 'active' : ''}`}>
        <Search size={24} />
        <span>Search</span>
      </Link>
      
      <Link to="/upload" className="nav-item upload-btn">
        <div className="upload-circle">
          <PlusSquare size={28} />
        </div>
      </Link>
      
      <Link 
        to={user ? `/profile/${user.username}` : '/login'} 
        className={`nav-item ${location.pathname.includes('/profile') ? 'active' : ''}`}
      >
        <User size={24} />
        <span>Profile</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
