"use client"

import { useRef, useState, useEffect, Suspense, useMemo } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls, Billboard, Text, Line } from "@react-three/drei"
import { RotateCw, RefreshCcw, ChevronDown } from "lucide-react"
import * as THREE from "three"

// Import data
import { nodes as initialNodes, links as initialLinks } from "../data/graphData"

function ImageNode({ node, onClick, highlightState }: { node: any, onClick: () => void, highlightState: 'connected' | 'dimmed' | 'none' }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const texture = useLoader(THREE.TextureLoader, node.imagePath) as THREE.Texture
  const currentOpacity = useRef(0.8)
  
  useMemo(() => {
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
  }, [texture])

  const targetOpacity = highlightState === 'dimmed' ? 0.12 
    : highlightState === 'connected' ? 1 
    : hovered ? 1 : 0.8

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
      
      // Smooth opacity lerp
      currentOpacity.current = THREE.MathUtils.lerp(currentOpacity.current, targetOpacity, 0.08)
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      if (mat) mat.opacity = currentOpacity.current
    }
  })

  return (
    <mesh 
      ref={meshRef}
      onPointerOver={highlightState !== 'dimmed' ? (e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; } : undefined}
      onPointerOut={highlightState !== 'dimmed' ? (e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; } : undefined}
      onClick={highlightState !== 'dimmed' ? (e) => { e.stopPropagation(); onClick(); } : undefined}
    >
      <planeGeometry args={[3.5, 4.2]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} transparent opacity={0.8} />
    </mesh>
  )
}

// Visual config per node type
function getNodeStyle(type: string, size: number = 1, hovered: boolean = false) {
  const sizeScale = size || 1
  switch (type) {
    case 'chapter': return {
      font: '/fonts/Arrow Font Regular.otf',
      fontSize: (hovered ? 1.1 : 0.9) * sizeScale,
      color: hovered ? '#ffffff' : '#e0e0e0',
      outlineWidth: 0.04,
      maxWidth: 18,
    }
    case 'era': return {
      font: '/fonts/Arrow Font Regular.otf',
      fontSize: (hovered ? 0.9 : 0.75) * sizeScale,
      color: hovered ? '#ffd700' : '#c9a84c',
      outlineWidth: 0.03,
      maxWidth: 14,
    }
    case 'concept': return {
      font: '/fonts/Arrow Font Regular.otf',
      fontSize: (hovered ? 0.8 : 0.65) * sizeScale,
      color: hovered ? '#ffffff' : '#C2384D',
      outlineWidth: 0.03,
      maxWidth: 14,
    }
    case 'person': return {
      font: '/fonts/Geist-Regular.ttf',
      fontSize: (hovered ? 0.55 : 0.42),
      color: hovered ? '#ffffff' : '#6ec6e6',
      outlineWidth: 0.02,
      maxWidth: 10,
    }
    case 'quote': return {
      font: '/fonts/Geist-Regular.ttf',
      fontSize: (hovered ? 0.38 : 0.28),
      color: hovered ? '#ffffff' : 'rgba(255,255,255,0.35)',
      outlineWidth: 0.01,
      maxWidth: 12,
    }
    default: return {
      font: '/fonts/Arrow Font Regular.otf',
      fontSize: 0.6,
      color: '#C2384D',
      outlineWidth: 0.03,
      maxWidth: 14,
    }
  }
}

function TextNode({ node, onClick, onHover, highlightState }: { node: any, onClick: () => void, onHover: (id: string | null) => void, highlightState: 'connected' | 'dimmed' | 'none' }) {
  const ref = useRef<THREE.Group>(null)
  const textRef = useRef<any>(null)
  const [hovered, setHovered] = useState(false)
  const currentOpacity = useRef(1.0)
  const currentScale = useRef(1.0)
  
  const effectiveHover = hovered || highlightState === 'connected'
  const style = getNodeStyle(node.type, node.size, effectiveHover)
  
  const targetOpacity = highlightState === 'dimmed' ? 0.15 : 1.0
  const targetScale = highlightState === 'connected' ? 1.15 : (highlightState === 'dimmed' ? 0.9 : 1.0)

  useFrame(() => {
    if (ref.current) {
      ref.current.position.set(node.pos.x, node.pos.y, node.pos.z)
      currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, 0.08)
      currentOpacity.current = THREE.MathUtils.lerp(currentOpacity.current, targetOpacity, 0.08)
      ref.current.scale.setScalar(currentScale.current)
      if (textRef.current) {
        textRef.current.fillOpacity = currentOpacity.current
      }
    }
  })

  return (
    <group ref={ref}>
      <Billboard>
        <Text 
          ref={textRef}
          font={style.font}
          fontSize={style.fontSize} 
          color={style.color} 
          outlineWidth={style.outlineWidth} 
          outlineColor="black" 
          anchorX="center" 
          anchorY="middle" 
          textAlign="center"
          maxWidth={style.maxWidth}
          fillOpacity={1}
          onClick={highlightState !== 'dimmed' ? (e) => { e.stopPropagation(); onClick(); } : undefined}
          onPointerOver={highlightState !== 'dimmed' ? (e) => { e.stopPropagation(); setHovered(true); onHover(node.id); document.body.style.cursor = 'pointer'; } : undefined}
          onPointerOut={highlightState !== 'dimmed' ? (e) => { e.stopPropagation(); setHovered(false); onHover(null); document.body.style.cursor = 'auto'; } : undefined}
        >
          {node.label}
        </Text>
      </Billboard>
    </group>
  )
}

