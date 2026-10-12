"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion"
import {
  Atom,
  Brain,
  Braces,
  Check,
  ChevronDown,
  Database,
  Layers3,
  Lock,
  MousePointerClick,
  Music2,
  PenTool,
  Play,
  RotateCcw,
  Server,
  SkipForward,
  Sparkles,
  Star,
  Target,
  Timer,
  Volume2,
  VolumeX,
  Wind,
  Workflow,
  type LucideIcon,
} from "lucide-react"
import {
  GAME_SOUND_OPTIONS,
  getCurrentGameSound,
  getGameMuted,
  playButtonHover,
  playCardFlip,
  playGameMusic,
  playMatchSuccess,
  setGameMuted,
  setGameSound,
  stopGameMusic,
  switchGameMusic,
} from "@/lib/audio"

// ─── CONFIG ────────────────────────────────────────────────────────────────

const SKIP_DELAY_SECONDS = 5
const SKIP_DELAY_MS = SKIP_DELAY_SECONDS * 1000
const FLIP_MS = 500
const MISMATCH_VIEW_MS = 1000
const MATCH_SETTLE_MS = FLIP_MS + 150
const EASE = [0.22, 1, 0.36, 1] as const
const MONOGRAM = "J"
const DISPLAY_FONT = "'Bodoni 72', 'Didot', 'Times New Roman', serif"

// ─── TYPES ─────────────────────────────────────────────────────────────────

type Card = {
  id: number
  value: string
  tag: string
  Icon: LucideIcon
  flipped: boolean
  matched: boolean
}

type MemoryGameProps = {
  onComplete: () => void
  /** When true, skip the opacity fade-in (used when revealed under the intro split). */
  instant?: boolean
}

type SkipControl = {
  ready: boolean
  progress: number
  remaining: number
  onSkip: () => void
}

// ─── CARD DATA ─────────────────────────────────────────────────────────────

const CARD_DATA: Array<{ value: string; tag: string; Icon: LucideIcon }> = [
  { value: "React", tag: "Interface", Icon: Atom },
  { value: "TypeScript", tag: "Language", Icon: Braces },
  { value: "Node.js", tag: "Runtime", Icon: Server },
  { value: "Tailwind", tag: "Styling", Icon: Wind },
  { value: "Figma", tag: "Design", Icon: PenTool },
  { value: "UI Systems", tag: "Components", Icon: Layers3 },
  { value: "API Logic", tag: "Backend", Icon: Workflow },
  { value: "Database", tag: "Data", Icon: Database },
]

const shuffle = <T,>(array: T[]): T[] => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function createDeck(): Card[] {
  return shuffle(
    [...CARD_DATA, ...CARD_DATA].map((item, index) => ({
      id: index,
      value: item.value,
      tag: item.tag,
      Icon: item.Icon,
      flipped: false,
      matched: false,
    }))
  )
}

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"

const hiddenBackface: React.CSSProperties = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
}

// ─── AUDIO CONTROLS ────────────────────────────────────────────────────────

