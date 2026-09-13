'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Crosshair, Navigation, Radio, Route, LocateFixed } from 'lucide-react';
import { useDriver } from '@/context/DriverContext';

// Google Maps needs the browser's GPS and client-side JavaScript API.
const DynamicMapInner = dynamic(() => import('./GoogleMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-slate-900 flex flex-col items-center justify-center text-slate-400 gap-3">
      <div className="w-10 h-10 border-4 border-savife-red border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-medium tracking-wide">Connecting to live Google Maps…</p>
    </div>
  ),
});

export default function LiveMap() {
  const { currentLocation, tripStatus, remainingDistanceKm, remainingEtaMinutes, currentSpeed, isMoving, gpsStatus, gpsAccuracyMeters } = useDriver();
  const isNavigating = tripStatus === 'EN_ROUTE_TO_CUSTOMER' || tripStatus === 'EN_ROUTE_TO_HOSPITAL';
  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950">
      <DynamicMapInner />
      {!isNavigating && <div className="absolute top-5 left-5 right-5 z-[500] pointer-events-none flex items-start justify-between gap-3">
        <div className="bg-slate-950/90 backdrop-blur-xl text-white rounded-2xl px-4 py-3 shadow-2xl border border-white/10 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center"><Navigation className="w-4 h-4" /></div>
            <div>
              <p className="text-[10px] text-emerald-300 font-black uppercase tracking-[0.16em]">{gpsStatus === 'LIVE' ? 'Driver GPS live' : 'Driver GPS required'}</p>
              <p className="text-sm font-black">{gpsStatus === 'LIVE' ? (isNavigating ? 'Following live driver position' : 'Driver location is active') : 'Enable location to place your blue pin'}</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex bg-white/95 backdrop-blur-xl rounded-2xl px-3 py-2 shadow-xl border border-slate-200 items-center gap-2 text-slate-800">
          <LocateFixed className={`w-4 h-4 ${gpsStatus === 'LIVE' ? 'text-blue-600' : 'text-amber-600'}`} />
          <div><p className="text-[9px] font-black uppercase text-slate-400">{gpsStatus === 'LIVE' ? 'Driver location' : 'Location status'}</p><p className="text-[11px] font-bold tabular-nums">{gpsStatus === 'LIVE' ? `${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)}` : gpsStatus === 'DENIED' ? 'Permission required' : 'Finding GPS…'}</p>{gpsStatus === 'LIVE' && <p className="text-[9px] font-semibold text-blue-600">Blue pin · ±{gpsAccuracyMeters || '—'} m</p>}</div>
        </div>
      </div>}
      <div className="absolute bottom-5 left-5 z-[500] pointer-events-none flex gap-2">
        {isNavigating && <div className="bg-white/95 backdrop-blur-xl rounded-2xl px-4 py-3 border border-slate-200 shadow-xl flex items-center gap-3 text-slate-900"><Route className="w-5 h-5 text-emerald-600" /><div><p className="text-lg font-black leading-none">{remainingDistanceKm.toFixed(1)} km <span className="text-sm text-slate-500">· {remainingEtaMinutes} min</span></p><p className="text-[10px] font-bold text-slate-500 mt-1">Live traffic-aware estimate</p></div></div>}
        <div className="hidden md:flex bg-slate-950/90 backdrop-blur-xl rounded-2xl px-3 py-2 border border-white/10 shadow-xl text-white items-center gap-2"><Radio className={`w-4 h-4 text-emerald-400 ${isMoving ? 'animate-pulse' : ''}`} /><span className="text-xs font-black">{currentSpeed} km/h</span></div>
      </div>
      <button onClick={() => window.dispatchEvent(new Event('savife:recenter-map'))} aria-label="Center map on driver" className="absolute bottom-5 right-5 z-[650] h-12 w-12 bg-white hover:bg-blue-50 rounded-2xl border border-slate-200 shadow-xl text-blue-600 flex items-center justify-center transition-colors"><Crosshair className="w-5 h-5" /></button>
    </div>
  );
}
