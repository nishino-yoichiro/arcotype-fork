'use client';
import { useState, useRef, useEffect } from 'react';
import useFontStore from '@/src/store/useFontStore';
import FontMap from '../src/components/FontMap';
import { fontConfigs } from '@/src/lib/fontConfig';
import './styles/typography.css';

export default function Home() {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { fonts, selectedFontId, selectFont } = useFontStore();

  const popularOrder = [
    "Playfair Display", "Merriweather", "Lora", "Roboto Serif", "Bitter", "Libre Baskerville", "Linden Hill",
    "Cormorant", "Cormorant Garamond", "EB Garamond", "Crimson Text", "Sorts Mill Goudy", "Bodoni Moda",
    "Spectral", "Newsreader", "Bree Serif", "Josefin Slab", "Rokkitt", "Andada Pro", "Aleo", "Crete Round",
    "Arvo", "Quattrocento", "Coustard", "Imbue", "PT Serif", "Noticia Text", "Zilla Slab", "Ovo",
    "Alfa Slab One", "Xanh Mono", "Bellefair", "Source Serif", "Headland One", "Instrument Serif",
    "DM Serif Display", "Abril Fatface", "Chonburi", "Eczar", "Alike Angular", "Alike", "Young Serif",
    "Oldenburg", "BhuTuka Expanded One", "Montaga", "Kurale", "Gabriela", "Inknut Antiqua", "Special Elite",
    "Arbutus", "Bigelow Rules", "Mountains of Christmas", "Emilys Candy", "Paprika", "Langar", "Diplomata SC",
    "Elsie", "Elsie Swash Caps", "Almendra", "Luxurious Roman", "Kotta One", "Diplomata"
  ];

  const newestOrder = [
    "Young Serif", "Bodoni Moda", "Newsreader", "Roboto Serif", "Imbue", "Instrument Serif", "Fraunces", "DM Serif Display", "Spectral", "Bellefair", "Headland One", "Coustard", "Chonburi", "BhuTuka Expanded One", "Kurale", "Gabriela", "Inknut Antiqua", "Bigelow Rules", "Mountains of Christmas", "Emilys Candy", "Paprika", "Langar", "Diplomata SC", "Elsie", "Elsie Swash Caps", "Almendra", "Luxurious Roman", "Kotta One", "Diplomata"
  ];

  const azOrder = [
    "Abril Fatface", "Aleo", "Alfa Slab One", "Alike", "Alike Angular", "Almendra", "Andada Pro", "Arbutus", "Arvo", "Bellefair", "BhuTuka Expanded One", "Bigelow Rules", "Bitter", "Bodoni Moda", "Bree Serif", "Chonburi", "Cormorant", "Cormorant Garamond", "Coustard", "Courier Prime", "Crete Round", "Crimson Text", "DM Serif Display", "Diplomata", "Diplomata SC", "Domine", "EB Garamond", "Eczar", "Elsie", "Elsie Swash Caps", "Emilys Candy", "Fira Mono", "Fraunces", "Gabriela", "Headland One", "IBM Plex Mono", "IBM Plex Serif", "Imbue", "Inknut Antiqua", "Instrument Serif", "Josefin Slab", "Kotta One", "Kurale", "Langar", "Libre Baskerville", "Linden Hill", "Lora", "Luxurious Roman", "Maiden Orange", "Merriweather", "Montaga", "Mountains of Christmas", "Newsreader", "Noto Sans Mono", "Noto Serif Display", "Noticia Text", "Oldenburg", "Ovo", "Paprika", "Playfair Display", "PT Mono", "PT Serif", "Quattrocento", "Rokkitt", "Roboto Mono", "Roboto Serif", "Rosarivo", "Slabo 27px", "Sorts Mill Goudy", "Source Code Pro", "Source Serif", "Special Elite", "Spectral", "Stint Ultra Condensed", "Suranna", "Ultra", "Young Serif", "Zilla Slab"
  ];

  const [selectedTab, setSelectedTab] = useState('Popular');

  const azFonts = azOrder
    .map(name => fonts.find(f => f.name === name))
    .filter(Boolean);

  // Add any fonts not in azOrder at the end (just in case)
  const remainingFonts = fonts.filter(
    f => !azOrder.includes(f.name)
  ).sort((a, b) => a.name.localeCompare(b.name));

  const displayedFonts = selectedTab === 'Popular'
    ? popularOrder.map(name => fonts.find(f => f.name === name)).filter(Boolean)
    : selectedTab === 'New'
      ? newestOrder.map(name => fonts.find(f => f.name === name)).filter(Boolean)
      : selectedTab === 'AZ'
        ? azOrder.map(name => fonts.find(f => f.name === name)).filter(Boolean)
        : fonts;

  const fontRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const stickyHeaderHeight = 140; // Updated estimate: header + buttons height in px

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

  // Sidebar hover state for font list
  const [hoveredFontId, setHoveredFontId] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* Left sidebar - Search Results - 300px fixed width */}
      <div style={{ 
        width: '300px', 
        height: '100%', 
        borderRight: '1px solid #e5e7eb', 
        overflowY: 'auto',
        flexShrink: 0
      }} id="sidebar-scroll">
        <div style={{ position: 'sticky', top: 0, zIndex: 1, background: 'white', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ padding: '1rem 1rem 0.5rem 1rem' }}>
            <h2 style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Similar Results</h2>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button style={{ fontWeight: selectedTab === 'Popular' ? '500' : 'normal', color: selectedTab === 'Popular' ? '#111' : '#6b7280' }} onClick={() => setSelectedTab('Popular')}>Popular</button>
              <button style={{ fontWeight: selectedTab === 'New' ? '500' : 'normal', color: selectedTab === 'New' ? '#111' : '#6b7280' }} onClick={() => setSelectedTab('New')}>New</button>
              <button style={{ fontWeight: selectedTab === 'AZ' ? '500' : 'normal', color: selectedTab === 'AZ' ? '#111' : '#6b7280' }} onClick={() => setSelectedTab('AZ')}>AZ</button>
            </div>
          </div>
        </div>
        {/* Font list */}
        <div style={{ padding: '0rem' }}>
          {displayedFonts.map(font => {
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
                <div style={{ marginLeft: '26px', marginRight: '26px', padding: '0px 0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
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
                      fontSize: '11px',
                      fontWeight: 450,
                      color: '#111',
                      opacity: 1,
                      margin: 0,
                      marginBottom: '2px',
                    }}
                  >
                    {font.name}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '11px',
                      fontWeight: 450,
                      color: '#6b7280',
                      opacity: 0.8,
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
    </div>
  );
} 