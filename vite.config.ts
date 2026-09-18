import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base relative : le build fonctionne une fois publié sous n'importe quel chemin
export default defineConfig({
  base: './',
  plugins: [react()],
})