function GraphLines({ links, nodes, hoveredNodeId }: { links: any[], nodes: any[], hoveredNodeId: string | null }) {
  const lineGeometryRef = useRef<THREE.BufferGeometry>(null)
  const highlightGeometryRef = useRef<THREE.BufferGeometry>(null)
  const glowGeometryRef = useRef<THREE.BufferGeometry>(null)
  const positions = useMemo(() => new Float32Array(links.length * 6), [links.length])
  const highlightPositions = useMemo(() => new Float32Array(links.length * 6), [links.length])
  const highlightUvs = useMemo(() => new Float32Array(links.length * 2), [links.length])

  // Build node lookup for O(1)
  const nodeMap = useMemo(() => {
    const map = new Map<string, any>()
    nodes.forEach(n => map.set(n.id, n))
    return map
  }, [nodes])

  // Animated shader for highlighted links
  const highlightShader = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    linewidth: 4,
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color('#C2384D') },
      uColor2: { value: new THREE.Color('#ffffff') },
    },
    vertexShader: `
      attribute float aProgress;
      varying float vProgress;
      void main() {
        vProgress = aProgress;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      varying float vProgress;
      void main() {
        float flow = fract(vProgress - uTime * 0.15);
        float wave = pow(sin(flow * 3.14159), 2.0);
        vec3 color = mix(uColor1, uColor2, wave * 0.6);
        float alpha = 0.4 + wave * 0.6;
        gl_FragColor = vec4(color, alpha);
      }
    `,
  }), [])

  // Glow shader (softer, wider)
  const glowShader = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    linewidth: 6,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#C2384D') },
    },
    vertexShader: `
      attribute float aProgress;
      varying float vProgress;
      void main() {
        vProgress = aProgress;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      varying float vProgress;
      void main() {
        float flow = fract(vProgress - uTime * 0.15);
        float wave = pow(sin(flow * 3.14159), 2.0);
        gl_FragColor = vec4(uColor, 0.12 + wave * 0.15);
      }
    `,
  }), [])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    highlightShader.uniforms.uTime.value = time
    glowShader.uniforms.uTime.value = time

    let i = 0
    let hi = 0
    let ui = 0
    for (const link of links) {
      const sourceNode = nodeMap.get(link.source)
      const targetNode = nodeMap.get(link.target)
      
      if (sourceNode && targetNode) {
        const sx = sourceNode.pos.x || 0, sy = sourceNode.pos.y || 0, sz = sourceNode.pos.z || 0
        const tx = targetNode.pos.x || 0, ty = targetNode.pos.y || 0, tz = targetNode.pos.z || 0
        positions[i++] = sx; positions[i++] = sy; positions[i++] = sz
        positions[i++] = tx; positions[i++] = ty; positions[i++] = tz
        
        if (hoveredNodeId && (link.source === hoveredNodeId || link.target === hoveredNodeId)) {
          highlightPositions[hi++] = sx; highlightPositions[hi++] = sy; highlightPositions[hi++] = sz
          highlightPositions[hi++] = tx; highlightPositions[hi++] = ty; highlightPositions[hi++] = tz
          highlightUvs[ui++] = 0  // start vertex
          highlightUvs[ui++] = 1  // end vertex
        }
      }
    }
    
    if (lineGeometryRef.current?.attributes.position) {
      lineGeometryRef.current.attributes.position.needsUpdate = true
    }
    if (highlightGeometryRef.current?.attributes.position) {
      highlightGeometryRef.current.attributes.position.needsUpdate = true
      ;(highlightGeometryRef.current.attributes as any).aProgress.needsUpdate = true
      highlightGeometryRef.current.setDrawRange(0, hi / 3)
    }
    if (glowGeometryRef.current?.attributes.position) {
      glowGeometryRef.current.attributes.position.needsUpdate = true
      ;(glowGeometryRef.current.attributes as any).aProgress.needsUpdate = true
      glowGeometryRef.current.setDrawRange(0, hi / 3)
    }
  })

  return (
    <group>
      {/* Base links */}
      <lineSegments>
        <bufferGeometry ref={lineGeometryRef}>
          <bufferAttribute 
            attach="attributes-position" 
            args={[positions, 3]} 
          />
        </bufferGeometry>
        <lineBasicMaterial color="#C2384D" transparent opacity={hoveredNodeId ? 0.1 : 0.4} />
      </lineSegments>
      {/* Glow pass (behind) */}
      {hoveredNodeId && (
        <lineSegments material={glowShader}>
          <bufferGeometry ref={glowGeometryRef}>
            <bufferAttribute attach="attributes-position" args={[highlightPositions.slice(), 3]} />
            <bufferAttribute attach="attributes-aProgress" args={[highlightUvs.slice(), 1]} />
          </bufferGeometry>
        </lineSegments>
      )}
      {/* Highlighted links with flowing gradient */}
      {hoveredNodeId && (
        <lineSegments material={highlightShader}>
          <bufferGeometry ref={highlightGeometryRef}>
            <bufferAttribute attach="attributes-position" args={[highlightPositions, 3]} />
            <bufferAttribute attach="attributes-aProgress" args={[highlightUvs, 1]} />
          </bufferGeometry>
        </lineSegments>
      )}
    </group>
  )
}

