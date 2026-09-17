import { Fragment } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * The page's two motion primitives. Everything that animates in uses one of
 * these, so the whole document moves on one curve and one delay rhythm rather
 * than each section inventing its own.
 *
 * Both collapse to a plain visible element under `prefers-reduced-motion` —
 * not a faster animation, no animation.
 */

const EASE = [0.22, 1, 0.36, 1] as const

type Tag = 'div' | 'section' | 'li' | 'p' | 'span' | 'h1' | 'h2' | 'h3'

export function Rise({
  children,
  delay = 0,
  y = 26,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'p' | 'span'
}) {
  const reduced = useReducedMotion()
  const MotionTag = motion[as] as typeof motion.div

  if (reduced) {
    const Plain = as
    return <Plain className={className}>{children}</Plain>
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1.05, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  )
}

/**
 * Word-by-word mask reveal. Each word rides up from behind a clipping edge
 * rather than fading — a fade reads as a page loading, a wipe reads as
 * something surfacing.
 *
 * Words, not characters: per-character staggering on a display serif breaks the
 * kerning pairs the face was drawn with, and at hero size that is visible.
 *
 * The spaces between words are real text nodes, not a `::after { content: ' ' }`
 * on the mask. Generated content is invisible to `textContent`, so the CSS
 * version left the page reading as one run-together word to a screen reader and
 * copying out of the page with every space missing.
 */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.055,
  immediate = false,
  as = 'span',
}: {
  text: string
  className?: string
  delay?: number
  stagger?: number
  /** Hero copy animates on mount; everything below waits for the scroll. */
  immediate?: boolean
  as?: Tag
}) {
  const reduced = useReducedMotion()
  const words = text.split(' ')

  if (reduced) {
    const Plain = as
    return <Plain className={className}>{text}</Plain>
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  }

  const word: Variants = {
    hidden: { y: '110%' },
    show: { y: '0%', transition: { duration: 1.15, ease: EASE } },
  }

  // `as` has to drive the animated element too, not only the reduced-motion
  // fallback — otherwise a caller asking for a paragraph silently gets a span.
  const MotionTag = motion[as] as typeof motion.span

  return (
    <MotionTag
      className={`split ${className ?? ''}`}
      variants={container}
      initial="hidden"
      {...(immediate
        ? { animate: 'show' }
        : { whileInView: 'show', viewport: { once: true, amount: 0.4 } })}
    >
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <span className="split__mask">
            <motion.span className="split__word" variants={word}>
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </MotionTag>
  )
}
