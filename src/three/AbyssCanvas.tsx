import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, KernelSize, ToneMappingMode } from 'postprocessing'
import { HalfFloatType } from 'three'
import { Backdrop } from './Backdrop'
import { MarineSnow } from './MarineSnow'
import { Membrane } from './Membrane'
import { prefersReducedMotion } from '../lib/scroll'

/**
 * The persistent scene behind the entire page. One canvas, fixed to the
 * viewport, alive for the whole session — the document scrolls over it while
 * the water stays put, which is what makes the page feel like a column rather
 * than a stack of sections.
 */
const FX = typeof window === 'undefined' || new URLSearchParams(window.location.search).get('fx') !== '0'

export function AbyssCanvas() {
  const [reduced, setReduced] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setReduced(prefersReducedMotion())
    // A tab in the background has no business running a shader loop.
    const onVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  return (
    <div className="abyss-canvas" aria-hidden="true">
      <Canvas
        // Capped device pixel ratio: a full-screen fragment shader at 3x on a
        // phone is the difference between 60fps and 20.
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 5], fov: 42, near: 0.1, far: 60 }}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        // Reduced motion gets one rendered frame, then stillness.
        frameloop={reduced || !visible ? 'demand' : 'always'}
      >
        <Suspense fallback={null}>
          <Backdrop />
          <MarineSnow />
          <Membrane />

          {FX && (
          /*
            Half-float buffer, and tone mapping as an explicit final pass.

            Both are load-bearing. The scene is additive and deliberately pushes
            past 1.0, and in the default 8-bit buffer those values clip per
            channel — a bright teal crest loses green and blue first and comes
            out magenta. Giving the chain an HDR buffer keeps the values intact,
            and mapping them down at the end is what turns them back into light
            instead of clipping. The composer also bypasses the renderer's own
            tone mapping, so without this pass there is none at all.
          */
          <EffectComposer multisampling={0} frameBufferType={HalfFloatType}>
            {/*
              Bloom is not a filter here, it is the lighting model. Everything
              emissive is drawn thin and dark and allowed to bleed — that is how
              bioluminescence actually reads, as glow without a lit surface.
            */}
            <Bloom
              intensity={1.15}
              luminanceThreshold={0.16}
              luminanceSmoothing={0.35}
              kernelSize={KernelSize.LARGE}
              mipmapBlur
            />
            <Noise blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.24} />
            <Vignette eskil={false} offset={0.22} darkness={0.8} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}
