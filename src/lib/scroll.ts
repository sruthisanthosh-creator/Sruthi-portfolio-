import { useEffect, useRef, useSyncExternalStore } from 'react'
import Lenis from 'lenis'
import { MAX_DEPTH, ZONES } from '../content/profile'

/**
 * A single source of scroll truth.
 *
 * Two consumers with very different appetites read from here: React components
 * that need to re-render at zone boundaries, and the WebGL frame loop that wants
 * a fresh number 60 times a second without ever touching React. So the value is
 * published twice — as a mutable object the render loop samples directly, and as
 * a coarse snapshot that only changes when something a component cares about does.
 */

export type ScrollState = {
  /** Linear progress through the document, 0–1. What the shaders read. */
  scroll: number
  /** True metres below sea level. See `measure` for why this is not `scroll`. */
  depth: number
  /** depth / MAX_DEPTH — the gauge's fill. */
  progress: number
  /** Pixels per frame, signed. Drives the liquid-warp shaders. */
  velocity: number
  /** Index into ZONES. */
  zone: number
}

/** Sampled by useFrame. Never triggers a render — mutated in place on purpose. */
export const live: ScrollState = { scroll: 0, depth: 0, progress: 0, velocity: 0, zone: 0 }

let snapshot: { zone: number; progress: number } = { zone: 0, progress: 0 }
const listeners = new Set<() => void>()

function publish(zone: number, progress: number) {
  // Quantise progress so the store only wakes React on a visible change,
  // not on every pixel of a smooth-scrolled frame.
  const coarse = Math.round(progress * 200) / 200
  if (zone === snapshot.zone && coarse === snapshot.progress) return
  snapshot = { zone, progress: coarse }
  for (const l of listeners) l()
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/**
 * Where each zone's section actually sits in the document.
 *
 * Depth cannot simply be `scrollProgress * MAX_DEPTH`. The sections are not the
 * same length as their depth ranges — Work is the longest section on the page
 * but spans 1,000–4,000 m, while Hadal is the shortest and covers 6,000–11,034.
 * Interpolating globally puts the gauge at 5,800 m while the reader is still
 * looking at a heading that says Bathypelagic, which breaks the one idea the
 * whole page rests on. So each section is measured and the depth is interpolated
 * *within* it: the number on the gauge always agrees with the section you are in.
 */
type Band = { top: number; height: number; from: number; to: number }
let bands: Band[] = []

function measure() {
  const y = window.scrollY
  bands = ZONES.map((z) => {
    const el = document.getElementById(z.id)
    if (!el) return { top: 0, height: 1, from: z.from, to: z.to }
    const r = el.getBoundingClientRect()
    return { top: r.top + y, height: Math.max(1, r.height), from: z.from, to: z.to }
  })
}

function depthAt(scroll: number) {
  if (!bands.length) return { depth: 0, zone: 0 }

  // Probe from the middle of the viewport: that is the part of the page the
  // reader is actually looking at, not the top edge.
  const probe = scroll + window.innerHeight * 0.5

  for (let i = bands.length - 1; i >= 0; i--) {
    const b = bands[i]
    if (probe >= b.top || i === 0) {
      const local = Math.min(1, Math.max(0, (probe - b.top) / b.height))
      return { depth: b.from + (b.to - b.from) * local, zone: i }
    }
  }
  return { depth: 0, zone: 0 }
}

/** Coarse scroll state for components. Re-renders only on meaningful change. */
export function useScrollSnapshot() {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  )
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Installs Lenis and keeps `live` fed. Mounted once, at the app root.
 * Under reduced-motion we skip Lenis entirely and listen to native scroll —
 * smoothing a scroll someone has asked not to have is the whole thing they
 * turned off.
 */
export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const reduced = prefersReducedMotion()

    const update = (scroll: number, velocity: number) => {
      const limit = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const s = Math.min(1, Math.max(0, scroll / limit))
      const { depth, zone } = depthAt(scroll)

      live.scroll = s
      live.depth = depth
      live.progress = depth / MAX_DEPTH
      live.velocity = velocity
      live.zone = zone
      publish(zone, s)
    }

    measure()
    // Webfonts reflow the document, which moves every section boundary.
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    fonts?.ready?.then(() => measure())
    const remeasure = () => {
      measure()
      update(window.scrollY, 0)
    }
    window.addEventListener('resize', remeasure)

    if (reduced) {
      const onScroll = () => update(window.scrollY, 0)
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', remeasure)
      }
    }

    const lenis = new Lenis({
      duration: 1.15,
      // A long, heavy tail — the page should feel like it has mass and water
      // resistance rather than snapping to a stop.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ({ scroll, velocity }: { scroll: number; velocity: number }) => {
      update(scroll, velocity)
    })

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', remeasure)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return lenisRef
}

/** Anchor navigation that goes through Lenis instead of jumping. */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  })
}
