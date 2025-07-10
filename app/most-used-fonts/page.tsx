'use client';
import { useState, useRef, useEffect } from 'react';
import useFontStore from '@/src/store/useFontStore';
import MostUsedFontMap from '../../src/components/MostUsedFontMap';
import { fontConfigs } from '../../src/lib/localFontConfig';
import '../styles/typography.css';
import Link from 'next/link';
import { mostusedPopularOrder, mostusedAZOrder, mostusedNewestOrder } from '../../src/data/fontOrders';
import { supabase } from '../../src/lib/supabase.js';

export default function MostUsedFontsPage() {
  const { fonts } = useFontStore();
  // 1. Add state for selectedFontId and centeredFontId (move to top)
  const [selectedFontId, setSelectedFontId] = useState<string | null>(null);
  const [centeredFontId, setCenteredFontId] = useState<string | null>(null);
  // Get all fonts used in the map (as in MostUsedFontMap)
  const mapFontNames = [
    'Dosis','Mulish','Urbanist','Outfit','Plus Jakarta Sans','Lexend','Poppins',
    'PT Sans Narrow','Barlow','Inter','Jost','Figtree','Manrope','Montserrat',
    'Roboto Condensed','Roboto Flex','Roboto','Arimo','Rubik','Nunito Sans','Red Hat Display',
    'Barlow Condensed','PT Sans','Lato','Noto Sans','Open Sans','Public Sans','Libre Franklin',
    'Abel','Fira Sans','Open Sans','Schibsted Grotesk','Cabin','Work Sans','Archivo',
    'DM Sans','IBM Plex Sans','Source Sans 3','Overpass','M PLUS Rounded 1c','Comfortaa','Nunito',
    'Karla','Titillium Web','Exo 2','Saira','Ubuntu','Sora','Raleway',
    'Smooch Sans','Share Tech','Inconsolata','Source Code Pro','IBM Plex Mono','Roboto Mono','Space Grotesk',
    'Oswald','Bebas Neue','Fjalla One','Anton','Lilita One','Archivo Black','Alfa Slab One',
    'Slabo 27px','Bitter','Roboto Slab','Merriweather','Arvo','Josefin Slab','Zilla Slab',
    'PT Serif','Noto Serif','IBM Plex Serif','Lora','Libre Baskerville','Playfair Display','DM Serif Display',
    'Cormorant Garamond','EB Garamond','Crimson Text','Caveat','Dancing Script','Lobster','Pacifico'
  ];
  const mapFonts = mapFontNames.map(name => fonts.find(f => f.name === name)).filter((f): f is typeof fonts[0] => Boolean(f));
  const allPopularFonts = mostusedPopularOrder.map(name => fonts.find(f => f.name === name)).filter(Boolean);
  const azFonts = mostusedAZOrder.map(name => fonts.find(f => f.name === name)).filter(Boolean);
  const newestFonts = mostusedNewestOrder.map(name => fonts.find(f => f.name === name)).filter(Boolean);

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
    if (isActive) {
      backgroundColor = '#F9F9FC';
      boxShadow = 'none';
    } else if (isHovered) {
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

  // Add gridPos and setGridPos state for FontMap panning
  const [gridPos, setGridPos] = useState<{ x: number; y: number }>({ x: -1300, y: -1025 });

  // Add state for popup and selected category (copied from page.tsx)
  const [searchPopupOpen, setSearchPopupOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('most used fonts');
  const [testerTextTop, setTesterTextTop] = useState('');
  const categoryIcon = (cat: string | null) => {
    switch (cat) {
      case 'Sans Serif': return '/sans-serif.svg';
      case 'Serif': return '/serif.svg';
      case 'Display': return '/display.svg';
      case 'Script': return '/script.svg';
      case 'Gothic': return '/gothic.svg';
      default: return '';
    }
  };

  // Add state for sorting
  const [selectedTab, setSelectedTab] = useState('Popular');

  // Compute sorted font list for sidebar
  const sortedFonts = selectedTab === 'Popular'
    ? allPopularFonts
    : selectedTab === 'AZ'
      ? azFonts
      : selectedTab === 'New'
        ? newestFonts
        : allPopularFonts;

  // Font weight mapping for human-friendly names
  const weightNames: Record<string, string> = {
    '100': 'Thin',
    '200': 'Extra Light',
    '300': 'Light',
    '400': 'Regular',
    '500': 'Medium',
    '600': 'SemiBold',
    '700': 'Bold',
    '800': 'ExtraBold',
    '900': 'Black',
  };

  const [testerWeight, setTesterWeight] = useState('400');
  const [testerSize, setTesterSize] = useState(36);
  const [testerText, setTesterText] = useState('');
  const selectedFont = fonts.find(f => f.id === selectedFontId);
  const availableWeights = selectedFont?.weights || ['400'];

  // State for hover effect on 'most used fonts' button
  const [mostUsedHover, setMostUsedHover] = useState(false);

  // State for hover effect on 'Serif' button
  const [serifHover, setSerifHover] = useState(false);

  // State for Supabase use case images
  const [supabaseImages, setSupabaseImages] = useState<{ image_url: string; use_case_url: string }[]>([]);

  // Add state for hovered index
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 2. Unified handler for selecting a font (from map or sidebar)
  function handleFontSelect(fontId: string | null) {
    console.log('handleFontSelect called with', fontId);
    setSelectedFontId(fontId);
    setCenteredFontId(fontId);
  }

  // Fetch images from Supabase when selectedFontId changes
  useEffect(() => {
    console.log('useEffect triggered', { selectedFontId });
    if (!selectedFontId) {
      setSupabaseImages([]);
      return;
    }
    const fontName = fonts.find(f => f.id === selectedFontId)?.name;
    console.log('fontName:', fontName);
    if (!fontName) {
      setSupabaseImages([]);
      return;
    }
    supabase
      .from('font_images')
      .select('image_url, use_case_url')
      .eq('font_name', fontName)
      .limit(3)
      .then(({ data, error }) => {
        console.log('Supabase images:', { data, error, fontName });
        if (error) {
          setSupabaseImages([]);
          return;
        }
        setSupabaseImages(data || []);
      });
  }, [selectedFontId, fonts]);

  console.log('selectedFontId:', selectedFontId);

  // Sidebar JSX (now sticky header and sort bar)
  const sidebar = (
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
          <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Similar Fonts</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: '#000', opacity: 0.5, fontWeight: 400, fontFamily: 'Inter, sans-serif' }}>Sort by</span>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                className={`sort-button${selectedTab === 'Popular' ? ' selected' : ''}`}
                onClick={() => setSelectedTab('Popular')}
              >
                Popular
              </button>
              <button
                className={`sort-button${selectedTab === 'New' ? ' selected' : ''}`}
                onClick={() => setSelectedTab('New')}
              >
                New
              </button>
              <button
                className={`sort-button${selectedTab === 'AZ' ? ' selected' : ''}`}
                onClick={() => setSelectedTab('AZ')}
                style={{ paddingRight: '15px' }}
              >
                AZ
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Scrollable font list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        background: 'white',
      }}>
        {sortedFonts.map(font => {
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
              onClick={() => handleFontSelect(font.id)}
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
  );

  // Top nav JSX (reuse from main page for now)
  const topNav = (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 308,
          right: 0,
          background: '#fff',
          zIndex: 99,
          margin: 0,
          paddingBottom: '10px',
          boxSizing: 'border-box',
          height: '110px',
          borderBottom: '1px solid #e5e7eb',
        }}
      />
      {/* Logo in top left corner */}
      <img
        src="/logo.svg"
        alt="Logo"
        style={{
          position: 'fixed',
          top: 15,
          left: 31,
          width: 40,
          height: 40,
          zIndex: 300,
        }}
      />
    </>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* Top nav bar */}
      {topNav}
      {/* Left sidebar */}
      {sidebar}
      {/* Sidebar right border overlay */}
      <div
        style={{
          position: 'fixed',
          left: 308, // exactly at the sidebar's right edge
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
        {/* Filter buttons pinned to 15px right of sidebar */}
        <div
          style={{
            position: 'fixed',
            left: 318, // 300px sidebar + 18px
            top: 70,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 101,
          }}
        >
          <button className="filter-button">Appearance</button>
          <button className="filter-button">Use Case</button>
          <button className="filter-button">Price</button>
          <button className="filter-button">Vibe Search</button>
        </div>
        {/* Search bar */}
        <div style={{
          position: 'fixed',
          top: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9998,
          width: 'max-content',
          backgroundColor: 'white',
          paddingTop: '10px',
          paddingBottom: 0,
          boxSizing: 'border-box',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}>
            <div
              className={`search-bar-container${searchPopupOpen ? ' expanded' : ''}`}
              style={{ position: 'relative', zIndex: 9999 }}
            >
              {selectedCategory && (
                <div className="filter-tag-button">
                  <img
                    src="/magnifying-glass.svg"
                    alt={selectedCategory || undefined}
                    style={{ width: 10, height: 10, objectFit: 'contain', cursor: 'pointer' }}
                    onClick={() => setSearchPopupOpen(true)}
                  />
                  <span
                    style={{ fontSize: '10px', fontWeight: 400, cursor: 'pointer' }}
                    onClick={() => setSearchPopupOpen(true)}
                  >
                    {selectedCategory}
                  </span>
                  <span className="filter-tag-close">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedCategory(null);
                      }}
                      style={{
                        border: 'none',
                        background: 'none',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      aria-label="Remove category"
                    >
                      <img src="/black-close-small.svg" alt="Remove" style={{ width: 16, height: 16 }} />
                    </button>
                  </span>
                </div>
              )}
              <input
                type="text"
                placeholder="Search..."
                onFocus={() => setSearchPopupOpen(true)}
                onBlur={() => setTimeout(() => setSearchPopupOpen(false), 150)}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  outline: 'none',
                  border: 'none',
                  fontSize: '12px',
                  color: '#000',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  padding: 0,
                  paddingLeft: selectedCategory ? 0 : '6px',
                }}
              />
              {/* Popup */}
              <div
                className={`search-popup${searchPopupOpen ? ' expanded' : ''}`}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10000,
                }}
              >
                <div
                  style={{
                    background: '#EEEFF4',
                    borderRadius: '12px',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    height: 'auto',
                  }}
                  tabIndex={-1}
                  onMouseDown={e => e.preventDefault()}
                >
                  <div style={{ fontWeight: 400, fontFamily: 'Inter, sans-serif', fontSize: 14,}}>Recents</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {['most used fonts', 'logo font', 'minimal font', 'web fonts'].map(recent => (
                      recent === 'most used fonts' ? (
                        <Link key={recent} href="/most-used-fonts">
                          <button
                            className="search-category-button-pill"
                            style={{ position: 'relative' }}
                            onMouseEnter={() => setMostUsedHover(true)}
                            onMouseLeave={() => setMostUsedHover(false)}
                          >
                            {/* Star overlay */}
                            <img
                              src="/red-star.png"
                              alt="star"
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-6px',
                                width: mostUsedHover ? '21.5px' : '21px',
                                height: mostUsedHover ? '21.5px' : '21px',
                                pointerEvents: 'none',
                                zIndex: 2,
                                transition: 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), width 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                transform: mostUsedHover ? 'rotate(-12deg) scale(1.03)' : 'none',
                              }}
                            />
                            {recent}
                          </button>
                        </Link>
                      ) : (
                        <button
                          key={recent}
                          className="search-category-button-pill"
                        >
                          <img src="magnifying-glass.svg" style={{ width: 10, height: 10 }} /> {recent}
                        </button>
                      )
                    ))}
                  </div>
                  <div style={{ fontWeight: 400, fontFamily: 'Inter, sans-serif',fontSize: 14, margin: '0 0 0px 0' }}>Categories</div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'nowrap' }}>
                    {[
                      { label: 'Sans Serif', icon: '/sans-serif.svg' },
                      { label: 'Serif', icon: '/serif.svg' },
                      { label: 'Display', icon: '/display.svg' },
                      { label: 'Script', icon: '/script.svg' },
                      { label: 'Gothic', icon: '/gothic.svg' },
                    ].map(cat => (
                      cat.label === 'Serif' ? (
                        <Link key={cat.label} href="/">
                          <button
                            className={`search-category-button${selectedCategory === cat.label ? ' selected' : ''}`}
                            style={{ position: 'relative' }}
                            onMouseEnter={() => setSerifHover(true)}
                            onMouseLeave={() => setSerifHover(false)}
                          >
                            {/* Star overlay */}
                            <img
                              src="/yellow-star.png"
                              alt="star"
                              style={{
                                position: 'absolute',
                                top: '-9px',
                                right: '-8px',
                                width: serifHover ? '26.6px' : '26px',
                                height: serifHover ? '26.6px' : '26px',
                                pointerEvents: 'none',
                                zIndex: 2,
                                transition: 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), width 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                transform: serifHover ? 'rotate(-10deg) scale(1.03)' : 'none',
                              }}
                            />
                            <img src={cat.icon} alt={cat.label} style={{ width: 28, height: 28, objectFit: 'contain' }} /> {cat.label}
                          </button>
                        </Link>
                      ) : (
                        <button
                          key={cat.label}
                          onClick={() => setSelectedCategory(cat.label)}
                          className={`search-category-button${selectedCategory === cat.label ? ' selected' : ''}`}
                        >
                          <img src={cat.icon} alt={cat.label} style={{ width: 28, height: 28, objectFit: 'contain' }} /> {cat.label}
                        </button>
                      )
                    ))}
                  </div>
                  <div style={{ fontWeight: 400, fontFamily: 'Inter, sans-serif', fontSize: 14, margin: '0 0 0px 0' }}>Vibes</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '0px' }}>
                    {['modern', 'geometric', 'bold', 'minimal', 'vintage'].map(vibe => (
                      <button
                        key={vibe}
                        className="search-category-button-pill"
                      >
                        <img src="/arrow-small-black.svg" alt="arrow" style={{ width: 10, height: 10 }} /> {vibe}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Type tester pinned to 20px from right edge of screen, at top level */}
        <div
          style={{
            position: 'fixed',
            right: 30,
            top: 68,
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #BBBCC0',
            minWidth: 200,
            width: 'fit-content',
            paddingBottom: 0,
            zIndex: 101,
            background: 'white',
          }}
        >
          <img
            src="/type-test.svg"
            alt="Type Tester"
            style={{ width: '22px', height: '22px', marginRight: '0px', marginBottom: '0px' }}
          />
          <input
            type="text"
            value={testerTextTop}
            onChange={e => setTesterTextTop(e.target.value)}
            placeholder="Type here..."
            className="type-tester-input"
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: 0,
              padding: '0rem 1rem 0rem 0.25rem',
              minWidth: '200px',
              minHeight: '28px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              color: '#000',
              fontWeight: 400,
              outline: 'none',
              textAlign: 'left',
              boxShadow: 'none',
            }}
          />
        </div>
        {/* Pill Buttons Overlay */}
        <div style={{
          position: 'absolute',
          top: 110,
          left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          zIndex: 10,
        }}>
          {/* Top (Minimal) */}
          <button
            className="pill-button pill-map-btn"
            style={{
              position: 'absolute',
              top: 16, left: '50%', transform: 'translateX(-50%)',
              pointerEvents: 'auto',
            }}
            onClick={() => setGridPos(pos => ({ ...pos, y: pos.y + 186 }))}
          >
            Minimal
            <img src="/arrow-up.svg" alt="arrow up" style={{ width: 16, height: 16, marginLeft: 0 }} />
          </button>
          {/* Right (Wide) */}
          <button
            className="pill-button pill-map-btn"
            style={{
              position: 'absolute',
              right: 10, top: '50%', transform: 'translateY(-50%)',
              pointerEvents: 'auto',
            }}
            onClick={() => setGridPos(pos => ({ ...pos, x: pos.x - 266 }))}
          >
            Wide
            <img src="/arrow-right.svg" alt="arrow right" style={{ width: 16, height: 16, marginLeft: 0 }} />
          </button>
          {/* Bottom (Decorative) */}
          <button
            className="pill-button pill-map-btn"
            style={{
              position: 'absolute',
              bottom: 20, left: '50%', transform: 'translateX(-50%)',
              pointerEvents: 'auto',
            }}
            onClick={() => setGridPos(pos => ({ ...pos, y: pos.y - 186 }))}
          >
            Decorative
            <img src="/arrow-down.svg" alt="arrow down" style={{ width: 16, height: 16, marginLeft: 0 }} />
          </button>
          {/* Left (Narrow) */}
          <button
            className="pill-button pill-map-btn"
            style={{
              position: 'absolute',
              left: 10, top: '50%', transform: 'translateY(-50%)',
              pointerEvents: 'auto',
            }}
            onClick={() => setGridPos(pos => ({ ...pos, x: pos.x + 266 }))}
          >
            Narrow
            <img src="/arrow-left.svg" alt="arrow left" style={{ width: 16, height: 16, marginLeft: 0 }} />
          </button>
        </div>
        {/* Font map area */}
        <div style={{ 
          marginTop: '6rem', 
          height: 'calc(100% - 6rem)'
        }}>
          <MostUsedFontMap
            selectedFontId={selectedFontId}
            onSelectFont={handleFontSelect}
            centeredFontId={centeredFontId}
            testerTextTop={testerTextTop}
            fonts={mapFonts}
            gridPos={gridPos}
            setGridPos={setGridPos}
          />
        </div>
        {/* Font Details Popup - shown when a font is selected - 377x555px */}
        {selectedFontId && (
          <div style={{ 
            position: 'fixed',
            left: '330px', // 300px sidebar + 30px gap
            top: '430px',
            transform: 'translateY(-50%)',
            width: '360px',
            minHeight: '520px',
            height: '550px',
            backgroundColor: 'white',
            boxShadow: '-4px 18px 15px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            overflow: 'auto',
            borderRadius: '24px',
            zIndex: 200,
          }}>
            {/* Top bar: pills left, actions right */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button
                  className={`pill-button${selectedTab === 'Serif' ? ' selected' : ''}`}
                  onClick={() => setSelectedTab('Serif')}
                >
                  Sans Serif
                </button>
                <button
                  className={`pill-button${selectedTab === 'Elegant' ? ' selected' : ''}`}
                  onClick={() => setSelectedTab('Elegant')}
                >
                  Modern
                </button>
                <button
                  className={`pill-button${selectedTab === 'Elegant' ? ' selected' : ''}`}
                  onClick={() => setSelectedTab('Elegant')}
                >
                  Popular
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {/* Download and Save buttons */}
                <button
                  style={{ border: 'none', background: 'none', cursor: 'pointer', marginLeft: '0.4rem', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px' }}
                  aria-label="Download Trial"
                >
                  <img src="/DownloadTrial.svg" alt="Download Trial" style={{ width: '16px', height: '16px', display: 'block' }} />
                </button>
                <button
                  style={{ border: 'none', background: 'none', cursor: 'pointer', marginLeft: '1rem', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px' }}
                  aria-label="Save"
                >
                  <img src="/Save.svg" alt="Save" style={{ width: '16px', height: '16px', display: 'block' }} />
                </button>
                {/* Close button using Close.svg */}
                <button
                  style={{ border: 'none', background: 'none', cursor: 'pointer', marginLeft: '1.2rem', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}
                  onClick={() => handleFontSelect(null)}
                  aria-label="Close"
                >
                  <img src="/Close.svg" alt="Close" style={{ width: '28px', height: '28px', display: 'block' }} />
                </button>
              </div>
            </div>
            {/* Type tester controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6.5rem', marginBottom: '1.5rem' }}>
              {/* Weight dropdown with icon */}
              <div style={{ position: 'relative', display: 'inline-block', minWidth: '90px' }}>
                <select
                  value={testerWeight}
                  onChange={e => setTesterWeight(e.target.value)}
                  className="nano-heading"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                    marginRight: '0.5rem',
                    appearance: 'none',
                    outline: 'none',
                    minWidth: '90px',
                  }}
                >
                  {availableWeights.map(w => (
                    <option key={w} value={w} style={{ fontWeight: w }}>{weightNames[w] || w}</option>
                  ))}
                </select>
              </div>
              {/* Font size pill and slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{
                  borderRadius: '9999px',
                  border: '0.75px solid #000000',
                  background: '#ffffff',
                  fontSize: '10px',
                  color: '#000000',
                  padding: '2px 0px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  minWidth: '28px',
                  textAlign: 'center',
                  display: 'inline-block',
                }}>{testerSize}</span>
                <input
                  type="range"
                  min={16}
                  max={64}
                  value={testerSize}
                  onChange={e => setTesterSize(Number(e.target.value))}
                  style={{ width: '124px', accentColor: '#000', cursor: 'pointer' }}
                />
              </div>
            </div>
            {/* Type tester */}
            <textarea
              placeholder="Type here..."
              value={testerText}
              onChange={e => setTesterText(e.target.value)}
              style={{
                width: '100%',
                height: '90px',
                fontSize: `${testerSize}px`,
                fontWeight: Number(testerWeight),
                color: '#000000',
                opacity: testerText ? 1 : 0.3,
                border: 'none',
                outline: 'none',
                marginBottom: '0rem',
                fontFamily: fontConfigs[selectedFont?.name || '']?.className ? undefined : 'inherit',
                background: 'transparent',
                transition: 'font-size 0.15s, font-weight 0.15s',
                resize: 'none',
                overflow: 'auto',
                lineHeight: 1.1,
                padding: 0,
              }}
              className={fontConfigs[selectedFont?.name || '']?.className}
              onFocus={e => e.target.placeholder = ''}
              onBlur={e => e.target.placeholder = 'Type here...'}
              rows={3}
            />
            {/* Font name and designer with Visit Foundry button */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '0.25rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ ...nanoHeadingStyle, marginBottom: '4px' }}>
                  {fonts.find(f => f.id === selectedFontId)?.name}
                </span>
                <span style={{ ...nanoHeadingStyle, opacity: 0.6 }}>
                  Designed by <span style={{ color: '#111' }}>{fonts.find(f => f.id === selectedFontId)?.designer}</span>
                </span>
              </div>
              {/* Visit Foundry button */}
              <a
                href={`https://fonts.google.com/specimen/${encodeURIComponent(fonts.find(f => f.id === selectedFontId)?.name || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="button-rounded"
              >
                Visit Foundry
              </a>
            </div>
            {/* Use Cases / Pair this font tab buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.8rem', position: 'relative' }}>
              <button
                className="text-button text-button--active"
                style={{ marginRight: '1rem' }}
              >
                Use Cases
              </button>
              <button
                className="text-button text-button--inactive"
              >
                Pair this font
              </button>
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: '0px', height: '1px', background: '#CCCCCC', width: '100%', marginBottom: '-0.5rem' }} />
            </div>
            {/* Use Cases Carousel from Supabase images */}
            <div style={{ minHeight: '8rem', marginBottom: '0rem' }}>
              {supabaseImages.length > 0 ? (
                <div style={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: '14px',
                  paddingBottom: '1.4rem',
                  scrollbarWidth: 'auto',
                  msOverflowStyle: 'auto',
                }}>
                  {supabaseImages.map((img, i) => (
                    <div
                      key={i}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '20rem' }}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <a
                        href={img.use_case_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'block', width: '100%' }}
                      >
                        <img
                          src={img.image_url}
                          alt={`${fonts.find(f => f.id === selectedFontId)?.name} use case ${i + 1}`}
                          style={{ width: '240px', height: '180px', objectFit: 'cover', borderRadius: '14px' }}
                        />
                      </a>
                      <span
                        className="nano-heading"
                        style={{
                          fontSize: '10px',
                          opacity: hoveredIndex === i ? 1 : 0.5,
                          marginTop: '4px',
                          textAlign: 'left',
                          width: '100%',
                          transition: 'opacity 0.15s',
                          cursor: 'pointer',
                        }}
                      >
                        Fonts in Use
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '10px', fontFamily: 'Inter, sans-serif' }}>
                  No Uses found for "{fonts.find(f => f.id === selectedFontId)?.name}".
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 