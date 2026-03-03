'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Comic, Chapter } from '@/lib/db';
import { Save, ArrowLeft, PlusCircle, Trash2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import ConfirmModal from '@/components/ConfirmModal';

export default function EditComic({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const isNew = resolvedParams.id === 'new';
  
  const [comic, setComic] = useState<Partial<Comic>>({
    title: '',
    description: '',
    coverImage: '',
    author: '',
    status: 'Ongoing',
    genres: [],
  });
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<string | null>(null);

  // Chapter Scraping State
  const [showScrapeModal, setShowScrapeModal] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scrapeChapterNumber, setScrapeChapterNumber] = useState('');
  const [scrapeChapterTitle, setScrapeChapterTitle] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/comics/${resolvedParams.id}`)
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
          router.push('/admin/comics');
        });
    }
  }, [resolvedParams.id, isNew, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const url = isNew ? '/api/comics' : `/api/comics/${resolvedParams.id}`;
      const method = isNew ? 'POST' : 'PUT';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comic),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (isNew) {
          router.push(`/admin/comics/${data.id}`);
        } else {
          alert('Saved successfully');
        }
      } else {
        alert('Failed to save');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (chapterId: string) => {
    setChapterToDelete(chapterId);
    setDeleteModalOpen(true);
  };

  const handleDeleteChapter = async () => {
    if (!chapterToDelete) return;
    
    try {
      const res = await fetch(`/api/chapters/${chapterToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setChapters(chapters.filter(c => c.id !== chapterToDelete));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteModalOpen(false);
      setChapterToDelete(null);
    }
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setScraping(true);
    setScrapeError('');
    
    try {
      // 1. Scrape images
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl }),
      });
      
      const scrapeData = await scrapeRes.json();
      
      if (!scrapeRes.ok) {
        throw new Error(scrapeData.error || 'Failed to scrape');
      }
      
      if (!scrapeData.images || scrapeData.images.length === 0) {
        throw new Error('No images found on that page');
      }
      
      // 2. Create chapter
      const chapterRes = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comicId: resolvedParams.id,
          title: scrapeChapterTitle,
          number: Number(scrapeChapterNumber),
          images: scrapeData.images,
        }),
      });
      
      if (chapterRes.ok) {
        const newChapter = await chapterRes.json();
        setChapters([newChapter, ...chapters].sort((a, b) => b.number - a.number));
        setShowScrapeModal(false);
        setScrapeUrl('');
        setScrapeChapterNumber('');
        setScrapeChapterTitle('');
      } else {
        throw new Error('Failed to save chapter');
      }
    } catch (error: any) {
      setScrapeError(error.message);
    } finally {
      setScraping(false);
    }
  };

  if (loading) return <div className="p-8 text-zinc-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/comics" className="text-zinc-400 hover:text-zinc-50 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-zinc-50">
            {isNew ? 'Add New Comic' : 'Edit Comic'}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Comic Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-zinc-100 border-b border-zinc-800 pb-4">Comic Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={comic.title}
                  onChange={(e) => setComic({ ...comic, title: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Author</label>
                  <input
                    type="text"
                    value={comic.author}
                    onChange={(e) => setComic({ ...comic, author: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Status</label>
                  <select
                    value={comic.status}
                    onChange={(e) => setComic({ ...comic, status: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Cover Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={comic.coverImage}
                    onChange={(e) => setComic({ ...comic, coverImage: e.target.value })}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="https://..."
                  />
                  <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center whitespace-nowrap">
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setComic({ ...comic, coverImage: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Genres (comma separated)</label>
                <input
                  type="text"
                  value={comic.genres?.join(', ')}
                  onChange={(e) => setComic({ ...comic, genres: e.target.value.split(',').map(g => g.trim()).filter(Boolean) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Action, Fantasy, Romance"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={5}
                  value={comic.description}
                  onChange={(e) => setComic({ ...comic, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Comic'}
              </button>
            </div>
          </form>
        </div>

        {/* Chapters Management */}
        {!isNew && (
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                <h2 className="text-xl font-semibold text-zinc-100">Chapters</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert('Manual add coming soon!')}
                    className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add
                  </button>
                  <button
                    onClick={() => setShowScrapeModal(true)}
                    className="bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Scrape URL
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {chapters.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-4">No chapters yet.</p>
                ) : (
                  chapters.map((chapter) => (
                    <div key={chapter.id} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-lg group">
                      <div>
                        <div className="font-medium text-zinc-200 text-sm">
                          {chapter.title || `Chapter ${chapter.number}`}
                        </div>
                        <div className="text-xs text-zinc-500 flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> {chapter.images?.length || 0}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(chapter.createdAt)} ago</span>
                        </div>
                      </div>
                      <button
                        onClick={() => confirmDelete(chapter.id)}
                        className="text-zinc-600 hover:text-rose-400 transition-colors p-2"
                        title="Delete Chapter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scrape Modal */}
      {showScrapeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-xl font-bold text-zinc-50">Add Chapter via Scrape</h3>
              <p className="text-sm text-zinc-400 mt-1">Extract images from a manga reader URL.</p>
            </div>
            
            <form onSubmit={handleScrape} className="p-6 space-y-4">
              {scrapeError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-sm">
                  {scrapeError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Source URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="url"
                    required
                    value={scrapeUrl}
                    onChange={(e) => setScrapeUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="https://example.com/manga/chapter-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Chapter Number</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    value={scrapeChapterNumber}
                    onChange={(e) => setScrapeChapterNumber(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Title (Optional)</label>
                  <input
                    type="text"
                    value={scrapeChapterTitle}
                    onChange={(e) => setScrapeChapterTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="The Beginning"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowScrapeModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scraping}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {scraping ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Scraping...
                    </>
                  ) : (
                    'Scrape & Save'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Chapter"
        message="Are you sure you want to delete this chapter? All associated images will be permanently deleted. This action cannot be undone."
        onConfirm={handleDeleteChapter}
        onCancel={() => {
          setDeleteModalOpen(false);
          setChapterToDelete(null);
        }}
      />
    </div>
  );
}
