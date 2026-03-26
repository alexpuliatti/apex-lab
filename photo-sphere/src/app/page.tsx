"use client"

import { useRef, useState, useEffect, Suspense, useMemo } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls, Billboard, Text, Line } from "@react-three/drei"
import { RotateCw, RefreshCcw, ChevronDown } from "lucide-react"
import * as THREE from "three"

// Import data
import { nodes as initialNodes, links as initialLinks } from "../data/graphData"

function ImageNode({ node }: { node: any }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useLoader(THREE.TextureLoader, node.imagePath) as THREE.Texture
  
  useMemo(() => {
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
  }, [texture])

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.set(node.pos.x, node.pos.y, node.pos.z)
      const lookAtPos = new THREE.Vector3(0, 0, 0)
      const currentPos = meshRef.current.position.clone()
      
      if (!currentPos.equals(lookAtPos)) {
        const direction = currentPos.sub(lookAtPos).normalize()
        const target = meshRef.current.position.clone().add(direction)
        meshRef.current.lookAt(target)
      }
    }
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[4.5, 5.4]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} transparent opacity={0.95} />
    </mesh>
  )
}

function KeywordNode({ node, onClick }: { node: any, onClick: () => void }) {
  const ref = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    if (ref.current) {
      ref.current.position.set(node.pos.x, node.pos.y, node.pos.z)
    }
  })

  // Using Arrow Font Regular
  return (
    <group ref={ref}>
      <Billboard>
        <Text 
          font="/fonts/Arrow Font Regular.otf"
          fontSize={hovered ? 1.8 : 1.5} 
          color={hovered ? "#ffffff" : "#00ff73"} 
          outlineWidth={0.06} 
          outlineColor="black" 
          anchorX="center" 
          anchorY="middle" 
          textAlign="center"
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          {node.label}
        </Text>
      </Billboard>
    </group>
  )
}

function GraphLines({ links, nodes }: { links: any[], nodes: any[] }) {
  const lineGeometryRef = useRef<THREE.BufferGeometry>(null)
  const positions = useMemo(() => new Float32Array(links.length * 6), [links.length])

  useFrame(() => {
    if (lineGeometryRef.current && lineGeometryRef.current.attributes.position) {
      let i = 0
      for (const link of links) {
        const sourceNode = nodes.find(n => n.id === link.source)
        const targetNode = nodes.find(n => n.id === link.target)
        
        if (sourceNode && targetNode) {
          positions[i++] = sourceNode.pos.x || 0
          positions[i++] = sourceNode.pos.y || 0
          positions[i++] = sourceNode.pos.z || 0
          positions[i++] = targetNode.pos.x || 0
          positions[i++] = targetNode.pos.y || 0
          positions[i++] = targetNode.pos.z || 0
        }
      }
      
      lineGeometryRef.current.attributes.position.needsUpdate = true
    }
  })

  return (
    <lineSegments>
      <bufferGeometry ref={lineGeometryRef}>
        <bufferAttribute 
          attach="attributes-position" 
          args={[positions, 3]} 
        />
      </bufferGeometry>
      <lineBasicMaterial color="#00ff73" transparent opacity={0.4} />
    </lineSegments>
  )
}

function GraphScene({ autoRotate, restartKey, filterMode, links, onSelectNode }: { autoRotate: boolean, restartKey: number, filterMode: 'all' | 'photo' | 'text', links: any[], onSelectNode: (n: any) => void }) {
  const groupRef = useRef<THREE.Group>(null)
  
  const [physicsNodes] = useState(() => initialNodes.map(n => ({
    ...n,
    pos: new THREE.Vector3((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80),
    vel: new THREE.Vector3()
  })))

  useEffect(() => {
    physicsNodes.forEach(rn => {
      rn.pos.set((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80)
      rn.vel.set(0, 0, 0)
    })
  }, [restartKey, physicsNodes, filterMode]) // Restart structure when filter mode changes

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1) 
    
    // 1. Repulsive forces
    for (let i = 0; i < physicsNodes.length; i++) {
      for (let j = i + 1; j < physicsNodes.length; j++) {
        const n1 = physicsNodes[i]
        const n2 = physicsNodes[j]
        const diff = n1.pos.clone().sub(n2.pos)
        let dist = diff.length()
        if (dist === 0) {
          diff.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
          dist = 0.1
        }
        if (dist < 60) {
          const force = diff.normalize().multiplyScalar(300 / (dist * dist))
          n1.vel.add(force.clone().multiplyScalar(dt))
          n2.vel.sub(force.clone().multiplyScalar(dt))
        }
      }
    }
    
    // 2. Spring forces using dynamic passed LINKS!
    links.forEach(link => {
      const source = physicsNodes.find(n => n.id === link.source)
      const target = physicsNodes.find(n => n.id === link.target)
      if (source && target) {
        const diff = target.pos.clone().sub(source.pos)
        const dist = diff.length()
        const targetDist = 30
        const force = diff.normalize().multiplyScalar((dist - targetDist) * 0.6)
        source.vel.add(force.clone().multiplyScalar(dt))
        target.vel.sub(force.clone().multiplyScalar(dt))
      }
    })

    // 3. Central gravity
    physicsNodes.forEach(node => {
      node.vel.add(node.pos.clone().normalize().multiplyScalar(-0.3 * dt))
    })

    // 4. Update positions & apply friction
    physicsNodes.forEach(node => {
      node.vel.multiplyScalar(0.85)
      node.pos.add(node.vel.clone().multiplyScalar(dt))
    })

    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.15
    }
  })

  const visibleNodes = useMemo(() => {
    if (filterMode === 'all') return physicsNodes
    if (filterMode === 'photo') return physicsNodes.filter(n => n.type === 'image')
    if (filterMode === 'text') return physicsNodes.filter(n => n.type === 'keyword')
    return physicsNodes
  }, [physicsNodes, filterMode])

  return (
    <group ref={groupRef}>
      <GraphLines links={links} nodes={physicsNodes} />
      {visibleNodes.map((node) => {
        if (node.type === "image") {
          return <ImageNode key={node.id} node={node} />
        } else {
          return <KeywordNode key={node.id} node={node} onClick={() => onSelectNode(node)} />
        }
      })}
    </group>
  )
}

