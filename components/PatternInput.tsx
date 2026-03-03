'use client';

import { useState, useEffect, useRef } from 'react';

interface PatternInputProps {
  pattern: number[];
  onChange: (pattern: number[]) => void;
  onComplete?: (pattern: number[]) => void;
  error?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function PatternInput({ 
  pattern, 
  onChange, 
  onComplete,
  error = false, 
  disabled = false,
  size = 'md' 
}: PatternInputProps) {
  const [isDrawing, setIsDrawing] = useState(false);
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

  const handlePointerUp = () => {
    if (disabled) return;
    setIsDrawing(false);
    if (pattern.length > 0 && onComplete) {
      onComplete(pattern);
    }
  };

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
  }, [isDrawing, pattern, disabled, onComplete]);

  const handlePointerDown = (index: number, e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault(); // Prevent default touch actions
    setIsDrawing(true);
    onChange([index]);
    
    // Capture pointer so we can track movement even if it leaves the element
    if (e.target instanceof Element) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  const handlePointerEnter = (index: number) => {
    if (disabled) return;
    if (isDrawing) {
      if (!pattern.includes(index)) {
        onChange([...pattern, index]);
      }
    }
  };

  // For touch devices, we need to calculate which element the finger is over
  const handlePointerMove = (e: React.PointerEvent) => {
    if (disabled || !isDrawing) return;
    
    // Find element under pointer
    const element = document.elementFromPoint(e.clientX, e.clientY);
    const target = element?.closest('[data-index]');
    if (target) {
      const index = parseInt(target.getAttribute('data-index') || '-1', 10);
      if (index >= 0) {
        if (!pattern.includes(index)) {
          onChange([...pattern, index]);
        }
      }
    }
  };

  const dotSize = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-20 h-20' : 'w-16 h-16';
  const innerSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const gapSize = size === 'sm' ? 'gap-4' : size === 'lg' ? 'gap-8' : 'gap-6';
  const paddingSize = size === 'sm' ? 'p-4' : size === 'lg' ? 'p-8' : 'p-6';

  return (
    <div 
      ref={containerRef}
      className={`grid grid-cols-3 ${gapSize} ${paddingSize} bg-zinc-950 rounded-xl border border-zinc-800 touch-none relative select-none`}
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
            className={`${dotSize} flex items-center justify-center relative z-10 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            onPointerDown={(e) => handlePointerDown(index, e)}
            onPointerEnter={() => handlePointerEnter(index)}
          >
            <div 
              className={`${innerSize} rounded-full transition-all duration-200 pointer-events-none ${
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
  );
}
