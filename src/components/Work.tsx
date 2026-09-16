import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { profile, type Project } from '../content/profile'
import { LuminousPlate } from '../three/LuminousPlate'
import { Rise } from './Reveal'
import { Zone } from './Zone'

/**
 * The midnight zone, and the reason the whole site is dark: below 1000 m the
 * only light is made by the things living there. Each project is a plate that
 * generates its own.
 *
 * Cards alternate sides. The plate and the text scroll at different rates, so
 * the pairing separates and re-forms as you pass it.
 */
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // The plate drifts further than the text it belongs to.
  const plateY = useTransform(scrollYProgress, [0, 1], ['9%', '-9%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['3%', '-3%'])

  const flipped = index % 2 === 1

  return (
    <article ref={ref} className={`project ${flipped ? 'project--flipped' : ''}`}>
      <motion.div className="project__plate" style={reduced ? undefined : { y: plateY }}>
        <LuminousPlate art={project.art} />
        <span className="project__index mono" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
      </motion.div>

      <motion.div className="project__text" style={reduced ? undefined : { y: textY }}>
        <Rise>
          <p className="mono project__meta">
            <span>{project.role}</span>
            <span className="project__metaDot" aria-hidden="true" />
            <span>{project.year}</span>
          </p>

          <h3 className="project__name">{project.name}</h3>
          <p className="project__blurb">{project.blurb}</p>

          <hr className="rule project__rule" />

          <p className="project__body">{project.body}</p>

          <dl className="project__metrics">
            {project.metrics.map((m) => (
              <div className="metric" key={m.label}>
                <dt className="metric__value">{m.value}</dt>
                <dd className="metric__label mono">{m.label}</dd>
              </div>
            ))}
          </dl>
        </Rise>
      </motion.div>
    </article>
  )
}

export function Work() {
  return (
    <Zone id="work" index={2} title="Five things that make their own light">
      <div className="work">
        {profile.projects.map((p, i) => (
          <ProjectCard key={p.name} project={p} index={i} />
        ))}
      </div>
    </Zone>
  )
}
