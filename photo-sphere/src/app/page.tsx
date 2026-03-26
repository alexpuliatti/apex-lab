"use client"

import { useRef, useState, useEffect, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { RotateCw, Grid3x3, Cylinder, Waves, Orbit } from "lucide-react"
import * as THREE from "three"

// Repeated 12 slides to fill the 48 slots in the original visualization
const images = Array.from(
  { length: 48 },
  (_, i) => `/CS_slides/slide_${String((i % 12) + 1).padStart(2, "0")}.jpg`
)

type PatternMode = "sphere" | "gallery" | "helix" | "wave" | "cylinder"

function ImageCard({
  position,
  rotation,
  image,
  scale = 1,
  targetPosition,
  targetRotation,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  image: string
  scale?: number
  targetPosition: [number, number, number]
  targetRotation: [number, number, number]
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [texture] = useState(() => {
    const loader = new THREE.TextureLoader()
    const tex = loader.load(image)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    return tex
  })

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x += (targetPosition[0] - meshRef.current.position.x) * 0.1
      meshRef.current.position.y += (targetPosition[1] - meshRef.current.position.y) * 0.1
      meshRef.current.position.z += (targetPosition[2] - meshRef.current.position.z) * 0.1

      meshRef.current.rotation.x += (targetRotation[0] - meshRef.current.rotation.x) * 0.1
      meshRef.current.rotation.y += (targetRotation[1] - meshRef.current.rotation.y) * 0.1
      meshRef.current.rotation.z += (targetRotation[2] - meshRef.current.rotation.z) * 0.1
    }
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1.5, 1.8]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} transparent opacity={0.95} />
    </mesh>
  )
}

function Scene({ autoRotate, patternMode }: { autoRotate: boolean; patternMode: PatternMode }) {
  const groupRef = useRef<THREE.Group>(null)

  const radius = 8

  const spherePositions = images.map((_, index) => {
    const goldenRatio = (1 + Math.sqrt(5)) / 2
    const theta = (2 * Math.PI * index) / goldenRatio
    const phi = Math.acos(1 - (2 * (index + 0.5)) / images.length)

    const x = radius * Math.cos(theta) * Math.sin(phi)
    const y = radius * Math.sin(theta) * Math.sin(phi)
    const z = radius * Math.cos(phi)

    const position = new THREE.Vector3(x, y, z)
    const euler = new THREE.Euler()
    const quaternion = new THREE.Quaternion()

    const up = new THREE.Vector3(0, 1, 0)
    const lookAtMatrix = new THREE.Matrix4()
    lookAtMatrix.lookAt(position, new THREE.Vector3(0, 0, 0), up)
    quaternion.setFromRotationMatrix(lookAtMatrix)
    euler.setFromQuaternion(quaternion)

    return {
      position: [x, y, z] as [number, number, number],
      rotation: [euler.x, euler.y, euler.z] as [number, number, number],
      scale: 1,
    }
  })

  const galleryPositions = images.map((_, index) => {
    const cols = 8
    const row = Math.floor(index / cols)
    const col = index % cols

    const x = (col - cols / 2 + 0.5) * 2.5
    const y = -(row - 3.5) * 2.8
    const z = 0

    return {
      position: [x, y, z] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: 1,
    }
  })

  const helixPositions = images.map((_, index) => {
    const heightSpacing = 0.8
    const spiralRadius = 6
    const rotations = 3

    const progress = index / images.length
    const angle = progress * Math.PI * 2 * rotations
    const y = (progress - 0.5) * images.length * heightSpacing - 8

    const x = Math.cos(angle) * spiralRadius
    const z = Math.sin(angle) * spiralRadius

    return {
      position: [x, y, z] as [number, number, number],
      rotation: [0, -angle, 0] as [number, number, number],
      scale: 1,
    }
  })

  const wavePositions = images.map((_, index) => {
    const cols = 10
    const row = Math.floor(index / cols)
    const col = index % cols

    const x = (col - cols / 2 + 0.5) * 2.5
    const z = (row - 2.5) * 2.5
    const y = Math.sin(col * 0.5) * 2 + Math.cos(row * 0.5) * 2

    return {
      position: [x, y, z] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: 1,
    }
  })

  const cylinderPositions = images.map((_, index) => {
    const itemsPerRing = 10
    const rings = Math.ceil(images.length / itemsPerRing)
    const ring = Math.floor(index / itemsPerRing)
    const angleIndex = index % itemsPerRing

    const angle = (angleIndex / itemsPerRing) * Math.PI * 2
    const cylinderRadius = 8
    const y = (ring - rings / 2 + 0.5) * 3

    const x = Math.cos(angle) * cylinderRadius
    const z = Math.sin(angle) * cylinderRadius

    return {
      position: [x, y, z] as [number, number, number],
      rotation: [0, -angle + Math.PI / 2, 0] as [number, number, number],
      scale: 1,
    }
  })

  const getPatternPositions = () => {
    switch (patternMode) {
      case "gallery":
        return galleryPositions
      case "helix":
        return helixPositions
      case "wave":
        return wavePositions
      case "cylinder":
        return cylinderPositions
      default:
        return spherePositions
    }
  }

  useFrame((state, delta) => {
    if (groupRef.current) {
      if (patternMode === "gallery") {
        groupRef.current.rotation.x += (0 - groupRef.current.rotation.x) * 0.1
        groupRef.current.rotation.y += (0 - groupRef.current.rotation.y) * 0.1
        groupRef.current.rotation.z += (0 - groupRef.current.rotation.z) * 0.1
      } else if (autoRotate) {
        groupRef.current.rotation.y += delta * 0.2
      }
    }
  })

  const currentPositions = getPatternPositions()

  return (
    <group ref={groupRef}>
      {images.map((image, index) => (
        <ImageCard
          key={index}
          image={image}
          position={spherePositions[index].position}
          rotation={spherePositions[index].rotation}
          scale={1}
          targetPosition={currentPositions[index].position}
          targetRotation={currentPositions[index].rotation}
        />
      ))}
    </group>
  )
}

