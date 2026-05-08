"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpRight, Sparkles, X, Orbit, ExternalLink } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import kevsPicLight from "@/assets/KEVS-PIC.jpg"
import kevsPicDark from "@/assets/KEVS-PIC-dark.jpg"

export type PortfolioNode = {
  title: string
  role: string
  category: string
  description: string
  year?: string
  stack?: string[]
  liveLink?: string
  thumbnail?: string
  accent?: string
}

type PortfolioSelectorFloatingProps = {
  items?: PortfolioNode[]
  className?: string
  onSelect?: (item: PortfolioNode) => void
}

const defaultItems: PortfolioNode[] = [
  {
    title: "Piesway v1",
    role: "Full-Stack /Client Work",
    category: "Production World",
    description:
      "A polished portfolio space for real-world systems, client builds, and professional delivery.",
    year: "2025",
    stack: ["React", "TypeScript", "Tailwind"],
    liveLink: "https://piesway-v1.vercel.app/",
    accent: "var(--primary)",
  },
  {
    title: "Piesway",
    role: "Motion / UI Lab",
    category: "Experimental World",
    description:
      "A visual playground for motion, interface storytelling, and futuristic frontend ideas.",
    year: "2026",
    stack: ["Framer Motion", "UI Systems", "3D"],
    liveLink: "https://piesway.vercel.app/",
    accent: "oklch(0.7 0.12 220)",
  },
]

