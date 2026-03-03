'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Comic } from '@/lib/db';
import { PlusCircle, Search, Edit, Trash2 } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

export default function AdminComics() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [comicToDelete, setComicToDelete] = useState<string | null>(null);

  // Bulk Scrape Modal State
  const [scrapeModalOpen, setScrapeModalOpen] = useState(false);
  const [comicToScrape, setComicToScrape] = useState<Comic | null>(null);
  const [scrapeCount, setScrapeCount] = useState<number>(1);
  const [scrapeSourceUrl, setScrapeSourceUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState(0);

  useEffect(() => {
    fetchComics();
  }, []);

  const fetchComics = () => {
    fetch('/api/comics')
      .then((res) => res.json())
      .then((data) => {
        setComics(data);
        setLoading(false);
      });
  };

  const confirmDelete = (id: string) => {
    setComicToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!comicToDelete) return;
    
    try {
      const res = await fetch(`/api/comics/${comicToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        fetchComics();
      } else {
        alert('Failed to delete comic');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setDeleteModalOpen(false);
      setComicToDelete(null);
    }
  };

  const openScrapeModal = (comic: Comic, count: number) => {
    setComicToScrape(comic);
    setScrapeCount(count);
    setScrapeSourceUrl('');
    setScrapeProgress(0);
    setScrapeModalOpen(true);
  };

  const handleBulkScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comicToScrape || !scrapeSourceUrl) return;

    setIsScraping(true);
    setScrapeProgress(0);

    try {
      // Simulate scraping progress for the requested number of chapters
      for (let i = 1; i <= scrapeCount; i++) {
        // In a real app, this would call an API to scrape each chapter
        await new Promise(resolve => setTimeout(resolve, 1500));
        setScrapeProgress(i);
      }
      
      alert(`Successfully scraped ${scrapeCount} chapters!`);
      setScrapeModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('An error occurred during scraping');
    } finally {
      setIsScraping(false);
    }
  };

  const filteredComics = comics.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-zinc-50">Manage Comics</h1>
        <Link href="/admin/comics/new" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <PlusCircle className="w-5 h-5" />
          Add Comic
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-8">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search comics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Loading...</div>
        ) : (
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950/50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Author</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Scraping</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredComics.map((comic) => (
                <tr key={comic.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-200">
                    <Link href={`/admin/comics/${comic.id}`} className="hover:text-emerald-400">
                      {comic.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{comic.author || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      comic.status === 'Ongoing' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {comic.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        placeholder="Qty" 
                        id={`scrape-qty-${comic.id}`}
                        defaultValue="1"
                        className="w-16 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                        min="1"
                      />
                      <button 
                        onClick={() => {
                          const qtyInput = document.getElementById(`scrape-qty-${comic.id}`) as HTMLInputElement;
                          const qty = parseInt(qtyInput?.value || '1', 10);
                          openScrapeModal(comic, qty);
                        }}
                        className="bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30 px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Scrape
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/comics/${comic.id}`} className="text-zinc-400 hover:text-emerald-400 transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => confirmDelete(comic.id)} className="text-zinc-400 hover:text-rose-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredComics.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    No comics found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Comic"
        message="Are you sure you want to delete this comic? All associated chapters and images will also be permanently deleted. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setComicToDelete(null);
        }}
      />

      {/* Bulk Scrape Modal */}
      {scrapeModalOpen && comicToScrape && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-xl font-bold text-zinc-50">Scrape Chapters</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Scraping <strong className="text-emerald-400">{scrapeCount}</strong> chapter(s) for <strong>{comicToScrape.title}</strong>
              </p>
            </div>
            
            <form onSubmit={handleBulkScrape} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Source URL</label>
                <input
                  type="url"
                  required
                  value={scrapeSourceUrl}
                  onChange={(e) => setScrapeSourceUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="https://example.com/manga/..."
                  disabled={isScraping}
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Enter the base URL or the URL of the first chapter to scrape.
                </p>
              </div>
              
              {isScraping && (
                <div className="pt-4">
                  <div className="flex justify-between text-xs text-zinc-400 mb-2">
                    <span>Progress</span>
                    <span>{scrapeProgress} / {scrapeCount}</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${(scrapeProgress / scrapeCount) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => !isScraping && setScrapeModalOpen(false)}
                  disabled={isScraping}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScraping}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isScraping ? 'Scraping...' : 'Start Scraping'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
