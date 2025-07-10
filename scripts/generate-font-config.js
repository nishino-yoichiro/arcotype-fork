const fs = require('fs');
const path = require('path');

// --- Configuration ---
const FONTS_TS_PATH = path.join(__dirname, 'src', 'data', 'fonts.ts');
const CONFIG_OUTPUT_PATH = path.join(__dirname, 'src', 'lib', 'fontConfig.ts');
const CSS_OUTPUT_PATH = path.join(__dirname, 'app', 'styles', 'custom-fonts.css');

// --- Helper Functions ---

/**
 * Reads the font names from the generated fonts.ts file.
 */
function getFontNames() {
  try {
    const fileContent = fs.readFileSync(FONTS_TS_PATH, 'utf-8');
    const fontNames = [];
    // Use a regular expression to find all `name: '...'` entries
    const regex = /name: '([^']*)'/g;
    let match;
    while ((match = regex.exec(fileContent)) !== null) {
      fontNames.push(match[1]);
    }
    return fontNames;
  } catch (error) {
    console.error(`Error reading ${FONTS_TS_PATH}:`, error);
    return [];
  }
}

/**
 * Generates the content for the new fontConfig.ts file.
 */
function generateFontConfigContent(fontNames) {
  let content = `// This file is auto-generated. Do not edit directly.\n\n`;
  content += `// We no longer need NextFont, so we can define a simpler type\n`;
  content += `type FontConfig = {\n`;
  content += `  className: string;\n`;
  content += `};\n\n`;
  content += `// Map your font names to their new CSS classes\n`;
  content += `export const fontConfigs: { [key: string]: FontConfig } = {\n`;

  fontNames.forEach(name => {
    const className = `font-${name.toLowerCase().replace(/ /g, '-')}`;
    content += `  '${name}': { className: '${className}' },\n`;
  });

  content += `};\n`;
  return content;
}

/**
 * Generates the CSS content with a class for each font family.
 */
function generateCssContent(fontNames) {
  let content = `/* This file is auto-generated. Do not edit directly. */\n\n`;

  fontNames.forEach(name => {
    const className = `font-${name.toLowerCase().replace(/ /g, '-')}`;
    content += `.${className} {\n`;
    // The font-family name must match the name in your @font-face rules
    content += `  font-family: '${name.replace(/ /g, '_')}'; \n`;
    content += `}\n\n`;
  });

  return content;
}

// --- Main Execution ---

function main() {
  console.log('Starting font configuration and CSS generation...');

  const fontNames = getFontNames();
  if (fontNames.length === 0) {
    console.error('No font names found in fonts.ts. Please generate that file first.');
    return;
  }

  // Generate and write the fontConfig.ts file
  const fontConfigContent = generateFontConfigContent(fontNames);
  fs.writeFileSync(CONFIG_OUTPUT_PATH, fontConfigContent);
  console.log(`✅ Successfully generated new fontConfig.ts at ${CONFIG_OUTPUT_PATH}`);

  // Generate and write the custom-fonts.css file
  const cssContent = generateCssContent(fontNames);
  // We will append this to the existing @font-face rules
  fs.appendFileSync(CSS_OUTPUT_PATH, `\n\n/* Font Family Classes */\n` + cssContent);
  console.log(`✅ Successfully appended font classes to custom-fonts.css at ${CSS_OUTPUT_PATH}`);
}

main();