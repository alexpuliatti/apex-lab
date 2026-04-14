import { CHAPTERS } from '../../../data/chapters'
import ZineChapterClient from './ZineChapterClient'

// Required for static export in Next.js when using dynamic routes
export function generateStaticParams() {
  return CHAPTERS.map((chapter) => ({
    id: chapter.id,
  }))
}

export default async function ZineChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ZineChapterClient chapterId={resolvedParams.id} />
}
