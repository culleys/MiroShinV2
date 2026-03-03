'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Comic, Chapter } from '@/lib/db';
import { BookOpen, List, Clock, User, Tag } from 'lucide-react';
import AdBanner from '@/components/AdBanner';

export default function ComicPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [comic, setComic] = useState<Comic | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/comics/${resolvedParams.slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setComic(data);
        return fetch(`/api/chapters?comicId=${data.id}`);
      })
      .then((res) => res.json())
      .then((data) => {
        setChapters(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [resolvedParams.slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 lg:w-1/4 aspect-[3/4] bg-zinc-900 rounded-lg"></div>
          <div className="flex-1 space-y-4">
            <div className="h-10 bg-zinc-900 rounded w-2/3"></div>
            <div className="h-4 bg-zinc-900 rounded w-1/4"></div>
            <div className="h-24 bg-zinc-900 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!comic) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-zinc-50 mb-4">Comic not found</h1>
        <Link href="/" className="text-emerald-500 hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdBanner dataAdSlot="0987654321" className="mb-8" />
      
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Cover Image */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-zinc-900 shadow-xl">
            {comic.coverImage ? (
              <Image
                src={comic.coverImage}
                alt={comic.title}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
                <BookOpen className="w-16 h-16" />
              </div>
            )}
            <div className="absolute top-2 right-2 bg-emerald-500 text-zinc-950 text-sm font-bold px-3 py-1 rounded">
              {comic.status}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-50 mb-4">{comic.title}</h1>
          
          <div className="flex flex-wrap gap-4 mb-6 text-sm text-zinc-400">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{comic.author || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Updated {formatDistanceToNow(comic.updatedAt, { addSuffix: true })}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {comic.genres?.map((genre) => (
              <span key={genre} className="flex items-center gap-1 bg-zinc-900 text-zinc-300 px-3 py-1 rounded-full text-xs font-medium">
                <Tag className="w-3 h-3" />
                {genre}
              </span>
            ))}
          </div>

          <div className="prose prose-invert max-w-none">
            <h3 className="text-lg font-semibold text-zinc-200 mb-2">Synopsis</h3>
            <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {comic.description || 'No description available.'}
            </p>
          </div>
          
          {chapters.length > 0 && (
            <div className="mt-8">
              <Link 
                href={`/comic/${comic.slug}/${chapters[chapters.length - 1].slug}`}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                Read First Chapter
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Chapters List */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-50 mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
          <List className="w-6 h-6 text-emerald-500" />
          Chapters ({chapters.length})
        </h2>
        
        {chapters.length === 0 ? (
          <p className="text-zinc-500 italic">No chapters available yet.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/comic/${comic.slug}/${chapter.slug}`}
                className="flex items-center justify-between p-4 bg-zinc-900/50 hover:bg-zinc-800 rounded-lg border border-zinc-800/50 transition-colors group"
              >
                <span className="font-medium text-zinc-300 group-hover:text-emerald-400 transition-colors">
                  {chapter.title || `Chapter ${chapter.number}`}
                </span>
                <span className="text-xs text-zinc-500">
                  {formatDistanceToNow(chapter.createdAt, { addSuffix: true })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
