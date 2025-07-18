import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePost } from "../../context/PostContext";
import { useDebounce } from "../../hooks/useApi";
import "./Header.css";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { fetchPosts } = usePost();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  React.useEffect(() => {
    if (debouncedSearchTerm) {
      fetchPosts({ search: debouncedSearchTerm });
    } else {
      fetchPosts();
    }
  }, [debouncedSearchTerm, fetchPosts]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchPosts({ search: searchTerm.trim() });
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <h1>BlogApp</h1>
          </Link>
        </div>

        <div className="header-center">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              🔍
            </button>
          </form>
        </div>

        <div className="header-right">
          <nav className={`nav ${isMenuOpen ? "nav-open" : ""}`}>
            <Link to="/" className="nav-link">
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/create-post" className="nav-link">
                  Write
                </Link>
                <div className="user-menu">
                  <button
                    className="user-button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="user-avatar"
                      />
                    ) : (
                      <div className="user-avatar-placeholder">
                        {user?.firstName?.charAt(0)}
                        {user?.lastName?.charAt(0)}
                      </div>
                    )}
                    <span>{user?.username}</span>
                  </button>

                  {isMenuOpen && (
                    <div className="user-dropdown">
                      <Link to="/profile" className="dropdown-item">
                        Profile
                      </Link>
                      <Link to="/create-post" className="dropdown-item">
                        Write Post
                      </Link>
                      <button onClick={handleLogout} className="dropdown-item">
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="nav-link btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
