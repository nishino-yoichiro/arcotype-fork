import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fontConfigs } from '../lib/fontConfig';

// Custom hook to prevent browser navigation gestures (copied from FontMap.tsx)
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

interface MostUsedFontMapProps {
  selectedFontId: string | null;
  onSelectFont: (id: string) => void;
  centeredFontId?: string | null;
  testerTextTop?: string;
  fonts?: any[];
  gridPos: { x: number; y: number };
  setGridPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
}

// Updated BlankCard styling to match FontCard
const BlankCard: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div
    style={{
      position: 'relative',
      width: '250px',
      height: '170px',
      backgroundColor: '#F3F4FA',
      borderRadius: '20px',
      padding: '20px',
      display: 'block',
      boxSizing: 'border-box',
      boxShadow: 'none',
      cursor: 'pointer',
      overflow: 'hidden',
      transition: 'background 0.55s, box-shadow 0.58s',
      ...style,
    }}
  />
);

// FontCard styled as in FontMap.tsx
const FontCard: React.FC<{
  fontName: string;
  foundry: string;
  testerTextTop?: string;
  isActive?: boolean;
  onClick?: () => void;
}> = ({ fontName, foundry, testerTextTop, isActive, onClick }) => {
  const cardPaddingLeft = 30;
  const cardPaddingRight = 30;
  const cardPaddingBottom = 32;
  const fontConfig = fontConfigs[fontName.trim()];
  const fontNameRef = useRef<HTMLHeadingElement>(null);
  const [isTwoLines, setIsTwoLines] = useState(false);
  const [hovered, setHovered] = useState(false);

  // List of extremely wide fonts that need special handling
  const extraWideFonts = ['BhuTuka Expanded One', 'Diplomata', 'Diplomata SC'];
  const isExtraWide = extraWideFonts.includes(fontName);
  const isSingleWord = fontName.trim().split(' ').length === 1;

  // Check if the font name wraps to 2 lines
  useEffect(() => {
    const checkLines = () => {
      if (fontNameRef.current) {
        setIsTwoLines(fontNameRef.current.offsetHeight > 40);
      }
    };
    checkLines();
    window.addEventListener('resize', checkLines);
    return () => window.removeEventListener('resize', checkLines);
  }, [fontName]);

  // Font size and top padding rules
  let fontNameFontSize = 32;
  let cardPaddingTop = 40;
  if (isExtraWide) {
    if (fontName === 'BhuTuka Expanded One') {
      fontNameFontSize = 24;
      cardPaddingTop = 28;
    } else if (fontName === 'Diplomata' || fontName === 'Diplomata SC') {
      fontNameFontSize = 20;
      cardPaddingTop = 36;
    }
  } else if (isSingleWord && isTwoLines) {
    fontNameFontSize = 24;
    cardPaddingTop = 40;
  } else if (isTwoLines) {
    fontNameFontSize = 28;
    cardPaddingTop = 34;
  }

  let letterSpacing: string | undefined = 'normal';
  if (isExtraWide) {
    letterSpacing = '-1.5px';
  }

  // Combine hover and active state for styling
  const active = hovered || isActive;

  console.log('FontCard', fontName, fontConfigs[fontName.trim()]);

  return (
    <div
      style={{
        position: 'relative',
        width: '250px',
        height: '170px',
        backgroundColor: active ? '#FFFFFF' : '#F3F4FA',
        borderRadius: '20px',
        paddingLeft: cardPaddingLeft,
        paddingRight: cardPaddingRight,
        boxSizing: 'border-box',
        boxShadow: active ? '0px 0px 16px 8px rgba(0,0,0,0.05)' : 'none',
        transition: 'background 0.55s, box-shadow 0.58s',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      onClick={() => {
        console.log('Font card clicked', fontName);
        onClick && onClick();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Large font name, absolutely positioned from top, centered */}
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

const row3FontNames = [
  'Dosis',
  'Mulish',
  'Urbanist',
  'Outfit',
  'Plus Jakarta Sans',
  'Lexend',
  'Poppins',
];

const row4FontNames = [
  'PT Sans Narrow',
  'Barlow',
  'Inter',
  'Jost',
  'Figtree',
  'Manrope',
  'Montserrat',
];

const row5FontNames = [
  'Roboto Condensed',
  'Roboto Flex',
  'Roboto',
  'Arimo',
  'Rubik',
  'Nunito Sans',
  'Red Hat Display',
];

const row6FontNames = [
  'Barlow Condensed',
  'PT Sans',
  'Lato',
  'Noto Sans',
  'Oxygen Sans',
  'Public Sans',
  'Libre Franklin',
];

const row7FontNames = [
  'Abel',
  'Fira Sans',
  'Open Sans',
  'Schibsted Grotesk',
  'Cabin',
  'Work Sans',
  'Archivo',
];

const row8FontNames = [
  'DM Sans',
  'IBM Plex Sans',
  'Source Sans 3',
  'Overpass',
  'M PLUS Rounded 1c',
  'Comfortaa',
  'Nunito',
];

const row9FontNames = [
  'Karla',
  'Titillium Web',
  'Exo 2',
  'Saira',
  'Ubuntu',
  'Sora',
  'Raleway',
];

const row10FontNames = [
  'Smooch Sans',
  'Share Tech',
  'Inconsolata',
  'Source Code Pro',
  'IBM Plex Mono',
  'Roboto Mono',
  'Space Grotesk',
];

const row11FontNames = [
  'Oswald',
  'Bebas Neue',
  'Fjalla One',
  'Anton',
  'Lilita One',
  'Archivo Black',
  'Alfa Slab One',
];

const row12FontNames = [
  'Slabo 27px',
  'Bitter',
  'Roboto Slab',
  'Merriweather',
  'Arvo',
  'Josefin Slab',
  'Zilla Slab',
];

const row13FontNames = [
  'PT Serif',
  'Noto Serif',
  'IBM Plex Serif',
  'Lora',
  'Libre Baskerville',
  'Playfair Display',
  'DM Serif Display',
];

const row14FontNames = [
  'Cormorant Garamond',
  'EB Garamond',
  'Crimson Text',
  'Caveat',
  'Dancing Script',
  'Lobster',
  'Pacifico',
];

const MostUsedFontMap: React.FC<MostUsedFontMapProps> = ({ selectedFontId, onSelectFont, centeredFontId, testerTextTop, fonts, gridPos, setGridPos }) => {
  // 16 rows x 13 columns
  const rows = 16;
  const cols = 13;
  const grid = [];

  // Helper to stagger even rows
  function getStaggeredTransform(rowNum: number) {
    return rowNum % 2 === 0 ? { transform: 'translateX(133px)' } : {};
  }

  // 1. Add cardRefs for each FontCard
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Row 3: 3 BlankCards, 7 FontCards, rest BlankCards
      if (row === 2) {
        if (col < 3) {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        } else if (col >= 3 && col < 10) {
          const fontName = row3FontNames[col - 3];
          const font = fonts?.find(f => f.name === fontName);
          grid.push(
            <div
              key={`fontcard-r${row}-c${col}`}
              ref={el => { if (font) cardRefs.current[font.id] = el; }}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <FontCard
                fontName={font?.name || fontName}
                foundry={font?.designer || ''}
                testerTextTop={testerTextTop}
                isActive={selectedFontId === font?.id}
                onClick={() => {
                  console.log('Font card clicked', font?.name || fontName);
                  if (font) onSelectFont(font.id);
                }}
              />
            </div>
          );
        } else {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        }
      }
      // Row 4: 3 BlankCards, 7 FontCards, rest BlankCards
      else if (row === 3) {
        if (col < 3) {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        } else if (col >= 3 && col < 10) {
          const fontName = row4FontNames[col - 3];
          const font = fonts?.find(f => f.name === fontName);
          grid.push(
            <div
              key={`fontcard-r${row}-c${col}`}
              ref={el => { if (font) cardRefs.current[font.id] = el; }}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <FontCard
                fontName={font?.name || fontName}
                foundry={font?.designer || ''}
                testerTextTop={testerTextTop}
                isActive={selectedFontId === font?.id}
                onClick={() => {
                  console.log('Font card clicked', font?.name || fontName);
                  if (font) onSelectFont(font.id);
                }}
              />
            </div>
          );
        } else {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        }
      }
      // Row 5: 3 BlankCards, 7 FontCards, rest BlankCards
      else if (row === 4) {
        if (col < 3) {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        } else if (col >= 3 && col < 10) {
          const fontName = row5FontNames[col - 3];
          const font = fonts?.find(f => f.name === fontName);
          grid.push(
            <div
              key={`fontcard-r${row}-c${col}`}
              ref={el => { if (font) cardRefs.current[font.id] = el; }}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <FontCard
                fontName={font?.name || fontName}
                foundry={font?.designer || ''}
                testerTextTop={testerTextTop}
                isActive={selectedFontId === font?.id}
                onClick={() => {
                  console.log('Font card clicked', font?.name || fontName);
                  if (font) onSelectFont(font.id);
                }}
              />
            </div>
          );
        } else {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        }
      }
      // Row 6: 3 BlankCards, 7 FontCards, rest BlankCards
      else if (row === 5) {
        if (col < 3) {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        } else if (col >= 3 && col < 10) {
          const fontName = row6FontNames[col - 3];
          const font = fonts?.find(f => f.name === fontName);
          grid.push(
            <div
              key={`fontcard-r${row}-c${col}`}
              ref={el => { if (font) cardRefs.current[font.id] = el; }}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <FontCard
                fontName={font?.name || fontName}
                foundry={font?.designer || ''}
                testerTextTop={testerTextTop}
                isActive={selectedFontId === font?.id}
                onClick={() => {
                  console.log('Font card clicked', font?.name || fontName);
                  if (font) onSelectFont(font.id);
                }}
              />
            </div>
          );
        } else {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        }
      }
      // Row 7: 3 BlankCards, 7 FontCards, rest BlankCards
      else if (row === 6) {
        if (col < 3) {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        } else if (col >= 3 && col < 10) {
          const fontName = row7FontNames[col - 3];
          const font = fonts?.find(f => f.name === fontName);
          grid.push(
            <div
              key={`fontcard-r${row}-c${col}`}
              ref={el => { if (font) cardRefs.current[font.id] = el; }}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <FontCard
                fontName={font?.name || fontName}
                foundry={font?.designer || ''}
                testerTextTop={testerTextTop}
                isActive={selectedFontId === font?.id}
                onClick={() => {
                  console.log('Font card clicked', font?.name || fontName);
                  if (font) onSelectFont(font.id);
                }}
              />
            </div>
          );
        } else {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        }
      }
      // Row 8: 3 BlankCards, 7 FontCards, rest BlankCards
      else if (row === 7) {
        if (col < 3) {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        } else if (col >= 3 && col < 10) {
          const fontName = row8FontNames[col - 3];
          const font = fonts?.find(f => f.name === fontName);
          grid.push(
            <div
              key={`fontcard-r${row}-c${col}`}
              ref={el => { if (font) cardRefs.current[font.id] = el; }}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <FontCard
                fontName={font?.name || fontName}
                foundry={font?.designer || ''}
                testerTextTop={testerTextTop}
                isActive={selectedFontId === font?.id}
                onClick={() => {
                  console.log('Font card clicked', font?.name || fontName);
                  if (font) onSelectFont(font.id);
                }}
              />
            </div>
          );
        } else {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        }
      }
      // Row 9: 3 BlankCards, 7 FontCards, rest BlankCards
      else if (row === 8) {
        if (col < 3) {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        } else if (col >= 3 && col < 10) {
          const fontName = row9FontNames[col - 3];
          const font = fonts?.find(f => f.name === fontName);
          grid.push(
            <div
              key={`fontcard-r${row}-c${col}`}
              ref={el => { if (font) cardRefs.current[font.id] = el; }}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <FontCard
                fontName={font?.name || fontName}
                foundry={font?.designer || ''}
                testerTextTop={testerTextTop}
                isActive={selectedFontId === font?.id}
                onClick={() => {
                  console.log('Font card clicked', font?.name || fontName);
                  if (font) onSelectFont(font.id);
                }}
              />
            </div>
          );
        } else {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        }
      }
      // Row 10: 3 BlankCards, 7 FontCards, rest BlankCards
      else if (row === 9) {
        if (col < 3) {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        } else if (col >= 3 && col < 10) {
          const fontName = row10FontNames[col - 3];
          const font = fonts?.find(f => f.name === fontName);
          grid.push(
            <div
              key={`fontcard-r${row}-c${col}`}
              ref={el => { if (font) cardRefs.current[font.id] = el; }}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <FontCard
                fontName={font?.name || fontName}
                foundry={font?.designer || ''}
                testerTextTop={testerTextTop}
                isActive={selectedFontId === font?.id}
                onClick={() => {
                  console.log('Font card clicked', font?.name || fontName);
                  if (font) onSelectFont(font.id);
                }}
              />
            </div>
          );
        } else {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        }
      }
      // Row 11: 3 BlankCards, 7 FontCards, rest BlankCards
      else if (row === 10) {
        if (col < 3) {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        } else if (col >= 3 && col < 10) {
          const fontName = row11FontNames[col - 3];
          const font = fonts?.find(f => f.name === fontName);
          grid.push(
            <div
              key={`fontcard-r${row}-c${col}`}
              ref={el => { if (font) cardRefs.current[font.id] = el; }}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <FontCard
                fontName={font?.name || fontName}
                foundry={font?.designer || ''}
                testerTextTop={testerTextTop}
                isActive={selectedFontId === font?.id}
                onClick={() => {
                  console.log('Font card clicked', font?.name || fontName);
                  if (font) onSelectFont(font.id);
                }}
              />
            </div>
          );
        } else {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        }
      }
      // Row 12: 3 BlankCards, 7 FontCards, rest BlankCards
      else if (row === 11) {
        if (col < 3) {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        } else if (col >= 3 && col < 10) {
          const fontName = row12FontNames[col - 3];
          const font = fonts?.find(f => f.name === fontName);
          grid.push(
            <div
              key={`fontcard-r${row}-c${col}`}
              ref={el => { if (font) cardRefs.current[font.id] = el; }}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <FontCard
                fontName={font?.name || fontName}
                foundry={font?.designer || ''}
                testerTextTop={testerTextTop}
                isActive={selectedFontId === font?.id}
                onClick={() => {
                  console.log('Font card clicked', font?.name || fontName);
                  if (font) onSelectFont(font.id);
                }}
              />
            </div>
          );
        } else {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        }
      }
      // Row 13: 3 BlankCards, 7 FontCards, rest BlankCards
      else if (row === 12) {
        if (col < 3) {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        } else if (col >= 3 && col < 10) {
          const fontName = row13FontNames[col - 3];
          const font = fonts?.find(f => f.name === fontName);
          grid.push(
            <div
              key={`fontcard-r${row}-c${col}`}
              ref={el => { if (font) cardRefs.current[font.id] = el; }}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <FontCard
                fontName={font?.name || fontName}
                foundry={font?.designer || ''}
                testerTextTop={testerTextTop}
                isActive={selectedFontId === font?.id}
                onClick={() => {
                  console.log('Font card clicked', font?.name || fontName);
                  if (font) onSelectFont(font.id);
                }}
              />
            </div>
          );
        } else {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        }
      }
      // Row 14: 3 BlankCards, 7 FontCards, rest BlankCards
      else if (row === 13) {
        if (col < 3) {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        } else if (col >= 3 && col < 10) {
          const fontName = row14FontNames[col - 3];
          const font = fonts?.find(f => f.name === fontName);
          grid.push(
            <div
              key={`fontcard-r${row}-c${col}`}
              ref={el => { if (font) cardRefs.current[font.id] = el; }}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <FontCard
                fontName={font?.name || fontName}
                foundry={font?.designer || ''}
                testerTextTop={testerTextTop}
                isActive={selectedFontId === font?.id}
                onClick={() => {
                  console.log('Font card clicked', font?.name || fontName);
                  if (font) onSelectFont(font.id);
                }}
              />
            </div>
          );
        } else {
          grid.push(
            <div
              key={`r${row}-c${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${row + 1}`,
                width: '250px',
                display: 'block',
                ...getStaggeredTransform(row + 1)
              }}
            >
              <BlankCard />
            </div>
          );
        }
      } else {
        grid.push(
          <div
            key={`r${row}-c${col}`}
            style={{
              gridColumn: `${col + 1}`,
              gridRow: `${row + 1}`,
              width: '250px',
              display: 'block',
              ...getStaggeredTransform(row + 1)
            }}
          >
            <BlankCard />
          </div>
        );
      }
    }
  }

  // Panning logic (copied from FontMap.tsx)
  const containerRef = usePreventBrowserNavigation();
  const gridRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const lastTouches = useRef<{ clientX: number; clientY: number }[]>([]);

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

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) return; // ignore pinch-zoom
    if (e.deltaX !== 0) {
      setGridPos(pos => clampGridPos(pos.x - e.deltaX, pos.y - e.deltaY));
      e.preventDefault(); // Only prevent default for horizontal pans
    } else {
      setGridPos(pos => clampGridPos(pos.x - e.deltaX, pos.y - e.deltaY));
    }
  };

  // Helper to get the grid position (row, col) for a font name
  function getFontGridPosition(fontName: string): { row: number, col: number } | null {
    const rowFontArrays = [
      row3FontNames, row4FontNames, row5FontNames, row6FontNames,
      row7FontNames, row8FontNames, row9FontNames, row10FontNames,
      row11FontNames, row12FontNames, row13FontNames, row14FontNames
    ];
    for (let i = 0; i < rowFontArrays.length; i++) {
      const col = rowFontArrays[i].indexOf(fontName);
      if (col !== -1) {
        return { row: i + 2, col: col + 3 }; // rows start at 2, cols at 3
      }
    }
    return null;
  }

  // 3. Update the centering useEffect to use DOM rects and -200px offset
  useEffect(() => {
    if (!centeredFontId) return;
    const card = cardRefs.current[centeredFontId];
    if (card) {
      const cardRect = card.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const dx = cardRect.left - containerRect.left - (containerRect.width / 2) + (cardRect.width / 2) - 200;
        const dy = cardRect.top - containerRect.top - (containerRect.height / 2) + (cardRect.height / 2) + 5;
        setGridPos(pos => ({ x: pos.x - dx, y: pos.y - dy }));
      }
    }
  }, [centeredFontId]);

  return (
    <div
      ref={containerRef}
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
          gridTemplateColumns: `repeat(${cols}, 250px)`,
          gridTemplateRows: `repeat(${rows}, 170px)`,
          gap: '16px',
          padding: 0,
          width: 'max-content',
          willChange: 'transform',
        }}
      >
        {grid}
      </motion.div>
    </div>
  );
};

export default MostUsedFontMap; 