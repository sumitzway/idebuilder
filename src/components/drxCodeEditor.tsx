import { Paper, Typography, IconButton, Snackbar, Box, Tabs, Tab, Tooltip, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import Editor from '@monaco-editor/react';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import JavascriptIcon from '@mui/icons-material/Javascript';
import HtmlIcon from '@mui/icons-material/Html';
import CssIcon from '@mui/icons-material/Css';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import FolderIcon from '@mui/icons-material/Folder';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import JSZip from 'jszip';
import { useState, useCallback, useEffect } from 'react';

interface CodeEditorProps {
  code: string;
  onCodeChange?: (newCode: string) => void;
}

interface FileData {
  name: string;
  content: string;
}

const CodeEditor = ({ code, onCodeChange }: CodeEditorProps) => {
  const [showDownloaded, setShowDownloaded] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [files, setFiles] = useState<FileData[]>([{ name: 'Component.tsx', content: code }]);
  const [explorerExpanded, setExplorerExpanded] = useState(true);

  // Parse code to extract multiple files if they exist
  const parseCodeIntoFiles = useCallback((codeString: string): FileData[] => {
    // Check if the code contains file markers
    if (codeString.includes('// FILE:')) {
      // This regex matches a file marker followed by content up to the next file marker or end of string
      const fileRegex = /\/\/\s*FILE:\s*([^\n]+)\s*\n([\s\S]*?)(?=\/\/\s*FILE:|$)/g;
      const files: FileData[] = [];
      
      // Manual parsing to ensure we catch all files
      let match;
      let lastIndex = 0;
      
      // Reset lastIndex to start from the beginning
      fileRegex.lastIndex = 0;
      
      while ((match = fileRegex.exec(codeString)) !== null) {
        // Record the lastIndex to handle overlapping matches
        lastIndex = fileRegex.lastIndex;
        
        const fileName = match[1].trim();
        const fileContent = match[2].trim();
        
        // Only add if we have content
        if (fileName) {
          // Check if we already have this file (avoid duplicates)
          const existingFileIndex = files.findIndex(f => f.name === fileName);
          if (existingFileIndex >= 0) {
            // Update existing file content
            files[existingFileIndex].content = fileContent;
          } else {
            // Add as new file
            files.push({ name: fileName, content: fileContent });
          }
        }
      }

      console.log(`Parsed ${files.length} files:`, files.map(f => f.name));
      return files.length > 0 ? files : [{ name: 'Component.tsx', content: codeString }];
    } else {
      // If no file markers, treat the entire code as a single file
      return [{ name: 'Component.tsx', content: codeString }];
    }
  }, []);

  // Update files when code prop changes
  useEffect(() => {
    if (code) {
      const parsedFiles = parseCodeIntoFiles(code);
      setFiles(parsedFiles);
      // Reset to first file when new code is loaded
      setActiveFileIndex(0);
    }
  }, [code, parseCodeIntoFiles]);

  // Function to download all files as a zip
  const handleDownloadAllFiles = async () => {
    try {
      const zip = new JSZip();
      
      // Add all files to the zip
      files.forEach(file => {
        zip.file(file.name, file.content);
      });
      
      // Generate the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Create a download link
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'web-project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowDownloaded(true);
    } catch (err) {
      console.error('Failed to download files:', err);
    }
  };

  // Toggle the explorer panel
  const toggleExplorer = () => {
    setExplorerExpanded(!explorerExpanded);
  };

  // Use useCallback to memoize the change handler for better performance
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      // Update the content of the active file
      const updatedFiles = [...files];
      if (updatedFiles[activeFileIndex]) {
        updatedFiles[activeFileIndex].content = value;
        setFiles(updatedFiles);
        
        // Combine all file contents for parent component
        const combinedCode = updatedFiles.map(file => 
          `// FILE: ${file.name}\n${file.content}`
        ).join('\n\n');
        
        // Notify parent of changes
        onCodeChange?.(combinedCode);
      }
    }
  }, [files, activeFileIndex, onCodeChange]);

  // Determine the language based on file extension
  const getLanguage = useCallback((fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'css': return 'css';
      case 'html': return 'html';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'typescript';
    }
  }, []);

  // Get appropriate icon for file based on extension
  const getFileIcon = useCallback((fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return <JavascriptIcon color="warning" />;
      case 'html':
        return <HtmlIcon color="error" />;
      case 'css':
        return <CssIcon color="info" />;
      case 'md':
        return <DescriptionIcon color="action" />;
      case 'ts':
      case 'tsx':
        return <CodeIcon color="primary" />;
      default:
        return <InsertDriveFileIcon />;
    }
  }, []);

  // Organize files into a folder structure
  const organizeFiles = useCallback(() => {
    const folders: Record<string, FileData[]> = {};
    const rootFiles: FileData[] = [];

    console.log('Organizing files:', files.map(f => f.name));

    files.forEach(file => {
      const parts = file.name.split('/');
      if (parts.length > 1) {
        // This file is in a folder
        const folderName = parts[0];
        if (!folders[folderName]) {
          folders[folderName] = [];
        }
        folders[folderName].push(file);
      } else {
        // This is a root file
        rootFiles.push(file);
      }
    });

    return { folders, rootFiles };
  }, [files]);

  // Group files by type for better organization
  const getFileCategory = useCallback((fileName: string): number => {
    const lowerName = fileName.toLowerCase();
    // HTML files first
    if (lowerName.endsWith('.html')) return 0;
    // JS files second
    if (lowerName.endsWith('.js')) return 1;
    // CSS files third
    if (lowerName.endsWith('.css')) return 2;
    // TS files fourth
    if (lowerName.endsWith('.ts') || lowerName.endsWith('.tsx')) return 3;
    // MD files fifth
    if (lowerName.endsWith('.md')) return 4;
    // Other files last, sorted alphabetically
    return 5;
  }, []);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 2, pb: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
          Project Source Code
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={explorerExpanded ? "Collapse Project Explorer" : "Expand Project Explorer"}>
            <IconButton 
              onClick={toggleExplorer} 
              size="small" 
              color={explorerExpanded ? "primary" : "default"}
              className={explorerExpanded ? "explorer-toggle-active" : ""}
              sx={{
                transition: 'all 0.2s ease-in-out',
                transform: explorerExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
              }}
            >
              {explorerExpanded ? <MenuOpenIcon /> : <MenuIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Download as ZIP">
            <IconButton onClick={handleDownloadAllFiles} size="small">
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Project Explorer Sidebar */}
        <Box 
          sx={{ 
            width: explorerExpanded ? '220px' : '0px', 
            borderRight: explorerExpanded ? 1 : 0, 
            borderColor: 'divider',
            overflow: 'hidden',
            backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)',
            transition: 'width 0.3s ease-in-out, border-right-width 0.3s ease-in-out',
            flexShrink: 0
          }}
        >
          <Box sx={{ 
            opacity: explorerExpanded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            visibility: explorerExpanded ? 'visible' : 'hidden',
            width: '220px'
          }}>
            <Typography variant="subtitle2" sx={{ p: 2, pb: 1, fontWeight: 'bold' }}>
              Project Explorer {files.length > 0 && `(${files.length} files)`}
            </Typography>
            
            <List dense component="nav" aria-label="project files" sx={{ 
              mb: 2,
              maxHeight: 'calc(100% - 50px)',
              overflowY: 'auto'
            }}>
              {files.length === 0 ? (
                <ListItem sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  <ListItemText primary="No files available" />
                </ListItem>
              ) : (
                (() => {
                  const { folders, rootFiles } = organizeFiles();
                  const items: React.ReactNode[] = [];
                  
                  // Add folders first
                  Object.keys(folders).sort().forEach(folderName => {
                    items.push(
                      <div key={`folder-${folderName}`}>
                        <ListItem>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <FolderIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={folderName} />
                        </ListItem>
                        <List component="div" disablePadding>
                          {folders[folderName].map((file, folderFileIndex) => {
                            const fileIndex = files.findIndex(f => f.name === file.name);
                            return (
                              <ListItem 
                                key={file.name} 
                                button 
                                selected={activeFileIndex === fileIndex}
                                onClick={() => setActiveFileIndex(fileIndex)}
                                sx={{ 
                                  pl: 4,
                                  '&.Mui-selected': {
                                    backgroundColor: theme => 
                                      theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.08)' 
                                        : 'rgba(0, 0, 0, 0.08)',
                                  },
                                  '&.Mui-selected:hover': {
                                    backgroundColor: theme => 
                                      theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.12)' 
                                        : 'rgba(0, 0, 0, 0.12)',
                                  }
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  {getFileIcon(file.name)}
                                </ListItemIcon>
                                <ListItemText 
                                  primary={file.name.split('/').pop()} 
                                  primaryTypographyProps={{ 
                                    noWrap: true,
                                    fontSize: '0.875rem' 
                                  }}
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                      </div>
                    );
                  });
                  
                  // Add root files
                  rootFiles.sort((a, b) => {
                    // Sort files by category then by name
                    const categoryA = getFileCategory(a.name);
                    const categoryB = getFileCategory(b.name);
                    
                    // First compare by category
                    if (categoryA !== categoryB) {
                      return categoryA - categoryB;
                    }
                    
                    // If same category, sort alphabetically
                    return a.name.localeCompare(b.name);
                  }).forEach((file, i) => {
                    const fileIndex = files.findIndex(f => f.name === file.name);
                    items.push(
                      <ListItem 
                        key={file.name} 
                        button 
                        selected={activeFileIndex === fileIndex}
                        onClick={() => setActiveFileIndex(fileIndex)}
                        sx={{ 
                          '&.Mui-selected': {
                            backgroundColor: theme => 
                              theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.08)' 
                                : 'rgba(0, 0, 0, 0.08)',
                          },
                          '&.Mui-selected:hover': {
                            backgroundColor: theme => 
                              theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.12)' 
                                : 'rgba(0, 0, 0, 0.12)',
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {getFileIcon(file.name)}
                        </ListItemIcon>
                        <ListItemText 
                          primary={file.name} 
                          primaryTypographyProps={{ 
                            noWrap: true,
                            fontSize: '0.875rem'
                          }}
                        />
                      </ListItem>
                    );
                  });
                  
                  return items;
                })()
              )}
            </List>
          </Box>
        </Box>
        
        {/* Code Editor */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Editor
            height="100%"
            language={getLanguage(files[activeFileIndex]?.name || 'Component.tsx')}
            value={files[activeFileIndex]?.content || ''}
            theme="vs-dark"
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              readOnly: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
              },
            }}
          />
        </Box>
      </Box>
      
      <Snackbar
        open={showDownloaded}
        autoHideDuration={2000}
        onClose={() => setShowDownloaded(false)}
        message="Project files downloaded as ZIP"
      />
    </Box>
  );
}

export default CodeEditor; 