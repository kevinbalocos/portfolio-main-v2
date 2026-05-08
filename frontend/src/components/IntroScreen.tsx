"use client"

import React, { useEffect, useState } from "react"
import { motion, type Variants } from "framer-motion"
import { Activity, Cpu, Lock, Shield, Terminal, Zap } from "lucide-react"
import { playGlitchSound } from "@/lib/audio"

type IntroScreenProps = {
  onComplete: () => void
}

function SystemHUD() {
  const [time, setTime] = useState("00:00:00")
  const [date, setDate] = useState("---")
  const [bootProgress, setBootProgress] = useState(0)

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString("en-US", { hour12: false }))
      setDate(
        now.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      )
    }
    updateDateTime()
    const interval = window.setInterval(updateDateTime, 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setBootProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 2.8
      })
    }, 55)
    return () => window.clearInterval(interval)
  }, [])

  const pct = Math.min(100, Math.round(bootProgress))

  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-start justify-between px-5 py-4 sm:px-8"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay: 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {/* Left — system identity */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <Terminal className="h-2.5 w-2.5 text-primary/45" />
          <span className="font-mono text-[7px] tracking-[0.34em] text-muted-foreground/40 uppercase sm:text-[8px]">
            PORTFOLIO · v2.0.1
          </span>
        </div>
        <div className="flex items-baseline gap-2.5">
          <motion.span
            className="font-mono text-[10px] text-foreground/55 tabular-nums sm:text-[11px]"
            animate={{ opacity: [0.55, 0.9, 0.55] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            {time}
          </motion.span>
          <span className="font-mono text-[7px] text-muted-foreground/30 tabular-nums">
            {date}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <div className="h-px w-16 overflow-hidden rounded-full bg-border/40 sm:w-20">
            <motion.div
              className="h-full rounded-full bg-primary/50"
              style={{ width: `${pct}%` }}
              transition={{ duration: 0.06 }}
            />
          </div>
          <span className="font-mono text-[6px] text-muted-foreground/28 tabular-nums sm:text-[7px]">
            {pct}%
          </span>
        </div>
      </div>

      {/* Right — gate status */}
      <div className="flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[7px] tracking-[0.3em] text-muted-foreground/40 uppercase sm:text-[8px]">
            GATE SECURE
          </span>
          <Lock className="h-2 w-2 text-primary/40" />
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            className="h-1 w-1 rounded-full bg-primary"
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.8, 1.3, 0.8] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          <span className="font-mono text-[9px] text-foreground/50 sm:text-[10px]">
            READY
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="h-2 w-2 text-muted-foreground/25" />
          <span className="font-mono text-[6px] tracking-[0.2em] text-muted-foreground/28 uppercase sm:text-[7px]">
            CHALLENGE ARMED
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function Scanlines() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.008) 2px, rgba(0,0,0,0.008) 4px)",
      }}
      animate={{ backgroundPositionY: ["0px", "8px"] }}
      transition={{ duration: 0.35, repeat: Infinity, ease: "linear" }}
    />
  )
}

