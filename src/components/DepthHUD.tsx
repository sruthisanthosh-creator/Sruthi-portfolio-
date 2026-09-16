import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { MAX_DEPTH, ZONES } from '../content/profile'
import { live, scrollToId, useScrollSnapshot } from '../lib/scroll'

/**
 * The depth gauge.
 *
 * This is the page's navigation, its scroll progress indicator and its
 * conceptual spine in one element. It reads out real metres against the real
 * pelagic zones, so "where am I in this document" and "how deep am I" are the
 * same question.
 *
 * The readout is written straight to the DOM from a rAF loop rather than held
 * in React state — a four-digit number changing sixty times a second would
 * otherwise re-render the tree for every frame of every scroll.
 */
export function DepthHUD() {
  const { zone } = useScrollSnapshot()
  const readout = useRef<HTMLSpanElement>(null)
  const fill = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    let frame = 0
    const tick = () => {
      if (readout.current) {
        readout.current.textContent = Math.round(live.depth).toLocaleString('en-US')
      }
      if (fill.current) {
        fill.current.style.transform = `scaleY(${live.progress})`
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <motion.aside
      className="hud"
      initial={reduced ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.2, delay: 1.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="hud__readout">
        <span className="hud__depth mono" ref={readout}>
          0
        </span>
        <span className="hud__unit mono">m</span>
      </div>

      <div className="hud__column">
        <div className="hud__track">
          <div className="hud__fill" ref={fill} />
        </div>

        <ol className="hud__zones">
          {ZONES.map((z, i) => (
            <li
              key={z.id}
              className={`hud__zone ${i === zone ? 'is-current' : ''}`}
              style={{
                // Ticks sit at their true depth on the scale, so the zones are
                // as unevenly spaced on the gauge as they are in the ocean.
                top: `${(z.from / MAX_DEPTH) * 100}%`,
              }}
            >
              <button type="button" onClick={() => scrollToId(z.id)}>
                <span className="hud__tick" aria-hidden="true" />
                <span className="hud__name mono">{z.zone}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <p className="hud__label mono">
        {ZONES[zone].label}
      </p>
    </motion.aside>
  )
}
