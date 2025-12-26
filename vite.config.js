import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Get backend URL from env, remove /api suffix if present for proxy target
  const backendUrl = env.VITE_BACKEND_BASE_URL?.replace('/api', '') || 'https://adjacent-gianina-health-care-2058c736.koyeb.app'
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: true,
        }
      }
    }
  }
})
