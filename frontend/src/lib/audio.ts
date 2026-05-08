// lib/audio.ts
"use client"

const GLITCH_SRC = "/audio/glitch-sound.mp3"
const GAME_SOUND_SOURCES = {
  "game-sound": "/audio/game-sound.mp3",
  "game-sound2": "/audio/game-sound2.mp3",
  "game-sound3": "/audio/game-sound3.mp3",
  "game-sound4": "/audio/game-sound4.mp3",
} as const

export type GameSoundName = keyof typeof GAME_SOUND_SOURCES

export const GAME_SOUND_OPTIONS: Array<{ value: GameSoundName; label: string }> =
  [
    { value: "game-sound", label: "Drum Ritual" },
    { value: "game-sound2", label: "Loop" },
    { value: "game-sound3", label: "Retro" },
    { value: "game-sound4", label: "Static Loop" },
  ]

const GAME_SOUND_SESSION_KEY = "portfolio-game-sound"
const GAME_MUTED_SESSION_KEY = "portfolio-game-muted"

const GAME_TARGET_VOLUME = 0.9

let audioUnlocked = false
let unlockListenerAttached = false
let audioContext: AudioContext | null = null

let glitchAudio: HTMLAudioElement | null = null
let gameAudioMap = new Map<GameSoundName, HTMLAudioElement>()

let currentGameSound: GameSoundName = "game-sound"
let gameMuted = false
let gamePlaybackActive = false
let activeGameAudio: HTMLAudioElement | null = null

let activeFadeFrame: number | null = null
let activeFadeResolve: (() => void) | null = null
let gameMusicSwitchToken = 0

function logAudioError(scope: string, error: unknown) {
  console.error(`[audio] ${scope}`, error)
}

function isAutoplayBlockedError(error: unknown) {
  if (!error || typeof error !== "object") return false
  const maybe = error as { name?: string; message?: string }
  const message = maybe.message?.toLowerCase() ?? ""
  return (
    maybe.name === "NotAllowedError" ||
    message.includes("autoplay") ||
    message.includes("user interaction") ||
    message.includes("play() failed")
  )
}

function readSessionValue(key: string) {
  if (typeof window === "undefined") return null
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function writeSessionValue(key: string, value: string) {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(key, value)
  } catch {
    // no-op
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null

  if (audioContext) return audioContext

  try {
    const Ctor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext

    if (!Ctor) return null

    audioContext = new Ctor()
    return audioContext
  } catch (error) {
    logAudioError("Could not create AudioContext", error)
    return null
  }
}

function ensureAudioElement(src: string, loop: boolean): HTMLAudioElement | null {
  if (typeof window === "undefined") return null

  const audio = new Audio(src)
  audio.preload = "auto"
  audio.loop = loop
  audio.volume = 0
  audio.muted = false
  audio.crossOrigin = "anonymous"
  audio.setAttribute("playsinline", "true")

  audio.addEventListener("error", () => {
    console.error(`[audio] Failed to load audio file: ${src}`)
  })

  return audio
}

function ensureGlitchAudio() {
  if (!glitchAudio) {
    glitchAudio = ensureAudioElement(GLITCH_SRC, false)
  }
  return glitchAudio
}

function ensureGameAudio(soundName: GameSoundName) {
  const existing = gameAudioMap.get(soundName)
  if (existing) return existing

  const created = ensureAudioElement(GAME_SOUND_SOURCES[soundName], true)
  if (created) {
    gameAudioMap.set(soundName, created)
  }
  return created
}

function preload(audio: HTMLAudioElement | null) {
  if (!audio) return
  try {
    audio.load()
  } catch (error) {
    logAudioError("Failed to preload audio", error)
  }
}

export function preloadAudioAssets() {
  if (typeof window === "undefined") return

  preload(ensureGlitchAudio())
  ;(Object.keys(GAME_SOUND_SOURCES) as GameSoundName[]).forEach((sound) => {
    preload(ensureGameAudio(sound))
  })
}

function stopActiveFade(resolveEarly = true) {
  if (activeFadeFrame !== null) {
    cancelAnimationFrame(activeFadeFrame)
    activeFadeFrame = null
  }

  if (resolveEarly && activeFadeResolve) {
    const resolve = activeFadeResolve
    activeFadeResolve = null
    resolve()
    return
  }

  activeFadeResolve = null
}

function fadeAudio(
  audio: HTMLAudioElement,
  from: number,
  to: number,
  durationMs: number
): Promise<void> {
  stopActiveFade(false)

  const startVolume = Math.max(0, Math.min(1, from))
  const endVolume = Math.max(0, Math.min(1, to))
  const duration = Math.max(0, durationMs)

  if (duration === 0) {
    audio.volume = endVolume
    return Promise.resolve()
  }

  return new Promise<void>((resolve) => {
    activeFadeResolve = resolve
    const startTime = performance.now()

    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration)
      audio.volume = startVolume + (endVolume - startVolume) * progress

      if (progress < 1) {
        activeFadeFrame = requestAnimationFrame(step)
        return
      }

      audio.volume = endVolume
      activeFadeFrame = null

      const done = activeFadeResolve
      activeFadeResolve = null
      done?.()
    }

    activeFadeFrame = requestAnimationFrame(step)
  })
}

