"use client"

import { useCallback, useEffect, useState } from "react"
import { AnimatePresence } from "framer-motion"

import IntroScreen from "@/components/IntroScreen"
import MemoryGame from "@/components/MemoryGame"
import WinTransition from "@/components/WinTransition"
import Homepage from "@/PortfolioComponents/Homepage"
import {
  initializeAudioUnlock,
  preloadAudioAssets,
  stopAllAudio,
  stopGameMusic,
  stopGlitchSound,
} from "@/lib/audio"
import { useTheme } from "@/components/theme-provider"

type Phase = "intro" | "game" | "win" | "portfolio"

const STORAGE_KEY = "portfolio-gate-complete"

export function App() {
  const [phase, setPhase] = useState<Phase>("intro")
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light")
    }

    updateSystemTheme()
    mediaQuery.addEventListener("change", updateSystemTheme)

    return () => mediaQuery.removeEventListener("change", updateSystemTheme)
  }, [])

  const resolvedTheme = theme === "system" ? systemTheme : theme
  const themeHint =
    resolvedTheme === "dark"
      ? 'Shift + D to turn on "light mode"'
      : 'Shift + D to turn on "dark mode"'

  const resetGate = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Storage can be unavailable in private browsing or restricted contexts.
    }

    void stopAllAudio()
    setPhase("intro")
  }, [])

  const handleIntroComplete = useCallback(() => {
    setPhase("game")
  }, [])

  const handleGameComplete = useCallback(() => {
    setPhase("win")
  }, [])

  const handleWinComplete = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true")
    } catch {
      // The portfolio still unlocks if storage is unavailable.
    }

    void stopAllAudio()
    setPhase("portfolio")
  }, [])

  useEffect(() => {
    preloadAudioAssets()
    initializeAudioUnlock()

    try {
      const completed = window.localStorage.getItem(STORAGE_KEY) === "true"
      if (completed) setPhase("portfolio")
    } catch {
      // If storage is unavailable, start from the intro and memory game.
    }

    setMounted(true)
  }, [])

  useEffect(() => {
    if (phase === "portfolio" || phase === "win") {
      void stopGameMusic(180)
    }

    if (phase === "portfolio") {
      void stopGlitchSound(0)
    }
  }, [phase])

  useEffect(() => {
    const isGatePhase = phase !== "portfolio"

    if (isGatePhase) {
      document.documentElement.style.overflow = "hidden"
      document.body.style.overflow = "hidden"
    } else {
      document.documentElement.style.overflow = ""
      document.body.style.overflow = ""
    }

    return () => {
      document.documentElement.style.overflow = ""
      document.body.style.overflow = ""
    }
  }, [phase])

  if (!mounted) return null

  return (
    <>
      <div className="pointer-events-none fixed bottom-4 left-4 z-[70] max-w-[calc(100vw-2rem)] rounded-full border border-border/70 bg-background/80 px-3 py-2 font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase shadow-[0_16px_50px_-30px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        {themeHint}
      </div>

      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <IntroScreen key="intro" onComplete={handleIntroComplete} />
        )}

        {phase === "game" && (
          <MemoryGame key="game" onComplete={handleGameComplete} />
        )}

        {phase === "win" && (
          <WinTransition key="win" onComplete={handleWinComplete} />
        )}

        {phase === "portfolio" && (
          <div key="portfolio">
            <Homepage onRestart={resetGate} />
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default App
