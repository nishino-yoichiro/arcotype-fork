'use client';
import React, { useEffect } from 'react';
import useFontStore from '@/src/store/useFontStore'; 
import { sampleFonts } from '@/src/data/fonts';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Load fonts from local data
    const loadFonts = async () => {
      try {
        useFontStore.getState().setFonts(sampleFonts);
      } catch (err) {
        console.error('Error loading fonts:', err);
      }
    };
    
    loadFonts();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}