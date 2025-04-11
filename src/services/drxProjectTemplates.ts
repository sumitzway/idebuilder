/**
 * Project templates for vanilla JavaScript, HTML, and CSS code generation
 * This file contains template functions for generating different types of web projects
 */

// Generate HTML file
export function generateHtmlFile(projectName: string): string {
  return `// FILE: index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-gray-100 min-h-screen">
  <header class="bg-white shadow-sm">
    <nav class="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between">
      <div class="font-bold text-xl text-blue-600">${projectName}</div>
      <button id="mobile-menu-button" class="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
      <div id="menu-items" class="hidden md:flex w-full md:w-auto md:flex-grow-0 mt-2 md:mt-0">
        <ul class="flex flex-col md:flex-row md:space-x-8 mt-4 md:mt-0 md:text-sm md:font-medium">
          <li><a href="#" class="block py-2 px-3 md:p-0 text-blue-600">Home</a></li>
          <li><a href="#" class="block py-2 px-3 md:p-0 text-gray-700 hover:text-blue-600">Features</a></li>
          <li><a href="#" class="block py-2 px-3 md:p-0 text-gray-700 hover:text-blue-600">About</a></li>
          <li><a href="#" class="block py-2 px-3 md:p-0 text-gray-700 hover:text-blue-600">Contact</a></li>
        </ul>
      </div>
    </nav>
  </header>
  
  <main class="container mx-auto px-4 py-8">
    <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8">${projectName}</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div id="content" class="bg-white rounded-lg shadow-md p-6 md:col-span-2 lg:col-span-3">
        <!-- Content will be loaded here -->
        <p class="text-gray-700">Loading content...</p>
      </div>
    </div>
  </main>
  
  <footer class="bg-white shadow-inner mt-12 py-6">
    <div class="container mx-auto px-4 text-center text-gray-500 text-sm">
      <p>&copy; ${new Date().getFullYear()} ${projectName}. All rights reserved.</p>
    </div>
  </footer>
  
  <script src="script.js"></script>
</body>
</html>`;
}

// Generate JavaScript file
export function generateJavaScriptFile(projectName: string): string {
  return `// FILE: script.js
// Main JavaScript file for ${projectName}

document.addEventListener('DOMContentLoaded', () => {
  const contentElement = document.getElementById('content');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const menuItems = document.getElementById('menu-items');
  
  initApp();
  
  function initApp() {
    renderWelcomeMessage();
    setupEventListeners();
    handleResponsiveLayout();
  }
  
  function renderWelcomeMessage() {
    contentElement.innerHTML = \`
      <div class="text-center">
        <h2 class="text-xl sm:text-2xl font-bold mb-4">Welcome to ${projectName}</h2>
        <p class="text-gray-700 mb-6">This is a responsive vanilla JavaScript application with Tailwind CSS.</p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button id="actionButton" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-all">
            Click Me
          </button>
          <button id="secondaryButton" class="bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 font-bold py-2 px-4 rounded transition-all">
            Learn More
          </button>
        </div>
        <div id="counter" class="mt-4 text-lg font-semibold">Count: 0</div>
      </div>
    \`;
  }
  
  function setupEventListeners() {
    if (mobileMenuButton) {
      mobileMenuButton.addEventListener('click', () => {
        menuItems.classList.toggle('hidden');
      });
    }
    
    setTimeout(() => {
      const actionButton = document.getElementById('actionButton');
      const secondaryButton = document.getElementById('secondaryButton');
      let count = 0;
      
      if (actionButton) {
        actionButton.addEventListener('click', () => {
          count++;
          const counterElement = document.getElementById('counter');
          if (counterElement) {
            counterElement.textContent = \`Count: \${count}\`;
          }
        });
      }
      
      if (secondaryButton) {
        secondaryButton.addEventListener('click', () => {
          alert('Thanks for your interest! This is a responsive web application.');
        });
      }
    }, 0);
  }
  
  function handleResponsiveLayout() {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        menuItems.classList.remove('hidden');
      } else {
        menuItems.classList.add('hidden');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
  }
});`;
}

// Generate CSS file
export function generateCssFile(): string {
  return `// FILE: styles.css
/* Custom styles for the application */

:root {
  --primary-color: #4f46e5;
  --secondary-color: #6366f1;
  --text-color: #333333;
  --background-color: #f9fafb;
}

body {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: var(--text-color);
  line-height: 1.6;
  transition: all 0.3s ease;
}

.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.custom-button {
  transition: all 0.3s ease;
}

.custom-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

@media (max-width: 640px) {
  body {
    font-size: 14px;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  body {
    font-size: 15px;
  }
}

@media (min-width: 769px) {
  body {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  button, 
  a, 
  input[type="button"], 
  input[type="submit"] {
    min-height: 44px;
    min-width: 44px;
  }
}
`;
}

// Generate README file
export function generateReadmeFile(projectName: string): string {
  return `// FILE: README.md
# ${projectName}

A responsive vanilla JavaScript web application with Tailwind CSS styling.

## Features

- Modern JavaScript (ES6+) syntax
- Tailwind CSS for styling
- Fully responsive design for mobile, tablet, and desktop
- Mobile navigation menu
- Touch-friendly interface
- No build step required

## Getting Started

Simply open the index.html file in your browser to run the application.

## Project Structure

- index.html - Main entry point
- script.js - JavaScript functionality
- styles.css - Custom CSS styles

## Responsive Design

This project implements responsive design with:
- Tailwind's responsive utilities (sm:, md:, lg:, xl:)
- Custom media queries
- Flexible layouts
- Mobile-first approach
`;
}

// Generate a complete project with all files
export function generateCompleteProject(projectName: string): Record<string, string> {
  return {
    'index.html': generateHtmlFile(projectName),
    'script.js': generateJavaScriptFile(projectName),
    'styles.css': generateCssFile(),
    'README.md': generateReadmeFile(projectName)
  };
}
