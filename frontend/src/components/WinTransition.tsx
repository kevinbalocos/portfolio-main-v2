"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion"
import { playMatchSuccess, stopGameMusic } from "@/lib/audio"

type WinTransitionProps = {
  onComplete: () => void
}

/*
  THE IDEA
  --------
  One monumental wordmark, "Jeyd.", set in the same Bodoni used on the game's
  start screen. It rises into frame as a hairline outline. A single scan line
  crosses it left to right, and everything behind the line becomes solid, like
  a system coming online. The full stop (the only accent colour on screen)
  lands last. Then the letters leave upward through the same mask they entered
  from, which is the direction your hero content rises from.

  Along the bottom, a ruler with 8 ticks, one per pair you matched, is driven
  by the exact same scan value so type and measure stay in lockstep.

  TIMELINE (s)
  0.15  letters rise from the mask (stagger)
  0.90  scan begins, 1.2s, expo-ish in/out
  2.10  scan lands, the full stop is revealed, match sound
  2.45  letters exit upward
  3.25  hand off to the homepage
*/

const WORD = ["J", "e", "y", "d", "."]
const PAIRS = 8
const SCAN_AT = 0.9
const SCAN_DUR = 1.2
const OUT_AT = 2.45
const DONE_AT = 3.25

const EXPO_OUT = [0.16, 1, 0.3, 1] as const
const EXPO_IN = [0.7, 0, 0.84, 0] as const
const SCAN_EASE = [0.65, 0, 0.35, 1] as const
const DISPLAY_FONT = "'Bodoni 72', 'Didot', 'Times New Roman', serif"

const outlineStyle: React.CSSProperties = {
  color: "transparent",
  WebkitTextStroke:
    "1px color-mix(in oklab, var(--foreground) 38%, transparent)",
}
const outlineDotStyle: React.CSSProperties = {
  color: "transparent",
  WebkitTextStroke: "1px color-mix(in oklab, var(--primary) 55%, transparent)",
}

const grain =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

// ─── One layer of the wordmark (outline or solid) ──────────────────────────
function WordLayer({
  phase,
  filled,
  variants,
}: {
  phase: "in" | "out"
  filled: boolean
  variants: Variants
}) {
  return (
    <motion.span
      aria-hidden="true"
      className={`flex overflow-hidden py-[0.1em] pr-[0.05em] pb-[0.16em] ${
        filled ? "absolute inset-0" : "relative"
      }`}
      initial="hidden"
      animate={phase}
    >
      {WORD.map((ch, i) => {
        const dot = ch === "."
        return (
          <motion.span
            key={i}
            custom={i}
            variants={variants}
            className="inline-block"
            style={
              filled
                ? { color: dot ? "var(--primary)" : "var(--foreground)" }
                : dot
                  ? outlineDotStyle
                  : outlineStyle
            }
          >
            {ch}
          </motion.span>
        )
      })}
    </motion.span>
  )
}

// ─── Ruler tick: lights up once the scan has passed it ─────────────────────
function Tick({
  index,
  progress,
}: {
  index: number
  progress: MotionValue<number>
}) {
  const at = index / PAIRS
  const opacity = useTransform(progress, (v) => (v >= at - 0.001 ? 1 : 0.22))
  return (
    <motion.span
      aria-hidden="true"
      className="absolute top-0 h-[7px] w-px bg-foreground"
      style={{ left: `${at * 100}%`, opacity }}
    />
  )
}

