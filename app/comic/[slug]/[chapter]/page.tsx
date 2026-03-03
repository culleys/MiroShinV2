'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Comic, Chapter } from '@/lib/db';
import { ChevronLeft, ChevronRight, Home, Menu } from 'lucide-react';
import AdBanner from '@/components/AdBanner';

export default function ChapterPage({ params }: { params: Promise<{ slug: string; chapter: string }> }) {
  const resolvedParams = use(params);
  const [comic, setComic] = useState<Comic | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let fetchedComic: Comic;
    fetch(`/api/comics/${resolvedParams.slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        fetchedComic = data;
        setComic(data);
        return fetch(`/api/chapters?comicId=${data.id}`);
      })
      .then((res) => res.json())
      .then((data: Chapter[]) => {
        setAllChapters(data);
        const chapter = data.find((c) => c.slug === resolvedParams.chapter);
        setCurrentChapter(chapter || null);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [resolvedParams.slug, resolvedParams.chapter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!comic || !currentChapter) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-zinc-50 mb-4">Chapter not found</h1>
        <Link href={`/comic/${resolvedParams.slug}`} className="text-emerald-500 hover:underline">
          Return to comic
        </Link>
      </div>
    );
  }

  // Find prev and next chapters (remember chapters are sorted descending in API, so index + 1 is prev chapter, index - 1 is next chapter)
  const currentIndex = allChapters.findIndex((c) => c.id === currentChapter.id);
  const prevChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;
  const nextChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;

  return (
    <div className="bg-zinc-950 min-h-screen pb-20">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 p-4 flex items-center justify-between">
        <Link href={`/comic/${comic.slug}`} className="text-zinc-400 hover:text-zinc-50 transition-colors flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline font-medium">{comic.title}</span>
        </Link>
        
        <div className="text-center font-semibold text-zinc-200">
          {currentChapter.title || `Chapter ${currentChapter.number}`}
        </div>
        
        <Link href="/" className="text-zinc-400 hover:text-zinc-50 transition-colors">
          <Home className="w-5 h-5" />
        </Link>
      </div>

      {/* Images Container */}
      <div className="max-w-3xl mx-auto flex flex-col items-center select-none">
        <div className="w-full px-4">
          <AdBanner dataAdSlot="1122334455" className="my-4" />
        </div>
        
        {currentChapter.images.length === 0 ? (
          <div className="py-20 text-zinc-500 italic">No images available for this chapter.</div>
        ) : (
          currentChapter.images.map((imgUrl, index) => (
            <div key={index} className="w-full relative min-h-[300px] bg-zinc-900/50 flex items-center justify-center">
              {/* Using standard img tag for external scraped images to avoid next/image domain restrictions */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt={`Page ${index + 1}`}
                className="w-full h-auto block"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          {prevChapter ? (
            <Link
              href={`/comic/${comic.slug}/${prevChapter.slug}`}
              className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 py-3 rounded-lg transition-colors font-medium text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev Chapter
            </Link>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 bg-zinc-900/50 text-zinc-600 py-3 rounded-lg cursor-not-allowed font-medium text-sm">
              <ChevronLeft className="w-4 h-4" />
              Prev Chapter
            </div>
          )}

          <Link
            href={`/comic/${comic.slug}`}
            className="flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-zinc-300 p-3 rounded-lg transition-colors"
            title="Chapter List"
          >
            <Menu className="w-5 h-5" />
          </Link>

          {nextChapter ? (
            <Link
              href={`/comic/${comic.slug}/${nextChapter.slug}`}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg transition-colors font-medium text-sm"
            >
              Next Chapter
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 bg-zinc-900/50 text-zinc-600 py-3 rounded-lg cursor-not-allowed font-medium text-sm">
              Next Chapter
              <ChevronRight className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
