import React, { useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react';
import { OSPLY_EASE } from './KineticText';

export function TiltCard3D({
  children,
  className = '',
  onMouseEnter,
}: {
  children: React.ReactNode;
  className?: string;
  onMouseEnter?: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const [hovered, setHovered] = useState(false);

  const springX = useSpring(rotateX, { stiffness: 260, damping: 24 });
  const springY = useSpring(rotateY, { stiffness: 260, damping: 24 });
  const glareBg = useMotionTemplate`radial-gradient(320px circle at ${glareX}% ${glareY}%, rgba(59, 130, 246, 0.14), transparent 70%)`;

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateX.set((0.5 - py) * 7);
    rotateY.set((px - 0.5) * 7);
    glareX.set(px * 100);
    glareY.set(py * 100);
  };

  const handleLeave = () => {
    setHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div style={{ perspective: 1100 }} className="h-full">
      <motion.div
        ref={cardRef}
        onPointerMove={handleMove}
        onPointerEnter={() => {
          setHovered(true);
          onMouseEnter?.();
        }}
        onPointerLeave={handleLeave}
        style={{
          rotateX: springX,
          rotateY: springY,
          transformStyle: 'preserve-3d',
        }}
        className={`relative h-full ${className}`}
      >
        {children}
        <motion.div
          aria-hidden="true"
          style={{ background: glareBg, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-200"
        />
      </motion.div>
    </div>
  );
}

const MARQUEE_ITEMS = [
  'PGlove Browser',
  'Bro Gang AI CLI',
  'Nexa Search',
  'OSINT Workbench',
  'BRO GANG Studios',
  'D1M Studios',
  'Zapdos AI',
];

export function EditorialMarquee() {
  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden border-y border-white/10 bg-[#09090D] py-4 select-none"
    >
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
        className="flex w-max items-center gap-8 whitespace-nowrap"
      >
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
          <div key={`${item}-${idx}`} className="flex items-center gap-8">
            <span className="font-display text-sm font-semibold tracking-tight text-zinc-400">
              {item}
            </span>
            <span className="font-mono text-xs text-[#3B82F6]">/</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function FloatingPlanesStage() {
  const planes = [
    { top: '12%', left: '8%', w: 120, h: 80, rz: -14, delay: 0 },
    { top: '22%', left: '68%', w: 150, h: 96, rz: 12, delay: 0.4 },
    { top: '62%', left: '16%', w: 100, h: 68, rz: 18, delay: 0.8 },
    { top: '66%', left: '72%', w: 136, h: 86, rz: -10, delay: 1.2 },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ perspective: 900 }}
    >
      {planes.map((p, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 18, rotateX: 35, rotateZ: p.rz }}
          animate={{
            opacity: [0.28, 0.55, 0.28],
            y: [0, -14, 0],
            rotateX: [35, 42, 35],
            rotateY: [-10, 10, -10],
          }}
          transition={{
            repeat: Infinity,
            duration: 7 + idx * 1.3,
            delay: p.delay,
            ease: OSPLY_EASE,
          }}
          style={{
            top: p.top,
            left: p.left,
            width: p.w,
            height: p.h,
            rotateZ: p.rz,
          }}
          className="absolute rounded-xl border border-[#3B82F6]/25 bg-gradient-to-br from-[#2563EB]/10 to-transparent"
        />
      ))}
    </div>
  );
}
