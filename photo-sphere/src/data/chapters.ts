export interface Chapter {
  id: string;
  title: string;
  titleFlat: string;
  subtitle: string;
  info: string;
  summary: string;
  author: string;
  readTime: string;
  themeColor: string;
}

export const CHAPTERS: Chapter[] = [
  {
    id: '01',
    title: "Intro to APEX:\nAuthor's Note",
    titleFlat: "Intro to APEX: Author's Note",
    subtitle: "editorial exploration",
    info: "A.E.",
    summary: `APEX is born from a simple question — what is actually going on with us? Not the curated versions of ourselves we post online, not the personas we perform at work, but the raw, messy, beautiful reality of being alive right now.\n\nThis zine is an attempt to map the unmappable. To trace the invisible threads that connect our digital lives to our physical ones, our consumer choices to our existential anxieties, our nihilism to our hope.\n\nWe're not journalists. We're not academics. We're explorers — standing at the edge of something new and trying to describe what we see. Every piece in this collection is a fragment of a larger picture, one that's still forming, still shifting, still refusing to be pinned down.\n\nWelcome to the APEX. The view from up here is extraordinary.`,
    author: "Editorial Team",
    readTime: "3 min read",
    themeColor: "#00ffff",
  },
  {
    id: '02',
    title: "Gen Z Users Adopt\nNihilistic Beliefs",
    titleFlat: "Gen Z Users Adopt Nihilistic Beliefs",
    subtitle: "cultural shift",
    info: "coping mechanism",
    summary: `There's a peculiar comfort in believing nothing matters. Across TikTok, Twitter, and the quieter corners of Discord, a generation is embracing nihilism — not as despair, but as liberation.\n\nThe data tells a story: Gen Z is simultaneously the most anxious and the most philosophically adventurous generation in recorded history. They're reading Camus on their phones between Instagram stories. They're finding Nietzsche through memes. And they're building entire identities around the radical acceptance that meaning isn't given — it's made.\n\nBut this isn't the cold, academic nihilism of philosophy departments. This is sunny nihilism. Warm nihilism. The kind that says: if nothing matters cosmically, then everything matters personally. If the universe is indifferent, then your choices are truly your own.`,
    author: "Research Division",
    readTime: "8 min read",
    themeColor: "#ff0022",
  },
  {
    id: '03',
    title: "Accelerationism\nin Modern Society",
    titleFlat: "Accelerationism in Modern Society",
    subtitle: "fluidity of self",
    info: "metafantasy",
    summary: `The world is speeding up, and some people think we should let it. Accelerationism — the idea that the best way through is faster — has leaked from obscure philosophy forums into mainstream discourse.\n\nBut the version that's taken hold isn't political. It's personal. Young people are accelerating through identities, aesthetics, careers, and belief systems at a pace that would have been incomprehensible twenty years ago. The "fluidity of self" isn't just a queer theory concept anymore — it's a lifestyle.\n\nYou can be cottagecore in January and cyberpunk by March. You can pivot from finance to art to tech to permaculture in the span of a single year. The old frameworks of identity — stable, coherent, building toward something — have been replaced by something more like jazz: improvisational, responsive, alive.`,
    author: "Cultural Analysis",
    readTime: "7 min read",
    themeColor: "#b222ff",
  },
  {
    id: '04',
    title: "Cybernatural\nSynergy",
    titleFlat: "Cybernatural Synergy",
    subtitle: "symbiosis",
    info: "nature & tech",
    summary: `The oldest dichotomy in the modern world — nature versus technology — is dissolving. And it's dissolving from both sides simultaneously.\n\nIn Hackney, mushroom networks are being monitored by IoT sensors. In Shoreditch, biophilic design studios are using AI to generate architectural forms inspired by coral reefs. In Brixton, community gardens are managed through Discord servers.\n\nThe cybernatural isn't a trend. It's an inevitability. As our tools become more organic and our understanding of nature becomes more computational, the boundary between the two becomes not just blurred but meaningless.`,
    author: "Field Research",
    readTime: "6 min read",
    themeColor: "#00ff73",
  },
  {
    id: '05',
    title: "The Temporal\nComponents",
    titleFlat: "The Temporal Components",
    subtitle: "past, present, future",
    info: "exploration",
    summary: `Time moves differently now. Not metaphorically — literally. Our relationship with past, present, and future has been fundamentally altered by technology, and we're only beginning to understand the implications.\n\nThe past is no longer fixed. It's a database, searchable and remixable. Every photo, every post, every message is a temporal artifact that can be surfaced, recontextualised, and weaponised at any moment.\n\nThe present has collapsed. In a world of infinite feeds and real-time updates, the "now" has stretched to encompass everything from three seconds ago to three hours from now.\n\nThe future has been cancelled and rebooted. Climate anxiety has made long-term planning feel absurd. AI has made career planning feel impossible. And yet, a strange optimism persists.`,
    author: "Temporal Studies",
    readTime: "9 min read",
    themeColor: "#ffa900",
  },
]
