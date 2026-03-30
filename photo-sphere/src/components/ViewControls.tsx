"use client"

export type ViewMode = "constellation" | "timeline" | "cluster"

const VIEW_LABELS: { id: ViewMode; label: string }[] = [
  { id: "constellation", label: "Constellation" },
  { id: "timeline",      label: "Timeline" },
  { id: "cluster",       label: "Cluster" },
]

interface ViewControlsProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  visible: boolean
}

export default function ViewControls({ 
  viewMode, onViewModeChange, 
  visible 
}: ViewControlsProps) {
  return (
    <div 
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 pointer-events-none transition-all duration-700"
      style={{ 
        opacity: visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${visible ? '0' : '20px'})`,
      }}
    >
      {/* View Mode Toggle */}
      <div 
        className="flex gap-0 rounded-full border border-white/10 overflow-hidden pointer-events-auto"
        style={{ 
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {VIEW_LABELS.map(view => (
          <button
            key={view.id}
            onClick={() => onViewModeChange(view.id)}
            className="px-4 py-2 text-[10px] md:text-xs uppercase tracking-[0.15em] transition-all duration-300 relative"
            style={{
              fontFamily: 'Geist, sans-serif',
              color: viewMode === view.id ? '#ffffff' : 'rgba(255,255,255,0.3)',
              background: viewMode === view.id ? 'rgba(194,56,77,0.25)' : 'transparent',
            }}
          >
            {viewMode === view.id && (
              <span 
                className="absolute inset-x-0 bottom-0 h-[2px]"
                style={{ background: 'linear-gradient(90deg, transparent, #C2384D, transparent)' }}
              />
            )}
            {view.label}
          </button>
        ))}
      </div>
    </div>
  )
}
