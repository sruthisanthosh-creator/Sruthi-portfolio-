import type { ReactNode } from 'react'
import { Rise } from './Reveal'
import { ZONES } from '../content/profile'

/**
 * Every section is a depth zone, and announces itself as one. The eyebrow is
 * not decoration — it carries the real depth range, which is the structure of
 * the whole page.
 */
export function Zone({
  id,
  index,
  title,
  children,
}: {
  id: string
  index: number
  title: string
  children: ReactNode
}) {
  const zone = ZONES[index]

  return (
    <section className="zone" id={id} aria-labelledby={`${id}-title`}>
      <div className="shell">
        <Rise className="zone__head">
          <p className="mono zone__eyebrow">
            <span className="lumen">{zone.zone}</span>
            <span className="zone__rule" aria-hidden="true" />
            <span>
              {zone.from.toLocaleString('en-US')}–{zone.to.toLocaleString('en-US')} m
            </span>
          </p>
          <h2 className="zone__title" id={`${id}-title`}>
            {title}
          </h2>
        </Rise>

        {children}
      </div>
    </section>
  )
}
