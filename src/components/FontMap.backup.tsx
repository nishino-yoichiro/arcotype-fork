'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useFontStore from '../store/useFontStore';
import { fontConfigs } from '../lib/fontConfig';

interface BlankCardProps {
  style?: React.CSSProperties;
}

const BlankCard: React.FC<BlankCardProps> = ({ style }) => {
  return (
    <div 
      style={{ 
        width: '288px',
        height: '196px',
        backgroundColor: '#F3F4FA',
        borderRadius: '20px',
        padding: '20px',
        display: 'block',
        boxSizing: 'border-box',
        ...style
      }}
    />
  );
};

interface FontCardProps {
  fontName: string;
  foundry: string;
  isSelected: boolean;
  onClick: () => void;
}

const FontCard: React.FC<FontCardProps> = ({ 
  fontName, 
  foundry, 
  isSelected, 
  onClick 
}) => {
  const fontConfig = fontConfigs[fontName];
  const [hovered, setHovered] = useState(false);
  const fontNameRef = useRef<HTMLHeadingElement>(null);
  const [isTwoLines, setIsTwoLines] = useState(false);

  const isActive = hovered || isSelected;

  // Check if the font name wraps to 2 lines
  useEffect(() => {
    const checkLines = () => {
      if (fontNameRef.current) {
        // 32px font size, lineHeight 1, so 32px per line
        setIsTwoLines(fontNameRef.current.offsetHeight > 40);
      }
    };
    checkLines();
    window.addEventListener('resize', checkLines);
    return () => window.removeEventListener('resize', checkLines);
  }, [fontName]);

  // Card padding for left/right only
  const cardPaddingLeft = 40;
  const cardPaddingRight = 40;
  const cardPaddingTop = isTwoLines ? 36 : 50;
  const cardPaddingBottom = 40;

  return (
    <div
      style={{
        position: 'relative',
        width: '288px',
        height: '196px',
        backgroundColor: isActive ? '#FFFFFF' : '#F3F4FA',
        borderRadius: '20px',
        paddingLeft: cardPaddingLeft,
        paddingRight: cardPaddingRight,
        boxSizing: 'border-box',
        boxShadow: isActive ? '0px 0px 16px 8px rgba(0,0,0,0.05)' : 'none',
        transition: 'background 0.55s, box-shadow 0.58s',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Large font name, absolutely positioned 30px from top, centered */}
      <h3
        ref={fontNameRef}
        className={fontConfig?.className || ''}
        style={{
          position: 'absolute',
          top: cardPaddingTop,
          left: cardPaddingLeft,
          right: cardPaddingRight,
          fontSize: '32px',
          fontWeight: 500,
          margin: 0,
          lineHeight: 1,
          pointerEvents: 'none',
          wordBreak: 'break-word',
        }}
      >
        {fontName}
      </h3>
      {/* Bottom area: small font name and foundry, stacked, 4px gap, 30px from bottom */}
      <div
        style={{
          position: 'absolute',
          left: cardPaddingLeft,
          right: cardPaddingRight,
          bottom: cardPaddingBottom,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '2px',
          pointerEvents: 'none',
        }}
      >
        <p
          style={{
            fontFamily: 'Inter',
            fontSize: '14px',
            color: '#111',
            opacity: 1,
            margin: 0,
          }}
        >
          {fontName}
        </p>
        <p
          style={{
            fontFamily: 'Inter',
            fontSize: '14px',
            color: '#6b7280',
            opacity: 0.8,
            margin: 0,
          }}
        >
          {foundry}
        </p>
      </div>
    </div>
  );
};

interface FontMapProps {
  selectedFontId: string | null;
  onSelectFont: (fontId: string) => void;
  centeredFontId?: string | null;
}

const FontMap: React.FC<FontMapProps> = ({ selectedFontId, onSelectFont, centeredFontId }) => {
  const { fonts } = useFontStore();

  // For autoscroll: refs for each FontCard
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // Track grid position
  const [gridPos, setGridPos] = useState<{ x: number; y: number }>({ x: -870, y: -1050 });
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const renderGrid = () => {
    const grid = [];
    
    // Row 1 (all blank, 9 columns)
    for (let i = 0; i < 9; i++) {
      grid.push(
        <div
          key={`blank-row1-${i}`}
          style={{
            gridColumn: `${i + 1}`,
            gridRow: '1',
            width: '288px',
            transform: 'translateX(154px)',
            display: 'block'
          }}
        >
          <BlankCard />
        </div>
      );
    }
    // Add BlankCard at end of row 1
    grid.push(
      <div
        key={`blank-row1-end`}
        style={{
          gridColumn: `10`,
          gridRow: '1',
          width: '288px',
          transform: 'translateX(154px)',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );

    // The monospace fonts (Stint Ultra Condensed first)
    const row2FontNames = [
      'Stint Ultra Condensed',
      'Source Code Pro',
      'Roboto Mono',
      'Noto Sans Mono',
      'PT Mono',
      'Courier Prime'
    ];
    const row2Fonts = row2FontNames
      .map(name => fonts.find(font => font.name === name))
      .filter(Boolean);

    // Row 2: 1 blank, 6 fonts, 2 blanks after
    // First blank card
    grid.push(
      <div
        key={`blank-row2-0`}
        style={{
          gridColumn: `1`,
          gridRow: '2',
          width: '288px',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );

    // The 6 font cards
    const row2FontsFiltered = row2Fonts.filter(Boolean);
    row2FontsFiltered.forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          style={{
            gridColumn: `${index + 2}`,
            gridRow: '2',
            width: '288px',
            display: 'block'
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
          />
        </div>
      );
    });

    // Only 1 blank card after the last font
    grid.push(
      <div
        key={`blank-row2-after-fonts`}
        style={{
          gridColumn: `${row2FontsFiltered.length + 2}`,
          gridRow: '2',
          width: '288px',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );

    // One more blank card to fill 9 columns
    grid.push(
      <div
        key={`blank-row2-end`}
        style={{
          gridColumn: `9`,
          gridRow: '2',
          width: '288px',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );
    // Add BlankCard at end of row 2
    grid.push(
      <div
        key={`blank-row2-end-10`}
        style={{
          gridColumn: `10`,
          gridRow: '2',
          width: '288px',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );

    // Row 3: BlankCard, Maiden Orange, Slabo 27px, Fira Mono, IBM Plex Mono, Bree Serif, Josefin Slab, Rokkitt, BlankCard
    const row3FontNames = [
      'Maiden Orange',
      'Slabo 27px',
      'Fira Mono',
      'IBM Plex Mono',
      'Bree Serif',
      'Josefin Slab',
      'Rokkitt'
    ];
    const row3Fonts = row3FontNames
      .map(name => fonts.find(font => font.name === name))
      .filter(Boolean);

    // First BlankCard for row 3
    grid.push(
      <div
        key={`blank-row3-0`}
        style={{
          gridColumn: `1`,
          gridRow: '3',
          width: '288px',
          display: 'block',
          transform: 'translateX(154px)'
        }}
      >
        <BlankCard />
      </div>
    );

    // The 7 font cards for row 3
    const row3FontsFiltered = row3Fonts.filter(Boolean);
    row3FontsFiltered.forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          style={{
            gridColumn: `${index + 2}`,
            gridRow: '3',
            width: '288px',
            display: 'block',
            transform: 'translateX(154px)'
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
          />
        </div>
      );
    });

    // Last BlankCard for row 3
    grid.push(
      <div
        key={`blank-row3-end`}
        style={{
          gridColumn: `9`,
          gridRow: '3',
          width: '288px',
          display: 'block',
          transform: 'translateX(154px)'
        }}
      >
        <BlankCard />
      </div>
    );
    // Add BlankCard at end of row 3
    grid.push(
      <div
        key={`blank-row3-end-10`}
        style={{
          gridColumn: `10`,
          gridRow: '3',
          width: '288px',
          display: 'block',
          transform: 'translateX(154px)'
        }}
      >
        <BlankCard />
      </div>
    );

    // Row 4: BlankCard, Andada Pro, Bitter, Aleo, Crete Round, Arvo, Quattrocento, Coustard, BlankCard
    const row4FontNames = [
      'Andada Pro',
      'Bitter',
      'Aleo',
      'Crete Round',
      'Arvo',
      'Quattrocento',
      'Coustard'
    ];
    const row4Fonts = row4FontNames
      .map(name => fonts.find(font => font.name === name))
      .filter(Boolean);

    // First BlankCard for row 4
    grid.push(
      <div
        key={`blank-row4-0`}
        style={{
          gridColumn: `1`,
          gridRow: '4',
          width: '288px',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );

    // The 7 font cards for row 4
    const row4FontsFiltered = row4Fonts.filter(Boolean);
    row4FontsFiltered.forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          style={{
            gridColumn: `${index + 2}`,
            gridRow: '4',
            width: '288px',
            display: 'block'
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
          />
        </div>
      );
    });

    // Last BlankCard for row 4
    grid.push(
      <div
        key={`blank-row4-end`}
        style={{
          gridColumn: `9`,
          gridRow: '4',
          width: '288px',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );
    // Add BlankCard at end of row 4
    grid.push(
      <div
        key={`blank-row4-end-10`}
        style={{
          gridColumn: `10`,
          gridRow: '4',
          width: '288px',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );

    // Row 5: BlankCard, Imbue, PT Serif, Noticia Text, Roboto Serif, Zilla Slab, Ovo, Alfa Slab One, BlankCard
    const row5FontNames = [
      'Imbue',
      'PT Serif',
      'Noticia Text',
      'Roboto Serif',
      'Zilla Slab',
      'Ovo',
      'Alfa Slab One'
    ];
    const row5Fonts = row5FontNames
      .map(name => fonts.find(font => font.name === name))
      .filter(Boolean);

    // First BlankCard for row 5
    grid.push(
      <div
        key={`blank-row5-0`}
        style={{
          gridColumn: `1`,
          gridRow: '5',
          width: '288px',
          display: 'block',
          transform: 'translateX(154px)'
        }}
      >
        <BlankCard />
      </div>
    );

    // The 7 font cards for row 5
    const row5FontsFiltered = row5Fonts.filter(Boolean);
    row5FontsFiltered.forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          style={{
            gridColumn: `${index + 2}`,
            gridRow: '5',
            width: '288px',
            display: 'block',
            transform: 'translateX(154px)'
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
          />
        </div>
      );
    });

    // Last BlankCard for row 5
    grid.push(
      <div
        key={`blank-row5-end`}
        style={{
          gridColumn: `9`,
          gridRow: '5',
          width: '288px',
          display: 'block',
          transform: 'translateX(154px)'
        }}
      >
        <BlankCard />
      </div>
    );
    // Add BlankCard at end of row 5
    grid.push(
      <div
        key={`blank-row5-end-10`}
        style={{
          gridColumn: `10`,
          gridRow: '5',
          width: '288px',
          display: 'block',
          transform: 'translateX(154px)'
        }}
      >
        <BlankCard />
      </div>
    );

    // Track all used font names in a Set
    const usedFontNames = new Set([
      ...row2FontNames,
      ...row3FontNames,
      ...row4FontNames,
      ...row5FontNames
    ]);

    // Row 6: BlankCard, Xanh Mono, Bellefair, Merriweather, Source Serif, Headland One, BlankCard, BlankCard, BlankCard
    const row6FontNames = [
      'Xanh Mono',
      'Bellefair',
      'Merriweather',
      'Source Serif',
      'Headland One'
    ];
    const row6Fonts = row6FontNames
      .map(name => fonts.find(font => font.name === name))
      .filter(Boolean);

    // First BlankCard for row 6
    grid.push(
      <div
        key={`blank-row6-0`}
        style={{
          gridColumn: `1`,
          gridRow: '6',
          width: '288px',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );

    // The 5 font cards for row 6
    const row6FontsFiltered = row6Fonts.filter(Boolean);
    row6FontsFiltered.forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          style={{
            gridColumn: `${index + 2}`,
            gridRow: '6',
            width: '288px',
            display: 'block'
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
          />
        </div>
      );
    });

    // Last 3 BlankCards for row 6
    for (let i = 0; i < 3; i++) {
      grid.push(
        <div
          key={`blank-row6-end-${i}`}
          style={{
            gridColumn: `${i + 7}`,
            gridRow: '6',
            width: '288px',
            display: 'block'
          }}
        >
          <BlankCard />
        </div>
      );
    }
    // Add BlankCard at end of row 6
    grid.push(
      <div
        key={`blank-row6-end-10`}
        style={{
          gridColumn: `10`,
          gridRow: '6',
          width: '288px',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );

    // Row 7: BlankCard, Instrument Serif, Spectral, Newsreader, Libre Baskerville, Lora, IBM Plex Serif, Fraunces, BlankCard
    const row7FontNames = [
      'Instrument Serif',
      'Spectral',
      'Newsreader',
      'Libre Baskerville',
      'Lora',
      'IBM Plex Serif',
      'Fraunces'
    ];
    const row7Fonts = row7FontNames
      .map(name => fonts.find(font => font.name === name))
      .filter(Boolean);

    // First BlankCard for row 7
    grid.push(
      <div
        key={`blank-row7-0`}
        style={{
          gridColumn: `1`,
          gridRow: '7',
          width: '288px',
          display: 'block',
          transform: 'translateX(154px)'
        }}
      >
        <BlankCard />
      </div>
    );

    // The 7 font cards for row 7
    row7Fonts.forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          style={{
            gridColumn: `${index + 2}`,
            gridRow: '7',
            width: '288px',
            display: 'block',
            transform: 'translateX(154px)'
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
          />
        </div>
      );
    });

    // Last BlankCard for row 7
    grid.push(
      <div
        key={`blank-row7-end`}
        style={{
          gridColumn: `9`,
          gridRow: '7',
          width: '288px',
          display: 'block',
          transform: 'translateX(154px)'
        }}
      >
        <BlankCard />
      </div>
    );
    // Add BlankCard at end of row 7
    grid.push(
      <div
        key={`blank-row7-end-10`}
        style={{
          gridColumn: `10`,
          gridRow: '7',
          width: '288px',
          display: 'block',
          transform: 'translateX(154px)'
        }}
      >
        <BlankCard />
      </div>
    );

    // Add these fonts to usedFontNames
    row7FontNames.forEach(name => usedFontNames.add(name));

    // Row 8: BlankCard, Noto Serif Display, Playfair Display, Bodoni Moda, Suranna, Domine, DM Serif Display, Abril Fatface, Chonburi
    const row8FontNames = [
      'Noto Serif Display',
      'Playfair Display',
      'Bodoni Moda',
      'Suranna',
      'Domine',
      'DM Serif Display',
      'Abril Fatface',
      'Chonburi'
    ];
    const row8Fonts = row8FontNames
      .map(name => fonts.find(font => font.name === name))
      .filter(Boolean);

    // First BlankCard for row 8
    grid.push(
      <div
        key={`blank-row8-0`}
        style={{
          gridColumn: `1`,
          gridRow: '8',
          width: '288px',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );

    // The 8 font cards for row 8
    row8Fonts.forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          style={{
            gridColumn: `${index + 2}`,
            gridRow: '8',
            width: '288px',
            display: 'block'
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
          />
        </div>
      );
    });

    // Add these fonts to usedFontNames
    row8FontNames.forEach(name => usedFontNames.add(name));

    // Row 9: BlankCard, Cormorant, Cormorant Garamond, EB Garamond, Crimson Text, Sorts Mill Goudy, Linden Hill, Rosarivo, Ultra
    const row9FontNames = [
      'Cormorant',
      'Cormorant Garamond',
      'EB Garamond',
      'Crimson Text',
      'Sorts Mill Goudy',
      'Linden Hill',
      'Rosarivo',
      'Ultra'
    ];
    const row9Fonts = row9FontNames
      .map(name => fonts.find(font => font.name === name))
      .filter(Boolean);

    // First BlankCard for row 9
    grid.push(
      <div
        key={`blank-row9-0`}
        style={{
          gridColumn: `1`,
          gridRow: '9',
          width: '288px',
          display: 'block',
          transform: 'translateX(154px)'
        }}
      >
        <BlankCard />
      </div>
    );

    // The 8 font cards for row 9
    row9Fonts.forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          style={{
            gridColumn: `${index + 2}`,
            gridRow: '9',
            width: '288px',
            display: 'block',
            transform: 'translateX(154px)'
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
          />
        </div>
      );
    });

    // Add these fonts to usedFontNames
    row9FontNames.forEach(name => usedFontNames.add(name));

    // Add BlankCard at end of row 9
    grid.push(
      <div
        key={`blank-row9-end-10`}
        style={{
          gridColumn: `10`,
          gridRow: '9',
          width: '288px',
          display: 'block',
          transform: 'translateX(154px)'
        }}
      >
        <BlankCard />
      </div>
    );

    // Row 10: 2 BlankCards, 7 font cards, 1 BlankCard at end
    const row10FontNames = [
      'Eczar',
      'Alike Angular',
      'Alike',
      'Young Serif',
      'Oldenburg',
      'BhuTuka Expanded One'
    ];
    const row10Fonts = row10FontNames
      .map(name => fonts.find(font => font.name === name))
      .filter(Boolean);

    // First 2 BlankCards for row 10
    for (let i = 0; i < 2; i++) {
      grid.push(
        <div
          key={`blank-row10-${i}`}
          style={{
            gridColumn: `${i + 1}`,
            gridRow: '10',
            width: '288px',
            display: 'block'
          }}
        >
          <BlankCard />
        </div>
      );
    }

    // The 7 font cards for row 10
    row10Fonts.forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          style={{
            gridColumn: `${index + 3}`,
            gridRow: '10',
            width: '288px',
            display: 'block'
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
          />
        </div>
      );
    });

    // Add these fonts to usedFontNames
    row10FontNames.forEach(name => usedFontNames.add(name));

    // Add BlankCard at end of row 10
    grid.push(
      <div
        key={`blank-row10-end-10`}
        style={{
          gridColumn: `10`,
          gridRow: '10',
          width: '288px',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );

    // Add BlankCard in column 9 for row 10
    grid.push(
      <div
        key={`blank-row10-col9`}
        style={{
          gridColumn: `9`,
          gridRow: '10',
          width: '288px',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );

    // Row 11: 2 BlankCards, 6 font cards, 1 BlankCard at end
    const row11FontNames = [
      'Montaga',
      'Kurale',
      'Gabriela',
      'Inknut Antiqua',
      'Special Elite',
      'Arbutus'
    ];
    const row11Fonts = row11FontNames
      .map(name => fonts.find(font => font.name === name))
      .filter(Boolean);

    // First 2 BlankCards for row 11
    for (let i = 0; i < 2; i++) {
      grid.push(
        <div
          key={`blank-row11-${i}`}
          style={{
            gridColumn: `${i + 1}`,
            gridRow: '11',
            width: '288px',
            display: 'block',
            transform: 'translateX(154px)'
          }}
        >
          <BlankCard />
        </div>
      );
    }

    // The 6 font cards for row 11
    row11Fonts.forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          style={{
            gridColumn: `${index + 3}`,
            gridRow: '11',
            width: '288px',
            display: 'block',
            transform: 'translateX(154px)'
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
          />
        </div>
      );
    });

    // Add these fonts to usedFontNames
    row11FontNames.forEach(name => usedFontNames.add(name));

    // Add BlankCard at end of row 11
    grid.push(
      <div
        key={`blank-row11-end-10`}
        style={{
          gridColumn: `10`,
          gridRow: '11',
          width: '288px',
          display: 'block',
          transform: 'translateX(154px)'
        }}
      >
        <BlankCard />
      </div>
    );

    // Add BlankCard in column 9 for row 11
    grid.push(
      <div
        key={`blank-row11-col9`}
        style={{
          gridColumn: `9`,
          gridRow: '11',
          width: '288px',
          display: 'block',
          transform: 'translateX(154px)'
        }}
      >
        <BlankCard />
      </div>
    );

    // Row 12: BlankCard, Elsie, Elsie Swash Caps, Almendra, Luxurious Roman, Kotta One, BlankCard, Diplomata, BlankCard
    const row12FontNames = [
      'Elsie',
      'Elsie Swash Caps',
      'Almendra',
      'Luxurious Roman',
      'Kotta One',
      'Diplomata'
    ];
    const row12Fonts = row12FontNames
      .map(name => fonts.find(font => font.name === name))
      .filter(Boolean);

    console.log('row12FontNames', row12FontNames);
    console.log('fonts', fonts.map(f => f.name));
    console.log('row12Fonts', row12Fonts);

    // First BlankCard for row 12
    grid.push(
      <div
        key={`blank-row12-0`}
        style={{
          gridColumn: `1`,
          gridRow: '12',
          width: '288px',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );

    // The first 5 font cards for row 12
    row12Fonts.slice(0, 5).forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          style={{
            gridColumn: `${index + 2}`,
            gridRow: '12',
            width: '288px',
            display: 'block'
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
          />
        </div>
      );
    });

    // Second BlankCard for row 12
    grid.push(
      <div
        key={`blank-row12-1`}
        style={{
          gridColumn: `6`,
          gridRow: '12',
          width: '288px',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );

    // Third BlankCard for row 12
    grid.push(
      <div
        key={`blank-row12-2`}
        style={{
          gridColumn: `10`,
          gridRow: '12',
          width: '288px',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );

    return grid;
  };

  return (
    <div
      ref={gridContainerRef}
      style={{
        position: 'relative',
        width: '288px',
        height: '196px',
        backgroundColor: '#F3F4FA',
        borderRadius: '20px',
        padding: '20px',
        display: 'block',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {renderGrid()}
    </div>
  );
};

export default FontMap;