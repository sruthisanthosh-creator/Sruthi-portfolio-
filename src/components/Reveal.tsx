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
    const Tag = as
    return <Tag className={className}>{children}</Tag>
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
 */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.055,
  immediate = false,
  as: Tag = 'span',
}: {
  text: string
  className?: string
  delay?: number
  stagger?: number
  /** Hero copy animates on mount; everything below waits for the scroll. */
  immediate?: boolean
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p'
}) {
  const reduced = useReducedMotion()
  const words = text.split(' ')

  if (reduced) {
    return <Tag className={className}>{text}</Tag>
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  }

  const word: Variants = {
    hidden: { y: '110%' },
    show: { y: '0%', transition: { duration: 1.15, ease: EASE } },
  }

  return (
    <motion.span
      className={`split ${className ?? ''}`}
      variants={container}
      initial="hidden"
      {...(immediate
        ? { animate: 'show' }
        : { whileInView: 'show', viewport: { once: true, amount: 0.4 } })}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span className="split__mask" key={`${w}-${i}`} aria-hidden="true">
          <motion.span className="split__word" variants={word}>
            {w}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}
