'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

const CHAPTERS = [
  {
    id: '01',
    title: "Intro to APEX:\nAuthor's Note",
    titleFlat: "Intro to APEX: Author's Note",
    subtitle: "editorial exploration",
    info: "A.E.",
    summary: `APEX is born from a simple question — what is actually going on with us? Not the curated versions of ourselves we post online, not the personas we perform at work, but the raw, messy, beautiful reality of being alive right now.

This zine is an attempt to map the unmappable. To trace the invisible threads that connect our digital lives to our physical ones, our consumer choices to our existential anxieties, our nihilism to our hope.

We're not journalists. We're not academics. We're explorers — standing at the edge of something new and trying to describe what we see. Every piece in this collection is a fragment of a larger picture, one that's still forming, still shifting, still refusing to be pinned down.

Welcome to the APEX. The view from up here is extraordinary.`,
    author: "Editorial Team",
    readTime: "3 min read",
  },
  {
    id: '02',
    title: "Gen Z Users Adopt\nNihilistic Beliefs",
    titleFlat: "Gen Z Users Adopt Nihilistic Beliefs",
    subtitle: "cultural shift",
    info: "coping mechanism",
    summary: `There's a peculiar comfort in believing nothing matters. Across TikTok, Twitter, and the quieter corners of Discord, a generation is embracing nihilism — not as despair, but as liberation.

The data tells a story: Gen Z is simultaneously the most anxious and the most philosophically adventurous generation in recorded history. They're reading Camus on their phones between Instagram stories. They're finding Nietzsche through memes. And they're building entire identities around the radical acceptance that meaning isn't given — it's made.

But this isn't the cold, academic nihilism of philosophy departments. This is sunny nihilism. Warm nihilism. The kind that says: if nothing matters cosmically, then everything matters personally. If the universe is indifferent, then your choices are truly your own.

The coping mechanism has become the philosophy. The philosophy has become the culture. And the culture is reshaping how an entire generation relates to work, relationships, consumption, and creativity.

We interviewed 47 Gen Z individuals across London, Berlin, and New York. Their responses reveal a generation not lost in meaninglessness, but dancing in it.`,
    author: "Research Division",
    readTime: "8 min read",
  },
  {
    id: '03',
    title: "Accelerationism\nin Modern Society",
    titleFlat: "Accelerationism in Modern Society",
    subtitle: "fluidity of self",
    info: "metafantasy",
    summary: `The world is speeding up, and some people think we should let it. Accelerationism — the idea that the best way through is faster — has leaked from obscure philosophy forums into mainstream discourse.

But the version that's taken hold isn't political. It's personal. Young people are accelerating through identities, aesthetics, careers, and belief systems at a pace that would have been incomprehensible twenty years ago. The "fluidity of self" isn't just a queer theory concept anymore — it's a lifestyle.

You can be cottagecore in January and cyberpunk by March. You can pivot from finance to art to tech to permaculture in the span of a single year. The old frameworks of identity — stable, coherent, building toward something — have been replaced by something more like jazz: improvisational, responsive, alive.

This is the metafantasy. Not the fantasy of escaping reality, but the fantasy of reality itself being infinitely malleable. And with AI-generated imagery, digital fashion, and virtual spaces, the fantasy is becoming increasingly indistinguishable from the real.

The question isn't whether acceleration is good or bad. It's whether we can learn to surf the wave instead of being crushed by it.`,
    author: "Cultural Analysis",
    readTime: "7 min read",
  },
  {
    id: '04',
    title: "Cybernatural\nSynergy",
    titleFlat: "Cybernatural Synergy",
    subtitle: "symbiosis",
    info: "nature & tech",
    summary: `The oldest dichotomy in the modern world — nature versus technology — is dissolving. And it's dissolving from both sides simultaneously.

In Hackney, mushroom networks are being monitored by IoT sensors. In Shoreditch, biophilic design studios are using AI to generate architectural forms inspired by coral reefs. In Brixton, community gardens are managed through Discord servers.

The cybernatural isn't a trend. It's an inevitability. As our tools become more organic and our understanding of nature becomes more computational, the boundary between the two becomes not just blurred but meaningless.

We spent three months documenting projects at this intersection. What we found challenges the techno-pessimism of the environmental movement and the nature-blindness of the tech industry. The most interesting people are working in the space between, creating something that is neither purely digital nor purely natural, but genuinely new.

Symbiosis isn't just a biological concept anymore. It's a design principle. And the designers of the future will need to be as fluent in mycology as they are in machine learning.`,
    author: "Field Research",
    readTime: "6 min read",
  },
  {
    id: '05',
    title: "The Temporal\nComponents",
    titleFlat: "The Temporal Components",
    subtitle: "past, present, future",
    info: "exploration",
    summary: `Time moves differently now. Not metaphorically — literally. Our relationship with past, present, and future has been fundamentally altered by technology, and we're only beginning to understand the implications.

The past is no longer fixed. It's a database, searchable and remixable. Every photo, every post, every message is a temporal artifact that can be surfaced, recontextualised, and weaponised at any moment. Nostalgia has become an industry. Memory has become a medium.

The present has collapsed. In a world of infinite feeds and real-time updates, the "now" has stretched to encompass everything from three seconds ago to three hours from now. We live in a permanent present tense, reacting to stimuli that arrive faster than we can process them.

The future has been cancelled and rebooted. Climate anxiety has made long-term planning feel absurd. AI has made career planning feel impossible. And yet, a strange optimism persists — not optimism about outcomes, but optimism about possibility.

These three temporal components — the searchable past, the infinite present, the uncertain future — are the raw materials from which Gen Z is building its worldview. Understanding them is understanding everything.`,
    author: "Temporal Studies",
    readTime: "9 min read",
  },
]

