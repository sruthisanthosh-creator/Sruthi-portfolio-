import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { profile } from '../content/profile'
import { SplitText } from './Reveal'
import { scrollToId } from '../lib/scroll'

/**
 * Sea level.
 *
 * The one section that animates on mount rather than on scroll — there is no
 * scroll yet. The name arrives word by word from behind a mask while the water
 * is already moving behind it, so the first frame is the page at work.
 */
export function Hero() {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()

  // The hero sinks and dims as you leave it. Slower than the scroll itself,
  // so it lags behind like something you are swimming away from.
  const y = useTransform(scrollYProgress, [0, 0.16], ['0%', '22%'])
  const opacity = useTransform(scrollYProgress, [0, 0.11], [1, 0])

  const [first, ...rest] = profile.name.split(' ')

  return (
    <header className="hero" id="surface">
      <motion.div
        className="shell hero__inner"
        style={reduced ? undefined : { y, opacity }}
      >
        <motion.p
          className="mono hero__meta"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.2 }}
        >
          <span>{profile.location}</span>
          <span className="hero__dot" aria-hidden="true" />
          <span>Epipelagic · 0 m</span>
        </motion.p>

        <h1 className="hero__name">
          <span className="visually-hidden">
            {profile.name} — {profile.role}
          </span>
          <SplitText text={first} immediate delay={0.35} className="hero__line" />
          <SplitText
            text={rest.join(' ')}
            immediate
            delay={0.52}
            className="hero__line hero__line--indent"
          />
        </h1>

        <motion.div
          className="hero__role"
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="hero__rule" aria-hidden="true" />
          <p className="mono hero__roleText">{profile.role}</p>
        </motion.div>

        <motion.p
          className="hero__thesis measure"
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {profile.thesis}
        </motion.p>
      </motion.div>

      <motion.button
        type="button"
        className="hero__cue"
        onClick={() => scrollToId('about')}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.8 }}
      >
        <span className="mono">Begin descent</span>
        <span className="hero__cueLine" aria-hidden="true" />
      </motion.button>
    </header>
  )
}
