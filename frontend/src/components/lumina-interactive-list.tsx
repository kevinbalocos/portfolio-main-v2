"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type ProjectItem = {
  title: string
  category: string
  description: string
  stack: string[]
  result: string
  tone: string
}

type LuminaInteractiveListProps = {
  items: ProjectItem[]
}

export function LuminaInteractiveList({ items }: LuminaInteractiveListProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const activeProject = items[activeIndex]
  const leadProject = items[0]
  const remainingProjects = items.slice(1)

  return (
    <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
      <div className="grid gap-4">
        <div className="flex justify-start">
          <Button
            variant="outline"
            onClick={() => setShowAllProjects((current) => !current)}
            className="project-pulse rounded-full  bg-background/90 px-6 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.35)] hover:bg-muted/50"
          >
            {showAllProjects ? "Hide extra projects" : `Show all projects (${items.length})`}
          </Button>
        </div>

        {[leadProject].map((item) => {
          const index = 0
          const isActive = index === activeIndex

          return (
            <button
              key={item.title}
              type="button"
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
              className={`group relative overflow-hidden rounded-[2rem] border text-left transition-all duration-500 ${
                isActive
                  ? "border-primary/35 bg-card shadow-[0_30px_90px_-50px_rgba(0,0,0,0.45)]"
                  : "border-border/70 bg-background/75 hover:border-primary/20 hover:bg-muted/30"
              }`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${item.tone} transition-opacity duration-500 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />

              <div className="relative flex gap-4 p-5 sm:p-6">
                <div className="flex w-10 shrink-0 flex-col items-center pt-1">
                  <span
                    className={`h-3 w-3 rounded-full transition-all duration-500 ${
                      isActive ? "bg-primary shadow-[0_0_0_6px_rgba(255,255,255,0.05)]" : "bg-border"
                    }`}
                  />
                  <span className={`mt-3 h-full w-px ${isActive ? "bg-primary/30" : "bg-border/60"}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[0.68rem] uppercase tracking-[0.3em] text-muted-foreground">
                        {String(index + 1).padStart(2, "0")} / {item.category}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-foreground sm:text-2xl">
                        {item.title}
                      </h3>
                    </div>

                    <div
                      className={`w-fit rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em] ${
                        isActive
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border/70 bg-background/70 text-muted-foreground"
                      }`}
                    >
                      {item.result}
                    </div>
                  </div>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </button>
          )
        })}

        <div
          className={`grid overflow-hidden transition-all duration-700 ease-out ${
            showAllProjects ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="grid gap-4 pt-1">
              {remainingProjects.map((item, index) => {
                const actualIndex = index + 1
                const isActive = actualIndex === activeIndex

                return (
                  <button
                    key={item.title}
                    type="button"
                    onMouseEnter={() => setActiveIndex(actualIndex)}
                    onFocus={() => setActiveIndex(actualIndex)}
                    onClick={() => setActiveIndex(actualIndex)}
                    className={`group relative overflow-hidden rounded-[2rem] border text-left transition-all duration-500 ${
                      isActive
                        ? "border-primary/35 bg-card shadow-[0_30px_90px_-50px_rgba(0,0,0,0.45)]"
                        : "border-border/70 bg-background/75 hover:border-primary/20 hover:bg-muted/30"
                    } ${showAllProjects ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
                    style={{ transitionDelay: showAllProjects ? `${index * 90}ms` : "0ms" }}
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${item.tone} transition-opacity duration-500 ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />

                    <div className="relative flex gap-4 p-5 sm:p-6">
                      <div className="flex w-10 shrink-0 flex-col items-center pt-1">
                        <span
                          className={`h-3 w-3 rounded-full transition-all duration-500 ${
                            isActive ? "bg-primary shadow-[0_0_0_6px_rgba(255,255,255,0.05)]" : "bg-border"
                          }`}
                        />
                        <span className={`mt-3 h-full w-px ${isActive ? "bg-primary/30" : "bg-border/60"}`} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-[0.68rem] uppercase tracking-[0.3em] text-muted-foreground">
                              {String(actualIndex + 1).padStart(2, "0")} / {item.category}
                            </p>
                            <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-foreground sm:text-2xl">
                              {item.title}
                            </h3>
                          </div>

                          <div
                            className={`w-fit rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em] ${
                              isActive
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-border/70 bg-background/70 text-muted-foreground"
                            }`}
                          >
                            {item.result}
                          </div>
                        </div>

                        <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="xl:sticky xl:top-28">
        <Card className="relative overflow-hidden rounded-[2.8rem] border-border/70 bg-card text-card-foreground shadow-[0_45px_120px_-60px_rgba(0,0,0,0.38)]">
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${activeProject.tone} transition-all duration-700`} />
          <div className="pointer-events-none absolute inset-x-8 top-8 h-px bg-border/70" />
          <div className="pointer-events-none absolute inset-y-8 right-8 w-px bg-border/40" />

          <CardContent className="relative p-6 sm:p-8 lg:p-10">
            <div
              key={activeProject.title}
              className="grid gap-8 animate-in fade-in slide-in-from-bottom-3 duration-500"
            >
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-5">
                  <div className="flex items-end gap-4">
                    <span className="text-6xl font-semibold leading-none tracking-[-0.08em] text-foreground/12 sm:text-7xl">
                      {String(activeIndex + 1).padStart(2, "0")}
                    </span>
                    <div className="pb-1">
                      <p className="text-[0.68rem] uppercase tracking-[0.34em] text-muted-foreground">Selected project</p>
                      <h3 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.06em] text-foreground sm:text-4xl">
                        {activeProject.title}
                      </h3>
                    </div>
                  </div>

                  <p className="max-w-2xl text-base leading-8 text-muted-foreground">{activeProject.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {activeProject.stack.map((tech) => (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="rounded-full border-border/70 bg-background/65 px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em]"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.8rem] border border-border/70 bg-background/60 p-5">
                    <p className="text-[0.68rem] uppercase tracking-[0.3em] text-muted-foreground">Project summary</p>
                    <div className="mt-4 grid gap-3">
                      <div className="rounded-[1.3rem] border border-border/70 bg-card/70 p-4">
                        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">Category</p>
                        <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-foreground">{activeProject.category}</p>
                      </div>
                      <div className="rounded-[1.3rem] border border-border/70 bg-card/70 p-4">
                        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">Outcome</p>
                        <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-foreground">{activeProject.result}</p>
                      </div>
                      <div className="rounded-[1.3rem] border border-border/70 bg-card/70 p-4 text-sm leading-7 text-foreground/85">
                        {activeProject.description}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="relative min-h-[16rem] overflow-hidden rounded-[2rem] border border-border/70 bg-background/55">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_55%)]" />
                  <div className="relative flex h-full flex-col justify-between p-6">
                    <div className="flex items-center justify-between">
                      <div className="rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
                        Project frame
                      </div>
                      <div className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em] text-primary">
                        Live concept
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="w-[82%] rounded-[1.4rem] border border-border/70 bg-card/75 p-4 shadow-[0_20px_50px_-40px_rgba(0,0,0,0.55)]">
                        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">Category</p>
                        <p className="mt-2 text-sm text-foreground/85">{activeProject.category}</p>
                      </div>
                      <div className="ml-auto w-[72%] rounded-[1.4rem] border border-border/70 bg-card/70 p-4 shadow-[0_20px_50px_-40px_rgba(0,0,0,0.45)]">
                        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">Focus</p>
                        <p className="mt-2 text-sm text-foreground/85">{activeProject.description}</p>
                      </div>
                      <div className="w-[64%] rounded-[1.4rem] border border-border/70 bg-card/65 p-4 shadow-[0_20px_50px_-40px_rgba(0,0,0,0.4)]">
                        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">Outcome</p>
                        <p className="mt-2 text-sm text-foreground/85">{activeProject.result}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[2rem] border border-border/70 bg-background/60 p-5">
                    <p className="text-[0.68rem] uppercase tracking-[0.3em] text-muted-foreground">Project stack</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {activeProject.stack.map((item) => (
                        <Badge
                          key={item}
                          variant="outline"
                          className="rounded-full border-border/70 bg-card/70 px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em]"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-background/55">
                    <div className="flex min-w-max animate-[projectMarquee_16s_linear_infinite] gap-3 px-4 py-4">
                      {[...activeProject.stack, activeProject.category, activeProject.result, ...activeProject.stack].map((item, index) => (
                        <div
                          key={`${item}-${index}`}
                          className="rounded-full border border-border/70 bg-card/70 px-4 py-2 text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
