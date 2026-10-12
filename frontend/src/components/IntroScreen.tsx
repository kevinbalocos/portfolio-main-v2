"use client"

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type Ref,
} from "react"
import { MotionConfig, motion, useReducedMotion } from "framer-motion"

type IntroScreenProps = {
  onComplete: () => void
}

const EASE = [0.22, 1, 0.36, 1] as const
// Slow start, violent middle, soft landing: the "tear" of the split.
const SPLIT_EASE = [0.76, 0, 0.18, 1] as const

// Edit this value to change the animated SVG wordmark.
const WORDMARK = "JEYD"

/* ───────────── Timeline ─────────────
   0 ........ HOLD_MS ........ + IGNITE_S ........ + SPLIT_S
   intro plays   a hairline        the two halves
                 laser draws       tear apart and
                 through the       reveal the site
                 wordmark          underneath
*/
const HOLD_MS = 2_400
const IGNITE_S = 0.34
const SPLIT_S = 0.95
const EXIT_S = IGNITE_S + SPLIT_S + 0.05

// Where the cut lands inside the wordmark SVG (viewBox y=91 of 245 ≈ middle of the
// capital letters). Nudge this if you change the font or font size.
const CUT_RATIO = 91 / 245

/* ───────────── Wordmark ───────────── */

function JeydWordmark({
  reduceMotion,
  frozen,
  svgRef,
}: {
  reduceMotion: boolean
  frozen: boolean
  svgRef?: Ref<SVGSVGElement>
}) {
  const letters = WORDMARK.split("")
  // Unique ids so the live copy and both frozen halves each own their gradient.
  const uid = useId().replace(/:/g, "")
  const gradientId = `jeyd-wordmark-gradient-${uid}`
  const titleId = `jeyd-logo-title-${uid}`
  const letterSpacing = 166
  const centerX = 380
  // `initial={false}` renders the final state instantly (used by the frozen halves).
  const from = <T,>(v: T) => (frozen ? (false as const) : v)

  return (
    <motion.svg
      ref={svgRef}
      aria-labelledby={titleId}
      className="h-auto w-full max-w-[min(82vw,760px)] overflow-visible"
      viewBox="0 0 760 245"
      role="img"
      initial={frozen ? false : "hidden"}
      animate="visible"
    >
      <title id={titleId}>{WORDMARK} — personal portfolio</title>

      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="56%" stopColor="currentColor" />
          <stop offset="100%" stopColor="var(--primary)" />
        </linearGradient>
      </defs>

      {/* Each character is SVG text, so the wordmark stays editable in this file. */}
      <g aria-hidden="true">
        {letters.map((letter, index) => {
          const x = centerX + (index - (letters.length - 1) / 2) * letterSpacing

          return (
            <motion.text
              key={`${letter}-${index}`}
              x={x}
              y={139}
              textAnchor="middle"
              fill={`url(#${gradientId})`}
              fontFamily="'Bodoni 72', 'Didot', 'Times New Roman', serif"
              fontSize="142"
              fontWeight="400"
              letterSpacing="-3"
              variants={{
                hidden: { opacity: 0, y: 17, filter: "blur(8px)" },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: {
                    duration: reduceMotion ? 0 : 0.72,
                    delay: reduceMotion ? 0 : 0.25 + index * 0.14,
                    ease: EASE,
                  },
                },
              }}
            >
              {letter}
            </motion.text>
          )
        })}
      </g>

      <motion.path
        d="M116 174 H644"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1"
        initial={from({ pathLength: 0, opacity: 0 })}
        animate={{ pathLength: 1, opacity: 0.78 }}
        transition={{
          duration: reduceMotion ? 0 : 0.86,
          delay: reduceMotion ? 0 : 1.12,
          ease: EASE,
        }}
      />

      {!reduceMotion && !frozen && (
        <motion.circle
          cy="174"
          r="2.2"
          fill="var(--primary)"
          initial={{ cx: 116, opacity: 0 }}
          animate={{ cx: [116, 644], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.78, delay: 1.22, ease: "easeInOut" }}
        />
      )}

      <motion.text
        x="380"
        y="208"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="9"
        letterSpacing="4.4"
        initial={from({ opacity: 0, y: 5 })}
        animate={{ opacity: 0.46, y: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.58,
          delay: reduceMotion ? 0 : 1.38,
          ease: EASE,
        }}
      >
        JADE KEVIN BALOCOS CALALO
      </motion.text>
    </motion.svg>
  )
}

