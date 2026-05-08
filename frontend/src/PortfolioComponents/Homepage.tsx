"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { ChangeEvent, FormEvent, MouseEvent, ReactNode } from "react"
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useInView,
} from "framer-motion"
import { useTheme } from "@/components/theme-provider"
import {
  AlertCircle,
  ArrowUpRight,
  Atom,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Code2,
  Cpu,
  Database,
  ExternalLink,
  GitBranch,
  Globe,
  Layers,
  Layers3,
  LayoutGrid,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Moon,
  Package,
  PenTool,
  Send,
  Shield,
  Sparkles,
  Sun,
  Terminal,
  Trophy,
  User,
  Zap,
  Clock,
  Filter,
} from "lucide-react"
import kevsPicLight from "@/assets/KEVS-PIC.jpg?url"
import kevsPicDark from "@/assets/KEVS-PIC-DARK.jpg?url"
import liquidForm from "@/assets/LIQUID-FORM.png?url"
import PortfolioSelectorFloating from "@/components/PortfolioSelectorFloating"

const API_BASE = import.meta.env.VITE_API_BASE || ""

const stackItems = [
  { label: "React", Icon: Atom },
  { label: "TypeScript", Icon: Code2 },
  { label: "Node.js", Icon: Code2 },
  { label: "Next.js", Icon: Globe },
  { label: "Tailwind", Icon: LayoutGrid },
  { label: "PostgreSQL", Icon: Database },
  { label: "Figma", Icon: PenTool },
  { label: "UI Systems", Icon: Layers3 },
  { label: "Three.js", Icon: Cpu },
  { label: "Docker", Icon: Package },
  { label: "AWS", Icon: Cloud },
  { label: "Git", Icon: GitBranch },
  { label: "REST APIs", Icon: Zap },
  { label: "PHP", Icon: Terminal },
  { label: "MySQL", Icon: Database },
  { label: "MongoDB", Icon: Layers },
]

const projects = [
  {
    id: "01",
    title: "Paperless CRM Platform",
    category: "Business System",
    year: "2025",
    description:
      "A paperless CRM platform built to centralize customer data, transactions, internal records, and day-to-day workflow operations in a more organized digital system.",
    stack: ["React", "TypeScript", "Node.js", "PostgreSQL", "REST APIs"],
    result: "Centralized operations at scale",
    accent: "var(--primary)",
  },
  {
    id: "02",
    title: "Records Management App",
    category: "Document System",
    year: "2025",
    description:
      "A records management application designed for digital storage, document tracking, retrieval, tagging, and cleaner audit-ready organization.",
    stack: ["PHP", "CodeIgniter", "MySQL", "REST APIs"],
    result: "Faster retrieval and structure",
    accent: "oklch(0.7 0.12 220)",
  },
  {
    id: "03",
    title: "Everlasting Roofing Website",
    category: "Business Website",
    year: "2024",
    description:
      "A responsive company website built to showcase roofing products and services with cleaner navigation, product grouping, and mobile-friendly access.",
    stack: ["React", "Tailwind CSS", "UI/UX", "Git"],
    result: "Responsive product showcase",
    accent: "oklch(0.68 0.12 12)",
  },
  {
    id: "04",
    title: "Portfolio System Redesign",
    category: "Personal Brand",
    year: "2025",
    description:
      "A custom portfolio experience focused on stronger visual identity, systems-minded content structure, responsive layout behavior, and modern theming.",
    stack: ["React", "TypeScript", "Tailwind", "Shadcn UI", "Framer Motion"],
    result: "Developer identity through design",
    accent: "var(--primary)",
  },
  {
    id: "05",
    title: "Interactive 3D Experiments",
    category: "Creative Frontend",
    year: "2025",
    description:
      "A set of experimental builds exploring motion, visual storytelling, and interactive scene composition while learning how Three.js fits into modern frontend systems.",
    stack: ["Three.js", "React", "TypeScript"],
    result: "Visual experimentation frontier",
    accent: "oklch(0.58 0.05 252)",
  },
]

const experience = [
  {
    n: "01",
    title: "Software Engineer / System Analyst",
    company: "Datalink Creative Solution Inc.",
    period: "Jul 2025 – Jan 2026",
    featured: true,
    bullets: [
      "Developed a paperless CRM platform to centralize customer data, transactions, and internal records.",
      "Built responsive and user-friendly front-end interfaces for staff and administrators.",
      "Implemented back-end functionalities including authentication, data processing, and business logic.",
      "Designed and managed the database structure for organized, secure, and efficient data storage.",
      "Created a records management system for a client to digitally store, track, and retrieve documents.",
      "Improved operational efficiency by reducing manual paperwork and streamlining data access.",
    ],
  },
  {
    n: "02",
    title: "Client Base",
    company: "Freelancing",
    period: "2025 – Present",
    featured: false,
    bullets: [
      "Built and maintained a diverse portfolio of web applications for multiple clients.",
      "Designed and developed custom software solutions tailored to specific client needs.",
      "Collaborated closely with clients to translate their needs into effective software.",
    ],
  },
  {
    n: "03",
    title: "Web Developer",
    company: "Everlasting Roofing Center",
    period: "Jul 2024 – Mar 2025",
    featured: false,
    bullets: [
      "Designed and built a website to showcase roofing products and services.",
      "Structured product categories for faster browsing and inquiry.",
      "Delivered a responsive, mobile-first layout for customer access.",
    ],
  },
]

