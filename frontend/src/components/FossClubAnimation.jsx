import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './FossClubAnimation.css';

/**
 * FossClubAnimation - Cyber-Graffiti Kinetic Typography
 * - Matches site theme: Electric Cyan, Neon Teal, Deep Cobalt & Cyber Violet
 * - 100% transparent backdrop (zero container boxes, zero faint white borders)
 * - Single-play GSAP Wildstyle entry slam (no loop)
 * - High-energy GSAP interactive magnetic hover & wave reaction
 */
export default function FossClubAnimation({
  autoplay = true,
  className = '',
  onAnimationComplete,
}) {
  const containerRef = useRef(null);
  const charsRef = useRef([]);
  const chromasRef = useRef([]);

  const word1 = ['F', 'O', 'S', 'S'];
  const word2 = ['C', 'L', 'U', 'B'];

  // Total characters: 8
  charsRef.current = [];
  chromasRef.current = [];

  const addToChars = (el) => {
    if (el && !charsRef.current.includes(el)) {
      charsRef.current.push(el);
    }
  };

  const addToChromas = (el) => {
    if (el && !chromasRef.current.includes(el)) {
      chromasRef.current.push(el);
    }
  };

  // Entrance slam animation (runs once when autoplay / shouldStart is true)
  useEffect(() => {
    if (!autoplay) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const chars = charsRef.current;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(chars, { opacity: 1, scale: 1, y: 0, rotateZ: 0 });
        return;
      }

      // Initial graffiti tag-in state: elevated, angled, scaled up like a street stencil stamp
      gsap.set(chars, {
        opacity: 0,
        y: 50,
        scale: 1.35,
        rotateZ: (i) => (i % 2 === 0 ? 12 : -10),
        transformOrigin: '50% 100%',
        filter: 'blur(6px)',
      });

      // Wildstyle Slam entrance timeline
      const tl = gsap.timeline({
        delay: 0.1,
        onComplete: onAnimationComplete,
      });

      tl.to(chars, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateZ: 0,
        filter: 'blur(0px)',
        duration: 0.85,
        ease: 'back.out(2.2)',
        stagger: {
          each: 0.05,
          from: 'start',
        },
      });

      // Chromatic spray burst that snaps tight on impact
      const chromas = chromasRef.current;
      tl.fromTo(
        chromas,
        { opacity: 0.8, x: (i) => (i % 2 === 0 ? 6 : -6), y: 4 },
        {
          opacity: 0,
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.04,
        },
        '-=0.6'
      );
    }, containerRef);

    return () => ctx.revert();
  }, [autoplay, onAnimationComplete]);

  // GSAP Interactive Magnetic Hover
  const handleMouseMove = (e, index) => {
    const el = charsRef.current[index];
    const chroma = chromasRef.current[index];
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    // Target letter magnetic lift & 3D tilt
    gsap.to(el, {
      x: relX * 8,
      y: relY * 8 - 12,
      scale: 1.16,
      rotateZ: relX * 12,
      rotateY: relX * 18,
      rotateX: -relY * 18,
      duration: 0.25,
      ease: 'power2.out',
      overwrite: 'auto',
    });

    if (chroma) {
      gsap.to(chroma, {
        x: relX * 5 + 3,
        y: relY * 5 + 2,
        opacity: 0.85,
        duration: 0.2,
        overwrite: 'auto',
      });
    }

    // Ripple to adjacent letters (graffiti dynamic chain reaction)
    const prev = charsRef.current[index - 1];
    const next = charsRef.current[index + 1];
    if (prev) {
      gsap.to(prev, {
        y: -5,
        rotateZ: -4,
        duration: 0.3,
        ease: 'power1.out',
        overwrite: 'auto',
      });
    }
    if (next) {
      gsap.to(next, {
        y: -5,
        rotateZ: 4,
        duration: 0.3,
        ease: 'power1.out',
        overwrite: 'auto',
      });
    }
  };

  const handleMouseLeave = (index) => {
    const el = charsRef.current[index];
    const chroma = chromasRef.current[index];
    if (!el) return;

    // Smooth elastic spring back to rest
    gsap.to(el, {
      x: 0,
      y: 0,
      scale: 1,
      rotateZ: 0,
      rotateY: 0,
      rotateX: 0,
      duration: 0.75,
      ease: 'elastic.out(1.2, 0.4)',
      overwrite: 'auto',
    });

    if (chroma) {
      gsap.to(chroma, {
        x: 0,
        y: 0,
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    const prev = charsRef.current[index - 1];
    const next = charsRef.current[index + 1];
    if (prev) {
      gsap.to(prev, { y: 0, rotateZ: 0, duration: 0.6, ease: 'elastic.out(1.2, 0.4)' });
    }
    if (next) {
      gsap.to(next, { y: 0, rotateZ: 0, duration: 0.6, ease: 'elastic.out(1.2, 0.4)' });
    }
  };

  const renderLetter = (char, index) => (
    <span
      key={index}
      className="graffiti-char-wrapper"
      onMouseMove={(e) => handleMouseMove(e, index)}
      onMouseLeave={() => handleMouseLeave(index)}
    >
      <span
        ref={addToChars}
        className="graffiti-char-core"
        data-char={char}
      >
        {/* Chromatic Spray Offset Layer (Active during hover & slam) */}
        <span
          ref={addToChromas}
          className="graffiti-layer-chroma"
          aria-hidden="true"
        >
          {char}
        </span>

        {/* 3D Graffiti Block Shadow Layer */}
        <span className="graffiti-layer-block" aria-hidden="true">
          {char}
        </span>

        {/* Main Front Letter: Chrome / Electric Cyan / Teal Street Fill */}
        <span className="graffiti-layer-fill">{char}</span>
      </span>
    </span>
  );

  return (
    <div
      ref={containerRef}
      className={`cyber-graffiti-stage ${className}`}
      aria-label="FOSS CLUB"
    >
      <div className="graffiti-title-track">
        {/* Line 1: FOSS */}
        <div className="graffiti-word word-foss" aria-hidden="true">
          {word1.map((c, i) => renderLetter(c, i))}
        </div>

        {/* Line 2: CLUB (Stacked below FOSS) */}
        <div className="graffiti-word word-club" aria-hidden="true">
          {word2.map((c, i) => renderLetter(c, i + 4))}
        </div>
      </div>
    </div>
  );
}
