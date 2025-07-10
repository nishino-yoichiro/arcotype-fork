const fs = require('fs');
const path = require('path');

// --- Configuration ---
const ALGO_PREDS_PATH = path.join(__dirname, 'src', 'custom-data', 'algo_preds_full_dataset.json');
const WEIGHT_SCORES_PATH = path.join(__dirname, 'src', 'custom-data', 'weight_scores_full_dataset.csv');
const OUTPUT_PATH = path.join(__dirname, 'src', 'data', 'fonts.ts');

const X_INCREMENT = 266;
const Y_INCREMENT = 186;

// --- Helper Functions ---

/**
 * Parses the JSON file for y-axis ordering.
 * Highest score should be at the bottom, so we sort in ascending order of score.
 */
function parseAlgoPreds() {
  try {
    const fileContent = fs.readFileSync(ALGO_PREDS_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.sort((a, b) => a.score - b.score).map(item => item.font);
  } catch (error) {
    console.error('Error reading or parsing algo_preds_full_dataset.json:', error);
    return [];
  }
}

/**
 * Parses the CSV file for x-axis ordering.
 * Highest score should be to the right, so we sort in ascending order of score.
 */
function parseWeightScores() {
  try {
    const fileContent = fs.readFileSync(WEIGHT_SCORES_PATH, 'utf-8');
    const rows = fileContent.trim().split('\n').slice(1); // Skip header
    const data = rows.map(row => {
      const [font_name, weight_score] = row.split(',');
      return { font_name, weight_score: parseFloat(weight_score) };
    });
    return data.sort((a, b) => a.weight_score - b.weight_score).map(item => item.font_name);
  } catch (error) {
    console.error('Error reading or parsing weight_scores_full_dataset.csv:', error);
    return [];
  }
}

/**
 * Generates the TypeScript file content for fonts.ts.
 */
function generateFontsTsContent(fontData) {
  let content = `import { Font } from '../store/useFontStore';\n\n`;
  content += `export const sampleFonts: Font[] = [\n`;

  fontData.forEach(font => {
    content += `  {\n`;
    content += `    id: '${font.id}',\n`;
    content += `    name: '${font.name}',\n`;
    content += `    designer: 'Unknown', // You can update this later\n`;
    content += `    googleFontUrl: '',\n`;
    content += `    weights: ['400'], // Default, update as needed\n`;
    content += `    styles: ['normal'], // Default, update as needed\n`;
    content += `    category: 'serif', // Default, update as needed\n`;
    content += `    position: { x: ${font.position.x}, y: ${font.position.y} },\n`;
    content += `    useCases: []\n`;
    content += `  },\n`;
  });

  content += `];\n`;
  return content;
}

// --- Main Execution ---

function main() {
  console.log('Starting font data generation...');

  const yAxisOrder = parseAlgoPreds();
  const xAxisOrder = parseWeightScores();

  if (yAxisOrder.length === 0 || xAxisOrder.length === 0) {
    console.error('Could not generate font data due to parsing errors.');
    return;
  }

  // Create a mapping of font names to their y-axis index
  const yIndexMap = new Map(yAxisOrder.map((name, index) => [name, index]));

  // Create the final font data with calculated positions
  const fontData = xAxisOrder.map((fontName, xIndex) => {
    const yIndex = yIndexMap.get(fontName);
    if (yIndex === undefined) {
      console.warn(`Font "${fontName}" from weight scores not found in algo preds. Skipping.`);
      return null;
    }

    return {
      id: fontName.toLowerCase().replace(/ /g, '-'),
      name: fontName,
      position: {
        x: xIndex * X_INCREMENT,
        y: yIndex * Y_INCREMENT,
      },
    };
  }).filter(Boolean); // Filter out any null entries

  const tsContent = generateFontsTsContent(fontData);
  fs.writeFileSync(OUTPUT_PATH, tsContent);

  console.log(`✅ Successfully generated new fonts.ts file with ${fontData.length} fonts.`);
}

main();