'use client'

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, RoundedBox, Environment } from '@react-three/drei'
import * as THREE from 'three'
import SmoothScroll from './SmoothScroll'
import { useRouter } from 'next/navigation'
import { CHAPTERS, type Chapter } from '../data/chapters'



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

  const targetX = isHovered ? baseX + 1 : baseX
  
  const baseColor = useMemo(() => new THREE.Color("#151515"), [])
  const hoverColor = useMemo(() => new THREE.Color(chapter.themeColor), [chapter.themeColor])
  const baseEmissive = useMemo(() => new THREE.Color("#050505"), [])

  // Spring behavior values
  useFrame((_, delta) => {
    const d = Math.min(delta, 0.1)
    
    if (groupRef.current) {
      if (mounted) {
        groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetX, 8, d)
        groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, 0, 8, d)
        const s = THREE.MathUtils.damp(groupRef.current.scale.x, 1, 8, d)
        groupRef.current.scale.setScalar(s)
      } else {
        groupRef.current.position.x = baseX
        groupRef.current.position.y = -0.4
        groupRef.current.scale.setScalar(0.92)
      }
    }
    
    if (matRef.current) {
      if (mounted) {
        matRef.current.opacity = THREE.MathUtils.damp(matRef.current.opacity, 0.85, 8, d)
        matRef.current.color.lerp(isHovered ? hoverColor : baseColor, d * 8)
        matRef.current.emissive.lerp(isHovered ? hoverColor : baseEmissive, d * 8)
        matRef.current.emissiveIntensity = THREE.MathUtils.damp(matRef.current.emissiveIntensity, isHovered ? 0.8 : 0, 8, d)
      } else {
        matRef.current.opacity = 0
      }
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

      {/* Visual book — smoothly scales and glides in */}
      <group ref={groupRef} visible={mounted}>
        <RoundedBox args={[width, height, depth]} radius={0.3} smoothness={4} raycast={() => null}>
          <meshPhysicalMaterial
            ref={matRef}
            roughness={0.3}
            metalness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.15}
            envMapIntensity={1.2}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </RoundedBox>

        {/* Front Face Text */}
        <group position={[-width/2 + 1, 0, depth/2 + 0.2]}>
          <Text
            position={[0, 0, 0]}
            font="/fonts/Geist-Regular.ttf"
            fontSize={isMobile ? 0.35 : 0.25}
            color={isHovered ? "#222" : "#ffffff"}
            anchorX="left"
            anchorY="middle"
          >
            {chapter.id}
          </Text>
          
          <Text
            position={[1.5, 0, 0]}
            font="/fonts/Arrow-Font-Regular.otf"
            fontSize={isMobile ? 0.42 : 0.32}
            color={isHovered ? "#222" : "#ffffff"}
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

/* ─── Chapter Detail Overlay Elements ─── */

export function ScrollFadeSection({ children, delayIndex = 0 }: { children: React.ReactNode, delayIndex?: number }) {
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

export function ChapterCoverGraphic({ id, themeColor }: { id: string, themeColor: string }) {
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
          <path d="M-10,30 L110,70" fill="none" strokeWidth="1" stroke={themeColor} className="opacity-30" strokeDasharray="30 20" style={{ animation: 'cxSpeedLine 0.6s linear infinite' }} />
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

/* ─── Main Scene ─── */

export default function StairScene() {
  const router = useRouter();
  const [activeStair, setActiveStair] = useState<number | null>(null)
  
  const handleClick = useCallback((index: number, x: number, y: number) => {
    router.push(`/zine/${CHAPTERS[index].id}`)
  }, [router])

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
          opacity: 1, 
          pointerEvents: 'auto',
        }}
      >
        <Canvas 
          camera={{ position: [0, 0, 30], fov: 35 }}
          dpr={[1, 1.5]}
          frameloop="always"
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
    </div>
  )
}
