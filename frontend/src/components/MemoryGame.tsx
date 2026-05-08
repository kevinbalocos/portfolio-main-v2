"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  Atom,
  Braces,
  ChevronDown,
  Code2,
  Cpu,
  Database,
  Gamepad2,
  Grid2x2,
  Layers3,
  LayoutGrid,
  Music2,
  PenTool,
  ShieldCheck,
  Volume2,
  VolumeX,
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

// ─── TYPES ─────────────────────────────────────────────────────────────────

type Card = {
  id: number
  value: string
  Icon: LucideIcon
  flipped: boolean
  matched: boolean
}

type MemoryGameProps = {
  onComplete: () => void
}

// ─── CARD DATA ─────────────────────────────────────────────────────────────

const CARD_DATA: Array<{ value: string; Icon: LucideIcon }> = [
  { value: "React", Icon: Atom },
  { value: "TypeScript", Icon: Braces },
  { value: "Node.js", Icon: Code2 },
  { value: "Tailwind", Icon: LayoutGrid },
  { value: "Figma", Icon: PenTool },
  { value: "UI Systems", Icon: Layers3 },
  { value: "API Logic", Icon: Cpu },
  { value: "Database", Icon: Database },
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
  const duplicated = [...CARD_DATA, ...CARD_DATA]
  return shuffle(
    duplicated.map((item, index) => ({
      id: index,
      value: item.value,
      Icon: item.Icon,
      flipped: false,
      matched: false,
    }))
  )
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

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!menuOpen) return
      if (menuRef.current?.contains(event.target as Node)) return
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

  const currentLabel =
    GAME_SOUND_OPTIONS.find((option) => option.value === sound)?.label ??
    "Pulse"

  return (
    <div
      ref={menuRef}
      className="fixed top-3 left-1/2 z-40 flex w-[min(90vw,26rem)] -translate-x-1/2 items-center gap-1.5 rounded-full border border-border/65 bg-background/90 px-1.5 py-1.5 shadow-[0_14px_40px_-28px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:top-4 sm:right-4 sm:left-auto sm:w-auto sm:translate-x-0"
    >
      <button
        type="button"
        onClick={onToggleMute}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border/60 bg-card/65 text-foreground transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none sm:h-9 sm:w-9"
        aria-label={muted ? "Unmute game audio" : "Mute game audio"}
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
          onClick={() => setMenuOpen((c) => !c)}
          className="flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-full border border-border/60 bg-card/65 px-3 text-left text-foreground transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none sm:h-9 sm:w-[210px] sm:px-3.5"
          aria-expanded={menuOpen}
          aria-haspopup="listbox"
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
            >
              <div className="space-y-0.5">
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
                      className={`flex w-full items-center justify-between rounded-[0.75rem] px-3 py-2 text-left transition-colors ${
                        active
                          ? "bg-primary/10 text-foreground ring-1 ring-primary/18 ring-inset"
                          : "text-muted-foreground hover:bg-muted/65 hover:text-foreground"
                      }`}
                      role="option"
                      aria-selected={active}
                    >
                      <span className="font-mono text-[0.62rem] tracking-[0.16em] uppercase sm:text-[0.67rem]">
                        {option.label}
                      </span>
                      {active && (
                        <span className="font-mono text-[0.58rem] tracking-[0.14em] text-primary uppercase">
                          Active
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── STAT CARD ─────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-[1rem] border border-border/65 bg-card/65 px-2 py-2.5 text-center shadow-[0_10px_30px_-22px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:rounded-[1.15rem] sm:px-3 sm:py-3">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      <p className="relative font-mono text-[8px] tracking-[0.22em] text-muted-foreground/60 uppercase sm:text-[9px]">
        {label}
      </p>
      <div className="relative mt-1 text-base font-semibold tracking-tight text-foreground sm:mt-1.5 sm:text-xl">
        {value}
      </div>
    </div>
  )
}

// ─── CARD SHELL / BACK / FACE ───────────────────────────────────────────────

function CardShell({
  active,
  matched,
  dimmed,
  children,
}: {
  active: boolean
  matched: boolean
  dimmed: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden rounded-[0.9rem] border shadow-[0_12px_32px_-24px_rgba(0,0,0,0.68)] transition-all duration-700 sm:rounded-[1.2rem] ${
        dimmed ? "opacity-30 brightness-50" : "opacity-100"
      } ${
        active
          ? matched
            ? "border-primary/32 bg-primary/10"
            : "border-primary/18 bg-primary/6"
          : "border-border/65 bg-card/55"
      }`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),transparent_32%,transparent_70%,rgba(255,255,255,0.015))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.07),transparent_26%)]" />
      {children}
    </div>
  )
}

function CardBack() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-[0.75rem] border border-dashed border-border/35 bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.02),transparent_52%)] sm:rounded-[0.9rem]">
      <div className="grid h-6 w-6 place-items-center rounded-[0.6rem] border border-border/50 bg-card/60 text-muted-foreground sm:h-8 sm:w-8 sm:rounded-[0.7rem]">
        <Grid2x2 className="h-2.5 w-2.5 opacity-55 sm:h-3 sm:w-3" />
      </div>
    </div>
  )
}

function CardFace({ card }: { card: Card }) {
  const Icon = card.Icon
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 p-1 text-center sm:gap-1.5 sm:p-2">
      <div
        className={`grid h-6 w-6 place-items-center rounded-[0.6rem] border sm:h-10 sm:w-10 sm:rounded-[0.78rem] ${
          card.matched
            ? "border-primary/20 bg-primary/9 text-primary"
            : "border-border/55 bg-background/55 text-foreground"
        }`}
      >
        <Icon className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
      </div>
      <span className="font-mono text-[6px] leading-none tracking-[0.1em] text-foreground/55 uppercase sm:text-[8px] sm:tracking-[0.14em]">
        {card.value}
      </span>
    </div>
  )
}

// ─── START SCREEN ──────────────────────────────────────────────────────────

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

function StartScreen({
  gameSound,
  gameMutedState,
  onStart,
  prefersReducedMotion,
}: {
  gameSound: string
  gameMutedState: boolean
  onStart: () => void
  prefersReducedMotion: boolean | null
}) {
  const currentTrack =
    GAME_SOUND_OPTIONS.find((i) => i.value === gameSound)?.label ?? "Pulse"

  return (
    <motion.div
      key="start"
      className="relative w-full max-w-[680px] overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/40 shadow-[0_32px_80px_-48px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
      initial={{ opacity: 0, scale: 0.985, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.985, y: -6 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/28 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_35%_at_20%_0%,rgba(255,108,47,0.065),transparent_55%),radial-gradient(ellipse_35%_25%_at_82%_95%,rgba(255,255,255,0.018),transparent_50%)]" />

      <div className="relative grid divide-y divide-border/40 sm:grid-cols-[1.1fr_0.9fr] sm:divide-x sm:divide-y-0">
        <motion.div
          className="flex flex-col gap-6 px-6 py-7 sm:px-7 sm:py-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/13 bg-primary/6 px-3.5 py-1.5">
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-primary"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { scale: [1, 1.55, 1], opacity: [0.45, 1, 0.45] }
                }
                transition={{ duration: 1.9, repeat: Infinity }}
              />
              <span className="font-mono text-[8px] tracking-[0.26em] text-primary/70 uppercase sm:text-[9px]">
                Memory Protocol
              </span>
            </div>
          </motion.div>

          <motion.div className="space-y-2.5" variants={fadeUp}>
            <p className="font-mono text-[8px] tracking-[0.34em] text-muted-foreground/38 uppercase sm:text-[9px]">
              Secure challenge interface
            </p>
            <h3 className="text-[clamp(1.75rem,4vw,2.65rem)] leading-[1.08] font-semibold tracking-[-0.05em] text-foreground">
              Prove your
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/85 to-primary/45 bg-clip-text text-transparent">
                pattern recall.
              </span>
            </h3>
            <p className="max-w-[28ch] text-sm leading-[1.65] text-muted-foreground/55">
              Identify and match all 8 tech stack pairs to unlock the portfolio.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="relative inline-block self-start"
          >
            <motion.div
              className="absolute inset-[-3px] rounded-full"
              animate={
                prefersReducedMotion
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
              className="group relative overflow-hidden rounded-full border border-primary/16 bg-primary px-7 py-3 text-[13px] font-semibold tracking-[0.09em] text-primary-foreground shadow-[0_14px_40px_-18px_rgba(255,108,47,0.48)] sm:py-3.5"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.022 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.978 }}
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
              <span className="relative inline-flex items-center gap-2.5">
                <span>START GAME</span>
                <Gamepad2 className="h-3.5 w-3.5" />
              </span>
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex flex-col gap-4 px-6 py-7 sm:px-6 sm:py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.45 }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3 w-3 text-primary/55" />
            <span className="font-mono text-[7.5px] tracking-[0.26em] text-muted-foreground/38 uppercase sm:text-[8px]">
              Session readout
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-1.5 rounded-[1rem] border border-border/50 bg-background/28 px-4 py-3">
              <p className="font-mono text-[7px] tracking-[0.26em] text-muted-foreground/32 uppercase sm:text-[7.5px]">
                Soundtrack
              </p>
              <p className="text-sm font-medium text-foreground/75">
                {currentTrack}
              </p>
            </div>

            <div className="flex flex-col gap-1.5 rounded-[1rem] border border-border/50 bg-background/28 px-4 py-3">
              <p className="font-mono text-[7px] tracking-[0.26em] text-muted-foreground/32 uppercase sm:text-[7.5px]">
                Audio
              </p>
              <p
                className={`text-sm font-medium ${
                  gameMutedState
                    ? "text-muted-foreground/50"
                    : "text-primary/75"
                }`}
              >
                {gameMutedState ? "Muted" : "Armed"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-[1rem] border border-border/50 bg-background/28 px-4 py-3">
            <p className="font-mono text-[7px] tracking-[0.26em] text-muted-foreground/32 uppercase sm:text-[7.5px]">
              Objective
            </p>
            <div className="flex items-center gap-1.5 rounded-full border border-primary/14 bg-primary/6 px-2.5 py-1">
              <motion.div
                className="h-1 w-1 rounded-full bg-primary"
                animate={
                  prefersReducedMotion ? undefined : { opacity: [0.4, 1, 0.4] }
                }
                transition={{ duration: 1.7, repeat: Infinity }}
              />
              <span className="font-mono text-[7px] tracking-[0.2em] text-primary/60 uppercase sm:text-[7.5px]">
                8 pairs
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-0.5 flex-1 rounded-full bg-border/45"
                />
              ))}
            </div>
            <p className="font-mono text-[7px] tracking-[0.2em] text-muted-foreground/25 uppercase sm:text-[7.5px]">
              0 / 8 matched
            </p>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between border-t border-border/32 px-6 py-3.5 sm:px-7">
        <p className="font-mono text-[7px] tracking-[0.2em] text-muted-foreground/25 uppercase sm:text-[7.5px]">
          Portfolio locked · challenge required
        </p>
        <motion.div
          className="flex items-center gap-1"
          animate={
            prefersReducedMotion ? undefined : { opacity: [0.3, 0.65, 0.3] }
          }
          transition={{ duration: 3.8, repeat: Infinity }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-0.5 w-3 rounded-full bg-border/50" />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── MINIMAL VALIDATION OVERLAY ────────────────────────────────────────────

function UnlockOverlay({
  onComplete,
  prefersReducedMotion,
}: {
  onComplete: () => void
  prefersReducedMotion: boolean | null
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onComplete()
    }, 1100)

    return () => window.clearTimeout(timer)
  }, [onComplete])

 
}

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────

export default function MemoryGame({ onComplete }: MemoryGameProps) {
  const prefersReducedMotion = useReducedMotion()

  const [cards, setCards] = useState<Card[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [matched, setMatched] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [lockBoard, setLockBoard] = useState(false)
  const [skipCodeInput, setSkipCodeInput] = useState("")
  const [gameMutedState, setGameMutedState] = useState(() => getGameMuted())
  const [gameSound, setGameSoundState] = useState(() => getCurrentGameSound())
  const [showUnlock, setShowUnlock] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const matchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipCodeRef = useRef("")
  const musicStartSyncedRef = useRef(false)
  const cardsRef = useRef<Card[]>([])
  const completionCallbackFiredRef = useRef(false)

  const stars = useMemo(() => {
    if (moves <= 14) return 3
    if (moves <= 20) return 2
    return 1
  }, [moves])

  const gameComplete = matched === CARD_DATA.length

  useEffect(() => {
    setCards(createDeck())
  }, [])

  useEffect(() => {
    cardsRef.current = cards
  }, [cards])

  useEffect(() => {
    if (!gameStarted || gameComplete) return
    timerRef.current = setInterval(() => {
      setSeconds((c) => c + 1)
    }, 1000)
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

    const isMatch = firstCard.value === secondCard.value

    if (isMatch) {
      playMatchSuccess()
      matchTimeoutRef.current = setTimeout(() => {
        setCards((prev) =>
          prev.map((card) =>
            card.value === firstCard.value ? { ...card, matched: true } : card
          )
        )
        setMatched((c) => c + 1)
        setSelected([])
        setLockBoard(false)
      }, 260)
    } else {
      matchTimeoutRef.current = setTimeout(() => {
        setCards((prev) =>
          prev.map((card, index) =>
            index === firstIndex || index === secondIndex
              ? { ...card, flipped: false }
              : card
          )
        )
        setSelected([])
        setLockBoard(false)
      }, 420)
    }

    setMoves((c) => c + 1)

    return () => {
      if (matchTimeoutRef.current) {
        clearTimeout(matchTimeoutRef.current)
        matchTimeoutRef.current = null
      }
    }
  }, [selected])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (!/[a-z]/.test(key)) return
      skipCodeRef.current = (skipCodeRef.current + key).slice(-5)
      setSkipCodeInput(skipCodeRef.current)
      if (skipCodeRef.current === "jeydu") {
        playMatchSuccess()
        setMatched(CARD_DATA.length)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (!gameStarted || !gameComplete) return

    setLockBoard(true)
    setSelected([])
    setShowUnlock(true)

    return () => {
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current)
    }
  }, [gameStarted, gameComplete])

  useEffect(() => {
    if (!showUnlock || completionCallbackFiredRef.current) return
    unlockTimerRef.current = setTimeout(() => {
      completionCallbackFiredRef.current = true
      onComplete()
    }, 1100)

    return () => {
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current)
    }
  }, [showUnlock, onComplete])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current)
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current)
      void stopGameMusic(0)
    }
  }, [])

  const startGame = () => {
    setGameStarted(true)
    void playGameMusic(gameSound)
  }

  const handleMuteToggle = () => {
    const next = !gameMutedState
    setGameMutedState(next)
    setGameMuted(next)
  }

  const handleSoundChange = (next: string) => {
    const valid = GAME_SOUND_OPTIONS.some((o) => o.value === next)
      ? (next as "game-sound" | "game-sound2" | "game-sound3" | "game-sound4")
      : "game-sound"
    setGameSoundState(valid)
    setGameSound(valid)
  }

  const flipCard = (index: number) => {
    if (!gameStarted || lockBoard || gameComplete || showUnlock) return
    const card = cards[index]
    if (card.flipped || card.matched || selected.includes(index)) return
    playCardFlip()
    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, flipped: true } : c))
    )
    setSelected((prev) => [...prev, index])
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    return `${mins}:${(secs % 60).toString().padStart(2, "0")}`
  }

  return (
    <motion.div
      className="min-h-[100svh] w-full overflow-hidden bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.38 }}
    >
      <AudioControls
        muted={gameMutedState}
        sound={gameSound}
        onToggleMute={handleMuteToggle}
        onSoundChange={handleSoundChange}
      />

      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-3 pt-14 pb-4 sm:px-5 sm:pt-18 sm:pb-5">
        <motion.p
          className="mb-4 font-mono text-[8px] tracking-[0.26em] text-primary/55 uppercase sm:mb-5 sm:text-[9px]"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Match all pairs to unlock the portfolio
        </motion.p>

        <AnimatePresence mode="wait">
          {!gameStarted ? (
            <StartScreen
              key="start"
              gameSound={gameSound}
              gameMutedState={gameMutedState}
              onStart={startGame}
              prefersReducedMotion={prefersReducedMotion}
            />
          ) : (
            <motion.div
              key="game"
              className={`w-full max-w-[380px] space-y-2.5 sm:max-w-[520px] sm:space-y-3 ${
                showUnlock ? "pointer-events-none" : ""
              }`}
              initial={{ opacity: 0, y: 6 }}
              animate={{
                opacity: gameComplete ? 0.72 : 1,
                y: 0,
                scale: gameComplete ? 0.995 : 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              style={{
                filter: gameComplete ? "blur(0.9px)" : "none",
              }}
            >
              <div className="grid grid-cols-3 gap-1.5 rounded-[1rem] border border-border/45 bg-card/30 p-1.5 backdrop-blur-xl sm:gap-2 sm:rounded-[1.15rem] sm:p-2">
                <StatCard label="Moves" value={moves} />
                <StatCard label="Time" value={formatTime(seconds)} />
                <StatCard
                  label="Stars"
                  value={
                    <motion.span
                      className="text-xs sm:text-sm"
                      animate={
                        prefersReducedMotion
                          ? undefined
                          : { scale: [1, 1.05, 1] }
                      }
                      transition={{ duration: 1.6, repeat: Infinity }}
                    >
                      {"⭐".repeat(stars)}
                    </motion.span>
                  }
                />
              </div>

              <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
                {cards.map((card, index) => {
                  const isActive = card.flipped || card.matched
                  return (
                    <motion.button
                      key={card.id}
                      type="button"
                      className="group relative aspect-square touch-manipulation"
                      onClick={() => flipCard(index)}
                      whileHover={
                        prefersReducedMotion || showUnlock
                          ? undefined
                          : {
                              scale:
                                !lockBoard && !card.flipped && !card.matched
                                  ? 1.03
                                  : 1,
                            }
                      }
                      whileTap={
                        prefersReducedMotion || showUnlock
                          ? undefined
                          : {
                              scale:
                                !lockBoard && !card.flipped && !card.matched
                                  ? 0.97
                                  : 1,
                            }
                      }
                      disabled={
                        lockBoard || card.matched || card.flipped || showUnlock
                      }
                      aria-label={`Card ${index + 1}`}
                    >
                      <CardShell
                        active={isActive}
                        matched={card.matched}
                        dimmed={showUnlock}
                      >
                        <AnimatePresence mode="wait">
                          {isActive ? (
                            <motion.div
                              key="front"
                              className="h-full"
                              initial={{
                                opacity: 0,
                                rotateY: -75,
                                scale: 0.93,
                              }}
                              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                              exit={{ opacity: 0, rotateY: 75, scale: 0.93 }}
                              transition={{ duration: 0.26, ease: "easeOut" }}
                            >
                              <CardFace card={card} />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="back"
                              className="h-full p-1 sm:p-1.5"
                              initial={{ opacity: 0, rotateY: 75, scale: 0.93 }}
                              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                              exit={{ opacity: 0, rotateY: -75, scale: 0.93 }}
                              transition={{ duration: 0.26, ease: "easeOut" }}
                            >
                              <CardBack />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardShell>
                    </motion.button>
                  )
                })}
              </div>

              <div className="space-y-1">
                <div className="h-0.5 overflow-hidden rounded-full bg-border/50">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/50"
                    initial={{ width: "0%" }}
                    animate={{
                      width: `${(matched / CARD_DATA.length) * 100}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-center font-mono text-[7px] text-muted-foreground/50 sm:text-[8px]">
                  {matched} / {CARD_DATA.length} pairs matched
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="sr-only">Skip code buffer: {skipCodeInput}</div>
      </div>

      <AnimatePresence>
        {showUnlock && (
          <UnlockOverlay
            key="unlock"
            onComplete={onComplete}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
