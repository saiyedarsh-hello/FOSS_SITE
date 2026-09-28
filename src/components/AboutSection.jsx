import React from 'react';
import './About.css';

const PILLARS = [
  {
    id: 'learn-build',
    tag: '01 // FOUNDATION',
    title: 'Learn, Build & Contribute',
    summary: 'Master modern toolchains, explore systems programming, and ship production-ready open-source software.',
  },
  {
    id: 'workshops',
    tag: '02 // SESSIONS',
    title: 'Workshops & Tech Sessions',
    summary: 'Architecture walkthroughs, deep-dive technical sessions, and learning how open-source software works.',
  },
  {
    id: 'hackathons',
    tag: '03 // INNOVATION',
    title: 'Hackathons & Innovation',
    summary: 'Collaborative coding sprints turning creative prototypes into functional repositories with real-world impact.',
  },
  {
    id: 'community',
    tag: '04 // COMMUNITY',
    title: 'Community',
    summary: 'A community where students learn, collaborate, build real-world projects, and grow together through open-source technology.',
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="about-editorial-section">
      <div className="about-editorial-container">

        {/* ── Title Header ── */}
        <div className="about-editorial-header">
          <h2 className="about-editorial-title">
            About<span className="about-title-accent">.</span>
          </h2>
        </div>

        {/* ── Narrative Details Directly Below About ── */}
        <div className="about-narrative-block">
          <p className="about-lead-statement">
            FOSS is a community where students come together to learn, build, and contribute to open-source projects.
          </p>
          <p className="about-body-statement">
            The club encourages collaboration, coding, innovation, and knowledge sharing through workshops, hackathons, technical sessions, and real-world projects. It also helps students understand how open-source software works and gives them opportunities to contribute to projects used by developers around the world.
          </p>
        </div>

        {/* ── Clean Editorial Grid (No Box Divs, Pure Typography & Separation Lines) ── */}
        <div className="about-editorial-grid">
          {PILLARS.map((item) => (
            <div key={item.id} className="about-editorial-cell">
              <span className="about-editorial-tag">{item.tag}</span>
              <h3 className="about-editorial-heading">{item.title}</h3>
              <p className="about-editorial-desc">{item.summary}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
