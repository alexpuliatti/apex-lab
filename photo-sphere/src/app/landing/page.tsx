"use client"

import { useMemo } from "react"
import MosaicGallery from "@/components/MosaicGallery"

export default function LandingPage() {
  const images = useMemo(() =>
    Array.from({ length: 12 }, (_, i) =>
      `/CS_slides/slide_${String(i + 1).padStart(2, "0")}.jpg`
    ), []
  )

  return (
    <div className="relative h-[100dvh] w-full bg-black overflow-hidden select-none touch-none text-white"
         style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" }}>

      {/* Mosaic Canvas (full-screen, behind overlays) */}
      <MosaicGallery images={images} />

      {/* ── Fixed Navigation Overlay ── */}
      <div className="absolute inset-0 pointer-events-none z-10 p-5 md:p-8">

        {/* Top bar */}
        <div className="flex justify-between items-start"
             style={{ fontFamily: "Geist, system-ui, sans-serif" }}>

          {/* Left: logo + "Read more" */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <span className="text-[22px] font-bold tracking-tight leading-none"
                  style={{ fontFamily: "ArrowFont, sans-serif" }}>
              chjs
            </span>
            <span className="text-[11px] text-white/50 tracking-normal">
              Read more
            </span>
          </div>

          {/* Center label */}
          <span className="absolute left-1/2 -translate-x-1/2 text-[11px] font-semibold tracking-[0.18em] uppercase">
            CREATIVE COMPANY
          </span>

          {/* Right: links */}
          <div className="flex gap-5 pointer-events-auto text-[11px] font-semibold tracking-[0.14em] uppercase">
            <a href="#" className="hover:opacity-50 transition-opacity">ABOUT</a>
            <a href="#" className="hover:opacity-50 transition-opacity">EMAIL</a>
            <a href="#" className="hover:opacity-50 transition-opacity">IG</a>
          </div>
        </div>
      </div>
    </div>
  )
}
