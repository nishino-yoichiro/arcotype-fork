const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, 'public', 'fonts');
const cssFilePath = path.join(__dirname, 'app', 'styles', 'custom-fonts.css');

// --- Configuration ---
// Expanded mapping to handle more font weight and style names.
const styleMapping = {
  '100': { weight: 100, style: 'normal' },
  'thin': { weight: 100, style: 'normal' },
  '100italic': { weight: 100, style: 'italic' },
  '200': { weight: 200, style: 'normal' },
  'extralight': { weight: 200, style: 'normal' },
  '200italic': { weight: 200, style: 'italic' },
  '300': { weight: 300, style: 'normal' },
  'light': { weight: 300, style: 'normal' },
  '300italic': { weight: 300, style: 'italic' },
  '400': { weight: 400, style: 'normal' },
  'regular': { weight: 400, style: 'normal' },
  '400italic': { weight: 400, style: 'italic' },
  'italic': { weight: 400, style: 'italic' },
  '500': { weight: 500, style: 'normal' },
  'medium': { weight: 500, style: 'normal' },
  '500italic': { weight: 500, style: 'italic' },
  '600': { weight: 600, style: 'normal' },
  'semibold': { weight: 600, style: 'normal' },
  '600italic': { weight: 600, style: 'italic' },
  '700': { weight: 700, style: 'normal' },
  'bold': { weight: 700, style: 'normal' },
  '700italic': { weight: 700, style: 'italic' },
  'bolditalic': { weight: 700, style: 'italic' },
  '800': { weight: 800, style: 'normal' },
  'extrabold': { weight: 800, style: 'normal' },
  '800italic': { weight: 800, style: 'italic' },
  '900': { weight: 900, style: 'normal' },
  'black': { weight: 900, style: 'normal' },
  '900italic': { weight: 900, style: 'italic' },
};

// --- Main Script Logic ---

try {
  const fontFiles = fs.readdirSync(fontsDir);
  let cssContent = `/* This file is auto-generated. Do not edit directly. */\n\n`;

  fontFiles.forEach(file => {
    if (file.endsWith('.ttf') || file.endsWith('.otf') || file.endsWith('.woff2')) {
      const parsed = path.parse(file);
      const nameParts = parsed.name.split('-');
      
      let fontFamily = nameParts[0].replace(/_/g, ' ');
      let stylePart = (nameParts.length > 1 ? nameParts[1] : 'regular').toLowerCase();

      // Handle cases like "Zilla_Slab_Highlight-700"
      if (nameParts.length > 2) {
        fontFamily = nameParts.slice(0, -1).join(' ').replace(/_/g, ' ');
        stylePart = nameParts[nameParts.length - 1].toLowerCase();
      }
      
      const fontInfo = styleMapping[stylePart];

      if (fontInfo) {
        cssContent += `@font-face {\n`;
        cssContent += `  font-family: '${fontFamily}';\n`;
        cssContent += `  src: url('/fonts/${file}') format('${getFormat(parsed.ext)}');\n`;
        cssContent += `  font-weight: ${fontInfo.weight};\n`;
        cssContent += `  font-style: ${fontInfo.style};\n`;
        cssContent += `}\n\n`;
      } else {
        console.warn(`Could not determine style for font: ${file}. Consider updating the styleMapping.`);
      }
    }
  });

  fs.writeFileSync(cssFilePath, cssContent);
  console.log(`✅ Successfully generated custom-fonts.css at ${cssFilePath}`);

} catch (error) {
  console.error('❌ Error generating font CSS:', error);
}

function getFormat(extension) {
  switch (extension) {
    case '.ttf': return 'truetype';
    case '.otf': return 'opentype';
    case '.woff2': return 'woff2';
    default: return '';
  }
}