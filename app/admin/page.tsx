'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Comic, Chapter } from '@/lib/db';
import { BookOpen, List, PlusCircle, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/comics').then(res => res.json()),
      fetch('/api/chapters').then(res => res.json())
    ]).then(([comicsData, chaptersData]) => {
      setComics(comicsData);
      setChapters(chaptersData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="animate-pulse h-32 bg-zinc-900 rounded-lg"></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-zinc-50 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm font-medium text-zinc-400">Total Comics</div>
            <div className="text-3xl font-bold text-zinc-50">{comics.length}</div>
          </div>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 text-blue-500 rounded-lg">
            <List className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm font-medium text-zinc-400">Total Chapters</div>
            <div className="text-3xl font-bold text-zinc-50">{chapters.length}</div>
          </div>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center gap-4">
          <div className="p-4 bg-purple-500/10 text-purple-500 rounded-lg">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm font-medium text-zinc-400">Ongoing Series</div>
            <div className="text-3xl font-bold text-zinc-50">
              {comics.filter(c => c.status === 'Ongoing').length}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-zinc-50">Recent Comics</h2>
        <Link href="/admin/comics" className="text-emerald-500 hover:text-emerald-400 font-medium text-sm flex items-center gap-1">
          View All
        </Link>
      </div>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-950/50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Chapters</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {comics.slice(0, 5).map((comic) => (
              <tr key={comic.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-zinc-200">{comic.title}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    comic.status === 'Ongoing' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {comic.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {chapters.filter(c => c.comicId === comic.id).length}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/comics/${comic.id}`} className="text-emerald-500 hover:text-emerald-400 font-medium">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
            {comics.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                  No comics found. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
