import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AbyssCanvas } from './three/AbyssCanvas'
import { DepthHUD } from './components/DepthHUD'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Work } from './components/Work'
import { Craft } from './components/Craft'
import { Contact } from './components/Contact'
import { useSmoothScroll } from './lib/scroll'

/**
 * A short surface hold before the descent. It exists to cover the font swap and
 * the first shader compile — both of which are visible on a cold load and both
 * of which look like a bug rather than a design if you watch them happen.
 */
function Airlock({ done }: { done: boolean }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="airlock"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0.35] }}
            transition={{ duration: 1.6, times: [0, 0.3, 0.7, 1] }}
          >
            Equalising pressure
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  useSmoothScroll()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const settle = () => {
      if (!cancelled) setReady(true)
    }

    // Wait for the display face specifically — the hero is 11rem of Fraunces,
    // and a fallback-serif flash at that size reframes the entire composition.
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    const waitFor = fonts?.ready ?? Promise.resolve()

    Promise.race([waitFor, new Promise((r) => setTimeout(r, 2200))]).then(() =>
      setTimeout(settle, 350),
    )

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <a className="skip-link" href="#about">
        Skip to content
      </a>

      <Airlock done={ready} />
      <AbyssCanvas />
      <DepthHUD />

      <main className="column">
        <Hero />
        <About />
        <Work />
        <Craft />
        <Contact />
      </main>
    </>
  )
}