function Stair({ index, chapter, active, onHover, onClick }: any) {
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
  const targetEmissive = isHovered ? 1.5 : 0

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.1)
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetX, 8, d)
    }
    if (matRef.current) {
      matRef.current.emissiveIntensity = THREE.MathUtils.damp(matRef.current.emissiveIntensity, targetEmissive, 6, d)
    }
  })

  return (
    <group position={[baseX, baseY, baseZ]}>
      {/* Invisible stationary hit-test mesh — never moves, so pointer events are stable */}
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); onHover(index); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); onHover(null); document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onClick(index); }}
      >
        <boxGeometry args={[width + 2, height, depth]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Visual book — animates freely without affecting raycasting */}
      <group ref={groupRef}>
        <RoundedBox args={[width, height, depth]} radius={0.3} smoothness={4} raycast={() => null}>
          <meshPhysicalMaterial
            ref={matRef}
            color="#a31f3c"
            emissive="#ff0022"
            emissiveIntensity={0}
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
        <group position={[-width/2 + 1, 0, depth/2 + 0.01]}>
          <Text
            position={[0, 0, 0]}
            font="/fonts/Geist-Regular.ttf"
            fontSize={0.25}
            color={isHovered ? "#ffffff" : "#aaaaaa"}
            anchorX="left"
            anchorY="middle"
          >
            {chapter.id}
          </Text>
          
          <Text
            position={[1.5, 0, 0]}
            font="/fonts/Arrow Font Regular.otf"
            fontSize={0.4}
            color={isHovered ? "#ffffff" : "#cccccc"}
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
            color={isHovered ? "#aaaaaa" : "#888888"}
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
            color={isHovered ? "#ffffff" : "#aaaaaa"}
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

