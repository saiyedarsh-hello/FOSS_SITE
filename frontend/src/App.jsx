import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ThreeMotionCanvas from './components/ThreeMotionCanvas';
import ParticleLoader, { hasLoaderRun } from './components/ParticleLoader';
import FossEcosystem from './components/FossEcosystem';
import SmoothTextWriter from './components/SmoothTextWriter';
import AboutSection from './components/AboutSection';
import TeamSection from './components/TeamSection';
import KineticManifesto from './components/KineticManifesto';
import PlacementsDirectory from './components/PlacementsDirectory';
import EventsPage from './pages/EventsPage';
import {
  ArrowRight,
  Terminal,
  Users,
  X,
  Send,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import './App.css';

// ─── HomePage ─────────────────────────────────────────────────────────────────
function HomePage({ isSiteLoaded, onOpeningComplete, isJoinModalOpen, setIsJoinModalOpen }) {
  const [joinSubmitted, setJoinSubmitted] = useState(false);
  const [selectedRole, setSelectedRole]   = useState('developer');
  const [loaderDone, setLoaderDone]       = useState(() => hasLoaderRun());
  const heroReady = isSiteLoaded;

  // If loader already ran this session (SPA nav back), skip it immediately
  useEffect(() => {
    if (loaderDone && !isSiteLoaded) onOpeningComplete();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoaderComplete = () => {
    setLoaderDone(true);
    onOpeningComplete();
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    setJoinSubmitted(true);
    setTimeout(() => { setJoinSubmitted(false); setIsJoinModalOpen(false); }, 2400);
  };

  return (
    <div className={`app-motion-layout ${heroReady ? 'page-ready' : 'page-loading'}`}>
      {/* Particle Loader overlay — only on hard reload */}
      {!loaderDone && <ParticleLoader onComplete={handleLoaderComplete} />}

      {/* Persistent Interactive 3D Background Canvas */}
      <ThreeMotionCanvas onOpeningComplete={loaderDone ? onOpeningComplete : undefined} />
      <div className={`hero-depth-vignette ${heroReady ? 'elem-fade-in' : 'elem-hidden'}`} />

      {/* ─── Hero ─── */}
      <section className="motion-hero-section" id="hero">
        <div className="hero-content-wrapper">
          <div className="hero-split-grid">
            <div className={`hero-left-column ${heroReady ? 'hero-ready-in' : 'hero-waiting'}`}>
              <SmoothTextWriter shouldStart={heroReady} />
              <div className="hero-motion-actions">
                <a href="#about" className="motion-btn primary-glow">
                  <span>Explore Guild</span>
                  <ArrowRight size={16} />
                </a>
                <a
                  href="#leads"
                  className="motion-btn secondary-glass"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('leads')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Users size={16} />
                  <span>Explore Team</span>
                </a>
              </div>
            </div>
            <div className={`hero-ecosystem-column ${heroReady ? 'hero-ready-in' : 'hero-waiting'}`}>
              <FossEcosystem />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Content below hero ─── */}
      <div className={`content-below-hero ${heroReady ? 'elem-fade-in' : 'elem-hidden'}`}>
        <AboutSection />
        <TeamSection />
        <KineticManifesto />

        <footer className="motion-site-footer">
          <div className="section-container footer-inner">
            <div className="footer-left">
              <div className="footer-brand-title">
                <span className="footer-dot-pulse" />
                <span>FOSS CLUB // JAIN UNIVERSITY</span>
              </div>
              <p className="footer-copyright">
                © {new Date().getFullYear()} Free and Open Source Software Collective. Code in the open.
              </p>
            </div>
            <div className="footer-right">
              <div className="footer-links-row">
                <a href="/placements" className="footer-link">Placements</a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="footer-link">GitHub <ExternalLink size={12} /></a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="footer-link">LinkedIn <ExternalLink size={12} /></a>
                <a href="#hero" className="footer-link back-to-top">Top ↑</a>
              </div>
              <div className="footer-system-status">
                <span className="sys-status-indicator" />
                <span>All Systems Operational // Bangalore, India</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ─── Join Modal ─── */}
      {isJoinModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsJoinModalOpen(false)}>
          <div className="modal-glass-box" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close-btn" onClick={() => setIsJoinModalOpen(false)} aria-label="Close">
              <X size={18} />
            </button>
            {joinSubmitted ? (
              <div className="modal-success-screen">
                <CheckCircle2 size={48} className="text-cyan success-icon-spin" />
                <h3>Welcome to the Guild!</h3>
                <p>Your application has been registered. Check your inbox for Discord and GitHub invites.</p>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit} className="join-guild-form">
                <div className="form-header">
                  <span className="form-badge">JOIN FOSS CLUB</span>
                  <h2>Initiate Guild Membership</h2>
                  <p>Open to all students eager to code, build, and ship in public.</p>
                </div>
                <div className="form-input-group">
                  <label htmlFor="student-name">Full Name</label>
                  <input id="student-name" type="text" required placeholder="Linus Torvalds" className="form-text-input" />
                </div>
                <div className="form-input-group">
                  <label htmlFor="student-email">University / Personal Email</label>
                  <input id="student-email" type="email" required placeholder="student@jainuniversity.ac.in" className="form-text-input" />
                </div>
                <div className="form-input-group">
                  <label htmlFor="github-handle">GitHub Username</label>
                  <div className="input-prefix-wrap">
                    <span className="input-prefix">github.com/</span>
                    <input id="github-handle" type="text" required placeholder="octocat" className="form-text-input prefix-padding" />
                  </div>
                </div>
                <div className="form-input-group">
                  <label>Primary Area of Interest</label>
                  <div className="roles-selector-grid">
                    {[
                      { id: 'systems', label: 'Systems & Kernel' },
                      { id: 'web',     label: 'Web & WASM' },
                      { id: 'ai',      label: 'AI & Inference' },
                      { id: 'security',label: 'Cybersecurity' },
                    ].map((role) => (
                      <button key={role.id} type="button"
                        className={`role-option-btn ${selectedRole === role.id ? 'selected' : ''}`}
                        onClick={() => setSelectedRole(role.id)}
                      >{role.label}</button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="motion-btn primary-glow submit-full">
                  <span>Submit Membership Packet</span>
                  <Send size={15} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isSiteLoaded, setIsSiteLoaded]       = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // On hard reload redirect to '/' so loader + hero always play first
  useEffect(() => {
    const navEntry = performance.getEntriesByType('navigation')[0];
    const navType  = navEntry?.type;
    if ((navType === 'reload' || navType === 'navigate') && location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isNavbarVisible = isSiteLoaded || location.pathname !== '/';

  return (
    <div className="app-root-shell">
      <Navbar isVisible={isNavbarVisible} onOpenJoinModal={() => setIsJoinModalOpen(true)} />
      <Routes>
        <Route path="/" element={
          <HomePage
            isSiteLoaded={isSiteLoaded}
            onOpeningComplete={() => setIsSiteLoaded(true)}
            isJoinModalOpen={isJoinModalOpen}
            setIsJoinModalOpen={setIsJoinModalOpen}
          />
        } />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/placements" element={<PlacementsDirectory onBackToHome={() => navigate('/')} />} />
      </Routes>
    </div>
  );
}
