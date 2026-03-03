'use client';

import { useState, useEffect } from 'react';
import { Lock, Unlock, RotateCcw } from 'lucide-react';
import PatternInput from './PatternInput';

export default function PatternLock({ onSuccess }: { onSuccess: () => void }) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [error, setError] = useState(false);
  const [secretPattern, setSecretPattern] = useState<number[]>([0, 1, 2, 5, 8]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.adminPattern) {
          setSecretPattern(data.adminPattern);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleComplete = (completedPattern: number[]) => {
    if (completedPattern.join(',') === secretPattern.join(',')) {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => {
        setPattern([]);
        setError(false);
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 select-none">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
          {error ? (
            <Lock className="w-8 h-8 text-rose-500" />
          ) : pattern.length > 0 ? (
            <Unlock className="w-8 h-8 text-emerald-500" />
          ) : (
            <Lock className="w-8 h-8 text-zinc-400" />
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-zinc-50 mb-2">Admin Access</h2>
        <p className="text-zinc-400 text-center mb-8 text-sm">
          Draw the unlock pattern to access the admin panel.
        </p>

        <PatternInput 
          pattern={pattern}
          onChange={setPattern}
          onComplete={handleComplete}
          error={error}
        />

        <div className="mt-6 h-4 text-xs font-mono text-zinc-500">
          {pattern.length > 0 ? `Pattern: ${pattern.join(' → ')}` : 'Drag to connect dots'}
        </div>

        <button 
          onClick={() => {
            setPattern([]);
            setError(false);
          }}
          className="mt-4 flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Pattern
        </button>
      </div>
    </div>
  );
}
