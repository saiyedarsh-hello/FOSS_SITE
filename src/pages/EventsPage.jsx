import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Send,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CONSOLIDATED_EVENTS, enrichEventForDisplay } from '../utils/eventUtils';
import './EventsPage.css';

const CATEGORIES = [
  'ALL',
  'WORKSHOPS & SDP',
  'HACKATHONS',
  'CHALLENGES',
  'COMMUNITY',
];

const CARD_WIDTH = 250;
const CARD_GAP = 20;
const STEP = CARD_WIDTH + CARD_GAP; // 270px
const CYCLE_COUNT = 31; // Render multiple cycles for infinite continuous looping

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedEventForModal, setSelectedEventForModal] = useState(null);
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Drag interaction states
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const dragDistanceRef = useRef(0);

  // Extract all photos for the selected modal event
  const modalEventPhotos = useMemo(() => {
    if (!selectedEventForModal) return [];
    const list = [];
    if (Array.isArray(selectedEventForModal.photos) && selectedEventForModal.photos.length > 0) {
      selectedEventForModal.photos.forEach((p) => {
        if (p && !list.includes(p)) list.push(p);
      });
    }
    if (selectedEventForModal.image_url && !list.includes(selectedEventForModal.image_url)) {
      list.push(selectedEventForModal.image_url);
    }
    if (list.length === 0 && selectedEventForModal.fallbackImage) {
      list.push(selectedEventForModal.fallbackImage);
    }
    return list;
  }, [selectedEventForModal]);

  // Lock body scroll when modal or lightbox is open
  useEffect(() => {
    if (selectedEventForModal || activeLightboxImg) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [selectedEventForModal, activeLightboxImg]);

  // Master events normalized
  const enrichedEvents = useMemo(() => {
    return CONSOLIDATED_EVENTS.map((evt, idx) => enrichEventForDisplay(evt, idx));
  }, []);

  // Filter based on selected category
  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'ALL') return enrichedEvents;
    if (selectedCategory === 'WORKSHOPS & SDP') {
      return enrichedEvents.filter(
        (e) =>
          (e.category && e.category.toLowerCase().includes('workshop')) ||
          (e.type && e.type.toLowerCase().includes('sdp')) ||
          (e.type && e.type.toLowerCase().includes('program'))
      );
    }
    if (selectedCategory === 'HACKATHONS') {
      return enrichedEvents.filter(
        (e) =>
          (e.title && e.title.toLowerCase().includes('hack')) ||
          (e.category && e.category.toLowerCase().includes('hackathon'))
      );
    }
    if (selectedCategory === 'CHALLENGES') {
      return enrichedEvents.filter(
        (e) =>
          (e.title && e.title.toLowerCase().includes('challenge')) ||
          (e.title && e.title.toLowerCase().includes('quiz')) ||
          (e.category && e.category.toLowerCase().includes('challenge'))
      );
    }
    if (selectedCategory === 'COMMUNITY') {
      return enrichedEvents.filter(
        (e) =>
          (e.category && e.category.toLowerCase().includes('community')) ||
          (e.category && e.category.toLowerCase().includes('orientation')) ||
          (e.category && e.category.toLowerCase().includes('induction'))
      );
    }
    return enrichedEvents;
  }, [enrichedEvents, selectedCategory]);

  const eventCount = filteredEvents.length || 1;
  const initialVirtualIndex = Math.floor(CYCLE_COUNT / 2) * eventCount;
  const [virtualIndex, setVirtualIndex] = useState(initialVirtualIndex);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);

  // Reset to center cycle whenever category changes
  useEffect(() => {
    const centerIdx = Math.floor(CYCLE_COUNT / 2) * eventCount;
    setIsTransitionEnabled(false);
    setVirtualIndex(centerIdx);
    setDragOffset(0);
    const timeout = setTimeout(() => {
      setIsTransitionEnabled(true);
    }, 50);
    return () => clearTimeout(timeout);
  }, [selectedCategory, eventCount]);

  // Derived real index
  const realIndex = ((virtualIndex % eventCount) + eventCount) % eventCount;
  const activeEvent = filteredEvents[realIndex] || filteredEvents[0];

  // Infinite cycle boundary auto-recenter
  useEffect(() => {
    const lowerBound = 3 * eventCount;
    const upperBound = (CYCLE_COUNT - 3) * eventCount;

    if (virtualIndex < lowerBound || virtualIndex > upperBound) {
      const normalizedOffset = ((virtualIndex % eventCount) + eventCount) % eventCount;
      const recenteredIndex = Math.floor(CYCLE_COUNT / 2) * eventCount + normalizedOffset;

      // Silently jump without animation
      const timer = setTimeout(() => {
        setIsTransitionEnabled(false);
        setVirtualIndex(recenteredIndex);
        setTimeout(() => {
          setIsTransitionEnabled(true);
        }, 50);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [virtualIndex, eventCount]);

  // Infinite list of cards
  const infiniteCards = useMemo(() => {
    const list = [];
    for (let c = 0; c < CYCLE_COUNT; c++) {
      for (let i = 0; i < filteredEvents.length; i++) {
        const globalIdx = c * filteredEvents.length + i;
        list.push({
          globalIdx,
          realIdx: i,
          item: filteredEvents[i],
        });
      }
    }
    return list;
  }, [filteredEvents]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setIsTransitionEnabled(true);
    setVirtualIndex((prev) => prev - 1);
  }, []);

  const handleNext = useCallback(() => {
    setIsTransitionEnabled(true);
    setVirtualIndex((prev) => prev + 1);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeLightboxImg) {
        if (e.key === 'Escape') setActiveLightboxImg(null);
        return;
      }
      if (selectedEventForModal) {
        if (e.key === 'Escape') setSelectedEventForModal(null);
        return;
      }
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Enter') {
        if (activeEvent) {
          setSelectedEventForModal(activeEvent);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, selectedEventForModal, activeEvent]);

  // Handle card click: if active, open modal; if inactive, glide to center
  const handleCardClick = (globalIdx, item) => {
    // If dragged noticeably, ignore click
    if (Math.abs(dragDistanceRef.current) > 8) return;

    if (globalIdx === virtualIndex) {
      setSelectedEventForModal(item);
    } else {
      setIsTransitionEnabled(true);
      setVirtualIndex(globalIdx);
    }
  };

  // Mouse / Touch Dragging for fluid reel interaction
  const handleMouseDown = (e) => {
    if (selectedEventForModal) return;
    setIsDragging(true);
    setDragStartX(e.clientX || (e.touches && e.touches[0].clientX) || 0);
    dragDistanceRef.current = 0;
    setIsTransitionEnabled(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const diff = currentX - dragStartX;
    dragDistanceRef.current = diff;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsTransitionEnabled(true);

    const threshold = 60; // minimum drag distance in px to advance card
    if (dragOffset < -threshold) {
      const steps = Math.min(3, Math.max(1, Math.round(-dragOffset / STEP)));
      setVirtualIndex((prev) => prev + steps);
    } else if (dragOffset > threshold) {
      const steps = Math.min(3, Math.max(1, Math.round(dragOffset / STEP)));
      setVirtualIndex((prev) => prev - steps);
    }
    setDragOffset(0);
  };

  const handleRsvpSubmit = (e) => {
    e.preventDefault();
    setRsvpSubmitted(true);
    setTimeout(() => {
      setRsvpSubmitted(false);
      setRsvpEmail('');
      setSelectedEventForModal(null);
    }, 2200);
  };

  // Pixel offset for track centering
  // Center of card `virtualIndex` is at `virtualIndex * STEP + CARD_WIDTH / 2`.
  // To place that center at `left: 50%`, translateX = -(virtualIndex * STEP + CARD_WIDTH / 2) + dragOffset
  const trackTranslateX = -(virtualIndex * STEP + CARD_WIDTH / 2) + dragOffset;

  return (
    <div
      className="brandhub-events-page"
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
    >
      {/* ─── Top Brand & Navigation Bar ───────────────────────────────────── */}
      <header className="brandhub-top-bar">
        <Link to="/" className="brandhub-brand-name">
          FOSSCLUB
        </Link>


        {/* Home / Back on Far Right */}
        <Link to="/" className="brandhub-contact-link">
          HOME
        </Link>
      </header>

      {/* ─── Middle Card Showcase Track ────────────────────────────────────── */}
      <main
        className="brandhub-stage"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
      >
        {/* Floating Active Card Top Label */}
        {activeEvent && (
          <div className="active-card-top-kicker">
            <span className="kicker-index">
              {String(realIndex + 1).padStart(2, '0')}.
            </span>
            <span className="kicker-title">
              {activeEvent.cardTitle || activeEvent.title}
            </span>
          </div>
        )}

        {/* The Carousel Track Viewport */}
        <div className="brandhub-carousel-viewport">
          <div
            className="brandhub-carousel-track"
            style={{
              transform: `translateX(${trackTranslateX}px)`,
              transition: isTransitionEnabled
                ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                : 'none',
            }}
          >
            {infiniteCards.map(({ globalIdx, realIdx, item }) => {
              const isActive = globalIdx === virtualIndex;
              const formattedNum = String(realIdx + 1).padStart(2, '0');

              return (
                <div
                  key={`${globalIdx}-${item.id}`}
                  className={`brandhub-card ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleCardClick(globalIdx, item)}
                  title={isActive ? 'Click to view full details' : `Focus on ${item.cardTitle || item.title}`}
                >
                  <div className="card-inner-surface">
                    {/* Top Row: Micro Index & Upcoming Badge ONLY (No Archive text) */}
                    <div className="card-top-meta">
                      <span className="card-number">{formattedNum}</span>
                      {item.status === 'Upcoming' && (
                        <span className="card-status-badge is-upcoming">UPCOMING</span>
                      )}
                    </div>

                    {/* Center: The Name of the Event (No Images) */}
                    <div className="card-body-content">
                      <h3 className="card-event-name">
                        {item.cardTitle || item.title}
                      </h3>
                      {isActive && (
                        <span className="card-click-hint">CLICK FOR DETAILS ↗</span>
                      )}
                    </div>

                    {/* Bottom: Academic Year / Date */}
                    <div className="card-bottom-meta">
                      <span className="card-date-tag">
                        {item.academic_year || item.date}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Left & Right Arrow Controls */}
        <div className="brandhub-nav-controls">
          <button
            type="button"
            className="brandhub-arrow-btn"
            onClick={handlePrev}
            aria-label="Previous event"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="brandhub-arrow-btn"
            onClick={handleNext}
            aria-label="Next event"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </main>

      {/* ─── Bottom Brand Bar ─────────────────────────────────────────────── */}
      <footer className="brandhub-bottom-bar">
        {/* Bottom Left: Huge Bold Typography */}
        <div className="brandhub-bottom-left">
          <h1 className="brandhub-headline">OUREVENTS</h1>
        </div>
      </footer>

      {/* ─── Event Details Modal (Matching Swiss Black & White UI) ─────────── */}
      {selectedEventForModal && (
        <div
          className="brandhub-details-backdrop"
          onClick={() => setSelectedEventForModal(null)}
        >
          <div
            className="brandhub-details-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Top Chrome */}
            <div className="modal-top-chrome">
              <div className="modal-kicker">
                <span className="kicker-dot" />
                <span>EVENT DOSSIER // {selectedEventForModal.id.toUpperCase()}</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedEventForModal(null)}
                aria-label="Close details"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="modal-scroll-body">
              {/* Event Title Header */}
              <div className="modal-title-section">
                <span className="modal-category-badge">
                  {selectedEventForModal.type || selectedEventForModal.category}
                </span>
                <h2 className="modal-event-title">
                  {selectedEventForModal.title}
                </h2>
                <div className="modal-meta-grid">
                  <div className="meta-tile">
                    <Calendar size={14} className="meta-icon" />
                    <div>
                      <span className="meta-label">DATE</span>
                      <span className="meta-val">{selectedEventForModal.date}</span>
                    </div>
                  </div>
                  {selectedEventForModal.time && (
                    <div className="meta-tile">
                      <Clock size={14} className="meta-icon" />
                      <div>
                        <span className="meta-label">TIME</span>
                        <span className="meta-val">{selectedEventForModal.time}</span>
                      </div>
                    </div>
                  )}
                  <div className="meta-tile">
                    <MapPin size={14} className="meta-icon" />
                    <div>
                      <span className="meta-label">VENUE</span>
                      <span className="meta-val">{selectedEventForModal.venue || 'FET, Jain University'}</span>
                    </div>
                  </div>
                  <div className="meta-tile">
                    <Sparkles size={14} className="meta-icon" />
                    <div>
                      <span className="meta-label">STATUS</span>
                      <span className={`meta-val ${selectedEventForModal.status === 'Upcoming' ? 'text-accent' : ''}`}>
                        {selectedEventForModal.status === 'Upcoming' ? 'REGISTRATIONS OPEN' : 'ARCHIVED RECORD'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Narrative Overview */}
              <div className="modal-section-block">
                <h4 className="section-kicker">OVERVIEW</h4>
                <p className="modal-narrative-text">
                  {selectedEventForModal.description || selectedEventForModal.desc}
                </p>
              </div>

              {/* Session Objectives (if available) */}
              {selectedEventForModal.objectives && selectedEventForModal.objectives.length > 0 && (
                <div className="modal-section-block">
                  <h4 className="section-kicker">CORE OBJECTIVES & LEARNINGS</h4>
                  <ul className="modal-objectives-list">
                    {selectedEventForModal.objectives.map((obj, i) => (
                      <li key={i}>
                        <span className="obj-number">0{i + 1}</span>
                        <span className="obj-text">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Curriculum Breakdown (if available) */}
              {selectedEventForModal.curriculum && selectedEventForModal.curriculum.length > 0 && (
                <div className="modal-section-block">
                  <h4 className="section-kicker">SYLLABUS & TIMELINE</h4>
                  <div className="modal-curriculum-list">
                    {selectedEventForModal.curriculum.map((week, idx) => (
                      <div key={idx} className="curriculum-item">
                        <span className="curriculum-tag">{week.week}</span>
                        <div className="curriculum-content">
                          <h5 className="curriculum-title">{week.title}</h5>
                          <p className="curriculum-desc">{week.description}</p>
                          {week.date && <span className="curriculum-date">{week.date}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights & Institutional Outcomes */}
              {selectedEventForModal.outcomes && (
                <div className="modal-section-block">
                  <h4 className="section-kicker">INSTITUTIONAL OUTCOME</h4>
                  <blockquote className="modal-quote">
                    "{selectedEventForModal.outcomes}"
                  </blockquote>
                </div>
              )}

              {/* ─── Gallery Section (Photographs & Visual Archive) ───────── */}
              {modalEventPhotos.length > 0 && (
                <div className="modal-section-block modal-gallery-block">
                  <div className="gallery-header-row">
                    <div>
                      <h4 className="section-kicker">PHOTO ARCHIVE & EVENT GALLERY</h4>
                      <p className="gallery-section-desc">
                        Official visual captures and session records from FET, Jain University.
                      </p>
                    </div>
                    <span className="gallery-count-badge">
                      {modalEventPhotos.length} {modalEventPhotos.length === 1 ? 'PHOTOGRAPH' : 'PHOTOGRAPHS'}
                    </span>
                  </div>

                  <div className={`modal-gallery-grid ${modalEventPhotos.length === 1 ? 'is-single-photo' : ''}`}>
                    {modalEventPhotos.map((imgSrc, pIdx) => (
                      <div
                        key={pIdx}
                        className="modal-gallery-item"
                        onClick={() => setActiveLightboxImg(imgSrc)}
                        title="Click to expand photograph"
                      >
                        <img
                          src={imgSrc}
                          alt={`${selectedEventForModal.title} photograph ${pIdx + 1}`}
                          className="modal-gallery-img"
                          loading="lazy"
                        />
                        <div className="gallery-hover-overlay">
                          <span className="gallery-zoom-text">EXPAND ↗</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Area: Registration / Archive Seal */}
              <div className="modal-action-footer">
                {selectedEventForModal.status === 'Upcoming' ? (
                  <form onSubmit={handleRsvpSubmit} className="modal-rsvp-form">
                    <div className="rsvp-header">
                      <span className="rsvp-title">CLAIM ATTENDEE ACCESS PASS</span>
                      <span className="rsvp-subtitle">Open to all students of Jain University. Free entry.</span>
                    </div>
                    <div className="rsvp-input-bar">
                      <input
                        type="email"
                        required
                        placeholder="Enter your university or personal email..."
                        value={rsvpEmail}
                        onChange={(e) => setRsvpEmail(e.target.value)}
                        className="rsvp-email-input"
                      />
                      <button type="submit" className="rsvp-submit-btn">
                        <span>CONFIRM RSVP</span>
                        <Send size={14} />
                      </button>
                    </div>
                    {rsvpSubmitted && (
                      <div className="rsvp-success-banner">
                        ✓ Registration confirmed for {rsvpEmail || 'attendee'}. Credentials & access code dispatched.
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="modal-archive-badge">
                    <span className="archive-seal-dot" />
                    <span>AUTHENTICATED RECORD • FACULTY OF ENGINEERING & TECHNOLOGY (FET)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Lightbox Modal for Full Image Expansion ─────────────────────── */}
      {activeLightboxImg && (
        <div
          className="brandhub-lightbox-overlay"
          onClick={() => setActiveLightboxImg(null)}
        >
          <div className="lightbox-frame" onClick={(e) => e.stopPropagation()}>
            <img src={activeLightboxImg} alt="Enlarged capture" className="lightbox-media" />
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setActiveLightboxImg(null)}
              aria-label="Close image"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
