import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import BottomNav from '../components/BottomNav';
import { Search, Loader2, User } from 'lucide-react';
import './Search.css';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setUsers([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        // Search users by username
        const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
        setUsers(response.data.users || []);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="search-container">
      <div className="search-header">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
            autoFocus
          />
          {query && (
            <button className="clear-btn" onClick={() => setQuery('')}>
              ×
            </button>
          )}
        </div>
      </div>

      <div className="search-results">
        {loading ? (
          <div className="search-loading">
            <Loader2 className="spin" size={32} />
          </div>
        ) : query.length >= 2 ? (
          users.length > 0 ? (
            <div className="users-list">
              {users.map(user => (
                <Link to={`/profile/${user.username}`} key={user.id} className="user-item">
                  <div className="user-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} />
                    ) : (
                      <div className="default-avatar">
                        <User size={24} />
                      </div>
                    )}
                  </div>
                  <div className="user-info">
                    <span className="username">@{user.username}</span>
                    <span className="display-name">{user.displayName}</span>
                    {user.bio && <span className="bio">{user.bio}</span>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No users found</p>
              <span>Try searching with a different username</span>
            </div>
          )
        ) : (
          <div className="search-placeholder">
            <Search size={48} className="placeholder-icon" />
            <p>Search for users</p>
            <span>Type at least 2 characters</span>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default SearchPage;
