import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Expand, Minimize2, RotateCcw, Sparkles } from 'lucide-react';
import { HERO_MEDIA } from '../data/portfolio';
import { uiSound } from '../utils/sound';

const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _pos = new THREE.Vector3();
const _scale = new THREE.Vector3();
const _euler = new THREE.Euler();

function detectSoftwareWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createDialTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const cx = size / 2;
    const cy = size / 2;
    ctx.clearRect(0, 0, size, size);

    ctx.strokeStyle = 'rgba(96, 165, 250, 0.34)';
    ctx.lineWidth = 1.5;
    for (const r of [110, 165, 218, 242]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (let i = 0; i < 72; i++) {
      const angle = (i / 72) * Math.PI * 2;
      const major = i % 6 === 0;
      const r1 = major ? 210 : 220;
      const r2 = 236;
      ctx.strokeStyle = major ? 'rgba(147, 197, 253, 0.65)' : 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = major ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, maxAnisotropy);
  tex.needsUpdate = true;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(37, 99, 235, 0.32)');
    grad.addColorStop(0.45, 'rgba(0, 0, 0, 0.45)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function HeroScene3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [wireMode, setWireMode] = useState(false);

  const stateRef = useRef({
    exploded: false,
    wireMode: false,
    pointerX: 0,
    pointerY: 0,
    pulse: 0,
    resetRequested: false,
  });

  useEffect(() => {
    stateRef.current.exploded = exploded;
  }, [exploded]);

  useEffect(() => {
    stateRef.current.wireMode = wireMode;
  }, [wireMode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setWebglFailed(true);
      return;
    }

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const width = container.clientWidth || 560;
    const height = container.clientHeight || 420;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x09090d, 1);

    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09090d);
    scene.fog = new THREE.FogExp2(0x09090d, 0.055);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.35, 6.4);
    camera.lookAt(0, 0.05, 0);

    // 3-Point Warm/Cool Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x111118, 0.75);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.2);
    keyLight.position.set(4.5, 6.5, 5.0);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -3.5;
    keyLight.shadow.camera.right = 3.5;
    keyLight.shadow.camera.top = 3.5;
    keyLight.shadow.camera.bottom = -3.5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x3b82f6, 2.4);
    rimLight.position.set(-4.5, 2.5, -4.5);
    scene.add(rimLight);

    const fillPoint = new THREE.PointLight(0x60a5fa, 1.6, 12, 2);
    fillPoint.position.set(0, -1.6, 2.4);
    scene.add(fillPoint);

    // Grounded Studio Pedestal & Procedural Dial Ring
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const dialTexture = createDialTexture(maxAniso);
    const shadowTexture = createContactShadowTexture();

    const floorGeo = new THREE.CircleGeometry(4.2, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0d0d14,
      roughness: 0.72,
      metalness: 0.2,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -1.78;
    floorMesh.receiveShadow = !isSoftwareGl;
    scene.add(floorMesh);

    const dialGeo = new THREE.PlaneGeometry(4.1, 4.1);
    const dialMat = new THREE.MeshBasicMaterial({
      map: dialTexture,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const dialMesh = new THREE.Mesh(dialGeo, dialMat);
    dialMesh.rotation.x = -Math.PI / 2;
    dialMesh.position.y = -1.76;
    scene.add(dialMesh);

    const shadowGeo = new THREE.PlaneGeometry(3.4, 3.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.75;
    scene.add(shadowPlane);

    // Composite 8-Part Kinetic Engineering Sculpture
    const assembly = new THREE.Group();
    assembly.position.set(0, 0.12, 0);
    scene.add(assembly);

    const titaniumMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      metalness: 0.92,
      roughness: 0.22,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2,
    });

    const obsidianMat = new THREE.MeshStandardMaterial({
      color: 0x161822,
      metalness: 0.35,
      roughness: 0.62,
    });

    const cobaltGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x60a5fa,
      metalness: 0.05,
      roughness: 0.08,
      transmission: isSoftwareGl ? 0 : 0.88,
      transparent: true,
      opacity: isSoftwareGl ? 0.55 : 1,
      ior: 1.62,
      thickness: 1.4,
      attenuationColor: new THREE.Color(0x2563eb),
      attenuationDistance: 1.2,
      clearcoat: 1.0,
    });

    const emissiveAccentMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x2563eb,
      emissiveIntensity: 1.35,
      roughness: 0.25,
      metalness: 0.4,
    });

    // Part 1: Inner faceted cobalt optical crystal core
    const coreGeo = new THREE.IcosahedronGeometry(0.68, 0);
    const coreMesh = new THREE.Mesh(coreGeo, cobaltGlassMat);
    coreMesh.castShadow = !isSoftwareGl;
    assembly.add(coreMesh);

    // Part 2: Inner precision titanium octahedron armature
    const armatureGeo = new THREE.OctahedronGeometry(0.86, 0);
    const armatureMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.85,
      roughness: 0.28,
      wireframe: true,
    });
    const armatureMesh = new THREE.Mesh(armatureGeo, armatureMat);
    assembly.add(armatureMesh);

    // Part 3, 4, 5: Three counter-rotating gimbal rings
    const ring1Geo = new THREE.TorusGeometry(1.18, 0.045, 20, 72);
    const ring1 = new THREE.Mesh(ring1Geo, titaniumMat);
    ring1.castShadow = !isSoftwareGl;
    assembly.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(1.42, 0.032, 18, 84);
    const ring2 = new THREE.Mesh(ring2Geo, obsidianMat);
    ring2.rotation.x = Math.PI / 3;
    ring2.castShadow = !isSoftwareGl;
    assembly.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(1.66, 0.022, 16, 96);
    const ring3 = new THREE.Mesh(ring3Geo, titaniumMat);
    ring3.rotation.y = Math.PI / 4;
    assembly.add(ring3);

    // Part 6 & 7: Opposing beveled bracket fins (ExtrudeGeometry)
    const finShape = new THREE.Shape();
    finShape.moveTo(-0.14, -0.35);
    finShape.lineTo(0.14, -0.22);
    finShape.lineTo(0.14, 0.22);
    finShape.lineTo(-0.14, 0.35);
    finShape.closePath();

    const finGeo = new THREE.ExtrudeGeometry(finShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    finGeo.center();

    const finTop = new THREE.Mesh(finGeo, obsidianMat);
    finTop.position.set(0, 1.32, 0);
    finTop.rotation.z = Math.PI / 2;
    assembly.add(finTop);

    const finBottom = new THREE.Mesh(finGeo, obsidianMat);
    finBottom.position.set(0, -1.32, 0);
    finBottom.rotation.z = -Math.PI / 2;
    assembly.add(finBottom);

    // Part 8: Emissive precision beacon core rings
    const beaconGeo = new THREE.TorusGeometry(0.42, 0.018, 12, 48);
    const beaconMesh = new THREE.Mesh(beaconGeo, emissiveAccentMat);
    beaconMesh.rotation.x = Math.PI / 2;
    assembly.add(beaconMesh);

    // InstancedMesh Orbital Data Nodes (32 satellites)
    const NODE_COUNT = 32;
    const nodeGeo = new THREE.OctahedronGeometry(0.055, 0);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.8,
      roughness: 0.2,
    });
    const instancedNodes = new THREE.InstancedMesh(nodeGeo, nodeMat, NODE_COUNT);
    instancedNodes.frustumCulled = false;

    const nodeMeta = Array.from({ length: NODE_COUNT }, (_, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / NODE_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      return {
        radius: 1.85 + (i % 3) * 0.22,
        phi,
        theta,
        speed: 0.22 + (i % 5) * 0.06,
        scale: 0.75 + (i % 4) * 0.16,
      };
    });

    const nodeColor = new THREE.Color();
    for (let i = 0; i < NODE_COUNT; i++) {
      nodeColor.setHex(i % 4 === 0 ? 0x60a5fa : 0xcbd5e1);
      instancedNodes.setColorAt(i, nodeColor);
    }
    if (instancedNodes.instanceColor) {
      instancedNodes.instanceColor.needsUpdate = true;
    }
    assembly.add(instancedNodes);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      stateRef.current.pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      stateRef.current.pointerY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    };

    const onPointerLeave = () => {
      stateRef.current.pointerX = 0;
      stateRef.current.pointerY = 0;
    };

    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      stateRef.current.pulse = 1;
      uiSound.play('scan');
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);
    container.addEventListener('click', onClick);

    const onResize = () => {
      const w = container.clientWidth || 560;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;
    let explodeProgress = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const poll = () => {
        if (disposed) {
          gl.deleteSync(sync);
          return;
        }
        const st = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (st === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.getElapsedTime();

      const targetExplode = stateRef.current.exploded ? 1 : 0;
      explodeProgress = THREE.MathUtils.damp(explodeProgress, targetExplode, 5.5, delta);
      stateRef.current.pulse = THREE.MathUtils.damp(stateRef.current.pulse, 0, 3.2, delta);

      const isWire = stateRef.current.wireMode;
      titaniumMat.wireframe = isWire;
      obsidianMat.wireframe = isWire;

      if (stateRef.current.resetRequested) {
        currentRotX = 0;
        currentRotY = 0;
        stateRef.current.pointerX = 0;
        stateRef.current.pointerY = 0;
        stateRef.current.resetRequested = false;
      }

      const targetTiltX = stateRef.current.pointerY * 0.28;
      const targetTiltY = stateRef.current.pointerX * 0.42;
      currentRotX = THREE.MathUtils.damp(currentRotX, targetTiltX, 4.5, delta);
      currentRotY = THREE.MathUtils.damp(currentRotY, targetTiltY, 4.5, delta);

      assembly.rotation.x = currentRotX + Math.sin(elapsed * 0.5) * 0.04;
      assembly.rotation.y = currentRotY + elapsed * 0.22 + stateRef.current.pulse * 0.8;
      assembly.position.y = 0.12 + Math.sin(elapsed * 1.1) * 0.06;

      // Exploded view offsets & counter-rotation
      coreMesh.rotation.y = -elapsed * 0.45;
      coreMesh.rotation.x = elapsed * 0.25;
      const coreScale = 1 + stateRef.current.pulse * 0.12;
      coreMesh.scale.setScalar(coreScale);

      armatureMesh.rotation.y = elapsed * 0.35;
      armatureMesh.scale.setScalar(1 + explodeProgress * 0.22);

      ring1.rotation.x = elapsed * 0.45;
      ring1.rotation.y = elapsed * 0.2;
      ring1.scale.setScalar(1 + explodeProgress * 0.18);

      ring2.rotation.y = -elapsed * 0.38;
      ring2.rotation.z = elapsed * 0.18;
      ring2.scale.setScalar(1 + explodeProgress * 0.28);

      ring3.rotation.x = -elapsed * 0.25;
      ring3.rotation.z = -elapsed * 0.32;
      ring3.scale.setScalar(1 + explodeProgress * 0.38);

      finTop.position.y = 1.32 + explodeProgress * 0.55;
      finBottom.position.y = -1.32 - explodeProgress * 0.55;
      beaconMesh.rotation.z = elapsed * 0.9;

      dialMesh.rotation.z = elapsed * 0.06;

      for (let i = 0; i < NODE_COUNT; i++) {
        const m = nodeMeta[i];
        const r = m.radius + explodeProgress * 0.65;
        const angle = m.theta + elapsed * m.speed;
        _pos.set(
          r * Math.sin(m.phi) * Math.cos(angle),
          r * Math.cos(m.phi),
          r * Math.sin(m.phi) * Math.sin(angle)
        );
        _euler.set(elapsed + i, elapsed * 0.7, 0);
        _quat.setFromEuler(_euler);
        _scale.setScalar(m.scale * (1 + stateRef.current.pulse * 0.3));
        _mat4.compose(_pos, _quat, _scale);
        instancedNodes.setMatrixAt(i, _mat4);
      }
      instancedNodes.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('click', onClick);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);

      for (const geo of [
        floorGeo,
        dialGeo,
        shadowGeo,
        coreGeo,
        armatureGeo,
        ring1Geo,
        ring2Geo,
        ring3Geo,
        finGeo,
        beaconGeo,
        nodeGeo,
      ]) {
        geo.dispose();
      }
      for (const mat of [
        floorMat,
        dialMat,
        shadowMat,
        titaniumMat,
        obsidianMat,
        cobaltGlassMat,
        emissiveAccentMat,
        armatureMat,
        nodeMat,
      ]) {
        mat.dispose();
      }
      dialTexture.dispose();
      shadowTexture.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglFailed) {
    return (
      <div className="relative h-full min-h-[360px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0E0E12]">
        <img
          src={HERO_MEDIA.image}
          alt={HERO_MEDIA.alt}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 p-5 text-xs text-zinc-300">
          <span className="font-medium text-white">PGlove · Bro Gang AI CLI · Nexa Search</span>
          <span className="font-mono text-zinc-400">TechAdityaBRO</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[380px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#09090D]">
      <div
        ref={mountRef}
        aria-label="Interactive 3D architectural core visualization"
        className="h-full min-h-[380px] w-full cursor-grab active:cursor-grabbing"
      />

      {/* Top subtle label */}
      <div className="pointer-events-none absolute top-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <span>Interactive 3D Core</span>
        <span>Move pointer · Click to pulse</span>
      </div>

      {/* Bottom compact control dock (no backdrop-blur over WebGL) */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-xl border border-white/14 bg-[#0D0D14]/90 p-1.5 shadow-lg">
        <button
          type="button"
          onClick={() => {
            uiSound.play('switch');
            setExploded((v) => !v);
          }}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            exploded ? 'bg-[#2563EB] text-white' : 'text-zinc-300 hover:bg-white/8 hover:text-white'
          }`}
        >
          {exploded ? <Minimize2 className="h-3.5 w-3.5" /> : <Expand className="h-3.5 w-3.5" />}
          <span>{exploded ? 'Assemble' : 'Explode'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            uiSound.play('switch');
            setWireMode((v) => !v);
          }}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            wireMode ? 'bg-[#2563EB] text-white' : 'text-zinc-300 hover:bg-white/8 hover:text-white'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{wireMode ? 'Solid' : 'Wireframe'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            uiSound.play('click');
            stateRef.current.resetRequested = true;
            stateRef.current.pulse = 0.8;
          }}
          aria-label="Reset 3D orientation"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/8 hover:text-white whitespace-nowrap shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
