"use client"

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react"
import { MotionConfig, motion, useReducedMotion } from "framer-motion"

type IntroScreenProps = {
  onComplete: () => void
}

const EASE = [0.22, 1, 0.36, 1] as const
const DRAG_EASE = [0.65, 0, 0.35, 1] as const
// Slow start, violent middle, soft landing: the "tear" of the split.
const SPLIT_EASE = [0.76, 0, 0.18, 1] as const

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace"

/* ───────────── THE IDEA ─────────────
   The wordmark is not typed, it is *made*, on screen, the way you would make
   it in a design tool, and then it ships:

   1. DESIGN  Cap-height and baseline guides slide in. The four letters are
              drawn as true vector outlines, anchor points popping along them.
   2. BUILD   Ink rises through each letter. A cursor (yours, labelled "Jade")
              drags a selection box around the finished mark and a size pill
              confirms it. Design → code → ship, in one gesture.
   3. SHIP    The overlay fades, the mark is left clean, and the screen tears
              open along the cut to reveal the game underneath.

   The letterforms are real Bodoni Moda outlines (SIL Open Font License 1.1)
   baked into this file as SVG paths, so the wordmark looks identical on every
   device. No font is loaded or required, and the drawing animation is possible
   because they are paths, not text. */

/* ───────────── Timeline (seconds) ───────────── */

const HOLD_MS = 3_000
const IGNITE_S = 0.34
const SPLIT_S = 0.95
const EXIT_S = IGNITE_S + SPLIT_S + 0.05

const GUIDE_AT = 0.1
const draw = (i: number) => ({ at: 0.3 + i * 0.16, dur: 0.85 })
const fill = (i: number) => ({ at: 1.0 + i * 0.13, dur: 0.8 })

const CURSOR_AT = 1.15
const DRAG_AT = 1.75
const DRAG_DUR = 0.6
const OVERLAY_OUT_AT = 2.72
const OVERLAY_OUT_DUR = 0.25

/* ───────────── Geometry ─────────────
   Glyph coordinates: baseline y = 0, cap height = -150. */

const INK = { x0: 1.6, y0: -150, x1: 530.9, y1: 6.1 }
const BOX_PAD = 14
const BOX = {
  x0: INK.x0 - BOX_PAD,
  y0: INK.y0 - BOX_PAD,
  x1: INK.x1 + BOX_PAD,
  y1: INK.y1 + BOX_PAD,
}
const BOX_W = BOX.x1 - BOX.x0
const BOX_H = BOX.y1 - BOX.y0
const BOX_CX = (BOX.x0 + BOX.x1) / 2
const BOX_CY = (BOX.y0 + BOX.y1) / 2

// Room around the selection box (and below it for the size pill).
const VB = {
  x: BOX.x0 - 30,
  y: BOX.y0 - 24,
  w: BOX_W + 60,
  h: BOX_H + 24 + 58,
}

// Where the cut lands: through the middle arm of the E (glyph y = -76).
const CUT_Y = -76
const CUT_RATIO = (CUT_Y - VB.y) / VB.h

const pctY = (y: number) => `${((y - VB.y) / VB.h) * 100}%`

const SIZE_LABEL = `${Math.round(INK.x1 - INK.x0)} × ${Math.round(
  INK.y1 - INK.y0
)}`

/* ───────────── Letterforms: JEYD, Bodoni Moda 600 ───────────── */

