import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './FossGlobe.css';

/**
 * FossGlobe - 3D Holographic Particle Globe with Geodesic Wireframe
 * Features:
 *  - Responsive scroll transition:
 *    • Hero: Sits on the side (right column), upright, compact spherical form.
 *    • About: Glides smoothly to the center (middle), scales up, and tilts forward
 *      into the orbital panoramic horizon angle matching the reference image.
 *  - Geodesic Icosahedron triangulated wireframe cage
 *  - High-density landmass point cloud with highlighted illuminated coastlines
 *  - Dynamic atmospheric Fresnel corona with vibrant horizon limb glow
 *  - Solid dark inner occluding core for realistic 3D depth and mass
 *  - Global FOSS contributor hub beacons with animated radar pulse rings
 *  - Silky-smooth 3D dragging with inertia & continuous slow axial rotation
 */

function createPointTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.2, 'rgba(240, 245, 255, 0.95)');
  grad.addColorStop(0.5, 'rgba(192, 132, 252, 0.45)');
  grad.addColorStop(0.8, 'rgba(56, 189, 248, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(32, 32, 32, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function FossGlobe() {
  const mountRef = useRef(null);
  const [activeHub, setActiveHub] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const globeGroupRef = useRef(null);
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const hubMeshesRef = useRef([]);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // ─── Scene & Camera ──────────────────────────────────────────────────
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 2000);
    camera.position.set(0, 0, 320);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ─── Master Globe Group (Rotates and Translates between Hero & About) ───
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);
    globeGroupRef.current = masterGroup;

    // Inner Spinning Core Group (Carries surface spin around its polar axis)
    const spinGroup = new THREE.Group();
    masterGroup.add(spinGroup);

    const GLOBE_RADIUS = 64;

    // ─── 1. Solid Dark Core (Occludes back-side dots for realistic depth) ─
    const coreGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 0.992, 48, 48);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x05040a,
      transparent: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    spinGroup.add(coreMesh);

    // ─── 2. Geodesic Triangulated Wireframe (Exact match to reference) ────
    const icosahedronGeo = new THREE.IcosahedronGeometry(GLOBE_RADIUS * 1.002, 3);
    const wireframeGeo = new THREE.WireframeGeometry(icosahedronGeo);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: 0xa5b4fc,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
    });
    const wireframeMesh = new THREE.LineSegments(wireframeGeo, wireframeMat);
    spinGroup.add(wireframeMesh);

    // ─── 3. Point Cloud Continents & Coastlines ──────────────────────────
    const pointTexture = createPointTexture();

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/earth-specular.jpg';

    img.onerror = () => {
      img.src = '/earth-map.jpg';
    };

    img.onload = () => {
      const sampleCanvas = document.createElement('canvas');
      const sampleW = 1024;
      const sampleH = 512;
      sampleCanvas.width = sampleW;
      sampleCanvas.height = sampleH;
      const sCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
      sCtx.drawImage(img, 0, 0, sampleW, sampleH);
      const imgData = sCtx.getImageData(0, 0, sampleW, sampleH).data;

      const samplePixel = (u, v) => {
        const px = Math.min(sampleW - 1, Math.max(0, Math.floor(u * sampleW)));
        const py = Math.min(sampleH - 1, Math.max(0, Math.floor(v * sampleH)));
        const idx = (py * sampleW + px) * 4;
        return (imgData[idx] + imgData[idx + 1] + imgData[idx + 2]) / 3;
      };

      const oceanVal = (samplePixel(0.15, 0.5) + samplePixel(0.25, 0.7) + samplePixel(0.7, 0.65)) / 3;
      const landVal = (samplePixel(0.22, 0.28) + samplePixel(0.33, 0.6) + samplePixel(0.53, 0.4)) / 3;
      const isSpecular = oceanVal > landVal;
      const threshold = (oceanVal + landVal) / 2;

      const isLand = (u, v) => {
        const val = samplePixel(u, v);
        return isSpecular ? val < threshold : val > threshold;
      };

      const TOTAL_SAMPLES = 34000;
      const positions = [];
      const colors = [];

      const colCoast = new THREE.Color(0xffffff);
      const colInland = new THREE.Color(0xf1f5f9);
      const colInlandTint = new THREE.Color(0xd8b4fe);
      const colOcean = new THREE.Color(0x3b3756);

      for (let i = 0; i < TOTAL_SAMPLES; i++) {
        const phi = Math.acos(1 - 2 * (i + 0.5) / TOTAL_SAMPLES);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;

        const u = ((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI);
        const v = phi / Math.PI;

        const land = isLand(u, v);

        const du = 1.8 / sampleW;
        const dv = 1.8 / sampleH;
        let isCoastline = false;

        if (land) {
          if (!isLand(u + du, v) || !isLand(u - du, v) || !isLand(u, v + dv) || !isLand(u, v - dv)) {
            isCoastline = true;
          }
        }

        const x = -(GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta));
        const z = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);
        const y = GLOBE_RADIUS * Math.cos(phi);

        if (land) {
          positions.push(x, y, z);

          if (isCoastline) {
            colors.push(colCoast.r, colCoast.g, colCoast.b);

            const jx = x + (Math.random() - 0.5) * 0.8;
            const jy = y + (Math.random() - 0.5) * 0.8;
            const jz = z + (Math.random() - 0.5) * 0.8;
            const jlen = Math.sqrt(jx * jx + jy * jy + jz * jz);
            positions.push((jx / jlen) * GLOBE_RADIUS, (jy / jlen) * GLOBE_RADIUS, (jz / jlen) * GLOBE_RADIUS);
            colors.push(colCoast.r, colCoast.g, colCoast.b);
          } else {
            const finalCol = colInland.clone().lerp(colInlandTint, Math.random() * 0.35);
            colors.push(finalCol.r, finalCol.g, finalCol.b);
          }
        } else {
          if (i % 45 === 0) {
            positions.push(x, y, z);
            colors.push(colOcean.r, colOcean.g, colOcean.b);
          }
        }
      }

      const pointsGeo = new THREE.BufferGeometry();
      pointsGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      pointsGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const pointsMat = new THREE.PointsMaterial({
        size: 1.8,
        map: pointTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const pointsMesh = new THREE.Points(pointsGeo, pointsMat);
      spinGroup.add(pointsMesh);
    };

    // Helper: Unproject 2D screen coordinate to 3D world space at Z = 0
    const screenToWorld = (screenX, screenY) => {
      const ndcX = (screenX / window.innerWidth) * 2 - 1;
      const ndcY = -(screenY / window.innerHeight) * 2 + 1;
      const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      return camera.position.clone().add(dir.multiplyScalar(dist));
    };

    // ─── Scroll Progress Calculation ─────────────────────────────────────
    const getScrollProgress = () => {
      const aboutEl = document.getElementById('about');
      const vh = window.innerHeight;
      if (!aboutEl) {
        const scY = window.scrollY || window.pageYOffset;
        return Math.max(0, Math.min(1, scY / (vh * 0.75)));
      }
      const rect = aboutEl.getBoundingClientRect();
      // Progress starts when About top is at 92% viewport, completes when at 22% viewport
      // Once reached, it stays at 1.0 for the entire rest of the page!
      const startY = vh * 0.92;
      const endY = vh * 0.22;
      const rawT = (startY - rect.top) / (startY - endY);
      return Math.max(0, Math.min(1, rawT));
    };

    // ─── Resize Handler ──────────────────────────────────────────────────
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Initial positioning setup
    let currentT = 0;

    // ─── Animation Loop ──────────────────────────────────────────────────
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Continuous surface spin around Earth's polar axis
      if (!isDraggingRef.current) {
        spinGroup.rotation.y += 0.24 * delta;
      }

      // Smooth inertia damping when released
      if (!isDraggingRef.current) {
        spinGroup.rotation.y += velocityRef.current.x;
        masterGroup.rotation.x += velocityRef.current.y * 0.5;
        velocityRef.current.x *= 0.92;
        velocityRef.current.y *= 0.92;
      }

      // ─── Compute Target Transformation based on Scroll ───────────────────
      const targetT = getScrollProgress();
      currentT += (targetT - currentT) * 0.075;

      // Find Hero anchor position (centered)
      let sideWorldX = 0;
      let sideWorldY = 0;
      const anchor = document.getElementById('hero-globe-anchor');
      if (anchor) {
        const rect = anchor.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const world = screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
          sideWorldX = world.x;
          sideWorldY = world.y;
        }
      }

      // ─── Dynamic Wide Horizon Calculation (100% Horizontal Screen Coverage) ─
      // Calculate visible world bounds at camera depth
      const fovRad = (camera.fov * Math.PI) / 360;
      const halfHeight = Math.tan(fovRad) * camera.position.z;
      const visibleHeight = halfHeight * 2;
      const visibleWidth = visibleHeight * camera.aspect;

      // Extend slightly beyond screen edges (8%) so the curved horizon completely covers horizontal width
      const halfW = (visibleWidth / 2) * 1.08;
      // Apex height: stays strictly in the lower half (~36% from screen bottom)
      const horizonApexY = -halfHeight + visibleHeight * 0.36;
      // Drop distance from apex to screen edge corners
      const deltaY = visibleHeight * 0.40;

      // Circular arc radius formula: R = (halfW^2 + deltaY^2) / (2 * deltaY)
      const horizonRadius = (halfW * halfW + deltaY * deltaY) / (2 * deltaY);
      const targetHorizonScale = horizonRadius / GLOBE_RADIUS;
      const middleWorldY = horizonApexY - horizonRadius;
      const middleWorldX = 0;

      const targetX = THREE.MathUtils.lerp(sideWorldX, middleWorldX, currentT);
      const targetY = THREE.MathUtils.lerp(sideWorldY, middleWorldY, currentT);
      const targetScale = THREE.MathUtils.lerp(1.0, targetHorizonScale, currentT);

      // Hero orientation vs About Horizon orientation
      const targetRotX = THREE.MathUtils.lerp(0.12, 1.22, currentT);
      const targetRotZ = THREE.MathUtils.lerp(0.28, 0.0, currentT);

      masterGroup.position.x += (targetX - masterGroup.position.x) * 0.085;
      masterGroup.position.y += (targetY - masterGroup.position.y) * 0.085;

      const cScale = masterGroup.scale.x;
      const nScale = cScale + (targetScale - cScale) * 0.085;
      masterGroup.scale.set(nScale, nScale, nScale);

      masterGroup.rotation.x += (targetRotX - masterGroup.rotation.x) * 0.085;
      masterGroup.rotation.z += (targetRotZ - masterGroup.rotation.z) * 0.085;

      renderer.render(scene, camera);
    };

    animate();

    // ─── Pointer Drag & Hover Interactions ───────────────────────────────
    const onPointerDown = (e) => {
      // Check if clicking near anchor in hero, or bottom area in horizon mode
      const anchor = document.getElementById('hero-globe-anchor');
      let canDrag = false;

      if (anchor) {
        const rect = anchor.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          canDrag = true;
        }
      }

      // Allow dragging in horizon mode across lower portion of screen
      if (currentT > 0.4 && e.clientY > window.innerHeight * 0.55) {
        canDrag = true;
      }

      if (canDrag) {
        isDraggingRef.current = true;
        prevPointerRef.current = { x: e.clientX, y: e.clientY };
        velocityRef.current = { x: 0, y: 0 };
      }
    };

    const onPointerMove = (e) => {
      if (!isDraggingRef.current) {
        return;
      }

      const deltaX = e.clientX - prevPointerRef.current.x;
      const deltaY = e.clientY - prevPointerRef.current.y;
      prevPointerRef.current = { x: e.clientX, y: e.clientY };

      const rotSpeed = 0.005;
      spinGroup.rotation.y += deltaX * rotSpeed;
      masterGroup.rotation.x += deltaY * rotSpeed * 0.3;

      velocityRef.current = {
        x: deltaX * rotSpeed * 0.6,
        y: deltaY * rotSpeed * 0.3,
      };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      icosahedronGeo.dispose();
      wireframeGeo.dispose();
      wireframeMat.dispose();
    };
  }, []);

  return (
    <>
      {/* Full-Viewport 3D Globe Canvas Layer */}
      <div className="foss-globe-canvas-layer" ref={mountRef} aria-hidden="true" />
    </>
  );
}
