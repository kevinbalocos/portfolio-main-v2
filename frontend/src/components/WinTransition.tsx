"use client"

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { BadgeCheck } from "lucide-react"
import { stopGameMusic } from "@/lib/audio"

type WinTransitionProps = {
  onComplete: () => void
}

export default function WinTransition({ onComplete }: WinTransitionProps) {
  // Orbital particles — arranged in two rings for more depth
  const innerParticles = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const radius = 62
        return {
          i,
          angle,
          radius,
          delay: i * 0.045,
          duration: 1.4 + (i % 3) * 0.1,
        }
      }),
    []
  )

  const outerParticles = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2 + 0.15
        const radius = 104 + (i % 4) * 6
        return {
          i,
          angle,
          radius,
          delay: i * 0.03 + 0.12,
          duration: 1.8 + (i % 5) * 0.08,
        }
      }),
    []
  )

  React.useEffect(() => {
    void stopGameMusic(200)
    const timer = window.setTimeout(onComplete, 3200)
    return () => window.clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_50%,color-mix(in_oklab,var(--primary)_11%,transparent),transparent_65%)]" />
      </div>

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
        }}
      />

      {/* Composition */}
      <div className="relative flex flex-col items-center justify-center gap-8 px-5">
        {/* Badge + orbital system */}
        <motion.div
          className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64"
          initial={{ scale: 0.82, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Expanding pulse rings */}
          {[0, 1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              className="absolute inset-0 rounded-full border border-primary/18"
              initial={{ scale: 0.65, opacity: 0.7 }}
              animate={{ scale: 2.0, opacity: 0 }}
              transition={{
                duration: 1.6,
                delay: ring * 0.28,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Outer orbit ring — subtle, not rotating */}
          <div className="absolute inset-[8%] rounded-full border border-border/30" />

          {/* Inner orbit ring */}
          <div className="absolute inset-[24%] rounded-full border border-primary/15" />

          {/* Outer orbital particles */}
          {outerParticles.map((p) => (
            <motion.div
              key={`outer-${p.i}`}
              className="absolute h-0.5 w-0.5 rounded-full bg-primary/60"
              style={{ left: "50%", top: "50%", marginLeft: -1, marginTop: -1 }}
              animate={{
                x: [
                  Math.cos(p.angle) * p.radius,
                  Math.cos(p.angle) * (p.radius + 8),
                  Math.cos(p.angle) * p.radius,
                ],
                y: [
                  Math.sin(p.angle) * p.radius,
                  Math.sin(p.angle) * (p.radius + 8),
                  Math.sin(p.angle) * p.radius,
                ],
                opacity: [0, 0.7, 0],
                scale: [0, 1.2, 0],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Inner orbital particles */}
          {innerParticles.map((p) => (
            <motion.div
              key={`inner-${p.i}`}
              className="absolute h-1 w-1 rounded-full bg-primary"
              style={{ left: "50%", top: "50%", marginLeft: -2, marginTop: -2 }}
              animate={{
                x: [
                  Math.cos(p.angle) * p.radius,
                  Math.cos(p.angle) * (p.radius + 6),
                  Math.cos(p.angle) * p.radius,
                ],
                y: [
                  Math.sin(p.angle) * p.radius,
                  Math.sin(p.angle) * (p.radius + 6),
                  Math.sin(p.angle) * p.radius,
                ],
                opacity: [0, 0.9, 0],
                scale: [0.2, 1, 0.2],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Slow rotating sweep arc */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 6, ease: "linear", repeat: Infinity }}
          >
            <div className="bg-gradient-conic absolute inset-0 rounded-full from-primary/0 via-primary/12 to-primary/0 blur-lg" />
          </motion.div>

          {/* Central badge — glass surface */}
          <motion.div
            className="absolute inset-[34%] grid place-items-center rounded-full border border-primary/20 bg-background/80 shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_8%,transparent),0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            animate={{
              boxShadow: [
                "0 0 0 1px color-mix(in oklab, var(--primary) 8%, transparent), 0 20px 60px -20px rgba(0,0,0,0.5)",
                "0 0 0 1px color-mix(in oklab, var(--primary) 18%, transparent), 0 0 40px -10px color-mix(in oklab, var(--primary) 18%, transparent), 0 20px 60px -20px rgba(0,0,0,0.5)",
                "0 0 0 1px color-mix(in oklab, var(--primary) 8%, transparent), 0 20px 60px -20px rgba(0,0,0,0.5)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <BadgeCheck className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Text — clean, minimal, completely visible */}
        <motion.div
          className="flex flex-col items-center gap-3 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.28,
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {/* Status pill */}
          <div className="flex items-center gap-2 rounded-full border border-primary/14 bg-primary/6 px-4 py-1.5">
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.2, 0.9] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
          
          </div>

       

          {/* Thin divider */}
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-border/70 to-transparent" />

          {/* Loading bar */}
          <motion.div
            className="h-px w-28 overflow-hidden rounded-full bg-border/45 sm:w-36"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.38 }}
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary/70 via-primary to-primary/70"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.1, delay: 0.44, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