const GLYPHS = [
  {
    char: "J",
    bounds: [1.6, -150, 94, 6.1] as const,
    d: "M94 -150V-149.6H74V-34Q71.7 -27.6 68.3 -20.6Q65 -13.6 60.1 -7.6Q55.2 -1.5 48.3 2.3Q41.5 6.1 32.1 6.1Q22.9 6.1 16 2.7Q9.2 -0.7 5.4 -6.3Q1.6 -11.8 1.6 -18.3Q1.6 -23.4 3.7 -27.1Q5.8 -30.8 9.3 -32.8Q12.8 -34.8 16.9 -34.8Q20.4 -34.8 23.9 -33.1Q27.4 -31.4 29.8 -28Q32.1 -24.6 32.1 -19.6Q32.1 -14.9 30 -11.7Q27.8 -8.5 24.4 -6.8Q20.9 -5.2 16.9 -5.2Q12.3 -5.2 8 -8Q3.6 -10.9 2.3 -15.2Q3.2 -9.4 7.1 -4.7Q11 -0 16.9 2.6Q22.9 5.3 30 5.3Q37.5 5.3 41.3 0.3Q45.2 -4.7 46.5 -14.4Q47.9 -24.1 47.9 -38V-149.6H21.9V-150Z",
    anchors: [
      [94, -150],
      [94, -149.6],
      [74, -149.6],
      [74, -34],
      [32.1, 6.1],
      [1.6, -18.3],
      [16.9, -34.8],
      [32.1, -19.6],
      [16.9, -5.2],
      [2.3, -15.2],
      [30, 5.3],
      [47.9, -38],
      [47.9, -149.6],
      [21.9, -149.6],
      [21.9, -150],
    ] as const,
  },
  {
    char: "E",
    bounds: [110.5, -150, 222.9, 0] as const,
    d: "M110.5 0V-0.4H128.4V-149.6H110.5V-150H220.8V-109H220.5Q219.6 -119.7 215 -129Q210.3 -138.2 202.1 -143.9Q193.8 -149.6 182.1 -149.6H154.7V-0.4H180.1Q193.8 -0.4 202.9 -6.3Q211.9 -12.1 216.8 -22.2Q221.6 -32.3 222.5 -45H222.9V0ZM188.3 -53.8Q187.4 -60.5 183.7 -65.8Q180 -71.2 174.7 -74.3Q169.4 -77.4 163.7 -77.4H146.4V-77.8H163.7Q169.4 -77.8 174.7 -80.6Q180 -83.5 183.7 -88.6Q187.4 -93.7 188.3 -100.4H188.7V-53.8Z",
    anchors: [
      [110.5, 0],
      [110.5, -0.4],
      [128.4, -0.4],
      [128.4, -149.6],
      [110.5, -149.6],
      [110.5, -150],
      [220.8, -150],
      [220.8, -109],
      [220.5, -109],
      [182.1, -149.6],
      [154.7, -149.6],
      [154.7, -0.4],
      [180.1, -0.4],
      [222.5, -45],
      [222.9, -45],
      [222.9, 0],
      [188.3, -53.8],
      [163.7, -77.4],
      [146.4, -77.4],
      [146.4, -77.8],
      [163.7, -77.8],
      [188.3, -100.4],
      [188.7, -100.4],
      [188.7, -53.8],
    ] as const,
  },
  {
    char: "Y",
    bounds: [240.2, -150, 380.8, 0] as const,
    d: "M281.3 0V-0.4H299.3V-72L253.7 -149.6H240.2V-150H305.4V-149.6H284.1L325.1 -76.9L362.1 -149.6H338.8V-150H380.8V-149.6H362.7L325.5 -76.6V-0.4H345.6V0Z",
    anchors: [
      [281.3, 0],
      [281.3, -0.4],
      [299.3, -0.4],
      [299.3, -72],
      [253.7, -149.6],
      [240.2, -149.6],
      [240.2, -150],
      [305.4, -150],
      [305.4, -149.6],
      [284.1, -149.6],
      [325.1, -76.9],
      [362.1, -149.6],
      [338.8, -149.6],
      [338.8, -150],
      [380.8, -150],
      [380.8, -149.6],
      [362.7, -149.6],
      [325.5, -76.6],
      [325.5, -0.4],
      [345.6, -0.4],
      [345.6, 0],
    ] as const,
  },
  {
    char: "D",
    bounds: [395.7, -150, 530.9, 0] as const,
    d: "M456.4 -150Q479.6 -150 496.3 -140.4Q512.9 -130.8 521.9 -113.8Q530.9 -96.9 530.9 -75Q530.9 -58.6 525.5 -44.8Q520.1 -31.1 510.3 -21.1Q500.4 -11 486.7 -5.5Q473.1 0 456.4 0H395.7V-0.4H413.6V-149.6H395.7V-150ZM439.9 -0.4H456.4Q468.9 -0.4 477.4 -6.6Q485.8 -12.8 491 -23.4Q496.1 -33.9 498.4 -47.3Q500.6 -60.7 500.6 -75Q500.6 -89.4 498.1 -102.7Q495.5 -116.1 490.2 -126.6Q484.9 -137.2 476.5 -143.4Q468.2 -149.6 456.4 -149.6H439.9Z",
    anchors: [
      [456.4, -150],
      [530.9, -75],
      [456.4, 0],
      [395.7, 0],
      [395.7, -0.4],
      [413.6, -0.4],
      [413.6, -149.6],
      [395.7, -149.6],
      [395.7, -150],
      [439.9, -0.4],
      [456.4, -0.4],
      [500.6, -75],
      [456.4, -149.6],
      [439.9, -149.6],
    ] as const,
  },
] as const

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
  const uid = useId().replace(/:/g, "")
  const gradientId = `jeyd-grad-${uid}`
  const titleId = `jeyd-title-${uid}`
  // Static = final frame only (the frozen halves, and reduced motion).
  const isStatic = frozen || reduceMotion

  const handles: Array<[number, number]> = [
    [BOX.x0, BOX.y0],
    [BOX_CX, BOX.y0],
    [BOX.x1, BOX.y0],
    [BOX.x0, BOX_CY],
    [BOX.x1, BOX_CY],
    [BOX.x0, BOX.y1],
    [BOX_CX, BOX.y1],
    [BOX.x1, BOX.y1],
  ]

  const dragEnd = DRAG_AT + DRAG_DUR
  const cursorDur = dragEnd - CURSOR_AT
  const cursorTimes = [0, (DRAG_AT - CURSOR_AT) / cursorDur, 1]
  const cursorEntry = { x: BOX.x1 + 90, y: BOX.y1 + 80 }

  return (
    <svg
      ref={svgRef}
      aria-labelledby={titleId}
      className="block h-auto w-full overflow-visible"
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      role="img"
    >
      <title id={titleId}>JEYD — personal portfolio</title>

      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={INK.x0}
          y1="0"
          x2={INK.x1}
          y2="0"
        >
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="56%" stopColor="currentColor" />
          <stop offset="100%" stopColor="var(--primary)" />
        </linearGradient>
        {!isStatic &&
          GLYPHS.map((g, i) => (
            <clipPath key={g.char} id={`${uid}-clip-${i}`}>
              <path d={g.d} />
            </clipPath>
          ))}
      </defs>

      {/* Final, solid letterforms */}
      {isStatic &&
        GLYPHS.map((g) => (
          <path key={g.char} d={g.d} fill={`url(#${gradientId})`} />
        ))}

      {!isStatic && (
        <>
          {/* 1 · DESIGN: outlines are drawn, anchor points pop along them */}
          {GLYPHS.map((g, i) => (
            <motion.path
              key={`o-${g.char}`}
              d={g.d}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.15}
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 1 }}
              animate={{ pathLength: 1, opacity: 0 }}
              transition={{
                pathLength: {
                  duration: draw(i).dur,
                  delay: draw(i).at,
                  ease: EASE,
                },
                opacity: {
                  duration: 0.3,
                  delay: fill(i).at + fill(i).dur - 0.1,
                },
              }}
            />
          ))}

          {GLYPHS.map((g, i) =>
            g.anchors.map(([ax, ay], k) => (
              <motion.rect
                key={`a-${g.char}-${k}`}
                x={ax - 2.5}
                y={ay - 2.5}
                width={5}
                height={5}
                fill="var(--background)"
                stroke="var(--primary)"
                strokeWidth={0.9}
                style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1, 1, 0] }}
                transition={{
                  duration: 1.5,
                  delay: draw(i).at + k * 0.016,
                  times: [0, 0.1, 0.75, 1],
                  ease: "easeOut",
                }}
              />
            ))
          )}

          {/* 2 · BUILD: ink rises through each letter, with a bright leading edge */}
          {GLYPHS.map((g, i) => {
            const w = g.bounds[2] - g.bounds[0] + 8
            const x = g.bounds[0] - 4
            return (
              <g key={`f-${g.char}`} clipPath={`url(#${uid}-clip-${i})`}>
                <motion.rect
                  x={x}
                  y={-158}
                  width={w}
                  height={170}
                  fill={`url(#${gradientId})`}
                  style={{ originY: 1, transformBox: "fill-box" }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{
                    duration: fill(i).dur,
                    delay: fill(i).at,
                    ease: EASE,
                  }}
                />
                <motion.rect
                  x={x}
                  y={11}
                  width={w}
                  height={1.4}
                  fill="var(--primary)"
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: -169, opacity: [0, 1, 1, 0] }}
                  transition={{
                    y: { duration: fill(i).dur, delay: fill(i).at, ease: EASE },
                    opacity: {
                      duration: fill(i).dur,
                      delay: fill(i).at,
                      times: [0, 0.1, 0.85, 1],
                    },
                  }}
                />
              </g>
            )
          })}

          {/* Selection, size pill and your cursor. Gone before the cut. */}
          <motion.g
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{
              delay: OVERLAY_OUT_AT,
              duration: OVERLAY_OUT_DUR,
              ease: "easeOut",
            }}
          >
            <motion.rect
              x={BOX.x0}
              y={BOX.y0}
              fill="var(--primary)"
              fillOpacity={0.05}
              stroke="var(--primary)"
              strokeWidth={1}
              initial={{ width: 0, height: 0 }}
              animate={{ width: BOX_W, height: BOX_H }}
              transition={{
                duration: DRAG_DUR,
                delay: DRAG_AT,
                ease: DRAG_EASE,
              }}
            />

            {handles.map(([hx, hy], i) => (
              <motion.rect
                key={i}
                x={hx - 3}
                y={hy - 3}
                width={6}
                height={6}
                fill="var(--background)"
                stroke="var(--primary)"
                strokeWidth={1}
                style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 0.28,
                  delay: dragEnd + i * 0.025,
                  ease: EASE,
                }}
              />
            ))}

            <g transform={`translate(${BOX_CX} ${BOX.y1 + 11})`}>
              <motion.g
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: dragEnd + 0.12,
                  ease: EASE,
                }}
              >
                <rect
                  x={-36}
                  y={0}
                  width={72}
                  height={17}
                  rx={3.5}
                  fill="var(--primary)"
                />
                <text
                  x={0}
                  y={11.7}
                  textAnchor="middle"
                  fill="var(--primary-foreground)"
                  fontFamily={MONO}
                  fontSize={8.6}
                  letterSpacing={0.4}
                >
                  {SIZE_LABEL}
                </text>
              </motion.g>
            </g>

            <motion.g
              initial={{ x: cursorEntry.x, y: cursorEntry.y, opacity: 0 }}
              animate={{
                x: [cursorEntry.x, BOX.x0, BOX.x1],
                y: [cursorEntry.y, BOX.y0, BOX.y1],
                opacity: [0, 1, 1],
              }}
              transition={{
                x: {
                  duration: cursorDur,
                  delay: CURSOR_AT,
                  times: cursorTimes,
                  ease: [EASE, DRAG_EASE],
                },
                y: {
                  duration: cursorDur,
                  delay: CURSOR_AT,
                  times: cursorTimes,
                  ease: [EASE, DRAG_EASE],
                },
                opacity: {
                  duration: cursorDur,
                  delay: CURSOR_AT,
                  times: [0, 0.12, 1],
                },
              }}
            >
              <path
                d="M0 0 L0 16 L4.2 12.2 L7 18.5 L9.4 17.4 L6.6 11.2 L12 11.2 Z"
                fill="var(--primary)"
                stroke="var(--background)"
                strokeWidth={1.2}
                strokeLinejoin="round"
              />
              <rect
                x={11}
                y={15}
                width={33}
                height={14}
                rx={3.5}
                fill="var(--primary)"
              />
              <text
                x={27.5}
                y={24.9}
                textAnchor="middle"
                fill="var(--primary-foreground)"
                fontFamily={MONO}
                fontSize={8}
                letterSpacing={0.3}
              >
                Jade
              </text>
            </motion.g>
          </motion.g>
        </>
      )}
    </svg>
  )
}

