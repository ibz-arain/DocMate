"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

export const Particle = ({ className = "" }: { className?: string }) => {
    const randomX = useMemo(() => Math.random() * 100, []);
    const randomY = useMemo(() => Math.random() * 100, []);
    const randomScale = useMemo(() => Math.random() * 0.6 + 0.4, []);
    const randomDuration = useMemo(() => Math.random() * 20 + 10, []);
    const randomDelay = useMemo(() => Math.random() * 10, []);
    
    return (
      <motion.div
        className={`absolute rounded-full ${className}`}
        style={{
          top: `${randomY}%`,
          left: `${randomX}%`, 
          scale: randomScale,
        }}
        animate={{
          y: ["-20%", "20%", "-20%"],
          x: ["10%", "-10%", "10%"],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          y: {
            repeat: Infinity,
            duration: randomDuration,
            ease: "easeInOut",
            delay: randomDelay,
          },
          x: {
            repeat: Infinity,
            duration: randomDuration * 1.3,
            ease: "easeInOut",
            delay: randomDelay,
          },
          opacity: {
            repeat: Infinity,
            duration: randomDuration * 0.7,
            ease: "easeInOut",
            delay: randomDelay,
          },
        }}
      />
    );
  }; 