function AudioControls({
  muted,
  sound,
  onToggleMute,
  onSoundChange,
}: {
  muted: boolean
  sound: string
  onToggleMute: () => void
  onSoundChange: (next: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const currentLabel =
    GAME_SOUND_OPTIONS.find((option) => option.value === sound)?.label ??
    "Pulse"

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!menuOpen || menuRef.current?.contains(event.target as Node)) return
      setMenuOpen(false)
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }
    window.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("keydown", onEscape)
    return () => {
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("keydown", onEscape)
    }
  }, [menuOpen])

  return (
    <div
      ref={menuRef}
      className="fixed top-3 left-1/2 z-40 flex w-[min(90vw,26rem)] -translate-x-1/2 items-center gap-1.5 rounded-full border border-border/65 bg-background/90 px-1.5 py-1.5 shadow-[0_14px_40px_-28px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:top-4 sm:right-4 sm:left-auto sm:w-auto sm:translate-x-0"
    >
      <button
        type="button"
        onClick={onToggleMute}
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border/60 bg-card/65 text-foreground transition-colors hover:bg-card sm:h-9 sm:w-9 ${focusRing}`}
        aria-label={muted ? "Unmute game audio" : "Mute game audio"}
        aria-pressed={muted}
      >
        {muted ? (
          <VolumeX className="h-3.5 w-3.5" />
        ) : (
          <Volume2 className="h-3.5 w-3.5" />
        )}
      </button>

      <div className="relative min-w-0 flex-1 sm:flex-initial">
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className={`flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-full border border-border/60 bg-card/65 px-3 text-left text-foreground transition-colors hover:bg-card sm:h-9 sm:w-[210px] sm:px-3.5 ${focusRing}`}
          aria-expanded={menuOpen}
          aria-haspopup="listbox"
          aria-label={`Soundtrack: ${currentLabel}`}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <Music2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate font-mono text-[0.62rem] font-medium tracking-[0.18em] text-foreground uppercase sm:text-[0.67rem]">
              {currentLabel}
            </span>
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="absolute top-[calc(100%+0.45rem)] right-0 z-50 w-full overflow-hidden rounded-[1rem] border border-border/75 bg-popover/96 p-1 text-popover-foreground shadow-[0_24px_64px_-36px_rgba(0,0,0,0.7)] backdrop-blur-xl"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              role="listbox"
              aria-label="Soundtrack"
            >
              {GAME_SOUND_OPTIONS.map((option) => {
                const active = option.value === sound
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onSoundChange(option.value)
                      setMenuOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-[0.75rem] px-3 py-2 text-left transition-colors ${active ? "bg-primary/10 text-foreground ring-1 ring-primary/18 ring-inset" : "text-muted-foreground hover:bg-muted/65 hover:text-foreground"}`}
                    role="option"
                    aria-selected={active}
                  >
                    <span className="font-mono text-[0.62rem] tracking-[0.16em] uppercase sm:text-[0.67rem]">
                      {option.label}
                    </span>
                    {active && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── SKIP BUTTON ───────────────────────────────────────────────────────────

function SkipButton({
  skip,
  size = "md",
  className = "",
}: {
  skip: SkipControl
  size?: "sm" | "md"
  className?: string
}) {
  const { ready, progress, remaining, onSkip } = skip
  const small = size === "sm"
  const radius = small ? 9 : 11
  const center = small ? 12 : 15
  const circumference = 2 * Math.PI * radius

  return (
    <button
      type="button"
      onClick={onSkip}
      disabled={!ready}
      aria-label={
        ready
          ? "Skip the game and open the portfolio"
          : `Skip the game. Available in ${remaining} seconds`
      }
      className={`group inline-flex shrink-0 items-center rounded-full border font-medium transition-colors ${focusRing} ${small ? "gap-2 py-1 pr-3 pl-1 text-xs" : "h-12 gap-2.5 pr-5 pl-2 text-[13px]"} ${className} ${ready ? "border-border/80 bg-card/70 text-foreground hover:bg-card" : "cursor-not-allowed border-border/50 bg-background/30 text-muted-foreground/70"}`}
    >
      <span
        className={`relative grid place-items-center ${small ? "h-6 w-6" : "h-8 w-8"}`}
      >
        <svg
          viewBox={small ? "0 0 24 24" : "0 0 30 30"}
          className="absolute inset-0 -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border/70"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-primary"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            style={{ transition: "stroke-dashoffset 120ms linear" }}
          />
        </svg>
        {ready ? (
          <SkipForward
            className={`relative text-primary ${small ? "h-3 w-3" : "h-3.5 w-3.5"}`}
          />
        ) : (
          <span
            className={`relative font-mono tabular-nums ${small ? "text-[10px]" : "text-[11px]"}`}
          >
            {remaining}
          </span>
        )}
      </span>
      <span>
        {ready ? (small ? "Skip" : "Skip game") : `Skip in ${remaining}s`}
      </span>
    </button>
  )
}

// ─── STAT STRIP ────────────────────────────────────────────────────────────

function StatStrip({
  moves,
  time,
  stars,
}: {
  moves: number
  time: string
  stars: number
}) {
  const cell =
    "flex items-center justify-center gap-2 px-2 py-2.5 sm:justify-start sm:gap-3 sm:px-4"
  const label =
    "text-[10px] leading-none text-muted-foreground/70 sm:text-[11px]"
  const value =
    "mt-1 text-sm leading-none font-semibold tracking-tight text-foreground tabular-nums sm:text-base"

  return (
    <div className="grid grid-cols-3 divide-x divide-border/50 overflow-hidden rounded-[0.9rem] border border-border/55 bg-background/30">
      <div className={cell}>
        <MousePointerClick className="h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className={label}>Moves</p>
          <p className={value}>{moves}</p>
        </div>
      </div>
      <div className={cell}>
        <Timer className="h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className={label}>Time</p>
          <p className={value}>{time}</p>
        </div>
      </div>
      <div className={cell}>
        <Star className="hidden h-4 w-4 shrink-0 text-primary sm:block" />
        <div>
          <p className={label}>Rating</p>
          <p
            className={`${value} flex items-center gap-0.5`}
            role="img"
            aria-label={`${stars} of 3 stars`}
          >
            {[1, 2, 3].map((n) => (
              <Star
                key={n}
                className={`h-3 w-3 transition-colors sm:h-3.5 sm:w-3.5 ${n <= stars ? "fill-current text-primary" : "text-muted-foreground/30"}`}
              />
            ))}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── MEMORY CARD ───────────────────────────────────────────────────────────

function CornerTicks() {
  const tick =
    "absolute h-2 w-2 border-foreground/20 transition-all duration-300"
  return (
    <>
      <span
        className={`${tick} top-1.5 left-1.5 border-t border-l group-hover:top-1 group-hover:left-1`}
      />
      <span
        className={`${tick} top-1.5 right-1.5 border-t border-r group-hover:top-1 group-hover:right-1`}
      />
      <span
        className={`${tick} bottom-1.5 left-1.5 border-b border-l group-hover:bottom-1 group-hover:left-1`}
      />
      <span
        className={`${tick} right-1.5 bottom-1.5 border-r border-b group-hover:right-1 group-hover:bottom-1`}
      />
    </>
  )
}

function MemoryCard({
  card,
  index,
  wrong,
  disabled,
  canHover,
  reduceMotion,
  onFlip,
}: {
  card: Card
  index: number
  wrong: boolean
  disabled: boolean
  canHover: boolean
  reduceMotion: boolean
  onFlip: () => void
}) {
  const Icon = card.Icon
  const faceUp = card.flipped || card.matched

  return (
    <motion.button
      type="button"
      className={`group relative aspect-square touch-manipulation rounded-[0.9rem] sm:rounded-[1.1rem] ${focusRing}`}
      onClick={onFlip}
      disabled={disabled}
      whileHover={canHover ? { scale: 1.04 } : undefined}
      whileTap={canHover ? { scale: 0.97 } : undefined}
      aria-label={
        faceUp
          ? `${card.value}${card.matched ? ", matched" : ""}`
          : `Card ${index + 1}, face down`
      }
    >
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: reduceMotion ? 0 : index * 0.035,
          ease: EASE,
        }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ perspective: 900 }}
          animate={wrong ? { x: [0, -5, 5, -4, 4, 0] } : { x: 0 }}
          transition={
            wrong
              ? { duration: 0.4, delay: FLIP_MS / 1000, ease: "easeInOut" }
              : { duration: 0 }
          }
        >
          <motion.div
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: faceUp ? 180 : 0 }}
            transition={{
              duration: reduceMotion ? 0 : FLIP_MS / 1000,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <div
              className="absolute inset-0 overflow-hidden rounded-[inherit] border border-border/65 bg-card shadow-[0_12px_32px_-24px_rgba(0,0,0,0.68)] transition-colors group-hover:border-border"
              style={hiddenBackface}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(color-mix(in oklab, var(--foreground) 16%, transparent) 1px, transparent 1px)",
                  backgroundSize: "10px 10px",
                  maskImage:
                    "radial-gradient(circle at center, black 10%, transparent 72%)",
                  WebkitMaskImage:
                    "radial-gradient(circle at center, black 10%, transparent 72%)",
                }}
              />
              <CornerTicks />
              <span
                className="absolute inset-0 grid place-items-center text-[1.6rem] leading-none text-foreground/25 transition-colors duration-300 group-hover:text-primary/70 sm:text-[2.4rem]"
                style={{ fontFamily: DISPLAY_FONT }}
                aria-hidden="true"
              >
                {MONOGRAM}
              </span>
            </div>

            <div
              className={`absolute inset-0 rounded-[inherit] border shadow-[0_12px_32px_-24px_rgba(0,0,0,0.68)] transition-colors duration-300 ${card.matched ? "border-primary/45 bg-primary/10" : wrong ? "border-destructive/50 bg-destructive/10" : "border-primary/25 bg-card"}`}
              style={{ ...hiddenBackface, transform: "rotateY(180deg)" }}
            >
              <div className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_40%)]" />
              <div className="relative flex h-full flex-col items-center justify-center gap-1.5 p-1 text-center sm:gap-2 sm:p-2">
                <div
                  className={`grid h-9 w-9 place-items-center rounded-[0.7rem] border sm:h-12 sm:w-12 sm:rounded-[0.9rem] ${card.matched ? "border-primary/30 bg-primary/12 text-primary" : wrong ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-border/55 bg-background/55 text-foreground"}`}
                >
                  <Icon className="h-[18px] w-[18px] sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[10px] leading-tight font-semibold tracking-tight text-foreground sm:text-xs">
                    {card.value}
                  </p>
                  <p className="mt-0.5 hidden text-[10px] leading-none text-muted-foreground/60 sm:block">
                    {card.tag}
                  </p>
                </div>
              </div>

              {card.matched && (
                <>
                  <motion.span
                    className="absolute top-1 right-1 z-10 grid h-4 w-4 place-items-center rounded-full bg-primary text-primary-foreground sm:top-1.5 sm:right-1.5 sm:h-5 sm:w-5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  >
                    <Check
                      className="h-2.5 w-2.5 sm:h-3 sm:w-3"
                      strokeWidth={3}
                    />
                  </motion.span>
                  {!reduceMotion && (
                    <motion.span
                      className="pointer-events-none absolute inset-0 rounded-[inherit] border-2 border-primary/60"
                      initial={{ opacity: 0.7, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.18 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.button>
  )
}

// ─── MANIFEST ──────────────────────────────────────────────────────────────

function ManifestList({
  matchedValues,
  matched,
}: {
  matchedValues: Set<string>
  matched: number
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Stack to find
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground/65">
            Ticks off as you match
          </p>
        </div>
        <p className="text-sm font-semibold text-foreground tabular-nums">
          {matched}
          <span className="font-normal text-muted-foreground/60">
            {" "}
            / {CARD_DATA.length}
          </span>
        </p>
      </div>
      <ul className="space-y-1.5">
        {CARD_DATA.map(({ value, tag, Icon }) => {
          const found = matchedValues.has(value)
          return (
            <li
              key={value}
              className={`flex items-center gap-3 rounded-[0.8rem] border px-2.5 py-2 transition-colors duration-300 ${found ? "border-primary/30 bg-primary/8" : "border-border/45 bg-background/25"}`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors duration-300 ${found ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground/50"}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm leading-tight font-medium transition-colors ${found ? "text-foreground" : "text-muted-foreground/70"}`}
                >
                  {value}
                </p>
                <p className="mt-0.5 text-[11px] leading-none text-muted-foreground/55">
                  {tag}
                </p>
              </div>
              {found ? (
                <motion.span
                  className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </motion.span>
              ) : (
                <span className="h-5 w-5 rounded-full border border-dashed border-border/60" />
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ManifestChips({
  matchedValues,
  matched,
}: {
  matchedValues: Set<string>
  matched: number
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[0.9rem] border border-border/50 bg-background/30 px-2.5 py-2">
      <div className="flex items-center gap-1" aria-hidden="true">
        {CARD_DATA.map(({ value, Icon }) => {
          const done = matchedValues.has(value)
          return (
            <motion.span
              key={value}
              title={value}
              className={`grid h-7 w-7 place-items-center rounded-lg border transition-colors duration-300 sm:h-8 sm:w-8 ${done ? "border-primary/30 bg-primary/10 text-primary" : "border-dashed border-border/50 text-muted-foreground/30"}`}
              animate={done ? { scale: [1, 1.18, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Icon className="h-3.5 w-3.5" />
            </motion.span>
          )
        })}
      </div>
      <p className="shrink-0 text-xs font-medium text-muted-foreground/80 tabular-nums">
        {matched}/{CARD_DATA.length}
        <span className="sr-only"> pairs matched</span>
      </p>
    </div>
  )
}

// ─── START SCREEN ──────────────────────────────────────────────────────────

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
}
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

const STEPS: Array<{ Icon: LucideIcon; title: string; body: string }> = [
  {
    Icon: MousePointerClick,
    title: "Flip two cards",
    body: "Tap to reveal the tools underneath.",
  },
  {
    Icon: Target,
    title: "Match all 8 pairs",
    body: "Fewer moves earn more stars.",
  },
  {
    Icon: Sparkles,
    title: "Enter the portfolio",
    body: "Opens automatically when you finish.",
  },
]

type FanSlot = {
  x: number
  y: number
  r: number
  z: number
  kind: "face" | "back"
  Icon?: LucideIcon
  label?: string
  hideOnMobile?: boolean
}
const FAN: FanSlot[] = [
  {
    x: -150,
    y: 22,
    r: -14,
    z: 1,
    kind: "face",
    Icon: Atom,
    label: "React",
    hideOnMobile: true,
  },
  {
    x: -76,
    y: 7,
    r: -7,
    z: 2,
    kind: "face",
    Icon: Braces,
    label: "TypeScript",
  },
  { x: 0, y: 0, r: 0, z: 5, kind: "back" },
  { x: 76, y: 7, r: 7, z: 2, kind: "face", Icon: Braces, label: "TypeScript" },
  {
    x: 150,
    y: 22,
    r: 14,
    z: 1,
    kind: "face",
    Icon: Atom,
    label: "React",
    hideOnMobile: true,
  },
]

const fanVariants: Variants = {
  stacked: { x: 0, y: 36, rotate: 0, opacity: 0, scale: 0.88 },
  fanned: (slot: FanSlot) => ({
    x: slot.x,
    y: slot.y,
    rotate: slot.r,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 130,
      damping: 15,
      delay: 0.3 + Math.abs(slot.x) / 420,
    },
  }),
  spread: (slot: FanSlot) => ({
    x: slot.x * 1.22,
    y: slot.y * 1.1,
    rotate: slot.r * 1.3,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  }),
}

function FanCard({
  slot,
  reduceMotion,
}: {
  slot: FanSlot
  reduceMotion: boolean
}) {
  const Icon = slot.Icon
  return (
    <motion.div
      custom={slot}
      variants={fanVariants}
      style={{ zIndex: slot.z }}
      className={`absolute top-0 left-1/2 -ml-10 h-[112px] w-20 sm:-ml-[44px] sm:h-[124px] sm:w-[88px] ${slot.hideOnMobile ? "hidden sm:block" : ""}`}
    >
      <motion.div
        className="h-full w-full"
        animate={
          slot.kind === "back" && !reduceMotion ? { y: [0, -5, 0] } : undefined
        }
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {slot.kind === "face" && Icon ? (
          <div className="relative flex h-full w-full flex-col items-center justify-center gap-2.5 overflow-hidden rounded-[1rem] border border-border/70 bg-card shadow-[0_20px_44px_-22px_rgba(0,0,0,0.8)]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_45%)]" />
            <span className="relative grid h-10 w-10 place-items-center rounded-[0.75rem] border border-border/55 bg-background/60 text-foreground">
              <Icon className="h-5 w-5" />
            </span>
            <span className="relative text-[11px] leading-none font-semibold tracking-tight text-foreground/85">
              {slot.label}
            </span>
          </div>
        ) : (
          <div className="group relative h-full w-full overflow-hidden rounded-[1rem] border border-primary/40 bg-card shadow-[0_24px_60px_-18px_color-mix(in_oklab,var(--primary)_55%,transparent)]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(color-mix(in oklab, var(--foreground) 18%, transparent) 1px, transparent 1px)",
                backgroundSize: "9px 9px",
                maskImage:
                  "radial-gradient(circle at center, black 5%, transparent 75%)",
                WebkitMaskImage:
                  "radial-gradient(circle at center, black 5%, transparent 75%)",
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_65%)]" />
            <span
              className="absolute inset-x-0 top-[26%] text-center text-[2.6rem] leading-none text-foreground/80 sm:text-[3rem]"
              style={{ fontFamily: DISPLAY_FONT }}
              aria-hidden="true"
            >
              {MONOGRAM}
            </span>
            <span className="absolute inset-x-0 bottom-3 flex justify-center text-primary/90">
              <Lock className="h-3.5 w-3.5" />
            </span>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

function CardFan({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      className="relative mx-auto h-[150px] w-full sm:h-[176px]"
      initial={reduceMotion ? "fanned" : "stacked"}
      animate="fanned"
      whileHover={reduceMotion ? undefined : "spread"}
      aria-hidden="true"
    >
      {FAN.map((slot, index) => (
        <FanCard key={index} slot={slot} reduceMotion={reduceMotion} />
      ))}
    </motion.div>
  )
}

function StartScreen({
  gameSound,
  gameMutedState,
  onStart,
  skip,
  prefersReducedMotion,
}: {
  gameSound: string
  gameMutedState: boolean
  onStart: () => void
  skip: SkipControl
  prefersReducedMotion: boolean | null
}) {
  const reduceMotion = Boolean(prefersReducedMotion)
  const currentTrack =
    GAME_SOUND_OPTIONS.find((item) => item.value === gameSound)?.label ??
    "Pulse"

  return (
    <motion.div
      key="start"
      className="relative w-full max-w-[640px] overflow-hidden"
      initial={{ opacity: 0, scale: 0.985, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.985, y: -6 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 62% 36% at 50% 20%, color-mix(in oklab, var(--primary) 15%, transparent), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at 50% 30%, black, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 30%, black, transparent 72%)",
        }}
      />

      <motion.div
        className="relative flex flex-col items-center px-5 pt-7 pb-9 text-center sm:px-10 sm:pt-9 sm:pb-10"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp}>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 py-1.5 pr-3.5 pl-2.5 text-primary/80">
            <Brain className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">
              Quick challenge · about a minute
            </span>
          </div>
        </motion.div>
        <motion.div variants={fadeUp} className="mt-8 w-full">
          <CardFan reduceMotion={reduceMotion} />
        </motion.div>
        <motion.div variants={fadeUp} className="mt-9 space-y-3.5">
          <h3
            className="text-[clamp(1.85rem,7vw,3.25rem)] leading-[1.04] font-normal tracking-[-0.02em] text-foreground"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            Match the stack,
            <br />
            <span className="text-muted-foreground/60 italic">
              unlock the portfolio.
            </span>
          </h3>
          <p className="mx-auto max-w-[42ch] text-sm leading-relaxed text-muted-foreground/70">
            Find all 8 pairs of tools I work with. Not in the mood? You can skip
            ahead in {SKIP_DELAY_SECONDS} seconds.
          </p>
        </motion.div>
        <motion.div
          variants={fadeUp}
          className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center"
        >
          <div className="relative">
            <motion.div
              className="absolute inset-[-3px] rounded-full"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      boxShadow: [
                        "0 0 0 0 color-mix(in oklab, var(--primary) 0%, transparent)",
                        "0 0 0 9px color-mix(in oklab, var(--primary) 8%, transparent)",
                        "0 0 0 0 color-mix(in oklab, var(--primary) 0%, transparent)",
                      ],
                    }
              }
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.button
              type="button"
              className={`group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-full border border-primary/16 bg-primary px-8 text-[13px] font-semibold tracking-wide text-primary-foreground shadow-[0_14px_40px_-18px_rgba(255,108,47,0.48)] sm:w-auto ${focusRing}`}
              whileHover={reduceMotion ? undefined : { scale: 1.022 }}
              whileTap={reduceMotion ? undefined : { scale: 0.978 }}
              onClick={onStart}
              onHoverStart={() => playButtonHover()}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-white/16" />
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/14 to-transparent"
                initial={{ x: "-110%" }}
                whileHover={{ x: "110%" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
              <span className="relative inline-flex items-center gap-2">
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Start game</span>
              </span>
            </motion.button>
          </div>
          <SkipButton skip={skip} className="justify-center sm:justify-start" />
        </motion.div>

        <motion.ol
          variants={fadeUp}
          className="relative mt-11 grid w-full grid-cols-3 gap-2 sm:gap-4"
        >
          <div
            aria-hidden="true"
            className="absolute top-5 right-[16.66%] left-[16.66%] border-t border-dashed border-border/70"
          />
          {STEPS.map(({ Icon, title, body }) => (
            <li
              key={title}
              className="relative z-10 flex flex-col items-center gap-3"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-background text-primary shadow-[0_8px_20px_-12px_rgba(0,0,0,0.6)]">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div className="max-w-[18ch] sm:max-w-[22ch]">
                <p className="text-[13px] leading-tight font-medium text-foreground">
                  {title}
                </p>
                <p className="mt-1.5 hidden text-xs leading-snug text-muted-foreground/65 sm:block">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </motion.ol>
      </motion.div>

      <div className="relative flex flex-col items-center gap-2 border-t border-border/35 px-5 py-3.5 text-xs text-muted-foreground/60 sm:flex-row sm:justify-between sm:px-8">
        <span className="inline-flex items-center gap-2">
          <Lock className="h-3 w-3 shrink-0" />
          Portfolio unlocks when you finish, or skip.
        </span>
        <span className="inline-flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5">
            <Music2 className="h-3 w-3" />
            {currentTrack}
          </span>
          <span className="h-3 w-px bg-border/70" aria-hidden="true" />
          <span
            className={`inline-flex items-center gap-1.5 ${gameMutedState ? "" : "text-primary/80"}`}
          >
            {gameMutedState ? (
              <VolumeX className="h-3 w-3" />
            ) : (
              <Volume2 className="h-3 w-3" />
            )}
            {gameMutedState ? "Muted" : "Sound on"}
          </span>
        </span>
      </div>
    </motion.div>
  )
}

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────

export default function MemoryGame({
  onComplete,
  instant = false,
}: MemoryGameProps) {
  const prefersReducedMotion = useReducedMotion()
  const reduceMotion = Boolean(prefersReducedMotion)

  const [cards, setCards] = useState<Card[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [wrongPair, setWrongPair] = useState<number[]>([])
  const [dealKey, setDealKey] = useState(0)
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [matched, setMatched] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [lockBoard, setLockBoard] = useState(false)
  const [skipCodeInput, setSkipCodeInput] = useState("")
  const [gameMutedState, setGameMutedState] = useState(() => getGameMuted())
  const [gameSound, setGameSoundState] = useState(() => getCurrentGameSound())
  const [skipElapsed, setSkipElapsed] = useState(0)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const matchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipCodeRef = useRef("")
  const musicStartSyncedRef = useRef(false)
  const cardsRef = useRef<Card[]>([])
  const unlockedRef = useRef(false)
  const completionFiredRef = useRef(false)
  const onCompleteRef = useRef(onComplete)

  const gameComplete = matched === CARD_DATA.length
  const stars = useMemo(() => (moves <= 14 ? 3 : moves <= 20 ? 2 : 1), [moves])
  const matchedValues = useMemo(
    () =>
      new Set(cards.filter((card) => card.matched).map((card) => card.value)),
    [cards]
  )

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])
  useEffect(() => {
    setCards(createDeck())
  }, [])
  useEffect(() => {
    cardsRef.current = cards
  }, [cards])

  // Call the parent exactly once and immediately. No win/complete overlay is rendered.
  const finish = useCallback(() => {
    if (completionFiredRef.current) return
    completionFiredRef.current = true
    onCompleteRef.current()
  }, [])

  // Winning or entering the secret code directly continues to the portfolio.
  const unlock = useCallback(() => {
    if (unlockedRef.current) return
    unlockedRef.current = true
    setLockBoard(true)
    setSelected([])
    finish()
  }, [finish])

  const skipGame = useCallback(() => {
    if (unlockedRef.current) return
    unlockedRef.current = true
    setLockBoard(true)
    finish()
  }, [finish])

  // Skip countdown starts when the game screen mounts.
  useEffect(() => {
    const start = performance.now()
    const id = window.setInterval(() => {
      const elapsed = Math.min(performance.now() - start, SKIP_DELAY_MS)
      setSkipElapsed(elapsed)
      if (elapsed >= SKIP_DELAY_MS) window.clearInterval(id)
    }, 100)
    return () => window.clearInterval(id)
  }, [])

  const skipReady = skipElapsed >= SKIP_DELAY_MS
  const skipControl: SkipControl = {
    ready: skipReady,
    progress: skipElapsed / SKIP_DELAY_MS,
    remaining: Math.max(1, Math.ceil((SKIP_DELAY_MS - skipElapsed) / 1000)),
    onSkip: () => {
      if (skipReady) skipGame()
    },
  }

  // Game clock.
  useEffect(() => {
    if (!gameStarted || gameComplete) return
    timerRef.current = setInterval(
      () => setSeconds((current) => current + 1),
      1000
    )
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [gameStarted, gameComplete])

  useEffect(() => {
    if (!gameStarted) return
    if (!musicStartSyncedRef.current) {
      musicStartSyncedRef.current = true
      return
    }
    void switchGameMusic(gameSound)
  }, [gameStarted, gameSound])

  // Resolve a pair after both cards are visible.
  useEffect(() => {
    if (selected.length !== 2) return
    const [firstIndex, secondIndex] = selected
    const snapshot = cardsRef.current
    const firstCard = snapshot[firstIndex]
    const secondCard = snapshot[secondIndex]
    if (!firstCard || !secondCard) return

    setLockBoard(true)
    if (matchTimeoutRef.current) {
      clearTimeout(matchTimeoutRef.current)
      matchTimeoutRef.current = null
    }

    if (firstCard.value === secondCard.value) {
      matchTimeoutRef.current = setTimeout(() => {
        playMatchSuccess()
        setCards((previous) =>
          previous.map((card) =>
            card.value === firstCard.value ? { ...card, matched: true } : card
          )
        )
        setMatched((current) => current + 1)
        setSelected([])
        setLockBoard(false)
      }, MATCH_SETTLE_MS)
    } else {
      setWrongPair([firstIndex, secondIndex])
      matchTimeoutRef.current = setTimeout(() => {
        setCards((previous) =>
          previous.map((card, index) =>
            index === firstIndex || index === secondIndex
              ? { ...card, flipped: false }
              : card
          )
        )
        setWrongPair([])
        setSelected([])
        setLockBoard(false)
      }, FLIP_MS + MISMATCH_VIEW_MS)
    }

    setMoves((current) => current + 1)
    return () => {
      if (matchTimeoutRef.current) {
        clearTimeout(matchTimeoutRef.current)
        matchTimeoutRef.current = null
      }
    }
  }, [selected])

  // Secret code: type "jeydu" anywhere to unlock instantly.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (!/^[a-z]$/.test(key)) return
      skipCodeRef.current = (skipCodeRef.current + key).slice(-5)
      setSkipCodeInput(skipCodeRef.current)
      if (skipCodeRef.current === "jeydu") {
        playMatchSuccess()
        unlock()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [unlock])

  // As soon as the eighth pair is counted, proceed without showing a completion screen.
  useEffect(() => {
    if (gameStarted && gameComplete) unlock()
  }, [gameStarted, gameComplete, unlock])

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current)
      void stopGameMusic(0)
    },
    []
  )

  const startGame = () => {
    setGameStarted(true)
    void playGameMusic(gameSound)
  }

  const restartGame = () => {
    if (unlockedRef.current) return
    if (matchTimeoutRef.current) {
      clearTimeout(matchTimeoutRef.current)
      matchTimeoutRef.current = null
    }
    setCards(createDeck())
    setSelected([])
    setWrongPair([])
    setMoves(0)
    setSeconds(0)
    setMatched(0)
    setLockBoard(false)
    setDealKey((current) => current + 1)
  }

  const handleMuteToggle = () => {
    const next = !gameMutedState
    setGameMutedState(next)
    setGameMuted(next)
  }

  const handleSoundChange = (next: string) => {
    const valid = GAME_SOUND_OPTIONS.some((option) => option.value === next)
      ? (next as "game-sound" | "game-sound" | "game-sound3" | "game-sound4")
      : "game-sound"
    setGameSoundState(valid)
    setGameSound(valid)
  }

  const flipCard = (index: number) => {
    if (!gameStarted || lockBoard || gameComplete || unlockedRef.current) return
    const card = cards[index]
    if (!card || card.flipped || card.matched || selected.includes(index))
      return
    playCardFlip()
    setCards((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, flipped: true } : item
      )
    )
    setSelected((previous) => [...previous, index])
  }

  const formatTime = (secs: number) =>
    `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, "0")}`

  return (
    <motion.div
      className="relative min-h-[100svh] w-full overflow-hidden bg-background"
      initial={instant ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.38 }}
    >
      <AudioControls
        muted={gameMutedState}
        sound={gameSound}
        onToggleMute={handleMuteToggle}
        onSoundChange={handleSoundChange}
      />

      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-3 pt-16 pb-5 sm:px-5 sm:pt-20">
        <AnimatePresence mode="wait">
          {!gameStarted ? (
            <StartScreen
              key="start"
              gameSound={gameSound}
              gameMutedState={gameMutedState}
              onStart={startGame}
              skip={skipControl}
              prefersReducedMotion={prefersReducedMotion}
            />
          ) : (
            <motion.section
              key="game"
              aria-label="Memory game"
              className="relative w-full max-w-[420px] overflow-hidden rounded-[1.5rem] border border-border/60 bg-card/40 shadow-[0_32px_80px_-48px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:max-w-[560px] lg:max-w-[920px] lg:rounded-[1.75rem]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/28 to-transparent" />
              <header className="relative flex items-center justify-between gap-3 border-b border-border/50 px-3.5 py-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[0.7rem] bg-primary/10 text-primary">
                    <Brain className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm leading-tight font-semibold tracking-tight text-foreground">
                      Match the stack
                    </h2>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground/70">
                      <span className="sm:hidden">
                        {matched} of {CARD_DATA.length} pairs found
                      </span>
                      <span className="hidden sm:inline">
                        Find all {CARD_DATA.length} pairs to unlock the
                        portfolio
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={restartGame}
                    className={`grid h-8 w-8 place-items-center rounded-full border border-border/60 bg-card/60 text-muted-foreground transition-colors hover:bg-card hover:text-foreground ${focusRing}`}
                    aria-label="Restart game"
                    title="Restart"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <SkipButton skip={skipControl} size="sm" />
                </div>
                <div className="absolute inset-x-0 -bottom-px h-[2px] bg-transparent">
                  <motion.div
                    className="h-full bg-primary"
                    initial={false}
                    animate={{
                      width: `${(matched / CARD_DATA.length) * 100}%`,
                    }}
                    transition={{ duration: 0.4, ease: EASE }}
                  />
                </div>
              </header>

              <div className="grid lg:grid-cols-[minmax(0,1fr)_290px]">
                <div className="p-3 sm:p-5 lg:p-6">
                  <div className="mx-auto flex w-full max-w-[520px] flex-col gap-3 sm:gap-4">
                    <StatStrip
                      moves={moves}
                      time={formatTime(seconds)}
                      stars={stars}
                    />
                    <div
                      key={dealKey}
                      className="grid grid-cols-4 gap-1.5 sm:gap-2.5"
                    >
                      {cards.map((card, index) => (
                        <MemoryCard
                          key={card.id}
                          card={card}
                          index={index}
                          wrong={wrongPair.includes(index)}
                          reduceMotion={reduceMotion}
                          disabled={lockBoard || card.matched || card.flipped}
                          canHover={
                            !reduceMotion &&
                            !lockBoard &&
                            !card.flipped &&
                            !card.matched
                          }
                          onFlip={() => flipCard(index)}
                        />
                      ))}
                    </div>
                    <div className="lg:hidden">
                      <ManifestChips
                        matchedValues={matchedValues}
                        matched={matched}
                      />
                    </div>
                  </div>
                </div>

                <aside className="hidden flex-col gap-5 border-l border-border/50 bg-background/20 p-5 lg:flex">
                  <ManifestList
                    matchedValues={matchedValues}
                    matched={matched}
                  />
                  <div className="mt-auto flex items-start gap-2.5 rounded-[0.8rem] border border-border/45 bg-card/40 p-3">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <p className="text-xs leading-relaxed text-muted-foreground/75">
                      Three stars for 14 moves or fewer, two for up to 20.
                    </p>
                  </div>
                </aside>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
        <div className="sr-only">Skip code buffer: {skipCodeInput}</div>
      </div>
    </motion.div>
  )
}
