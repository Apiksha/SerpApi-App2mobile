import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true
    },
    server: {
      port: 5000,
      proxy: {
        '/search': {
          target: 'http://localhost:5000',
          changeOrigin: true
        }
      }
    },
    define: {
      'process.env.VITE_API_URL': JSON.stringify(
        mode === 'production' 
          ? 'https://serpapi-app2mobile.onrender.com'
          : 'http://localhost:5000'
      )
    }
  }
})