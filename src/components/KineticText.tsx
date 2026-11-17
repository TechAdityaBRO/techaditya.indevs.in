import React from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

export const OSPLY_EASE: [number, number, number, number] = [0.65, 0.05, 0, 1];

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-50 h-[2px] origin-left bg-[#3B82F6] pointer-events-none"
    />
  );
}

export function MaskedReveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: '105%', opacity: 0 }}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.72, delay, ease: OSPLY_EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function RevealBlock({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.68, delay, ease: OSPLY_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
