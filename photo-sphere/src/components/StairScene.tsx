'use client'

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, RoundedBox, Environment } from '@react-three/drei'
import * as THREE from 'three'

interface Chapter {
  id: string;
  title: string;
  titleFlat: string;
  subtitle: string;
  info: string;
  summary: string;
  author: string;
  readTime: string;
  themeColor: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: '01',
    title: "Intro to APEX:\nAuthor's Note",
    titleFlat: "Intro to APEX: Author's Note",
    subtitle: "editorial exploration",
    info: "A.E.",
    summary: `APEX is born from a simple question — what is actually going on with us? Not the curated versions of ourselves we post online, not the personas we perform at work, but the raw, messy, beautiful reality of being alive right now.\n\nThis zine is an attempt to map the unmappable. To trace the invisible threads that connect our digital lives to our physical ones, our consumer choices to our existential anxieties, our nihilism to our hope.\n\nWe're not journalists. We're not academics. We're explorers — standing at the edge of something new and trying to describe what we see. Every piece in this collection is a fragment of a larger picture, one that's still forming, still shifting, still refusing to be pinned down.\n\nWelcome to the APEX. The view from up here is extraordinary.`,
    author: "Editorial Team",
    readTime: "3 min read",
    themeColor: "#00ffff", // Cyan based on video
  },
  // ... other chapters ...
  {
    id: '02',
    title: "Gen Z Users Adopt\nNihilistic Beliefs",
    titleFlat: "Gen Z Users Adopt Nihilistic Beliefs",
    subtitle: "cultural shift",
    info: "coping mechanism",
    summary: `There's a peculiar comfort in believing nothing matters. Across TikTok, Twitter, and the quieter corners of Discord, a generation is embracing nihilism — not as despair, but as liberation.\n\nThe data tells a story: Gen Z is simultaneously the most anxious and the most philosophically adventurous generation in recorded history. They're reading Camus on their phones between Instagram stories. They're finding Nietzsche through memes. And they're building entire identities around the radical acceptance that meaning isn't given — it's made.\n\nBut this isn't the cold, academic nihilism of philosophy departments. This is sunny nihilism. Warm nihilism. The kind that says: if nothing matters cosmically, then everything matters personally. If the universe is indifferent, then your choices are truly your own.`,
    author: "Research Division",
    readTime: "8 min read",
    themeColor: "#ff0022",
  },
  {
    id: '03',
    title: "Accelerationism\nin Modern Society",
    titleFlat: "Accelerationism in Modern Society",
    subtitle: "fluidity of self",
    info: "metafantasy",
    summary: `The world is speeding up, and some people think we should let it. Accelerationism — the idea that the best way through is faster — has leaked from obscure philosophy forums into mainstream discourse.\n\nBut the version that's taken hold isn't political. It's personal. Young people are accelerating through identities, aesthetics, careers, and belief systems at a pace that would have been incomprehensible twenty years ago. The "fluidity of self" isn't just a queer theory concept anymore — it's a lifestyle.\n\nYou can be cottagecore in January and cyberpunk by March. You can pivot from finance to art to tech to permaculture in the span of a single year. The old frameworks of identity — stable, coherent, building toward something — have been replaced by something more like jazz: improvisational, responsive, alive.`,
    author: "Cultural Analysis",
    readTime: "7 min read",
    themeColor: "#b222ff",
  },
  {
    id: '04',
    title: "Cybernatural\nSynergy",
    titleFlat: "Cybernatural Synergy",
    subtitle: "symbiosis",
    info: "nature & tech",
    summary: `The oldest dichotomy in the modern world — nature versus technology — is dissolving. And it's dissolving from both sides simultaneously.\n\nIn Hackney, mushroom networks are being monitored by IoT sensors. In Shoreditch, biophilic design studios are using AI to generate architectural forms inspired by coral reefs. In Brixton, community gardens are managed through Discord servers.\n\nThe cybernatural isn't a trend. It's an inevitability. As our tools become more organic and our understanding of nature becomes more computational, the boundary between the two becomes not just blurred but meaningless.`,
    author: "Field Research",
    readTime: "6 min read",
    themeColor: "#00ff73",
  },
  {
    id: '05',
    title: "The Temporal\nComponents",
    titleFlat: "The Temporal Components",
    subtitle: "past, present, future",
    info: "exploration",
    summary: `Time moves differently now. Not metaphorically — literally. Our relationship with past, present, and future has been fundamentally altered by technology, and we're only beginning to understand the implications.\n\nThe past is no longer fixed. It's a database, searchable and remixable. Every photo, every post, every message is a temporal artifact that can be surfaced, recontextualised, and weaponised at any moment.\n\nThe present has collapsed. In a world of infinite feeds and real-time updates, the "now" has stretched to encompass everything from three seconds ago to three hours from now.\n\nThe future has been cancelled and rebooted. Climate anxiety has made long-term planning feel absurd. AI has made career planning feel impossible. And yet, a strange optimism persists.`,
    author: "Temporal Studies",
    readTime: "9 min read",
    themeColor: "#ffa900",
  },
]

