const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Paths
const fontDir = path.join(__dirname, '../public/fonts');
const outputConfigPath = path.join(__dirname, '../src/lib/localFontConfig.ts');

// Get all files in directory recursively
async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = path.resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.reduce((a, f) => a.concat(f), []);
}

// Extract font info from filename
function extractFontInfo(filePath) {
  // Normalize the file path to handle Windows backslashes
  const normalizedPath = filePath.replace(/\\/g, '/');
  // Get relative path from public directory
  const relativePath = normalizedPath.split('/public')[1];
  
  // Extract font name from file path
  let fontName = path.basename(filePath, path.extname(filePath));
  
  // Replace underscores with spaces in font name
  fontName = fontName.replace(/_/g, ' ');
  
  // Remove weight and style indicators from font name
  fontName = fontName.replace(/-\d+.*$/, '');
  fontName = fontName.replace(/(regular|italic|bold|light|medium|thin|black)$/i, '').trim();
  
  return {
    path: relativePath,
    fontName: fontName,
    weight: 400 // Default to regular weight
  };
}

// Generate Next.js Font Config
async function generateNextFontConfig() {
  try {
    // Get all font files
    const fontFiles = (await getFiles(fontDir)).filter(file => 
      /\.(otf|ttf|woff|woff2)$/i.test(file)
    );
    
    // Extract font info
    const fonts = fontFiles
      .map(extractFontInfo)
      .filter(Boolean);
    
    // Group by font name and select one representative file per font family
    // Preferably the regular (400) weight
    const fontFamilies = {};
    fonts.forEach(font => {
      if (!fontFamilies[font.fontName] || font.weight === 400) {
        fontFamilies[font.fontName] = font;
      }
    });
    
    // Generate config file
    let config = `// Auto-generated Next.js local font configuration\n`;
    config += `import localFont from 'next/font/local';\n\n`;
    
    // Create font instances
    Object.entries(fontFamilies).forEach(([fontName, fontInfo]) => {
      const varName = fontName.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '_');
      config += `const ${varName} = localFont({ 
  src: '../../public${fontInfo.path}',
  variable: '--font-${varName}'
});\n\n`;
    });
    
    // Create fontConfigs export
    config += `export const fontConfigs = {\n`;
    Object.entries(fontFamilies).forEach(([fontName, fontInfo]) => {
      const varName = fontName.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '_');
      config += `  '${fontName}': {\n`;
      config += `    family: ${varName}.style.fontFamily,\n`;
      config += `    className: ${varName}.className\n`;
      config += `  },\n`;
    });
    config += `};\n\n`;
    
    // Create fontVariables export for use in global CSS
    config += `export const fontVariables = [\n`;
    Object.entries(fontFamilies).forEach(([fontName, fontInfo]) => {
      const varName = fontName.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '_');
      config += `  ${varName}.variable,\n`;
    });
    config += `].join(' ');\n`;
    
    fs.writeFileSync(outputConfigPath, config);
    console.log(`Generated Next.js font config at ${outputConfigPath}`);
  } catch (error) {
    console.error('Error in generateNextFontConfig:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    await generateNextFontConfig();
    console.log('Font config generation complete!');
  } catch (error) {
    console.error('Error generating font config:', error);
  }
}

main();