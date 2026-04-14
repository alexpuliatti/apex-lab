'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let scrolledState = false;

    // Handler for Native DOM Scrolling
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement | Document;
      let currentScroll = 0;
      
      if (target === document || (target as unknown) === window) {
        currentScroll = window.scrollY;
      } else if (target instanceof HTMLElement) {
        if (target.clientHeight > 200) {
          currentScroll = target.scrollTop;
        } else {
          return;
        }
      }

      const isScrolled = currentScroll > 10;
      if (scrolledState !== isScrolled) {
        scrolledState = isScrolled;
        setScrolled(isScrolled);
      }
    };

    // Handler for Canvas-based WebGL Scrolling (Mouse Wheel)
    const handleWheel = (e: WheelEvent) => {
      if (!scrolledState && Math.abs(e.deltaY) > 5) {
        scrolledState = true;
        setScrolled(true);
      }
    };

    // Handler for Canvas-based touch panning
    const handleTouchMove = () => {
      if (!scrolledState) {
        scrolledState = true;
        setScrolled(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true })
    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true, capture: true })
    
    // Initial native check on mount
    const checkInitial = setTimeout(() => {
      const scrollers = document.querySelectorAll('.overflow-y-auto, .custom-scrollbar');
      for (let i = 0; i < scrollers.length; i++) {
        if (scrollers[i].scrollTop > 10) {
          setScrolled(true);
          scrolledState = true;
          break;
        }
      }
    }, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true })
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchmove', handleTouchMove, { capture: true })
      clearTimeout(checkInitial)
    }
  }, [])

  return (
    <>
      {/* 
        Progressive blur fade avoiding Chromium rendering artifacts. 
        Uses multiple layers of increasing blur with offset mask gradients 
        to create a buttery smooth transition into the content.
        Provides legibility for the top navigation icons.
      */}
      {/* Single-layer progressive blur — replaces 4 stacked backdrop-filter layers for ~75% compositing savings */}
      <div 
        className="fixed top-0 left-0 w-full h-40 z-[9998] pointer-events-none opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0" style={{ 
          backdropFilter: 'blur(12px)', 
          WebkitBackdropFilter: 'blur(12px)', 
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', 
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' 
        }} />
      </div>

      {/* Floating Top Navigation - Always visible */}
      <nav 
        className="fixed top-6 left-6 right-6 md:top-8 md:left-12 md:right-12 z-[9999] flex items-center justify-between h-10 pointer-events-auto opacity-100 translate-y-0"
      >
        <Link 
          href="/" 
          className="transition-opacity hover:opacity-100 opacity-60 flex items-center h-full" 
        >
          {pathname === '/' ? (
             /* Spacer so flex layout stays the exact same on the homepage, where page.tsx renders the animated, moving logo into this space */
             <div style={{ width: '80px' }} />
          ) : (
             <img 
               src="/materials/apex_logo.png" 
               alt="Apex Logo" 
               style={{
                 width: '80px',
                 objectFit: 'contain',
                 filter: 'drop-shadow(0 0 40px rgba(255,255,255,0.05))',
               }}
             />
          )}
        </Link>

        {/* 3 Minimal Geometric Icons Cluster */}
        <div className="flex items-center gap-6 md:gap-8 pointer-events-auto">
          {[
            { 
              href: '/#graph', 
              label: 'Graph', 
              icon: (isActive: boolean) => (
                <svg width="18" height="18" viewBox="0 0 20 20" className={`transition-all duration-700 ease-out ${isActive ? 'rotate-90 scale-110' : 'rotate-0 opacity-50'}`}>
                  <rect x="3" y="3" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="8" y="8" width="4" height="4" fill="currentColor" className={`transition-all duration-500 delay-100 ${isActive ? 'scale-100' : 'scale-0'}`} />
                </svg>
              )
            },
            { 
              href: '/about', 
              label: 'Info', 
              icon: (isActive: boolean) => (
                <svg width="18" height="18" viewBox="0 0 20 20" className={`transition-all duration-700 ease-out ${isActive ? 'rotate-[180deg] scale-110' : 'rotate-0 opacity-50'}`}>
                  <polygon points="10,2 18,16 2,16" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <polygon points="10,8 14,14 6,14" fill="currentColor" className={`transition-all duration-500 delay-100 ${isActive ? 'scale-100' : 'scale-0'}`} style={{ transformOrigin: 'center' }} />
                </svg>
              )
            },
            { 
              href: '/zine', 
              label: 'Issue 01', 
              icon: (isActive: boolean) => (
                <svg width="18" height="18" viewBox="0 0 20 20" className={`transition-all duration-700 ease-out ${isActive ? 'scale-110' : 'scale-100 opacity-50'}`}>
                  <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="10" cy="10" r="3" fill="currentColor" className={`transition-all duration-500 delay-100 ${isActive ? 'scale-100' : 'scale-0'}`} style={{ transformOrigin: 'center' }} />
                  {isActive && (
                    <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" className="animate-[spin_4s_linear_infinite]" style={{ transformOrigin: 'center' }} />
                  )}
                </svg>
              )
            },
          ].map(({ href, label, icon }) => {
            const isActive = (href === '/#graph' && pathname === '/') || pathname === href || (href === '/zine' && pathname.startsWith('/zine'))
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`
                  group flex items-center gap-2 no-underline
                  transition-all duration-500 
                  ${isActive ? 'text-white' : 'text-white/40 hover:text-white'}
                `}
              >
                <div className="flex-shrink-0 text-current flex items-center justify-center">
                  {icon(isActive)}
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] leading-none">
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

