import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Grid, Paper, Alert, CircularProgress, Typography, IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
// @ts-ignore - Ignoring type issues with react-split-pane
import SplitPane from 'react-split-pane';

import PromptPane from './components/drxPromptPane';
import CodeEditor from './components/drxCodeEditor';
import PreviewPane from './components/drxPreviewPane';

import { generateReactNativeCode as generateAICode, modifyReactNativeCode as modifyAICode, initializeOpenAI } from './services/drxOpenaiService';
import {
  generateHtmlFile,
  generateJavaScriptFile,
  generateCssFile,
  generateReadmeFile
} from './services/drxProjectTemplates';

// Add type definition for SplitPane props
interface SplitPaneProps {
  split: 'vertical' | 'horizontal';
  minSize: number;
  defaultSize: string | number;
  style?: React.CSSProperties;
  pane1Style?: React.CSSProperties;
  pane2Style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * Generates fallback vanilla JavaScript code when no API key is set
 * @param promptText The user's prompt text
 * @returns Generated code as a string
 */
function generateFallbackCode(promptText: string): string {
  // Extract project name from prompt if possible
  const nameMatch = promptText.match(/([a-zA-Z]+)(?:\s+project|\s+app|\s+website)?/i);
  let projectName = nameMatch ? nameMatch[1] : 'WebApp';
  projectName = projectName.charAt(0).toUpperCase() + projectName.slice(1);

  // Generate a complete project with all files
  const projectFiles = [];
  
  // Add HTML file
  projectFiles.push(generateHtmlFile(projectName));
  
  // Add JavaScript file
  projectFiles.push(generateJavaScriptFile(projectName));
  
  // Add CSS file
  projectFiles.push(generateCssFile());
  
  // Add README file
  projectFiles.push(generateReadmeFile(projectName));
  
  // Combine all files with file markers
  return projectFiles.join('\n\n');
}

/**
 * Common CSS styles used in generated vanilla JavaScript components
 * This is exported so it can be used by the fallback code generator
 */
export const commonCssStyles = `/* Common styles for vanilla JavaScript components */
.button {
  background-color: #4f46e5;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: #4338ca;
}

.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f9fafb;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  max-width: 32rem;
  width: 100%;
  text-align: center;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
}

.description {
  color: #6b7280;
  margin-bottom: 2rem;
}`;

/**
 * Main App component
 */
function App() {
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  // Track prompt history to enable incremental modifications
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  // Theme state based on environment variable
  const [darkMode, setDarkMode] = useState<boolean>(
    import.meta.env.VITE_DEFAULT_THEME === 'dark'
  );

  // Initialize OpenAI with API key from environment variables
  useEffect(() => {
    // Try with multiple environment variable formats
    const agentKey = import.meta.env.AGENT_OPENAI_API_KEY;
    const viteKey = import.meta.env.VITE_AGENT_OPENAI_API_KEY;
    
    // Use either key that's available
    const apiKey = agentKey || viteKey;
    
    // Debug: Log all available environment variables
    console.log('Environment variables:', import.meta.env);
    console.log('API Key exists:', !!apiKey);
    
    // Get application configuration from environment variables
    const appName = import.meta.env.VITE_APP_NAME || 'IDEBuilder';
    const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
    console.log(`Initializing ${appName} v${appVersion}`);
    
    if (apiKey) {
      try {
        initializeOpenAI(apiKey);
        setIsApiKeySet(true);
        console.log('OpenAI API initialized successfully');
      } catch (err) {
        console.error('Failed to initialize OpenAI:', err);
        setError('Failed to initialize OpenAI API. Check your API key.');
      }
    } else {
      console.warn('No OpenAI API key found in environment variables. Using fallback code generation.');
    }
  }, []);

  // Set dark mode data attribute when darkMode state changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Create theme based on darkMode state
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  /**
   * Handles prompt submission from the PromptPane component
   * @param prompt The user's prompt text
   * @param isModification Whether this is a modification to existing code
   */
  const handlePromptSubmit = async (prompt: string, isModification: boolean) => {
    setError(null);
    setIsLoading(true);
    
    try {
      let code: string;
      
      // Add the prompt to history regardless of whether it's a modification or new generation
      setPromptHistory(prev => [...prev, prompt]);
      
      if (!isApiKeySet) {
        // Use fallback code generation if API key is not set
        code = generateFallbackCode(prompt);
      } else if (isModification && generatedCode) {
        // Modify existing code - always use the current generatedCode
        // This ensures modifications are cumulative
        code = await modifyAICode(generatedCode, prompt);
      } else {
        // Generate new code
        code = await generateAICode(prompt);
      }
      
      setGeneratedCode(code);
      // Refresh the preview after code generation
      handleRefreshPreview();
    } catch (err) {
      console.error('Error generating code:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate code');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles code changes from the CodeEditor component
   * @param newCode The updated code from the editor
   */
  const handleCodeChange = (newCode: string) => {
    setGeneratedCode(newCode);
    // When code is changed, we should refresh the preview
    handleRefreshPreview();
  };

  /**
   * Refreshes the preview by incrementing the refresh key
   * This forces the PreviewPane component to re-render
   */
  const handleRefreshPreview = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Split pane style overrides for consistent appearance
  const splitPaneStyle = {
    height: '100%',
    position: 'relative' as const
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth={false} sx={{ height: '100vh', p: 0 }}>
        <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 1,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {import.meta.env.VITE_APP_NAME || 'IDEBuilder'}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={`${showPreview ? 'Hide' : 'Show'} preview pane`}>
                <IconButton onClick={() => setShowPreview(!showPreview)} color="inherit">
                  {showPreview ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}>
                <IconButton onClick={toggleTheme} color="inherit">
                  {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 0 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ 
            height: error 
              ? `calc(100% - ${darkMode ? '89px' : '88px'})` 
              : `calc(100% - ${darkMode ? '57px' : '56px'})` 
          }}>
            {/* @ts-ignore */}
            <SplitPane 
              split="vertical" 
              minSize={300} 
              defaultSize="33%" 
              style={splitPaneStyle}
              pane1Style={{ overflow: 'hidden' }}
            >
              <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {isLoading && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 1
                  }}>
                    <CircularProgress />
                  </Box>
                )}
                <PromptPane 
                  onPromptSubmit={handlePromptSubmit}
                  currentCode={generatedCode}
                />
              </Paper>
              {showPreview ? (
                // @ts-ignore
                <SplitPane
                  split="vertical"
                  minSize={300}
                  defaultSize="50%"
                  style={splitPaneStyle}
                  pane1Style={{ overflow: 'hidden' }}
                  pane2Style={{ overflow: 'hidden' }}
                >
                  <Paper sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <CodeEditor 
                      code={generatedCode} 
                      onCodeChange={handleCodeChange} 
                    />
                  </Paper>
                  <Paper sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <PreviewPane 
                      code={generatedCode} 
                      onRefresh={handleRefreshPreview}
                      refreshKey={refreshKey}
                    />
                  </Paper>
                </SplitPane>
              ) : (
                <Paper sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <CodeEditor 
                    code={generatedCode} 
                    onCodeChange={handleCodeChange} 
                  />
                </Paper>
              )}
            </SplitPane>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
