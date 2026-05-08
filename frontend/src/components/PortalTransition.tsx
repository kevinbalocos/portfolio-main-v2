"use client"

import React, { useEffect, useMemo, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { playPortalSound } from "@/lib/audio"

type PortalTransitionProps = {
  onComplete: () => void
}

type Spark = {
  id: number
  angle: number
  length: number
  delay: number
  duration: number
  thickness: number
  offset: number
}

type PulseRing = {
  id: number
  delay: number
  duration: number
  scale: number
  opacity: number
}

type CrackLine = {
  id: number
  angle: number
  length: number
  delay: number
  width: number
  opacity: number
}

const glowStops = {
  charge:
    "radial-gradient(circle at 50% 50%, rgba(255,108,47,0.28), rgba(255,108,47,0.1) 24%, transparent 62%)",
  breach:
    "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.92), rgba(255,108,47,0.66) 18%, rgba(255,108,47,0.22) 36%, transparent 70%)",
  core: "radial-gradient(circle at 50% 50%, rgba(255,108,47,0.22), rgba(255,108,47,0.06) 26%, rgba(0,173,255,0.07) 42%, transparent 68%)",
}

export default function PortalTransition({
  onComplete,
}: PortalTransitionProps) {
  const prefersReducedMotion = useReducedMotion()
  const [stage, setStage] = useState<"charge" | "fracture" | "portal">("charge")

  const rings = useMemo<PulseRing[]>(
    () =>
      Array.from({ length: 4 }).map((_, index) => ({
        id: index,
        delay: index * 0.16,
        duration: 1.6 + index * 0.24,
        scale: 1.12 + index * 0.22,
        opacity: 0.68 - index * 0.12,
      })),
    []
  )

  const sparks = useMemo<Spark[]>(
    () =>
      Array.from({ length: 26 }).map((_, index) => {
        const angle = (index / 26) * Math.PI * 2
        return {
          id: index,
          angle,
          length: 220 + (index % 6) * 26,
          delay: (index % 7) * 0.05,
          duration: 0.42 + (index % 5) * 0.08,
          thickness: 1 + (index % 4) * 0.35,
          offset: 20 + (index % 5) * 6,
        }
      }),
    []
  )

  const crackLines = useMemo<CrackLine[]>(
    () =>
      Array.from({ length: 14 }).map((_, index) => {
        const angle =
          (index / 14) * Math.PI * 2 + (index % 2 === 0 ? 0.06 : -0.06)
        return {
          id: index,
          angle,
          length: 300 + (index % 5) * 36,
          delay: index * 0.025,
          width: 1 + (index % 3) * 0.55,
          opacity: 0.6 + (index % 4) * 0.08,
        }
      }),
    []
  )

  useEffect(() => {
    void playPortalSound()

    const fractureTimer = window.setTimeout(() => {
      setStage("fracture")
    }, 160)

    const portalTimer = window.setTimeout(() => {
      setStage("portal")
    }, 980)

    const completeTimer = window.setTimeout(() => {
      onComplete()
    }, 3900)

    return () => {
      window.clearTimeout(fractureTimer)
      window.clearTimeout(portalTimer)
      window.clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden bg-background"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
    >
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(255,108,47,0.09),transparent_46%),radial-gradient(circle_at_50%_60%,rgba(255,255,255,0.03),transparent_24%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.02)_50%,transparent)] opacity-70" />

      <motion.div
        className="absolute inset-0"
        animate={
          prefersReducedMotion
            ? undefined
            : {
                opacity: [0.12, 0.24, 0.14, 0.22, 0.12],
                scale: [1, 1.008, 1, 1.01, 1],
              }
        }
        transition={{
          duration: 1.1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundImage: glowStops.charge }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 opacity-80 mix-blend-screen"
        animate={
          prefersReducedMotion
            ? undefined
            : {
                opacity: [0.04, 0.12, 0.04, 0.15, 0.04],
              }
        }
        transition={{
          duration: 0.18,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(transparent_49%,rgba(255,255,255,0.05)_50%,transparent_51%)] bg-[length:100%_6px]" />
      </motion.div>

      <motion.div
        className="absolute inset-0"
        animate={
          prefersReducedMotion
            ? undefined
            : {
                x: [0, 1, -1, 2, 0],
                y: [0, -1, 1, 0, 0],
                opacity: [0.16, 0.3, 0.18, 0.26, 0.16],
              }
        }
        transition={{
          duration: 0.22,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "linear",
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0,rgba(255,255,255,0.02)_50%,transparent_100%)]" />
      </motion.div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,108,47,0.06),transparent_34%)]" />
        {stage !== "portal" &&
          Array.from({ length: 18 }).map((_, index) => {
            const top = `${8 + ((index * 7) % 84)}%`
            return (
              <motion.div
                key={`stripe-${index}`}
                className="absolute right-0 left-0 h-px bg-primary/10"
                style={{
                  top,
                  filter: "blur(1px)",
                }}
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        x: [0, index % 2 === 0 ? 28 : -28, 0],
                        opacity: [0, 0.55, 0],
                        scaleX: [0.94, 1.06, 0.98],
                      }
                }
                transition={{
                  duration: 0.36 + (index % 4) * 0.06,
                  repeat: Infinity,
                  repeatDelay: 0.18 + (index % 6) * 0.04,
                  ease: "linear",
                }}
              />
            )
          })}
      </div>

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <motion.div
          className="relative aspect-square w-[min(92vw,34rem)] sm:w-[min(78vw,40rem)]"
          initial={{ scale: 0.74, opacity: 0 }}
          animate={
            prefersReducedMotion
              ? { scale: 1, opacity: 1 }
              : {
                  scale: [0.74, 0.92, 1, 1.02, 1],
                  opacity: [0, 1, 1, 1, 1],
                }
          }
          transition={{
            duration: 0.95,
            ease: "easeOut",
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full border border-primary/18"
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    scale: [0.82, 1.02, 0.94, 1.06, 1],
                    rotate: [0, 6, -8, 5, 0],
                    opacity: [0.6, 1, 0.72, 1, 0.82],
                  }
            }
            transition={{
              duration: 1.05,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute inset-[7%] rounded-full border border-primary/34"
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    scale: [0.96, 1.03, 0.98, 1.04, 1],
                    x: [0, 3, -2, 4, 0],
                    y: [0, -2, 2, -1, 0],
                    opacity: [0.42, 0.84, 0.56, 0.9, 0.48],
                  }
            }
            transition={{
              duration: 0.72,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute inset-[15%] rounded-full border border-primary/70"
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    scale: [0.96, 1.04, 0.98, 1.06, 1],
                    opacity: [0.48, 0.94, 0.58, 0.92, 0.62],
                    rotate: [0, -3, 4, -2, 0],
                  }
            }
            transition={{
              duration: 0.44,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute inset-[22%] rounded-full border border-cyan-400/18"
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    scale: [0.98, 1.02, 0.99, 1.03, 1],
                    opacity: [0.2, 0.62, 0.28, 0.72, 0.24],
                  }
            }
            transition={{
              duration: 0.88,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute inset-[28%] rounded-full bg-background/74 backdrop-blur-md"
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    scale: [0.96, 1.01, 0.98, 1.02, 1],
                    opacity: [0.28, 0.46, 0.3, 0.5, 0.34],
                  }
            }
            transition={{
              duration: 0.86,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute inset-[18%] overflow-hidden rounded-full border border-primary/22"
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: [0.38, 1, 0.42, 0.96, 0.46],
                    boxShadow: [
                      "inset 0 0 20px rgba(255,108,47,0.08)",
                      "inset 0 0 50px rgba(255,108,47,0.28)",
                      "inset 0 0 26px rgba(255,108,47,0.12)",
                      "inset 0 0 56px rgba(255,108,47,0.22)",
                    ],
                  }
            }
            transition={{
              duration: 0.46,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="absolute inset-0"
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      opacity: [0, 0.22, 0.06, 0.24, 0],
                      y: ["-20%", "16%", "-12%"],
                    }
              }
              transition={{
                duration: 0.62,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 7px)",
              }}
            />
          </motion.div>

          <motion.div
            className="absolute inset-[24%] rounded-full blur-3xl"
            style={{ backgroundImage: glowStops.core }}
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    scale: [0.9, 1.08, 0.96, 1.1, 1],
                    opacity: [0.14, 0.8, 0.26, 0.92, 0.28],
                  }
            }
            transition={{
              duration: 0.62,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />

          {rings.map((ring) => (
            <motion.div
              key={ring.id}
              className="absolute inset-[12%] rounded-full border border-primary/18"
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      scale: [0.76, ring.scale, ring.scale + 0.04],
                      opacity: [ring.opacity, 0, 0],
                    }
              }
              transition={{
                duration: ring.duration,
                delay: ring.delay,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}

          {Array.from({ length: 16 }).map((_, index) => {
            const angle = (index / 16) * Math.PI * 2
            const radius = 128 + (index % 3) * 14

            return (
              <motion.div
                key={`orbit-${index}`}
                className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full bg-primary"
                style={{
                  marginLeft: -4,
                  marginTop: -4,
                }}
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        x: [
                          Math.cos(angle) * radius,
                          Math.cos(angle) * (radius + 12),
                          Math.cos(angle) * (radius - 8),
                          Math.cos(angle) * radius,
                        ],
                        y: [
                          Math.sin(angle) * radius,
                          Math.sin(angle) * (radius + 12),
                          Math.sin(angle) * (radius - 8),
                          Math.sin(angle) * radius,
                        ],
                        opacity: [0, 1, 0.2, 0],
                        scale: [0.1, 1.12, 0.78, 0.1],
                      }
                }
                transition={{
                  duration: 1.02 + (index % 5) * 0.06,
                  repeat: Infinity,
                  delay: index * 0.035,
                  ease: "easeInOut",
                }}
              />
            )
          })}

          {sparks.map((spark) => (
            <motion.div
              key={spark.id}
              className="absolute top-1/2 left-1/2 origin-center"
              style={{
                width: spark.length,
                height: spark.thickness,
                transform: `translate(-50%, -50%) rotate(${(spark.angle * 180) / Math.PI}deg)`,
                marginLeft: spark.offset,
                marginTop: spark.offset,
              }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={
                prefersReducedMotion
                  ? { opacity: 0.7, scaleX: 1 }
                  : {
                      scaleX: [0, 1, 0.55, 1.02, 0],
                      opacity: [0, 1, 0.58, 0.92, 0],
                      filter: [
                        "drop-shadow(0 0 0 rgba(255,108,47,0))",
                        "drop-shadow(0 0 20px rgba(255,108,47,0.88))",
                        "drop-shadow(0 0 34px rgba(255,108,47,0.48))",
                      ],
                    }
              }
              transition={{
                duration: spark.duration,
                repeat: Infinity,
                repeatDelay: spark.delay,
                ease: "easeInOut",
              }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
            </motion.div>
          ))}

          {crackLines.map((line) => (
            <motion.div
              key={line.id}
              className="absolute top-1/2 left-1/2 origin-center"
              style={{
                width: line.length,
                height: line.width,
                transform: `translate(-50%, -50%) rotate(${(line.angle * 180) / Math.PI}deg)`,
              }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={
                prefersReducedMotion
                  ? { opacity: 0.7, scaleX: 1 }
                  : {
                      scaleX: [0, 1, 1.04, 0.42, 0],
                      opacity: [0, line.opacity, 1, 0.34, 0],
                      filter: [
                        "drop-shadow(0 0 0 rgba(255,255,255,0))",
                        "drop-shadow(0 0 24px rgba(255,108,47,0.92))",
                        "drop-shadow(0 0 48px rgba(255,108,47,0.58))",
                      ],
                    }
              }
              transition={{
                duration: 0.72 + (line.id % 3) * 0.05,
                delay: line.delay,
                ease: "easeOut",
              }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent" />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {stage === "charge" && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={
            prefersReducedMotion
              ? { opacity: 0.16 }
              : { opacity: [0, 0.12, 0.04, 0.14, 0] }
          }
          transition={{
            duration: 0.22,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundImage: glowStops.charge }}
          />
        </motion.div>
      )}

      {stage === "fracture" && (
        <>
          <motion.div
            className="pointer-events-none absolute inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : {
                    opacity: [0, 1, 0.7, 0.12, 0],
                    scale: [0.95, 1.01, 1.02, 1, 1],
                  }
            }
            transition={{
              duration: 0.78,
              ease: "easeOut",
            }}
          >
            <div
              className="absolute inset-0"
              style={{ backgroundImage: glowStops.breach }}
            />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute inset-0 z-30 mix-blend-screen"
            initial={{ opacity: 0 }}
            animate={
              prefersReducedMotion
                ? { opacity: 0.65 }
                : { opacity: [0, 1, 0.42, 0] }
            }
            transition={{
              duration: 0.72,
              ease: "easeOut",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.9),transparent_22%,rgba(255,255,255,0.12)_34%,transparent_60%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0,rgba(255,255,255,0.22)_50%,transparent_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(transparent_48%,rgba(255,255,255,0.2)_49%,rgba(255,255,255,0.2)_51%,transparent_52%)]" />
          </motion.div>
        </>
      )}

      {stage === "portal" && (
        <>
          <motion.div
            className="absolute inset-0"
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: [0.08, 0.24, 0.1, 0.26, 0.08],
                    scale: [0.985, 1.01, 0.99, 1.012, 1],
                  }
            }
            transition={{
              duration: 1.05,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div
              className="absolute inset-0"
              style={{ backgroundImage: glowStops.core }}
            />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute inset-0 z-20"
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: [0.02, 0.1, 0.03, 0.12, 0.02],
                  }
            }
            transition={{
              duration: 0.16,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0,rgba(255,255,255,0.03)_50%,transparent_100%)] bg-[length:100%_12px] opacity-60" />
          </motion.div>
        </>
      )}

      <motion.div
        className="absolute inset-0 z-10"
        animate={
          prefersReducedMotion
            ? undefined
            : {
                opacity: [0, 0.08, 0.02, 0.1, 0],
              }
        }
        transition={{
          duration: 0.18,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0,rgba(255,255,255,0.02)_50%,transparent_100%)]" />
      </motion.div>
    </motion.div>
  )
}
