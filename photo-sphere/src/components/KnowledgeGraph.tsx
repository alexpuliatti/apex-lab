"use client"

import { useRef, useState, useEffect, Suspense, useMemo, useCallback } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls, Billboard, Text } from "@react-three/drei"
import { ChevronDown } from "lucide-react"
import * as THREE from "three"

// Import data
import { nodes as initialNodes, links as initialLinks, MACRO_TOPICS, MacroTopic } from "../data/graphData"
import ViewControls, { ViewMode } from "./ViewControls"

// ═══════════════════════════════════════════════════════════════════════
// LAYOUT ENGINES — compute target positions per view mode
// ═══════════════════════════════════════════════════════════════════════

function computeConstellationTargets(nodes: typeof initialNodes) {
  // Returns null — constellation mode uses physics simulation, not fixed targets
  return null
}

function computeTimelineTargets(nodes: typeof initialNodes) {
  const targets = new Map<string, THREE.Vector3>()
  const SPAN_X = 140  // total horizontal spread

  // Era nodes go on the spine at fixed positions
  const ERA_X: Record<string, number> = {
    'era_tradition':  -60,
    'era_modernism':  -25,
    'era_postmodern':  15,
    'era_metamodern':  55,
  }

  // Exclude image nodes from timeline — they add visual noise
  const eraNodes = nodes.filter(n => n.type === 'era')
  const otherNodes = nodes.filter(n => n.type !== 'era' && n.type !== 'image')
    .sort((a, b) => (a.temporalOrder ?? 50) - (b.temporalOrder ?? 50))

  // Place era nodes on the spine (y=0)
  eraNodes.forEach(node => {
    const x = ERA_X[node.id] ?? 0
    targets.set(node.id, new THREE.Vector3(x, 0, 0))
  })

  // Wide vertical lanes — generous spacing so labels never overlap  
  const TYPE_Y: Record<string, number> = {
    'chapter':  22,
    'concept': -15,
    'person':   40,
    'quote':   -38,
  }

  // Group nodes by type, then spread each group across the X axis
  const typeGroups = new Map<string, typeof otherNodes>()
  otherNodes.forEach(n => {
    const group = typeGroups.get(n.type) || []
    group.push(n)
    typeGroups.set(n.type, group)
  })

  typeGroups.forEach((group, type) => {
    const yBase = TYPE_Y[type] ?? 0
    // Sort by temporalOrder within the group
    group.sort((a, b) => (a.temporalOrder ?? 50) - (b.temporalOrder ?? 50))

    group.forEach((node, i) => {
      // Rank-based X: evenly distribute by sorted position, not raw temporalOrder
      const t = group.length > 1 ? i / (group.length - 1) : 0.5 // 0–1
      const x = (t - 0.5) * SPAN_X
      // Stagger vertically: alternate rows within the lane
      const yJitter = (i % 3 - 1) * 7
      // Small z for depth
      const z = Math.sin(i * 1.1) * 2

      targets.set(node.id, new THREE.Vector3(x, yBase + yJitter, z))
    })
  })

  return targets
}

function computeClusterTargets(nodes: typeof initialNodes) {
  const targets = new Map<string, THREE.Vector3>()
  const topicList = MACRO_TOPICS.map(t => t.id)

  // Assign each topic a sector — wide radius with good separation
  const RADIUS = 42
  const topicCenters = new Map<string, THREE.Vector3>()
  topicList.forEach((topic, i) => {
    const angle = (i / topicList.length) * Math.PI * 2 - Math.PI / 2
    topicCenters.set(topic, new THREE.Vector3(
      Math.cos(angle) * RADIUS,
      Math.sin(angle) * RADIUS,
      0
    ))
  })

  // Group nodes by topic and sort by size (biggest first = closest to center)
  const topicGroups = new Map<string, typeof nodes>()
  topicList.forEach(t => topicGroups.set(t, []))
  nodes.forEach(node => {
    const topic = node.macroTopic || 'Cultural Paradigms'
    topicGroups.get(topic)?.push(node)
  })

  topicGroups.forEach((groupNodes, topic) => {
    const center = topicCenters.get(topic)!
    // Sort: bigger nodes closer to center
    const sorted = [...groupNodes].sort((a, b) => (b.size || 1) - (a.size || 1))

    sorted.forEach((node, i) => {
      if (i === 0) {
        // Biggest node at center
        targets.set(node.id, new THREE.Vector3(center.x, center.y, 0))
      } else {
        // Concentric rings: golden angle spiral
        const angle = i * 2.399963  // golden angle in radians
        const ringRadius = 4 + Math.sqrt(i) * 4
        targets.set(node.id, new THREE.Vector3(
          center.x + Math.cos(angle) * ringRadius,
          center.y + Math.sin(angle) * ringRadius,
          0
        ))
      }
    })
  })

  // Recenter: compute centroid and offset all positions to (0,0,0)
  const centroid = new THREE.Vector3()
  targets.forEach(v => centroid.add(v))
  centroid.divideScalar(targets.size)
  targets.forEach(v => v.sub(centroid))

  return targets
}