const principles = [
  {
    id: "01",
    title: "Systems first",
    icon: Layers,
    text: "Understanding how features, data, interfaces, and logic connect is key, not treating each part in isolation.",
  },
  {
    id: "02",
    title: "Competitive Edge",
    icon: Trophy,
    text: "Gaming shaped my discipline, reaction to feedback, and drive to keep pushing until the result becomes sharper.",
  },
  {
    id: "03",
    title: "Clean product thinking",
    icon: Sparkles,
    text: "Everything I build should feel intentional, usable, and organized both visually and technically.",
  },
]

function useCursorAura() {
  const [pos, setPos] = useState({ x: -200, y: -200 })
  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", move, { passive: true })
    return () => window.removeEventListener("mousemove", move)
  }, [])
  return pos
}

function CursorAura() {
  const { x, y } = useCursorAura()
  const springX = useSpring(x, { stiffness: 80, damping: 28 })
  const springY = useSpring(y, { stiffness: 80, damping: 28 })
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-[100] hidden h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full lg:block"
      style={{
        left: springX,
        top: springY,
        background:
          "radial-gradient(circle, color-mix(in oklab, var(--primary) 6%, transparent) 0%, transparent 70%)",
      }}
    />
  )
}

function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-border/30 py-3.5">
      <div className="flex w-max animate-[marquee_32s_linear_infinite] items-center gap-10">
        {[...stackItems, ...stackItems].map((item, i) => {
          const Icon = item.Icon
          return (
            <span
              key={`${item.label}-${i}`}
              className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.26em] whitespace-nowrap text-muted-foreground/45 uppercase"
            >
              <Icon className="h-3 w-3 text-primary/40" />
              {item.label}
              <span className="text-[6px] text-border/50">◆</span>
            </span>
          )
        })}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
    </div>
  )
}

function MetricCard({
  value,
  label,
  sublabel,
}: {
  value: string
  label: string
  sublabel?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-[1.6rem] border border-border/40 bg-card/40 p-5 backdrop-blur-sm transition-all duration-500 hover:border-primary/25 hover:bg-card/60"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <p className="font-mono text-[2rem] leading-none font-semibold tracking-[-0.06em] text-foreground">
        {value}
      </p>
      <p className="mt-2 font-mono text-[9px] tracking-[0.26em] text-muted-foreground/50 uppercase">
        {label}
      </p>
      {sublabel && (
        <p className="mt-2.5 text-xs leading-5 text-muted-foreground/60">
          {sublabel}
        </p>
      )}
    </motion.div>
  )
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: ReactNode
  description?: string
}) {
  return (
    <div className="max-w-3xl">
      <p className="font-mono text-[10px] tracking-[0.35em] text-primary/55 uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.0] font-semibold tracking-[-0.055em] text-foreground">
        {title}
      </h2>
      {description && (
        <p className="mt-5 max-w-2xl text-[15px] leading-[1.75] text-muted-foreground/65">
          {description}
        </p>
      )}
    </div>
  )
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/40 bg-background/50 px-3 py-1 font-mono text-[9px] tracking-[0.18em] text-muted-foreground/60 uppercase">
      {children}
    </span>
  )
}