function StairStack({ activeStair, setActiveStair, handleClick }: any) {
  const { viewport } = useThree()
  const isMobile = viewport.width < 12 
  
  const logicalWidth = isMobile ? 8.5 : 16
  const scale = Math.min(1, (viewport.width * 0.9) / logicalWidth)

  return (
    <group scale={scale}>
      {CHAPTERS.map((chapter, index) => (
        <Stair 
          key={chapter.id} 
          index={index} 
          chapter={chapter} 
          active={activeStair}
          onHover={setActiveStair}
          onClick={handleClick}
          isMobile={isMobile}
          logicalWidth={logicalWidth}
        />
      ))}
    </group>
  )
}

function Stair({ index, chapter, active, onHover, onClick, isMobile, logicalWidth }: { index: number, chapter: Chapter, active: number | null, onHover: (n: number | null) => void, onClick: (n: number, x: number, y: number) => void, isMobile: boolean, logicalWidth: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const isHovered = active === index

  const width = logicalWidth
  const height = isMobile ? 1.8 : 1.4
  const depth = 8
  
  const yOffset = height + (isMobile ? 0.4 : 0.8)
  
  const baseX = 0
  const baseY = -(index - 2) * yOffset
  const baseZ = 0

  // Progressive entrance state
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 150 + index * 100)
    return () => clearTimeout(timer)
  }, [index])

  const targetX = mounted ? (isHovered ? baseX + 1 : baseX) : baseX + 15
  
  const baseColor = useMemo(() => new THREE.Color("#151515"), [])
  const hoverColor = useMemo(() => new THREE.Color(chapter.themeColor), [chapter.themeColor])
  const baseEmissive = useMemo(() => new THREE.Color("#050505"), [])

  // Spring behavior values
  useFrame((_, delta) => {
    const d = Math.min(delta, 0.1)
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetX, 8, d)
    }
    if (matRef.current) {
      matRef.current.color.lerp(isHovered ? hoverColor : baseColor, d * 8)
      matRef.current.emissive.lerp(isHovered ? hoverColor : baseEmissive, d * 8)
      matRef.current.emissiveIntensity = THREE.MathUtils.damp(matRef.current.emissiveIntensity, isHovered ? 0.8 : 0, 8, d)
    }
  })

  // Width of spine for exact highlight positioning
  const spineWidth = width + 0.2
  // We offset X so it scales from the left (assuming left is -X direction relative)
  
  return (
    <group position={[baseX, baseY, baseZ]}>
      {/* Invisible stationary hit-test mesh — stable pointer events */}
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); onHover(index); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); onHover(null); document.body.style.cursor = 'auto'; }}
        onClick={(e) => { 
          e.stopPropagation()
          onClick(index, e.clientX, e.clientY) 
        }}
      >
        <boxGeometry args={[width + 2, height, depth]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Visual book — animates freely */}
      <group ref={groupRef} position={[15, 0, 0]}>
        <RoundedBox args={[width, height, depth]} radius={0.3} smoothness={4} raycast={() => null}>
          <meshPhysicalMaterial
            ref={matRef}
            transmission={0.92}
            thickness={3}
            roughness={0.35}
            ior={1.4}
            clearcoat={1}
            clearcoatRoughness={0.15}
            transparent
            opacity={0.95}
            envMapIntensity={0.5}
            side={THREE.DoubleSide}
          />
        </RoundedBox>

        {/* Front Face Text */}
        <group position={[-width/2 + 1, 0, depth/2 + 0.2]}>
          <Text
            position={[0, 0, 0]}
            font="/fonts/Geist-Regular.ttf"
            fontSize={isMobile ? 0.35 : 0.25}
            color={"#ffffff"}
            anchorX="left"
            anchorY="middle"
          >
            {chapter.id}
          </Text>
          
          <Text
            position={[1.5, 0, 0]}
            font="/fonts/Arrow-Font-Regular.otf"
            fontSize={isMobile ? 0.5 : 0.4}
            color={"#ffffff"}
            anchorX="left"
            anchorY="middle"
            maxWidth={5}
            lineHeight={1.2}
          >
            {chapter.title}
          </Text>
          
          {!isMobile && (
            <>
              <Text
                position={[6.5, 0, 0]}
                font="/fonts/Geist-Regular.ttf"
                fontSize={0.25}
                color={isHovered ? "#222" : "#888"}
                fontStyle="italic"
                anchorX="left"
                anchorY="middle"
              >
                {chapter.subtitle}
              </Text>
              
              <Text
                position={[11, 0, 0]}
                font="/fonts/Geist-Regular.ttf"
                fontSize={0.22}
                color={isHovered ? "#222" : "#aaaaaa"}
                anchorX="left"
                anchorY="middle"
                maxWidth={3}
              >
                {chapter.info}
              </Text>
            </>
          )}
        </group>
      </group>
    </group>
  )
}