export default function PhotoSphere() {
  const [autoRotate, setAutoRotate] = useState(true)
  const [patternMode, setPatternMode] = useState<PatternMode>("sphere")
  const [clickedButton, setClickedButton] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleButtonClick = (buttonName: string, action: () => void) => {
    setClickedButton(buttonName)
    setTimeout(() => setClickedButton(null), 150)
    action()
  }

  return (
    <div 
      className="relative h-[100dvh] w-full bg-black overflow-hidden select-none touch-none"
      onPointerDown={() => setHasInteracted(true)}
      onWheel={() => setHasInteracted(true)}
      onContextMenu={(e) => e.preventDefault()}
      style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
    >
      <Canvas camera={{ position: [0, 0, 25], fov: 60 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <Suspense fallback={null}>
          <Scene autoRotate={autoRotate} patternMode={patternMode} />
        </Suspense>
        <OrbitControls enableZoom={true} enablePan={true} autoRotate={false} minDistance={10} maxDistance={30} />
      </Canvas>

      <div 
        className={`absolute z-10 pointer-events-none transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          hasInteracted 
            ? "top-6 left-6 md:top-8 md:left-8 translate-x-0 translate-y-0" 
            : `top-1/2 left-1/2 -translate-x-1/2 ${mounted ? "-translate-y-1/2" : "-translate-y-[40%]"}`
        }`}
        style={{
          opacity: hasInteracted ? 0.6 : (mounted ? 1 : 0)
        }}
      >
        <img 
          src="/materials/apex_logo.png" 
          alt="Apex Logo" 
          className={`h-auto object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.05)] transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
            hasInteracted ? "w-20 md:w-32" : "w-[80vw] max-w-[800px] max-h-[80vh]"
          }`} 
          style={{
             animation: hasInteracted ? "none" : "pulseLogo 4s ease-in-out infinite alternate 1.2s"
          }}
        />
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:bottom-10 md:right-12 md:left-auto md:translate-x-0 flex gap-0 border border-white/20 bg-black/50 backdrop-blur-md rounded-lg overflow-hidden shadow-[0_0_20px_rgba(0,255,115,0.15)] z-20">
        <button
          onClick={() => handleButtonClick("sphere", () => setPatternMode("sphere"))}
          className={`p-2 sm:p-3 border-r border-white/20 transition-all duration-150 ${
            patternMode === "sphere" ? "bg-white text-black" : "bg-transparent hover:bg-white/10 text-white"
          } ${clickedButton === "sphere" ? "scale-90" : "scale-100"}`}
          title="Sphere view"
        >
          <Orbit className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          onClick={() => handleButtonClick("gallery", () => setPatternMode("gallery"))}
          className={`p-2 sm:p-3 border-r border-white/20 transition-all duration-150 ${
            patternMode === "gallery" ? "bg-white text-black" : "bg-transparent hover:bg-white/10 text-white"
          } ${clickedButton === "gallery" ? "scale-90" : "scale-100"}`}
          title="Gallery view"
        >
          <Grid3x3 className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          onClick={() => handleButtonClick("helix", () => setPatternMode("helix"))}
          className={`p-2 sm:p-3 border-r border-white/20 transition-all duration-150 ${
            patternMode === "helix" ? "bg-white text-black" : "bg-transparent hover:bg-white/10 text-white"
          } ${clickedButton === "helix" ? "scale-90" : "scale-100"}`}
          title="Helix view"
        >
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 12c0 4.418 3.582 8 8 8s8-3.582 8-8-3.582-8-8-8M4 12l8-8m8 8l-8 8"
            />
          </svg>
        </button>
        <button
          onClick={() => handleButtonClick("wave", () => setPatternMode("wave"))}
          className={`p-2 sm:p-3 border-r border-white/20 transition-all duration-150 ${
            patternMode === "wave" ? "bg-white text-black" : "bg-transparent hover:bg-white/10 text-white"
          } ${clickedButton === "wave" ? "scale-90" : "scale-100"}`}
          title="Wave view"
        >
          <Waves className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          onClick={() => handleButtonClick("cylinder", () => setPatternMode("cylinder"))}
          className={`p-2 sm:p-3 border-r border-white/20 transition-all duration-150 ${
            patternMode === "cylinder" ? "bg-white text-black" : "bg-transparent hover:bg-white/10 text-white"
          } ${clickedButton === "cylinder" ? "scale-90" : "scale-100"}`}
          title="Cylinder view"
        >
          <Cylinder className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          onClick={() => handleButtonClick("rotate", () => setAutoRotate(!autoRotate))}
          disabled={patternMode === "gallery"}
          className={`p-2 sm:p-3 transition-all duration-150 ${
            patternMode === "gallery"
              ? "bg-white/5 text-white/30 cursor-not-allowed"
              : autoRotate
                ? "bg-white text-black"
                : "bg-transparent hover:bg-white/10 text-white"
          } ${clickedButton === "rotate" ? "scale-90" : "scale-100"}`}
          title={patternMode === "gallery" ? "Auto-rotation disabled in gallery view" : "Toggle auto-rotation"}
        >
          <RotateCw className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </div>
  )
}
