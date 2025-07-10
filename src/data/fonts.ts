import { Font } from '../store/useFontStore';

// Temporarily import the original data
import { sampleFonts as allSampleFonts } from './fonts-old'; // Make sure you have your original file named fonts-old.ts

// We will only use the first 10 fonts for testing
export const sampleFonts: Font[] = allSampleFonts.slice(0, 200);