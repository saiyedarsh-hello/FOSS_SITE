import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Users, GitBranch, Compass } from "lucide-react";
import "./FeatureCarousel.css";

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

// Real copy confirmed against FOSS Club specifications
const FEATURES = [
  {
    id: "shipping",
    label: "Learn by Shipping",
    icon: Terminal,
    description:
      "Workshops and teardowns built around real, running code — not slides. You leave every session having broken and fixed something yourself.",
    meta: "12 sessions/yr",
  },
  {
    id: "community",
    label: "Community Over Competition",
    icon: Users,
    description:
      "Hackathons here are collaborative by design. The person next to you debugging the same error is the whole point of showing up in person.",
    meta: "6 hackathons/yr",
  },
  {
    id: "public",
    label: "Public by Default",
    icon: GitBranch,
    description:
      "Every contribution goes upstream, in the open, mistakes included. A half-broken PR pushed today teaches more than a polished one hidden until graduation.",
    meta: "100+ PRs merged",
  },
  {
    id: "mentorship",
    label: "Mentorship, Not Hierarchy",
    icon: Compass,
    description:
      "Seniors don't gatekeep — they pair. Every track (Linux/Systems, Web/WASM, AI, Security) has someone one step ahead willing to walk it with you.",
    meta: "4 active tracks",
  },
];

const AUTO_PLAY_INTERVAL = 4000;
const ITEM_HEIGHT = 65;

const wrap = (min, max, v) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export function FeatureCarousel() {
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentIndex =
    ((step % FEATURES.length) + FEATURES.length) % FEATURES.length;

  const nextStep = useCallback(() => setStep((prev) => prev + 1), []);

  const handleChipClick = (index) => {
    const diff = (index - currentIndex + FEATURES.length) % FEATURES.length;
    if (diff > 0) setStep((s) => s + diff);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextStep, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextStep, isPaused]);

  const getCardStatus = (index) => {
    const diff = index - currentIndex;
    const len = FEATURES.length;
    let normalizedDiff = diff;
    if (diff > len / 2) normalizedDiff -= len;
    if (diff < -len / 2) normalizedDiff += len;

    if (normalizedDiff === 0) return "active";
    if (normalizedDiff === -1) return "prev";
    if (normalizedDiff === 1) return "next";
    return "hidden";
  };

  return (
    <div className="feature-carousel-root w-full max-w-6xl mx-auto md:p-6">
      <div className="feature-carousel-card relative overflow-hidden rounded-[2rem] lg:rounded-[3rem] flex flex-col lg:flex-row min-h-[540px] lg:aspect-[16/8] border border-white/10 bg-[#0a0a0a]">
        {/* Left: label rail */}
        <div className="feature-rail w-full lg:w-[36%] min-h-[300px] lg:h-full relative z-30 flex flex-col items-start justify-center overflow-hidden px-8 lg:pl-14 bg-gradient-to-b from-[#0d1420] to-[#0a0f18]">
          <div className="rail-fade-top absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0a0f18] to-transparent z-40" />
          <div className="rail-fade-bottom absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0f18] to-transparent z-40" />

          <div className="rail-track relative w-full h-full flex items-center justify-start z-20">
            {FEATURES.map((feature, index) => {
              const distance = index - currentIndex;
              const wrappedDistance = wrap(
                -(FEATURES.length / 2),
                FEATURES.length / 2,
                distance
              );
              const isActive = index === currentIndex;
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.id}
                  style={{ height: ITEM_HEIGHT, width: "fit-content" }}
                  animate={{
                    y: wrappedDistance * ITEM_HEIGHT,
                    opacity: 1 - Math.abs(wrappedDistance) * 0.25,
                  }}
                  transition={{ type: "spring", stiffness: 90, damping: 22, mass: 1 }}
                  className="rail-item absolute flex items-center justify-start"
                >
                  <button
                    onClick={() => handleChipClick(index)}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className={cn(
                      "rail-chip relative flex items-center gap-3 px-6 py-3.5 rounded-full transition-all duration-500 text-left border font-mono",
                      isActive
                        ? "active bg-cyan-400 text-[#0a0f18] border-cyan-400 z-10"
                        : "bg-transparent text-white/50 border-white/15 hover:border-white/30 hover:text-white"
                    )}
                  >
                    <Icon size={16} strokeWidth={2} />
                    <span className="text-[13px] tracking-tight whitespace-nowrap">
                      {feature.label}
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: text-only card stack */}
        <div className="feature-stack-panel flex-1 min-h-[420px] lg:h-full relative flex items-center justify-center py-14 px-6 lg:px-14 overflow-hidden border-t lg:border-t-0 lg:border-l border-white/10 bg-[#0a0a0a]">
          {/* faint background grid texture */}
          <div
            className="stack-grid-bg absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="stack-container relative w-full max-w-[460px] aspect-[4/5] flex items-center justify-center">
            {FEATURES.map((feature, index) => {
              const status = getCardStatus(index);
              const isActive = status === "active";
              const isPrev = status === "prev";
              const isNext = status === "next";
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.id}
                  initial={false}
                  animate={{
                    x: isActive ? 0 : isPrev ? -100 : isNext ? 100 : 0,
                    scale: isActive ? 1 : isPrev || isNext ? 0.85 : 0.7,
                    opacity: isActive ? 1 : isPrev || isNext ? 0.35 : 0,
                    rotate: isPrev ? -4 : isNext ? 4 : 0,
                    zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 25, mass: 0.8 }}
                  className="stack-card absolute inset-0 rounded-[1.75rem] overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-sm origin-center flex flex-col justify-between p-8"
                >
                  {/* ghost index number, top-right */}
                  <span className="ghost-index-num absolute -top-4 -right-2 text-[9rem] font-black leading-none text-white/[0.04] select-none pointer-events-none">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* corner brackets for a "framed terminal" feel */}
                  <span className="corner-bracket-tl absolute top-5 left-5 w-3 h-3 border-t border-l border-cyan-400/40" />
                  <span className="corner-bracket-br absolute bottom-5 right-5 w-3 h-3 border-b border-r border-cyan-400/40" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="card-counter-badge flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-[10px] font-mono uppercase tracking-[0.2em]">
                        <Icon size={12} strokeWidth={2} />
                        0{index + 1} / 0{FEATURES.length}
                      </div>
                    </div>

                    <h3 className="card-title text-2xl md:text-3xl font-semibold text-white tracking-tight leading-tight mb-4">
                      {feature.label}
                    </h3>

                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.p
                          key={feature.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.4 }}
                          className="card-description text-white/60 text-[15px] leading-relaxed font-light"
                        >
                          {feature.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="card-footer relative z-10 flex items-center gap-2 text-[11px] font-mono text-cyan-400/80 uppercase tracking-[0.15em] pt-6 border-t border-white/10">
                    <span className="footer-dot w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {feature.meta}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeatureCarousel;