// ═══════════════════════════════════════════════════════════════════════
// 3D NODE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function ImageNode({ node, onClick, highlightState }: { node: any, onClick: () => void, highlightState: 'connected' | 'dimmed' | 'none' | 'filtered' }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const texture = useLoader(THREE.TextureLoader, node.imagePath) as THREE.Texture
  const currentOpacity = useRef(0.8)
  
  useMemo(() => {
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
  }, [texture])

  const targetOpacity = highlightState === 'filtered' ? 0 
    : highlightState === 'dimmed' ? 0.12 
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
      
      currentOpacity.current = THREE.MathUtils.lerp(currentOpacity.current, targetOpacity, 0.06)
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      if (mat) mat.opacity = currentOpacity.current
    }
  })

  const isInteractable = highlightState !== 'dimmed' && highlightState !== 'filtered'

  return (
    <mesh 
      ref={meshRef}
      onPointerOver={isInteractable ? (e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; } : undefined}
      onPointerOut={isInteractable ? (e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; } : undefined}
      onClick={isInteractable ? (e) => { e.stopPropagation(); onClick(); } : undefined}
    >
      <planeGeometry args={[3.5, 4.2]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} transparent opacity={0.8} />
    </mesh>
  )
}

// Visual config per node type
function getNodeStyle(type: string, size: number = 1, hovered: boolean = false, macroTopic?: string) {
  const sizeScale = size || 1
  // Get topic color if available
  const topicColor = macroTopic ? MACRO_TOPICS.find(t => t.id === macroTopic)?.color : undefined

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
      color: hovered ? '#ffffff' : (topicColor || '#C2384D'),
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

function TextNode({ node, onClick, onHover, highlightState }: { node: any, onClick: () => void, onHover: (id: string | null) => void, highlightState: 'connected' | 'dimmed' | 'none' | 'filtered' }) {
  const ref = useRef<THREE.Group>(null)
  const textRef = useRef<any>(null)
  const [hovered, setHovered] = useState(false)
  const currentOpacity = useRef(1.0)
  const currentScale = useRef(1.0)
  
  const effectiveHover = hovered || highlightState === 'connected'
  const style = getNodeStyle(node.type, node.size, effectiveHover, node.macroTopic)
  
  const targetOpacity = highlightState === 'filtered' ? 0 
    : highlightState === 'dimmed' ? 0.15 : 1.0
  const targetScale = highlightState === 'filtered' ? 0.01
    : highlightState === 'connected' ? 1.15 
    : (highlightState === 'dimmed' ? 0.9 : 1.0)

  useFrame(() => {
    if (ref.current) {
      ref.current.position.set(node.pos.x, node.pos.y, node.pos.z)
      currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, 0.06)
      currentOpacity.current = THREE.MathUtils.lerp(currentOpacity.current, targetOpacity, 0.06)
      ref.current.scale.setScalar(currentScale.current)
      if (textRef.current) {
        textRef.current.fillOpacity = currentOpacity.current
      }
    }
  })

  const isInteractable = highlightState !== 'dimmed' && highlightState !== 'filtered'

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
          onClick={isInteractable ? (e) => { e.stopPropagation(); onClick(); } : undefined}
          onPointerOver={isInteractable ? (e) => { e.stopPropagation(); setHovered(true); onHover(node.id); document.body.style.cursor = 'pointer'; } : undefined}
          onPointerOut={isInteractable ? (e) => { e.stopPropagation(); setHovered(false); onHover(null); document.body.style.cursor = 'auto'; } : undefined}
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

  const nodeMap = useMemo(() => {
    const map = new Map<string, any>()
    nodes.forEach(n => map.set(n.id, n))
    return map
  }, [nodes])

  const highlightShader = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    linewidth: 4,
    uniforms: {
      uTime: { value: 0 },
      uFade: { value: 0 },
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
      uniform float uFade;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      varying float vProgress;
      void main() {
        float flow = fract(vProgress - uTime * 0.15);
        float wave = pow(sin(flow * 3.14159), 2.0);
        vec3 color = mix(uColor1, uColor2, wave * 0.6);
        float alpha = (0.4 + wave * 0.6) * uFade;
        gl_FragColor = vec4(color, alpha);
      }
    `,
  }), [])

  const glowShader = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    linewidth: 6,
    uniforms: {
      uTime: { value: 0 },
      uFade: { value: 0 },
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
      uniform float uFade;
      uniform vec3 uColor;
      varying float vProgress;
      void main() {
        float flow = fract(vProgress - uTime * 0.15);
        float wave = pow(sin(flow * 3.14159), 2.0);
        gl_FragColor = vec4(uColor, (0.12 + wave * 0.15) * uFade);
      }
    `,
  }), [])

  const activeIdRef = useRef<string | null>(null)
  if (hoveredNodeId) activeIdRef.current = hoveredNodeId
  const activeId = hoveredNodeId || activeIdRef.current

  const fadeRef = useRef(0)

  useFrame((state) => {
    const time = state.clock.elapsedTime
    highlightShader.uniforms.uTime.value = time
    glowShader.uniforms.uTime.value = time

    const fadeTarget = hoveredNodeId ? 1 : 0
    fadeRef.current = THREE.MathUtils.lerp(fadeRef.current, fadeTarget, 0.04)

    highlightShader.uniforms.uFade.value = fadeRef.current
    glowShader.uniforms.uFade.value = fadeRef.current

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
        
        if (activeId && (link.source === activeId || link.target === activeId)) {
          highlightPositions[hi++] = sx; highlightPositions[hi++] = sy; highlightPositions[hi++] = sz
          highlightPositions[hi++] = tx; highlightPositions[hi++] = ty; highlightPositions[hi++] = tz
          highlightUvs[ui++] = 0
          highlightUvs[ui++] = 1
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
      <lineSegments>
        <bufferGeometry ref={lineGeometryRef}>
          <bufferAttribute 
            attach="attributes-position" 
            args={[positions, 3]} 
          />
        </bufferGeometry>
        <lineBasicMaterial color="#C2384D" transparent opacity={hoveredNodeId ? 0.1 : 0.4} />
      </lineSegments>
      <lineSegments material={glowShader}>
        <bufferGeometry ref={glowGeometryRef}>
          <bufferAttribute attach="attributes-position" args={[highlightPositions.slice(), 3]} />
          <bufferAttribute attach="attributes-aProgress" args={[highlightUvs.slice(), 1]} />
        </bufferGeometry>
      </lineSegments>
      <lineSegments material={highlightShader}>
        <bufferGeometry ref={highlightGeometryRef}>
          <bufferAttribute attach="attributes-position" args={[highlightPositions, 3]} />
          <bufferAttribute attach="attributes-aProgress" args={[highlightUvs, 1]} />
        </bufferGeometry>
      </lineSegments>
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

// ═══════════════════════════════════════════════════════════════════════
// MAIN GRAPH SCENE
// ═══════════════════════════════════════════════════════════════════════

function GraphScene({ autoRotate, links, viewMode, filteredNodeIds, onSelectNode, onSelectImage, onDismiss, missedTrigger }: { 
  autoRotate: boolean, links: any[], viewMode: ViewMode, filteredNodeIds: Set<string>,
  onSelectNode: (n: any) => void, onSelectImage: (imagePath: string) => void, onDismiss: () => void, missedTrigger: number 
}) {
  const groupRef = useRef<THREE.Group>(null)
  
  const [physicsNodes] = useState(() => initialNodes.map(n => ({
    ...n,
    pos: new THREE.Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100),
    vel: new THREE.Vector3()
  })))

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
  
  const activeNodeId = lockedNodeId || hoveredNodeId

  // Compute target positions for non-constellation views
  const viewTargets = useMemo(() => {
    if (viewMode === 'timeline') return computeTimelineTargets(initialNodes)
    if (viewMode === 'cluster') return computeClusterTargets(initialNodes)
    return null
  }, [viewMode])

  const prevViewModeRef = useRef(viewMode)
  const cameraAnimFrames = useRef(0)

  useFrame((state, delta) => {
    const frozen = hoveredRef.current || lockedRef.current
    const dt = Math.min(delta, 0.1) 

    if (viewMode === 'constellation') {
      // Full physics simulation
      if (!frozen) {
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

        physicsNodes.forEach(node => {
          const gravityStrength = node.type === 'chapter' || node.type === 'era' ? 0.5 : 0.25
          node.vel.add(node.pos.clone().normalize().multiplyScalar(-gravityStrength * dt))
        })

        physicsNodes.forEach(node => {
          node.vel.multiplyScalar(0.88)
          node.pos.add(node.vel.clone().multiplyScalar(dt))
        })
      }
    } else {
      // Timeline or Cluster — lerp towards target positions
      if (viewTargets) {
        const lerpSpeed = 0.04
        physicsNodes.forEach(node => {
          const target = viewTargets.get(node.id)
          if (target) {
            node.pos.lerp(target, lerpSpeed)
            node.vel.set(0, 0, 0) // kill velocity
          }
        })
      }
    }

    // Auto-rotate only in constellation mode
    if (groupRef.current && autoRotate && !frozen && viewMode === 'constellation') {
      groupRef.current.rotation.y += delta * 0.12
    }

    // In 2D modes, smoothly reset group rotation to face camera
    if (groupRef.current && viewMode !== 'constellation') {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.08)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.08)
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.08)
    }

    // Animate camera distance only briefly after a view mode change (not every frame)
    if (prevViewModeRef.current !== viewMode) {
      cameraAnimFrames.current = 90 // animate for ~90 frames (~1.5s)
      // Reset camera to face 2D plane head-on when entering cluster or timeline
      if (viewMode === 'cluster' || viewMode === 'timeline') {
        state.camera.position.set(0, 0, state.camera.position.z)
        state.camera.lookAt(0, 0, 0)
      }
      prevViewModeRef.current = viewMode
    }
    if (cameraAnimFrames.current > 0) {
      const targetZ = viewMode === 'timeline' ? 110 : viewMode === 'cluster' ? 80 : 55
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.06)
      // Keep camera centered in 2D modes
      if (viewMode !== 'constellation') {
        state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 0, 0.06)
        state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 0, 0.06)
      }
      cameraAnimFrames.current--
    }
  })

  // Filtered visible links — only show links where both ends are visible
  const visibleLinks = useMemo(() => {
    if (filteredNodeIds.size === 0) return links
    return links.filter(link => filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target))
  }, [links, filteredNodeIds])

  // Compute connected node IDs for hover/lock highlighting
  const connectedIds = useMemo(() => {
    if (!activeNodeId) return new Set<string>()
    const ids = new Set<string>()
    visibleLinks.forEach(link => {
      if (link.source === activeNodeId) ids.add(link.target)
      if (link.target === activeNodeId) ids.add(link.source)
    })
    ids.add(activeNodeId)
    return ids
  }, [activeNodeId, visibleLinks])

  return (
    <group ref={groupRef}>
      <GraphLines links={visibleLinks} nodes={physicsNodes} hoveredNodeId={activeNodeId} />
      {physicsNodes.map((node) => {
        // Hide images in timeline view
        const isHiddenByView = viewMode === 'timeline' && node.type === 'image'
        const isFiltered = isHiddenByView || (filteredNodeIds.size > 0 && !filteredNodeIds.has(node.id))
        const highlightState = isFiltered ? 'filtered' as const
          : !activeNodeId ? 'none' as const
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

// ═══════════════════════════════════════════════════════════════════════
// TIMELINE OVERLAY (HTML-based era labels for timeline view)
// ═══════════════════════════════════════════════════════════════════════

function TimelineOverlay({ visible }: { visible: boolean }) {
  const eras = [
    { label: "Tradition",      pos: "5%" },
    { label: "Modernism",      pos: "28%" },
    { label: "Post-Modernism", pos: "58%" },
    { label: "Meta-Modernism", pos: "85%" },
  ]

  return (
    <div 
      className="absolute inset-x-0 top-[55%] h-[2px] pointer-events-none transition-opacity duration-700 z-20"
      style={{ opacity: visible ? 0.8 : 0 }}
    >
      {/* Horizontal timeline line */}
      <div className="absolute inset-x-8 top-0 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), rgba(255,255,255,0.5), rgba(255,255,255,0.35), transparent)' }} />
      
      {/* Era markers */}
      {eras.map(era => (
        <div 
          key={era.label}
          className="absolute top-3"
          style={{ left: era.pos, transform: 'translateX(-50%)' }}
        >
          <div className="w-[1px] h-4 bg-white/30 mx-auto mb-1.5" />
          <span 
            className="text-[10px] uppercase tracking-[0.2em] text-white/50 whitespace-nowrap"
            style={{ fontFamily: 'Geist, sans-serif' }}
          >
            {era.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// CLUSTER LABELS OVERLAY
// ═══════════════════════════════════════════════════════════════════════

function ClusterLabelsOverlay({ visible }: { visible: boolean }) {
  // Position labels around the screen edges corresponding to cluster sectors
  const positions = [
    { topic: MACRO_TOPICS[0], top: '15%', left: '50%' },   // Digital Identity — top
    { topic: MACRO_TOPICS[1], top: '40%', left: '90%' },   // Nihilism & Meaning — right
    { topic: MACRO_TOPICS[2], top: '75%', left: '75%' },   // Nature & Technology — bottom-right
    { topic: MACRO_TOPICS[3], top: '75%', left: '25%' },   // Cultural Paradigms — bottom-left
    { topic: MACRO_TOPICS[4], top: '40%', left: '10%' },   // Consumer Culture — left
  ]

  return (
    <div 
      className="absolute inset-0 pointer-events-none transition-opacity duration-700 z-20"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {positions.map(({ topic, top, left }) => (
        <div
          key={topic.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ top, left }}
        >
          <span 
            className="text-[10px] md:text-xs uppercase tracking-[0.2em] whitespace-nowrap"
            style={{ 
              fontFamily: 'Geist, sans-serif',
              color: topic.color,
              opacity: 0.5,
              textShadow: `0 0 20px ${topic.glow}`,
            }}
          >
            {topic.id}
          </span>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════

export default function KnowledgeGraph({ mounted }: { mounted?: boolean }) {
  const [autoRotate, setAutoRotate] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [selectedKeyword, setSelectedKeyword] = useState<any | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [missedTrigger, setMissedTrigger] = useState(0)
  const [zoomReady, setZoomReady] = useState(false)

  // Multi-view state
  const [viewMode, setViewMode] = useState<ViewMode>('constellation')
  const [activeTopics, setActiveTopics] = useState<Set<MacroTopic>>(new Set(MACRO_TOPICS.map(t => t.id)))
  const [activeNodeTypes, setActiveNodeTypes] = useState<Set<string>>(new Set(['concept', 'person', 'quote', 'image']))

  // HQ images for lightbox
  const allImages = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => `/CS_slides_hq/slide_${String(i + 1).padStart(2, "0")}.jpg`), []
  )
  const toHQ = (path: string) => path.replace('CS_slides/', 'CS_slides_hq/')

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100)
    const hintTimer = setTimeout(() => setShowHint(true), 2500)
    return () => {
      clearTimeout(timer)
      clearTimeout(hintTimer)
    }
  }, [])

  useEffect(() => {
    if (hasInteracted && !zoomReady) {
      const t = setTimeout(() => setZoomReady(true), 2200)
      return () => clearTimeout(t)
    }
  }, [hasInteracted, zoomReady])

  const handleToggleTopic = useCallback((topic: MacroTopic) => {
    setActiveTopics(prev => {
      const next = new Set(prev)
      if (next.has(topic)) {
        // Don't allow deselecting all
        if (next.size > 1) next.delete(topic)
      } else {
        next.add(topic)
      }
      return next
    })
  }, [])

  const handleToggleNodeType = useCallback((type: string) => {
    setActiveNodeTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) {
        if (next.size > 1) next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }, [])

  // Compute which node IDs pass the filter
  const filteredNodeIds = useMemo(() => {
    const allTopicsActive = activeTopics.size === MACRO_TOPICS.length
    const allTypesActive = activeNodeTypes.size === 4

    // If everything is active, return empty set (= show all)
    if (allTopicsActive && allTypesActive) return new Set<string>()

    const ids = new Set<string>()
    initialNodes.forEach(node => {
      // Eras and chapters always visible
      if (node.type === 'era' || node.type === 'chapter') {
        ids.add(node.id)
        return
      }
      const topicMatch = !node.macroTopic || activeTopics.has(node.macroTopic)
      const typeMatch = activeNodeTypes.has(node.type)
      if (topicMatch && typeMatch) ids.add(node.id)
    })
    return ids
  }, [activeTopics, activeNodeTypes])

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
          transition: "filter 2.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
          pointerEvents: hasInteracted ? 'auto' : 'none'
        }}>
          <Canvas 
            camera={{ position: [0, 0, viewMode === 'timeline' ? 110 : 55], fov: 60 }}
            onPointerMissed={() => setMissedTrigger(t => t + 1)}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <directionalLight position={[-10, -10, -5]} intensity={0.5} />
            
            <Suspense fallback={null}>
              <GraphScene 
                autoRotate={autoRotate} 
                links={visibleLinks}
                viewMode={viewMode}
                filteredNodeIds={filteredNodeIds}
                onSelectNode={(node) => setSelectedKeyword(node)}
                onSelectImage={(path) => setSelectedImage(toHQ(path))}
                onDismiss={() => { setSelectedKeyword(null); setSelectedImage(null); }}
                missedTrigger={missedTrigger}
              />
            </Suspense>
            
            <OrbitControls 
              enableZoom={zoomReady} 
              enablePan={true} 
              autoRotate={false} 
              enableDamping={true} 
              dampingFactor={0.05} 
              minDistance={10} 
              maxDistance={250}
              enableRotate={viewMode === 'constellation'}
              zoomToCursor={true}
            />
          </Canvas>
        </div>

        {/* Logo */}
        <div 
          className="absolute z-10 pointer-events-none"
          style={{
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: hasInteracted ? 'flex-start' : 'center',
            justifyContent: hasInteracted ? 'flex-start' : 'center',
            padding: hasInteracted ? '24px' : '0',
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
              opacity: hasInteracted ? 0.6 : (isReady ? 1 : 0),
              transform: !hasInteracted && isReady ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'transform, opacity, width',
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

        {/* View Controls */}
        <ViewControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          visible={hasInteracted}
        />

        {/* Timeline overlay */}
        <TimelineOverlay visible={viewMode === 'timeline' && hasInteracted} />

        {/* Cluster labels overlay */}
        <ClusterLabelsOverlay visible={viewMode === 'cluster' && hasInteracted} />

        {/* View Mode Label */}
        {hasInteracted && (
          <div 
            className="absolute top-6 right-6 z-30 pointer-events-none transition-all duration-500"
          >
            <span 
              className="text-[10px] uppercase tracking-[0.2em] text-white/20"
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              {viewMode === 'constellation' ? '⟡ Constellation' : viewMode === 'timeline' ? '⟶ Timeline' : '◎ Cluster'}
            </span>
          </div>
        )}

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
              {/* Type + Topic badges */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="inline-block px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] rounded-full" style={{
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
                {selectedKeyword.macroTopic && (
                  <span className="inline-block px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] rounded-full" style={{
                    fontFamily: 'Geist, sans-serif',
                    background: MACRO_TOPICS.find(t => t.id === selectedKeyword.macroTopic)?.glow || 'rgba(255,255,255,0.05)',
                    color: MACRO_TOPICS.find(t => t.id === selectedKeyword.macroTopic)?.color || '#999',
                  }}>
                    {selectedKeyword.macroTopic}
                  </span>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl mb-4 tracking-wide" style={{ 
                fontFamily: selectedKeyword.type === 'quote' ? 'Geist, sans-serif' : 'ArrowFont, sans-serif',
                fontStyle: selectedKeyword.type === 'quote' ? 'italic' : 'normal',
                color: selectedKeyword.type === 'era' ? '#c9a84c' :
                  selectedKeyword.type === 'person' ? '#6ec6e6' :
                  selectedKeyword.type === 'chapter' ? '#ffffff' :
                  (MACRO_TOPICS.find(t => t.id === selectedKeyword.macroTopic)?.color || '#C2384D'),
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
