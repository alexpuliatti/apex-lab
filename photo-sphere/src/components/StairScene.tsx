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

function ResponsiveGroup({ children }: { children: React.ReactNode }) {
  const { viewport } = useThree()
  // Base width of the books is 16. We want it to occupy at most 90% of the screen width.
  const scale = Math.min(1, (viewport.width * 0.9) / 16)

  return <group scale={scale}>{children}</group>
}

function Stair({ index, chapter, active, onHover, onClick }: { index: number, chapter: Chapter, active: number | null, onHover: (n: number | null) => void, onClick: (n: number, x: number, y: number) => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const isHovered = active === index

  const width = 16
  const height = 1.4
  const depth = 8
  
  const yOffset = height + 0.8
  
  const baseX = 0
  const baseY = -(index - 2) * yOffset
  const baseZ = 0

  const targetX = isHovered ? baseX + 1 : baseX
  
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
      <group ref={groupRef}>
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
            fontSize={0.25}
            color={"#ffffff"}
            anchorX="left"
            anchorY="middle"
          >
            {chapter.id}
          </Text>
          
          <Text
            position={[1.5, 0, 0]}
            font="/fonts/Arrow Font Regular.otf"
            fontSize={0.4}
            color={"#ffffff"}
            anchorX="left"
            anchorY="middle"
            maxWidth={5}
            lineHeight={1.2}
          >
            {chapter.title}
          </Text>
          
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
      className="absolute inset-0 z-30 flex flex-col md:flex-row overflow-hidden pointer-events-auto bg-black text-white"
      style={{
        opacity: (!visible || isClosing) ? 0 : 1,
        transition: 'opacity 300ms ease-out',
      }}
    >
      {/* Left side: Fixed Cover Art */}
      <div 
        className="w-full md:w-[45%] h-[40vh] md:h-screen sticky top-0 flex flex-col justify-between p-8 md:p-16 border-b md:border-b-0 md:border-r border-white/10"
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
        
        <div className="flex-1 flex flex-col items-center justify-center pt-8">
          {/* Greyscale Illustration Placeholder */}
          <div 
            className="w-full max-w-sm aspect-[3/4] bg-white/5 backdrop-blur-sm border border-white/10 flex flex-col p-8 justify-end relative overflow-hidden"
            style={{
              opacity: visible && !isClosing ? 1 : 0,
              transform: visible && !isClosing ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.98)',
              transition: 'opacity 700ms cubic-bezier(0.23, 1, 0.32, 1) 150ms, transform 700ms cubic-bezier(0.23, 1, 0.32, 1) 150ms'
            }}
          >
            <div className="absolute top-8 right-8 font-mono text-xs font-bold text-white/30">VOL.01</div>
            <div className="text-[3rem] font-bold text-white/20" style={{ fontFamily: 'ArrowFont, serif', lineHeight: 0.9 }}>
              {chapter.titleFlat}
            </div>
            {/* Minimal line details */}
            <svg width="100%" height="40%" className="absolute inset-x-0 top-[20%] opacity-20 pointer-events-none stroke-white" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,50 Q25,20 50,50 T100,50" fill="none" strokeWidth="1" />
              <path d="M0,60 Q30,10 60,60 T100,60" fill="none" strokeWidth="0.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Right side: Scrollable Article */}
      <div className="w-full md:w-[55%] h-[60vh] md:h-screen overflow-y-auto overflow-x-hidden relative scroll-smooth p-8 md:p-24 lg:p-32 custom-scrollbar">
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
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter mb-4 leading-[1.05]" style={{ fontFamily: 'ArrowFont, serif' }}>
            {chapter.titleFlat}
          </h1>
          <div className="font-mono text-sm tracking-wide opacity-50 mb-12">
            By {chapter.author}
          </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-32">
          {[
            { name: "Alma Dowdall", role: "Music Artist", description: "Targets topics of existentialism adding to Gen Z culture with alternative pop/electronic music." },
            { name: "Alex Puliatti", role: "Digital Designer", description: "Working in the digital design department giving Gen Z perspective to luxury fashion conglomerates." },
            { name: "Tim Dowdall PhD", role: "Philosopher & Author", description: "Specializing in the different types of nihilism and societal functions." },
            { name: "Shumon Basar", role: "Writer & Curator", description: "Specializing in analysis of the digital sphere from a creative perspective." }
          ].map((person, i) => (
            <ScrollFadeSection key={`person-${i}`} delayIndex={i + 1}>
              <div className="p-6 border border-white/10 h-full hover:bg-white/5 transition-colors duration-300">
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
      
      {/* HTML Overlay Title */}
      <div 
        className="absolute top-20 right-12 z-10 pointer-events-none text-right"
        style={{
          opacity: selectedChapter !== null ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        <h2 className="text-3xl md:text-4xl tracking-tighter text-white" style={{ fontFamily: 'ArrowFont, serif' }}>
          the apex zine
        </h2>
        <p className="font-mono text-xs tracking-widest uppercase mt-2 opacity-40 text-white">
          issue 01, spring 2026
        </p>
      </div>

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
          <Environment preset="city" />
          
          <ResponsiveGroup>
            {CHAPTERS.map((chapter, index) => (
              <Stair 
                key={chapter.id} 
                index={index} 
                chapter={chapter} 
                active={activeStair}
                onHover={setActiveStair}
                onClick={handleClick}
              />
            ))}
          </ResponsiveGroup>
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
