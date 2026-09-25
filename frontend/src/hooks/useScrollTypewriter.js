// useScrollTypewriter.js
// Small, dependency-free hook: types out one or more text segments
// in sequence, but only once the referenced element enters the
// viewport — so it fires on scroll-into-view, not on page load.
// If your codebase already has a typing utility inside
// InteractiveTerminal.jsx, prefer reusing that instead of this file;
// this is a standalone fallback.

import { useEffect, useRef, useState } from "react";

/**
 * @param {string[]} segments - text pieces to type in order, e.g.
 *   ["$ cat /etc/foss/philosophy.txt", "> Code in the open..."]
 * @param {number} speed - ms per character
 * @param {number} pauseBetween - ms pause between segments
 */
export function useScrollTypewriter(segments, { speed = 28, pauseBetween = 350, threshold = 0.2 } = {}) {
  const ref = useRef(null);
  const [displayed, setDisplayed] = useState(segments.map(() => ""));
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      setDisplayed(segments);
      setDone(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            runTypewriter();
            observer.disconnect();
          }
        });
      },
      { threshold }
    );
    observer.observe(node);

    async function runTypewriter() {
      for (let segIndex = 0; segIndex < segments.length; segIndex++) {
        const segment = segments[segIndex];
        for (let charIndex = 1; charIndex <= segment.length; charIndex++) {
          await new Promise((r) => setTimeout(r, speed));
          setDisplayed((prev) => {
            const next = [...prev];
            next[segIndex] = segment.slice(0, charIndex);
            return next;
          });
        }
        if (segIndex < segments.length - 1) {
          await new Promise((r) => setTimeout(r, pauseBetween));
        }
      }
      setDone(true);
    }

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, displayed, done };
}
