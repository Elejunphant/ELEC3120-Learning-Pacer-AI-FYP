'use client';

import { useEffect, useRef, useState } from 'react';
import { useMotionValue, type PanInfo } from 'framer-motion';

interface Position {
  x: number;
  y: number;
}

interface UseFloatingDragOptions {
  storageKey: string;
  defaultPosition: () => Position;
}

function loadFromStorage(key: string): Position | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p?.x === 'number' && typeof p?.y === 'number') return p;
  } catch { /* noop */ }
  return null;
}

function saveToStorage(key: string, p: Position) {
  try { localStorage.setItem(key, JSON.stringify(p)); } catch { /* noop */ }
}

function clampToViewport(x: number, y: number, w: number, h: number): Position {
  if (typeof window === 'undefined') return { x, y };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    x: Math.max(0, Math.min(x, vw - w)),
    y: Math.max(0, Math.min(y, vh - h)),
  };
}

/**
 * Draggable floating widget powered by framer-motion's `drag`.
 *
 * Returns motion values + drag props that you spread onto a `motion.div`,
 * plus a `wasDragged` ref you check inside `onClick` to ignore clicks
 * that were actually drags.
 *
 * Usage:
 *   const { x, y, hydrated, isDragging, wasDragged, containerRef, dragProps } =
 *     useFloatingDrag({ storageKey: '...', defaultPosition: () => ({x:0,y:0}) });
 *   if (!hydrated) return null;
 *   return (
 *     <motion.div ref={containerRef} {...dragProps}
 *       style={{ position:'fixed', left:0, top:0, x, y, zIndex:50, touchAction:'none' }}>
 *       <button onClick={() => { if (wasDragged.current) return; ... }}>...</button>
 *     </motion.div>
 *   );
 */
export function useFloatingDrag({ storageKey, defaultPosition }: UseFloatingDragOptions) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [hydrated, setHydrated] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const wasDragged = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hydrate from localStorage (or fall back to default), clamping to current viewport
  useEffect(() => {
    const saved = loadFromStorage(storageKey);
    const p = saved ?? defaultPosition();
    // Element size isn't measurable yet (we render null until hydrated); use a
    // conservative 48×48 fallback so a saved position from a wider viewport
    // doesn't strand the widget off-screen on a smaller one.
    const clamped = clampToViewport(p.x, p.y, 48, 48);
    x.set(clamped.x);
    y.set(clamped.y);
    if (clamped.x !== p.x || clamped.y !== p.y) saveToStorage(storageKey, clamped);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Re-clamp when the viewport shrinks (resize / orientationchange) so a
  // widget can never end up unreachable.
  useEffect(() => {
    if (!hydrated) return;
    const handleResize = () => {
      const el = containerRef.current;
      const w = el?.offsetWidth ?? 48;
      const h = el?.offsetHeight ?? 48;
      const clamped = clampToViewport(x.get(), y.get(), w, h);
      if (clamped.x !== x.get() || clamped.y !== y.get()) {
        x.set(clamped.x);
        y.set(clamped.y);
        saveToStorage(storageKey, clamped);
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, storageKey]);

  const dragProps = {
    drag: true as const,
    dragMomentum: false,
    dragElastic: 0,
    onDragStart: () => {
      wasDragged.current = false;
      setIsDragging(true);
    },
    onDrag: (_: PointerEvent, info: PanInfo) => {
      if (Math.abs(info.offset.x) > 3 || Math.abs(info.offset.y) > 3) {
        wasDragged.current = true;
      }
    },
    onDragEnd: () => {
      const el = containerRef.current;
      const w = el?.offsetWidth ?? 48;
      const h = el?.offsetHeight ?? 48;
      const clamped = clampToViewport(x.get(), y.get(), w, h);
      x.set(clamped.x);
      y.set(clamped.y);
      saveToStorage(storageKey, clamped);
      setIsDragging(false);
      // Allow onClick (which fires after onDragEnd) to read wasDragged before reset
      requestAnimationFrame(() => { wasDragged.current = false; });
    },
  };

  return { x, y, hydrated, isDragging, wasDragged, containerRef, dragProps };
}
