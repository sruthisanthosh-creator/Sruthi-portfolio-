import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative asset URLs, so a build works from any path rather than only from
  // a domain root — GitHub Pages serves this repo from /Sruthi-portfolio-/.
  base: './',
  build: {
    // three.js and the post-processing chain are ~80% of the bundle and change
    // only when the dependency does. Splitting them off means editing copy in
    // profile.ts ships a few kB to returning visitors instead of 1.4 MB.
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: 'three', test: /node_modules\/(three|postprocessing)/ },
            { name: 'react', test: /node_modules\/(react|react-dom|scheduler)/ },
          ],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
})
