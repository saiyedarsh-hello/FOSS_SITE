import React, { useState } from 'react';
import { LayeredText } from '@/components/ui/layered-text';
import { Sparkles, Layers, MousePointer } from 'lucide-react';
import './KineticManifesto.css';

const PRESET_LINES = {
  default: [
    { top: '\u00A0', bottom: 'INFINITE' },
    { top: 'INFINITE', bottom: 'PROGRESS' },
    { top: 'PROGRESS', bottom: 'INNOVATION' },
    { top: 'INNOVATION', bottom: 'FUTURE' },
    { top: 'FUTURE', bottom: 'DREAMS' },
    { top: 'DREAMS', bottom: 'ACHIEVEMENT' },
    { top: 'ACHIEVEMENT', bottom: '\u00A0' },
  ],
  libre: [
    { top: '\u00A0', bottom: 'OPEN SOURCE' },
    { top: 'OPEN SOURCE', bottom: 'INDEPENDENCE' },
    { top: 'INDEPENDENCE', bottom: 'BUILD IN PUBLIC' },
    { top: 'BUILD IN PUBLIC', bottom: 'SHIP UPSTREAM' },
    { top: 'SHIP UPSTREAM', bottom: 'COMMUNITY' },
    { top: 'COMMUNITY', bottom: 'LIBRE CODE' },
    { top: 'LIBRE CODE', bottom: '\u00A0' },
  ],
};

export default function KineticManifesto() {
  const [activeSet, setActiveSet] = useState('default');

  return (
    <section className="manifesto-section" id="manifesto">
      <div className="manifesto-bg-grid" />

      <div className="manifesto-container">
        <div className="manifesto-header">
          <h2 className="manifesto-title">
            Values in Motion. <span className="text-gradient-cyan">Isometric Reality.</span>
          </h2>

          <p className="manifesto-desc">
            A kinetic mechanical typography matrix powered by GSAP timeline interpolation.
            Move your cursor across the isometric layers to release the vertical parallax.
          </p>
        </div>

        <div className="manifesto-stage">
          <div className="stage-topbar">
            <div className="stage-meta">
              <Layers size={14} className="text-cyan" />
              <span>KINETIC MATRIX // GSAP 3D SKEW</span>
            </div>

            <div className="stage-tabs">
              <button
                type="button"
                className={`stage-tab-btn ${activeSet === 'default' ? 'is-active' : ''}`}
                onClick={() => setActiveSet('default')}
              >
                Core Horizon
              </button>
              <button
                type="button"
                className={`stage-tab-btn ${activeSet === 'libre' ? 'is-active' : ''}`}
                onClick={() => setActiveSet('libre')}
              >
                Libre Ethos
              </button>
            </div>
          </div>

          {/* LayeredText from @/components/ui/layered-text */}
          <LayeredText
            key={activeSet}
            lines={PRESET_LINES[activeSet]}
            fontSize="64px"
            fontSizeMd="32px"
            lineHeight={56}
            lineHeightMd={32}
            className="manifesto-layered-text"
          />

          <div className="stage-hint">
            <MousePointer size={12} className="text-cyan" />
            <span>HOVER OVER WORDS TO ENGAGE TIMELINE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
