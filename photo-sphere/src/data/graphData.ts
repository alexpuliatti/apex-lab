export type NodeType = "image" | "concept" | "chapter" | "person" | "quote" | "era"

export type MacroTopic = 
  | "Digital Identity"
  | "Nihilism & Meaning"
  | "Nature & Technology"
  | "Cultural Paradigms"
  | "Consumer Culture"

export const MACRO_TOPICS: { id: MacroTopic; color: string; glow: string }[] = [
  { id: "Digital Identity",     color: "#a78bfa", glow: "rgba(167,139,250,0.3)" },
  { id: "Nihilism & Meaning",   color: "#f472b6", glow: "rgba(244,114,182,0.3)" },
  { id: "Nature & Technology",  color: "#34d399", glow: "rgba(52,211,153,0.3)" },
  { id: "Cultural Paradigms",   color: "#fbbf24", glow: "rgba(251,191,36,0.3)" },
  { id: "Consumer Culture",     color: "#60a5fa", glow: "rgba(96,165,250,0.3)" },
]

export interface GraphNode {
  id: string;
  type: NodeType;
  label?: string;
  description?: string;
  imagePath?: string;
  role?: string;        // For person nodes
  source?: string;      // For quote nodes — attribution
  chapter?: string;     // Which chapter this belongs to
  size?: number;        // Visual weight hint (1 = small, 3 = large)
  macroTopic?: MacroTopic;
  temporalOrder?: number; // 0-100 for timeline positioning
}

export interface GraphLink {
  source: string;
  target: string;
  type?: "semantic" | "timeline" | "interview" | "attribution" | "visual";
}

// ─── ERAS (paradigm timeline backbone) ──────────────────────────────
const eraNodes: GraphNode[] = [
  { id: "era_tradition",   type: "era", label: "Tradition",       description: "A culture devoted to preserving the knowledge of the past, emphasizing continuity, heritage, and resistance to change.", size: 2, macroTopic: "Cultural Paradigms", temporalOrder: 0 },
  { id: "era_modernism",   type: "era", label: "Modernism",       description: "18/19th century enthusiasm for invention, liberation from outdated norms, individualism, experimentation, and the pursuit of universal truths.", size: 2, macroTopic: "Cultural Paradigms", temporalOrder: 25 },
  { id: "era_postmodern",  type: "era", label: "Post-Modernism",  description: "1960–2000s. Driven by suspicion and cynicism, deconstructing norms in celebration of diversity, irony, and parody. The era where nihilism first emerges.", size: 2, macroTopic: "Cultural Paradigms", temporalOrder: 60 },
  { id: "era_metamodern",  type: "era", label: "Meta-Modernism",  description: "2000s–present. Oscillating between modern enthusiasm and postmodern irony. Depth applied onto the surface. The current cultural paradigm.", size: 3, macroTopic: "Cultural Paradigms", temporalOrder: 85 },
]

// ─── CHAPTERS ───────────────────────────────────────────────────────
const chapterNodes: GraphNode[] = [
  { id: "ch_intro",          type: "chapter", label: "Intro to APEX",                    description: "Author's note exploring the intersection of digital culture, consumer behaviour, and societal trends. APEX is about You.", size: 2, macroTopic: "Cultural Paradigms", temporalOrder: 90 },
  { id: "ch_cybernatural",   type: "chapter", label: "Cybernatural Synergy",             description: "An editorial personifying the battle between nature and AI/emerging tech, and their eventual blend into a symbiotic relationship.", size: 2, macroTopic: "Nature & Technology", temporalOrder: 88 },
  { id: "ch_nihilism",       type: "chapter", label: "Gen Z Nihilistic Beliefs",         description: "Exploring why Gen Z adopts existential nihilistic beliefs as a coping mechanism and how it powers the MetaFantasy.", size: 2, macroTopic: "Nihilism & Meaning", temporalOrder: 80 },
  { id: "ch_accelerationism",type: "chapter", label: "Accelerationism & Fluidity of Self",description: "How the acceleration of online culture influences self-exploration through fluid digital identities, spanning Anterior, Coeval, and Tomorrow.", size: 2, macroTopic: "Digital Identity", temporalOrder: 85 },
]

