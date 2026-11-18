import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/espn': {
        target: 'https://site.api.espn.com/apis/site/v2/sports',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/espn/, ''),
      },
    },
  },
})