export default function WinTransition({ onComplete }: WinTransitionProps) {
  const reduceMotion = Boolean(useReducedMotion())
  const onCompleteRef = useRef(onComplete)
  const [phase, setPhase] = useState<"in" | "out">("in")

  // 0 → 1, drives the scan line, the solid fill, the ruler and the counter.
  const progress = useMotionValue(0)
  const lineLeft = useTransform(progress, (v) => `${v * 100}%`)
  const lineOpacity = useTransform(progress, [0, 0.03, 0.97, 1], [0, 1, 1, 0])
  const fillClip = useTransform(
    progress,
    (v) => `inset(0 ${(1 - v) * 100}% 0 0)`
  )
  const trailLeft = useTransform(progress, (v) => `calc(${v * 100}% - 24%)`)
  const counter = useTransform(progress, (v) =>
    String(Math.round(v * 100)).padStart(3, "0")
  )

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    void stopGameMusic(200)
    const timers: number[] = []
    let scan: ReturnType<typeof animate> | undefined

    if (reduceMotion) {
      progress.set(1)
      timers.push(window.setTimeout(() => onCompleteRef.current(), 1400))
    } else {
      scan = animate(progress, 1, {
        duration: SCAN_DUR,
        delay: SCAN_AT,
        ease: SCAN_EASE,
      })
      timers.push(
        window.setTimeout(
          () => playMatchSuccess(),
          (SCAN_AT + SCAN_DUR) * 1000
        ),
        window.setTimeout(() => setPhase("out"), OUT_AT * 1000),
        window.setTimeout(() => onCompleteRef.current(), DONE_AT * 1000)
      )
    }

    return () => {
      scan?.stop()
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [progress, reduceMotion])

  const letterVariants: Variants = reduceMotion
    ? { hidden: { y: "0%" }, in: { y: "0%" }, out: { y: "0%" } }
    : {
        hidden: { y: "118%" },
        in: (i: number) => ({
          y: "0%",
          transition: { duration: 1, delay: 0.15 + i * 0.07, ease: EXPO_OUT },
        }),
        out: (i: number) => ({
          y: "-118%",
          transition: { duration: 0.7, delay: i * 0.05, ease: EXPO_IN },
        }),
      }

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden bg-background"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      role="status"
      aria-live="polite"
      aria-label="All pairs matched. Opening the portfolio."
    >
      {/* Film grain, the only texture on the stage */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: grain, backgroundSize: "220px 220px" }}
      />

      {/* ── Wordmark ─────────────────────────────────────────── */}
      <div className="absolute inset-0 grid place-items-center px-4">
        <motion.h1
          aria-label="Jeyd"
          className="relative -translate-y-[3vh] text-[clamp(6.5rem,30vw,24rem)] leading-[1] font-normal tracking-[-0.035em] select-none"
          style={{ fontFamily: DISPLAY_FONT }}
          initial={{ scale: 1 }}
          animate={{ scale: reduceMotion ? 1 : 1.04 }}
          transition={{ duration: DONE_AT + 0.4, ease: "linear" }}
        >
          {/* Light that travels with the scan */}
          {!reduceMotion && (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: lineLeft,
                opacity: lineOpacity,
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--primary) 16%, transparent), transparent 62%)",
              }}
            />
          )}

          {/* Outline layer sets the box */}
          <WordLayer phase={phase} filled={false} variants={letterVariants} />

          {/* Solid layer, revealed behind the scan line */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-0"
            style={{ clipPath: fillClip }}
          >
            <WordLayer phase={phase} filled variants={letterVariants} />
          </motion.span>

          {/* Soft trail behind the line */}
          {!reduceMotion && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <motion.span
                className="absolute inset-y-0 w-[24%] bg-gradient-to-r from-transparent to-primary/20 mix-blend-plus-lighter"
                style={{ left: trailLeft, opacity: lineOpacity }}
              />
            </span>
          )}

          {/* The scan line */}
          {!reduceMotion && (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute -top-[4%] -bottom-[4%] w-px -translate-x-1/2 bg-primary shadow-[0_0_26px_3px_color-mix(in_oklab,var(--primary)_55%,transparent)]"
              style={{ left: lineLeft, opacity: lineOpacity }}
            />
          )}
        </motion.h1>
      </div>

      {/* ── Ruler: 8 ticks, one per pair, driven by the same scan ── */}
      <motion.div
        className="absolute inset-x-6 bottom-0 pb-[max(2.25rem,env(safe-area-inset-bottom))] sm:inset-x-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "out" ? 0 : 1 }}
        transition={{
          duration: phase === "out" ? 0.45 : 0.6,
          delay: phase === "out" ? 0 : 0.35,
        }}
        aria-hidden="true"
      >
        <div className="flex items-baseline justify-between text-xs text-muted-foreground/70 tabular-nums">
          <span>
            {PAIRS} of {PAIRS} pairs matched
          </span>
          <span className="flex items-baseline gap-2">
            Opening portfolio
            <motion.span className="text-foreground/85">{counter}</motion.span>
          </span>
        </div>
        <div className="relative mt-3 h-px bg-border/60">
          <motion.span
            className="absolute inset-0 origin-left bg-primary"
            style={{ scaleX: progress }}
          />
          {Array.from({ length: PAIRS + 1 }).map((_, i) => (
            <Tick key={i} index={i} progress={progress} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
