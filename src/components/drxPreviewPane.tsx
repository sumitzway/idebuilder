import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Typography, Box, IconButton, ToggleButtonGroup, ToggleButton, List, ListItem, ListItemText, Divider, Switch, FormControlLabel } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import TabletIcon from '@mui/icons-material/Tablet';
import LaptopIcon from '@mui/icons-material/Laptop';
import CloseIcon from '@mui/icons-material/Close';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// @ts-ignore - Ignoring type issues with react-split-pane
import SplitPane from 'react-split-pane';

interface PreviewPaneProps {
  code: string;
  refreshKey?: number;
  onRefresh?: () => void;
}

interface LogMessage {
  type: 'log' | 'error' | 'warn' | 'info';
  content: string;
  timestamp: Date;
}

// We're using an iframe with Tailwind CSS for the preview of vanilla HTML, JavaScript, and CSS

const PreviewPane = ({ code, refreshKey, onRefresh }: PreviewPaneProps) => {
  const [previewCode, setPreviewCode] = useState(code);
  const [localRefreshKey, setLocalRefreshKey] = useState(0);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(
    (import.meta.env.VITE_DEFAULT_DEVICE as 'mobile' | 'tablet' | 'desktop') || 'mobile'
  );
  const [showConsole, setShowConsole] = useState(true);
  const [logs, setLogs] = useState<LogMessage[]>([
    { type: 'info', content: 'Console initialized. Listening for logs...', timestamp: new Date() }
  ]);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [consoleHeight, setConsoleHeight] = useState(200);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Update preview code when code, refreshKey, or localRefreshKey changes
  useEffect(() => {
    // Always update the preview code when the code prop changes
    setPreviewCode(code);
  }, [code, refreshKey, localRefreshKey]);

  const handleRefresh = useCallback(() => {
    // Increment the refresh key to force a reload
    setLocalRefreshKey(prev => prev + 1);
    
    // Add a log about the refresh
    setLogs(prev => [
      ...prev,
      { type: 'info', content: 'Preview refreshed', timestamp: new Date() }
    ]);
    
    // Call the parent's onRefresh if provided
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  const handleDeviceChange = (
    event: React.MouseEvent<HTMLElement>,
    newDevice: 'mobile' | 'tablet' | 'desktop' | null,
  ) => {
    if (newDevice !== null) {
      setDeviceType(newDevice);
    }
  };

  // Helper function to extract HTML content from the code
  const extractHtmlFromCode = useCallback((code: string): string => {
    // Look for index.html which is the main entry point in vanilla JS projects
    let htmlContent = '';
    
    if (code.includes('// FILE:')) {
      // Try to find index.html first
      const htmlFileMatch = code.match(/\/\/\s*FILE:\s*index\.html\s*\n([\s\S]*?)(?=\/\/\s*FILE:|$)/i);
      if (htmlFileMatch) {
        htmlContent = htmlFileMatch[1].trim();
        
        // Extract just the body content if possible, but preserve the full structure if there are alerts
        const bodyContentMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyContentMatch) {
          const bodyContent = bodyContentMatch[1].trim();
          // Check if the body content has alerts or alert-related classes
          if (bodyContent.includes('class="alert') || 
              bodyContent.includes('class="alert-') || 
              bodyContent.includes('class="bg-red-') ||
              bodyContent.includes('class="bg-yellow-') ||
              bodyContent.includes('class="bg-green-') ||
              bodyContent.includes('alert-')) {
            // If it has alerts, return the full body content
            console.log("Alert components detected in HTML");
            return bodyContent;
          }
          return bodyContent;
        }
        
        return htmlContent;
      }
      
      // If index.html not found, look for any .html file
      const anyHtmlMatch = code.match(/\/\/\s*FILE:\s*([^\n]+\.html)\s*\n([\s\S]*?)(?=\/\/\s*FILE:|$)/i);
      if (anyHtmlMatch) {
        htmlContent = anyHtmlMatch[2].trim();
        
        // Extract just the body content if possible, but preserve the full structure if there are alerts
        const bodyContentMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyContentMatch) {
          const bodyContent = bodyContentMatch[1].trim();
          // Check if the body content has alerts or alert-related classes
          if (bodyContent.includes('class="alert') || 
              bodyContent.includes('class="alert-') || 
              bodyContent.includes('class="bg-red-') ||
              bodyContent.includes('class="bg-yellow-') ||
              bodyContent.includes('class="bg-green-') ||
              bodyContent.includes('alert-')) {
            // If it has alerts, return the full body content
            console.log("Alert components detected in HTML");
            return bodyContent;
          }
          return bodyContent;
        }
        
        return htmlContent;
      }
    }
    
    // If no HTML file is found, return a default message
    return '<div class="p-4 text-center">No HTML content found in the code</div>';
  }, []);

  // Extract JavaScript content from the code
  const extractJavaScriptFromCode = useCallback((code: string): string => {
    // Look for script.js file
    if (code.includes('// FILE:')) {
      const jsFileMatch = code.match(/\/\/\s*FILE:\s*script\.js\s*\n([\s\S]*?)(?=\/\/\s*FILE:|$)/i);
      if (jsFileMatch) {
        return jsFileMatch[1].trim();
      }
      
      // If script.js not found, look for any .js file
      const anyJsMatch = code.match(/\/\/\s*FILE:\s*([^\n]+\.js)\s*\n([\s\S]*?)(?=\/\/\s*FILE:|$)/i);
      if (anyJsMatch) {
        return anyJsMatch[2].trim();
      }
    }
    
    return '';
  }, []);

  // Extract CSS content from the code
  const extractCssFromCode = useCallback((code: string): string => {
    // Look for styles.css file
    if (code.includes('// FILE:')) {
      const cssFileMatch = code.match(/\/\/\s*FILE:\s*styles\.css\s*\n([\s\S]*?)(?=\/\/\s*FILE:|$)/i);
      if (cssFileMatch) {
        return cssFileMatch[1].trim();
      }
      
      // If styles.css not found, look for any .css file
      const anyCssMatch = code.match(/\/\/\s*FILE:\s*([^\n]+\.css)\s*\n([\s\S]*?)(?=\/\/\s*FILE:|$)/i);
      if (anyCssMatch) {
        return anyCssMatch[2].trim();
      }
    }
    
    return '';
  }, []);

  // Function to create an iframe with the extracted HTML, JavaScript, and CSS
  const createIframeContent = useCallback((code: string): string => {
    // Extract HTML from the code
    const htmlContent = extractHtmlFromCode(code);
    
    // Determine if we should use a fallback template
    const shouldUseFallback = htmlContent.includes('No HTML content found');
    
    // If we couldn't extract HTML, use a fallback based on keywords
    let finalHtml = htmlContent;
    
    if (shouldUseFallback) {
      // Analyze the code to determine what kind of component it is
      const isLoginComponent = code.toLowerCase().includes('login') || code.toLowerCase().includes('sign in');
      const isFormComponent = code.toLowerCase().includes('form') || code.toLowerCase().includes('input');
      const isListComponent = code.toLowerCase().includes('list') || code.toLowerCase().includes('items');
      const isDashboardComponent = code.toLowerCase().includes('dashboard') || code.toLowerCase().includes('analytics');
      
      if (isLoginComponent) {
        finalHtml = `
          <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email">
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input type="password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your password">
              </div>
              <button class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Sign In</button>
              <div class="text-center mt-4">
                <a href="#" class="text-sm text-blue-500 hover:underline">Forgot password?</a>
              </div>
            </div>
          </div>
        `;
      } else if (isFormComponent) {
        finalHtml = `
          <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Contact Form</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your name">
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email">
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Message</label>
                <textarea class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="4" placeholder="Enter your message"></textarea>
              </div>
              <button class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Submit</button>
            </div>
          </div>
        `;
      } else if (isListComponent) {
        finalHtml = `
          <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Item List</h2>
            <ul class="divide-y divide-gray-200">
              <li class="py-4 flex">
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">Item 1</p>
                  <p class="text-sm text-gray-500">Description for item 1</p>
                </div>
              </li>
              <li class="py-4 flex">
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">Item 2</p>
                  <p class="text-sm text-gray-500">Description for item 2</p>
                </div>
              </li>
              <li class="py-4 flex">
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">Item 3</p>
                  <p class="text-sm text-gray-500">Description for item 3</p>
                </div>
              </li>
            </ul>
          </div>
        `;
      } else if (isDashboardComponent) {
        finalHtml = `
          <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Dashboard</h2>
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-white p-4 rounded-lg shadow">
                <p class="text-sm text-gray-500">Total Users</p>
                <p class="text-2xl font-bold">1,234</p>
                <p class="text-sm text-green-500">+5.3%</p>
              </div>
              <div class="bg-white p-4 rounded-lg shadow">
                <p class="text-sm text-gray-500">Revenue</p>
                <p class="text-2xl font-bold">$12,345</p>
                <p class="text-sm text-red-500">-2.1%</p>
              </div>
              <div class="bg-white p-4 rounded-lg shadow">
                <p class="text-sm text-gray-500">Conversion Rate</p>
                <p class="text-2xl font-bold">12.3%</p>
                <p class="text-sm text-green-500">+1.2%</p>
              </div>
              <div class="bg-white p-4 rounded-lg shadow">
                <p class="text-sm text-gray-500">Active Sessions</p>
                <p class="text-2xl font-bold">432</p>
                <p class="text-sm text-green-500">+8.7%</p>
              </div>
            </div>
          </div>
        `;
      } else {
        // Default component preview
        finalHtml = `
          <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Vanilla JavaScript App</h2>
            <div class="text-center">
              <p class="mb-4">Count: 0</p>
              <div class="flex justify-center space-x-4">
                <button class="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">Decrease</button>
                <button class="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">Increase</button>
              </div>
            </div>
          </div>
        `;
      }
    }
    
    return finalHtml;
  }, []);

  // Create the iframe HTML content with Tailwind CSS and the extracted JavaScript and CSS
  const createIframeHTML = useCallback((content: string, code: string): string => {
    // Extract Tailwind CSS classes from the code to ensure they're available in the preview
    const tailwindClasses = content.match(/class=["']([^"']*?)["']/g) || [];
    const extractedClasses = tailwindClasses.map(match => {
      const classMatch = match.match(/class=["']([^"']*?)["']/);
      return classMatch ? classMatch[1] : '';
    }).join(' ');
    
    // Extract JavaScript and CSS from the code
    const jsContent = extractJavaScriptFromCode(code);
    const cssContent = extractCssFromCode(code);
    
    // Add additional alert-related classes to ensure they're included
    const additionalClasses = `
      alert alert-primary alert-secondary alert-success alert-danger alert-warning alert-info alert-light alert-dark
      bg-blue-100 bg-red-100 bg-yellow-100 bg-green-100 bg-gray-100
      text-blue-700 text-red-700 text-yellow-700 text-green-700 text-gray-700
      border-blue-500 border-red-500 border-yellow-500 border-green-500 border-gray-500
    `;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { 
            font-family: 'Inter', sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc; 
            color: #1e293b;
          }
          .preview-container { 
            padding: 1rem; 
            min-height: 100vh;
          }
          /* Add a hidden div with all extracted Tailwind classes to ensure they're compiled */
          .tailwind-classes { display: none; }
          
          /* Common utility classes */
          .btn, .button { display: inline-block; padding: 0.5rem 1rem; border-radius: 0.25rem; }
          .btn-primary, .button-primary { background-color: #3b82f6; color: white; }
          .card { background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
          
          /* Alert styles */
          .alert {
            position: relative;
            padding: 0.75rem 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid transparent;
            border-radius: 0.25rem;
          }
          .alert-success {
            color: #155724;
            background-color: #d4edda;
            border-color: #c3e6cb;
          }
          .alert-info {
            color: #0c5460;
            background-color: #d1ecf1;
            border-color: #bee5eb;
          }
          .alert-warning {
            color: #856404;
            background-color: #fff3cd;
            border-color: #ffeeba;
          }
          .alert-danger, .alert-error {
            color: #721c24;
            background-color: #f8d7da;
            border-color: #f5c6cb;
          }
          .alert-primary {
            color: #004085;
            background-color: #cce5ff;
            border-color: #b8daff;
          }
          .alert-secondary {
            color: #383d41;
            background-color: #e2e3e5;
            border-color: #d6d8db;
          }
          
          /* Bootstrap-compatible alerts */
          .alert-dismissible {
            padding-right: 4rem;
          }
          .alert-dismissible .close {
            position: absolute;
            top: 0;
            right: 0;
            padding: 0.75rem 1.25rem;
            color: inherit;
            background: transparent;
            border: 0;
            cursor: pointer;
          }
          .close {
            float: right;
            font-size: 1.5rem;
            font-weight: 700;
            line-height: 1;
            color: #000;
            text-shadow: 0 1px 0 #fff;
            opacity: .5;
          }
          .close:hover {
            color: #000;
            text-decoration: none;
            opacity: .75;
          }
          
          /* For modern Tailwind alerts */
          .bg-red-100 { background-color: #fee2e2 !important; }
          .bg-yellow-100 { background-color: #fef3c7 !important; }
          .bg-green-100 { background-color: #d1fae5 !important; }
          .bg-blue-100 { background-color: #dbeafe !important; }
          
          .text-red-700 { color: #b91c1c !important; }
          .text-yellow-700 { color: #a16207 !important; }
          .text-green-700 { color: #047857 !important; }
          .text-blue-700 { color: #1d4ed8 !important; }
          
          /* Custom CSS from the generated code */
          ${cssContent}
        </style>
      </head>
      <body>
        <div class="preview-container">
          ${content}
        </div>
        <!-- Hidden div with all extracted classes to ensure Tailwind processes them -->
        <div class="tailwind-classes ${extractedClasses} ${additionalClasses}"></div>
        
        <!-- JavaScript from the generated code -->
        <script>
          // Override console methods to capture logs
          (function() {
            const originalConsole = {
              log: console.log,
              error: console.error,
              warn: console.warn,
              info: console.info
            };
            
            // Function to send logs to parent window
            function sendLogToParent(type, args) {
              try {
                window.parent.postMessage({
                  type: 'console',
                  logType: type,
                  content: Array.from(args).map(arg => {
                    try {
                      return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                    } catch (e) {
                      return String(arg);
                    }
                  }).join(' ')
                }, '*');
              } catch (e) {
                originalConsole.error('Failed to send log to parent:', e);
              }
            }
            
            // Override console methods
            console.log = function() { 
              sendLogToParent('log', arguments);
              originalConsole.log.apply(console, arguments);
            };
            console.error = function() {
              sendLogToParent('error', arguments);
              originalConsole.error.apply(console, arguments);
            };
            console.warn = function() {
              sendLogToParent('warn', arguments);
              originalConsole.warn.apply(console, arguments);
            };
            console.info = function() {
              sendLogToParent('info', arguments);
              originalConsole.info.apply(console, arguments);
            };
          })();
          
          // Add some test console messages
          console.log('Preview initialized');
          console.info('DOM content loaded');
          
          document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM fully loaded and parsed');
            
            // Initialize alert components if they exist
            const customAlertInit = () => {
              // Find all alerts by various class patterns
              const alertSelectors = [
                '[class*="alert-"]',
                '[class*="bg-red-"]',
                '[class*="bg-yellow-"]', 
                '[class*="bg-green-"]',
                '[class*="bg-blue-"]',
                '.notification',
                '.message-error',
                '.message-warning',
                '.message-success',
                '.message-info'
              ];
              
              // Process each selector
              alertSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                  // If it doesn't already have the alert class, add it
                  if (!el.classList.contains('alert')) {
                    el.classList.add('alert');
                  }
                  
                  console.log('Alert found and initialized:', el.outerHTML);
                });
              });
              
              // Create dismiss buttons for alerts that don't have them
              document.querySelectorAll('.alert').forEach(alert => {
                // Check if this alert is dismissible but doesn't have a close button
                if (alert.classList.contains('alert-dismissible') && 
                    !alert.querySelector('.close')) {
                  const closeBtn = document.createElement('button');
                  closeBtn.className = 'close';
                  closeBtn.setAttribute('type', 'button');
                  closeBtn.innerHTML = '&times;';
                  closeBtn.addEventListener('click', function() {
                    alert.style.display = 'none';
                  });
                  alert.appendChild(closeBtn);
                }
              });
              
              // Add click handlers for existing alert close buttons
              document.querySelectorAll('.alert .close').forEach(button => {
                button.addEventListener('click', function() {
                  const alert = this.closest('.alert');
                  if (alert) {
                    alert.style.display = 'none';
                  }
                });
              });
            };
            
            // Run custom alert initialization
            customAlertInit();
            
            // Run the JavaScript from the generated code
            ${jsContent}
            
            // Add event listeners to log button clicks
            document.querySelectorAll('button').forEach(btn => {
              btn.addEventListener('click', function() {
                console.log('Button clicked:', this.textContent);
              });
            });
            
            // Test warning and error
            console.warn('Resource loading warning: Font "Inter" not available, using fallback');
            setTimeout(() => {
              console.error('Failed to load resource: net::ERR_NAME_NOT_RESOLVED');
            }, 500);
          });
        </script>
      </body>
      </html>
    `;
  }, [extractJavaScriptFromCode, extractCssFromCode]);

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'console') {
        setLogs(prev => [
          ...prev, 
          {
            type: event.data.logType,
            content: event.data.content,
            timestamp: new Date()
          }
        ]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Use useMemo to optimize rendering performance
  const previewContent = useMemo(() => {
    console.log("Rendering preview with code:", previewCode.substring(0, 50) + "...");
    
    if (!previewCode) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          Core preview will be rendered here
        </Typography>
      );
    }

    // Create an iframe to display the preview
    const htmlContent = createIframeContent(previewCode);
    const htmlDocument = createIframeHTML(htmlContent, previewCode);
    
    // Different device style configurations
    const deviceStyles = {
      mobile: {
        container: {
          width: '320px',
          height: '650px',
          borderRadius: '36px',
          border: '14px solid #111',
          boxShadow: '0 0 20px rgba(0,0,0,0.2)',
          bgcolor: '#111'
        },
        notch: {
          display: 'flex',
          width: '150px',
          height: '28px',
          borderBottomLeftRadius: '14px',
          borderBottomRightRadius: '14px',
        },
        homeIndicator: {
          display: 'block',
          width: '120px',
          height: '5px',
        }
      },
      tablet: {
        container: {
          width: '500px',
          height: '700px',
          borderRadius: '24px',
          border: '16px solid #111',
          boxShadow: '0 0 20px rgba(0,0,0,0.2)',
          bgcolor: '#111'
        },
        notch: {
          display: 'none',
        },
        homeIndicator: {
          display: 'block',
          width: '150px',
          height: '5px',
        }
      },
      desktop: {
        container: {
          width: '900px',
          height: '550px',
          borderRadius: '8px',
          border: '16px solid #111',
          borderBottom: '40px solid #111',
          boxShadow: '0 0 20px rgba(0,0,0,0.2)',
          bgcolor: '#111'
        },
        notch: {
          display: 'none',
        },
        homeIndicator: {
          display: 'none',
        }
      }
    };
    
    const currentDevice = deviceStyles[deviceType];
    
    return (
      <Box sx={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden', 
        flexGrow: 1, 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}>
        <Box sx={{
          ...currentDevice.container,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Device top notch */}
          {currentDevice.notch.display !== 'none' && (
            <Box sx={{
              ...currentDevice.notch,
              bgcolor: '#111',
              mx: 'auto',
              mt: '-1px',
              position: 'relative',
              zIndex: 1,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Box sx={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                bgcolor: '#444',
                mx: 1 
              }} />
            </Box>
          )}
          
          {/* Device content */}
          <Box sx={{ 
            flexGrow: 1, 
            bgcolor: 'white', 
            overflow: 'hidden',
            borderRadius: '1px'
          }}>
            <iframe
              ref={iframeRef}
              srcDoc={htmlDocument}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              title="Preview"
              sandbox="allow-scripts allow-forms allow-modals"
            />
          </Box>
          
          {/* Home indicator bar */}
          {currentDevice.homeIndicator.display !== 'none' && (
            <Box sx={{
              ...currentDevice.homeIndicator,
              bgcolor: '#444',
              borderRadius: '3px',
              mx: 'auto',
              mb: 1,
              mt: 1
            }} />
          )}
        </Box>
      </Box>
    );
  }, [previewCode, localRefreshKey, createIframeContent, createIframeHTML, deviceType]);

  const clearLogs = () => {
    setLogs([
      { type: 'info', content: 'Console cleared', timestamp: new Date() }
    ]);
  };

  // Toggle console visibility
  const toggleConsole = () => {
    setShowConsole(!showConsole);
  };

  // Handle console resize
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // Get the container element's height for relative calculations
    const containerHeight = document.body.clientHeight;
    const startY = e.clientY;
    const startHeight = consoleHeight;
    
    // Add a visual indicator during resize
    document.body.style.cursor = 'ns-resize';
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      // Calculate deltaY with respect to the starting position
      const deltaY = startY - moveEvent.clientY;
      
      // Get a percentage of the container height for responsive resizing
      // with min/max constraints (100px minimum, 80% of container maximum)
      const maxHeight = Math.floor(containerHeight * 0.8);
      const newHeight = Math.min(Math.max(startHeight + deltaY, 100), maxHeight);
      
      // Update the state
      setConsoleHeight(newHeight);
      
      // Prevent selection during resize
      moveEvent.preventDefault();
    };
    
    const onMouseUp = () => {
      // Clean up
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
    };
    
    // Attach events to document to capture mouse movement even outside the element
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [consoleHeight]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 2, pb: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
          Live Preview
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ToggleButtonGroup
            size="small"
            value={deviceType}
            exclusive
            onChange={handleDeviceChange}
            aria-label="device type"
            sx={{ mr: 1 }}
          >
            <ToggleButton value="mobile" aria-label="mobile view">
              <SmartphoneIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="tablet" aria-label="tablet view">
              <TabletIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="desktop" aria-label="desktop view">
              <LaptopIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          <IconButton 
            onClick={toggleConsole} 
            size="small" 
            title={showConsole ? "Hide console" : "Show console"} 
            color="primary"
          >
            <BugReportIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        flexGrow: 1, 
        height: showConsole ? `calc(100% - ${consoleHeight}px)` : '100%', 
        transition: 'height 0.3s ease' 
      }}>
        <Box sx={{
          height: '100%',
          bgcolor: 'background.paper',
          display: 'flex',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {previewContent}
        </Box>
      </Box>
      
      {showConsole && (
        <>
          <Box 
            sx={{
              height: '8px', // Increased height for easier grabbing
              bgcolor: 'rgba(0,0,0,0.2)',
              cursor: 'ns-resize',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              '&:hover': {
                bgcolor: 'primary.main',
                opacity: 0.7
              },
              '&:active': {
                bgcolor: 'primary.dark',
                opacity: 0.8
              },
              // Visual indicator to show it's draggable
              '&::after': {
                content: '""',
                display: 'block',
                width: '50px',
                height: '4px',
                borderRadius: '2px',
                bgcolor: 'rgba(255,255,255,0.3)'
              }
            }}
            onMouseDown={startResize}
          />
          <Box
            sx={{
              height: `${consoleHeight - 8}px`, // Adjust for the new handle height
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#1e1e1e',
              color: '#fff',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              position: 'relative'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              p: 1, 
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              bgcolor: 'rgba(0,0,0,0.2)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DragHandleIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.6)' }} />
                <Typography variant="subtitle2" component="div" sx={{ fontWeight: 'bold' }}>
                  Developer Console <Typography variant="caption" sx={{ opacity: 0.7 }}>(drag handle to resize)</Typography>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ mr: 2, color: 'rgba(255,255,255,0.7)' }}>
                  {`${consoleHeight}px`}
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={showTimestamps}
                      onChange={(e) => setShowTimestamps(e.target.checked)}
                      sx={{ 
                        '& .MuiSwitch-thumb': { bgcolor: '#fff' },
                        '& .MuiSwitch-track': { bgcolor: 'rgba(255,255,255,0.3)' }
                      }}
                    />
                  }
                  label={<Typography variant="caption">Timestamps</Typography>}
                  sx={{ mr: 2, color: 'rgba(255,255,255,0.7)' }}
                />
                <IconButton 
                  size="small" 
                  onClick={clearLogs}
                  sx={{ color: '#fff', mr: 1 }}
                  title="Clear console"
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={toggleConsole}
                  sx={{ color: '#fff' }}
                  title="Hide console"
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Box>
            </Box>
            <List sx={{ overflow: 'auto', p: 1, flexGrow: 1 }}>
              {logs.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary="No logs to display" 
                    sx={{ opacity: 0.5, fontStyle: 'italic' }}
                  />
                </ListItem>
              ) : (
                logs.map((log, index) => {
                  // Determine log badge background color
                  const badgeBgColor = 
                    log.type === 'error' ? 'rgba(255,107,107,0.2)' : 
                    log.type === 'warn' ? 'rgba(255,193,7,0.2)' : 
                    log.type === 'info' ? 'rgba(3,169,244,0.2)' : 'transparent';
                  
                  // Determine text color
                  const textColor = 
                    log.type === 'error' ? '#ff6b6b' : 
                    log.type === 'warn' ? '#ffc107' : 
                    log.type === 'info' ? '#03a9f4' : '#fff';
                  
                  // Format content - try to parse JSON if applicable
                  let content = log.content;
                  if (content.startsWith('{') || content.startsWith('[')) {
                    try {
                      const jsonObj = JSON.parse(content);
                      content = JSON.stringify(jsonObj, null, 2);
                    } catch (e) {
                      // Keep original content if parsing fails
                    }
                  }
                  
                  return (
                    <React.Fragment key={index}>
                      <ListItem sx={{ 
                        py: 0.5,
                        color: textColor,
                        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                        fontSize: '0.85rem',
                        borderLeft: '3px solid',
                        borderLeftColor: textColor,
                        pl: 1,
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.05)'
                        }
                      }}>
                        <ListItemText 
                          disableTypography
                          primary={
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                {showTimestamps && (
                                  <span style={{ opacity: 0.7, marginRight: '8px', fontSize: '0.75rem' }}>
                                    [{log.timestamp.toLocaleTimeString('en-US', { hour12: false })}]
                                  </span>
                                )}
                                <span style={{ 
                                  fontWeight: 'bold',
                                  marginRight: '8px',
                                  fontSize: '0.75rem',
                                  textTransform: 'uppercase',
                                  backgroundColor: badgeBgColor,
                                  paddingLeft: '4px',
                                  paddingRight: '4px',
                                  borderRadius: '2px'
                                }}>
                                  {log.type}
                                </span>
                                <span style={{ 
                                  wordBreak: 'break-word',
                                  fontWeight: log.type === 'error' ? 'bold' : 'normal',
                                  whiteSpace: 'pre-wrap'
                                }}>
                                  {content}
                                </span>
                              </div>
                            </div>
                          }
                        />
                      </ListItem>
                      {index < logs.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
                    </React.Fragment>
                  );
                })
              )}
            </List>
          </Box>
        </>
      )}
    </Box>
  );
};

export default PreviewPane; 