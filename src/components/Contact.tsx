import { profile, MAX_DEPTH } from '../content/profile'
import { Rise, SplitText } from './Reveal'
import { Zone } from './Zone'

/**
 * Challenger Deep. 10,935–11,034 m depending on whose sonar you trust.
 * Nothing below this, which makes it the right place to put the ask.
 */
export function Contact() {
  return (
    <Zone id="contact" index={4} title="Say something into the dark">
      <div className="contact">
        <Rise className="contact__lede">
          <p className="mono">{profile.contact.lede}</p>
        </Rise>

        <a className="contact__email" href={`mailto:${profile.contact.email}`}>
          <SplitText text={profile.contact.email} stagger={0.02} />
          <span className="contact__emailRule" aria-hidden="true" />
        </a>

        <Rise className="contact__links" delay={0.1}>
          <ul>
            {profile.contact.links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target={l.href.startsWith('http') ? '_blank' : undefined}
                  rel={l.href.startsWith('http') ? 'noreferrer noopener' : undefined}
                >
                  <span>{l.label}</span>
                  <span className="contact__arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Rise>

        <footer className="contact__foot">
          <p className="mono">
            {MAX_DEPTH.toLocaleString('en-US')} m · Challenger Deep · seafloor
          </p>
          <p className="mono">
            © {new Date().getFullYear()} {profile.name}
          </p>
        </footer>
      </div>
    </Zone>
  )
}
