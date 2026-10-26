// minimal typing for Node globals used below (no @types/node in this project)
declare const process: { env: Record<string, string | undefined> };
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // sub-path base for static deploy (e.g. /haoplayer/), defaults to / in dev
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
