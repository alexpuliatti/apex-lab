'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export default function SmoothScroll({ children, className }: { children: React.ReactNode, className?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!wrapperRef.current) return

    // We target the current container specifically instead of the whole window
    const lenis = new Lenis({
      wrapper: wrapperRef.current,
      content: wrapperRef.current.firstElementChild as HTMLElement,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    let running = true
    function raf(time: number) {
      if (!running) return
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      running = false
      lenis.destroy()
    }
  }, [])

  return (
    <div ref={wrapperRef} className={className}>
      <div className="lenis-content-wrapper">
        {children}
      </div>
    </div>
  )
}