function ProjectCard({
  project,
  active,
  onHover,
}: {
  project: (typeof projects)[0]
  active: boolean
  onHover: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={onHover}
      className="group relative cursor-pointer overflow-hidden rounded-[2.2rem] border border-border/35 bg-card/30 backdrop-blur-sm transition-all duration-500 hover:border-border/60 hover:bg-card/50"
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(280px circle at ${mouseX}px ${mouseY}px, color-mix(in oklab, ${project.accent} 10%, transparent), transparent 70%)`,
        }}
      />

      <div className="relative p-7 sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] tracking-[0.28em] text-muted-foreground/30">
              {project.id}
            </span>
            <span className="h-px w-6 bg-border/40" />
            <span className="rounded-full border border-border/40 bg-background/50 px-3 py-1 font-mono text-[9px] tracking-[0.2em] text-muted-foreground/55 uppercase">
              {project.category}
            </span>
            <span className="hidden font-mono text-[9px] tracking-[0.2em] text-muted-foreground/30 sm:block">
              {project.year}
            </span>
          </div>
          <motion.div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/40 bg-background/50 text-muted-foreground/50 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/8 group-hover:text-primary"
            animate={{ rotate: active ? 45 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ArrowUpRight className="h-4 w-4" />
          </motion.div>
        </div>

        <h3 className="mt-5 text-[clamp(1.3rem,3vw,1.75rem)] leading-tight font-semibold tracking-[-0.04em] text-foreground">
          {project.title}
        </h3>
        <p className="mt-3 max-w-2xl text-[14px] leading-[1.7] text-muted-foreground/65">
          {project.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.stack.slice(0, 4).map((item) => (
            <Chip key={item}>{item}</Chip>
          ))}
          {project.stack.length > 4 && <Chip>+{project.stack.length - 4}</Chip>}
        </div>

        <div className="mt-7 flex items-center justify-between border-t border-border/30 pt-5">
          <p className="font-mono text-[9px] tracking-[0.26em] text-muted-foreground/40 uppercase">
            Outcome
          </p>
          <p className="text-sm font-medium text-foreground/70">
            {project.result}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function ExperienceCard({
  item,
  featured = false,
}: {
  item: (typeof experience)[0]
  featured?: boolean
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border p-7 sm:p-8 ${
        featured
          ? "border-primary/20 bg-gradient-to-br from-primary/[0.12] via-primary/[0.06] to-transparent shadow-[0_40px_80px_-40px_rgba(0,0,0,0.5)]"
          : "border-border/35 bg-card/30 backdrop-blur-sm"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      {featured && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_90%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent)]" />
      )}
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          {featured && (
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 font-mono text-[9px] tracking-[0.22em] text-primary/75 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/75" />
              Featured
            </span>
          )}
          <h3 className="text-xl leading-tight font-semibold tracking-[-0.04em] text-foreground">
            {item.company}
          </h3>
          <p className="mt-1 font-mono text-[10px] tracking-[0.22em] text-muted-foreground/50 uppercase">
            {item.title}
          </p>
        </div>
        <span className="rounded-full border border-border/40 bg-background/50 px-4 py-1.5 font-mono text-[9px] tracking-[0.2em] text-muted-foreground/55 uppercase">
          {item.period}
        </span>
      </div>
      <ul className="relative mt-6 space-y-3">
        {item.bullets.map((b) => (
          <li
            key={b}
            className="flex gap-3.5 text-[14px] leading-[1.65] text-muted-foreground/72"
          >
            <span
              className={`mt-[0.45rem] h-1 w-1 shrink-0 rounded-full ${
                featured ? "bg-primary/60" : "bg-border/70"
              }`}
            />
            {b}
          </li>
        ))}
      </ul>
    </div>
  )
}

function SkillCluster({
  title,
  summary,
  items,
  accent = false,
}: {
  title: string
  summary: string
  items: string[]
  accent?: boolean
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border p-7 sm:p-8 ${
        accent
          ? "border-primary/18 bg-gradient-to-br from-primary/10 via-primary/[0.04] to-transparent"
          : "border-border/35 bg-card/30 backdrop-blur-sm"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/22 to-transparent" />
      <p
        className={`font-mono text-[9px] tracking-[0.3em] uppercase ${
          accent ? "text-primary/65" : "text-muted-foreground/50"
        }`}
      >
        {title}
      </p>
      <p
        className={`mt-4 text-[14px] leading-[1.7] ${
          accent ? "text-foreground/80" : "text-muted-foreground/70"
        }`}
      >
        {summary}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {items.map((item) => (
          <Chip key={item}>{item}</Chip>
        ))}
      </div>
    </div>
  )
}

function StatementSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y1 = useTransform(scrollYProgress, [0, 1], [40, -40])
  const y2 = useTransform(scrollYProgress, [0, 1], [-30, 30])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  const metrics = [
    { value: "since 2019", label: "Competitive years" },
    { value: "5+", label: "Teams / squads" },
    { value: "100+", label: "Scrims & events" },
    { value: "∞", label: "VOD reviews" },
  ]

  return (
    <section
      ref={ref}
      className="relative z-10 overflow-hidden px-4 py-28 sm:px-6 sm:py-36 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.55_0.18_35)] via-[oklch(0.42_0.14_28)] to-[oklch(0.22_0.08_30)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_30%_20%,rgba(255,160,60,0.22),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_80%_80%,rgba(255,100,30,0.14),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            backgroundSize: "256px 256px",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-background to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[500px] bg-gradient-to-t from-background to-transparent" />
      </div>

      <motion.div style={{ opacity }} className="relative mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <motion.div style={{ y: y1 }}>
            <p className="font-mono text-[10px] tracking-[0.35em] text-white/45 uppercase">
              ABOUT GAMING
            </p>
            <h2 className="mt-6 text-[clamp(2.8rem,7vw,6rem)] leading-[0.92] font-semibold tracking-[-0.06em] text-white">
              Played to win.
              <br />
              <span className="text-white/35">Trained to last.</span>
              <br />
              Studied to stay
              <br />
              <span className="text-white/35">ahead.</span>
            </h2>
            <p className="mt-8 max-w-md text-[15px] leading-[1.75] text-white/60">
              Competitive CODM taught me discipline, composure, and the habit of
              reviewing everything until the next match feels sharper than the
              last.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="https://www.tiktok.com/@defnotjeydugh"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-[13px] font-semibold tracking-[-0.02em] text-[oklch(0.42_0.14_28)] transition-all hover:bg-white/90"
              >
                TIKTOK
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=100064707712913"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-7 py-3 text-[13px] font-medium text-white/80 transition-all hover:bg-white/14"
              >
                FACEBOOK PAGE
              </a>
            </div>
          </motion.div>

          <motion.div style={{ y: y2 }} className="grid grid-cols-2 gap-4">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative overflow-hidden rounded-[1.8rem] border border-white/12 bg-white/[0.07] p-7 backdrop-blur-sm transition-all duration-400 hover:border-white/22 hover:bg-white/[0.11]"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <p className="font-mono text-[2.6rem] leading-none font-semibold tracking-[-0.06em] text-white">
                  {m.value}
                </p>
                <p className="mt-3 font-mono text-[10px] tracking-[0.24em] text-white/45 uppercase">
                  {m.label}
                </p>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.4,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative col-span-2 overflow-hidden rounded-[1.8rem] border border-white/12 bg-white/[0.07] p-7 backdrop-blur-sm"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <p className="font-mono text-[9px] tracking-[0.28em] text-white/40 uppercase">
                Currently
              </p>
              <p className="mt-3 text-[1.1rem] leading-snug font-semibold tracking-[-0.03em] text-white/85">
                Open for scrims, roster invites, tournament collabs, and gaming
                content work.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <motion.span
                  className="h-2 w-2 rounded-full bg-emerald-400"
                  animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.2, 0.9] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
                <span className="font-mono text-[10px] tracking-[0.22em] text-white/50 uppercase">
                  Available
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [status, setStatus] = useState<{
    loading: boolean
    msg: string | null
    error: boolean
  }>({ loading: false, msg: null, error: false })

  const contactCards = [
    {
      label: "Email",
      value: "kevinbalocos@gmail.com",
      icon: Mail,
      href: "mailto:kevinbalocos@gmail.com",
    },
    { label: "Location", value: "Laguna, Philippines", icon: MapPin },
    { label: "Reply time", value: "Usually when I'm online", icon: Clock },
    { label: "Social", value: "Instagram / Facebook / TikTok", icon: Globe },
  ]

  const highlights = [
    "Open for projects",
    "Freelance inquiries",
    "Website or system work",
    "Direct message only",
  ]

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }))
  }

  const sendMailFallback = () => {
    const mailto = `mailto:kevinbalocos@gmail.com?subject=${encodeURIComponent(
      form.subject || "Portfolio Contact"
    )}&body=${encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    )}`
    window.location.href = mailto
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.email || !form.message) {
      setStatus({
        loading: false,
        msg: "Please add your email and message.",
        error: true,
      })
      return
    }
    setStatus({ loading: true, msg: null, error: false })
    try {
      const url = API_BASE ? `${API_BASE}/api/send-contact` : "/api/send-contact"
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const body = await resp.json().catch(() => ({}))
      if (!resp.ok) throw new Error(body?.message || "Failed to send")
      setStatus({
        loading: false,
        msg: body?.message || "Message sent.",
        error: false,
      })
      setForm({ name: "", email: "", subject: "", message: "" })
    } catch (err) {
      console.error(err)
      setStatus({
        loading: false,
        msg: "Message could not be sent right now. Your mail app will open instead.",
        error: true,
      })
      setTimeout(sendMailFallback, 1000)
    }
  }

  const inputBaseClasses = `
    w-full rounded-2xl border border-border/40 bg-background/60 px-4 py-3.5
    text-sm text-foreground
    outline-none transition-all duration-250
    placeholder:text-muted-foreground/35
    focus:border-primary/40 focus:ring-2 focus:ring-primary/12
    hover:border-border/65
  `
  const labelClasses =
    "flex items-center gap-2 font-mono text-[9px] tracking-[0.28em] text-muted-foreground/55 uppercase"

  return (
    <section
      id="contact"
      className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="relative overflow-hidden rounded-[3rem] border border-border/40 bg-background/60 shadow-[0_60px_140px_-60px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_10%_10%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_45%),radial-gradient(ellipse_45%_40%_at_90%_15%,color-mix(in_oklab,oklch(0.7_0.12_220)_8%,transparent),transparent_40%),radial-gradient(ellipse_55%_55%_at_50%_95%,color-mix(in_oklab,var(--primary)_5%,transparent),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <div className="relative grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-8 sm:p-10 lg:p-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/18 bg-primary/[0.07] px-4 py-1.5">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-primary"
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.2, 0.9] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <span className="font-mono text-[10px] tracking-[0.3em] text-primary/70 uppercase">
                Contact
              </span>
            </div>

            <h2 className="mt-6 max-w-lg text-[clamp(1.9rem,4vw,3.2rem)] leading-[1.05] font-semibold tracking-[-0.055em] text-foreground">
              Need a developer for a website or system?
            </h2>
            <p className="mt-4 max-w-md text-[14px] leading-[1.75] text-muted-foreground/65">
              Tell me what you're building, what you need help with, and the
              timeline. I'll read it personally and get back to you as soon as I
              can.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {highlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border/35 bg-background/50 px-3 py-1 font-mono text-[9px] tracking-[0.18em] text-muted-foreground/55 uppercase"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {contactCards.map((card) => {
                const Icon = card.icon
                const inner = (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[0.9rem] border border-border/40 bg-background/60">
                      <Icon className="h-4 w-4 text-primary/65" />
                    </div>
                    <div>
                      <p className="font-mono text-[9px] tracking-[0.24em] text-muted-foreground/45 uppercase">
                        {card.label}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-foreground/80">
                        {card.value}
                      </p>
                    </div>
                  </div>
                )
                return card.href ? (
                  <a
                    key={card.label}
                    href={card.href}
                    className="group rounded-[1.4rem] border border-border/35 bg-card/40 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/22 hover:bg-card/60"
                  >
                    {inner}
                  </a>
                ) : (
                  <div
                    key={card.label}
                    className="rounded-[1.4rem] border border-border/35 bg-card/40 p-4"
                  >
                    {inner}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative border-t border-border/35 bg-card/20 p-8 sm:p-10 lg:border-t-0 lg:border-l lg:p-12">
            <div className="mb-7">
              <p className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground/45 uppercase">
                Message form
              </p>
              <h3 className="mt-2.5 text-2xl font-semibold tracking-[-0.05em] text-foreground">
                Write your message
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className={labelClasses}>
                    <User className="h-3 w-3" />
                    Name
                  </span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className={inputBaseClasses}
                  />
                </label>
                <label className="space-y-2">
                  <span className={labelClasses}>
                    <Mail className="h-3 w-3" />
                    Email *
                  </span>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className={inputBaseClasses}
                    required
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className={labelClasses}>
                  <MessageSquare className="h-3 w-3" />
                  Subject
                </span>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  className={inputBaseClasses}
                />
              </label>

              <label className="block space-y-2">
                <span className={labelClasses}>
                  <MessageSquare className="h-3 w-3" />
                  Message *
                </span>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={7}
                  placeholder="Tell me about the project..."
                  className={`${inputBaseClasses} resize-none`}
                  required
                />
              </label>

              <AnimatePresence>
                {status.msg && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm ${
                      status.error
                        ? "border-red-400/20 bg-red-500/10 text-red-200"
                        : "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                    }`}
                  >
                    {status.error ? (
                      <AlertCircle className="h-4 w-4 shrink-0" />
                    ) : (
                      <CheckCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{status.msg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={status.loading}
                whileHover={{ scale: status.loading ? 1 : 1.015 }}
                whileTap={{ scale: status.loading ? 1 : 0.985 }}
                className="group inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_20px_45px_-18px_rgba(0,0,0,0.55)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status.loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Homepage({ onRestart }: { onRestart?: () => void }) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"
  const [showAllExp, setShowAllExp] = useState(false)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [activeNav, setActiveNav] = useState("home")
  const [activeFilter, setActiveFilter] = useState<string>("All")

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, 40])

  useEffect(() => {
    const sections = [
      "home",
      "about",
      "experience",
      "projects",
      "skills",
      "contact",
    ]
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveNav(e.target.id)
        })
      },
      { threshold: 0.35 }
    )
    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  const projectCategories = useMemo(
    () => ["All", ...new Set(projects.map((p) => p.category))],
    []
  )

  const filteredProjects = useMemo(
    () =>
      activeFilter === "All"
        ? projects
        : projects.filter((p) => p.category === activeFilter),
    [activeFilter]
  )

  const visibleProjects = useMemo(
    () => (showAllProjects ? filteredProjects : filteredProjects.slice(0, 2)),
    [filteredProjects, showAllProjects]
  )

  const remainingProjectsCount = Math.max(filteredProjects.length - 2, 0)

  const skillGroups = [
    {
      title: "Frontend Systems",
      summary:
        "Polished interfaces with strong hierarchy, reusable components, and UI decisions that stay maintainable as the project grows.",
      items: [
        "React",
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "Shadcn UI",
        "UI/UX",
        "Framer Motion",
      ],
    },
    {
      title: "Backend & Data",
      summary:
        "Application logic, API structure, database design, and full-stack problem solving with a systems-first mindset.",
      items: [
        "Node.js",
        "PHP",
        "CodeIgniter",
        "REST APIs",
        "PostgreSQL",
        "MySQL",
        "MongoDB",
      ],
    },
    {
      title: "Tools & Delivery",
      summary:
        "Practical systems that are easier to ship, debug, iterate on, and improve through real project work.",
      items: [
        "Git",
        "Docker",
        "AWS",
        "Three.js",
        "Problem Solving",
        "System Design",
      ],
    },
  ]

  const avatarSrc = isDark ? kevsPicDark : kevsPicLight

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CursorAura />
      <PortfolioSelectorFloating />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_12%_8%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_88%_6%,color-mix(in_oklab,oklch(0.7_0.12_220)_6%,transparent),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_35%_at_50%_80%,color-mix(in_oklab,var(--primary)_4%,transparent),transparent_55%)]" />
      </div>

      <div className="sticky top-3 z-50 px-3 sm:top-4 sm:px-4 lg:px-6">
        <nav className="mx-auto max-w-7xl rounded-full border border-border/40 bg-background/70 px-3 py-2 shadow-[0_20px_70px_-20px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <div className="relative flex items-center justify-between gap-3 px-2">
            <a href="#home" className="flex items-center gap-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-full border border-border/50 bg-card/60">
                <img
                  src={avatarSrc}
                  alt="JEYD"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <p className="font-mono text-[10px] tracking-[0.36em] text-foreground/80 uppercase">
                  JEYD
                </p>
                <p className="text-[11px] text-muted-foreground/65">
                  Full-Stack Developer
                </p>
              </div>
            </a>

            <div className="hidden items-center gap-1 lg:flex">
              {[
                ["home", "Home"],
                ["about", "About"],
                ["experience", "Experience"],
                ["projects", "Projects"],
                ["skills", "Skills"],
              ].map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`rounded-full px-4 py-2 font-mono text-[10px] tracking-[0.18em] uppercase transition-all duration-200 ${
                    activeNav === id
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/55 hover:bg-muted/50 hover:text-foreground/85"
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="grid h-8 w-8 place-items-center rounded-full border border-border/50 bg-card/60 text-foreground transition-transform hover:scale-105"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="h-3.5 w-3.5" />
                ) : (
                  <Moon className="h-3.5 w-3.5" />
                )}
              </button>

              {onRestart && (
                <button
                  onClick={onRestart}
                  className="hidden rounded-full border border-border/50 bg-background/60 px-4 py-2 font-mono text-[10px] tracking-[0.18em] text-foreground/65 uppercase transition-all hover:bg-muted/50 sm:inline-flex"
                >
                  Restart
                </button>
              )}

              <a
                href="https://www.instagram.com/jeydnd_"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 font-mono text-[10px] tracking-[0.18em] text-white uppercase shadow-[0_8px_24px_-10px_rgba(0,0,0,0.5)] transition-all hover:scale-[1.02] hover:brightness-110"
              >
                Connect <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </nav>
      </div>

      <section
        id="home"
        ref={heroRef}
        className="relative z-10 mx-auto flex min-h-[calc(100dvh-5.5rem)] items-center overflow-hidden px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden translate-x-1/2 overflow-hidden lg:block">
          <img
            src={liquidForm}
            alt=""
            className="h-full w-full object-cover object-right opacity-70 mix-blend-multiply dark:mix-blend-screen"
          />
        </div>

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative w-full"
        >
          <motion.div
            className="flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-4 py-1.5">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-primary"
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.2, 0.9] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <span className="font-mono text-[10px] tracking-[0.3em] text-primary/75 uppercase">
                Systems-minded portfolio
              </span>
            </span>
            <span className="rounded-full border border-border/40 bg-background/55 px-4 py-1.5 font-mono text-[10px] tracking-[0.3em] text-muted-foreground/50 uppercase">
              IT Graduate · Full Stack
            </span>
          </motion.div>

          <motion.div
            className="relative mt-8 max-w-3xl lg:max-w-[56%]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-mono text-[11px] tracking-[0.42em] text-muted-foreground/40 uppercase">
              JEYD / Jeydugh
            </p>
            <h1 className="mt-5 text-[clamp(3rem,7.5vw,6.8rem)] leading-[0.86] font-semibold tracking-[-0.065em] text-foreground">
              I build with a
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/75 to-primary/40 bg-clip-text text-transparent">
                systems mindset
              </span>
              <br />
              and ship with
              <br />
              <span className="text-foreground/35">competitive intent.</span>
            </h1>

            <p className="mt-7 max-w-xl text-[15px] leading-[1.8] text-muted-foreground/65">
              I'm an IT graduate focused on full-stack development, system
              design, and UI/UX. Gaming shapes how I work — the discipline,
              pattern recognition, and drive to keep improving until the system
              feels right.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <motion.a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-[0_16px_40px_-14px_rgba(0,0,0,0.5)] transition-all hover:brightness-110"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View projects <ArrowUpRight className="h-4 w-4" />
              </motion.a>
              <motion.a
                href="https://www.tiktok.com/@defnotjeydugh"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border/45 bg-background/55 px-7 py-3 text-sm font-medium text-foreground/70 transition-all hover:bg-muted/45"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                TikTok <ExternalLink className="h-3.5 w-3.5" />
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-0 left-0 hidden items-center gap-2 lg:flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground/30" />
            </motion.div>
            <span className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground/30 uppercase">
              Scroll
            </span>
          </motion.div>
        </motion.div>
      </section>

      <div className="relative z-10">
        <Marquee />
      </div>

      <RevealSection>
        <section
          id="about"
          className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
        >
          <SectionTitle
            eyebrow="About"
            title={
              <>
                I care about systems,
                <br className="hidden sm:block" /> usability, and growth
                <br className="hidden sm:block" /> that compounds.
              </>
            }
            description="The goal is not just to make things look premium. It is to make the structure feel intelligent, the experience feel calm, and the portfolio feel like a real product."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative col-span-full overflow-hidden rounded-[2.4rem] border border-primary/15 bg-gradient-to-br from-primary via-primary/80 to-primary/60 p-8 shadow-[0_40px_80px_-35px_rgba(0,0,0,0.5)] sm:p-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_65%_at_5%_10%,rgba(255,255,255,0.16),transparent_50%),radial-gradient(ellipse_40%_45%_at_90%_85%,rgba(0,180,255,0.1),transparent_45%)]" />
              <p className="relative font-mono text-[9px] tracking-[0.3em] text-primary-foreground/45 uppercase">
                Work philosophy
              </p>
              <h3 className="relative mt-5 max-w-2xl text-[clamp(1.5rem,3.5vw,2.4rem)] leading-tight font-semibold tracking-[-0.045em] text-primary-foreground">
                Full-stack growth, stronger system thinking, and cleaner
                frontend execution.
              </h3>
              <p className="relative mt-4 max-w-2xl text-[14px] leading-[1.75] text-primary-foreground/65">
                My background in IT and competitive gaming both push me toward
                the same strength: understanding systems deeply and improving
                within them.
              </p>
              <div className="relative mt-7 flex flex-wrap gap-2">
                {[
                  "System Design",
                  "Full Stack",
                  "UI/UX Quality",
                  "Maintainable Code",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1 font-mono text-[9px] tracking-[0.18em] text-primary-foreground/70 uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[2.2rem] border border-border/35 bg-card/40 p-7 backdrop-blur-sm transition-all duration-400 hover:border-border/60 hover:bg-card/60">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/22 to-transparent" />
              <Terminal className="h-6 w-6 text-primary/55" />
              <p className="mt-5 text-[2.2rem] leading-none font-semibold tracking-[-0.06em]">
                IT
              </p>
              <p className="mt-1.5 font-mono text-[9px] tracking-[0.26em] text-muted-foreground/45 uppercase">
                Graduate path
              </p>
              <p className="mt-4 text-[14px] leading-[1.65] text-muted-foreground/70">
                Competitive gaming sharpened my focus. Development gives that
                focus a professional direction.
              </p>
              <div className="mt-5 flex items-center gap-2 rounded-[0.9rem] border border-border/35 bg-background/40 px-3 py-2.5">
                <Shield className="h-3.5 w-3.5 text-primary/50" />
                <span className="text-xs text-muted-foreground/65">
                  Structure, clarity, and consistency.
                </span>
              </div>
            </div>

            {principles.map((p) => {
              const Icon = p.icon
              return (
                <div
                  key={p.id}
                  className="group relative overflow-hidden rounded-[2.2rem] border border-border/35 bg-card/40 p-7 backdrop-blur-sm transition-all duration-400 hover:border-primary/18 hover:bg-card/60"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
                  <div className="flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[0.8rem] border border-border/40 bg-background/55">
                      <Icon className="h-4.5 w-4.5 text-primary/55" />
                    </div>
                    <span className="font-mono text-[9px] tracking-[0.22em] text-muted-foreground/28 uppercase">
                      {p.id}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-semibold tracking-[-0.03em]">
                    {p.title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-[1.65] text-muted-foreground/65">
                    {p.text}
                  </p>
                </div>
              )
            })}

            <div className="relative col-span-full overflow-hidden rounded-[2.2rem] border border-border/35 bg-card/40 p-7 backdrop-blur-sm sm:col-span-2 sm:p-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/22 to-transparent" />
              <p className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground/45 uppercase">
                Now building
              </p>
              <p className="mt-3.5 text-lg font-semibold tracking-[-0.035em]">
                Work-ready frontend and full-stack projects, with gaming as a
                mindset influence.
              </p>
              <div className="mt-6 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  "Portfolio-quality interfaces",
                  "Full-stack project depth",
                  "System design fundamentals",
                  "Real product structure",
                  "Competitive gaming mindset",
                  "Developer identity growth",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 rounded-[0.9rem] border border-border/35 bg-background/40 px-3.5 py-3"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary/50" />
                    <span className="text-xs text-muted-foreground/70">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section
          id="experience"
          className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
        >
          <div className="grid gap-12 lg:grid-cols-[0.45fr_1.55fr]">
            <div className="lg:sticky lg:top-24 lg:self-start lg:pt-1">
              <p className="font-mono text-[10px] tracking-[0.35em] text-primary/55 uppercase">
                Experience
              </p>
              <h2 className="mt-4 text-[clamp(1.6rem,3.5vw,2.4rem)] leading-tight font-semibold tracking-[-0.05em]">
                Growing through systems, projects, and consistent technical
                practice.
              </h2>
              <p className="mt-4 text-[14px] leading-[1.7] text-muted-foreground/60">
                Real roles. Real systems. Real output.
              </p>
            </div>

            <div className="relative">
              <div className="absolute top-3 bottom-3 left-5 w-px bg-gradient-to-b from-primary/35 via-border/40 to-transparent" />
              <div className="space-y-4 pl-12">
                {experience
                  .filter((e) => e.featured)
                  .map((item) => (
                    <div key={item.n} className="relative">
                      <div className="absolute top-5 -left-[31px] h-3 w-3 rounded-full border border-primary/45 bg-primary/70 shadow-[0_0_14px_color-mix(in_oklab,var(--primary)_50%,transparent)]" />
                      <ExperienceCard item={item} featured />
                    </div>
                  ))}

                <div className="relative">
                  <div className="absolute top-3.5 -left-[31px] h-3 w-3 rounded-full border border-border/50 bg-background" />
                  <div className="relative inline-flex">
                    {!showAllExp && (
                      <>
                        <motion.span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-full bg-primary/18 blur-2xl"
                          animate={{
                            opacity: [0.2, 0.7, 0.2],
                            scale: [1, 1.1, 1],
                          }}
                          transition={{ duration: 2.4, repeat: Infinity }}
                        />
                        <motion.span
                          aria-hidden
                          className="pointer-events-none absolute -inset-2 rounded-full border border-primary/28"
                          animate={{
                            opacity: [0.15, 0.75, 0.15],
                            scale: [0.96, 1.08, 0.96],
                          }}
                          transition={{ duration: 2.2, repeat: Infinity }}
                        />
                      </>
                    )}
                    <motion.button
                      onClick={() => setShowAllExp((c) => !c)}
                      className="relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-border/45 bg-card/50 px-6 py-3 font-mono text-[10px] tracking-[0.2em] text-muted-foreground/70 uppercase backdrop-blur-sm transition-all hover:border-primary/25 hover:bg-card/70"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {showAllExp
                        ? "Hide experience"
                        : `Show all experience (${experience.filter((e) => !e.featured).length} more)`}
                      <motion.span
                        animate={{ rotate: showAllExp ? 180 : 0 }}
                        transition={{ duration: 0.22 }}
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </motion.span>
                    </motion.button>
                  </div>
                </div>

                <AnimatePresence>
                  {showAllExp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                      className="space-y-4 overflow-hidden"
                    >
                      {experience
                        .filter((e) => !e.featured)
                        .map((item, i) => (
                          <motion.div
                            key={item.n}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: i * 0.09,
                              duration: 0.5,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="relative"
                          >
                            <div className="absolute top-5 -left-[31px] h-2.5 w-2.5 rounded-full border border-border/50 bg-muted/50" />
                            <ExperienceCard item={item} />
                          </motion.div>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section
          id="projects"
          className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle
              eyebrow="Projects"
              title={
                <>
                  Work that shows how I think
                  <br className="hidden sm:block" /> about product, systems,
                  <br className="hidden sm:block" /> and modern web.
                </>
              }
              description="A curated selection of builds — use the filters to scan by type, then read each card for structure and intent behind the work."
            />
            <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-border/40 bg-card/40 p-1.5 backdrop-blur-sm lg:self-auto">
              <Filter className="ml-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
              <div className="flex flex-wrap gap-1">
                {projectCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveFilter(category)
                      setShowAllProjects(false)
                    }}
                    className={`rounded-full px-3.5 py-1.5 font-mono text-[9px] tracking-[0.18em] uppercase transition-all duration-200 ${
                      activeFilter === category
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground/60 hover:bg-muted/50 hover:text-foreground/75"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4">
            <AnimatePresence mode="popLayout">
              {visibleProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProjectCard
                    project={project}
                    active={false}
                    onHover={() => {}}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredProjects.length > 2 && (
            <div className="mt-6 flex justify-center">
              <div className="relative inline-flex">
                {!showAllProjects && (
                  <>
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-full bg-primary/18 blur-2xl"
                      animate={{
                        opacity: [0.2, 0.7, 0.2],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 2.4, repeat: Infinity }}
                    />
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute -inset-2 rounded-full border border-primary/28"
                      animate={{
                        opacity: [0.15, 0.75, 0.15],
                        scale: [0.96, 1.08, 0.96],
                      }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                    />
                  </>
                )}

                <motion.button
                  onClick={() => setShowAllProjects((c) => !c)}
                  className="relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-border/45 bg-card/50 px-6 py-3 font-mono text-[10px] tracking-[0.2em] text-muted-foreground/70 uppercase backdrop-blur-sm transition-all hover:border-primary/25 hover:bg-card/70"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {showAllProjects
                    ? "Hide projects"
                    : `Show all projects (${remainingProjectsCount} more)`}
                  <motion.span
                    animate={{ rotate: showAllProjects ? 180 : 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </motion.span>
                </motion.button>
              </div>
            </div>
          )}
        </section>
      </RevealSection>

      <RevealSection>
        <section
          id="skills"
          className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
        >
          <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <SectionTitle
              eyebrow="Tech stack"
              title={<>Broad, but centered on full-stack systems.</>}
              description="The portfolio should make the stack feel structured, not random. This grouping keeps the breadth visible while still reading like a coherent product system."
            />
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {[
                "Frontend quality",
                "Backend logic",
                "Design systems",
                "Responsive behavior",
                "Motion polish",
              ].map((tag) => (
                <Chip key={tag}>{tag}</Chip>
              ))}
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-[2rem] border border-border/35 bg-card/30 p-6 backdrop-blur-sm">
            <div className="flex flex-wrap gap-2.5">
              {stackItems.map(({ label, Icon }) => (
                <motion.span
                  key={label}
                  className="flex cursor-default items-center gap-1.5 rounded-full border border-border/40 bg-background/55 px-3 py-1.5 font-mono text-[9px] tracking-[0.2em] text-muted-foreground/60 uppercase transition-all duration-200 hover:border-primary/28 hover:bg-primary/[0.07] hover:text-primary/75"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {skillGroups.map((group, idx) => (
              <SkillCluster
                key={group.title}
                title={group.title}
                summary={group.summary}
                items={group.items}
                accent={idx === 0}
              />
            ))}
          </div>
        </section>
      </RevealSection>

      <StatementSection />
      <ContactSection />

      <footer className="relative z-10 border-t border-border/30">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 overflow-hidden rounded-[0.65rem] border border-border/40">
              <img
                src={avatarSrc}
                alt="JEYD"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-mono text-[9px] tracking-[0.32em] text-muted-foreground/50 uppercase">
                JEYD
              </p>
              <p className="text-xs text-foreground/55">Full-Stack Developer</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            {[
              {
                label: "Facebook",
                href: "https://www.facebook.com/kevin.balocos.3",
              },
              {
                label: "TikTok",
                href: "https://www.tiktok.com/@defnotjeydugh",
              },
              { label: "Instagram", href: "https://www.instagram.com/jeydnd_" },
              { label: "Projects", href: "#projects" },
              { label: "Stack", href: "#skills" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                className="font-mono text-[9px] tracking-[0.26em] text-muted-foreground/40 uppercase transition-colors hover:text-foreground/70"
              >
                {link.label}
              </a>
            ))}
          </div>

          <p className="font-mono text-[9px] tracking-[0.22em] text-muted-foreground/28 uppercase">
            © 2026 JEYD · Built with intent
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}