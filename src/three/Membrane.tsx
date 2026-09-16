import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FBM, PALETTE, SIMPLEX } from './glsl'
import { live } from '../lib/scroll'

/**
 * The creature.
 *
 * One displaced icosahedron standing in for whatever is down there with you.
 * It is deliberately never fully resolved — the fresnel rim describes an edge,
 * the interior stays dark, and bloom does the rest. A fully lit, fully readable
 * organism would be a mascot; an edge in the dark is unsettling, which is the
 * point of the midnight zone.
 */

const vertex = /* glsl */ `
${SIMPLEX}
${FBM}

uniform float uTime;
uniform float uDepth;
uniform float uChurn;
uniform float uPulse;

varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;

void main() {
  vec3 p = position;

  // Slow swell, plus a ridged component that sharpens as we descend —
  // shallow water gets a smooth blob, the trench gets tendrils.
  float swell = fbm(p * 1.55 + vec3(0.0, uTime * 0.11, uTime * 0.06), 3, 0.5);
  float veins = ridged(p * 2.6 - vec3(uTime * 0.045), 3);

  float disp = swell * 0.30 + veins * 0.20 * uChurn;

  // A heartbeat. Barely there at the surface, pronounced in the dark.
  disp += sin(uTime * 1.4 + p.y * 2.0) * 0.012 * uPulse;

  p += normal * disp;

  vDisp = disp;
  vNormal = normalize(normalMatrix * normal);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vView = normalize(-mv.xyz);

  gl_Position = projectionMatrix * mv;
}
`

const fragment = /* glsl */ `
${PALETTE}

uniform float uDepth;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;

void main() {
  float fres = 1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0);
  fres = pow(fres, 2.6);

  // Teal near the surface, shifting violet under pressure.
  vec3 tint = mix(LUMEN, BLOOM, smoothstep(0.25, 0.95, uDepth));

  // Crests catch light, troughs stay black — the displacement is the lighting.
  float crest = smoothstep(0.02, 0.34, vDisp);

  float energy = fres * 1.15 + crest * 0.42;
  vec3 col = tint * energy;

  // A cold interior so the silhouette never reads as a flat cutout.
  col += TRENCH * 0.85 * (1.0 - fres);

  // It belongs to the surface. Below the twilight zone it is still there, but
  // far off and dim — the sections underneath need the page to themselves.
  float recede = 1.0 - smoothstep(0.05, 0.32, uDepth) * 0.90;

  gl_FragColor = vec4(col * recede, clamp(fres * 0.92 + crest * 0.22, 0.0, 1.0) * recede);
}
`

export function Membrane() {
  const mesh = useRef<THREE.Mesh>(null)
  const group = useRef<THREE.Group>(null)
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
      uDepth: { value: 0 },
      uChurn: { value: 0.3 },
      uPulse: { value: 0 },
    }),
    [],
  )

  useFrame((state, delta) => {
    const u = material.current?.uniforms
    if (!u) return

    const t = state.clock.elapsedTime
    const p = live.scroll

    u.uTime.value = t
    u.uDepth.value = p
    u.uChurn.value = 0.25 + p * 1.15
    u.uPulse.value = p

    if (group.current) {
      // Drifts off-centre and recedes as you descend, so the hero composition
      // does not simply repeat itself five sections later.
      group.current.rotation.y += delta * 0.075
      group.current.rotation.x = Math.sin(t * 0.13) * 0.16
      group.current.position.x = 1.55 + Math.sin(p * Math.PI) * 1.3
      group.current.position.y = 0.35 - p * 2.2
      group.current.position.z = -2.6 - p * 5.5

      const s = 1 + Math.sin(p * Math.PI) * 0.25
      group.current.scale.setScalar(s)
    }
  })

  return (
    <group ref={group}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[0.92, 24]} />
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={vertex}
          fragmentShader={fragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  )
}
