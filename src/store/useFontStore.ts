import { create } from 'zustand';

// Define basic Font type
export type Font = {
  id: string;
  name: string;
  designer: string;
  googleFontUrl: string;
  weights: string[];
  styles: string[]; // e.g., ['normal', 'italic']
  category: string; // e.g., 'serif', 'sans-serif', etc.
  position: { x: number; y: number };
  useCases?: Array<{
    id: string;
    title: string;
    imageUrl: string;
    link: string;
  }>;
};

// Define our store type
type FontStore = {
  // State
  fonts: Font[];
  selectedFontId: string | null;
  mapPosition: { x: number; y: number };
  
  // Actions
  selectFont: (fontId: string | null) => void;
  setMapPosition: (x: number, y: number) => void;
  centerMapOnFont: (fontId: string) => void;
  setFonts: (fonts: Font[]) => void;
  
  // Helper getter
  getSelectedFont: () => Font | undefined;
};

// Create the store
const useFontStore = create<FontStore>((set, get) => ({
  // Initial state
  fonts: [],
  selectedFontId: null,
  mapPosition: { x: 0, y: 0 },
  
  // Actions
  selectFont: (fontId) => {
    set({ selectedFontId: fontId });
    if (fontId) {
      get().centerMapOnFont(fontId);
    }
  },
  
  setMapPosition: (x: number, y: number) => {
    set({ mapPosition: { x, y } });
  },
  
  centerMapOnFont: (fontId) => {
    const font = get().fonts.find(f => f.id === fontId);
    if (font) {
      // Center the map on the font position
      set({
        mapPosition: {
          x: -font.position.x, // Negative because we're moving the map, not the font
          y: -font.position.y,
        },
      });
    }
  },
  
  setFonts: (fonts) => {
    set({ fonts });
  },
  
  // Helper getter
  getSelectedFont: () => {
    const { fonts, selectedFontId } = get();
    return fonts.find(f => f.id === selectedFontId);
  },
}));

export default useFontStore;