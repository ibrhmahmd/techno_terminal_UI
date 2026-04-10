import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://techno-terminal-ibrhmahmd2165-00zb1kxm.leapcell.dev',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
