/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE ONLY FILE YOU NEED TO EDIT.
 *
 *  Every word, link and project on the site is read from here. Change a string,
 *  save, and the page updates — no component touching required.
 *
 *  ⚠️  The five projects below are PLACEHOLDERS written to the right shape and
 *      length so the layout reads as finished. Replace them with real work
 *      before sharing this publicly.
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
      name: 'Tidepool',
      blurb: 'A savings account that behaves like water, not a spreadsheet',
      role: 'Product design · Design system',
      year: '2025',
      body: 'People under-save because a balance is an abstraction. Tidepool renders money as a volume with a tide line — you can see what is committed, what is free, and what is draining before the number changes. The hardest part was making a playful metaphor survive a bank audit.',
      metrics: [
        { value: '+34%', label: 'deposit rate' },
        { value: '11', label: 'screens, total' },
      ],
      art: { hue: 0.05, seed: 11.3, churn: 0.45 },
    },
    {
      name: 'Meridian',
      blurb: 'Radiology triage for a ward that is always one radiologist short',
      role: 'Lead design · Research',
      year: '2025',
      body: 'A worklist tool where the ranking is the product. I shadowed three reading rooms to learn what clinicians actually re-sort by, then built a queue that explains its own ordering — every card states why it is where it is, and a wrong order can be corrected in one gesture.',
      metrics: [
        { value: '−41%', label: 'time to first read' },
        { value: '3', label: 'reading rooms studied' },
      ],
      art: { hue: 0.30, seed: 47.9, churn: 0.8 },
    },
    {
      name: 'Sonder',
      blurb: 'Long-form reading that adapts its typography to how tired you are',
      role: 'Concept · Interaction · Build',
      year: '2024',
      body: 'Measure, leading and contrast shift across a reading session, driven by scroll cadence rather than a settings panel. Nobody wants to tune a typeface at midnight. The typographic ramp is a hand-tuned curve, not a linear interpolation — linear felt like the page was breathing at you.',
      metrics: [
        { value: '26 min', label: 'median session' },
        { value: '0', label: 'settings screens' },
      ],
      art: { hue: 0.82, seed: 88.1, churn: 0.35 },
    },
    {
      name: 'Kiln',
      blurb: 'Scheduling for a ceramics studio where the oven takes 14 hours',
      role: 'End-to-end design',
      year: '2024',
      body: 'Booking software assumes slots are interchangeable. A kiln firing is not — it is a shared, unforgiving, thermally-coupled resource, and one person loading wrong costs everyone a week. The calendar had to show the firing curve, not the hour.',
      metrics: [
        { value: '−90%', label: 'mis-loads' },
        { value: '14h', label: 'the constraint' },
      ],
      art: { hue: 1.0, seed: 23.7, churn: 0.95 },
    },
    {
      name: 'Halcyon',
      blurb: 'A circadian companion that refuses to show you a score',
      role: 'Product design · Motion',
      year: '2023',
      body: 'Sleep apps make anxious people more anxious by grading their night. Halcyon reports nothing numeric before noon — the morning screen is a single ambient field you read at a glance. The entire interface has one chart, and it is deliberately hard to find.',
      metrics: [
        { value: '0', label: 'scores shown' },
        { value: '+19%', label: 'week-4 retention' },
      ],
      art: { hue: 0.58, seed: 64.2, churn: 0.28 },
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
