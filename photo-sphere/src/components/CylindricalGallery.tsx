"use client"

import { useRef, useMemo, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Image } from "@react-three/drei"
import * as THREE from "three"

export default function CylindricalGallery({ 
  images 
}: { 
  images: string[]
}) {
  const groupRef = useRef<THREE.Group>(null)

  const items = useMemo(() => {
    const columns = 16
    const rows = 12 // enough rows to fill vertical space
    const cellSize = 2.5
    // Compute radius so columns exactly form a circle
    const computedRadius = (columns * cellSize) / (2 * Math.PI)
    
    // Seed for deterministic random to avoid layout shift on hydration
    let seed = 999;
    const rand = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    }

    const gridItems = []
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        // 60% chance to have an image, creating clean "holes"
        if (rand() > 0.4) {
          const url = images[Math.floor(rand() * images.length)]
          const theta = (c / columns) * Math.PI * 2
          const y = (r - rows / 2 + 0.5) * cellSize
          
          const x = Math.sin(theta) * computedRadius
          const z = Math.cos(theta) * computedRadius
          
          gridItems.push({
            url,
            position: new THREE.Vector3(x, y, z),
            rotation: new THREE.Euler(0, theta + Math.PI, 0), // face inward
            scale: [cellSize * 0.95, cellSize * 0.95] as [number, number]
          })
        }
      }
    }
    return gridItems
  }, [images])

  useFrame((state, delta) => {
    if (groupRef.current) {
       groupRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {items.map((item, i) => (
        <GalleryItem key={i} item={item} />
      ))}
    </group>
  )
}

function GalleryItem({ item }: { item: any }) {
  const ref = useRef<any>(null)
  const [hovered, setHovered] = useState(false)
  const targetScale = hovered ? 1.05 : 1.0

  useFrame(() => {
    if (ref.current) {
      ref.current.scale.x = THREE.MathUtils.lerp(ref.current.scale.x, item.scale[0] * targetScale, 0.1)
      ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, item.scale[1] * targetScale, 0.1)
    }
  })

  return (
    <Image 
      ref={ref}
      url={item.url} 
      position={item.position} 
      rotation={item.rotation} 
      scale={item.scale} 
      transparent
      opacity={1}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
    />
  )
}
