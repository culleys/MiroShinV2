'use client';

import { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, RotateCcw } from 'lucide-react';

// Default pattern: Top row (0, 1, 2) then down the right side (5, 8)
const SECRET_PATTERN = [0, 1, 2, 5, 8];

export default function PatternLock({ onSuccess }: { onSuccess: () => void }) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Prevent scrolling while drawing on mobile
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (isDrawing) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDrawing]);

  // Handle global pointer up to stop drawing even if mouse leaves the container
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDrawing) {
        handlePointerUp();
      }
    };
    
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [isDrawing, pattern]);

  const handlePointerDown = (index: number, e: React.PointerEvent) => {
    e.preventDefault(); // Prevent default touch actions
    setIsDrawing(true);
    setPattern([index]);
    setError(false);
    
    // Capture pointer so we can track movement even if it leaves the element
    if (e.target instanceof Element) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  const handlePointerEnter = (index: number) => {
    if (isDrawing) {
      setPattern((prev) => {
        if (!prev.includes(index)) {
          return [...prev, index];
        }
        return prev;
      });
    }
  };

  // For touch devices, we need to calculate which element the finger is over
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    
    // Find element under pointer
    const element = document.elementFromPoint(e.clientX, e.clientY);
    const target = element?.closest('[data-index]');
    if (target) {
      const index = parseInt(target.getAttribute('data-index') || '-1', 10);
      if (index >= 0) {
        setPattern((prev) => {
          if (!prev.includes(index)) {
            return [...prev, index];
          }
          return prev;
        });
      }
    }
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    if (pattern.length > 0) {
      if (pattern.join(',') === SECRET_PATTERN.join(',')) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => {
          setPattern([]);
          setError(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 select-none">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
          {error ? (
            <Lock className="w-8 h-8 text-rose-500" />
          ) : pattern.length > 0 && !isDrawing ? (
            <Unlock className="w-8 h-8 text-emerald-500" />
          ) : (
            <Lock className="w-8 h-8 text-zinc-400" />
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-zinc-50 mb-2">Admin Access</h2>
        <p className="text-zinc-400 text-center mb-8 text-sm">
          Draw the unlock pattern to access the admin panel.
          <br />
          <span className="text-xs text-zinc-500 mt-2 block">(Hint: Top row left-to-right, then down the right side)</span>
        </p>

        <div 
          ref={containerRef}
          className="grid grid-cols-3 gap-6 p-6 bg-zinc-950 rounded-xl border border-zinc-800 touch-none relative"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => {
            if (isDrawing) handlePointerUp();
          }}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
            const isSelected = pattern.includes(index);
            const isLast = pattern[pattern.length - 1] === index;
            
            return (
              <div
                key={index}
                data-index={index}
                className="w-16 h-16 flex items-center justify-center relative z-10 cursor-pointer"
                onPointerDown={(e) => handlePointerDown(index, e)}
                onPointerEnter={() => handlePointerEnter(index)}
              >
                <div 
                  className={`w-4 h-4 rounded-full transition-all duration-200 pointer-events-none ${
                    isSelected 
                      ? error 
                        ? 'bg-rose-500 scale-150 shadow-[0_0_15px_rgba(244,63,94,0.5)]' 
                        : 'bg-emerald-500 scale-150 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                      : 'bg-zinc-700 hover:bg-zinc-600'
                  } ${isLast && !error ? 'ring-4 ring-emerald-500/30' : ''}`}
                />
              </div>
            );
          })}
        </div>

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
