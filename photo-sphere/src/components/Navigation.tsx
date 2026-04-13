'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement | Document;
      let currentScroll = 0;
      
      if (target === document || target === window) {
        currentScroll = window.scrollY;
      } else if (target instanceof HTMLElement) {
        // Only react to major scroll containers, not tiny overflow boxes if any
        if (target.clientHeight > 200) {
          currentScroll = target.scrollTop;
        } else {
          return; // Ignore small scrollable elements
        }
      }

      setScrolled(currentScroll > 10);
    }
    
    // Use capture phase to catch scroll events from nested overflow containers natively
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true })
    
    // Initial check on mount
    const checkInitial = setTimeout(() => {
      const scrollers = document.querySelectorAll('.overflow-y-auto, .custom-scrollbar');
      for (let i = 0; i < scrollers.length; i++) {
        if (scrollers[i].scrollTop > 10) {
          setScrolled(true);
          break;
        }
      }
    }, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true })
      clearTimeout(checkInitial)
    }
  }, [])

  const links = [
    { href: '/', label: 'APEX' },
    { href: '/about', label: 'About' },
    { href: '/zine', label: 'The Zine' },
  ]

  return (
    <>
      {/* 
        Progressive blur fade avoiding Chromium rendering artifacts. 
        Uses multiple layers of increasing blur with offset mask gradients 
        to create a buttery smooth transition into the content.
      */}
      <div 
        className={`fixed top-0 left-0 w-full h-40 z-[9998] pointer-events-none transition-opacity duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0" style={{ backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }} />
        <div className="absolute inset-0" style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', maskImage: 'linear-gradient(to bottom, black 40%, transparent 80%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 80%)' }} />
        <div className="absolute inset-0" style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', maskImage: 'linear-gradient(to bottom, black 20%, transparent 60%)', WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 60%)' }} />
        <div className="absolute inset-0" style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', maskImage: 'linear-gradient(to bottom, black 0%, transparent 40%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 40%)' }} />
      </div>
      <nav 
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] glass-pill px-2 py-1.5 flex items-center gap-1"
        style={{ animation: 'fadeIn 0.8s ease both 0.3s' }}
      >
        {links.map(({ href, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`
                px-5 py-2 rounded-full text-xs font-mono uppercase tracking-widest
                transition-all duration-300 no-underline
                ${isActive 
                  ? 'bg-white/12 text-white border border-white/20' 
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent'
                }
              `}
              style={{ textDecoration: 'none' }}
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}

