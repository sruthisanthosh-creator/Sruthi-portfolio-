import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import { FBM, PALETTE, SIMPLEX } from './glsl'
import { live } from '../lib/scroll'

/**
 * The water column itself.
 *
 * Draws two things that are really one thing: the surface caustic web, and its
 * extinction. Sunlight in seawater falls off fast and unevenly by wavelength —
 * red is gone by about 15 m, green holds to a few hundred, blue is the last to
 * go. The gradient below follows that order on purpose, so the page gets colder
 * and bluer before it gets black, rather than just dimming.
 */

const vertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`

const fragment = /* glsl */ `
${SIMPLEX}
${FBM}
${PALETTE}

uniform float uTime;
uniform float uDepth;
uniform vec2  uResolution;
uniform vec2  uPointer;

varying vec2 vUv;

// Interlocking cells. Caustics are the bright seams where the cells meet,
// so we take the distance to the *second* nearest feature point, not the first.
float caustic(vec2 p, float t) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float d1 = 8.0;
  float d2 = 8.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 o = fract(sin(vec2(
        dot(i + g, vec2(127.1, 311.7)),
        dot(i + g, vec2(269.5, 183.3))
      )) * 43758.5453);

      // Feature points orbit, which is what makes the web crawl.
      o = 0.5 + 0.42 * sin(t + 6.2831 * o);

      float d = length(g + o - f);
      if (d < d1) { d2 = d1; d1 = d; }
      else if (d < d2) { d2 = d; }
    }
  }
  return d2 - d1;
}

void main() {
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);

  // ── The column ────────────────────────────────────────────────────────────
  // Vertical gradient within the viewport, pushed downward by scroll depth.
  float y = clamp(uv.y - uDepth * 0.35, -1.0, 1.0);

  vec3 shallow = mix(TRENCH, vec3(0.105, 0.330, 0.375), smoothstep(-0.1, 1.0, uv.y));
  vec3 col = mix(ABYSS, shallow, smoothstep(-0.2, 1.1, y) * (1.0 - uDepth * 0.82));

  // ── Caustics ──────────────────────────────────────────────────────────────
  // Only present while there is a surface to refract. Fully extinct by ~1000 m,
  // which is where the work section starts.
  float light = pow(1.0 - smoothstep(0.0, 0.32, uDepth), 1.6);

  if (light > 0.001) {
    // Perspective squash: the web is a ceiling, so it compresses toward the top.
    vec2 cp = vec2(p.x * 3.0, (1.0 - uv.y) * 7.0 + uDepth * 4.0);
    float c = caustic(cp, uTime * 0.28);
    c = pow(smoothstep(0.0, 0.62, c), 2.1);

    // Second, slower pass at a different scale so it never tiles visibly.
    float c2 = caustic(cp * 0.55 + 31.7, uTime * 0.17);
    c2 = pow(smoothstep(0.0, 0.70, c2), 2.6);

    vec3 shaft = mix(LUMEN, FOAM, 0.55);

    // The ceiling itself.
    col += shaft * (c * 0.92 + c2 * 0.54) * light * smoothstep(-0.45, 0.95, uv.y);

    /*
      And the shafts hanging off it. Caustics alone only brighten the very top
      of the frame, which left the surface reading as dark as the trench — and
      the whole page is an argument about losing light, so the first section has
      to visibly have some. Vertical, slowly sliding, and gone long before they
      reach the copy.
    */
    float beams = fbm(vec3(p.x * 2.4, uTime * 0.05, 0.0), 2, 0.5) * 0.5 + 0.5;
    beams = pow(beams, 2.6);
    col += shaft * beams * 0.30 * light * smoothstep(-0.25, 1.0, uv.y);
  }

  // ── Distant glow ──────────────────────────────────────────────────────────
  // Something large and luminous, always just out of frame. Follows the pointer
  // slightly so the page feels aware of the cursor without chasing it.
  vec2 gp = p - uPointer * 0.18;
  float glow = exp(-length(gp * vec2(1.1, 1.6) - vec2(0.0, -0.25 + uDepth * 0.5)) * 2.2);
  vec3 glowCol = mix(LUMEN, BLOOM, smoothstep(0.35, 1.0, uDepth));
  col += glowCol * glow * (0.05 + uDepth * 0.16);

  // Slow drifting haze so large flat areas are never actually flat.
  float haze = fbm(vec3(p * 1.6, uTime * 0.035), 3, 0.5);
  col += mix(TRENCH, glowCol, 0.35) * haze * 0.05;

  // Ordered dither. Without it, a near-black gradient across a large screen
  // bands badly, and banding is the one thing that makes this look cheap.
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (dither - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`

export function Backdrop({ staticDepth = 0 }: { staticDepth?: number }) {
  const material = useRef<THREE.ShaderMaterial>(null)

/*
  Uniforms are read back off the material rather than from the object passed as
  a prop: <shaderMaterial> takes those values as a starting point and the
  material ends up owning its own copy, so mutating the original updates nothing
  and the shader stays frozen at frame zero.
*/
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDepth: { value: staticDepth },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(0, 0) },
    }),
    [staticDepth],
  )

  useFrame((state) => {
    const u = material.current?.uniforms
    if (!u) return

    u.uTime.value = state.clock.elapsedTime
    u.uDepth.value += (live.scroll - u.uDepth.value) * 0.1
    u.uResolution.value.set(state.size.width, state.size.height)
    // Damped pointer — an instantly-tracking glow reads as a flashlight,
    // a lagging one reads as a mass with inertia.
    u.uPointer.value.lerp(state.pointer, 0.035)
  })

  return (
    <ScreenQuad renderOrder={-100}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        depthTest={false}
        depthWrite={false}
      />
    </ScreenQuad>
  )
}
