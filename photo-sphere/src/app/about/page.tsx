'use client'

export default function AboutPage() {
  return (
    <main className="h-screen overflow-y-auto bg-black text-white pt-24 pb-16">
      {/* Hero */}
      <section className="px-8 md:px-16 max-w-5xl mx-auto mb-20" style={{ animation: 'fadeIn 0.6s ease both' }}>
        <h1 
          className="text-5xl md:text-7xl tracking-tighter mb-4"
          style={{ fontFamily: 'ArrowFont, serif' }}
        >
          about apex
        </h1>
        <div className="w-12 h-[1px] bg-white/20 my-6" />
        <p className="font-mono text-xs opacity-40 uppercase tracking-widest">
          APEX Zine ~ 2026 · Editorial Exploration
        </p>
      </section>

      {/* Content Cards */}
      <section className="px-8 md:px-16 max-w-5xl mx-auto space-y-8">
        <div 
          className="glass-strong p-8 md:p-12"
          style={{ animation: 'fadeIn 0.6s ease both 0.1s' }}
        >
          <h2 className="font-mono text-xs uppercase tracking-widest opacity-50 mb-6">What is APEX</h2>
          <p className="text-lg md:text-xl leading-relaxed font-light opacity-80">
            APEX is about You. It&apos;s an exploration of what is going on with and around You. 
            It explores the intersection of digital culture, consumer behaviour, and societal trends, 
            challenging the traditional narratives and creating a space for new perspectives and understandings.
          </p>
        </div>

        <div 
          className="glass-strong p-8 md:p-12"
          style={{ animation: 'fadeIn 0.6s ease both 0.2s' }}
        >
          <h2 className="font-mono text-xs uppercase tracking-widest opacity-50 mb-6">The Vision</h2>
          <p className="text-lg md:text-xl leading-relaxed font-light opacity-80">
            APEX is a pinnacle, a climax point that we as a society are reaching together. 
            We&apos;re on the verge of a new form of life, and whether it&apos;s positive or negative 
            right now is looking really 50/50. In APEX, we&apos;ve chosen to majorly look at it 
            through a positive lens. We love being sunny nihilists.
          </p>
        </div>

        <div 
          className="glass-strong p-8 md:p-12"
          style={{ animation: 'fadeIn 0.6s ease both 0.3s' }}
        >
          <h2 className="font-mono text-xs uppercase tracking-widest opacity-50 mb-6">The Lab</h2>
          <p className="text-lg md:text-xl leading-relaxed font-light opacity-80 mb-6">
            APEX Lab is a London-based experimental media and culture platform. We curate a zine and events 
            exploring future identity, emerging technologies, and mystical/cultural aesthetics. 
            Our work sits at the intersection of academia, creative practice, and digital culture.
          </p>
          <div className="flex flex-wrap gap-3">
            {['Digital Identity', 'Consumer Culture', 'Nihilism & Meaning', 'Nature & Technology', 'Cultural Paradigms'].map(tag => (
              <span key={tag} className="glass-pill px-4 py-2 text-xs font-mono uppercase tracking-wider opacity-60">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-24 px-8 md:px-16 max-w-5xl mx-auto flex justify-between items-center opacity-30">
        <p className="font-mono text-xs">© 2026 APEX LAB</p>
        <p className="font-mono text-xs">ALL RIGHTS RESERVED</p>
      </footer>
    </main>
  )
}