/* One line of text that rises out of a mask. */
function Reveal({
  children,
  delay,
  frozen,
  reduceMotion,
  className = "",
}: {
  children: ReactNode
  delay: number
  frozen: boolean
  reduceMotion: boolean
  className?: string
}) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block"
        initial={frozen ? false : { y: "110%" }}
        animate={{ y: "0%" }}
        transition={{
          duration: reduceMotion ? 0 : 0.7,
          delay: reduceMotion ? 0 : delay,
          ease: EASE,
        }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/* ───────────── Everything that sits on the canvas ─────────────
   Rendered once live, then twice (frozen at its final state) inside the two
   halves that tear apart. Same markup → the swap is pixel-identical. All
   transient design overlays (guides, anchors, selection, cursor) are gone by
   the end of the hold, so the frozen copy simply never renders them. */

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
  const showOverlay = !frozen && !reduceMotion

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

      {/* The canvas grid of a design tool */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse at center, black, transparent 78%)",
          WebkitMaskImage:
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
        <div className="relative w-full max-w-[min(88vw,860px)]">
          {/* Cap-height and baseline guides, edge to edge */}
          {showOverlay &&
            [-150, 0].map((y, i) => (
              <div
                key={y}
                aria-hidden="true"
                className="pointer-events-none absolute"
                style={{
                  top: pctY(y),
                  left: "50%",
                  width: "100vw",
                  marginLeft: "-50vw",
                  height: 1,
                }}
              >
                <motion.div
                  className="h-full w-full bg-gradient-to-r from-transparent via-primary/55 to-transparent"
                  initial={{ scaleX: 0, opacity: 1 }}
                  animate={{ scaleX: 1, opacity: 0 }}
                  transition={{
                    scaleX: {
                      duration: 0.9,
                      delay: GUIDE_AT + i * 0.08,
                      ease: EASE,
                    },
                    opacity: {
                      duration: OVERLAY_OUT_DUR,
                      delay: OVERLAY_OUT_AT,
                      ease: "easeOut",
                    },
                  }}
                />
              </div>
            ))}

          <JeydWordmark
            reduceMotion={reduceMotion}
            frozen={frozen}
            svgRef={svgRef}
          />
        </div>

        <div
          aria-hidden="true"
          className="mt-1 flex flex-col items-center gap-3 font-mono uppercase"
        >
          <Reveal
            delay={1.95}
            frozen={frozen}
            reduceMotion={reduceMotion}
            className="text-[8px] tracking-[0.34em] text-foreground/55 sm:text-[9px]"
          >
            Jade Kevin Balocos Calalo
          </Reveal>
          <Reveal
            delay={2.1}
            frozen={frozen}
            reduceMotion={reduceMotion}
            className="text-[8px] tracking-[0.24em] text-muted-foreground/50 sm:text-[9px]"
          >
            <span className="flex items-center gap-3">
              <span>Design</span>
              <span className="h-px w-5 bg-primary/50" />
              <span>Code</span>
              <span className="h-px w-5 bg-primary/50" />
              <span>Make it matter</span>
            </span>
          </Reveal>
        </div>
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

      {/* Progress fills exactly up to the moment the cut begins. */}
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
      className="absolute inset-0 bg-background text-foreground will-change-transform"
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
        

            <Half side="top" cutY={cut.y} vh={cut.vh} />
            <Half side="bottom" cutY={cut.y} vh={cut.vh} onDone={finish} />
          </>
        )}
      </motion.div>
    </MotionConfig>
  )
}
