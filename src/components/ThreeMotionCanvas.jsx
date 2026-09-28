import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Three.js Interactive Background — wave particle lattice + starfield.
 * Scroll-driven reactions are intentionally subtle:
 *   - Gentle lattice tilt + wave speed change
 *   - Camera slow drift upward
 *   - Starfield slow roll + brightness boost
 * Everything stays legible and structured at all scroll positions.
 */

export default function ThreeMotionCanvas({ onOpeningComplete }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    if (onOpeningComplete) onOpeningComplete();

    // ─── Scene & Camera ─────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070c, 0.0016);

    const camera = new THREE.PerspectiveCamera(
      56,
      container.clientWidth / container.clientHeight,
      0.1,
      1200
    );
    camera.position.set(0, 4.5, 42);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // ─── Lighting ───────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x0d1527, 3.2));
    const cyanLight = new THREE.PointLight(0x38bdf8, 4.8, 95, 1.2);
    cyanLight.position.set(18, 16, 24);
    scene.add(cyanLight);
    const violetLight = new THREE.PointLight(0x818cf8, 4.2, 90, 1.2);
    violetLight.position.set(-18, -8, 20);
    scene.add(violetLight);

    // ─── Particle glow texture ──────────────────────────────────────────────
    const mkTex = () => {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0,    'rgba(255,255,255,1)');
      g.addColorStop(0.22, 'rgba(56,189,248,0.9)');
      g.addColorStop(0.62, 'rgba(129,140,248,0.35)');
      g.addColorStop(1,    'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(32, 32, 32, 0, Math.PI * 2); ctx.fill();
      return new THREE.CanvasTexture(c);
    };

    const colCyan   = new THREE.Color(0x38bdf8);
    const colIndigo = new THREE.Color(0x818cf8);
    const colWhite  = new THREE.Color(0xf0f9ff);

    // ─── Ambient starfield ──────────────────────────────────────────────────
    const SCNT = 340;
    const sPos  = new Float32Array(SCNT * 3);
    const sCols = new Float32Array(SCNT * 3);
    for (let k = 0; k < SCNT; k++) {
      sPos[k * 3]     = (Math.random() - 0.5) * 160;
      sPos[k * 3 + 1] = (Math.random() - 0.5) * 90;
      sPos[k * 3 + 2] = (Math.random() - 0.5) * 80;
      const c = Math.random() > 0.5 ? colCyan : colIndigo;
      sCols[k * 3] = c.r; sCols[k * 3 + 1] = c.g; sCols[k * 3 + 2] = c.b;
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    sGeo.setAttribute('color',    new THREE.BufferAttribute(sCols, 3));
    const sMat = new THREE.PointsMaterial({
      size: 0.75, map: mkTex(), vertexColors: true,
      transparent: true, opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const starField = new THREE.Points(sGeo, sMat);
    scene.add(starField);

    // ─── Mouse parallax ─────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / container.clientWidth)  * 2 - 1;
      mouse.ty = -((e.clientY - r.top) / container.clientHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove);

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // ─── Animation loop ──────────────────────────────────────────────────────
    let rafId;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const el = clock.getElapsedTime();

      // ── Mouse lerp ────────────────────────────────────────────────────────
      mouse.x += (mouse.tx - mouse.x) * 0.045;
      mouse.y += (mouse.ty - mouse.y) * 0.045;

      // ── Camera (Stable, steady framing with gentle mouse parallax) ────────
      camera.position.x += (mouse.x * 3.5 - camera.position.x) * 0.04;
      camera.position.y += ((4.5 + mouse.y * 2.0) - camera.position.y) * 0.04;
      camera.position.z += (42 - camera.position.z) * 0.04;
      camera.lookAt(0, 0.5, 0);

      // ── Starfield (Gentle continuous ambient drift) ─────────────────────────
      starField.rotation.y = el * 0.02;
      starField.rotation.x = Math.sin(el * 0.015) * 0.05;
      sMat.opacity = 0.72;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      sGeo.dispose();    sMat.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={mountRef}
      className="three-motion-canvas-container"
      aria-hidden="true"
    />
  );
}