// ─── CONCEPTS ───────────────────────────────────────────────────────
const conceptNodes: GraphNode[] = [
  { id: "c_cybernatural",     type: "concept", label: "Nature × Technology",    description: "The harmonious merging of organic reality with digital augmentation, creating a unified existence rather than a divided one.", chapter: "ch_cybernatural", size: 2, macroTopic: "Nature & Technology", temporalOrder: 90 },
  { id: "c_metafantasy",      type: "concept", label: "MetaFantasy",            description: "A self-aware creation of fantastical hyper-realistic elements in the digital sphere, blurring reality and fantasy. The ultimate rebirth tool.", chapter: "ch_nihilism", size: 3, macroTopic: "Nihilism & Meaning", temporalOrder: 88 },
  { id: "c_accelerationism",  type: "concept", label: "Accelerationist Drive",  description: "Pushing technological and social processes to their limits to bring about radical change. The urgency of modern culture's pace.", chapter: "ch_accelerationism", size: 2, macroTopic: "Cultural Paradigms", temporalOrder: 82 },
  { id: "c_digital_escapism", type: "concept", label: "Digital Escapism",       description: "Retreating into virtual spaces not out of fear, but to construct utopias that defy physical constraints.", chapter: "ch_nihilism", size: 2, macroTopic: "Digital Identity", temporalOrder: 78 },
  { id: "c_existential_nih",  type: "concept", label: "Existential Nihilism",   description: "The belief that life lacks intrinsic meaning — empowering Gen Z to assign their own purpose to the digital void.", chapter: "ch_nihilism", size: 2, macroTopic: "Nihilism & Meaning", temporalOrder: 62 },
  { id: "c_hyperreality",     type: "concept", label: "Hyperreality",           description: "Baudrillard's concept: the generation by models of a real without origin or reality. The simulation is indistinguishable from what it simulates.", chapter: "ch_nihilism", size: 2, macroTopic: "Cultural Paradigms", temporalOrder: 65 },
  { id: "c_identity_frag",    type: "concept", label: "Identity Fragmentation", description: "The deliberate splitting of the self across multiple digital avatars and personas. Multiple personality as a feature, not a bug.", chapter: "ch_accelerationism", size: 2, macroTopic: "Digital Identity", temporalOrder: 80 },
  { id: "c_reenchantment",    type: "concept", label: "Modern Re-enchantment",  description: "Deliberately seeking magical, joyful experiences in a hyper-rational world. Finding awe in algorithms and technological artifacts.", chapter: "ch_cybernatural", size: 2, macroTopic: "Nature & Technology", temporalOrder: 85 },
  { id: "c_escapist_nostalgia",type: "concept",label: "Escapist Nostalgia",     description: "A longing for a stylized past that never truly existed, often reconstructed through digital aesthetics. Fisher's critique of primitivist yearnings.", chapter: "ch_cybernatural", size: 2, macroTopic: "Nature & Technology", temporalOrder: 55 },
  { id: "c_sunny_nihilism",   type: "concept", label: "Sunny Nihilism",         description: "Embracing meaninglessness with radical joy. When your existence is pointless, you shift focus to things with more longevity than your own ego.", chapter: "ch_nihilism", size: 2, macroTopic: "Nihilism & Meaning", temporalOrder: 85 },
  { id: "c_meta_irony",       type: "concept", label: "Meta-Irony",             description: "Irony so deep it loops back to sincerity. Blurring the line between joke and menace, between playing and meaning it.", chapter: "ch_nihilism", size: 2, macroTopic: "Nihilism & Meaning", temporalOrder: 75 },
  { id: "c_anthropotechnics",  type: "concept", label: "Anthropotechnics",      description: "Methods and procedures that develop our abilities, make us perceive things, and help us initiate our own developments. Sloterdijk's concept.", chapter: "ch_accelerationism", size: 2, macroTopic: "Digital Identity", temporalOrder: 70 },
  { id: "c_fluidity_self",    type: "concept", label: "Fluidity of Self",       description: "Rejection of fixed identity in favour of continuous, fluid self-recreation facilitated by digital platforms.", chapter: "ch_accelerationism", size: 2, macroTopic: "Digital Identity", temporalOrder: 82 },
  { id: "c_sincerity_irony",  type: "concept", label: "Sincerity & Irony",      description: "The tightrope walk of metamodern communication, oscillating between genuine emotion and defensive detachment.", chapter: "ch_nihilism", size: 2, macroTopic: "Cultural Paradigms", temporalOrder: 78 },
  { id: "c_postmodern_abs",   type: "concept", label: "Postmodern Absurdity",   description: "Reveling in the chaotic, nonsensical clash of fragmented cultures, memes, and hyper-accelerated trends.", chapter: "ch_nihilism", size: 1, macroTopic: "Cultural Paradigms", temporalOrder: 60 },
  { id: "c_self_core",        type: "concept", label: "Self-Core",              description: "An amalgamation of hyper-personalised niches curated into a new identity. The ultimate output of identity fragmentation.", chapter: "ch_accelerationism", size: 1, macroTopic: "Digital Identity", temporalOrder: 90 },
  { id: "c_disorientation",   type: "concept", label: "Disorientation",         description: "The modern Western mind without orientation — the grey consequence of nihilism when consciousness remains passive.", chapter: "ch_nihilism", size: 1, macroTopic: "Nihilism & Meaning", temporalOrder: 72 },
  { id: "c_lorecore",         type: "concept", label: "Lorecore",               description: "Main Character Syndrome as antidote to grand narrative collapse. Users storify themselves as the star of their own production.", chapter: "ch_nihilism", size: 1, macroTopic: "Consumer Culture", temporalOrder: 88 },
  { id: "c_mythical_rebellion",type: "concept", label: "Mythical Rebellion",    description: "Creating one's own myths in online subcultures as a way to explain the confusion away from everyday life, often drawing from religious/spiritual imagery.", chapter: "ch_accelerationism", size: 1, macroTopic: "Digital Identity", temporalOrder: 85 },
  { id: "c_mid_economy",      type: "concept", label: "MID Economy",            description: "Meta-Ironic Desensitised economy — where fear economy mutates into collective coping through meta-ironic quips and shared pain online.", chapter: "ch_accelerationism", size: 1, macroTopic: "Consumer Culture", temporalOrder: 92 },
  { id: "c_cyberwitch",       type: "concept", label: "Cyberwitches & Nymphs",  description: "Users embodying ethereal digital personas — cyberwitches, nymphs, angels — as acts of resistance, empowerment, and play in online spaces.", chapter: "ch_accelerationism", size: 1, macroTopic: "Digital Identity", temporalOrder: 86 },
  { id: "c_wetness",          type: "concept", label: "Wetness & Fluidity",     description: "Ester Freider's concept: finding home in a lack of home, in the non-space and non-identity. Applying lessons of fluidity from Tumblr to rigid systems.", chapter: "ch_accelerationism", size: 1, macroTopic: "Digital Identity", temporalOrder: 87 },
  { id: "c_psia",             type: "concept", label: "PSiA",                   description: "Personalised Self-imposed Alienation — the hyper-individualistic mode of self-perception tied to curated algorithms, targeted ads, and self-core categorisation.", chapter: "ch_accelerationism", size: 1, macroTopic: "Consumer Culture", temporalOrder: 89 },
  { id: "c_future_ecology",   type: "concept", label: "Future Ecology",         description: "Timothy Morton-inspired vision: embracing interconnectedness of all life forms, using technology to foster harmonious coexistence rather than exploitation.", chapter: "ch_accelerationism", size: 1, macroTopic: "Nature & Technology", temporalOrder: 93 },
]

