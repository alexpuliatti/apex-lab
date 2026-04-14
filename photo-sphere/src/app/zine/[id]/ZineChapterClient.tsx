'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CHAPTERS } from '../../../data/chapters'
import SmoothScroll from '../../../components/SmoothScroll'
import { ChapterCoverGraphic, ScrollFadeSection } from '../../../components/StairScene'

export default function ZineChapterClient({ chapterId }: { chapterId: string }) {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const chapter = CHAPTERS.find(c => c.id === chapterId)

  useEffect(() => {
    // Staggered entrance
    const ticker = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(ticker)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleBack()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handleBack = () => {
    setIsClosing(true)
    setTimeout(() => {
      router.push('/zine')
    }, 350)
  }

  if (!chapter) {
    return <div className="absolute inset-0 bg-black text-white flex items-center justify-center">Chapter not found</div>
  }

  const themeColor = chapter.themeColor
  const paragraphs = chapter.summary.split('\n\n')

  return (
    <>
      {/* Fonts loaded from globals.css */}
      <div 
        className="absolute inset-0 z-[10000] flex flex-col md:flex-row overflow-hidden bg-transparent pointer-events-none"
      >
        <div 
            className="absolute inset-0 bg-black pointer-events-auto"
            style={{
                opacity: (!visible || isClosing) ? 0 : 1,
                transition: 'opacity 300ms ease-out',
            }}
        />
        
        {/* Left side: Fixed Cover Art */}
        <div 
          className="w-full md:w-[45%] h-auto min-h-[60vh] md:h-[100dvh] flex flex-col justify-between p-6 pt-12 md:p-16 border-b md:border-b-0 md:border-r border-white/10 shrink-0 pointer-events-auto"
          style={{
            opacity: visible && !isClosing ? 1 : 0,
            transition: 'opacity 500ms cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          <button
            onClick={handleBack}
            className="self-start uppercase tracking-widest text-xs font-mono font-bold hover:scale-95 origin-left w-fit cursor-pointer text-white/50 hover:text-white"
            style={{ transition: 'all 150ms cubic-bezier(0.23, 1, 0.32, 1)' }}
          >
            ← Back to chapters
          </button>
          
          <div className="flex-1 flex flex-col items-center justify-center py-12 md:py-0">
            {/* Physical Book Cover Silhouette */}
            <div 
              className="w-full max-w-sm aspect-[3/4] bg-[#0c0c0c] flex flex-col p-8 justify-end relative overflow-hidden rounded-r-xl rounded-l-[4px]"
              style={{
                boxShadow: '20px 20px 40px rgba(0,0,0,0.8), inset 1px 1px 0px rgba(255,255,255,0.05), inset -1px -1px 0px rgba(0,0,0,0.3)',
                opacity: visible && !isClosing ? 1 : 0,
                transform: visible && !isClosing ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.98)',
                transition: 'opacity 700ms cubic-bezier(0.23, 1, 0.32, 1) 150ms, transform 700ms cubic-bezier(0.23, 1, 0.32, 1) 150ms'
              }}
            >
              <div className="absolute inset-0 bg-[#0a0a0a] z-0" />
              <div className="absolute inset-0 z-0 opacity-80 mix-blend-screen">
                <ChapterCoverGraphic id={chapter.id} themeColor={themeColor} />
              </div>
              <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/90 via-black/20 to-transparent pointer-events-none z-10" />
              <div className="absolute inset-y-0 left-[20px] w-[2px] bg-gradient-to-b from-white/0 via-white/5 to-white/0 pointer-events-none z-10 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.03] to-white/0 pointer-events-none z-10" />

              <div className="relative z-20 w-full h-full flex flex-col justify-between">
                <div className="self-end font-mono text-xs font-bold text-white/30 tracking-widest mt-2">{chapter.id === '01' ? 'PREFACE' : `VOL.${chapter.id}`}</div>
                
                <div 
                  className="text-[3rem] font-bold text-white/30 tracking-tighter" 
                  style={{ 
                    fontFamily: 'ArrowFont, serif', 
                    lineHeight: 0.9,
                    textShadow: '0px 2px 10px rgba(0,0,0,0.5)' 
                  }}
                >
                  {chapter.titleFlat}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Scrollable Article */}
        <SmoothScroll className="w-full md:w-[55%] h-auto md:h-[100dvh] overflow-y-auto overflow-x-hidden relative scroll-smooth p-6 pb-32 md:p-24 lg:p-32 custom-scrollbar shrink-0 pointer-events-auto text-white">
          {/* Title Cascade */}
          <div 
            style={{
              opacity: visible && !isClosing ? 1 : 0,
              transform: visible && !isClosing ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 500ms cubic-bezier(0.23, 1, 0.32, 1) 100ms, transform 500ms cubic-bezier(0.23, 1, 0.32, 1) 100ms'
            }}
          >
            <div className="font-mono text-xs font-bold tracking-widest uppercase mb-6 opacity-50" style={{ color: themeColor }}>
              Chapter {chapter.id} — {chapter.subtitle}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter mb-12 leading-[1.05]" style={{ fontFamily: 'ArrowFont, serif' }}>
              {chapter.titleFlat}
            </h1>
          </div>

          {/* Synopsis Paragraphs Cascade */}
          <div className="space-y-6 text-lg md:text-xl font-medium leading-relaxed max-w-prose text-white/70 font-sans">
            {paragraphs.map((p, i) => (
              <div
                key={i}
                style={{
                  opacity: visible && !isClosing ? 1 : 0,
                  transform: visible && !isClosing ? 'translateY(0)' : 'translateY(16px)',
                  transition: `opacity 500ms cubic-bezier(0.23, 1, 0.32, 1) ${150 + i * 40}ms, transform 500ms cubic-bezier(0.23, 1, 0.32, 1) ${150 + i * 40}ms`
                }}
              >
                <p>{p}</p>
              </div>
            ))}
          </div>

          <div className="mt-32 mb-16 pt-16 border-t border-white/10 font-sans">
            <ScrollFadeSection delayIndex={0}>
              <h2 className="text-2xl font-bold mb-4 font-mono tracking-tighter">People Featured</h2>
              <p className="text-white/50 max-w-prose">
                The thought leaders, creators, and researchers driving the conversations explored in this issue.
              </p>
            </ScrollFadeSection>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-32 items-start font-sans">
            {[
              { name: "Alma Dowdall", role: "Music Artist", description: "Targets topics of existentialism adding to Gen Z culture with alternative pop/electronic music." },
              { name: "Alex Puliatti", role: "Digital Designer", description: "Working in the digital design department giving Gen Z perspective to luxury fashion conglomerates." },
              { name: "Tim Dowdall PhD", role: "Philosopher & Author", description: "Specializing in the different types of nihilism and societal functions." },
              { name: "Shumon Basar", role: "Writer & Curator", description: "Specializing in analysis of the digital sphere from a creative perspective." }
            ].map((person, i) => (
              <ScrollFadeSection key={`person-${i}`} delayIndex={i + 1}>
                <div className="p-6 border border-white/10 hover:bg-white/5 transition-colors duration-300 h-full">
                  <h3 className="font-mono text-sm font-bold uppercase text-white mb-1">{person.name}</h3>
                  <span className="font-mono text-xs uppercase text-white/40 block mb-4" style={{ color: themeColor }}>{person.role}</span>
                  <p className="text-sm font-medium text-white/70 leading-relaxed">
                    {person.description}
                  </p>
                </div>
              </ScrollFadeSection>
            ))}
          </div>
        </SmoothScroll>
      </div>
    </>
  )
}
