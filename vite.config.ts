import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    // Expose environment variables to the client
    define: {
      'import.meta.env.AGENT_OPENAI_API_KEY': JSON.stringify(env.AGENT_OPENAI_API_KEY)
    },
    server: {
      port: 3000,
      host: true, // This allows access from other devices on the network
      open: true, // This will open the browser automatically
    },
  }
})
