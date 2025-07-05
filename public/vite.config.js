import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Inventory-Management/',  // Replace with your repo name
  plugins: [react()],
})
