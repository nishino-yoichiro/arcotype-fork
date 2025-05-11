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
        width: '250px',
        height: '170px',
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
  const cardPaddingLeft = 30;
  const cardPaddingRight = 30;
  // Determine if the font name is a single word
  const isSingleWord = fontName.trim().split(' ').length === 1;
  // Font size and top padding rules
  let fontNameFontSize = 32;
  let cardPaddingTop = 40;
  if (isSingleWord && isTwoLines) {
    fontNameFontSize = 24;
    cardPaddingTop = 40;
  } else if (isTwoLines) {
    fontNameFontSize = 28;
    cardPaddingTop = 34;
  }
  const cardPaddingBottom = 32;

  return (
    <div
      style={{
        position: 'relative',
        width: '250px',
        height: '170px',
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
          fontSize: `${fontNameFontSize}px`,
          fontWeight: 400,
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
            fontSize: '12px',
            color: '#000',
            opacity: 1,
            margin: 0,
          }}
        >
          {fontName}
        </p>
        <p
          style={{
            fontFamily: 'Inter',
            fontSize: '12px',
            color: '#000',
            opacity: 0.6,
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

  // --- Two-finger panning state ---
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  const lastTouches = useRef<TouchList | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  // Touch event handlers for two-finger panning
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      setIsPanning(true);
      lastTouches.current = e.touches;
    }
  };
  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isPanning && e.touches.length === 2 && lastTouches.current) {
      const prevArr = [];
      const currArr = [];
      for (let i = 0; i < 2; i++) {
        prevArr.push(lastTouches.current[i]);
        currArr.push(e.touches[i]);
      }
      if (prevArr.length === 2 && currArr.length === 2) {
        const dx = ((currArr[0].clientX + currArr[1].clientX) - (prevArr[0].clientX + prevArr[1].clientX)) / 2;
        const dy = ((currArr[0].clientY + currArr[1].clientY) - (prevArr[0].clientY + prevArr[1].clientY)) / 2;
        setGridPos(pos => ({ x: pos.x + dx, y: pos.y + dy }));
      }
      lastTouches.current = e.touches;
    }
  };
  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      setIsPanning(false);
      lastTouches.current = null;
    }
  };

  // Wheel event handler for trackpad two-finger panning
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) return; // ignore pinch-zoom
    if (e.deltaX !== 0 || e.deltaY !== 0) {
      setGridPos(pos => ({ x: pos.x - e.deltaX, y: pos.y - e.deltaY }));
      e.preventDefault();
    }
  };

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
            width: '250px',
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
          width: '250px',
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
          width: '250px',
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
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 2}`,
            gridRow: '2',
            width: '250px',
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
          width: '250px',
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
          width: '250px',
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
          width: '250px',
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
          width: '250px',
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
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 2}`,
            gridRow: '3',
            width: '250px',
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
          width: '250px',
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
          width: '250px',
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
          width: '250px',
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
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 2}`,
            gridRow: '4',
            width: '250px',
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
          width: '250px',
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
          width: '250px',
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
          width: '250px',
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
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 2}`,
            gridRow: '5',
            width: '250px',
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
          width: '250px',
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
          width: '250px',
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
          width: '250px',
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
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 2}`,
            gridRow: '6',
            width: '250px',
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
            width: '250px',
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
          width: '250px',
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
          width: '250px',
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
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 2}`,
            gridRow: '7',
            width: '250px',
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
          width: '250px',
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
          width: '250px',
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
          width: '250px',
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
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 2}`,
            gridRow: '8',
            width: '250px',
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
          width: '250px',
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
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 2}`,
            gridRow: '9',
            width: '250px',
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
          width: '250px',
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
            width: '250px',
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
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 3}`,
            gridRow: '10',
            width: '250px',
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
          width: '250px',
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
          width: '250px',
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
            width: '250px',
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
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 3}`,
            gridRow: '11',
            width: '250px',
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
          width: '250px',
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
          width: '250px',
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
          width: '250px',
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
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 2}`,
            gridRow: '12',
            width: '250px',
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
          gridColumn: `7`,
          gridRow: '12',
          width: '250px',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );

    const diplomataFont = row12Fonts[5];
    if (diplomataFont) {
      grid.push(
        <div
          key={diplomataFont.id}
          ref={el => { cardRefs.current[diplomataFont.id] = el; }}
          style={{
            gridColumn: `8`,
            gridRow: '12',
            width: '250px',
            display: 'block'
          }}
        >
          <FontCard
            fontName={diplomataFont.name}
            foundry={diplomataFont.designer}
            isSelected={selectedFontId === diplomataFont.id}
            onClick={() => onSelectFont(diplomataFont.id)}
          />
        </div>
      );
    }

    // Last BlankCard for row 12
    grid.push(
      <div
        key={`blank-row12-end`}
        style={{
          gridColumn: `9`,
          gridRow: '12',
          width: '250px',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );
    // Add BlankCard at end of row 12
    grid.push(
      <div
        key={`blank-row12-end-10`}
        style={{
          gridColumn: `10`,
          gridRow: '12',
          width: '250px',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );

    // Row 13: BlankCard, Bigelow Rules, Mountains of Christmas, Emilys Candy, Paprika, Langar, BlankCard, Diplomata SC, BlankCard
    const row13FontNames = [
      'Bigelow Rules',
      'Mountains of Christmas',
      'Emilys Candy',
      'Paprika',
      'Langar',
      'Diplomata SC'
    ];
    const row13Fonts = row13FontNames
      .map(name => fonts.find(font => font.name === name))
      .filter(Boolean);

    // First BlankCard for row 13
    grid.push(
      <div
        key={`blank-row13-0`}
        style={{
          gridColumn: `1`,
          gridRow: '13',
          width: '250px',
          display: 'block',
          transform: 'translateX(154px)'
        }}
      >
        <BlankCard />
      </div>
    );

    // The first 5 font cards for row 13
    row13Fonts.slice(0, 5).forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 2}`,
            gridRow: '13',
            width: '250px',
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

    // Second BlankCard for row 13 (column 7)
    grid.push(
      <div
        key={`blank-row13-1`}
        style={{ 
          gridColumn: `7`,
          gridRow: '13',
          width: '250px',
          display: 'block',
          transform: 'translateX(154px)'
        }}
      >
        <BlankCard />
      </div>
    );

    // Diplomata SC font card (column 8)
    const diplomataSCFont = row13Fonts[5];
    if (diplomataSCFont) {
      grid.push(
        <div
          key={diplomataSCFont.id}
          ref={el => { cardRefs.current[diplomataSCFont.id] = el; }}
          style={{
            gridColumn: `8`,
            gridRow: '13',
            width: '250px',
            display: 'block',
            transform: 'translateX(154px)'
          }}
        >
          <FontCard
            fontName={diplomataSCFont.name}
            foundry={diplomataSCFont.designer}
            isSelected={selectedFontId === diplomataSCFont.id}
            onClick={() => onSelectFont(diplomataSCFont.id)}
          />
        </div>
      );
    }

    // Last BlankCard for row 13 (column 9)
    grid.push(
      <div
        key={`blank-row13-end`}
        style={{
          gridColumn: `9`,
          gridRow: '13',
          width: '250px',
          display: 'block',
          transform: 'translateX(154px)'
        }}
      >
        <BlankCard />
      </div>
    );
    // Add BlankCard at end of row 13
    grid.push(
      <div
        key={`blank-row13-end-10`}
        style={{
          gridColumn: `10`,
          gridRow: '13',
          width: '250px',
          display: 'block',
          transform: 'translateX(154px)'
        }}
      >
        <BlankCard />
      </div>
    );

    // Row 14: 9 BlankCards
    for (let i = 0; i < 9; i++) {
      grid.push(
        <div
          key={`blank-row14-${i}`}
          style={{
            gridColumn: `${i + 1}`,
            gridRow: '14',
            width: '250px',
            display: 'block'
          }}
        >
          <BlankCard />
        </div>
      );
    }
    // Add BlankCard at end of row 14
    grid.push(
      <div
        key={`blank-row14-end-10`}
        style={{
          gridColumn: `10`,
          gridRow: '14',
          width: '250px',
          display: 'block'
        }}
      >
        <BlankCard />
      </div>
    );

    return grid;
  };

  // Center the selected card when centeredFontId changes
  useEffect(() => {
    if (!centeredFontId) return;
    const card = cardRefs.current[centeredFontId];
    const gridContainer = gridContainerRef.current;
    if (card && gridContainer) {
      const cardRect = card.getBoundingClientRect();
      const containerRect = gridContainer.getBoundingClientRect();
      // Calculate the offset needed to center the card
      const dx = cardRect.left - containerRect.left - (containerRect.width / 2) + (cardRect.width / 2) - 200;
      const dy = cardRect.top - containerRect.top - (containerRect.height / 2) + (cardRect.height / 2) + 5;
      setGridPos(pos => ({ x: pos.x - dx, y: pos.y - dy }));
    }
  }, [centeredFontId]);

  return (
    <div
      style={{ width: '100%', overflow: 'hidden', height: '100%', touchAction: 'none' }}
      ref={gridContainerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
    >
      <motion.div
        animate={gridPos}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 40,
          mass: 1,
          duration: 0.8,
          restDelta: 0.8
        }}
        style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 250px)',
          gridTemplateRows: 'repeat(14, 170px)',
          gap: '16px',
          padding: 0,
          width: 'max-content',
          willChange: 'transform',
        }}
      >
        {renderGrid()}
      </motion.div>
    </div>
  );
};

export default FontMap;