// ─── PEOPLE (thinkers, interviewees, authors) ───────────────────────
const personNodes: GraphNode[] = [
  { id: "p_baudrillard",  type: "person", label: "Jean Baudrillard",   role: "Sociologist",  description: "French sociologist who defined 'hyperreality' — the generation by models of a real without origin or reality.", size: 1, macroTopic: "Cultural Paradigms", temporalOrder: 55 },
  { id: "p_fisher",       type: "person", label: "Mark Fisher",        role: "Philosopher",  description: "Cultural theorist who coined 'escapist nostalgia' and critiqued capitalist realism's colonization of imagination.", size: 1, macroTopic: "Nature & Technology", temporalOrder: 50 },
  { id: "p_syfret",       type: "person", label: "Wendy Syfret",       role: "Author",       description: "Author of 'The Sunny Nihilist' who reframes existential dread as the liberating 'pleasure of pointlessness'.", size: 1, macroTopic: "Nihilism & Meaning", temporalOrder: 80 },
  { id: "p_sloterdijk",   type: "person", label: "Peter Sloterdijk",   role: "Philosopher",  description: "German philosopher who coined 'anthropotechnics' — methods humans use to intentionally redesign their own nature.", size: 1, macroTopic: "Digital Identity", temporalOrder: 45 },
  { id: "p_davis",        type: "person", label: "Erik Davis",          role: "Writer",       description: "Author of 'Techgnosis' exploring how the quest for meaning leads communities to construct meaningful frameworks.", size: 1, macroTopic: "Nature & Technology", temporalOrder: 60 },
  { id: "p_alma",         type: "person", label: "Alma Dowdall",        role: "Music Artist", description: "Gen Z music artist exploring existentialism through alternative pop/electronic music. Interviewed for the Zine.", size: 1, macroTopic: "Nihilism & Meaning", temporalOrder: 85 },
  { id: "p_alex",         type: "person", label: "Alex Puliatti",       role: "Designer",     description: "Gen Z digital designer giving Gen Z perspective to luxury fashion conglomerates. Interviewed for the Zine.", size: 1, macroTopic: "Consumer Culture", temporalOrder: 85 },
  { id: "p_dowdall",      type: "person", label: "Tim Dowdall PhD",     role: "Philosopher",  description: "Philosopher and self-proclaimed 'demythologizer' who paints nihilism's effect on the modern mind as disorientation.", size: 1, macroTopic: "Nihilism & Meaning", temporalOrder: 75 },
  { id: "p_basar",        type: "person", label: "Shumon Basar",        role: "Writer/Curator",description: "Writer, editor, and curator specializing in analysis of the digital sphere. Co-author of 'The Extreme Self'.", size: 1, macroTopic: "Consumer Culture", temporalOrder: 80 },
  { id: "p_vermeulen",    type: "person", label: "Vermeulen & van den Akker", role: "Researchers", description: "Researchers who situated metamodernism in the 2000s, characterized by oscillating between modern enthusiasm and postmodern irony.", size: 1, macroTopic: "Cultural Paradigms", temporalOrder: 75 },
  { id: "p_nella",        type: "person", label: "Nella Piatek",        role: "Researcher/Designer", description: "Critical future researcher, designer, and lecturer exploring how to turn human ideals into concrete experiences. Creator of cyberwitch persona XRis-00222.", size: 1, macroTopic: "Digital Identity", temporalOrder: 85 },
  { id: "p_mikyska",      type: "person", label: "Andrea Mikyska",      role: "Digital Artist", description: "Digital artist exploring future ecological infrastructure with cybernetic tendencies, giving nature tools to protect itself.", size: 1, macroTopic: "Nature & Technology", temporalOrder: 85 },
  { id: "p_eri",          type: "person", label: "Erifili Doukeli",     role: "Digital Artist", description: "Digital artist with fine arts background, conceptualizing immersive digital environments blending traditional and modern techniques.", size: 1, macroTopic: "Digital Identity", temporalOrder: 85 },
  { id: "p_eiag",         type: "person", label: "Everyone Is A Girl",  role: "Creative Collective", description: "Collective by Ester Freider, Sofya Rakitina, Julia Halasy, and Paloma Moniz focusing on femininity and internet culture.", size: 1, macroTopic: "Digital Identity", temporalOrder: 87 },
  { id: "p_morton",       type: "person", label: "Timothy Morton",      role: "Philosopher",  description: "Author of 'Dark Ecology' — an ecological critique urging humanity to embrace interconnectedness and coexistence of all life forms.", size: 1, macroTopic: "Nature & Technology", temporalOrder: 70 },
  { id: "p_deleuze",      type: "person", label: "Deleuze & Guattari",  role: "Philosophers", description: "French philosophers who theorized the rhizome — a non-hierarchical network model of identity that mirrors the nature of online identities.", size: 1, macroTopic: "Digital Identity", temporalOrder: 40 },
  { id: "p_land",         type: "person", label: "Nick Land",           role: "Philosopher",  description: "Fervent purveyor of accelerationism who believes technology will bring humans to the next stage of evolution.", size: 1, macroTopic: "Cultural Paradigms", temporalOrder: 68 },
]

