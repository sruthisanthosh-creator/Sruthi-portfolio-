import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { live } from '../lib/scroll'

/**
 * Marine snow — the constant fall of organic debris that anyone who has seen
 * submersible footage recognises immediately. It is what sells "underwater"
 * more than any colour choice does.
 *
 * It also does the load-bearing work of communicating scroll: the particles
 * stretch and rush upward with scroll velocity, so descending *feels* like
 * descending rather than like a page moving.
 */

const COUNT = 2600
const FIELD = 14

const vertex = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform float uVelocity;
uniform float uPixelRatio;

attribute float aSpeed;
attribute float aSize;
attribute float aPhase;

varying float vAlpha;
varying float vFlicker;

void main() {
  vec3 p = position;

  // Perpetual settle, plus a parallax term so the field slides past the camera
  // as the page scrolls. Nearer particles (larger aSize) move further.
  float fall = uTime * aSpeed * 0.28 + uScroll * (3.5 + aSize * 5.0);

  p.y = mod(p.y - fall + ${(FIELD / 2).toFixed(1)}, ${FIELD.toFixed(1)}) - ${(FIELD / 2).toFixed(1)};

  // Lateral wander. Debris does not fall straight.
  p.x += sin(uTime * 0.22 + aPhase) * 0.34;
  p.z += cos(uTime * 0.17 + aPhase * 1.7) * 0.3;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);

  // Velocity stretch, applied in view space so streaks stay vertical on screen.
  mv.y += clamp(uVelocity, -60.0, 60.0) * 0.0045 * (0.4 + aSize);

  gl_Position = projectionMatrix * mv;

  float dist = -mv.z;
  gl_PointSize = aSize * uPixelRatio * (34.0 / max(dist, 0.6));

  // Fade at both ends of the field so nothing pops in or out.
  vAlpha = smoothstep(16.0, 4.0, dist) * smoothstep(0.4, 2.0, dist);
  vFlicker = aPhase;
}
`

const fragment = /* glsl */ `
uniform float uTime;
uniform float uDepth;

varying float vAlpha;
varying float vFlicker;

const vec3 LUMEN = vec3(0.310, 0.941, 0.784);
const vec3 FOAM  = vec3(0.902, 0.961, 0.949);

void main() {
  // Round, soft-edged point.
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float core = smoothstep(0.5, 0.0, d);

  // Near the surface the debris is lit from above and reads white. Deeper down
  // the only light is biological, so it reads as the lumen green.
  vec3 col = mix(FOAM, LUMEN, smoothstep(0.1, 0.7, uDepth));

  // A few particles flicker — bioluminescent, not just reflective.
  float spark = step(0.86, fract(vFlicker * 13.31));
  float pulse = 0.5 + 0.5 * sin(uTime * 2.4 + vFlicker * 20.0);
  col += LUMEN * spark * pulse * 1.4 * uDepth;

  float alpha = core * vAlpha * (0.16 + spark * 0.34);
  if (alpha < 0.002) discard;

  gl_FragColor = vec4(col, alpha);
}
`

export function MarineSnow() {
  const points = useRef<THREE.Points>(null)
  const material = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(COUNT * 3)
    const speed = new Float32Array(COUNT)
    const size = new Float32Array(COUNT)
    const phase = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * FIELD
      pos[i * 3 + 1] = (Math.random() - 0.5) * FIELD
      pos[i * 3 + 2] = (Math.random() - 0.5) * FIELD * 0.7 - 2
      speed[i] = 0.3 + Math.random() * 1.2
      // Skewed small: a few large near-field flakes, many distant specks.
      size[i] = 0.35 + Math.pow(Math.random(), 4) * 2.2
      phase[i] = Math.random() * Math.PI * 2
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1))
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    return geo
  }, [])

/*
  Uniforms are read back off the material rather than from the object passed as
  a prop: <shaderMaterial> takes those values as a starting point and the
  material ends up owning its own copy, so mutating the original updates nothing
  and the shader stays frozen at frame zero.
*/
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uVelocity: { value: 0 },
      uDepth: { value: 0 },
      uPixelRatio: { value: 1 },
    }),
    [],
  )

  useFrame((state) => {
    const u = material.current?.uniforms
    if (!u) return

    u.uTime.value = state.clock.elapsedTime
    u.uScroll.value = live.scroll
    u.uDepth.value = live.scroll
    u.uPixelRatio.value = state.viewport.dpr
    // Ease the velocity so a flick of the wheel does not snap the streaks.
    u.uVelocity.value += (live.velocity - u.uVelocity.value) * 0.12
  })

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