async function unlockContext() {
  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === "suspended") {
    await ctx.resume()
  }
}

export async function unlockAudio() {
  if (typeof window === "undefined") return
  if (audioUnlocked) return

  try {
    await unlockContext()
    audioUnlocked = true
  } catch (error) {
    audioUnlocked = false
    logAudioError("Audio unlock failed", error)
  }
}

export function initializeAudioUnlock() {
  if (typeof window === "undefined" || unlockListenerAttached) return

  unlockListenerAttached = true
  preloadAudioAssets()

  const unlock = () => {
    void unlockAudio()
  }

  document.addEventListener("pointerdown", unlock, {
    once: true,
    passive: true,
  })
  document.addEventListener("touchstart", unlock, {
    once: true,
    passive: true,
  })
  document.addEventListener("keydown", unlock, { once: true })
}

async function safePlay(audio: HTMLAudioElement) {
  try {
    await audio.play()
  } catch (error) {
    if (isAutoplayBlockedError(error)) {
      throw error
    }
    logAudioError("Audio playback failed", error)
    throw error
  }
}

function persistGameSound(soundName: GameSoundName) {
  currentGameSound = soundName
  writeSessionValue(GAME_SOUND_SESSION_KEY, soundName)
}

export function getCurrentGameSound(): GameSoundName {
  if (typeof window !== "undefined") {
    const stored = readSessionValue(GAME_SOUND_SESSION_KEY)
    if (
      stored === "game-sound" ||
      stored === "game-sound2" ||
      stored === "game-sound3" ||
      stored === "game-sound4"
    ) {
      currentGameSound = stored
    }
  }

  return currentGameSound
}

export function getGameMuted() {
  if (typeof window !== "undefined") {
    gameMuted = readSessionValue(GAME_MUTED_SESSION_KEY) === "true"
  }

  return gameMuted
}

function hardStopAudioElement(audio: HTMLAudioElement | null) {
  if (!audio) return

  try {
    audio.pause()
    audio.currentTime = 0
    audio.volume = 0
    audio.playbackRate = 1

    if (audio === activeGameAudio) {
      activeGameAudio = null
    }
  } catch (error) {
    logAudioError("Failed to hard stop audio element", error)
  }
}

async function stopAudioElement(
  audio: HTMLAudioElement | null,
  fadeOutMs: number
) {
  if (!audio) return

  try {
    if (!audio.paused) {
      await fadeAudio(audio, audio.volume, 0, fadeOutMs)
    }

    audio.pause()
    audio.currentTime = 0
    audio.volume = 0
    audio.playbackRate = 1

    if (audio === activeGameAudio) {
      activeGameAudio = null
    }
  } catch (error) {
    logAudioError("Failed to stop audio element", error)
  }
}

export async function stopGlitchSound(fadeOutMs = 120) {
  await stopAudioElement(ensureGlitchAudio(), fadeOutMs)
}

function syncGameMuteState() {
  const audio = activeGameAudio
  if (!audio) return

  audio.volume = gameMuted ? 0 : GAME_TARGET_VOLUME
}

async function startGameMusicInternal(
  soundName: GameSoundName,
  options?: { restart?: boolean }
) {
  if (typeof window === "undefined") return

  const requestToken = ++gameMusicSwitchToken
  const nextAudio = ensureGameAudio(soundName)
  if (!nextAudio) return

  try {
    await unlockAudio()
    if (requestToken !== gameMusicSwitchToken) return

    stopActiveFade()
    await stopGlitchSound(0)
    if (requestToken !== gameMusicSwitchToken) return

    const previousAudio = activeGameAudio

    if (previousAudio && previousAudio !== nextAudio) {
      hardStopAudioElement(previousAudio)
    }

    if (previousAudio === nextAudio && options?.restart !== false) {
      hardStopAudioElement(nextAudio)
    }

    persistGameSound(soundName)

    nextAudio.loop = true
    nextAudio.playbackRate = 1
    nextAudio.muted = false
    nextAudio.currentTime = 0
    nextAudio.volume = gameMuted ? 0 : GAME_TARGET_VOLUME

    await safePlay(nextAudio)
    if (requestToken !== gameMusicSwitchToken) {
      hardStopAudioElement(nextAudio)
      return
    }

    activeGameAudio = nextAudio
    gamePlaybackActive = true
    syncGameMuteState()
  } catch (error) {
    gamePlaybackActive = false
    if (!isAutoplayBlockedError(error)) {
      logAudioError("Failed to start game music", error)
    }
  }
}

