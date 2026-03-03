'use client';

import { Settings as SettingsIcon, Key } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-zinc-50">Settings</h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold text-zinc-100 border-b border-zinc-800 pb-4 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-emerald-500" />
          General Settings
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Site Title</label>
            <input
              type="text"
              defaultValue="Miroshin Web Komik"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 max-w-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Site Description</label>
            <textarea
              rows={3}
              defaultValue="Mobile-friendly web comic platform"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 max-w-md resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-8 space-y-6">
        <h2 className="text-xl font-semibold text-zinc-100 border-b border-zinc-800 pb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-emerald-500" />
          API Integrations
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Scrape.do Token</label>
            <div className="text-xs text-zinc-500 mb-2">
              Required for bypassing Cloudflare and scraping protected manga sites.
              Set this in your environment variables as <code>SCRAPE_DO_TOKEN</code>.
            </div>
            <input
              type="password"
              disabled
              value="••••••••••••••••"
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-500 cursor-not-allowed max-w-md"
            />
          </div>
          
          <div className="pt-4 border-t border-zinc-800">
            <label className="block text-sm font-medium text-zinc-400 mb-1">AdSense Client ID</label>
            <div className="text-xs text-zinc-500 mb-2">
              Your Google AdSense Publisher ID (e.g., <code>ca-pub-1234567890123456</code>).
              Set this in your environment variables as <code>NEXT_PUBLIC_ADSENSE_CLIENT_ID</code>.
            </div>
            <input
              type="text"
              disabled
              value={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || ''}
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-500 cursor-not-allowed max-w-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
