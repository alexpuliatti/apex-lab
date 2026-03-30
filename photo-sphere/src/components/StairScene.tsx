'use client'

import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Environment, MeshTransmissionMaterial, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

const CHAPTERS = [
  { id: '01', title: "Intro to APEX:\nAuthor's Note", subtitle: "editorial exploration", info: "A.E." },
  { id: '02', title: "Gen Z Users Adopt\nNihilistic Beliefs", subtitle: "cultural shift", info: "coping mechanism" },
  { id: '03', title: "Accelerationism\nin Modern Society", subtitle: "fluidity of self", info: "metafantasy" },
  { id: '04', title: "Cybernatural\nSynergy", subtitle: "symbiosis", info: "nature & tech" },
  { id: '05', title: "The Temporal\nComponents", subtitle: "past, present, future", info: "exploration" },
]

function Stair({ index, chapter, active, onHover, onClick }: any) {
  const groupRef = useRef<THREE.Group>(null)
  const isHovered = active === index

  const width = 16
  const height = 1.4
  const depth = 8
  
  const yOffset = height + 0.8
  
  const baseX = -4
  const baseY = -(index - 2) * yOffset
  const baseZ = 0

  const targetX = isHovered ? baseX + 1 : baseX

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.1)
    }
  })

  return (
    <group 
      ref={groupRef}
      position={[baseX, baseY, baseZ]} 
      onPointerOver={(e) => { e.stopPropagation(); onHover(index); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); onHover(null); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onClick(index); }}
    >
      <RoundedBox args={[width, height, depth]} radius={0.3} smoothness={4} castShadow receiveShadow>
        <MeshTransmissionMaterial 
          samples={8}
          resolution={512}
          thickness={4}
          roughness={0.4}
          transmission={1}
          ior={1.4}
          chromaticAberration={0.03}
          color="#a31f3c"
          emissive="#ff0022"
          emissiveIntensity={isHovered ? 1.5 : 0}
          clearcoat={1}
          clearcoatRoughness={0.2}
          backside
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
          anchorX="right"
          anchorY="middle"
          textAlign="right"
          maxWidth={3}
        >
          {chapter.info}
        </Text>
      </group>
    </group>
  )
}

export default function StairScene() {
  const [activeStair, setActiveStair] = useState<number | null>(null)

  return (
    <div className="relative w-full h-[100dvh] bg-black">
      {/* HTML Overlay Title */}
      <div className="absolute top-20 right-12 z-10 pointer-events-none text-right">
        <h2 className="text-5xl md:text-7xl tracking-tighter text-white" style={{ fontFamily: 'ArrowFont, serif' }}>
          the apex zine
        </h2>
        <p className="font-mono text-sm tracking-widest uppercase mt-4 opacity-40 text-white">
          issue 01, spring 2026
        </p>
      </div>

      <Canvas 
        shadows 
        camera={{ position: [0, 0, 30], fov: 35 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.3} color="#ff2a5f" />
        <directionalLight 
          castShadow 
          position={[15, 20, 10]} 
          intensity={1.0} 
          color="#ff2a5f"
        />
        <directionalLight position={[-15, -10, 5]} intensity={0.5} color="#ff2a5f" />
        <pointLight position={[0, 5, 15]} intensity={0.4} color="#ffffff" />
        <Environment preset="city" />
        
        <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
          {CHAPTERS.map((chapter, index) => (
            <Stair 
              key={chapter.id} 
              index={index} 
              chapter={chapter} 
              active={activeStair}
              onHover={setActiveStair}
              onClick={() => {}}
            />
          ))}
        </group>
      </Canvas>
    </div>
  )
}
