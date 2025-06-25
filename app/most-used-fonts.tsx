'use client';
import { useState, useRef, useEffect } from 'react';
import useFontStore from '@/src/store/useFontStore';
import FontMap from '../src/components/FontMap';
import { fontConfigs } from '../src/lib/fontConfig';
import './styles/typography.css';

export default function MostUsedFontsPage() {
  // Use a custom list for most used fonts
  const mostUsedFontNames = [
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway', 'Poppins', 'Merriweather', 'Nunito', 'Playfair Display'
  ];
  const { fonts, selectedFontId, selectFont } = useFontStore();
  const mostUsedFonts = mostUsedFontNames
    .map(name => fonts.find(f => f.name === name))
    .filter(Boolean);

  // Sidebar hover state for font list
  const [hoveredFontId, setHoveredFontId] = useState<string | null>(null);
  const fontRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Define the h6/Nano Heading style
  const nanoHeadingStyle = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '10px',
    color: '#000000',
    fontWeight: 400,
  };

  // Helper for sidebar font card styles
  const sidebarFontCardStyle = (isActive: boolean, isHovered: boolean) => {
    let backgroundColor = 'transparent';
    let boxShadow = 'none';
    if (isActive || isHovered) {
      backgroundColor = '#F9F9FC';
      boxShadow = 'none';
    }
    return {
      backgroundColor,
      boxShadow,
      borderRadius: '0px',
      padding: 0,
      margin: 0,
      cursor: 'pointer',
      transition: 'background 0.15s, box-shadow 0.15s',
      width: '100%',
      height: '150px',
      display: 'flex',
      alignItems: 'stretch',
      borderBottom: '0.5px solid rgba(0,0,0,0.10)',
    };
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* Left sidebar - Most Used Fonts - 300px fixed width */}
      <div
        style={{
          width: '300px',
          height: '100%',
          position: 'relative',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'white',
          borderRight: '1px solid #e5e7eb',
        }}
        id="sidebar-scroll"
      >
        {/* Sticky header and sort bar */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          background: 'white',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ padding: '4.5rem 1rem 1rem 24px' }}>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Most Used Fonts</h2>
          </div>
        </div>
        {/* Scrollable font list */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          background: 'white',
        }}>
          {mostUsedFonts.map(font => {
            if (!font) return null;
            const fontConfig = fontConfigs[font.name];
            const isActive = selectedFontId === font.id;
            const isHovered = hoveredFontId === font.id;
            // Determine if the font name is a single word
            const isSingleWord = font.name.trim().split(' ').length === 1;
            // Font size rule (match FontCard)
            const fontNameFontSize = isSingleWord && font.name.length > 12 ? 24 : 26;
            return (
              <div
                key={font.id}
                ref={el => { fontRefs.current[font.id] = el; }}
                style={sidebarFontCardStyle(isActive, isHovered)}
                onClick={() => selectFont(font.id)}
                onMouseEnter={() => setHoveredFontId(font.id)}
                onMouseLeave={() => setHoveredFontId(null)}
              >
                <div style={{ marginLeft: '24px', marginRight: '24px', padding: '0px 0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
                  <span
                    className={fontConfig?.className}
                    style={{
                      fontSize: `${fontNameFontSize}px`,
                      fontWeight: 400,
                      lineHeight: 1,
                      margin: 0,
                      marginBottom: '22px',
                      wordBreak: 'break-word',
                    }}
                  >
                    {font.name}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '10px',
                      fontWeight: 450,
                      color: '#000',
                      opacity: 1,
                      margin: 0,
                      marginBottom: '2.5px',
                    }}
                  >
                    {font.name}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '10px',
                      fontWeight: 450,
                      color: '#000',
                      opacity: 0.6,
                      margin: 0,
                    }}
                  >
                    {font.designer}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Sidebar right border overlay */}
      <div
        style={{
          position: 'fixed',
          left: 307, // exactly at the sidebar's right edge
          top: 68,
          width: '1px',
          height: '100vh',
          background: '#e5e7eb',
          zIndex: 200, // higher than top bar, filter buttons, etc.
          pointerEvents: 'none', // so it doesn't block clicks
        }}
      />
      {/* Main content - Font Map */}
      <div style={{ 
        flex: '1', 
        height: '100%', 
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Font map area */}
        <div style={{ 
          marginTop: '6rem', 
          height: 'calc(100% - 6rem)'
        }}>
          <FontMap 
            selectedFontId={selectedFontId}
            onSelectFont={selectFont}
            centeredFontId={selectedFontId}
            fonts={mostUsedFonts}
          />
        </div>
      </div>
    </div>
  );
} 