// AboutSection.jsx
// Layout:
//   Top Row    = Manifesto story on left + Terminal philosophy on right
//   Bottom Row = FeatureCarousel (text-only 3D spring stack with interactive label rail)

import React from "react";
import { aboutSection } from "../data/mockData";
import { useScrollTypewriter } from "../hooks/useScrollTypewriter";
import FeatureCarousel from "./FeatureCarousel";
import "./About.css";

export default function AboutSection() {
  // Terminal philosophy typewriter
  const { ref: terminalRef, displayed: terminalDisplayed } = useScrollTypewriter(
    [`$ cat /etc/foss/${aboutSection.terminal.filename}`, `> ${aboutSection.terminal.output}`],
    { speed: 26, pauseBetween: 350, threshold: 0.2 }
  );

  return (
    <section id="about" className="about-section">
      {/* ── Top Row: Manifesto & Terminal ─────────────────────────────────── */}
      <div className="about-top-grid">
        {/* Left Column: Understated Editorial Typography & Specs */}
        <div className="about-text">
          <div className="about-text-top">
            <h2 className="about-heading">
              About <span className="heading-highlight">FOSS Club</span>
            </h2>

            <p className="about-mission">
              We&apos;re the open-source community under{" "}
              <span className="text-highlight-white">Software Engineering at Jain University</span>.
              No syllabus, no tutorials-only mindset &mdash; you learn by opening a terminal,
              cloning a repo, and getting your hands dirty on things that{" "}
              <span className="text-highlight-subtle">ship to real users</span>.
            </p>
          </div>

          <div className="about-editorial-meta">
            <div className="meta-col">
              <span className="meta-label">CODEBASE</span>
              <span className="meta-value">100% Libre Code</span>
            </div>
            <div className="meta-sep" />
            <div className="meta-col">
              <span className="meta-label">POLICY</span>
              <span className="meta-value">Zero Gatekeeping</span>
            </div>
            <div className="meta-sep" />
            <div className="meta-col">
              <span className="meta-label">WORKFLOW</span>
              <span className="meta-value">Upstream PRs First</span>
            </div>
          </div>
        </div>

        {/* Right Column: Terminal Block */}
        <div className="about-terminal-container">
          <div className="about-terminal" ref={terminalRef}>
            <div className="terminal-chrome">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
              <span className="terminal-tab">{aboutSection.terminal.filename}</span>
            </div>
            <div className="terminal-body">
              <div className="terminal-line">{terminalDisplayed[0]}</div>
              <div className="terminal-line terminal-output">
                {terminalDisplayed[1]}
                <span className="terminal-cursor" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: FeatureCarousel (Core Tracks & Ethos) ─────────────── */}
      <div className="about-carousel-wrap">
        <FeatureCarousel />
      </div>
    </section>
  );
}