export default function PortfolioSelectorFloating({
  items = defaultItems,
  className = "",
  onSelect,
}: PortfolioSelectorFloatingProps) {
  const { theme } = useTheme()
  const launcherImage = theme === "dark" ? kevsPicDark : kevsPicLight

  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState<PortfolioNode | null>(null)
  const [launcherVisible, setLauncherVisible] = useState(true)

  const panelRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<number | null>(null)

  const activeItem = hovered ?? items[0]

  const buttonGlow = useMemo(
    () => ({
      background:
        "radial-gradient(circle at 50% 35%, color-mix(in oklab, var(--primary) 24%, transparent) 0%, transparent 62%)",
    }),
    []
  )

  useEffect(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }

    if (open) {
      setLauncherVisible(false)
      return
    }

    closeTimerRef.current = window.setTimeout(() => {
      setLauncherVisible(true)
    }, 500)

    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
    }
  }, [open])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    const onPointerDown = (e: PointerEvent) => {
      if (!open) return
      const target = e.target as Node

      if (panelRef.current && !panelRef.current.contains(target)) {
        const launcher = document.getElementById("portfolio-selector-launcher")
        if (launcher && !launcher.contains(target)) setOpen(false)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("pointerdown", onPointerDown)

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("pointerdown", onPointerDown)
    }
  }, [open])

  const handleSelect = (item: PortfolioNode) => {
    if (onSelect) {
      onSelect(item)
      setOpen(false)
      return
    }

    if (item.liveLink) {
      window.open(item.liveLink, "_blank", "noopener,noreferrer")
      setOpen(false)
    }
  }

  return (
    <div
      className={`fixed right-4 bottom-4 z-[120] sm:right-6 sm:bottom-6 ${className}`}
    >
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close portfolio selector backdrop"
              className="fixed inset-0 z-[118] cursor-default bg-background/35 backdrop-blur-[6px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Portfolio selector"
              initial={{ opacity: 0, y: 18, scale: 0.96, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 14, scale: 0.97, filter: "blur(8px)" }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-[119] mb-3 w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-[1.7rem] border border-border/45 bg-background/75 shadow-[0_30px_100px_-40px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:w-[24.5rem]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_45%),radial-gradient(ellipse_40%_35%_at_100%_100%,color-mix(in_oklab,oklch(0.7_0.12_220)_7%,transparent),transparent_55%)]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

              <div className="relative flex items-start justify-between gap-4 border-b border-border/35 px-4 py-4 sm:px-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/18 bg-primary/[0.08] px-3 py-1.5">
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                      animate={{
                        opacity: [0.35, 1, 0.35],
                        scale: [0.92, 1.15, 0.92],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <span className="font-mono text-[9px] tracking-[0.28em] text-primary/70 uppercase">
                      Portfolio Selector
                    </span>
                  </div>
                  <p className="mt-3 text-[13px] leading-[1.6] text-muted-foreground/65">
                    Open another world inside the same universe.
                  </p>
                </div>

                <motion.button
                  type="button"
                  aria-label="Close portfolio selector"
                  onClick={() => setOpen(false)}
                  whileHover={{ scale: 1.05, rotate: 6 }}
                  whileTap={{ scale: 0.95 }}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/45 bg-card/60 text-muted-foreground/70 transition-colors hover:border-primary/25 hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>

              <div className="relative mb-3 px-3 pt-3 pb-3 sm:px-4">
                <div className="mb-3 flex items-center gap-2 px-1 font-mono text-[9px] tracking-[0.26em] text-muted-foreground/40 uppercase">
                  <Orbit className="h-3.5 w-3.5 text-primary/55" />
                  Choose a portal
                </div>

                <div className="space-y-3">
                  {items.slice(0, 2).map((item, index) => {
                    const isActive = activeItem.title === item.title
                    return (
                      <motion.div
                        key={`${item.title}-${index}`}
                        onMouseEnter={() => setHovered(item)}
                        onMouseLeave={() => setHovered(null)}
                        whileHover={{ y: -2 }}
                        transition={{
                          type: "spring",
                          stiffness: 320,
                          damping: 24,
                        }}
                        className={`group relative overflow-hidden rounded-[1.45rem] border p-3.5 transition-all duration-300 ${
                          isActive
                            ? "border-primary/22 bg-primary/[0.08]"
                            : "border-border/35 bg-card/35 hover:border-border/60 hover:bg-card/55"
                        }`}
                      >
                        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <div className="absolute inset-0 bg-[radial-gradient(240px_circle_at_30%_20%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_70%)]" />
                        </div>

                        <div className="relative flex gap-3">
                          <div
                            className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[1rem] border border-border/40 bg-background/60"
                            style={
                              item.thumbnail
                                ? {
                                    backgroundImage: `url(${item.thumbnail})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                  }
                                : undefined
                            }
                          >
                            {!item.thumbnail && (
                              <>
                                <div
                                  className="absolute inset-0 opacity-80"
                                  style={{
                                    background:
                                      "radial-gradient(circle at 35% 30%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 55%), linear-gradient(135deg, rgba(255,255,255,0.06), transparent)",
                                  }}
                                />
                                <div className="absolute inset-0 grid place-items-center">
                                  <Sparkles className="h-5 w-5 text-primary/70" />
                                </div>
                              </>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-mono text-[9px] tracking-[0.24em] text-muted-foreground/42 uppercase">
                                  {item.category}
                                </p>
                                <h3 className="mt-1 font-mono text-[1rem] leading-tight tracking-widest text-foreground uppercase">
                                  {item.title}
                                </h3>
                              </div>

                              {item.year && (
                                <span className="rounded-full border border-border/35 bg-background/55 px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] text-muted-foreground/55 uppercase">
                                  {item.year}
                                </span>
                              )}
                            </div>

                            <p className="mt-1.5 text-[12.5px] leading-[1.55] text-muted-foreground/68">
                              {item.description}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {item.stack?.slice(0, 3).map((tech) => (
                                <span
                                  key={tech}
                                  className="rounded-full border border-border/35 bg-background/50 px-2.5 py-1 font-mono text-[8px] tracking-[0.18em] text-muted-foreground/55 uppercase"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/25 pt-3">
                              <button
                                type="button"
                                onClick={() => handleSelect(item)}
                                className="inline-flex items-center gap-2 text-[11px] font-semibold text-foreground/80 transition-colors hover:text-primary"
                              >
                                Open Portfolio
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {launcherVisible && (
        <motion.button
          id="portfolio-selector-launcher"
          type="button"
          aria-label={
            open ? "Close portfolio selector" : "Open portfolio selector"
          }
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-full border border-border/45 bg-background/85 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-all duration-300 hover:border-primary/25"
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-full opacity-70"
            style={buttonGlow}
            animate={{ opacity: [0.45, 0.95, 0.45], scale: [1, 1.05, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_35%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_62%)]" />
          <motion.div
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.22 }}
            className="relative z-10 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-card/80"
          >
            <img
              src={launcherImage}
              alt="Portfolio launcher"
              className="h-full w-full object-cover"
            />
          </motion.div>
        </motion.button>
      )}
    </div>
  )
}