// ─── QUOTES ─────────────────────────────────────────────────────────
const quoteNodes: GraphNode[] = [
  { id: "q_syfret_rock",    type: "quote", label: "\"Once you make peace with just being a lump of meat on a rock, you can stop stressing and appreciate the rock itself.\"", source: "Wendy Syfret", size: 1, macroTopic: "Nihilism & Meaning", temporalOrder: 80 },
  { id: "q_fisher_avatar",  type: "quote", label: "\"The accelerationist dystopia of Terminator has been replaced by the primitivist yearnings of Avatar.\"", source: "Mark Fisher", size: 1, macroTopic: "Nature & Technology", temporalOrder: 55 },
  { id: "q_vermeulen_depth",type: "quote", label: "\"The modernists excavated depth from the surface, the post-modernists flattened it, the meta-modernists apply depth onto the surface.\"", source: "Vermeulen", size: 1, macroTopic: "Cultural Paradigms", temporalOrder: 78 },
  { id: "q_alma_nihilism",  type: "quote", label: "\"The same way nihilism can be a coping mechanism, so is every belief system that exists in every myth.\"", source: "Alma Dowdall", size: 1, macroTopic: "Nihilism & Meaning", temporalOrder: 85 },
  { id: "q_duchamp_irony",  type: "quote", label: "\"Irony is a playful way of accepting something. Mine is an irony of indifference. It is a Meta-irony.\"", source: "Marcel Duchamp", size: 1, macroTopic: "Cultural Paradigms", temporalOrder: 38 },
  { id: "q_morning_fantasy",type: "quote", label: "\"Brands can shift from cultural reflection to cultural creation by embracing fantasy.\"", source: "MØRNING", size: 1, macroTopic: "Consumer Culture", temporalOrder: 88 },
  { id: "q_turkle_screen",  type: "quote", label: "\"When we step through the screen into virtual communities, we reconstruct our identities on the other side of the looking glass.\"", source: "Sherry Turkle", size: 1, macroTopic: "Digital Identity", temporalOrder: 70 },
  { id: "q_basar_virtue",   type: "quote", label: "\"It's not enough to have virtue anymore. You need to signal it to show you have it.\"", source: "The Extreme Self", size: 1, macroTopic: "Consumer Culture", temporalOrder: 82 },
  { id: "q_davis_crack",    type: "quote", label: "\"Technical innovations in modern communications technology open up a temporary crack in social reality.\"", source: "Erik Davis", size: 1, macroTopic: "Nature & Technology", temporalOrder: 60 },
  { id: "q_kouvasian_pixel",type: "quote", label: "\"A multiverse of existence, pixelated and undefinable, connected and disconnected, owning nothing and everything.\"", source: "Shadeh Kouvasian", size: 1, macroTopic: "Digital Identity", temporalOrder: 86 },
]

