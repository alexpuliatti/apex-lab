"use client"

import { useRef, useEffect, useCallback, useMemo } from "react"

/* ─── Tile definition ─── */
interface TileDef {
  col: number   // grid column (fractional OK)
  row: number   // grid row (fractional OK)
  w: number     // width  in grid units
  h: number     // height in grid units
  img: number   // image index
}

const CELL = 120   // base cell px
const COLS = 11    // columns per page
const ROWS = 10    // rows per page
const PAGE_W = COLS * CELL
const PAGE_H = ROWS * CELL
const GAP = 6      // px gap between tiles

/* Hand-crafted mosaic matching the reference aesthetic.
   ~35 tiles with varying sizes (1×1, 1.5×1.5, 2×2, 2.5×3)
   and ~45 % empty space. */
const LAYOUT: TileDef[] = [
  // Row 0–1
  { col: 0.3, row: 0,   w: 1,   h: 1,   img: 0 },
  { col: 2,   row: 0,   w: 1,   h: 1,   img: 1 },
  { col: 3.2, row: 0,   w: 1.4, h: 1.6, img: 2 },
  { col: 4.8, row: 0,   w: 1.2, h: 1.2, img: 3 },
  { col: 6.2, row: 0.1, w: 1,   h: 1.2, img: 4 },
  { col: 8,   row: 0,   w: 1.3, h: 1.3, img: 5 },
  { col: 9.5, row: 0,   w: 1,   h: 1,   img: 6 },

  // Row 1–2
  { col: 0,   row: 1.6, w: 1,   h: 1,   img: 7 },
  { col: 1.5, row: 1.3, w: 1,   h: 1,   img: 8 },
  { col: 3,   row: 2,   w: 1.5, h: 1.2, img: 9 },
  { col: 7.2, row: 1.5, w: 1,   h: 1,   img: 10 },
  { col: 8.5, row: 1.5, w: 1.2, h: 1.2, img: 11 },
  { col: 10,  row: 1.8, w: 1,   h: 1,   img: 0 },

  // Row 2–4  (hero zone)
  { col: 0.3, row: 2.8, w: 1,   h: 1,   img: 1 },
  { col: 1.5, row: 3.2, w: 1,   h: 1.2, img: 2 },
  { col: 2.5, row: 2.5, w: 2.5, h: 3,   img: 3 },  // HERO — large
  { col: 5.2, row: 2.8, w: 1.4, h: 1.6, img: 4 },
  { col: 6.8, row: 2.5, w: 1.6, h: 1.8, img: 5 },
  { col: 9,   row: 3,   w: 1.2, h: 1,   img: 6 },
  { col: 10.2,row: 2.8, w: 0.8, h: 1.4, img: 7 },

  // Row 4–5
  { col: 0,   row: 4.5, w: 1,   h: 1,   img: 8 },
  { col: 1.2, row: 4.2, w: 1,   h: 1.4, img: 9 },
  { col: 5,   row: 4.5, w: 1.2, h: 1,   img: 10 },
  { col: 6.2, row: 4.8, w: 1,   h: 1.2, img: 11 },
  { col: 8.5, row: 4.3, w: 1.8, h: 1.8, img: 0 },

  // Row 5–6
  { col: 0.2, row: 5.8, w: 1,   h: 1.2, img: 1 },
  { col: 1.5, row: 6,   w: 1,   h: 1,   img: 2 },
  { col: 2.8, row: 5.8, w: 1.2, h: 1,   img: 3 },
  { col: 4.5, row: 6,   w: 1,   h: 1,   img: 4 },
  { col: 7,   row: 5.8, w: 1.5, h: 1.5, img: 5 },
  { col: 9,   row: 5.5, w: 1.2, h: 1.8, img: 6 },

  // Row 7–8
  { col: 0.5, row: 7.2, w: 1,   h: 1,   img: 7 },
  { col: 2,   row: 7,   w: 1,   h: 1.2, img: 8 },
  { col: 3.5, row: 7.3, w: 1.5, h: 1.5, img: 9 },
  { col: 5.5, row: 7,   w: 1.8, h: 1.8, img: 10 },
  { col: 7.8, row: 7.2, w: 1.2, h: 1.2, img: 11 },
  { col: 9.2, row: 7.5, w: 1,   h: 1,   img: 0 },

  // Row 8–9
  { col: 1,   row: 8.5, w: 1.5, h: 1.5, img: 1 },
  { col: 3,   row: 8.8, w: 1,   h: 1,   img: 2 },
  { col: 4.8, row: 8.5, w: 2,   h: 1.5, img: 3 },
  { col: 7,   row: 8.5, w: 1.5, h: 1.5, img: 4 },
  { col: 9,   row: 9,   w: 1,   h: 1,   img: 5 },
]

