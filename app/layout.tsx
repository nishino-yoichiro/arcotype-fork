'use client';
import React, { useEffect } from 'react';
import useFontStore from '@/src/store/useFontStore'; 
import { sampleFonts } from '@/src/data/fonts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize the font store with sample data
    useFontStore.getState().setFonts(sampleFonts);
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}