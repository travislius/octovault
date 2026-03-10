import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5679'
    }
  },
  define: {
    AGENTS: JSON.stringify([
      { id: 'tia',  label: 'Tia 🌿',  name: 'Tia Li' },
      { id: 'sia',  label: 'Sia 🤖',  name: 'Sia' },
      { id: 'max',  label: 'Max 🔬',  name: 'Max' },
      { id: 'zed',  label: 'Zed 🔩',  name: 'Zed' },
    ])
  }
})
