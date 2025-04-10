# Next.js Code Generator with OpenAI Integration

This application allows you to generate Next.js components using OpenAI's API. Simply enter a prompt describing the component you want to create, and the AI will generate the code for you. You can also modify existing code by describing the changes you want to make.

## Features

- Generate Next.js components using OpenAI's GPT models
- Edit generated code in real-time with syntax highlighting
- Preview the UI of your components
- Modify existing components by describing the changes
- Tailwind CSS styling for modern, responsive components
- Fallback to template-based generation when no API key is provided
- Dark/Light mode toggle

## Setup

1. Clone this repository
2. Install dependencies with `npm install`
3. Obtain an OpenAI API key from [OpenAI's platform](https://platform.openai.com/)
4. Create a `.env` file based on `.env.example` and add your API key (or enter it in the UI)
5. Run the development server with `npm run dev`

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
