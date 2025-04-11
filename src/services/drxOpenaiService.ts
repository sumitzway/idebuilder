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
          content: `You are a web development expert specializing in creating vanilla JavaScript, HTML, and CSS projects that run directly in browsers without build steps. Generate a complete web project based on the user's prompt.
IMPORTANT: Do NOT use Markdown code formatting. Do NOT use triple backticks (\`\`\` or \`\`\`) under any circumstances.
Your response MUST follow these rules:
1. Create a complete, working project using only vanilla JavaScript, HTML, and CSS
2. Do NOT use any frameworks like React, Vue, Angular, or Next.js
3. Use Tailwind CSS for styling (via CDN link)
4. Format your response with clear file markers using the format: // FILE: filename.ext
5. Add realistic data and functionality
6. Keep comments minimal - only add comments when absolutely necessary for clarity
7. Ensure the code works directly in browsers without any build steps

CRITICAL REQUIREMENTS FOR BROWSER COMPATIBILITY AND RESPONSIVENESS:
1. ALWAYS include an index.html file as the main entry point
2. Include all JavaScript in separate .js files
3. Include all CSS in separate .css files (except Tailwind)
4. Use standard Tailwind CSS classes for styling
5. Use proper HTML5 semantic elements
6. Ensure all JavaScript is properly scoped and organized
7. Use ES6+ features but ensure browser compatibility
8. Include the Tailwind CSS CDN in the HTML file
9. Make ALL pages FULLY RESPONSIVE for mobile, tablet, and desktop
10. Use Tailwind's responsive design utilities (sm:, md:, lg:, xl:) for different screen sizes
11. Use flex and grid layouts for responsive structures
12. Ensure text is readable on all device sizes
13. Test all interactive elements work on touch screens and smaller viewports

IMPORTANT CODE STYLE REQUIREMENTS:
1. Write clean, efficient code with minimal comments
2. Your code should be self-explanatory through good naming conventions
3. Only add comments for complex logic that cannot be understood from variable/function names
4. Avoid explaining obvious operations with comments
5. Focus on writing clear, readable code rather than extensively documented code

File structure should include:
- index.html (main entry point)
- styles.css (custom styles)
- script.js (main JavaScript file)
- Additional JS files for specific functionality
- Any necessary assets (in an assets/ directory)

Each file should be complete and properly formatted with the file marker.`
        },
        {
          role: "user",
          content: `Create a complete vanilla JavaScript web project for: ${prompt}`
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
          content: `You are a web development expert specializing in vanilla JavaScript, HTML, and CSS. Modify the provided web project code according to the user's request.

Your response MUST follow these rules:
1. Preserve the existing file structure with // FILE: markers
2. Modify the files as requested by the user
3. You can add new files if needed using the // FILE: marker format
4. Make sure all connections between files remain working
5. Use only vanilla JavaScript, HTML, and CSS with Tailwind (via CDN)
6. Return the complete modified project with all files
7. Keep comments minimal - only add comments when absolutely necessary for clarity

CRITICAL REQUIREMENTS FOR BROWSER COMPATIBILITY AND RESPONSIVENESS:
1. ALWAYS include an index.html file as the main entry point
2. Include all JavaScript in separate .js files
3. Include all CSS in separate .css files (except Tailwind)
4. Use standard Tailwind CSS classes for styling
5. Use proper HTML5 semantic elements
6. Ensure all JavaScript is properly scoped and organized
7. Use ES6+ features but ensure browser compatibility
8. Include the Tailwind CSS CDN in the HTML file
9. Make ALL pages FULLY RESPONSIVE for mobile, tablet, and desktop
10. Use Tailwind's responsive design utilities (sm:, md:, lg:, xl:) for different screen sizes
11. Use flex and grid layouts for responsive structures
12. Ensure text is readable on all device sizes
13. Test all interactive elements work on touch screens and smaller viewports

IMPORTANT CODE STYLE REQUIREMENTS:
1. Write clean, efficient code with minimal comments
2. Your code should be self-explanatory through good naming conventions
3. Only add comments for complex logic that cannot be understood from variable/function names
4. Avoid explaining obvious operations with comments
5. Focus on writing clear, readable code rather than extensively documented code
6. Match the existing commenting style of the code you're modifying

File structure should be maintained as:
- index.html (main entry point)
- styles.css (custom styles)
- script.js (main JavaScript file)
- Additional JS files for specific functionality
- Any necessary assets (in an assets/ directory)

Each file should be complete and properly formatted with the file marker. Do not use triple backticks or Markdown formatting of any kind under any circumstances.
`
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