/* ─── Component ─── */
export default function MosaicGallery({ images }: { images: string[] }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const gridRef     = useRef<HTMLDivElement>(null)
  const tilesRef    = useRef<(HTMLDivElement | null)[]>([])

  /* Physics state (refs for perf — no re-renders) */
  const offset   = useRef({ x: -PAGE_W, y: -PAGE_H }) // start centered in 3×3
  const velocity = useRef({ x: 0, y: 0 })
  const drag     = useRef({ active: false, startX: 0, startY: 0, lastX: 0, lastY: 0, lastT: 0 })
  const raf      = useRef(0)

  /* Build tile elements for 3×3 copies */
  const allTiles = useMemo(() => {
    const out: { x: number; y: number; w: number; h: number; img: number; key: number }[] = []
    let k = 0
    for (let py = -1; py <= 1; py++) {
      for (let px = -1; px <= 1; px++) {
        for (const t of LAYOUT) {
          out.push({
            x: t.col * CELL + px * PAGE_W,
            y: t.row * CELL + py * PAGE_H,
            w: t.w * CELL - GAP,
            h: t.h * CELL - GAP,
            img: t.img,
            key: k++,
          })
        }
      }
    }
    return out
  }, [])

  /* ─── Perspective transform per tile ─── */
  const updateTransforms = useCallback(() => {
    const vp = viewportRef.current
    if (!vp) return
    const cx = vp.clientWidth  / 2
    const cy = vp.clientHeight / 2

    for (let i = 0; i < allTiles.length; i++) {
      const el = tilesRef.current[i]
      if (!el) continue

      const t = allTiles[i]
      const screenX = t.x + offset.current.x + t.w / 2
      const screenY = t.y + offset.current.y + t.h / 2

      const dx = (screenX - cx) / cx   // –1 … 1
      const dy = (screenY - cy) / cy

      const rotY = dx * -45
      const rotX = dy * 30
      const z    = -(Math.abs(dx) * 120 + Math.abs(dy) * 80)
      const s    = 1 - Math.abs(dx) * 0.08 - Math.abs(dy) * 0.05

      el.style.transform =
        `translate3d(${t.x + offset.current.x}px, ${t.y + offset.current.y}px, 0)` +
        ` perspective(1000px) rotateY(${rotY}deg) rotateX(${rotX}deg)` +
        ` translateZ(${z}px) scale(${s})`
    }
  }, [allTiles])

  /* ─── Animation loop ─── */
  const tick = useCallback(() => {
    if (!drag.current.active) {
      offset.current.x += velocity.current.x
      offset.current.y += velocity.current.y
      velocity.current.x *= 0.94
      velocity.current.y *= 0.94

      // Auto-drift when idle
      if (Math.abs(velocity.current.x) < 0.05 && Math.abs(velocity.current.y) < 0.05) {
        velocity.current.x = 0
        velocity.current.y = 0
        offset.current.x -= 0.3   // gentle leftward drift
      }
    }

    // Wrap offset
    offset.current.x = ((offset.current.x % PAGE_W) + PAGE_W) % PAGE_W - PAGE_W
    offset.current.y = ((offset.current.y % PAGE_H) + PAGE_H) % PAGE_H - PAGE_H

    updateTransforms()
    raf.current = requestAnimationFrame(tick)
  }, [updateTransforms])

  /* ─── Pointer handlers ─── */
  const onDown = useCallback((e: PointerEvent) => {
    drag.current = { active: true, startX: e.clientX, startY: e.clientY, lastX: e.clientX, lastY: e.clientY, lastT: performance.now() }
    velocity.current = { x: 0, y: 0 }
  }, [])

  const onMove = useCallback((e: PointerEvent) => {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.lastX
    const dy = e.clientY - drag.current.lastY
    offset.current.x += dx
    offset.current.y += dy

    const now = performance.now()
    const dt = Math.max(now - drag.current.lastT, 1)
    velocity.current.x = dx / dt * 16   // normalise to ~60 fps
    velocity.current.y = dy / dt * 16

    drag.current.lastX = e.clientX
    drag.current.lastY = e.clientY
    drag.current.lastT = now
  }, [])

  const onUp = useCallback(() => {
    drag.current.active = false
  }, [])

  /* ─── Mount / unmount ─── */
  useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return

    vp.addEventListener("pointerdown", onDown)
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    raf.current = requestAnimationFrame(tick)

    return () => {
      vp.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      cancelAnimationFrame(raf.current)
    }
  }, [onDown, onMove, onUp, tick])

  return (
    <div
      ref={viewportRef}
      style={{
        position: "absolute", inset: 0, overflow: "hidden",
        cursor: drag.current.active ? "grabbing" : "grab",
        background: "#000",
      }}
    >
      <div ref={gridRef} style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0 }}>
        {allTiles.map((t, i) => (
          <div
            key={t.key}
            ref={el => { tilesRef.current[i] = el }}
            style={{
              position: "absolute",
              width: t.w,
              height: t.h,
              willChange: "transform",
              transformOrigin: "center center",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <img
              src={images[t.img % images.length]}
              alt=""
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                pointerEvents: "none",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
