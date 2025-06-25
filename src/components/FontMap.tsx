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
  testerTextTop?: string;
}

const FontCard: React.FC<FontCardProps> = ({ 
  fontName, 
  foundry, 
  isSelected, 
  onClick,
  testerTextTop
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
  // List of extremely wide fonts that need special handling
const extraWideFonts = ['BhuTuka Expanded One', 'Diplomata', 'Diplomata SC'];

// Check if current font is in the extra wide list
const isExtraWide = extraWideFonts.includes(fontName);

// Determine if the font name is a single word
const isSingleWord = fontName.trim().split(' ').length === 1;

// Font size and top padding rules
let fontNameFontSize = 32;
let cardPaddingTop = 40;

if (isExtraWide) {
  // Special handling for extremely wide fonts
  if (fontName === 'BhuTuka Expanded One') {
    fontNameFontSize = 24; // Much smaller for this ultra-wide font
    cardPaddingTop = 28;   // Adjust padding to center
  } else if (fontName === 'Diplomata' || fontName === 'Diplomata SC') {
    fontNameFontSize = 20; // Smaller for Diplomata fonts
    cardPaddingTop = 36;   // Adjust padding to center
  }
} else if (isSingleWord && isTwoLines) {
  fontNameFontSize = 24;
  cardPaddingTop = 40;
} else if (isTwoLines) {
  fontNameFontSize = 28;
  cardPaddingTop = 34;
}

// Alternative approach with more granular control:
// You could also add letter-spacing adjustments for these fonts
let letterSpacing = 'normal';
if (isExtraWide) {
  letterSpacing = '-1.5px'; // Decrease letter spacing by 3% for extra wide fonts
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
          letterSpacing: letterSpacing,
        }}
      >
        {testerTextTop ? testerTextTop : fontName}
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
  onSelectFont: (id: string) => void;
  centeredFontId?: string | null;
  testerTextTop?: string;
  fonts?: any[];
  gridPos: { x: number; y: number };
  setGridPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
}

// Custom hook to prevent browser navigation gestures
function usePreventBrowserNavigation() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const preventDefault = (e: Event) => e.preventDefault();
    const handlers = [
      ['wheel', preventDefault, { passive: false }],
      ['touchstart', preventDefault, { passive: false }],
      ['touchmove', preventDefault, { passive: false }],
      ['dragstart', preventDefault],
      ['contextmenu', preventDefault],
    ] as const;
    handlers.forEach(([event, handler, options]) => {
      el.addEventListener(event, handler, options);
    });
    return () => {
      handlers.forEach(([event, handler]) => {
        el.removeEventListener(event, handler);
      });
    };
  }, []);
  return ref;
}