function ChapterDetail({ chapter, onBack }: { chapter: typeof CHAPTERS[0]; onBack: () => void }) {
  const [visible, setVisible] = useState(false)
  const paragraphs = chapter.summary.split('\n\n')

  useEffect(() => {
    // Trigger entrance animation on next frame
    requestAnimationFrame(() => setVisible(true))
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
      className="absolute inset-0 z-30 overflow-y-auto"
      style={{
        background: 'black',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s cubic-bezier(0.2, 0, 0, 1)',
      }}
    >
      {/* Top bar */}
      <div 
        className="sticky top-0 z-40 flex items-center justify-between px-8 md:px-16 py-6"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 70%, transparent 100%)',
        }}
      >
        <button
          onClick={onBack}
          className="font-mono text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
          style={{ background: 'none', border: 'none', color: 'white', padding: 0 }}
        >
          ← Back to chapters
        </button>
        <span className="font-mono text-xs uppercase tracking-widest opacity-30">
          Chapter {chapter.id} / 05
        </span>
      </div>

      {/* Content */}
      <div className="px-8 md:px-16 max-w-3xl mx-auto pb-24">
        {/* Chapter number */}
        <div 
          className="mt-8 mb-6"
          style={{
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            opacity: visible ? 0.2 : 0,
            transition: 'all 0.7s cubic-bezier(0.2, 0, 0, 1) 0.1s',
          }}
        >
          <span 
            className="text-[8rem] md:text-[12rem] leading-none font-light tracking-tighter"
            style={{ 
              fontFamily: 'ArrowFont, serif',
              color: '#ff2a5f',
            }}
          >
            {chapter.id}
          </span>
        </div>

        {/* Title */}
        <h1 
          className="text-4xl md:text-6xl tracking-tighter mb-4 leading-[1.1]"
          style={{
            fontFamily: 'ArrowFont, serif',
            transform: visible ? 'translateY(0)' : 'translateY(40px)',
            opacity: visible ? 1 : 0,
            transition: 'all 0.7s cubic-bezier(0.2, 0, 0, 1) 0.15s',
          }}
        >
          {chapter.titleFlat}
        </h1>

        {/* Divider */}
        <div 
          className="my-8"
          style={{
            width: visible ? '48px' : '0px',
            height: '1px',
            background: 'rgba(255, 42, 95, 0.4)',
            transition: 'width 0.8s cubic-bezier(0.2, 0, 0, 1) 0.3s',
          }} 
        />

        {/* Meta row */}
        <div 
          className="flex flex-wrap gap-6 mb-12"
          style={{
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            opacity: visible ? 0.5 : 0,
            transition: 'all 0.6s cubic-bezier(0.2, 0, 0, 1) 0.3s',
          }}
        >
          <span className="font-mono text-xs uppercase tracking-widest">
            {chapter.subtitle}
          </span>
          <span className="font-mono text-xs uppercase tracking-widest opacity-60">
            {chapter.author}
          </span>
          <span className="font-mono text-xs uppercase tracking-widest opacity-40">
            {chapter.readTime}
          </span>
        </div>

        {/* Body paragraphs — staggered entrance */}
        <div className="space-y-6">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-base md:text-lg leading-relaxed font-light"
              style={{
                color: 'rgba(255, 255, 255, 0.75)',
                transform: visible ? 'translateY(0)' : 'translateY(30px)',
                opacity: visible ? 1 : 0,
                transition: `all 0.6s cubic-bezier(0.2, 0, 0, 1) ${0.35 + i * 0.07}s`,
              }}
            >
              {p}
            </p>
          ))}
        </div>

        {/* Bottom nav */}
        <div 
          className="mt-20 pt-8 flex justify-between items-center"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            opacity: visible ? 1 : 0,
            transition: `all 0.6s cubic-bezier(0.2, 0, 0, 1) ${0.35 + paragraphs.length * 0.07}s`,
          }}
        >
          <button
            onClick={onBack}
            className="glass-pill px-6 py-3 font-mono text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: 'white' }}
          >
            ← All chapters
          </button>
          <span className="font-mono text-xs uppercase tracking-widest opacity-20">
            APEX Zine · Issue 01
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Scene ─── */

export default function StairScene() {
  const [activeStair, setActiveStair] = useState<number | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)

  const handleClick = useCallback((index: number) => {
    setActiveStair(null)
    document.body.style.cursor = 'auto'
    setSelectedChapter(index)
  }, [])

  const handleBack = useCallback(() => {
    setSelectedChapter(null)
  }, [])

  const isDetailView = selectedChapter !== null

  return (
    <div className="relative w-full h-[100dvh] bg-black">
      {/* HTML Overlay Title */}
      <div 
        className="absolute top-20 right-12 z-10 pointer-events-none text-right"
        style={{
          opacity: isDetailView ? 0 : 1,
          transition: 'opacity 0.4s ease',
        }}
      >
        <h2 className="text-3xl md:text-4xl tracking-tighter text-white" style={{ fontFamily: 'ArrowFont, serif' }}>
          the apex zine
        </h2>
        <p className="font-mono text-xs tracking-widest uppercase mt-2 opacity-40 text-white">
          issue 01, spring 2026
        </p>
      </div>

      {/* 3D Canvas — fades and scales when detail is open */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          opacity: isDetailView ? 0 : 1,
          transform: isDetailView ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.5s cubic-bezier(0.2, 0, 0, 1)',
          pointerEvents: isDetailView ? 'none' : 'auto',
        }}
      >
        <Canvas 
          camera={{ position: [0, 0, 30], fov: 35 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.4} color="#ff2a5f" />
          <directionalLight 
            position={[15, 20, 10]} 
            intensity={1.2} 
            color="#ff2a5f"
          />
          <directionalLight position={[-15, -10, 5]} intensity={0.5} color="#ff2a5f" />
          <pointLight position={[0, 5, 15]} intensity={0.5} color="#ffffff" />
          
          <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
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
          </group>
        </Canvas>
      </div>

      {/* Chapter Detail Overlay */}
      {selectedChapter !== null && (
        <ChapterDetail 
          chapter={CHAPTERS[selectedChapter]} 
          onBack={handleBack} 
        />
      )}
    </div>
  )
}
