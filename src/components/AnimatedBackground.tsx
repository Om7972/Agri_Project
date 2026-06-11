'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  // We will generate static particle arrays to prevent hydration mismatches
  const particles = [
    { id: 1, x: '10%', y: '20%', size: 4, delay: 0, duration: 25 },
    { id: 2, x: '30%', y: '60%', size: 6, delay: 2, duration: 30 },
    { id: 3, x: '70%', y: '15%', size: 5, delay: 5, duration: 28 },
    { id: 4, x: '85%', y: '75%', size: 8, delay: 1, duration: 35 },
    { id: 5, x: '50%', y: '40%', size: 3, delay: 7, duration: 22 },
    { id: 6, x: '20%', y: '85%', size: 5, delay: 4, duration: 27 },
    { id: 7, x: '90%', y: '30%', size: 6, delay: 3, duration: 32 },
    { id: 8, x: '60%', y: '90%', size: 4, delay: 6, duration: 24 },
  ];

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#020617] pointer-events-none">
      {/* Dynamic Gradient Orbs */}
      <motion.div
        animate={{
          x: [0, 60, -40, 0],
          y: [0, -80, 50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-teal-500/10 blur-[120px] mix-blend-screen"
      />
      <motion.div
        animate={{
          x: [0, -70, 50, 0],
          y: [0, 90, -60, 0],
          scale: [1, 0.85, 1.15, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-40 right-10 w-[500px] h-[500px] rounded-full bg-lime-500/8 blur-[150px] mix-blend-screen"
      />
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, 50, -40, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-slate-500/5 blur-[100px]"
      />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Radial Gradient for shading */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-[#020617] opacity-90" />

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.1, y: '110%' }}
            animate={{
              y: '-10%',
              opacity: [0.1, 0.4, 0.4, 0.1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              left: p.x,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: p.id % 2 === 0 ? '#14b8a6' : '#84cc16',
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