const FontMap: React.FC<FontMapProps> = ({ selectedFontId, onSelectFont, centeredFontId, testerTextTop, fonts: customFonts, gridPos, setGridPos }) => {
  const { fonts: storeFonts } = useFontStore();
  const fontList = customFonts || storeFonts;

  // For autoscroll: refs for each FontCard
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Add refs for container and grid
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Helper to clamp gridPos so grid never leaves more than -50px gap (cropped)
  function clampGridPos(x: number, y: number) {
    const container = containerRef.current;
    const grid = gridRef.current;
    if (!container || !grid) return { x, y };
    const containerRect = container.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    const gridWidth = grid.offsetWidth;
    const gridHeight = grid.offsetHeight;
    // The grid's top-left corner (0,0) is relative to the container
    // The gridPos.x/y is the translation applied to the grid
    // We want:
    //   - grid left edge >= -maxLeft (so right edge is at least -50px inside container)
    //   - grid left edge <= minLeft (so left edge is at most -50px inside container)
    const margin = -80;
    const leftCrop = 120;
    const minX = Math.min(margin - leftCrop, containerWidth - gridWidth - margin);
    const maxX = margin - leftCrop;
    const minY = Math.min(margin, containerHeight - gridHeight - margin);
    const maxY = margin;
    return {
      x: Math.max(minX, Math.min(x, maxX)),
      y: Math.max(minY, Math.min(y, maxY)),
    };
  }

  // --- Two-finger panning state ---
  const lastTouches = useRef<{ clientX: number; clientY: number }[]>([]);
  const [isPanning, setIsPanning] = useState(false);

  // Touch event handlers for two-finger panning
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      setIsPanning(true);
      lastTouches.current = Array.from(e.touches).map(touch => ({
        clientX: touch.clientX,
        clientY: touch.clientY
      }));
    }
  };
  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isPanning && e.touches.length === 2 && lastTouches.current.length === 2) {
      const prevArr = lastTouches.current;
      const currArr = Array.from(e.touches).map(touch => ({
        clientX: touch.clientX,
        clientY: touch.clientY
      }));
      if (prevArr.length === 2 && currArr.length === 2) {
        const dx = ((currArr[0].clientX + currArr[1].clientX) - (prevArr[0].clientX + prevArr[1].clientX)) / 2;
        const dy = ((currArr[0].clientY + currArr[1].clientY) - (prevArr[0].clientY + prevArr[1].clientY)) / 2;
        setGridPos(pos => clampGridPos(pos.x + dx, pos.y + dy));
      }
      lastTouches.current = currArr;
    }
  };
  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      setIsPanning(false);
      lastTouches.current = [];
    }
  };

  // Wheel event handler for trackpad two-finger panning
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) return; // ignore pinch-zoom
    if (e.deltaX !== 0) {
      setGridPos(pos => clampGridPos(pos.x - e.deltaX, pos.y - e.deltaY));
      e.preventDefault(); // Only prevent default for horizontal pans
    } else {
      setGridPos(pos => clampGridPos(pos.x - e.deltaX, pos.y - e.deltaY));
    }
  };

  const renderGrid = () => {
    const grid = [];
    // Helper to stagger even rows
    function getStaggeredTransform(rowNum: number) {
      return rowNum % 2 === 0 ? { transform: 'translateX(133px)' } : {};
    }
    // Helper to add two gray cards at the front of a row
    function addFrontGrayCards(rowNum: number) {
      for (let i = 0; i < 2; i++) {
        grid.push(
          <div
            key={`blank-row${rowNum}-front-${i}`}
            style={{
              gridColumn: `${i + 1}`,
              gridRow: `${rowNum}`,
              width: '250px',
              display: 'block',
              ...getStaggeredTransform(rowNum)
            }}
          >
            <BlankCard />
          </div>
        );
      }
    }

    // Add a new row of gray BlankCards at the very top (row 1, 12 columns)
    addFrontGrayCards(1);
    for (let i = 2; i < 12; i++) {
      grid.push(
        <div
          key={`blank-row1-${i}`}
          style={{
            gridColumn: `${i + 1}`,
            gridRow: '1',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(1)
          }}
        >
          <BlankCard />
        </div>
      );
    }

    // Row 2 (all blank, 9 columns)
    addFrontGrayCards(2);
    for (let i = 2; i < 11; i++) {
      grid.push(
        <div
          key={`blank-row2-${i}`}
          style={{
            gridColumn: `${i + 1}`,
            gridRow: '2',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(2)
          }}
        >
          <BlankCard />
        </div>
      );
    }
    grid.push(
      <div
        key={`blank-row2-end`}
        style={{
          gridColumn: `12`,
          gridRow: '2',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(2)
        }}
      >
        <BlankCard />
      </div>
    );

    // Row 3: 2 gray, 1 blank, 6 fonts, 2 blanks after
    addFrontGrayCards(3);
    const row3FontNames = [
      'Stint Ultra Condensed',
      'Source Code Pro',
      'Roboto Mono',
      'Noto Sans Mono',
      'PT Mono',
      'Courier Prime'
    ];
    const row3Fonts = row3FontNames
      .map(name => fontList.find(font => font.name === name))
      .filter(Boolean);

    // First blank card
    grid.push(
      <div
        key={`blank-row3-0`}
        style={{
          gridColumn: `3`,
          gridRow: '3',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(3)
        }}
      >
        <BlankCard />
      </div>
    );
    // The 6 font cards
    const row3FontsFiltered = row3Fonts.filter(Boolean);
    row3FontsFiltered.forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 4}`,
            gridRow: '3',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(3)
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
            testerTextTop={testerTextTop}
          />
        </div>
      );
    });
    // Only 1 blank card after the last font
    grid.push(
      <div
        key={`blank-row3-after-fonts`}
        style={{
          gridColumn: `${row3FontsFiltered.length + 4}`,
          gridRow: '3',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(3)
        }}
      >
        <BlankCard />
      </div>
    );
    // One more blank card to fill 9 columns
    grid.push(
      <div
        key={`blank-row3-end`}
        style={{
          gridColumn: `11`,
          gridRow: '3',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(3)
        }}
      >
        <BlankCard />
      </div>
    );
    // Add BlankCard at end of row 3
    grid.push(
      <div
        key={`blank-row3-end-12`}
        style={{
          gridColumn: `12`,
          gridRow: '3',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(3)
        }}
      >
        <BlankCard />
      </div>
    );

    // Row 4: BlankCard, Maiden Orange, Slabo 27px, Fira Mono, IBM Plex Mono, Bree Serif, Josefin Slab, Rokkitt, BlankCard
    addFrontGrayCards(4);
    const row4FontNames = [
      'Maiden Orange',
      'Slabo 27px',
      'Fira Mono',
      'IBM Plex Mono',
      'Bree Serif',
      'Josefin Slab',
      'Rokkitt'
    ];
    const row4Fonts = row4FontNames
      .map(name => fontList.find(font => font.name === name))
      .filter(Boolean);

    grid.push(
      <div
        key={`blank-row4-0`}
        style={{
          gridColumn: `3`,
          gridRow: '4',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(4)
        }}
      >
        <BlankCard />
      </div>
    );
    const row4FontsFiltered = row4Fonts.filter(Boolean);
    row4FontsFiltered.forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 4}`,
            gridRow: '4',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(4)
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
            testerTextTop={testerTextTop}
          />
        </div>
      );
    });
    grid.push(
      <div
        key={`blank-row4-end`}
        style={{
          gridColumn: `11`,
          gridRow: '4',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(4)
        }}
      >
        <BlankCard />
      </div>
    );
    grid.push(
      <div
        key={`blank-row4-end-12`}
        style={{
          gridColumn: `12`,
          gridRow: '4',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(4)
        }}
      >
        <BlankCard />
      </div>
    );

    // Row 5: Andada Pro, Bitter, Aleo, Crete Round, Arvo, Quattrocento, Coustard
    addFrontGrayCards(5);
    const row5FontNames = [
      'Andada Pro',
      'Bitter',
      'Aleo',
      'Crete Round',
      'Arvo',
      'Quattrocento',
      'Coustard'
    ];
    const row5Fonts = row5FontNames
      .map(name => fontList.find(font => font.name === name))
      .filter(Boolean);

    grid.push(
      <div
        key={`blank-row5-0`}
        style={{
          gridColumn: `3`,
          gridRow: '5',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(5)
        }}
      >
        <BlankCard />
      </div>
    );
    const row5FontsFiltered = row5Fonts.filter(Boolean);
    row5FontsFiltered.forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 4}`,
            gridRow: '5',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(5)
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
            testerTextTop={testerTextTop}
          />
        </div>
      );
    });
    for (let col = row5FontsFiltered.length + 4; col <= 12; col++) {
      grid.push(
        <div
          key={`blank-row5-end-${col}`}
          style={{
            gridColumn: `${col}`,
            gridRow: '5',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(5)
          }}
        >
          <BlankCard />
        </div>
      );
    }

    // Track all used font names in a Set
    const usedFontNames = new Set([
      ...row3FontNames,
      ...row4FontNames,
      ...row5FontNames
    ]);

    // Row 6: Imbue, PT Serif, Noticia Text, Roboto Serif, Zilla Slab, Ovo, Alfa Slab One
    addFrontGrayCards(6);
    const row6FontNames = [
      'Imbue',
      'PT Serif',
      'Noticia Text',
      'Roboto Serif',
      'Zilla Slab',
      'Ovo',
      'Alfa Slab One'
    ];
    const row6Fonts = row6FontNames
      .map(name => fontList.find(font => font.name === name))
      .filter(Boolean);
    grid.push(
      <div
        key={`blank-row6-0`}
        style={{
          gridColumn: `3`,
          gridRow: '6',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(6)
        }}
      >
        <BlankCard />
      </div>
    );
    const row6FontsFiltered = row6Fonts.filter(Boolean);
    row6FontsFiltered.forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 4}`,
            gridRow: '6',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(6)
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
            testerTextTop={testerTextTop}
          />
        </div>
      );
    });
    // Fill the rest of the row with blank cards up to column 12
    for (let col = row6FontsFiltered.length + 4; col <= 12; col++) {
      grid.push(
        <div
          key={`blank-row6-end-${col}`}
          style={{
            gridColumn: `${col}`,
            gridRow: '6',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(6)
          }}
        >
          <BlankCard />
        </div>
      );
    }
    row6FontNames.forEach(name => usedFontNames.add(name));

    // Row 7: Xanh Mono, Bellefair, Merriweather, Source Serif, Headland One
    addFrontGrayCards(7);
    const row7FontNames = [
      'Xanh Mono',
      'Bellefair',
      'Merriweather',
      'Source Serif',
      'Headland One'
    ];
    const row7Fonts = row7FontNames
      .map(name => fontList.find(font => font.name === name))
      .filter(Boolean);
    grid.push(
      <div
        key={`blank-row7-0`}
        style={{
          gridColumn: `3`,
          gridRow: '7',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(7)
        }}
      >
        <BlankCard />
      </div>
    );
    row7Fonts.forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 4}`,
            gridRow: '7',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(7)
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
            testerTextTop={testerTextTop}
          />
        </div>
      );
    });
    // Fill the rest of the row with blank cards up to column 12
    for (let col = row7Fonts.length + 4; col <= 12; col++) {
      grid.push(
        <div
          key={`blank-row7-end-${col}`}
          style={{
            gridColumn: `${col}`,
            gridRow: '7',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(7)
          }}
        >
          <BlankCard />
        </div>
      );
    }
    row7FontNames.forEach(name => usedFontNames.add(name));

    // Now shift all subsequent rows (8–14) down by 1, update their gridRow numbers and variable names
    // For each row, increment the gridRow by 1 (e.g., row 8 becomes row 9, etc.)
    // Keep all the rest of the code for those rows, just update their gridRow numbers and any comments/variable names as needed

    // Row 8: Instrument Serif, Spectral, Newsreader, Libre Baskerville, Lora, IBM Plex Serif, Fraunces
    addFrontGrayCards(8);
    const row8FontNames = [
      'Instrument Serif',
      'Spectral',
      'Newsreader',
      'Libre Baskerville',
      'Lora',
      'IBM Plex Serif',
      'Fraunces'
    ];
    const row8Fonts = row8FontNames
      .map(name => fontList.find(font => font.name === name))
      .filter(Boolean);

    // First BlankCard for row 8
    grid.push(
      <div
        key={`blank-row8-0`}
        style={{
          gridColumn: `3`,
          gridRow: '8',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(8)
        }}
      >
        <BlankCard />
      </div>
    );

    // The 7 font cards for row 8
    row8Fonts.forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 4}`,
            gridRow: '8',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(8)
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
            testerTextTop={testerTextTop}
          />
        </div>
      );
    });

    // Add BlankCard after Fraunces (last font in row 8)
    grid.push(
      <div
        key={`blank-row8-after-fraunces`}
        style={{
          gridColumn: `${row8Fonts.length + 4}`,
          gridRow: '8',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(8)
        }}
      >
        <BlankCard />
      </div>
    );

    // Add BlankCard at end of row 8
    grid.push(
      <div
        key={`blank-row8-end-12`}
        style={{
          gridColumn: `12`,
          gridRow: '8',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(8)
        }}
      >
        <BlankCard />
      </div>
    );

    // Add these fonts to usedFontNames
    row8FontNames.forEach(name => usedFontNames.add(name));

    // Row 9: BlankCard, Noto Serif Display, Playfair Display, Bodoni Moda, Suranna, Domine, DM Serif Display, Abril Fatface, Chonburi
    addFrontGrayCards(9);
    const row9FontNames = [
      'Noto Serif Display',
      'Playfair Display',
      'Bodoni Moda',
      'Suranna',
      'Domine',
      'DM Serif Display',
      'Abril Fatface',
      'Chonburi'
    ];
    const row9Fonts = row9FontNames
      .map(name => fontList.find(font => font.name === name))
      .filter(Boolean);

    // First BlankCard for row 9
    grid.push(
      <div
        key={`blank-row9-0`}
        style={{
          gridColumn: `3`,
          gridRow: '9',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(9)
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
            gridColumn: `${index + 4}`,
            gridRow: '9',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(9)
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
            testerTextTop={testerTextTop}
          />
        </div>
      );
    });

    // Add BlankCard after Chonburi (last font in row 9)
    grid.push(
      <div
        key={`blank-row9-after-chonburi`}
        style={{
          gridColumn: `${row9Fonts.length + 4}`,
          gridRow: '9',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(9)
        }}
      >
        <BlankCard />
      </div>
    );

    // Add these fonts to usedFontNames
    row9FontNames.forEach(name => usedFontNames.add(name));

    // Row 10: BlankCard, Cormorant, Cormorant Garamond, EB Garamond, Crimson Text, Sorts Mill Goudy, Linden Hill, Rosarivo, Ultra
    addFrontGrayCards(10);
    const row10FontNames = [
      'Cormorant',
      'Cormorant Garamond',
      'EB Garamond',
      'Crimson Text',
      'Sorts Mill Goudy',
      'Linden Hill',
      'Rosarivo',
      'Ultra'
    ];
    const row10Fonts = row10FontNames
      .map(name => fontList.find(font => font.name === name))
      .filter(Boolean);

    // First BlankCard for row 10
    grid.push(
      <div
        key={`blank-row10-0`}
        style={{
          gridColumn: `3`,
          gridRow: '10',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(10)
        }}
      >
        <BlankCard />
      </div>
    );

    // The 8 font cards for row 10
    row10Fonts.forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 4}`,
            gridRow: '10',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(10)
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
            testerTextTop={testerTextTop}
          />
        </div>
      );
    });

    // Add these fonts to usedFontNames
    row10FontNames.forEach(name => usedFontNames.add(name));

    // Add BlankCard at end of row 10
    grid.push(
      <div
        key={`blank-row10-end-12`}
        style={{
          gridColumn: `12`,
          gridRow: '10',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(10)
        }}
      >
        <BlankCard />
      </div>
    );

    // Row 11: 2 BlankCards, 6 font cards, 2 BlankCards at end
    addFrontGrayCards(11);
    const row11FontNames = [
      'Eczar',
      'Alike Angular',
      'Alike',
      'Young Serif',
      'Oldenburg',
      'BhuTuka Expanded One'
    ];
    const row11Fonts = row11FontNames
      .map(name => fontList.find(font => font.name === name))
      .filter(Boolean);

    // First 2 BlankCards for row 11
    for (let i = 0; i < 2; i++) {
      grid.push(
        <div
          key={`blank-row11-${i}`}
          style={{
            gridColumn: `${i + 3}`,
            gridRow: '11',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(11)
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
            gridColumn: `${index + 5}`,
            gridRow: '11',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(11)
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
            testerTextTop={testerTextTop}
          />
        </div>
      );
    });

    // Add these fonts to usedFontNames
    row11FontNames.forEach(name => usedFontNames.add(name));

    // Add BlankCard at end of row 11
    grid.push(
      <div
        key={`blank-row11-end-12`}
        style={{
          gridColumn: `12`,
          gridRow: '11',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(11)
        }}
      >
        <BlankCard />
      </div>
    );

    // Add BlankCard in column 11 for row 11
    grid.push(
      <div
        key={`blank-row11-col11`}
        style={{
          gridColumn: `11`,
          gridRow: '11',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(11)
        }}
      >
        <BlankCard />
      </div>
    );

    // Row 12: 2 BlankCards, 6 font cards, 2 BlankCards at end
    addFrontGrayCards(12);
    const row12FontNames = [
      'Montaga',
      'Kurale',
      'Gabriela',
      'Inknut Antiqua',
      'Special Elite',
      'Arbutus'
    ];
    const row12Fonts = row12FontNames
      .map(name => fontList.find(font => font.name === name))
      .filter(Boolean);

    // First 2 BlankCards for row 12
    for (let i = 0; i < 2; i++) {
      grid.push(
        <div
          key={`blank-row12-${i}`}
          style={{
            gridColumn: `${i + 3}`,
            gridRow: '12',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(12)
          }}
        >
          <BlankCard />
        </div>
      );
    }

    // The 6 font cards for row 12
    row12Fonts.forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 5}`,
            gridRow: '12',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(12)
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
            testerTextTop={testerTextTop}
          />
        </div>
      );
    });

    // Add these fonts to usedFontNames
    row12FontNames.forEach(name => usedFontNames.add(name));

    // Add BlankCard at end of row 12
    grid.push(
      <div
        key={`blank-row12-end-12`}
        style={{
          gridColumn: `12`,
          gridRow: '12',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(12)
        }}
      >
        <BlankCard />
      </div>
    );

    // Add BlankCard in column 11 for row 12
    grid.push(
      <div
        key={`blank-row12-col11`}
        style={{
          gridColumn: `11`,
          gridRow: '12',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(12)
        }}
      >
        <BlankCard />
      </div>
    );

    // Row 13: BlankCard, Elsie, Elsie Swash Caps, Almendra, Luxurious Roman, Kotta One, BlankCard, Diplomata, BlankCard
    addFrontGrayCards(13);
    const row13FontNames = [
      'Elsie',
      'Elsie Swash Caps',
      'Almendra',
      'Luxurious Roman',
      'Kotta One',
      'Diplomata'
    ];
    const row13Fonts = row13FontNames
      .map(name => fontList.find(font => font.name === name))
      .filter(Boolean);

    console.log('row13FontNames', row13FontNames);
    console.log('fonts', fontList.map(f => f.name));
    console.log('row13Fonts', row13Fonts);

    // First BlankCard for row 13
    grid.push(
      <div
        key={`blank-row13-0`}
        style={{
          gridColumn: `3`,
          gridRow: '13',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(13)
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
            gridColumn: `${index + 4}`,
            gridRow: '13',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(13)
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
            testerTextTop={testerTextTop}
          />
        </div>
      );
    });

    // Second BlankCard for row 13
    grid.push(
      <div
        key={`blank-row13-1`}
        style={{
          gridColumn: `9`,
          gridRow: '13',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(13)
        }}
      >
        <BlankCard />
      </div>
    );

    const diplomataFont = row13Fonts[5];
    if (diplomataFont) {
      grid.push(
        <div
          key={diplomataFont.id}
          ref={el => { cardRefs.current[diplomataFont.id] = el; }}
          style={{
            gridColumn: `10`,
            gridRow: '13',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(13)
          }}
        >
          <FontCard
            fontName={diplomataFont.name}
            foundry={diplomataFont.designer}
            isSelected={selectedFontId === diplomataFont.id}
            onClick={() => onSelectFont(diplomataFont.id)}
            testerTextTop={testerTextTop}
          />
        </div>
      );
    }

    // Last BlankCard for row 13
    grid.push(
      <div
        key={`blank-row13-end`}
        style={{
          gridColumn: `11`,
          gridRow: '13',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(13)
        }}
      >
        <BlankCard />
      </div>
    );
    // Add BlankCard at end of row 13
    grid.push(
      <div
        key={`blank-row13-end-12`}
        style={{
          gridColumn: `12`,
          gridRow: '13',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(13)
        }}
      >
        <BlankCard />
      </div>
    );

    // Row 14: BlankCard, Bigelow Rules, Mountains of Christmas, Emilys Candy, Paprika, Langar, BlankCard, Diplomata SC, BlankCard
    addFrontGrayCards(14);
    const row14FontNames = [
      'Bigelow Rules',
      'Mountains of Christmas',
      'Emilys Candy',
      'Paprika',
      'Langar',
      'Diplomata SC'
    ];
    const row14Fonts = row14FontNames
      .map(name => fontList.find(font => font.name === name))
      .filter(Boolean);

    // First BlankCard for row 14
    grid.push(
      <div
        key={`blank-row14-0`}
        style={{
          gridColumn: `3`,
          gridRow: '14',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(14)
        }}
      >
        <BlankCard />
      </div>
    );

    // The first 5 font cards for row 14
    row14Fonts.slice(0, 5).forEach((font, index) => {
      if (!font) return;
      grid.push(
        <div
          key={font.id}
          ref={el => { cardRefs.current[font.id] = el; }}
          style={{
            gridColumn: `${index + 4}`,
            gridRow: '14',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(14)
          }}
        >
          <FontCard
            fontName={font.name}
            foundry={font.designer}
            isSelected={selectedFontId === font.id}
            onClick={() => onSelectFont(font.id)}
            testerTextTop={testerTextTop}
          />
        </div>
      );
    });

    // Second BlankCard for row 14 (column 9)
    grid.push(
      <div
        key={`blank-row14-1`}
        style={{ 
          gridColumn: `9`,
          gridRow: '14',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(14)
        }}
      >
        <BlankCard />
      </div>
    );

    // Diplomata SC font card (column 10)
    const diplomataSCFont = row14Fonts[5];
    if (diplomataSCFont) {
      grid.push(
        <div
          key={diplomataSCFont.id}
          ref={el => { cardRefs.current[diplomataSCFont.id] = el; }}
          style={{
            gridColumn: `10`,
            gridRow: '14',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(14)
          }}
        >
          <FontCard
            fontName={diplomataSCFont.name}
            foundry={diplomataSCFont.designer}
            isSelected={selectedFontId === diplomataSCFont.id}
            onClick={() => onSelectFont(diplomataSCFont.id)}
            testerTextTop={testerTextTop}
          />
        </div>
      );
    }

    // Last BlankCard for row 14 (column 11)
    grid.push(
      <div
        key={`blank-row14-end`}
        style={{
          gridColumn: `11`,
          gridRow: '14',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(14)
        }}
      >
        <BlankCard />
      </div>
    );
    // Add BlankCard at end of row 14
    grid.push(
      <div
        key={`blank-row14-end-12`}
        style={{
          gridColumn: `12`,
          gridRow: '14',
          width: '250px',
          display: 'block',
          ...getStaggeredTransform(14)
        }}
      >
        <BlankCard />
      </div>
    );

    // Row 15: 10 BlankCards
    addFrontGrayCards(15);
    for (let i = 0; i < 10; i++) {
      grid.push(
        <div
          key={`blank-row15-${i}`}
          style={{
            gridColumn: `${i + 3}`,
            gridRow: '15',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(15)
          }}
        >
          <BlankCard />
        </div>
      );
    }

    // Row 16: 10 BlankCards at the very bottom
    addFrontGrayCards(16);
    for (let i = 2; i < 12; i++) {
      grid.push(
        <div
          key={`blank-row16-${i}`}
          style={{
            gridColumn: `${i + 1}`,
            gridRow: '16',
            width: '250px',
            display: 'block',
            ...getStaggeredTransform(16)
          }}
        >
          <BlankCard />
        </div>
      );
    }

    return grid;
  };

  // Center the selected card when centeredFontId changes
  useEffect(() => {
    if (!centeredFontId) return;
    const card = cardRefs.current[centeredFontId];
    if (card) {
      const cardRect = card.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        // Calculate the offset needed to center the card
        const dx = cardRect.left - containerRect.left - (containerRect.width / 2) + (cardRect.width / 2) - 200;
        const dy = cardRect.top - containerRect.top - (containerRect.height / 2) + (cardRect.height / 2) + 5;
        setGridPos(pos => ({ x: pos.x - dx, y: pos.y - dy }));
      }
    }
  }, [centeredFontId]);

  // Use the custom hook for the map container
  const mapRef = usePreventBrowserNavigation();

  return (
    <div
      ref={el => {
        mapRef.current = el;
        containerRef.current = el;
      }}
      style={{ width: '100%', overflow: 'hidden', height: '100%', touchAction: 'none', overscrollBehavior: 'none' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
    >
      <motion.div
        ref={gridRef}
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
          gridTemplateRows: 'repeat(15, 170px)',
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