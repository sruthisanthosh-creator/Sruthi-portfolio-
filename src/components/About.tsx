import { profile } from '../content/profile'
import { Rise, SplitText } from './Reveal'
import { Zone } from './Zone'

/**
 * The twilight zone: enough light to read by, not enough to work by.
 * Structurally this is the only section on the page that is just prose, so it
 * gets the widest measure and the most air.
 */
export function About() {
  return (
    <Zone id="about" index={1} title="Where the light stops being useful">
      <div className="about">
        <Rise className="about__lede" delay={0.05}>
          <SplitText
            as="p"
            text={profile.about.lede}
            className="about__ledeText"
            stagger={0.035}
          />
        </Rise>

        <div className="about__body measure">
          {profile.about.body.map((para, i) => (
            <Rise key={i} delay={0.08 + i * 0.07} as="p">
              <span className="about__para">{para}</span>
            </Rise>
          ))}
        </div>

        <Rise className="about__status" delay={0.2}>
          <span className="about__beacon" aria-hidden="true" />
          <p className="mono">{profile.available}</p>
        </Rise>
      </div>
    </Zone>
  )
}
