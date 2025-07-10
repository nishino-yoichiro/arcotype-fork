// Create a simple configuration for testing

// This is a simplified version for testing
export const fontConfigs: Record<string, {family: string, className: string}> = {
  'Roboto': {
    family: '-apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    className: 'font-roboto'
  },
  'Roboto Serif': {
    family: 'Georgia, "Times New Roman", serif',
    className: 'font-roboto-serif'
  },
  'Merriweather': {
    family: 'Georgia, "Times New Roman", serif',
    className: 'font-merriweather'
  },
  'Diplomata': {
    family: 'serif',
    className: 'font-diplomata'
  },
  'Diplomata SC': {
    family: 'serif',
    className: 'font-diplomata-sc'
  }
};

// Add other fonts mentioned in your map component
// Add all font families from your FontMap component
const allFontNames = [
  'Stint Ultra Condensed', 'Source Code Pro', 'Roboto Mono', 'Noto Sans Mono', 'PT Mono',
  'Courier Prime', 'Maiden Orange', 'Slabo 27px', 'Fira Mono', 'IBM Plex Mono',
  'Bree Serif', 'Josefin Slab', 'Rokkitt', 'Andada Pro', 'Bitter', 'Aleo',
  'Crete Round', 'Arvo', 'Quattrocento', 'Coustard', 'Imbue', 'PT Serif',
  'Noticia Text', 'Roboto Serif', 'Zilla Slab', 'Ovo', 'Alfa Slab One',
  'Xanh Mono', 'Bellefair', 'Merriweather', 'Source Serif', 'Headland One',
  'Instrument Serif', 'Spectral', 'Newsreader', 'Libre Baskerville', 'Lora',
  'IBM Plex Serif', 'Fraunces', 'Noto Serif Display', 'Playfair Display',
  'Bodoni Moda', 'Suranna', 'Domine', 'DM Serif Display', 'Abril Fatface',
  'Chonburi', 'Cormorant', 'Cormorant Garamond', 'EB Garamond', 'Crimson Text',
  'Sorts Mill Goudy', 'Linden Hill', 'Rosarivo', 'Ultra', 'Eczar', 'Alike Angular',
  'Alike', 'Young Serif', 'Oldenburg', 'BhuTuka Expanded One', 'Montaga', 'Kurale',
  'Gabriela', 'Inknut Antiqua', 'Special Elite', 'Arbutus', 'Elsie',
  'Elsie Swash Caps', 'Almendra', 'Luxurious Roman', 'Kotta One', 'Diplomata',
  'Bigelow Rules', 'Mountains of Christmas', 'Emilys Candy', 'Paprika',
  'Langar', 'Diplomata SC'
];

// Add all fonts with system fallbacks
allFontNames.forEach(name => {
  if (!fontConfigs[name]) {
    fontConfigs[name] = {
      family: name.includes('Serif') || 
             ['Merriweather', 'Playfair', 'Garamond', 'Crimson', 'Lora'].some(serif => name.includes(serif)) 
        ? `"${name}", Georgia, "Times New Roman", serif` 
        : `"${name}", -apple-system, BlinkMacSystemFont, sans-serif`,
      className: `font-${name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`
    };
  }
});

export const fontVariables = 'font-sans'; // Fallback for testing