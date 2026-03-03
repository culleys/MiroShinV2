'use client';

import Link from 'next/link';
import { BookOpen, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import PatternLock from '@/components/PatternLock';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <PatternLock onSuccess={login} />;
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-emerald-500">
            <BookOpen className="w-6 h-6" />
            <span>Miroshin Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-lg transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/admin/comics" className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-lg transition-colors">
            <BookOpen className="w-5 h-5" />
            Comics
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>
        
        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-zinc-950">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
