import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Compass, Menu, X } from 'lucide-react';
import './Navbar.css';

// Crisp SVG Icons for Instagram & LinkedIn
function InstagramIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function Navbar({ isVisible = true, onOpenJoinModal }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavClick = (e, targetId) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 150);
    }
  };

  return (
    <header className={`site-header ${isVisible ? 'header-visible' : 'header-hidden'}`}>
      <div className="navbar-container">
        {/* Left: Brand Logo & Company Name */}
        <div
          className="nav-brand"
          onClick={(e) => handleNavClick(e, 'hero')}
          style={{ cursor: 'pointer' }}
          title="FOSS Club Home"
        >
          <img
            src="/foss-logo.png"
            alt="FOSS Club Logo"
            className="brand-logo"
            draggable="false"
          />
          <div className="brand-name-stack">
            <span className="brand-foss">Foss</span>
            <span className="brand-club">Club</span>
          </div>
        </div>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="nav-center" aria-label="Main Navigation">
          <a
            href="#about"
            className="nav-link"
            onClick={(e) => handleNavClick(e, 'about')}
          >
            About
          </a>
          <Link
            to="/events"
            className={`nav-link ${location.pathname === '/events' ? 'active-nav-link' : ''}`}
          >
            Events
          </Link>
          <Link
            to="/placements"
            className={`nav-link ${location.pathname === '/placements' ? 'active-nav-link' : ''}`}
          >
            Placements
          </Link>
        </nav>

        {/* Right: Actions Group & Explore (Desktop only) */}
        <div className="nav-right">
          <div
            className={`explore-action-group ${isHovered ? 'is-active' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Popped out social icon buttons toward the left */}
            <div className="social-popover" aria-hidden={!isHovered}>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn instagram-btn"
                aria-label="Instagram"
                title="Instagram"
              >
                <InstagramIcon size={14} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn linkedin-btn"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <LinkedinIcon size={14} />
              </a>
            </div>

            {/* Explore Pill Button */}
            <button
              type="button"
              className="nav-explore-btn"
              onClick={(e) => handleNavClick(e, 'about')}
              aria-label="Explore"
            >
              <Compass size={15} className="btn-icon" />
              <span>Explore</span>
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Button (Mobile only) */}
        <button
          type="button"
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'is-active' : ''}`}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      <div className={`mobile-nav-drawer ${isMobileMenuOpen ? 'drawer-open' : ''}`}>
        <div className="mobile-nav-inner">
          <nav className="mobile-nav-links" aria-label="Mobile Navigation">
            <a
              href="#about"
              className="mobile-nav-link"
              onClick={(e) => handleNavClick(e, 'about')}
            >
              <span className="mobile-nav-num">01</span>
              <span className="mobile-nav-text">About</span>
            </a>
            <Link
              to="/events"
              className={`mobile-nav-link ${location.pathname === '/events' ? 'active-mobile-link' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mobile-nav-num">02</span>
              <span className="mobile-nav-text">Events</span>
            </Link>
            <Link
              to="/placements"
              className={`mobile-nav-link ${location.pathname === '/placements' ? 'active-mobile-link' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mobile-nav-num">03</span>
              <span className="mobile-nav-text">Placements</span>
            </Link>
          </nav>

          <div className="mobile-nav-footer">
            <span className="mobile-footer-label">Connect</span>
            <div className="mobile-social-row">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn instagram-btn"
                aria-label="Instagram"
              >
                <InstagramIcon size={16} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn linkedin-btn"
                aria-label="LinkedIn"
              >
                <LinkedinIcon size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
