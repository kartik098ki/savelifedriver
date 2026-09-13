'use client';

import React, { useRef, useState } from 'react';
import { ChevronRight, MapPin } from 'lucide-react';

export default function ReachedSwipe({ onComplete, disabled = false }: { onComplete: () => void; disabled?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(0);
  const [active, setActive] = useState(false);
  const move = (clientX: number) => {
    if (disabled || !active || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const value = Math.max(0, Math.min(clientX - rect.left - 12, rect.width - 62));
    setDrag(value);
    if (value >= rect.width - 76) { setActive(false); setDrag(rect.width - 62); onComplete(); }
  };
  const end = () => { if (active) setDrag(0); setActive(false); };
  return <div ref={trackRef} onPointerMove={(e) => move(e.clientX)} onPointerUp={end} onPointerCancel={end} className={`relative h-[68px] rounded-[22px] border overflow-hidden select-none touch-none shadow-2xl ${disabled ? 'bg-slate-200 border-slate-300' : 'bg-slate-950 border-slate-700'}`}>
    <div style={{ width: drag + 62 }} className="absolute inset-y-0 left-0 bg-emerald-500/20 transition-[width] duration-75" />
    <div className={`absolute inset-0 flex items-center justify-center gap-2 ${disabled ? 'text-slate-500' : 'text-white'}`}><MapPin className={`w-4 h-4 ${disabled ? 'text-slate-400' : 'text-emerald-400'}`} /><span className="text-xs font-black tracking-wide">{disabled ? 'REACH PICKUP TO UNLOCK SWIPE' : 'SLIDE WHEN YOU HAVE REACHED'}</span></div>
    <button disabled={disabled} aria-label={disabled ? 'Reached swipe locked until pickup' : 'Slide to confirm arrival'} onPointerDown={(e) => { setActive(true); move(e.clientX); }} style={{ transform: `translateX(${drag}px)` }} className={`absolute top-[7px] left-[7px] w-[54px] h-[54px] rounded-[18px] text-white flex items-center justify-center shadow-lg ${disabled ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-500 cursor-grab active:cursor-grabbing'}`}><ChevronRight className="w-7 h-7" /></button>
  </div>;
}
