export type NodeType = "image" | "keyword"

export interface GraphNode {
  id: string;
  type: NodeType;
  label?: string; // Only for keywords
  description?: string; // Meaning from the APEX Zine
  imagePath?: string; // Only for images
}

export interface GraphLink {
  source: string;
  target: string;
}

const keywordData = [
  { term: "Cybernatural Synergy", desc: "The harmonious merging of organic reality with digital augmentation, creating a unified existence rather than a divided one." },
  { term: "MetaFantasy", desc: "A self-aware exploration of dreams and imagination, where fantasy isn't an escape but a tool to reshape the real world." },
  { term: "Accelerationism", desc: "The concept of pushing technological and social processes to their absolute limits to bring about radical change." },
  { term: "Digital Escapism", desc: "Retreating into virtual spaces not out of fear, but to construct utopias that defy physical constraints." },
  { term: "Existential Nihilism", desc: "The realization that life lacks intrinsic meaning, empowering us to assign our own purpose to the digital void." },
  { term: "Hyperreality", desc: "A condition where what is real and what is fiction are seamlessly blended, making the simulation indistinguishable from reality." },
  { term: "Identity Fragmentation", desc: "The deliberate splitting of the self across multiple digital avatars and personas to explore different facets of existence." },
  { term: "Modern Re-enchantment", desc: "Finding magic, awe, and spiritual depth in the technological artifacts and algorithms of the contemporary world." },
  { term: "Escapist Nostalgia", desc: "A longing for a stylized, romanticized past that never truly existed, often reconstructed through digital aesthetics." },
  { term: "Sunny Nihilism", desc: "Embracing the inherent meaninglessness of the universe with radical joy, optimism, and unburdened creativity." },
  { term: "Meta-Irony", desc: "A layer of irony so deep that it loops back around to absolute sincerity, blurring the line between joking and meaning it." },
  { term: "Anthropotechnics", desc: "The practices and technologies humans use to intentionally redesign, improve, or alter their own nature." },
  { term: "Fluidity of Self", desc: "The rejection of fixed identity in favor of continuous, fluid self-recreation facilitated by digital platforms." },
  { term: "Sincerity and Irony", desc: "The delicate tightrope walk of modern communication, oscillating between genuine emotion and defensive detachment." },
  { term: "Postmodern Absurdity", desc: "Reveling in the chaotic, nonsensical clash of fragmented cultures, memes, and hyper-accelerated trends." }
]

// Generate Keyword Nodes
const keywordNodes: GraphNode[] = keywordData.map((kw, i) => ({
  id: `kw_${i}`,
  type: "keyword",
  label: kw.term,
  description: kw.desc
}))

// Generate Image Nodes (48 images from 12 unique slides)
const imageNodes: GraphNode[] = Array.from({ length: 48 }).map((_, i) => ({
  id: `img_${i}`,
  type: "image",
  imagePath: `/CS_slides/slide_${String((i % 12) + 1).padStart(2, "0")}.jpg`
}))

export const nodes: GraphNode[] = [...keywordNodes, ...imageNodes]

export const links: GraphLink[] = []

// Deterministic random for consistent layouts
let seed = 42;
function rand() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// 1. Connect keywords to each other to form a core skeleton network
for (let i = 0; i < keywordNodes.length; i++) {
  // Connect each keyword to 1-2 other keywords randomly
  const numLinks = Math.floor(rand() * 2) + 1;
  for (let j = 0; j < numLinks; j++) {
    const targetIdx = Math.floor(rand() * keywordNodes.length);
    if (targetIdx !== i) {
      links.push({
        source: keywordNodes[i].id,
        target: keywordNodes[targetIdx].id
      });
    }
  }
}

// 2. Connect each image to 1-3 keywords
for (let i = 0; i < imageNodes.length; i++) {
  const numLinks = Math.floor(rand() * 3) + 1;
  for (let j = 0; j < numLinks; j++) {
    const targetKwIdx = Math.floor(rand() * keywordNodes.length);
    links.push({
      source: imageNodes[i].id,
      target: keywordNodes[targetKwIdx].id
    });
  }
}

// Optional: Connect some images to other images for cluster density
for (let i = 0; i < imageNodes.length; i++) {
  if (rand() > 0.7) { // 30% chance to link to another image
    const targetImgIdx = Math.floor(rand() * imageNodes.length);
    if (targetImgIdx !== i) {
      links.push({
        source: imageNodes[i].id,
        target: imageNodes[targetImgIdx].id
      });
    }
  }
}
