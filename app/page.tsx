'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Comic } from '@/lib/db';
import { BookOpen } from 'lucide-react';
import AdBanner from '@/components/AdBanner';

export default function Home() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/comics')
      .then((res) => res.json())
      .then((data) => {
        // Sort by updatedAt descending
        setComics(data.sort((a: Comic, b: Comic) => b.updatedAt - a.updatedAt));
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <AdBanner dataAdSlot="1234567890" className="mb-8" />
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-emerald-500" />
          Latest Updates
        </h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse bg-zinc-900 rounded-lg aspect-[3/4]"></div>
          ))}
        </div>
      ) : comics.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          No comics available yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {comics.map((comic) => (
            <Link key={comic.id} href={`/comic/${comic.slug}`} className="group block">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-zinc-900 mb-2">
                {comic.coverImage ? (
                  <Image
                    src={comic.coverImage}
                    alt={comic.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
                    <BookOpen className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-emerald-500 text-zinc-950 text-xs font-bold px-2 py-1 rounded">
                  {comic.status}
                </div>
              </div>
              <h3 className="font-semibold text-zinc-100 line-clamp-2 group-hover:text-emerald-400 transition-colors text-sm sm:text-base">
                {comic.title}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Updated {formatDistanceToNow(comic.updatedAt, { addSuffix: true })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
