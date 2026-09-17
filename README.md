# Descent — Sruthi Santhosh

A portfolio built as a dive. Scrolling the page descends through the real
pelagic zones of the ocean, from the sunlit surface to Challenger Deep at
11,034 m, and the design follows the physics: light fails on the way down, so
by the work section the only illumination left is the kind the projects make
themselves.

Everything you see is rendered in real time. There is not a single image file
in this repository — the creature, the drifting marine snow, the surface
caustics and every project plate are fragment shaders evaluated every frame.

## Seeing it

**Live:** pushing to the default branch builds and publishes to GitHub Pages via
`.github/workflows/deploy.yml`. One manual step is needed before the first run —
**Settings → Pages → Build and deployment → Source → "GitHub Actions"** — after
which the URL appears at the top of that same Settings → Pages screen.

**Locally:**

```bash
npm install     # requires the bundled .npmrc (see Notes)
npm run dev     # http://localhost:5173
```

```bash
npm run build && npm run preview   # the production build, http://localhost:4173
```

A machine with a real GPU is worth using. The page is one full-screen fragment
shader plus one per visible project, and software rendering crawls.

## Changing the content

**`src/content/profile.ts` is the only file you need to edit.** Name, role,
bio, projects, skills, tools and links all live there. Change a string, save,
done.

Each project also carries three numbers that generate its artwork:

| field   | range | effect                                                      |
| ------- | ----- | ----------------------------------------------------------- |
| `hue`   | 0–1   | 0 is lumen green, 1 is bloom violet. The only colour freedom a project gets — nothing you put here can leave the deep-sea palette. |
| `seed`  | any   | Changes the noise field completely. Nudge it until you like the shape. |
| `churn` | 0.3–1 | 0.3 is calm and glassy, 1.0 is turbulent and tendrilled.     |

The Work section's heading counts itself, so adding or removing a project needs
no other edit.

> ⚠️ **The projects are real; the bio is not yet.** `thesis`, `about`, `craft`
> and `tools` are still first-draft guesses — rewrite them in your own words
> before sharing this.

## How it is put together

```
src/
  content/profile.ts   all copy and project data — the only file to edit
  lib/scroll.ts        Lenis smooth scroll, and the depth model
  three/
    glsl.ts            shared simplex/fbm/ridged noise + the palette
    Backdrop.tsx       the water column: gradient, caustics, light shafts
    MarineSnow.tsx     the debris field, stretched by scroll velocity
    Membrane.tsx       the creature that keeps you company at the surface
    LuminousPlate.tsx  a project's generative artwork, cut through a live mask
    AbyssCanvas.tsx    the persistent background scene + effect chain
  components/          the document: zones, reveals, the depth gauge
  styles/              tokens, then layout
```

### The depth gauge is not a progress bar

Depth is interpolated *within* each section, not across the whole document
(`depthAt` in `src/lib/scroll.ts`). The sections are not the same length as the
depth ranges they represent — Work is the longest section on the page but
covers 1,000–4,000 m, while Hadal is the shortest and covers 6,000–11,034 m.
Interpolating globally would put the gauge at 5,800 m while the reader is
looking at a heading that says Bathypelagic, which breaks the one idea the page
rests on.

### Two things that will bite you in the shaders

1. **Uniforms must be mutated through a material ref**, never through the object
   passed to `<shaderMaterial uniforms={...}>`. The material ends up owning its
   own copy of that object, so mutating the original silently updates nothing
   and the shader sits frozen at frame zero — with no error anywhere.
2. **The effect chain needs `frameBufferType={HalfFloatType}` and an explicit
   `<ToneMapping>` pass.** The scene is additive and deliberately pushes past
   1.0; in the default 8-bit buffer those values clip per channel and bright
   teal crests come out magenta. The composer also bypasses the renderer's own
   tone mapping, so without that pass there is none at all.

### Performance

One persistent background canvas, plus one canvas per project plate that is
mounted only while it is near the viewport (`IntersectionObserver`, 12% margin)
and torn down when it leaves. Device pixel ratio is capped — a full-screen
fragment shader at 3× on a phone is the difference between 60fps and 20 — and
the background loop stops entirely when the tab is hidden.

Append `?fx=0` to the URL to render the scene with the post-processing chain
disabled. Useful when a colour looks wrong and you need to know whether the
scene or the effects are responsible.

### Reduced motion

`prefers-reduced-motion: reduce` disables Lenis and falls back to native
scrolling, renders every reveal in its resting state, and freezes the scene to
a single static frame.

That frame is composed for stillness rather than being the animated scene
paused: the water opens at mid-depth instead of at the surface, and the creature
is left out, because frozen at full surface brightness it sat over the project
copy with no way to drift clear of it. Plates snap open on their first frame
rather than easing, so no artwork is left invisible.

## Notes

- `.npmrc` sets `legacy-peer-deps=true`. `@react-three/fiber` declares optional
  Expo peers that npm otherwise tries to resolve against React 19 and fails on.
- Fonts are Fraunces (display, with its SOFT and WONK axes), Archivo (body) and
  JetBrains Mono (the depth readouts), loaded from Google Fonts.
