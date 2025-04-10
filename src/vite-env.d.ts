/// <reference types="vite/client" />

interface ImportMetaEnv {
  // OpenAI API Keys
  readonly AGENT_OPENAI_API_KEY: string;
  readonly VITE_AGENT_OPENAI_API_KEY: string;
  
  // Application Configuration
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_DESCRIPTION: string;
  readonly VITE_APP_VERSION: string;
  
  // OpenAI Model Configuration
  readonly VITE_OPENAI_MODEL: string;
  readonly VITE_OPENAI_TEMPERATURE: string;
  readonly VITE_OPENAI_MAX_TOKENS: string;
  
  // UI Configuration
  readonly VITE_DEFAULT_THEME: 'light' | 'dark';
  readonly VITE_DEFAULT_DEVICE: 'mobile' | 'tablet' | 'desktop';
  
  // Developer options
  readonly VITE_ENABLE_DEBUG: string;
  readonly VITE_SHOW_CONSOLE_LOGS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
