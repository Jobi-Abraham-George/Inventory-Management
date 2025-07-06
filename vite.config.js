import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'index.html')
    }
  },
  base: '/Inventory-Management/'  // 👈 Needed for GitHub Pages
})
