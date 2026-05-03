import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // target: 'https://techno-terminal-ibrhmahmd2165-00zb1kxm.leapcell.dev',
        // target : 'https://techno-terminal-5c255cfe.fastapicloud.dev/',
        target : 'http://0.0.0.0:8000',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})

//    "destination" : 'https://techno-terminal-5c255cfe.fastapicloud.dev/'
