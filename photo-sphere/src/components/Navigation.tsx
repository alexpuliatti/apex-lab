'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'APEX' },
    { href: '/about', label: 'About' },
    { href: '/zine', label: 'The Zine' },
  ]

  return (
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
  )
}