/* ─── Chapter Detail Overlay ─── */

function ScrollFadeSection({ children, delayIndex = 0 }: { children: React.ReactNode, delayIndex?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const ro = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRevealed(true)
        ro.disconnect()
      }
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 })
    
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 600ms cubic-bezier(0.23, 1, 0.32, 1) ${delayIndex * 100}ms, transform 600ms cubic-bezier(0.23, 1, 0.32, 1) ${delayIndex * 100}ms`
      }}
    >
      {children}
    </div>
  )
}

function ChapterCoverGraphic({ id, themeColor }: { id: string, themeColor: string }) {
  return (
    <>
      <style>{`
        @keyframes cxFlow {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-10%); }
        }
        @keyframes cxPulseSun {
          0% { transform: scale(0.3); opacity: 0; }
          40% { opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes cxSpeedLine {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes cxBreathe {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.4); }
        }
        @keyframes cxRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {id === '01' && (
        <svg width="100%" height="40%" className="absolute inset-x-0 top-[20%] pointer-events-none stroke-white" viewBox="0 0 100 100" preserveAspectRatio="none">
          <g style={{ animation: 'cxFlow 14s ease-in-out infinite alternate' }}>
            <path d="M-20,50 Q25,20 50,50 T120,50" fill="none" strokeWidth="1" className="opacity-20" />
            <path d="M-20,60 Q30,10 60,60 T120,60" fill="none" strokeWidth="0.5" stroke={themeColor} className="opacity-40" />
          </g>
        </svg>
      )}

      {id === '02' && (
        <svg width="100%" height="50%" className="absolute inset-x-0 top-[20%] pointer-events-none stroke-white overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* The flatline of cosmic indifference */}
          <path d="M-10,70 L110,70" fill="none" strokeWidth="1" className="opacity-20" />
          {/* The radiating warmth of personal meaning */}
          <path d="M50,30 C 75,30 75,70 50,70 C 25,70 25,30 50,30" fill="none" strokeWidth="1" className="opacity-10" />
          <path d="M50,30 C 75,30 75,70 50,70 C 25,70 25,30 50,30" fill="none" strokeWidth="0.5" stroke={themeColor} style={{ animation: 'cxPulseSun 6s ease-out infinite', transformOrigin: '50% 50%' }} />
          <path d="M50,30 C 75,30 75,70 50,70 C 25,70 25,30 50,30" fill="none" strokeWidth="0.5" stroke={themeColor} style={{ animation: 'cxPulseSun 6s ease-out infinite 3s', transformOrigin: '50% 50%' }} />
        </svg>
      )}

      {id === '03' && (
        <svg width="100%" height="40%" className="absolute inset-x-0 top-[20%] pointer-events-none stroke-white" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M-10,10 L110,60" fill="none" strokeWidth="0.5" className="opacity-10" strokeDasharray="10 10" style={{ animation: 'cxSpeedLine 1.5s linear infinite' }} />
          <path d="M-10,30 L110,70" fill="none" strokeWidth="1" stroke={themeColor} className="opacity-30" strokeDasharray="30 20" style={{ animation: 'cxSpeedLine 0.6s linear infinite reverse' }} />
          <path d="M-10,50 L110,80" fill="none" strokeWidth="1.5" className="opacity-20" strokeDasharray="15 5" style={{ animation: 'cxSpeedLine 0.9s linear infinite' }} />
          <path d="M-10,70 L110,90" fill="none" strokeWidth="2" stroke={themeColor} className="opacity-40" strokeDasharray="50 30" style={{ animation: 'cxSpeedLine 0.4s linear infinite' }} />
        </svg>
      )}

      {id === '04' && (
        <svg width="100%" height="50%" className="absolute inset-x-0 top-[20%] pointer-events-none stroke-white" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M20,0 L20,100 M40,0 L40,100 M60,0 L60,100 M80,0 L80,100" fill="none" strokeWidth="0.2" className="opacity-10" />
          <path d="M0,20 L100,20 M0,40 L100,40 M0,60 L100,60 M0,80 L100,80" fill="none" strokeWidth="0.2" className="opacity-10" />
          <path d="M0,80 C 30,20 70,80 100,20" fill="none" strokeWidth="1.5" stroke={themeColor} className="opacity-40" style={{ animation: 'cxBreathe 6s ease-in-out infinite', transformOrigin: '50% 50%' }} />
        </svg>
      )}

      {id === '05' && (
        <svg width="100%" height="40%" className="absolute inset-x-0 top-[20%] pointer-events-none stroke-white" viewBox="0 0 100 100" preserveAspectRatio="none">
          <g style={{ animation: 'cxRotate 30s linear infinite', transformOrigin: '50% 50%' }}>
            <path d="M-50,50 C -20,-20 120,120 150,50" fill="none" strokeWidth="1" className="opacity-20" />
            <path d="M-50,50 C -20,120 120,-20 150,50" fill="none" strokeWidth="0.5" stroke={themeColor} className="opacity-40" />
          </g>
          <circle cx="50" cy="50" r="15" fill="none" strokeWidth="0.5" className="opacity-20" style={{ animation: 'cxRotate 15s linear infinite reverse', transformOrigin: '50% 50%' }} strokeDasharray="4 6" />
        </svg>
      )}
    </>
  )
}

