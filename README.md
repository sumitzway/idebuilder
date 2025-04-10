# IDE Builder: AI-Powered Code Generation Tool

This application allows you to generate web components using OpenAI's API. Simply enter a prompt describing the component or website you want to create, and the AI will generate the code for you. You can also modify existing code by describing the changes you want to make.

## Features

- Generate vanilla JavaScript, HTML, and CSS code using OpenAI's GPT models
- Edit generated code in real-time with syntax highlighting
- Preview the UI of your components with mobile, tablet, and desktop views
- Modify existing components by describing the changes
- Tailwind CSS styling for modern, responsive components
- Fallback to template-based generation when no API key is provided
- Dark/Light mode toggle

## Setup

1. Clone this repository
2. Install dependencies with `npm install`
3. Obtain an OpenAI API key from [OpenAI's platform](https://platform.openai.com/)
4. Create a `.env` file based on the examples below and add your API key
5. Run the development server with `npm run dev`

## Environment Variables

The application uses environment variables for configuration. You can set these in `.env`, `.env.development`, or `.env.production` files depending on your environment.

### Required Variables

```
# OpenAI API Key (Required for AI code generation)
AGENT_OPENAI_API_KEY=your_api_key_here
VITE_AGENT_OPENAI_API_KEY=your_api_key_here
```

### Optional Configuration Variables

```
# Application Configuration
VITE_APP_NAME=IDEBuilder
VITE_APP_DESCRIPTION=AI-powered code generation tool
VITE_APP_VERSION=1.0.0

# OpenAI Model Configuration
VITE_OPENAI_MODEL=gpt-3.5-turbo
VITE_OPENAI_TEMPERATURE=0.7
VITE_OPENAI_MAX_TOKENS=4000

# UI Configuration
VITE_DEFAULT_THEME=light  # Options: 'light' or 'dark'
VITE_DEFAULT_DEVICE=mobile  # Options: 'mobile', 'tablet', or 'desktop'

# Developer options
VITE_ENABLE_DEBUG=true
VITE_SHOW_CONSOLE_LOGS=true
```

## Environment-Specific Configuration

The application supports different configurations for development and production environments:

- `.env` - Default configuration used by both environments
- `.env.development` - Development-specific overrides (used when running `npm run dev`)
- `.env.production` - Production-specific overrides (used when running `npm run build`)

## Development

To start the development server:

```bash
npm run dev
```

To build for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
