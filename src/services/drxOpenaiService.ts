import OpenAI from 'openai';

// Initialize the OpenAI client
// Note: You should use environment variables for the API key in a production environment
let openai: OpenAI | null = null;

export const initializeOpenAI = (apiKey: string) => {
  openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // This is needed for client-side usage
  });
  return openai;
};

export const getOpenAIInstance = () => {
  if (!openai) {
    throw new Error('OpenAI client not initialized. Call initializeOpenAI first.');
  }
  return openai;
};

export const generateReactNativeCode = async (prompt: string): Promise<string> => {
  if (!openai) {
    throw new Error('OpenAI client not initialized. Call initializeOpenAI first.');
  }

  try {
    // Get configuration from environment variables with fallbacks
    const model = import.meta.env.VITE_OPENAI_MODEL || "gpt-3.5-turbo";
    const temperature = parseFloat(import.meta.env.VITE_OPENAI_TEMPERATURE || "0.7");
    const maxTokens = parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS || "4000", 10);

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `You are a senior web development expert specializing in building browser-compatible web projects using only vanilla JavaScript, HTML, and CSS.

Your task:  
Generate a complete, working web project that:

Core Requirements:
1. Uses only vanilla JavaScript, HTML5, and Tailwind CSS
2. Runs directly in browsers — no build steps, no bundlers, no frameworks
3. Includes realistic data, interactivity, and styling
4. Includes proper file separation:
   - index.html (entry point)
   - styles.css (custom styles only)
   - script.js (main JS logic)
   - Additional JS files for specific features (if needed)
   - Assets (e.g., images, icons) in assets/ folder

Strict Formatting Rules:
1. DO NOT use Markdown code formatting
2. DO NOT use triple backticks (\`\`\`) anywhere
3. Use Tailwind CSS via CDN only (no PostCSS/build tools)
4. Mark each file clearly using the format:
// FILE: filename.ext  
   Example:
// FILE: index.html

Browser Compatibility & Responsiveness:
1. Fully responsive design: mobile, tablet, desktop
2. Use Tailwind's sm:, md:, lg:, xl: for responsive behavior
3. Use Flexbox and Grid for layout
4. All content must remain legible and accessible on all screen sizes
5. Ensure all interactive elements work on touch devices

Code Quality Requirements:
1. Use clean, efficient code
2. Use clear naming for variables/functions — make the code self-explanatory
3. Write in modern ES6+ syntax, but ensure compatibility with major browsers
4. Keep comments to a minimum
   - Only include comments when logic isn't obvious from naming
   - Do not comment basic HTML/CSS/JS operations

Summary:
- The project should run immediately by opening index.html in a browser
- Do not use any frameworks or libraries (e.g., React, Vue, Angular)
- Use Tailwind CSS strictly via CDN
- Ensure a clean, professional UI with real-world relevance`
        },
        {
          role: "user",
          content: `Create a complete website project for: ${prompt}`
        }
      ],
      temperature,
      max_tokens: maxTokens
    });

    return completion.choices[0]?.message.content || 'Error: No response from OpenAI';
  } catch (error) {
    console.error('Error generating code with OpenAI:', error);
    throw new Error(`Failed to generate code: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const modifyReactNativeCode = async (existingCode: string, modificationPrompt: string): Promise<string> => {
  if (!openai) {
    throw new Error('OpenAI client not initialized. Call initializeOpenAI first.');
  }

  try {
    // Get configuration from environment variables with fallbacks
    const model = import.meta.env.VITE_OPENAI_MODEL || "gpt-3.5-turbo";
    const temperature = parseFloat(import.meta.env.VITE_OPENAI_TEMPERATURE || "0.7");
    const maxTokens = parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS || "4000", 10);

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `You are a senior web development expert specializing in vanilla JavaScript, HTML, and CSS. Your task is to modify the provided web project code exactly as requested by the user.

You MUST follow these rules:

Modification Rules:
1. Preserve the existing file structure using // FILE: filename.ext markers
2. Modify only what's needed to fulfill the request — leave all other code intact
3. Add new files if needed, using the same // FILE: marker format
4. Ensure all file connections (e.g., links, scripts) remain functional
5. Use only vanilla JavaScript, HTML5, and Tailwind CSS (via CDN)
6. Return the complete modified project, including all files (even unmodified ones)

Browser Compatibility & Responsiveness:
1. Always include an index.html file as the main entry point
2. Place all JavaScript in separate .js files
3. Place all custom styles in a styles.css file (Tailwind via CDN only)
4. Use valid semantic HTML5 elements
5. Use Tailwind's responsive utilities (sm:, md:, lg:, xl:)
6. Ensure proper layout using Flexbox and Grid
7. Ensure full functionality and layout across mobile, tablet, and desktop
8. All interactive elements must work properly on touchscreens and smaller viewports

Code Quality & Style:
1. Write clean, efficient, readable code
2. Use meaningful names for variables and functions
3. Only use comments when the logic is not obvious from naming
4. Do not explain basic HTML, CSS, or JS operations
5. Match the commenting style of the existing code
6. Use modern ES6+ syntax, but ensure browser compatibility

Required File Structure (maintain exactly):
- index.html (main entry point)
- styles.css (custom styles only)
- script.js (main logic)
- Additional .js files if needed
- All assets in an assets/ directory

DO NOT:
- Use triple backticks (\`\`\`)
- Use Markdown code formatting
- Use any frameworks or libraries (React, Vue, etc.)
- Add unnecessary comments

Return the complete updated code as plain text with all files clearly marked using // FILE: format.`
        },
        {
          role: "user",
          content: `Here is the existing vanilla JavaScript project code:\n\n${existingCode}\n\nModify this project to: ${modificationPrompt}`
        }
      ],
      temperature,
      max_tokens: maxTokens
    });

    return completion.choices[0]?.message.content || 'Error: No response from OpenAI';
  } catch (error) {
    console.error('Error modifying code with OpenAI:', error);
    throw new Error(`Failed to modify code: ${error instanceof Error ? error.message : String(error)}`);
  }
};