// ─── IMAGE NODES (12 unique editorial images) ───────────────────────
const imageNodes: GraphNode[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `img_${i}`,
  type: "image" as NodeType,
  imagePath: `/CS_slides/slide_${String(i + 1).padStart(2, "0")}.jpg`,
  chapter: i < 6 ? "ch_cybernatural" : (i < 9 ? "ch_nihilism" : "ch_accelerationism"),
  size: 1,
  macroTopic: (i < 6 ? "Nature & Technology" : (i < 9 ? "Nihilism & Meaning" : "Digital Identity")) as MacroTopic,
  temporalOrder: 85 + (i % 5),
}))

// ═══════════════════════════════════════════════════════════════════════
// ASSEMBLE ALL NODES
// ═══════════════════════════════════════════════════════════════════════
export const nodes: GraphNode[] = [
  ...eraNodes,
  ...chapterNodes,
  ...conceptNodes,
  ...personNodes,
  ...quoteNodes,
  ...imageNodes,
]

// ═══════════════════════════════════════════════════════════════════════
// SEMANTIC LINKS — hand-authored from Zine content
// ═══════════════════════════════════════════════════════════════════════
export const links: GraphLink[] = [

  // ─── Era timeline spine ───────────────────────────────────────────
  { source: "era_tradition",  target: "era_modernism",  type: "timeline" },
  { source: "era_modernism",  target: "era_postmodern", type: "timeline" },
  { source: "era_postmodern", target: "era_metamodern", type: "timeline" },

  // ─── Chapters ↔ Eras ─────────────────────────────────────────────
  { source: "ch_cybernatural",    target: "era_metamodern",  type: "semantic" },
  { source: "ch_nihilism",        target: "era_metamodern",  type: "semantic" },
  { source: "ch_nihilism",        target: "era_postmodern",  type: "semantic" },
  { source: "ch_accelerationism", target: "era_metamodern",  type: "semantic" },
  { source: "ch_accelerationism", target: "era_modernism",   type: "semantic" },
  { source: "ch_intro",           target: "era_metamodern",  type: "semantic" },

  // ─── Chapters ↔ Concepts ─────────────────────────────────────────
  { source: "ch_cybernatural",    target: "c_cybernatural",      type: "semantic" },
  { source: "ch_cybernatural",    target: "c_reenchantment",     type: "semantic" },
  { source: "ch_cybernatural",    target: "c_escapist_nostalgia",type: "semantic" },
  { source: "ch_cybernatural",    target: "c_future_ecology",    type: "semantic" },
  { source: "ch_nihilism",        target: "c_metafantasy",       type: "semantic" },
  { source: "ch_nihilism",        target: "c_existential_nih",   type: "semantic" },
  { source: "ch_nihilism",        target: "c_sunny_nihilism",    type: "semantic" },
  { source: "ch_nihilism",        target: "c_hyperreality",      type: "semantic" },
  { source: "ch_nihilism",        target: "c_meta_irony",        type: "semantic" },
  { source: "ch_nihilism",        target: "c_digital_escapism",  type: "semantic" },
  { source: "ch_nihilism",        target: "c_sincerity_irony",   type: "semantic" },
  { source: "ch_nihilism",        target: "c_postmodern_abs",    type: "semantic" },
  { source: "ch_nihilism",        target: "c_disorientation",    type: "semantic" },
  { source: "ch_nihilism",        target: "c_lorecore",          type: "semantic" },
  { source: "ch_accelerationism", target: "c_accelerationism",   type: "semantic" },
  { source: "ch_accelerationism", target: "c_identity_frag",     type: "semantic" },
  { source: "ch_accelerationism", target: "c_fluidity_self",     type: "semantic" },
  { source: "ch_accelerationism", target: "c_anthropotechnics",  type: "semantic" },
  { source: "ch_accelerationism", target: "c_self_core",         type: "semantic" },
  { source: "ch_accelerationism", target: "c_mythical_rebellion",type: "semantic" },
  { source: "ch_accelerationism", target: "c_mid_economy",       type: "semantic" },
  { source: "ch_accelerationism", target: "c_cyberwitch",        type: "semantic" },
  { source: "ch_accelerationism", target: "c_wetness",           type: "semantic" },
  { source: "ch_accelerationism", target: "c_psia",              type: "semantic" },

  // ─── Concepts ↔ Concepts (thematic links) ────────────────────────
  { source: "c_metafantasy",      target: "c_hyperreality",      type: "semantic" },
  { source: "c_metafantasy",      target: "c_digital_escapism",  type: "semantic" },
  { source: "c_existential_nih",  target: "c_sunny_nihilism",    type: "semantic" },
  { source: "c_existential_nih",  target: "c_disorientation",    type: "semantic" },
  { source: "c_sunny_nihilism",   target: "c_meta_irony",        type: "semantic" },
  { source: "c_meta_irony",       target: "c_sincerity_irony",   type: "semantic" },
  { source: "c_identity_frag",    target: "c_fluidity_self",     type: "semantic" },
  { source: "c_identity_frag",    target: "c_self_core",         type: "semantic" },
  { source: "c_accelerationism",  target: "c_fluidity_self",     type: "semantic" },
  { source: "c_cybernatural",     target: "c_reenchantment",     type: "semantic" },
  { source: "c_escapist_nostalgia",target:"c_reenchantment",     type: "semantic" },
  { source: "c_digital_escapism", target: "c_escapist_nostalgia",type: "semantic" },
  { source: "c_anthropotechnics", target: "c_fluidity_self",     type: "semantic" },
  { source: "c_postmodern_abs",   target: "c_meta_irony",        type: "semantic" },
  { source: "c_lorecore",         target: "c_psia",              type: "semantic" },
  { source: "c_lorecore",         target: "c_metafantasy",       type: "semantic" },
  { source: "c_mythical_rebellion",target:"c_cyberwitch",        type: "semantic" },
  { source: "c_mythical_rebellion",target:"c_metafantasy",       type: "semantic" },
  { source: "c_cyberwitch",       target: "c_fluidity_self",     type: "semantic" },
  { source: "c_wetness",          target: "c_fluidity_self",     type: "semantic" },
  { source: "c_wetness",          target: "c_identity_frag",     type: "semantic" },
  { source: "c_psia",             target: "c_self_core",         type: "semantic" },
  { source: "c_mid_economy",      target: "c_meta_irony",        type: "semantic" },
  { source: "c_mid_economy",      target: "c_sunny_nihilism",    type: "semantic" },
  { source: "c_future_ecology",   target: "c_cybernatural",      type: "semantic" },
  { source: "c_future_ecology",   target: "c_accelerationism",   type: "semantic" },

  // ─── People ↔ Concepts (attribution) ─────────────────────────────
  { source: "p_baudrillard", target: "c_hyperreality",       type: "attribution" },
  { source: "p_fisher",      target: "c_escapist_nostalgia", type: "attribution" },
  { source: "p_syfret",      target: "c_sunny_nihilism",     type: "attribution" },
  { source: "p_sloterdijk",  target: "c_anthropotechnics",   type: "attribution" },
  { source: "p_davis",       target: "c_reenchantment",      type: "attribution" },
  { source: "p_davis",       target: "c_digital_escapism",   type: "attribution" },
  { source: "p_vermeulen",   target: "era_metamodern",       type: "attribution" },
  { source: "p_dowdall",     target: "c_disorientation",     type: "attribution" },
  { source: "p_nella",       target: "c_cyberwitch",         type: "attribution" },
  { source: "p_mikyska",     target: "c_future_ecology",     type: "attribution" },
  { source: "p_mikyska",     target: "c_cybernatural",       type: "attribution" },
  { source: "p_eri",         target: "c_identity_frag",      type: "attribution" },
  { source: "p_eiag",        target: "c_wetness",            type: "attribution" },
  { source: "p_morton",      target: "c_future_ecology",     type: "attribution" },
  { source: "p_deleuze",     target: "c_fluidity_self",      type: "attribution" },
  { source: "p_deleuze",     target: "c_identity_frag",      type: "attribution" },
  { source: "p_land",        target: "c_accelerationism",    type: "attribution" },
  { source: "p_basar",       target: "c_lorecore",           type: "attribution" },

  // ─── People ↔ Chapters (interviews) ──────────────────────────────
  { source: "p_alma",     target: "ch_nihilism",        type: "interview" },
  { source: "p_alex",     target: "ch_nihilism",        type: "interview" },
  { source: "p_alex",     target: "ch_accelerationism", type: "interview" },
  { source: "p_dowdall",  target: "ch_nihilism",        type: "interview" },
  { source: "p_basar",    target: "ch_nihilism",        type: "interview" },
  { source: "p_nella",    target: "ch_accelerationism", type: "interview" },
  { source: "p_mikyska",  target: "ch_accelerationism", type: "interview" },
  { source: "p_eri",      target: "ch_accelerationism", type: "interview" },
  { source: "p_eiag",     target: "ch_accelerationism", type: "interview" },
  { source: "p_alma",     target: "c_metafantasy",      type: "semantic" },
  { source: "p_alex",     target: "c_fluidity_self",    type: "semantic" },

  // ─── Quotes ↔ People & Concepts ──────────────────────────────────
  { source: "q_syfret_rock",     target: "p_syfret",          type: "attribution" },
  { source: "q_syfret_rock",     target: "c_sunny_nihilism",  type: "semantic" },
  { source: "q_fisher_avatar",   target: "p_fisher",          type: "attribution" },
  { source: "q_fisher_avatar",   target: "c_escapist_nostalgia",type:"semantic" },
  { source: "q_fisher_avatar",   target: "c_accelerationism", type: "semantic" },
  { source: "q_vermeulen_depth", target: "p_vermeulen",       type: "attribution" },
  { source: "q_vermeulen_depth", target: "era_metamodern",    type: "semantic" },
  { source: "q_alma_nihilism",   target: "p_alma",            type: "attribution" },
  { source: "q_alma_nihilism",   target: "c_existential_nih", type: "semantic" },
  { source: "q_duchamp_irony",   target: "c_meta_irony",      type: "semantic" },
  { source: "q_morning_fantasy", target: "c_metafantasy",     type: "semantic" },
  { source: "q_turkle_screen",   target: "c_identity_frag",   type: "semantic" },
  { source: "q_turkle_screen",   target: "c_fluidity_self",   type: "semantic" },
  { source: "q_basar_virtue",    target: "p_basar",           type: "attribution" },
  { source: "q_basar_virtue",    target: "c_sincerity_irony", type: "semantic" },
  { source: "q_davis_crack",     target: "p_davis",           type: "attribution" },
  { source: "q_davis_crack",     target: "c_mid_economy",     type: "semantic" },
  { source: "q_kouvasian_pixel", target: "c_identity_frag",   type: "semantic" },
  { source: "q_kouvasian_pixel", target: "c_fluidity_self",   type: "semantic" },

  // ─── Images ↔ Chapters (visual) ──────────────────────────────────
  ...imageNodes.map(img => ({
    source: img.id,
    target: img.chapter!,
    type: "visual" as const,
  })),
  
  // ─── A few inter-concept image links for visual density ───────────
  { source: "img_0",  target: "c_cybernatural",      type: "visual" },
  { source: "img_1",  target: "c_reenchantment",     type: "visual" },
  { source: "img_2",  target: "c_escapist_nostalgia",type: "visual" },
  { source: "img_3",  target: "c_cybernatural",      type: "visual" },
  { source: "img_6",  target: "c_metafantasy",       type: "visual" },
  { source: "img_7",  target: "c_hyperreality",      type: "visual" },
  { source: "img_8",  target: "c_digital_escapism",  type: "visual" },
  { source: "img_9",  target: "c_identity_frag",     type: "visual" },
  { source: "img_10", target: "c_fluidity_self",     type: "visual" },
  { source: "img_11", target: "c_accelerationism",   type: "visual" },

  // ─── Image ↔ Image (editorial sequence) ───────────────────────────
  { source: "img_0", target: "img_1", type: "visual" },
  { source: "img_1", target: "img_2", type: "visual" },
  { source: "img_2", target: "img_3", type: "visual" },
  { source: "img_3", target: "img_4", type: "visual" },
  { source: "img_4", target: "img_5", type: "visual" },
  { source: "img_5", target: "img_6", type: "visual" },
  { source: "img_6", target: "img_7", type: "visual" },
  { source: "img_7", target: "img_8", type: "visual" },
  { source: "img_8", target: "img_9", type: "visual" },
  { source: "img_9", target: "img_10", type: "visual" },
  { source: "img_10", target: "img_11", type: "visual" },
  { source: "img_11", target: "img_0", type: "visual" },
  // Cross links for tighter image cluster
  { source: "img_0", target: "img_5", type: "visual" },
  { source: "img_3", target: "img_8", type: "visual" },
  { source: "img_6", target: "img_11", type: "visual" },
]
