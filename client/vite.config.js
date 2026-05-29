import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
<<<<<<< HEAD
      '/api': 'https://skillswap-0weh.onrender.com/api',
=======
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
>>>>>>> main
    },
  },
})