function ChapterDetail({ chapter, onBack, themeColor, isClosing }: { chapter: typeof CHAPTERS[0]; onBack: () => void, themeColor: string, isClosing?: boolean }) {
  const [visible, setVisible] = useState(false)
  const paragraphs = chapter.summary.split('\n\n')

  useEffect(() => {
    // Trigger staggered entrance after minor delay
    const ticker = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(ticker)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onBack])

  return (
    <div 
      className="absolute inset-0 z-[10000] flex flex-col md:flex-row overflow-y-auto md:overflow-hidden pointer-events-auto bg-black text-white custom-scrollbar"
      style={{
        opacity: (!visible || isClosing) ? 0 : 1,
        transition: 'opacity 300ms ease-out',
      }}
    >
      {/* Left side: Fixed Cover Art */}
      <div 
        className="w-full md:w-[45%] h-auto min-h-screen md:min-h-0 md:h-screen md:sticky md:top-0 flex flex-col justify-between p-6 pt-12 md:p-16 border-b md:border-b-0 md:border-r border-white/10 shrink-0"
        style={{
          opacity: visible && !isClosing ? 1 : 0,
          transition: 'opacity 500ms cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        <button
          onClick={onBack}
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
            {/* Base Book Material / Texture Layer */}
            <div className="absolute inset-0 bg-[#0a0a0a] z-0" />

            {/* Dynamic abstract cover graphic */}
            <div className="absolute inset-0 z-0 opacity-80 mix-blend-screen">
              <ChapterCoverGraphic id={chapter.id} themeColor={themeColor} />
            </div>

            {/* Book Spine Crease / Hinge (Left side) */}
            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/90 via-black/20 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 left-[20px] w-[2px] bg-gradient-to-b from-white/0 via-white/5 to-white/0 pointer-events-none z-10 mix-blend-overlay" />
            
            {/* Gentle ambient light reflection sweeping across the cover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.03] to-white/0 pointer-events-none z-10" />

            {/* Front Cover Content Area */}
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
      <div className="w-full md:w-[55%] h-auto md:h-screen md:overflow-y-auto overflow-x-hidden relative scroll-smooth p-6 pb-32 md:p-24 lg:p-32 custom-scrollbar shrink-0">
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
        <div className="space-y-6 text-lg md:text-xl font-medium leading-relaxed max-w-prose text-white/70">
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

        {/* Scroll Linked Elements (People Featured) */}
        <div className="mt-32 mb-16 pt-16 border-t border-white/10">
          <ScrollFadeSection delayIndex={0}>
            <h2 className="text-2xl font-bold mb-4 font-mono tracking-tighter">People Featured</h2>
            <p className="text-white/50 max-w-prose">
              The thought leaders, creators, and researchers driving the conversations explored in this issue.
            </p>
          </ScrollFadeSection>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-32 items-start">
          {[
            { name: "Alma Dowdall", role: "Music Artist", description: "Targets topics of existentialism adding to Gen Z culture with alternative pop/electronic music." },
            { name: "Alex Puliatti", role: "Digital Designer", description: "Working in the digital design department giving Gen Z perspective to luxury fashion conglomerates." },
            { name: "Tim Dowdall PhD", role: "Philosopher & Author", description: "Specializing in the different types of nihilism and societal functions." },
            { name: "Shumon Basar", role: "Writer & Curator", description: "Specializing in analysis of the digital sphere from a creative perspective." }
          ].map((person, i) => (
            <ScrollFadeSection key={`person-${i}`} delayIndex={i + 1}>
              <div className="p-6 border border-white/10 hover:bg-white/5 transition-colors duration-300">
                <h3 className="font-mono text-sm font-bold uppercase text-white mb-1">{person.name}</h3>
                <span className="font-mono text-xs uppercase text-white/40 block mb-4" style={{ color: themeColor }}>{person.role}</span>
                <p className="text-sm font-medium text-white/70 leading-relaxed">
                  {person.description}
                </p>
              </div>
            </ScrollFadeSection>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Main Scene ─── */

export default function StairScene() {
  const [activeStair, setActiveStair] = useState<number | null>(null)
  
  // Transition state
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  const handleClick = useCallback((index: number, x: number, y: number) => {
    setActiveStair(null)
    setSelectedChapter(index)
  }, [])

  const handleBack = useCallback(() => {
    // Reverse minimal crossfade
    setIsClosing(true)
    setTimeout(() => {
      setSelectedChapter(null)
      setIsClosing(false)
    }, 350)
  }, [])

  const themeColor = selectedChapter !== null ? CHAPTERS[selectedChapter].themeColor : (activeStair !== null ? CHAPTERS[activeStair].themeColor : '#000000')

  // The 3D view fades out cleanly when navigating deeply
  const is3DHidden = selectedChapter !== null && !isClosing

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden font-sans">
      
      {/* 1) Optional absolute style injection for custom scrollbars */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0,0,0,0.2);
          border-radius: 4px;
        }
      `}</style>
      


      {/* 3D Canvas Layer — fades out or completely unmounts/hides */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          opacity: is3DHidden ? 0 : 1, // Completely invisible when detail view is fully open
          pointerEvents: selectedChapter !== null ? 'none' : 'auto',
          transition: 'opacity 150ms ease',
        }}
      >
        <Canvas 
          camera={{ position: [0, 0, 30], fov: 35 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.4} color="#ffffff" />
          <directionalLight position={[15, 20, 10]} intensity={1.2} />
          <React.Suspense fallback={null}>
            <Environment preset="city" />
          </React.Suspense>
          
          <StairStack 
            activeStair={activeStair}
            setActiveStair={setActiveStair}
            handleClick={handleClick}
          />
        </Canvas>
      </div>

      {/* Chapter Detail Overlay Data */}
      {selectedChapter !== null && (
        <ChapterDetail 
          chapter={CHAPTERS[selectedChapter]} 
          onBack={handleBack} 
          themeColor={themeColor}
          isClosing={isClosing}
        />
      )}
    </div>
  )
}