function DataStream({ side }: { side: "left" | "right" }) {
  const lines = [
    "FRONTEND ENGINEER",
    "UI/UX DESIGNER",
    "FULL-STACK W/ AI",
    "CREATIVE TECHNOLOGIST",
    "BUILDING DIGITAL EXPERIENCES",
    "REMOTE READY · PH",
  ]
  return (
    <motion.div
      className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2 flex-col gap-1.5 xl:flex ${
        side === "left" ? "left-10" : "right-10 items-end"
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.7 }}
    >
      {lines.map((line, i) => (
        <motion.div
          key={line}
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: side === "left" ? -6 : 6 }}
          animate={{ opacity: 0.22, x: 0 }}
          transition={{ delay: 1.6 + i * 0.08, duration: 0.4 }}
        >
          {side === "right" && (
            <span className="font-mono text-[7px] tracking-[0.2em] text-muted-foreground uppercase">
              {line}
            </span>
          )}
          <motion.div
            className="h-px w-10 rounded-full bg-primary/35"
            animate={{ scaleX: [0.5, 1, 0.5], opacity: [0.15, 0.45, 0.15] }}
            transition={{
              duration: 2.2 + i * 0.25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {side === "left" && (
            <span className="font-mono text-[7px] tracking-[0.2em] text-muted-foreground uppercase">
              {line}
            </span>
          )}
        </motion.div>
      ))}
    </motion.div>
  )
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.45,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const handleEnterPortal = () => {
    void playGlitchSound()
    window.setTimeout(() => onComplete(), 140)
  }

  return (
    <motion.div
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.988 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Moving grid */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.016]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        animate={{ backgroundPositionY: ["0px", "56px"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      <Scanlines />

      {/* Ambient blobs — subtler */}
      <motion.div
        className="pointer-events-none absolute top-[15%] -right-48 h-96 w-96 rounded-full bg-primary/6 blur-[120px]"
        animate={{ y: [0, 28, 0], opacity: [0.25, 0.42, 0.25] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-[18%] -left-48 h-80 w-80 rounded-full blur-[110px]"
        style={{
          background:
            "color-mix(in oklab, oklch(0.7 0.12 220) 6%, transparent)",
        }}
        animate={{ y: [18, -12, 18], opacity: [0.14, 0.26, 0.14] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <SystemHUD />
      <DataStream side="left" />
      <DataStream side="right" />

      {/* Main content */}
      <div className="relative z-10 flex min-h-[100svh] w-full items-center justify-center px-5 py-20 sm:py-24">
        <motion.div
          className="flex w-full max-w-[400px] flex-col items-center gap-7 sm:gap-9"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Identity badge */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 rounded-full border border-primary/14 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-primary"
                animate={{ scale: [1, 1.5, 1], opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <span className="font-mono text-[8px] tracking-[0.3em] text-primary/70 uppercase sm:text-[9px]">
                Jade Kevin Balocos Calalo
              </span>
            </div>
          </motion.div>

          {/* Hero wordmark */}
          <motion.div className="space-y-0 text-center" variants={itemVariants}>
            <p className="mb-2.5 font-mono text-[8px] tracking-[0.36em] text-muted-foreground/45 uppercase sm:text-[9px]">
              2026
            </p>
            <div>
              <motion.h1
                className="text-[clamp(3.6rem,10.5vw,6.4rem)] leading-[0.86] font-bold tracking-[-0.03em] text-foreground"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.75,
                  delay: 0.68,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                JEYD
              </motion.h1>
              <motion.h1
                className="bg-gradient-to-r from-primary via-primary/85 to-primary/40 bg-clip-text text-[clamp(3.6rem,10.5vw,6.4rem)] leading-[0.86] font-bold tracking-[-0.03em] text-transparent"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.75,
                  delay: 0.86,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                DEV
              </motion.h1>
            </div>
          </motion.div>

          {/* Descriptor */}
          <motion.div variants={itemVariants}>
            <motion.div
              className="flex items-center gap-3 font-mono text-[8px] text-muted-foreground/38 sm:text-[9px]"
              animate={{ opacity: [0.38, 0.65, 0.38] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            >
              <Cpu className="h-2.5 w-2.5 text-primary/30" />
              <span className="tracking-[0.26em] uppercase">
                FULLSTACK · UI/UX · MOTION
              </span>
              <Cpu className="h-2.5 w-2.5 text-primary/30" />
            </motion.div>
          </motion.div>

          {/* Charge bar */}
          <motion.div className="w-full max-w-[120px]" variants={itemVariants}>
            <div className="relative h-px w-full overflow-hidden rounded-full bg-border/45">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/55 via-primary to-primary/55"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 2.0,
                  delay: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              />
              <motion.div
                className="absolute inset-y-0 w-6 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{ duration: 1.1, delay: 2.2, ease: "easeOut" }}
              />
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div variants={itemVariants} className="relative">
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  "0 0 0 0 color-mix(in oklab, var(--primary) 0%, transparent)",
                  "0 0 0 12px color-mix(in oklab, var(--primary) 8%, transparent)",
                  "0 0 0 0 color-mix(in oklab, var(--primary) 0%, transparent)",
                ],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
            />

            <motion.button
              className="group relative overflow-hidden rounded-full px-9 py-3 text-[13px] font-semibold tracking-[0.1em] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none sm:px-11 sm:py-3.5"
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.965 }}
              onClick={handleEnterPortal}
            >
              <div className="absolute inset-0 bg-primary" />
              <div className="absolute inset-x-0 top-0 h-px bg-white/18" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.48 }}
              />
              <span className="relative flex items-center gap-2.5 text-primary-foreground">
                <span>ENTER PORTAL</span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex items-center"
                >
                  <Zap className="h-3.5 w-3.5" />
                </motion.span>
              </span>
            </motion.button>
          </motion.div>

          {/* Footer note */}
          <motion.div
            className="flex flex-col items-center gap-1.5 text-center"
            variants={itemVariants}
          >
            <p className="font-mono text-[7px] tracking-[0.24em] text-muted-foreground/30 uppercase sm:text-[8px]">
              Challenge required to unlock portfolio
            </p>
            <motion.div
              className="flex items-center justify-center gap-2"
              animate={{ opacity: [0.22, 0.5, 0.22] }}
              transition={{ duration: 3.2, repeat: Infinity }}
            >
              <div className="h-px w-5 rounded-full bg-border/45" />
              <Shield className="h-2 w-2 text-muted-foreground/28" />
              <div className="h-px w-5 rounded-full bg-border/45" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
