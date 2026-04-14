'use client'

import React from 'react'
import SmoothScroll from '../../components/SmoothScroll'

export default function AboutPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        ::selection {
          background-color: #ffffff;
          color: #000000;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
      <SmoothScroll className="h-screen bg-[#050505] text-white pt-32 pb-16 overflow-y-auto overflow-x-hidden font-sans no-scrollbar">
        <div className="px-6 md:px-16 max-w-[1400px] mx-auto">
          
          {/* Header Section */}
          <header className="border-b border-white/20 pb-12 mb-16 md:mb-32 flex flex-col md:flex-row md:items-end justify-between gap-8" style={{ animation: 'fadeIn 0.8s ease both' }}>
            <div>
              <h1 
                className="text-[4rem] md:text-[9rem] leading-[0.85] tracking-tighter uppercase mb-4"
                style={{ fontFamily: 'ArrowFont, serif', textShadow: '0 0 40px rgba(255,255,255,0.05)' }}
              >
                INFO
                <br />
                <span className="text-white/20 hover:text-[#00ffff] transition-colors duration-500 italic block mt-2">SYS.</span>
              </h1>
            </div>
          </header>

          {/* Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-24 md:gap-x-12">
            
            {/* Section 1: What is APEX */}
            <div className="md:col-span-5 relative group" style={{ animation: 'fadeIn 0.8s ease both 0.2s' }}>
              <div className="absolute -left-6 top-0 bottom-0 w-[1px] bg-white/10 hidden md:block" />
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-[#00ffff] mb-8 flex items-center gap-4">
                <span className="w-8 h-[1px] bg-[#00ffff]"></span> 01 // The Platform
              </h2>
              <div className="text-4xl md:text-5xl font-bold tracking-tight mb-8 leading-[1.1]" style={{ fontFamily: 'ArrowFont, serif' }}>
                What is <span className="opacity-40 italic">APEX?</span>
              </div>
              <p className="text-base leading-relaxed text-white/70 font-mono">
                APEX is about You. It&apos;s an exploration of what is going on with and around You. It maps the intersection of digital culture, consumer behaviour, and macro-societal trends.
                <br /><br />
                We are tearing down traditional narratives, dissecting the mundane, and creating a space for raw, unfiltered perspectives.
              </p>
            </div>

            {/* Section 2: The Vision */}
            <div className="md:col-span-7 md:border-l border-white/10 md:pl-12 relative group" style={{ animation: 'fadeIn 0.8s ease both 0.4s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff0022]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-[#ff0022] mb-8 flex items-center gap-4">
                <span className="w-8 h-[1px] bg-[#ff0022]"></span> 02 // The Vision
              </h2>
              <p className="text-3xl md:text-[2.75rem] leading-[1.15] font-light md:max-w-4xl tracking-tight">
                APEX is a pinnacle, a <strong className="font-bold tracking-tighter text-[#ff0022] uppercase" style={{fontFamily: 'ArrowFont, serif'}}>climax point</strong> that we as a society are reaching together. We are on the verge of a new form of life.
              </p>
              <div className="mt-12 flex flex-col md:flex-row gap-8">
                 <p className="flex-1 text-lg text-white/60 font-light leading-relaxed">
                   Whether the future is utopian or dystopian is looking fiercely 50/50. In APEX, we&apos;ve consciously chosen to observe this acceleration through a positive lens.
                 </p>
                 <div className="flex-1 border border-white/10 p-6 bg-[#0a0a0a] hover:border-[#ff0022]/50 transition-colors">
                    <span className="block text-[#ff0022] font-mono text-xs uppercase tracking-widest mb-4">Philosophy</span>
                    <span className="block text-2xl" style={{fontFamily: 'ArrowFont, serif'}}>We love being sunny nihilists.</span>
                 </div>
              </div>
            </div>

            {/* Section 3: The Lab */}
            <div className="md:col-span-12 border-t border-white/20 pt-20 mt-8 mb-12 flex flex-col lg:flex-row gap-16 justify-between items-start" style={{ animation: 'fadeIn 0.8s ease both 0.6s' }}>
              <div className="flex-1 max-w-2xl">
                <h2 className="font-mono text-[10px] uppercase tracking-widest text-[#00ff73] mb-8 flex items-center gap-4">
                  <span className="w-8 h-[1px] bg-[#00ff73]"></span> 03 // The Lab
                </h2>
                
                <div className="text-[4rem] md:text-[7rem] font-bold leading-[0.85] tracking-tighter mb-12 uppercase" style={{ fontFamily: 'ArrowFont, serif' }}>
                  London <br/> 
                  <span 
                    className="text-transparent" 
                    style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0))', WebkitBackgroundClip: 'text'}}
                  >
                    Based.
                  </span>
                </div>
                
                <p className="text-xl md:text-2xl font-light text-white/80 leading-relaxed max-w-xl">
                  APEX Lab is an experimental media and culture platform. We curate a zine and events exploring future identity, emerging technologies, and mystical aesthetics.
                </p>
              </div>

              <div className="w-full lg:w-[450px] border border-white/20 bg-black/50 p-8 backdrop-blur-md shrink-0">
                 <div className="font-mono text-xs uppercase text-white/40 mb-8 flex justify-between items-end border-b border-white/20 pb-4">
                   <span>Research Vectors</span>
                 </div>
                 <ul className="space-y-0 relative text-left">
                   <div className="absolute left-[7px] top-4 bottom-4 w-[1px] bg-white/10 hidden md:block" />

                   {['Digital Identity', 'Consumer Culture', 'Nihilism & Meaning', 'Nature & Technology', 'Cultural Paradigms'].map((tag, i) => (
                     <li key={tag} className="flex items-center gap-6 group cursor-crosshair py-5 border-b border-white/5 last:border-0 relative z-10">
                       <span className="w-4 h-4 min-w-[16px] rounded-full border border-white/20 bg-black flex items-center justify-center font-mono text-[8px] text-white/40 group-hover:bg-[#b222ff] group-hover:text-white group-hover:border-[#b222ff] transition-all duration-300">
                         {i+1}
                       </span>
                       <span className="font-mono text-xs md:text-sm uppercase tracking-widest text-white/70 group-hover:text-white group-hover:translate-x-2 transition-all duration-300">{tag}</span>
                     </li>
                   ))}
                 </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-20 pt-10 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40 font-mono text-[10px] uppercase tracking-widest pb-8 hover:opacity-100 transition-opacity duration-500 text-center md:text-left">
            <p className="flex items-center gap-4">
              <span className="w-2 h-2 bg-white animate-pulse" />
              2026
            </p>
            <p className="cursor-crosshair selection:bg-black selection:text-white">APEX_LAB_ALL_RIGHTS_RESERVED</p>
          </footer>
        </div>
      </SmoothScroll>
    </>
  )
}
