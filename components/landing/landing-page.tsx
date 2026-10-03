"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Archive,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  CloudOff,
  Keyboard,
  Lightbulb,
  Pin,
  Sparkles,
} from "lucide-react"
import { AppLogo } from "@/components/branding/app-logo"
import { saveSiteLocale, type SiteLocale } from "@/lib/site-locale"
import { HeroScene } from "./hero-scene"
import { landingCopy } from "./landing-copy"
import styles from "./landing-page.module.css"

const stepIcons = [Lightbulb, Archive, Sparkles]
const featureIcons = [Keyboard, Pin, CloudOff]

export function LandingPage({ initialLocale }: { initialLocale: SiteLocale }) {
  const [locale, setLocale] = useState(initialLocale)
  const copy = landingCopy[locale]

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    const page = document.querySelector<HTMLElement>("[data-landing-page]")
    if (!page || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const elements = page.querySelectorAll<HTMLElement>("[data-reveal]")
    const observer = new IntersectionObserver((entries, currentObserver) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.setAttribute("data-visible", "true")
        currentObserver.unobserve(entry.target)
      }
    }, { threshold: 0.14, rootMargin: "0px 0px -48px 0px" })

    for (const element of elements) {
      element.setAttribute("data-reveal-ready", "true")
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  const changeLocale = (nextLocale: SiteLocale) => {
    setLocale(nextLocale)
    saveSiteLocale(nextLocale)
  }

  return (
    <div className="min-h-screen overflow-clip bg-background text-foreground" data-landing-page>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link aria-label="Trojes" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="/">
            <AppLogo iconClassName="size-9" />
          </Link>

          <nav aria-label={copy.nav.main} className="hidden items-center gap-8 text-sm text-muted-foreground lg:flex">
            <a className="transition-colors hover:text-foreground" href="#como-funciona">{copy.nav.how}</a>
            <a className="transition-colors hover:text-foreground" href="#lo-esencial">{copy.nav.features}</a>
            <a className="transition-colors hover:text-foreground" href="#proximamente">{copy.nav.next}</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <fieldset className="flex items-center rounded-full border border-border bg-card/80 p-1 text-xs font-semibold">
              <legend className="sr-only">{copy.nav.language}</legend>
              <button
                aria-pressed={locale === "es"}
                className={`rounded-full px-2.5 py-1.5 transition-colors ${locale === "es" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => changeLocale("es")}
                aria-label="Español"
                type="button"
              >
                ES
              </button>
              <button
                aria-pressed={locale === "en"}
                className={`rounded-full px-2.5 py-1.5 transition-colors ${locale === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => changeLocale("en")}
                aria-label="English"
                type="button"
              >
                EN
              </button>
            </fieldset>
            <Link className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" href="/login">
              <span>{copy.nav.enter}</span>
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className={`relative isolate mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-7xl items-center gap-6 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-0 lg:px-12 lg:py-10 ${styles.hero}`}>
          <div className="relative z-10 max-w-2xl pb-4 lg:pb-12">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground shadow-sm sm:text-xs">
              <span className="size-1.5 rounded-full bg-primary" />
              {copy.hero.eyebrow}
            </p>
            <h1 className="max-w-3xl text-[clamp(3.25rem,6vw,5.7rem)] font-semibold leading-[0.94] tracking-[-0.075em] text-foreground">
              {copy.hero.title}<br />
              <span className="text-primary">{copy.hero.titleAccent}</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {copy.hero.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" href="/login">
                {copy.hero.primary}
                <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold transition-colors hover:border-primary/50 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="#como-funciona">
                {copy.hero.secondary}
                <ArrowDown aria-hidden="true" className="size-4" />
              </a>
            </div>
            <p className="mt-4 pl-1 text-xs text-muted-foreground">{copy.hero.note}</p>
          </div>

          <div className="relative -mx-2 sm:mx-0 lg:-mr-12">
            <HeroScene copy={copy.hero} />
          </div>
          <a aria-label={copy.hero.secondary} className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs text-muted-foreground/80 lg:flex" href="#como-funciona">
            <span className="grid size-7 place-items-center rounded-full border border-border"><ArrowDown aria-hidden="true" className="size-3.5" /></span>
            {copy.nav.how}
          </a>
        </section>

        <section className="relative border-y border-border/60 bg-muted/35" id="como-funciona">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
            <div className={`mx-auto max-w-3xl text-center ${styles.reveal}`} data-reveal>
              <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-primary sm:text-xs">{copy.how.eyebrow}</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl">{copy.how.title}</h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{copy.how.description}</p>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-3 lg:mt-20">
              {copy.how.steps.map((step, index) => {
                const Icon = stepIcons[index]
                const isUpcoming = index === 2
                return (
                  <article className={`${styles.reveal} rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 sm:p-8 ${isUpcoming ? "relative overflow-hidden" : ""}`} data-reveal key={step.number}>
                    {isUpcoming && <div aria-hidden="true" className="absolute -right-10 -top-12 size-36 rounded-full bg-primary/10 blur-2xl" />}
                    <div className="relative flex items-center justify-between">
                      <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon aria-hidden="true" className="size-5" /></span>
                      <span className="font-mono text-xs tracking-[0.12em] text-muted-foreground">{step.number}</span>
                    </div>
                    <h3 className="relative mt-8 text-xl font-semibold tracking-tight">{step.title}</h3>
                    <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{step.description}</p>
                    {isUpcoming && <span className="relative mt-5 inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 font-mono text-[10px] font-bold tracking-[0.12em] text-primary">{copy.next.badge}</span>}
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28 lg:px-12 lg:py-32" id="lo-esencial">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className={`lg:sticky lg:top-32 lg:h-fit ${styles.reveal}`} data-reveal>
              <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-primary sm:text-xs">{copy.features.eyebrow}</p>
              <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.055em] sm:text-5xl">{copy.features.title}</h2>
              <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground sm:text-lg">{copy.features.description}</p>
              <div className="mt-9 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 font-mono text-[10px] font-semibold tracking-[0.13em] text-muted-foreground shadow-sm">
                <Keyboard aria-hidden="true" className="size-4 text-primary" />
                {copy.features.shortcut}
              </div>
            </div>

            <div className={`divide-y divide-border/80 ${styles.reveal}`} data-reveal>
              {copy.features.items.map((item, index) => {
                const Icon = featureIcons[index]
                return (
                  <article className="group flex gap-5 py-6 first:pt-0 last:pb-0 sm:gap-7 sm:py-8" key={item.title}>
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-border bg-card text-primary shadow-sm transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:size-14">
                      <Icon aria-hidden="true" className="size-5 sm:size-6" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight sm:text-xl">{item.title}</h3>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">{item.description}</p>
                    </div>
                    <Check aria-hidden="true" className="ml-auto mt-2 hidden size-4 shrink-0 text-primary/70 sm:block" />
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="px-5 pb-24 sm:px-8 sm:pb-28 lg:px-12 lg:pb-32" id="proximamente">
          <div className={`relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-border/70 bg-foreground text-background ${styles.nextPanel} ${styles.reveal}`} data-reveal>
            <div aria-hidden="true" className={styles.nextGlow} />
            <div className="relative grid gap-10 px-7 py-10 sm:px-12 sm:py-14 lg:grid-cols-[1fr_auto] lg:items-end lg:px-16 lg:py-16">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-background/60 sm:text-xs">{copy.next.eyebrow}</p>
                  <span className="rounded-full bg-primary px-3 py-1 font-mono text-[10px] font-bold tracking-[0.12em] text-primary-foreground">{copy.next.badge}</span>
                </div>
                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl">{copy.next.title}</h2>
                <p className="mt-5 max-w-2xl leading-relaxed text-background/70 sm:text-lg">{copy.next.description}</p>
                <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                  {copy.next.details.map((detail) => <li className="inline-flex items-center gap-2 text-sm text-background/80" key={detail}><span className="size-1.5 rounded-full bg-secondary" />{detail}</li>)}
                </ul>
              </div>
              <div aria-hidden="true" className="hidden size-40 items-center justify-center rounded-full border border-background/15 bg-background/5 lg:flex">
                <div className="grid size-28 place-items-center rounded-full border border-primary/60 bg-primary/15 text-primary"><Sparkles className="size-10" /></div>
              </div>
              <p className="font-mono text-[10px] tracking-[0.12em] text-background/45 lg:col-span-2">{copy.next.mark}</p>
            </div>
          </div>
        </section>

        <section className={`mx-auto max-w-7xl px-5 pb-24 sm:px-8 sm:pb-28 lg:px-12 lg:pb-32 ${styles.reveal}`} data-reveal>
          <div className={`relative overflow-hidden rounded-[2rem] border border-primary/20 bg-primary/10 px-7 py-12 text-center sm:px-12 sm:py-16 ${styles.finalPanel}`}>
            <div aria-hidden="true" className={styles.finalOrb} />
            <p className="relative font-mono text-[10px] font-semibold tracking-[0.18em] text-primary sm:text-xs">{copy.final.eyebrow}</p>
            <h2 className="relative mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl">{copy.final.title}</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground sm:text-lg">{copy.final.description}</p>
            <Link className="group relative mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" href="/login">
              {copy.final.cta}<ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <AppLogo iconClassName="size-8" />
            <p className="text-sm text-muted-foreground">{copy.footer.line}</p>
          </div>
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href="/login">
            {copy.footer.signIn}<ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </footer>
    </div>
  )
}
