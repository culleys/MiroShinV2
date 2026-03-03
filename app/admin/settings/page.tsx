'use client';

import { Settings as SettingsIcon, Key, Database, Save, Shield, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import PatternInput from '@/components/PatternInput';

export default function AdminSettings() {
  const [dbUrl, setDbUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [adminPattern, setAdminPattern] = useState<number[]>([]);
  const [savingPattern, setSavingPattern] = useState(false);
  const [patternMessage, setPatternMessage] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.databaseUrl) setDbUrl(data.databaseUrl);
        if (data.adminPattern) setAdminPattern(data.adminPattern);
      });
  }, []);

  const handleSaveDb = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseUrl: dbUrl }),
      });
      if (res.ok) {
        setMessage('Database settings saved successfully. Restart the server to apply changes if needed.');
      } else {
        setMessage('Failed to save settings.');
      }
    } catch (error) {
      setMessage('An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePattern = async () => {
    if (adminPattern.length < 4) {
      setPatternMessage('Pattern must be at least 4 dots long.');
      return;
    }
    
    setSavingPattern(true);
    setPatternMessage('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPattern }),
      });
      if (res.ok) {
        setPatternMessage('Admin pattern saved successfully.');
      } else {
        setPatternMessage('Failed to save pattern.');
      }
    } catch (error) {
      setPatternMessage('An error occurred.');
    } finally {
      setSavingPattern(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-zinc-50">Settings</h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold text-zinc-100 border-b border-zinc-800 pb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-500" />
          Security Settings
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-4">Admin Unlock Pattern</label>
            <div className="text-xs text-zinc-500 mb-6 max-w-md">
              Draw a new pattern to protect the admin panel. The pattern must connect at least 4 dots.
              <br/><br/>
              <strong className="text-amber-500">Note for Vercel users:</strong> Settings saved here may reset. For permanent settings on Vercel, add an environment variable <code>ADMIN_PATTERN</code> with your pattern array (e.g., <code>[0,1,2,5,8]</code>).
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center">
                <PatternInput 
                  pattern={adminPattern}
                  onChange={setAdminPattern}
                  size="sm"
                />
                <div className="mt-4 flex gap-3 w-full">
                  <button 
                    onClick={() => setAdminPattern([])}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Clear
                  </button>
                  <button
                    onClick={handleSavePattern}
                    disabled={savingPattern || adminPattern.length < 4}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {savingPattern ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-zinc-300 mb-2">Current Pattern Sequence</h3>
                  <div className="font-mono text-zinc-500 text-sm break-all">
                    {adminPattern.length > 0 ? adminPattern.join(' → ') : 'No pattern set'}
                  </div>
                  {adminPattern.length > 0 && adminPattern.length < 4 && (
                    <p className="text-rose-500 text-xs mt-2">Pattern is too short (minimum 4 dots).</p>
                  )}
                </div>
                {patternMessage && (
                  <p className={`mt-4 text-sm ${patternMessage.includes('success') ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {patternMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-8 space-y-6">
        <h2 className="text-xl font-semibold text-zinc-100 border-b border-zinc-800 pb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-500" />
          Database Settings
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Neon Database URL</label>
            <div className="text-xs text-zinc-500 mb-2">
              Enter your Neon PostgreSQL connection string to save comics to the database instead of memory.
              (e.g., <code>postgresql://user:password@ep-name.region.aws.neon.tech/dbname?sslmode=require</code>)
              <br/><br/>
              <strong className="text-amber-500">Note for Vercel users:</strong> Settings saved here may reset. For permanent settings on Vercel, add an environment variable <code>DATABASE_URL</code> with your connection string.
            </div>
            <div className="flex gap-2 max-w-2xl">
              <input
                type="password"
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                placeholder="postgresql://..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button
                onClick={handleSaveDb}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
            {message && (
              <p className={`mt-2 text-sm ${message.includes('success') ? 'text-emerald-500' : 'text-rose-500'}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-8 space-y-6">
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
