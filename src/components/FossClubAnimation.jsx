import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './FossClubAnimation.css';

/**
 * FossClubAnimation — Editorial Split Typography
 * - FOSS (outlined/stroke) + CLUB (gradient fill) side by side on one line
 * - Word-clip slide-up reveal on load (modern editorial motion)
 * - Shimmer scan line sweeps across after reveal
 * - GSAP magnetic hover with chromatic aberration per letter
 */
export default function FossClubAnimation({
  autoplay = true,
  className = '',
  onAnimationComplete,
}) {
  const containerRef  = useRef(null);
  const charsRef = useRef([]);
  const dividerRef = useRef(null);

  const word1 = ['F', 'O', 'S', 'S'];
  const word2 = ['C', 'L', 'U', 'B'];

  charsRef.current = [];

  const addToChars = (el) => { if (el && !charsRef.current.includes(el)) charsRef.current.push(el); };

  // ── Entrance: word-clip slide-up reveal ──────────────────────────────────
  useEffect(() => {
    if (!autoplay) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const chars = charsRef.current; // 8 letter cores

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(chars, { opacity: 1, y: 0 });
        gsap.set(dividerRef.current, { opacity: 1 });
        return;
      }

      // Fade-up entrance (no clip needed — clean and works with overflow:visible)
      gsap.set(chars, { y: 40, opacity: 0 });
      gsap.set(dividerRef.current, { opacity: 0, scaleY: 0, transformOrigin: 'bottom center' });

      const tl = gsap.timeline({ delay: 0.05, onComplete: onAnimationComplete });

      // FOSS letters fade up (staggered)
      tl.to(chars.slice(0, 4), {
        y: 0,
        opacity: 1,
        duration: 0.85,
        ease: 'power4.out',
        stagger: { each: 0.06, from: 'start' },
      });

      // CLUB letters fade up slightly offset
      tl.to(chars.slice(4), {
        y: 0,
        opacity: 1,
        duration: 0.85,
        ease: 'power4.out',
        stagger: { each: 0.06, from: 'start' },
      }, '-=0.68');

      // Divider snaps in after both words
      tl.to(dividerRef.current, {
        opacity: 1,
        scaleY: 1,
        duration: 0.4,
        ease: 'back.out(2)',
      }, '-=0.55');
    }, containerRef);

    return () => ctx.revert();
  }, [autoplay, onAnimationComplete]);

  const renderLetter = (char, index, wordType) => (
    <span key={index} className={`graffiti-char-wrapper char-${wordType}`}>
      <span ref={addToChars} className="graffiti-char-core" data-char={char}>
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
        {/* FOSS word */}
        <div className="graffiti-word-clip">
          <div className="graffiti-word word-foss" aria-hidden="true">
            {word1.map((c, i) => renderLetter(c, i, 'foss'))}
          </div>
        </div>

        {/* Minimalist Futuristic Divider */}
        <span ref={dividerRef} className="graffiti-word-divider" aria-hidden="true" />

        {/* CLUB word */}
        <div className="graffiti-word-clip">
          <div className="graffiti-word word-club" aria-hidden="true">
            {word2.map((c, i) => renderLetter(c, i + 4, 'club'))}
          </div>
        </div>
      </div>
    </div>
  );
}