/* ───────────── Everything that sits on the canvas ─────────────
   Rendered once live, then twice (frozen at its final state) inside the two
   halves that tear apart. Same markup → the swap is pixel-identical. */

function Stage({
  reduceMotion,
  frozen = false,
  svgRef,
}: {
  reduceMotion: boolean
  frozen?: boolean
  svgRef?: Ref<SVGSVGElement>
}) {
  const from = <T,>(v: T) => (frozen ? (false as const) : v)

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 44%, color-mix(in oklab, var(--primary) 7%, transparent), transparent 57%)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse at center, black, transparent 78%)",
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute top-5 left-5 flex items-center gap-2 sm:top-8 sm:left-8"
        initial={from({ opacity: 0, x: -8 })}
        animate={{ opacity: 0.52, x: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.6,
          delay: reduceMotion ? 0 : 0.12,
          ease: EASE,
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        <span className="font-mono text-[8px] tracking-[0.25em] uppercase">
          PERSONAL PORTFOLIO
        </span>
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute top-5 right-5 font-mono text-[8px] tracking-[0.22em] text-muted-foreground/45 sm:top-8 sm:right-8"
        initial={from({ opacity: 0, y: -5 })}
        animate={{ opacity: 0.55, y: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.6,
          delay: reduceMotion ? 0 : 0.2,
          ease: EASE,
        }}
      >
        26 / 01
      </motion.div>

      <main className="relative z-10 flex w-full flex-col items-center px-5">
        <motion.div
          className="mb-1 w-full max-w-[760px]"
          initial={from({ opacity: 0, scale: 0.985 })}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: reduceMotion ? 0 : 0.6,
            delay: reduceMotion ? 0 : 0.1,
            ease: EASE,
          }}
        >
          <JeydWordmark
            reduceMotion={reduceMotion}
            frozen={frozen}
            svgRef={svgRef}
          />
        </motion.div>

        <motion.div
          aria-hidden="true"
          className="mt-1 flex items-center gap-3 font-mono text-[8px] tracking-[0.24em] text-muted-foreground/45 uppercase sm:text-[9px]"
          initial={from({ opacity: 0, y: 6 })}
          animate={
            frozen ? { opacity: 0.48, y: 0 } : { opacity: [0, 0.7, 0.48], y: 0 }
          }
          transition={{
            duration: reduceMotion ? 0 : 0.65,
            delay: reduceMotion ? 0 : 1.6,
            ease: EASE,
          }}
        >
          <span>Design</span>
          <span className="h-px w-5 bg-primary/50" />
          <span>Code</span>
          <span className="h-px w-5 bg-primary/50" />
          <span>Make it matter</span>
        </motion.div>
      </main>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-5 bottom-6 left-5 flex items-end justify-between gap-4 sm:right-8 sm:bottom-8 sm:left-8"
        initial={from({ opacity: 0, y: 5 })}
        animate={{ opacity: 0.45, y: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.6,
          delay: reduceMotion ? 0 : 1.55,
          ease: EASE,
        }}
      >
        <span className="font-mono text-[7px] tracking-[0.2em] uppercase sm:text-[8px]">
          Independent creative developer
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[7px] tracking-[0.16em] uppercase sm:text-[8px]">
            Loading memory game
          </span>
          <motion.span
            className="block h-1 w-1 rounded-full bg-primary"
            initial={frozen ? false : undefined}
            animate={
              frozen
                ? { opacity: 0.7 }
                : reduceMotion
                  ? undefined
                  : { opacity: [0.25, 1, 0.25] }
            }
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* Progress now fills exactly up to the moment the cut begins. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-primary/70"
        initial={from({ scaleX: 0, opacity: 0.7 })}
        animate={{ scaleX: 1, opacity: 0.35 }}
        transition={{
          duration: reduceMotion ? 0 : HOLD_MS / 1000,
          ease: "linear",
        }}
      />
    </>
  )
}

/* ───────────── One half of the torn screen ───────────── */

