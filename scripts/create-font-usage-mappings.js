const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Paths
const fontsDir = path.join(__dirname, '../public/fonts');
const outputPath = path.join(__dirname, '../src/data/fontUsageImages.ts');
const placeholderImage = '/yellow-star.png'; // Using existing image as placeholder

// Extract font name from filename
function extractFontName(filename) {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.(otf|ttf|woff|woff2)$/i, '');
  
  // Split by hyphen and take the first part (Font-Weight.ttf -> Font)
  const parts = nameWithoutExt.split('-');
  return parts[0];
}

// Generate font usage images mapping based on font files
async function generateFontUsage() {
  // Get all font files
  let fontFiles = [];
  try {
    const files = await readdir(fontsDir);
    fontFiles = files.filter(file => /\.(otf|ttf|woff|woff2)$/i.test(file));
  } catch (err) {
    console.error(`Error reading fonts directory: ${err.message}`);
    // Check if the sample fonts array is available
    console.log('Using hardcoded font list instead');
    
    // Hardcoded list of common fonts in case we can't read the directory
    fontFiles = [
      'Roboto-Regular.ttf', 
      'OpenSans-Regular.ttf',
      'Lato-Regular.ttf',
      'PlayfairDisplay-Regular.ttf',
      'Montserrat-Regular.ttf',
      'Raleway-Regular.ttf',
      'SourceSansPro-Regular.ttf',
      'Poppins-Regular.ttf',
      'Merriweather-Regular.ttf',
      'NotoSans-Regular.ttf'
    ];
  }
  
  // Extract unique font names
  const fontNames = [...new Set(fontFiles.map(extractFontName))];
  
  // Generate TypeScript file with placeholders
  let ts = `// Auto-generated font usage images mapping using placeholder images\n\n`;
  ts += `export const fontUsageImages: Record<string, { image_url: string; use_case_url: string }[]> = {\n`;
  
  fontNames.forEach(fontName => {
    ts += `  '${fontName}': [\n`;
    // Add 3 placeholder images for each font
    for (let i = 0; i < 3; i++) {
      ts += `    { \n`;
      ts += `      image_url: '${placeholderImage}', \n`;
      ts += `      use_case_url: 'https://fonts.google.com/specimen/${fontName.replace(/\s+/g, '+')}' \n`;
      ts += `    },\n`;
    }
    ts += `  ],\n`;
  });
  
  // If no fonts found, add sample data
  if (fontNames.length === 0) {
    ts += `  // Sample data - no fonts found in directory\n`;
    ['Roboto', 'Playfair Display', 'Open Sans', 'Montserrat', 'Lato'].forEach(fontName => {
      ts += `  '${fontName}': [\n`;
      for (let i = 0; i < 3; i++) {
        ts += `    { \n`;
        ts += `      image_url: '${placeholderImage}', \n`;
        ts += `      use_case_url: 'https://fonts.google.com/specimen/${fontName.replace(/\s+/g, '+')}' \n`;
        ts += `    },\n`;
      }
      ts += `  ],\n`;
    });
  }
  
  ts += `};\n`;
  
  // Create the directory if it doesn't exist
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, ts);
  console.log(`Generated font usage mapping at ${outputPath} using placeholder image: ${placeholderImage}`);
}

// Main function
async function main() {
  try {
    await generateFontUsage();
    console.log('Font usage image mapping complete!');
    console.log('\nNOTE: All fonts are using the placeholder image: ' + placeholderImage);
    console.log('To use real images:');
    console.log('1. Create a /public/font-usage/ directory');
    console.log('2. Add subdirectories for each font name');
    console.log('3. Place images in those directories');
    console.log('4. Modify this script to use those images');
  } catch (error) {
    console.error('Error generating font usage mapping:', error);
  }
}

main();