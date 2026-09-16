import { motion, useReducedMotion } from 'motion/react'
import { profile } from '../content/profile'
import { Rise } from './Reveal'
import { Zone } from './Zone'

/**
 * The abyssal plain: flat, cold, and the largest habitat on the planet.
 * So this section is a list — the plainest thing on the page, deliberately,
 * after five sections of motion.
 *
 * The weight bars are a real measurement (share of the working week), which is
 * the only reason they earn a bar at all. A skill list with decorative
 * percentages attached is the oldest lie in portfolio design.
 */
export function Craft() {
  const reduced = useReducedMotion()

  return (
    <Zone id="craft" index={3} title="What the week actually goes on">
      <div className="craft">
        <ol className="craft__list">
          {profile.craft.map((c, i) => (
            <Rise as="li" key={c.skill} delay={i * 0.05}>
              <div className="craft__row">
                <div className="craft__head">
                  <h3 className="craft__skill">{c.skill}</h3>
                  <p className="craft__detail">{c.detail}</p>
                </div>

                <div className="craft__gauge" aria-hidden="true">
                  <motion.span
                    className="craft__bar"
                    initial={reduced ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: c.weight }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 1.3, delay: 0.12 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            </Rise>
          ))}
        </ol>

        <Rise className="craft__tools" delay={0.2}>
          <p className="mono craft__toolsLabel">Instruments</p>
          <ul className="craft__toolList">
            {profile.tools.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Rise>
      </div>
    </Zone>
  )
}