function Half({
  side,
  cutY,
  vh,
  onDone,
}: {
  side: "top" | "bottom"
  cutY: number
  vh: number
  onDone?: () => void
}) {
  const isTop = side === "top"

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 bg-background will-change-transform"
      style={{
        // Same intro, sliced along the cut line. Top keeps everything above it…
        clipPath: isTop
          ? `inset(0px 0px ${vh - cutY}px 0px)`
          : // …bottom keeps everything below it.
            `inset(${cutY}px 0px 0px 0px)`,
      }}
      initial={{ y: 0 }}
      animate={{ y: isTop ? -(cutY + 12) : vh - cutY + 12 }}
      transition={{
        duration: SPLIT_S,
        delay: IGNITE_S + (isTop ? 0 : 0.05),
        ease: SPLIT_EASE,
      }}
      onAnimationComplete={onDone}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <Stage frozen reduceMotion={false} />
      </div>

      {/* Rim light: the freshly cut edge glows as the halves part. */}
      <motion.div
        className="absolute inset-x-0"
        style={{
          height: 120,
          top: isTop ? cutY - 120 : cutY,
          background: `linear-gradient(${
            isTop ? "to top" : "to bottom"
          }, color-mix(in oklab, var(--primary) 30%, transparent), transparent)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: EXIT_S, times: [0, 0.4, 1], ease: "easeOut" }}
      />

      {/* The laser: a hairline that draws outward from the centre, then travels
          with the edge it is attached to. */}
      <motion.span
        className="absolute inset-x-0 h-px bg-primary"
        style={{ top: isTop ? cutY - 1 : cutY, transformOrigin: "50% 50%" }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: [1, 1, 0] }}
        transition={{
          scaleX: { duration: IGNITE_S, ease: EASE },
          opacity: { duration: EXIT_S, times: [0, 0.55, 1], ease: "easeOut" },
        }}
      />
    </motion.div>
  )
}

/* ───────────── Intro ───────────── */

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const reduceMotion = Boolean(useReducedMotion())
  const completeRef = useRef(onComplete)
  const svgRef = useRef<SVGSVGElement>(null)
  const doneRef = useRef(false)
  const [cut, setCut] = useState<{ y: number; vh: number } | null>(null)

  // Keep the latest callback without restarting timers on parent renders.
  useEffect(() => {
    completeRef.current = onComplete
  }, [onComplete])

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    completeRef.current()
  }, [])

  // Reduced motion: no theatre, just a quick hand-off.
  useEffect(() => {
    if (!reduceMotion) return
    const timer = window.setTimeout(finish, 350)
    return () => window.clearTimeout(timer)
  }, [reduceMotion, finish])

  // Intro holds, then we measure the wordmark and make the cut.
  useEffect(() => {
    if (reduceMotion) return
    const timer = window.setTimeout(() => {
      const vh = window.innerHeight
      const rect = svgRef.current?.getBoundingClientRect()
      const y = rect ? rect.top + rect.height * CUT_RATIO : vh / 2
      setCut({ y: Math.round(y), vh })
    }, HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [reduceMotion])

  // Safety net in case the tab is throttled and animation callbacks are late.
  useEffect(() => {
    if (!cut) return
    const timer = window.setTimeout(finish, (EXIT_S + 0.4) * 1000)
    return () => window.clearTimeout(timer)
  }, [cut, finish])

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={`fixed inset-0 isolate z-[100] min-h-[100svh] w-full overflow-hidden text-foreground ${
          cut ? "pointer-events-none" : "bg-background"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        // The split plays inside the component, so the parent's exit is instant
        // (a soft fade only for reduced-motion users).
        exit={{ opacity: 0, transition: { duration: reduceMotion ? 0.3 : 0 } }}
        transition={{ duration: reduceMotion ? 0 : 0.42, ease: EASE }}
        role="status"
        aria-label="Portfolio introduction. Loading memory game."
      >
        {!cut ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Stage reduceMotion={reduceMotion} svgRef={svgRef} />
          </div>
        ) : (
          <>
            {/* Light that spills out of the seam, seen only through the gap. */}
            <motion.div
              aria-hidden="true"
              className="absolute inset-x-0"
              style={{
                top: cut.y - cut.vh * 0.22,
                height: cut.vh * 0.44,
                transformOrigin: "50% 50%",
                background:
                  "radial-gradient(ellipse 70% 50% at 50% 50%, color-mix(in oklab, var(--primary) 42%, transparent), transparent 72%)",
              }}
              initial={{ scaleY: 0.04, opacity: 0 }}
              animate={{ scaleY: 1, opacity: [0, 1, 0] }}
              transition={{
                scaleY: {
                  duration: SPLIT_S,
                  delay: IGNITE_S * 0.6,
                  ease: EASE,
                },
                opacity: {
                  duration: EXIT_S,
                  delay: IGNITE_S * 0.6,
                  times: [0, 0.35, 1],
                  ease: "easeOut",
                },
              }}
            />

            <Half side="top" cutY={cut.y} vh={cut.vh} />
            <Half side="bottom" cutY={cut.y} vh={cut.vh} onDone={finish} />
          </>
        )}
      </motion.div>
    </MotionConfig>
  )
}