export default function PhotoSphere() {
  const [autoRotate, setAutoRotate] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [clickedButton, setClickedButton] = useState<string | null>(null)
  const [simulationRestartKey, setSimulationRestartKey] = useState(0)
  const [filterMode, setFilterMode] = useState<'all' | 'photo' | 'text'>('all')
  const [selectedKeyword, setSelectedKeyword] = useState<any | null>(null)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100)
    const hintTimer = setTimeout(() => setShowHint(true), 2500)
    return () => {
      clearTimeout(timer)
      clearTimeout(hintTimer)
    }
  }, [])

  const handleButtonClick = (buttonName: string, action: () => void) => {
    setClickedButton(buttonName)
    setTimeout(() => setClickedButton(null), 150)
    action()
  }

  // Generate links based on filter
  const visibleLinks = useMemo(() => {
    if (filterMode === 'all') return initialLinks
    
    if (filterMode === 'text') {
      const texts = initialNodes.filter(n => n.type === 'keyword').map(n => n.id)
      const visibleSet = new Set(texts)
      return initialLinks.filter(l => visibleSet.has(l.source) && visibleSet.has(l.target))
    }
    
    if (filterMode === 'photo') {
      // Create a web directly between images so they clump together gracefully
      const images = initialNodes.filter(n => n.type === 'image').map(n => n.id)
      const newLinks = []
      for (let i = 0; i < images.length; i++) {
        // chain them into a circle
        newLinks.push({ source: images[i], target: images[(i+1)%images.length] })
        // cross hatch them to form a web ball
        if (i % 2 === 0) newLinks.push({ source: images[i], target: images[(i+9)%images.length] })
        if (i % 3 === 0) newLinks.push({ source: images[i], target: images[(i+16)%images.length] })
      }
      return newLinks
    }
    return initialLinks
  }, [filterMode])

  return (
    <>
      {/* Global font injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @font-face {
          font-family: 'Geist';
          src: url('/fonts/Geist-Regular.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        @font-face {
          font-family: 'ArrowFont';
          src: url('/fonts/Arrow Font Regular.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
        }
      `}} />

      <div 
        className="relative h-[100dvh] w-full bg-black overflow-hidden select-none touch-none"
        onPointerDown={() => setHasInteracted(true)}
        onWheel={() => setHasInteracted(true)}
        onContextMenu={(e) => e.preventDefault()}
        style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
      >
        <div style={{
          width: '100%', height: '100%',
          filter: hasInteracted ? "blur(0px)" : "blur(18px)",
          transition: "filter 2.5s cubic-bezier(0.2, 0.8, 0.2, 1)"
        }}>
          <Canvas camera={{ position: [0, 0, 55], fov: 60 }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <directionalLight position={[-10, -10, -5]} intensity={0.5} />
            
            <Suspense fallback={null}>
              <GraphScene 
                autoRotate={autoRotate} 
                restartKey={simulationRestartKey} 
                filterMode={filterMode} 
                links={visibleLinks}
                onSelectNode={(node) => setSelectedKeyword(node)}
              />
            </Suspense>
            
            <OrbitControls enableZoom={true} enablePan={true} autoRotate={false} enableDamping={true} dampingFactor={0.05} minDistance={10} maxDistance={100} />
          </Canvas>
        </div>

        <div 
          className={`absolute z-10 pointer-events-none transition-all duration-1500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
            hasInteracted 
              ? "top-6 left-6 md:top-8 md:left-8 translate-x-0 translate-y-0" 
              : `top-1/2 left-1/2 -translate-x-1/2 ${mounted ? "-translate-y-1/2 scale-125" : "-translate-y-[40%] scale-100"}`
          }`}
          style={{
            opacity: hasInteracted ? 0.6 : (mounted ? 1 : 0)
          }}
        >
          <img 
            src="/materials/apex_logo.png" 
            alt="Apex Logo" 
            className={`h-auto object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.05)] transition-all duration-1500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
              hasInteracted ? "w-20 md:w-32" : "w-[80vw] max-w-[800px] max-h-[80vh]"
            }`} 
            style={{
               animation: hasInteracted ? "none" : "pulseLogo 4s ease-in-out infinite alternate 1.2s"
            }}
          />
        </div>

        {/* Scroll/Interact Hint */}
        <div 
          className="absolute bottom-16 left-0 right-0 flex flex-col items-center gap-3 pointer-events-none transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{
            opacity: (!hasInteracted && showHint) ? 0.8 : 0,
            transform: `translateY(${(!hasInteracted && showHint) ? '0' : '20px'})`
          }}
        >
          <span className="text-white/80 tracking-[0.3em] text-[10px] md:text-xs uppercase font-light drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" style={{ fontFamily: 'Geist, sans-serif', paddingLeft: '0.3em' }}>
            Scroll to Explore
          </span>
          <ChevronDown className="w-5 h-5 text-white/60 animate-bounce" strokeWidth={1.5} />
        </div>

        {/* Top Navbar – frosted liquid glass pill */}
        <div className={`absolute top-6 left-1/2 -translate-x-1/2 md:top-8 z-20 pointer-events-auto transition-opacity duration-1000 ${mounted && hasInteracted ? "opacity-100" : "opacity-0 invisible"}`}>
          <div
            className="flex items-center gap-0 rounded-full overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(24px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.4)',
              padding: '4px',
            }}
          >
            <button
              onClick={() => setFilterMode('all')}
              className={`px-6 py-2.5 text-xs tracking-[0.15em] uppercase font-medium rounded-full transition-all duration-300 ${filterMode === 'all' ? 'bg-white/15 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)]' : 'text-white/40 hover:text-white/70'}`}
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode('photo')}
              className={`px-6 py-2.5 text-xs tracking-[0.15em] uppercase font-medium rounded-full transition-all duration-300 ${filterMode === 'photo' ? 'bg-white/15 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)]' : 'text-white/40 hover:text-white/70'}`}
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              Photography
            </button>
            <button
              onClick={() => setFilterMode('text')}
              className={`px-6 py-2.5 text-xs tracking-[0.15em] uppercase font-medium rounded-full transition-all duration-300 ${filterMode === 'text' ? 'bg-white/15 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)]' : 'text-white/40 hover:text-white/70'}`}
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              Text
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:bottom-10 md:right-12 md:left-auto md:translate-x-0 flex gap-0 rounded-full overflow-hidden z-20 pointer-events-auto transition-opacity duration-1000" style={{ opacity: mounted && hasInteracted ? 1 : 0, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px) saturate(1.4)', WebkitBackdropFilter: 'blur(24px) saturate(1.4)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.4)', padding: '4px' }}>
          <button
            onClick={() => handleButtonClick("restart", () => setSimulationRestartKey(prev => prev + 1))}
            className={`p-2 sm:p-3 border-r border-white/20 transition-all duration-150 bg-transparent hover:bg-white/10 text-white ${clickedButton === "restart" ? "scale-90" : "scale-100"}`}
            title="Restart Physics Simulation"
          >
            <RefreshCcw className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={() => handleButtonClick("rotate", () => setAutoRotate(!autoRotate))}
            className={`p-2 sm:p-3 transition-all duration-150 ${
              autoRotate
                ? "bg-white text-black"
                : "bg-transparent hover:bg-white/10 text-white"
            } ${clickedButton === "rotate" ? "scale-90" : "scale-100"}`}
            title="Toggle auto-rotation"
          >
            <RotateCw className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Selected Keyword Popup Overlay */}
        {selectedKeyword && (
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md transition-all duration-300 opacity-100"
            onClick={(e) => { e.stopPropagation(); setSelectedKeyword(null); }}
          >
            <div 
              className="relative max-w-lg w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] pointer-events-auto transform transition-all duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedKeyword(null)}
                className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"
                style={{ fontFamily: 'Geist, sans-serif' }}
              >
                ✕
              </button>
              <h2 className="text-3xl md:text-4xl text-[#00ff73] mb-4 tracking-wide drop-shadow-[0_0_15px_rgba(0,255,115,0.3)]" style={{ fontFamily: 'ArrowFont, sans-serif' }}>
                {selectedKeyword.label}
              </h2>
              <div className="w-12 h-[1px] bg-white/20 mb-6" />
              <p className="text-white/80 text-lg md:text-xl leading-relaxed font-light" style={{ fontFamily: 'Geist, sans-serif' }}>
                {selectedKeyword.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
