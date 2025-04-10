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
      // OpenAI API Keys
      'import.meta.env.AGENT_OPENAI_API_KEY': JSON.stringify(env.AGENT_OPENAI_API_KEY),
      
      // Application Configuration
      'import.meta.env.VITE_APP_NAME': JSON.stringify(env.VITE_APP_NAME || 'IDEBuilder'),
      'import.meta.env.VITE_APP_DESCRIPTION': JSON.stringify(env.VITE_APP_DESCRIPTION || 'AI-powered code generation tool'),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      
      // OpenAI Model Configuration
      'import.meta.env.VITE_OPENAI_MODEL': JSON.stringify(env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo'),
      'import.meta.env.VITE_OPENAI_TEMPERATURE': JSON.stringify(env.VITE_OPENAI_TEMPERATURE || '0.7'),
      'import.meta.env.VITE_OPENAI_MAX_TOKENS': JSON.stringify(env.VITE_OPENAI_MAX_TOKENS || '4000'),
      
      // UI Configuration
      'import.meta.env.VITE_DEFAULT_THEME': JSON.stringify(env.VITE_DEFAULT_THEME || 'light'),
      'import.meta.env.VITE_DEFAULT_DEVICE': JSON.stringify(env.VITE_DEFAULT_DEVICE || 'mobile')
    },
    server: {
      port: 3000,
      host: true, // This allows access from other devices on the network
      open: true, // This will open the browser automatically
    },
  }
})
