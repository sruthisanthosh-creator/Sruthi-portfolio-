import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { FBM, PALETTE, SIMPLEX } from './glsl'
import { live, prefersReducedMotion } from '../lib/scroll'
import type { Project } from '../content/profile'

/**
 * A masked plate.
 *
 * There is no image file anywhere in this project. Each plate's artwork is a
 * fragment shader evaluated fresh every frame from three numbers on the project
 * (hue, seed, churn), then cut through a mask whose edge is itself noise-driven,
 * so the silhouette breathes instead of sitting still like a clipping path.
 *
 * The geometry is a subdivided plane displaced in the vertex stage, which is
 * what separates this from a CSS mask: the artwork bends away from you, catches
 * the pointer, and shears with scroll velocity.
 */

const vertex = /* glsl */ `
${SIMPLEX}
${FBM}

uniform float uTime;
uniform float uHover;
uniform float uVelocity;
uniform float uEnter;
uniform float uSeed;

varying vec2 vUv;
varying float vDepth;

void main() {
  vUv = uv;
  vec3 p = position;

  vec2 c = uv - 0.5;

  // Standing swell across the surface.
  float swell = fbm(vec3(uv * 2.4, uTime * 0.16 + uSeed), 2, 0.5);
  p.z += swell * (0.055 + uHover * 0.16);

  // A dome that deepens on hover — the plate inflates toward the pointer.
  p.z += (0.25 - dot(c, c)) * uHover * 0.55;

  // Scroll shear. The plate lags its own frame, like something suspended in
  // water rather than pinned to the page.
  p.z += sin(c.y * 3.14159) * clamp(uVelocity, -70.0, 70.0) * 0.0032;
  p.y += clamp(uVelocity, -70.0, 70.0) * 0.0008 * (0.5 + swell);

  // Settles into place as the card enters the viewport.
  p.z -= (1.0 - uEnter) * 0.35;

  vDepth = p.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`

const fragment = /* glsl */ `
${SIMPLEX}
${FBM}
${PALETTE}

uniform float uTime;
uniform float uHue;
uniform float uSeed;
uniform float uChurn;
uniform float uHover;
uniform float uEnter;
uniform float uAspect;
uniform vec2  uPointer;

varying vec2 vUv;
varying float vDepth;

/*
  A ramp built from the page's own five colours rather than a generated one.

  A cosine palette is the usual reach here and it was wrong for this: sweeping
  a hue offset walks the artwork through yellows and reds, and nothing in the
  bathypelagic is warm. This instead interpolates abyss → trench → the project's
  own tint → foam, where the tint is the single degree of freedom a project
  gets: somewhere on the line between lumen green and bloom violet. Five
  projects come out clearly different and unmistakably the same organism.
*/
vec3 seaRamp(float t, vec3 tint) {
  vec3 c = mix(ABYSS * 1.7, TRENCH, smoothstep(0.00, 0.34, t));
  c = mix(c, mix(TRENCH, tint, 0.62), smoothstep(0.24, 0.66, t));
  c = mix(c, tint, smoothstep(0.58, 0.90, t));
  c = mix(c, FOAM, smoothstep(0.90, 1.00, t) * 0.5);
  return c;
}

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

void main() {
  vec2 uv = vUv;
  vec2 c = (uv - 0.5) * vec2(uAspect, 1.0);

  // ── The artwork ───────────────────────────────────────────────────────────
  float t = uTime * 0.09 + uSeed;

  // Domain warping: sample the noise field at coordinates that are themselves
  // noise. This is what turns a cloud into something that looks like it flows.
  vec3 q = vec3(uv * 2.1, t);
  float w1 = fbm(q, 3, 0.5);
  float w2 = fbm(q + vec3(5.2, 1.3, 0.0) + w1 * (0.7 + uChurn * 0.9), 3, 0.5);

  vec2 warped = uv + vec2(w1, w2) * (0.14 + uChurn * 0.22);

  // Ridged noise over the warped field gives veins and tendrils.
  float veins = ridged(vec3(warped * 3.2, t * 1.4), 3);
  float threads = pow(smoothstep(0.30, 0.95, veins), 2.4);

  float body = fbm(vec3(warped * 1.5, t * 0.6), 3, 0.55) * 0.5 + 0.5;

  // The project's identity: one point on the lumen–bloom line.
  vec3 glowCol = mix(LUMEN, BLOOM, clamp(uHue, 0.0, 1.0));

  vec3 col = seaRamp(body * 0.72 + threads * 0.34, glowCol);

  // Bioluminescent seams, brightest where the veins are sharpest.
  col += glowCol * threads * (0.85 + uHover * 0.8);

  // Interior fog so the artwork has depth behind the veins.
  col = mix(ABYSS * 1.4, col, 0.35 + body * 0.65);

  // Pointer light. Nothing else on the page lights this plate.
  float lamp = exp(-length(c - uPointer * vec2(uAspect, 1.0) * 0.5) * 3.4);
  col += glowCol * lamp * uHover * 0.55;

  // The displacement reads as relief.
  col += glowCol * clamp(vDepth, 0.0, 1.0) * 0.5;

  // ── The mask ──────────────────────────────────────────────────────────────
  // A capsule whose edge is perturbed by the same noise field as the artwork,
  // so the silhouette and its contents belong to one organism.
  float edge = fbm(vec3(c * 2.6, uTime * 0.13 + uSeed), 2, 0.5);

  vec2 half_ = vec2(0.30 * uAspect, 0.40);
  float d = sdRoundBox(c, half_, 0.27);
  d += edge * 0.058 * (0.6 + uChurn * 0.7);

  // Opens as the card arrives, from a slit to the full plate.
  float open = mix(-0.17, 0.0, uEnter);
  d -= open;

  float mask = smoothstep(0.004, -0.010, d);

  // A lit rim exactly on the boundary — the membrane wall.
  float rim = smoothstep(0.030, 0.0, abs(d));
  col += glowCol * rim * (0.55 + uHover * 1.0);
  col += FOAM * pow(rim, 3.0) * 0.22;

  float alpha = clamp(mask + rim * 0.55, 0.0, 1.0) * uEnter;
  if (alpha < 0.003) discard;

  // Dither, same reason as the backdrop.
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (dither - 0.5) / 255.0;

  gl_FragColor = vec4(col, alpha);
}
`

