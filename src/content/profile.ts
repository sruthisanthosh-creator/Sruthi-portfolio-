/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE ONLY FILE YOU NEED TO EDIT.
 *
 *  Every word, link and project on the site is read from here. Change a string,
 *  save, and the page updates — no component touching required.
 *
 *  The projects below are real. The bio, craft weights and tool list are still
 *  first-draft guesses — rewrite them in your own words before sharing this.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type Project = {
  /** Short codename shown large. Keep under ~10 characters so it holds at display size. */
  name: string
  /** One line under the name. What it is, in the user's language. */
  blurb: string
  /** What you actually did. Shown as small caps metadata. */
  role: string
  year: string
  /** 2–3 sentences. This is the case study in miniature. */
  body: string
  /** Numbers that mattered. Keep to 2 — three starts to look like a pitch deck. */
  metrics: { value: string; label: string }[]
  /**
   * Drives the generative artwork for this project's masked plate.
   * hue:   0 = lumen green · 1 = bloom violet. The only colour freedom a
   *        project gets — the rest of the ramp is the site's palette, so no
   *        value here can take a plate outside the deep-sea family.
   * seed:  any number — changes the noise field entirely
   * churn: 0.3 calm and glassy · 1.0 turbulent and tendrilled
   */
  art: { hue: number; seed: number; churn: number }
  href?: string
}

export const profile = {
  name: 'Sruthi Santhosh',
  /** Shown character-by-character in the hero. Two words reads best. */
  role: 'Interface Designer',
  location: 'Kerala, India',
  available: 'Open to product design roles — 2026',

  /** The hero's one-sentence thesis. Aim for 12–20 words. */
  thesis:
    'I design interfaces for the parts of a product people are afraid of — the settings, the errors, the moment the money moves.',

  about: {
    lede: 'Most interfaces are designed for the happy path. I spend my time in the other one.',
    body: [
      'I am a product designer working across research, interaction and the front-end that ships it. My background is in the messy middle of a product: permissions, empty states, the third error in a row, the screen someone opens at 2am because something went wrong.',
      'That work does not photograph well, so I learned to make the invisible legible — flows that hold up under load, design systems with opinions, prototypes that behave like the real thing before a single engineer is booked.',
      'I build what I design. Every prototype here runs on the same primitives I hand to engineering, which means the handoff is a conversation rather than a translation.',
    ],
  },

  /** Ordered by how much of your week they actually take. Be honest — it reads. */
  craft: [
    { skill: 'Interaction design', detail: 'State machines, motion specs, the behaviour between the frames', weight: 0.95 },
    { skill: 'Design systems', detail: 'Tokens, primitives, and the documentation that stops drift', weight: 0.9 },
    { skill: 'Prototyping', detail: 'React and Framer builds that survive real data', weight: 0.85 },
    { skill: 'User research', detail: 'Moderated sessions, diary studies, synthesis that names things', weight: 0.7 },
    { skill: 'Motion design', detail: 'Easing, choreography, and knowing when to hold still', weight: 0.65 },
    { skill: 'Front-end', detail: 'TypeScript, React, CSS architecture, WebGL when it earns it', weight: 0.6 },
  ],

  tools: ['Figma', 'Framer', 'React', 'TypeScript', 'Blender', 'After Effects', 'Rive', 'Notion'],

  projects: [
    {
      name: 'Padmasaliya',
      blurb: 'Matrimony for a community small enough that everyone is someone\u2019s cousin',
      role: 'End-to-end design \u00b7 Build',
      year: '2026',
      body: 'The people using it are parents, not the people being matched, so it is built for someone doing this exactly once \u2014 sign-in by emailed link rather than a password to remember, and gotram, rasi and nakshatra as structured fields instead of free text someone has to interpret. The subscription became credits: one credit unlocks one family permanently, because charging twice for the same family is how you lose a community\u2019s trust. Packs are only offered when there are genuinely that many profiles left to spend them on.',
      metrics: [
        { value: '1', label: 'credit per family, forever' },
        { value: '28', label: 'gotrams, structured' },
      ],
      art: { hue: 0.88, seed: 31.4, churn: 0.55 },
      href: 'https://github.com/sruthisanthosh-creator/Padmasaliya-matrimonial',
    },
    {
      name: 'Descent',
      blurb: 'The portfolio you are reading, built as a dive to the sea floor',
      role: 'Design \u00b7 WebGL \u00b7 Build',
      year: '2026',
      body: 'Scrolling descends through the real pelagic zones and the design follows the physics: light fails on the way down, so by this section bioluminescence is the only light left. Nothing here is an image \u2014 this plate is a fragment shader evaluated every frame, and its entire identity is three numbers. The depth gauge interpolates within each section rather than across the document, so the reading always agrees with the heading beside it.',
      metrics: [
        { value: '0', label: 'image files' },
        { value: '11,034', label: 'metres, surface to floor' },
      ],
      art: { hue: 0.08, seed: 11.3, churn: 0.42 },
      href: 'https://github.com/sruthisanthosh-creator/Sruthi-portfolio-',
    },
  ] satisfies Project[] as Project[],

  contact: {
    lede: 'The trench floor. Nothing below this.',
    email: 'sruthisanthoshsrt@gmail.com',
    links: [
      { label: 'Email', href: 'mailto:sruthisanthoshsrt@gmail.com' },
      { label: 'GitHub', href: 'https://github.com/sruthisanthosh-creator' },
      // Replace these two with your real profiles, or delete them.
      { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
      { label: 'Read.cv', href: 'https://read.cv/' },
    ],
  },
}

/**
 * The real pelagic zones, used as the site's section structure and depth gauge.
 * Depths are in metres below sea level; 11,034 m is Challenger Deep.
 */
export const ZONES = [
  { id: 'surface', zone: 'Epipelagic', label: 'Sunlight Zone', from: 0, to: 200 },
  { id: 'about', zone: 'Mesopelagic', label: 'Twilight Zone', from: 200, to: 1000 },
  { id: 'work', zone: 'Bathypelagic', label: 'Midnight Zone', from: 1000, to: 4000 },
  { id: 'craft', zone: 'Abyssopelagic', label: 'Abyssal Zone', from: 4000, to: 6000 },
  { id: 'contact', zone: 'Hadalpelagic', label: 'Hadal Zone', from: 6000, to: 11034 },
] as const

export const MAX_DEPTH = 11034
