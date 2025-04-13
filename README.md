# IDE Builder: AI-Powered Code Generation Tool

## Overview
IDE Builder is a sophisticated web-based application that leverages AI to generate and modify code based on natural language prompts. The application features a modern, responsive interface with real-time code generation, preview capabilities, and an interactive development environment.

## Quick Start

### Prerequisites
- Node.js (Latest LTS version recommended)
- npm (comes with Node.js)
- OpenAI API key

### Installation
1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd idebuilder
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
   Note: We use `--legacy-peer-deps` due to compatibility requirements with react-split-pane.

3. Configure environment variables:
   - Copy `.env.example` to `.env` and `.env.development`
   - Add your OpenAI API key to both files:
     ```
     AGENT_OPENAI_API_KEY=your_openai_api_key_here
     VITE_AGENT_OPENAI_API_KEY=your_openai_api_key_here
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The application will automatically find an available port (starting from 3000) and launch.
   Access the application at:
   - Local: http://localhost:[PORT]/ (typically 3000, 3001, or 3002)
   - Network: http://[your-ip]:[PORT]/

## Core Components

### 1. Main Application (`drxApp.tsx`)
- Split-pane layout management
- Theme switching (dark/light mode)
- OpenAI API integration
- Fallback code generation
- Error handling and loading states

### 2. Prompt Pane (`drxPromptPane.tsx`)
- Chat-like interface
- File change tracking
- Error logging
- Support for code generation and modifications

### 3. Code Editor (`drxCodeEditor.tsx`)
- Syntax highlighting
- Multiple file support
- Code formatting
- Error highlighting

### 4. Preview Pane (`drxPreviewPane.tsx`)
- Real-time preview
- Mobile/desktop viewport switching
- Console output display

## Environment Configuration

### Required Environment Variables
```env
AGENT_OPENAI_API_KEY=your_openai_api_key_here
VITE_AGENT_OPENAI_API_KEY=your_openai_api_key_here
VITE_APP_NAME=IDEBuilder
VITE_APP_DESCRIPTION=AI-powered code generation tool
VITE_APP_VERSION=1.0.0
VITE_OPENAI_MODEL=gpt-3.5-turbo
VITE_OPENAI_TEMPERATURE=0.7
VITE_OPENAI_MAX_TOKENS=4000
VITE_DEFAULT_THEME=light
VITE_DEFAULT_DEVICE=mobile
```

## Common Issues and Solutions

### Port Configuration
- The application automatically finds an available port
- Default port sequence: 3000 → 3001 → 3002
- If all standard ports are in use, it will continue searching for an available port

### Known Issues
1. SplitPane TypeScript Issues
   - Solution: Use `// @ts-ignore` for SplitPane component
   - Alternative: Use `--legacy-peer-deps` during installation

2. OpenAI API Connection
   - Ensure API key is properly set in both `.env` and `.env.development`
   - Check for API key format and validity

### Error Handling
The application implements comprehensive error handling for:
- API connection issues
- Code generation failures
- Preview rendering errors
- File system operations
- TypeScript/React compilation errors

## Development Guidelines

### Best Practices
1. **Code Style**
   - Use TypeScript for type safety
   - Follow React best practices
   - Maintain consistent error handling

2. **Security**
   - Never commit API keys
   - Use environment variables for sensitive data
   - Implement secure preview sandboxing

3. **Performance**
   - Optimize code generation requests
   - Implement efficient file handling
   - Use React.memo for heavy components

### Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
[Your License Here]

## Support
For support, please [create an issue](repository-issues-url) or contact the development team.