function Plate({ art, hover, enter }: { art: Project['art']; hover: React.RefObject<number>; enter: React.RefObject<number> }) {
  const mesh = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const { viewport } = useThree()

/*
  Uniforms are read back off the material, never from the object passed as a
  prop. Handing `uniforms` to <shaderMaterial> hands over the initial values;
  the material ends up owning a separate copy, so mutating the original updates
  nothing and the shader sits frozen at frame zero. The ref is the only handle
  on the uniforms the GPU actually sees.
*/
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHue: { value: art.hue },
      uSeed: { value: art.seed },
      uChurn: { value: art.churn },
      uHover: { value: 0 },
      uEnter: { value: 0 },
      uVelocity: { value: 0 },
      uAspect: { value: 1 },
      uPointer: { value: new THREE.Vector2() },
    }),
    [art.hue, art.seed, art.churn],
  )

  const settled = useRef(false)

  useFrame((state) => {
    const u = material.current?.uniforms
    if (!u) return

    const t = state.clock.elapsedTime
    u.uTime.value = t
    u.uAspect.value = viewport.aspect

    // First frame adopts the plate's real position instead of easing up from
    // zero — otherwise anyone who lands mid-page, or reloads on a project,
    // stares at an empty slot while the ramp catches up.
    if (!settled.current) {
      settled.current = true
      u.uEnter.value = enter.current ?? 0
    }

    // Everything eases toward its target rather than snapping — a plate that
    // reacts instantly to the pointer feels like a button, not a body of water.
    u.uHover.value += ((hover.current ?? 0) - u.uHover.value) * 0.07
    u.uEnter.value += ((enter.current ?? 0) - u.uEnter.value) * 0.09
    u.uVelocity.value += (live.velocity - u.uVelocity.value) * 0.1
    u.uPointer.value.lerp(state.pointer, 0.06)

    if (mesh.current) {
      // Tilt toward the pointer. Small — past about 0.2rad it stops reading as
      // a suspended object and starts reading as a card flipping.
      const h = u.uHover.value
      mesh.current.rotation.y += (state.pointer.x * 0.18 * h - mesh.current.rotation.y) * 0.06
      mesh.current.rotation.x += (-state.pointer.y * 0.14 * h - mesh.current.rotation.x) * 0.06
      mesh.current.position.y = Math.sin(t * 0.5 + art.seed) * 0.04
    }
  })

  // Fill the frustum at z=0 with a little bleed for the displacement.
  const w = viewport.width * 1.05
  const h = viewport.height * 1.05

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[w, h, 48, 48]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

export function LuminousPlate({ art, className }: { art: Project['art']; className?: string }) {
  const host = useRef<HTMLDivElement>(null)
  const hover = useRef(0)
  const enter = useRef(0)
  const [active, setActive] = useState(false)
  const [reduced] = useState(prefersReducedMotion)

  /**
   * Two jobs, one observer: pause the render loop for plates that are off
   * screen (five always-on WebGL contexts would melt a laptop), and drive the
   * `uEnter` open/close as the plate crosses the viewport.
   */
  useEffect(() => {
    const el = host.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: '12% 0px' },
    )
    io.observe(el)

    let frame = 0
    const tick = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      // 0 when fully outside, 1 while comfortably inside.
      const seen = 1 - Math.abs(rect.top + rect.height / 2 - vh / 2) / (vh * 0.85)
      enter.current = Math.max(0, Math.min(1, seen * 1.5))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      ref={host}
      className={`plate ${className ?? ''}`}
      onPointerEnter={() => (hover.current = 1)}
      onPointerLeave={() => (hover.current = 0)}
      aria-hidden="true"
    >
      {active && (
        <Canvas
          dpr={[1, 1.35]}
          camera={{ position: [0, 0, 2.4], fov: 45 }}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false }}
          frameloop={reduced ? 'demand' : 'always'}
        >
          <Suspense fallback={null}>
            <Plate art={art} hover={hover} enter={enter} />
          </Suspense>
        </Canvas>
      )}
    </div>
  )
}
