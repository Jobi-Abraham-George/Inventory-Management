import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Inventory-Management/'  // 👈 Needed for GitHub Pages
})