async function startGlitchSoundInternal() {
  if (typeof window === "undefined") return

  const audio = ensureGlitchAudio()
  if (!audio) return

  try {
    audio.loop = false
    audio.currentTime = 0
    audio.volume = 0
    audio.playbackRate = 1.02
    audio.muted = false

    await safePlay(audio)
    await fadeAudio(audio, 0, 0.95, 90)

    window.setTimeout(() => {
      if (!audio.paused) audio.playbackRate = 0.96
    }, 45)

    window.setTimeout(() => {
      if (!audio.paused) audio.playbackRate = 1.08
    }, 95)

    window.setTimeout(() => {
      if (!audio.paused) audio.playbackRate = 1
    }, 140)
  } catch (error) {
    if (!isAutoplayBlockedError(error)) {
      logAudioError("Failed to start glitch sound", error)
    }
  }
}

export async function stopGameMusic(fadeOutMs = 200) {
  gameMusicSwitchToken += 1
  gamePlaybackActive = false

  const audio = activeGameAudio ?? ensureGameAudio(currentGameSound)
  await stopAudioElement(audio, fadeOutMs)
  activeGameAudio = null
}

export async function playGlitchSound() {
  if (typeof window === "undefined") return
  await stopGameMusic(120)
  await stopGlitchSound(0)
  await startGlitchSoundInternal()
}

export async function playGameMusic(soundName?: GameSoundName) {
  const selected = soundName ?? getCurrentGameSound()
  await startGameMusicInternal(selected, { restart: true })
}

export async function switchGameMusic(soundName: GameSoundName) {
  await startGameMusicInternal(soundName, { restart: true })
}

export function setGameSound(soundName: GameSoundName) {
  persistGameSound(soundName)
}

export function setGameMuted(nextMuted: boolean) {
  gameMuted = nextMuted
  writeSessionValue(GAME_MUTED_SESSION_KEY, String(nextMuted))

  if (typeof window === "undefined") return
  if (!gamePlaybackActive) return

  syncGameMuteState()
}

export function toggleGameMuted() {
  setGameMuted(!gameMuted)
}

export async function stopAllAudio() {
  gameMusicSwitchToken += 1
  await stopGlitchSound(0)
  await stopGameMusic(0)
}

/* Compatibility helpers kept for any other files still using them */

function beep(
  frequency = 440,
  duration = 0.08,
  type: OscillatorType = "sine",
  volume = 0.04
) {
  if (typeof window === "undefined" || !audioUnlocked) return

  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const now = ctx.currentTime

    osc.type = type
    osc.frequency.setValueAtTime(frequency, now)
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(1, frequency * 0.75),
      now + duration
    )

    gain.gain.setValueAtTime(Math.max(volume, 0.0001), now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + duration)

    osc.onended = () => {
      try {
        osc.disconnect()
        gain.disconnect()
      } catch {
        // no-op
      }
    }
  } catch (error) {
    logAudioError("WebAudio beep failed", error)
  }
}

export function playButtonHover() {
  beep(660, 0.03, "triangle", 0.02)
}

export function playButtonClick() {
  beep(520, 0.05, "square", 0.03)
  setTimeout(() => beep(780, 0.05, "square", 0.025), 50)
}

export function playSystemBoot() {
  beep(220, 0.06, "square", 0.03)
  setTimeout(() => beep(330, 0.06, "square", 0.03), 90)
  setTimeout(() => beep(440, 0.08, "square", 0.03), 180)
}

export function playPortalSound() {
  beep(140, 0.12, "sine", 0.03)
  setTimeout(() => beep(280, 0.14, "triangle", 0.025), 120)
  setTimeout(() => beep(560, 0.16, "sine", 0.02), 240)
}

export function playVictory() {
  beep(523, 0.08, "triangle", 0.03)
  setTimeout(() => beep(659, 0.08, "triangle", 0.03), 90)
  setTimeout(() => beep(784, 0.1, "triangle", 0.03), 180)
}

export function playCardFlip() {
  beep(300, 0.02, "square", 0.015)
}

export function playMatchSuccess() {
  beep(392, 0.06, "triangle", 0.025)
  setTimeout(() => beep(523, 0.07, "triangle", 0.025), 70)
}