// Spring target distances by link type
function getSpringLength(linkType?: string) {
  switch (linkType) {
    case 'timeline':    return 30
    case 'semantic':    return 35
    case 'attribution': return 25
    case 'interview':   return 32
    case 'visual':      return 20
    default:            return 35
  }
}

function GraphScene({ autoRotate, restartKey, links, onSelectNode, onSelectImage, onDismiss, missedTrigger }: { autoRotate: boolean, restartKey: number, links: any[], onSelectNode: (n: any) => void, onSelectImage: (imagePath: string) => void, onDismiss: () => void, missedTrigger: number }) {
  const groupRef = useRef<THREE.Group>(null)
  
  const [physicsNodes] = useState(() => initialNodes.map(n => ({
    ...n,
    pos: new THREE.Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100),
    vel: new THREE.Vector3()
  })))

  // Build a lookup map for O(1) access
  const nodeMap = useMemo(() => {
    const map = new Map<string, typeof physicsNodes[0]>()
    physicsNodes.forEach(n => map.set(n.id, n))
    return map
  }, [physicsNodes])

  useEffect(() => {
    physicsNodes.forEach(rn => {
      rn.pos.set((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100)
      rn.vel.set(0, 0, 0)
    })
  }, [physicsNodes])

  useEffect(() => {
    if (missedTrigger > 0) {
      lockedRef.current = null
      setLockedNodeId(null)
      onDismiss()
    }
  }, [missedTrigger])

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [lockedNodeId, setLockedNodeId] = useState<string | null>(null)
  const hoveredRef = useRef<string | null>(null)
  const lockedRef = useRef<string | null>(null)
  

  
  const handleHover = (id: string | null) => { hoveredRef.current = id; setHoveredNodeId(id) }
  const handleLock = (id: string) => { 
    if (lockedRef.current === id) {
      lockedRef.current = null; setLockedNodeId(null)
    } else {
      lockedRef.current = id; setLockedNodeId(id)
    }
  }
  const handleUnlock = () => { lockedRef.current = null; setLockedNodeId(null); onDismiss(); }
  

  
  // Active node is locked (persistent) or hovered (temporary)
  const activeNodeId = lockedNodeId || hoveredNodeId

  useFrame((state, delta) => {
    // Freeze everything when a node is active (hovered or locked)
    const frozen = hoveredRef.current || lockedRef.current
    if (frozen) return

    const dt = Math.min(delta, 0.1) 
    
    // 1. Repulsive forces (node-type aware)
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
        if (dist < 70) {
          const s1 = (n1.size || 1)
          const s2 = (n2.size || 1)
          const repulsionStrength = 400 * (s1 + s2) / 2
          const force = diff.normalize().multiplyScalar(repulsionStrength / (dist * dist))
          n1.vel.add(force.clone().multiplyScalar(dt))
          n2.vel.sub(force.clone().multiplyScalar(dt))
          
          if (dist < 18) {
            const pushForce = diff.clone().normalize().multiplyScalar(15 * (18 - dist))
            n1.vel.add(pushForce.clone().multiplyScalar(dt))
            n2.vel.sub(pushForce.clone().multiplyScalar(dt))
          }
        }
      }
    }
    
    // 2. Spring forces
    links.forEach(link => {
      const source = nodeMap.get(link.source)
      const target = nodeMap.get(link.target)
      if (source && target) {
        const diff = target.pos.clone().sub(source.pos)
        const dist = diff.length()
        const targetDist = getSpringLength(link.type)
        const force = diff.normalize().multiplyScalar((dist - targetDist) * 0.5)
        source.vel.add(force.clone().multiplyScalar(dt))
        target.vel.sub(force.clone().multiplyScalar(dt))
      }
    })

    // 3. Central gravity
    physicsNodes.forEach(node => {
      const gravityStrength = node.type === 'chapter' || node.type === 'era' ? 0.5 : 0.25
      node.vel.add(node.pos.clone().normalize().multiplyScalar(-gravityStrength * dt))
    })

    // 4. Update positions & apply friction
    physicsNodes.forEach(node => {
      node.vel.multiplyScalar(0.88)
      node.pos.add(node.vel.clone().multiplyScalar(dt))
    })

    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.12
    }
  })

  const visibleNodes = physicsNodes

  // Compute connected node IDs for hover/lock highlighting
  const connectedIds = useMemo(() => {
    if (!activeNodeId) return new Set<string>()
    const ids = new Set<string>()
    links.forEach(link => {
      if (link.source === activeNodeId) ids.add(link.target)
      if (link.target === activeNodeId) ids.add(link.source)
    })
    ids.add(activeNodeId)
    return ids
  }, [activeNodeId, links])

  return (
    <group ref={groupRef}>
      <GraphLines links={links} nodes={physicsNodes} hoveredNodeId={activeNodeId} />
      {visibleNodes.map((node) => {
        const highlightState = !activeNodeId ? 'none' as const
          : connectedIds.has(node.id) ? 'connected' as const
          : 'dimmed' as const
        
        if (node.type === 'image') {
          return <ImageNode key={node.id} node={node} onClick={() => onSelectImage(node.imagePath!)} highlightState={highlightState} />
        } else {
          return <TextNode key={node.id} node={node} onClick={() => { handleLock(node.id); onSelectNode(node); }} onHover={handleHover} highlightState={highlightState} />
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
  const [selectedKeyword, setSelectedKeyword] = useState<any | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [missedTrigger, setMissedTrigger] = useState(0)
  const [zoomReady, setZoomReady] = useState(false)

  // HQ images for lightbox (originals ~1.7MB each)
  const allImages = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => `/CS_slides_hq/slide_${String(i + 1).padStart(2, "0")}.jpg`), []
  )
  
  // Map a thumbnail path to its HQ equivalent
  const toHQ = (path: string) => path.replace('CS_slides/', 'CS_slides_hq/')

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100)
    const hintTimer = setTimeout(() => setShowHint(true), 2500)
    return () => {
      clearTimeout(timer)
      clearTimeout(hintTimer)
    }
  }, [])

  // Delay enabling zoom until logo transition completes
  useEffect(() => {
    if (hasInteracted && !zoomReady) {
      const t = setTimeout(() => setZoomReady(true), 2200)
      return () => clearTimeout(t)
    }
  }, [hasInteracted, zoomReady])

  const handleButtonClick = (buttonName: string, action: () => void) => {
    setClickedButton(buttonName)
    setTimeout(() => setClickedButton(null), 150)
    action()
  }

  // Generate links based on filter
  const visibleLinks = initialLinks

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
          <Canvas 
            camera={{ position: [0, 0, 55], fov: 60 }}
            onPointerMissed={() => setMissedTrigger(t => t + 1)}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <directionalLight position={[-10, -10, -5]} intensity={0.5} />
            
            <Suspense fallback={null}>
              <GraphScene 
                autoRotate={autoRotate} 
                restartKey={simulationRestartKey} 
                links={visibleLinks}
                onSelectNode={(node) => setSelectedKeyword(node)}
                onSelectImage={(path) => setSelectedImage(toHQ(path))}
                onDismiss={() => { setSelectedKeyword(null); setSelectedImage(null); }}
                missedTrigger={missedTrigger}
              />
            </Suspense>
            
            <OrbitControls enableZoom={zoomReady} enablePan={true} autoRotate={false} enableDamping={true} dampingFactor={0.05} minDistance={10} maxDistance={250} />
          </Canvas>
        </div>

        <div 
          className="absolute z-10 pointer-events-none"
          style={{
            top: hasInteracted ? '24px' : '50%',
            left: hasInteracted ? '24px' : '50%',
            transform: hasInteracted 
              ? 'translate(0, 0) scale(1)' 
              : `translate(-50%, -50%) scale(${mounted ? 1.25 : 1})`,
            opacity: hasInteracted ? 0.6 : (mounted ? 1 : 0),
            transition: 'all 2s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform, opacity, top, left',
          }}
        >
          <img 
            src="/materials/apex_logo.png" 
            alt="Apex Logo" 
            style={{
              width: hasInteracted ? '80px' : 'min(80vw, 800px)',
              height: 'auto',
              objectFit: 'contain' as const,
              filter: 'drop-shadow(0 0 40px rgba(255,255,255,0.05))',
              transition: 'width 2s cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'width',
              animation: hasInteracted ? 'none' : 'pulseLogo 4s ease-in-out infinite alternate 1.2s',
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


        {/* Selected Node Popup Overlay */}
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
              {/* Type badge */}
              <span className="inline-block px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] rounded-full mb-4" style={{
                fontFamily: 'Geist, sans-serif',
                background: selectedKeyword.type === 'chapter' ? 'rgba(255,255,255,0.12)' :
                  selectedKeyword.type === 'era' ? 'rgba(201,168,76,0.2)' :
                  selectedKeyword.type === 'person' ? 'rgba(110,198,230,0.2)' :
                  selectedKeyword.type === 'quote' ? 'rgba(255,255,255,0.08)' :
                  'rgba(194,56,77,0.2)',
                color: selectedKeyword.type === 'era' ? '#c9a84c' :
                  selectedKeyword.type === 'person' ? '#6ec6e6' :
                  selectedKeyword.type === 'chapter' ? '#ffffff' :
                  '#C2384D',
              }}>
                {selectedKeyword.type}{selectedKeyword.role ? ` · ${selectedKeyword.role}` : ''}
              </span>
              <h2 className="text-2xl md:text-3xl mb-4 tracking-wide" style={{ 
                fontFamily: selectedKeyword.type === 'quote' ? 'Geist, sans-serif' : 'ArrowFont, sans-serif',
                fontStyle: selectedKeyword.type === 'quote' ? 'italic' : 'normal',
                color: selectedKeyword.type === 'era' ? '#c9a84c' :
                  selectedKeyword.type === 'person' ? '#6ec6e6' :
                  selectedKeyword.type === 'chapter' ? '#ffffff' : '#C2384D',
              }}>
                {selectedKeyword.label}
              </h2>
              {selectedKeyword.source && (
                <p className="text-white/30 text-sm mb-4" style={{ fontFamily: 'Geist, sans-serif' }}>— {selectedKeyword.source}</p>
              )}
              <div className="w-12 h-[1px] bg-white/20 mb-6" />
              <p className="text-white/80 text-base md:text-lg leading-relaxed font-light" style={{ fontFamily: 'Geist, sans-serif' }}>
                {selectedKeyword.description}
              </p>
            </div>
          </div>
        )}

        {/* Image Lightbox */}
        {selectedImage && (
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl transition-all duration-300"
            onClick={() => setSelectedImage(null)}
          >
            {/* Prev */}
            <button
              className="absolute left-6 top-1/2 -translate-y-1/2 p-3 text-white/40 hover:text-white transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation()
                const idx = allImages.indexOf(selectedImage)
                setSelectedImage(allImages[(idx - 1 + allImages.length) % allImages.length])
              }}
            >
              <ChevronDown className="w-8 h-8 rotate-90" />
            </button>

            {/* Image */}
            <div className="relative max-w-3xl max-h-[85vh] pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <img 
                src={selectedImage} 
                alt="Editorial" 
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-xs tracking-[0.2em] uppercase" style={{ fontFamily: 'Geist, sans-serif' }}>
                {allImages.indexOf(selectedImage) + 1} / {allImages.length}
              </div>
            </div>

            {/* Next */}
            <button
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-white/40 hover:text-white transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation()
                const idx = allImages.indexOf(selectedImage)
                setSelectedImage(allImages[(idx + 1) % allImages.length])
              }}
            >
              <ChevronDown className="w-8 h-8 -rotate-90" />
            </button>

            {/* Close */}
            <button 
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors text-xl"
              onClick={() => setSelectedImage(null)}
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </>
  )
}
