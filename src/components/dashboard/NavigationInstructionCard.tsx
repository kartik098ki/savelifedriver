'use client';

import React from 'react';
import { useDriver } from '@/context/DriverContext';
import {
  CornerUpLeft,
  MapPin,
  Clock,
  Navigation,
  Gauge,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { formatDistance, formatDuration } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function NavigationInstructionCard() {
  const {
    tripStatus,
    selectedHospital,
    currentSpeed,
    remainingDistanceKm,
    remainingEtaMinutes,
  } = useDriver();

  const isNavigating =
    tripStatus === 'EN_ROUTE_TO_CUSTOMER' ||
    tripStatus === 'ACCEPTED' ||
    tripStatus === 'EN_ROUTE_TO_HOSPITAL';

  if (!isNavigating) return null;

  const isHeadingToCustomer = tripStatus === 'EN_ROUTE_TO_CUSTOMER' || tripStatus === 'ACCEPTED';
  const destinationName = isHeadingToCustomer
    ? 'Sector 62, Noida (Customer Pickup)'
    : selectedHospital?.name || 'Fortis Hospital (Emergency Bay)';

  const turnRoad = isHeadingToCustomer ? 'Sector 62 Main Rd' : 'Fortis Expressway Service Rd';
  const nextRoad = isHeadingToCustomer ? 'Next: In 400m arrive at Gate 2' : 'Next: In 1.2km Emergency Trauma Ramp';

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-5 left-5 right-5 sm:right-auto sm:w-[430px] z-[600] pointer-events-auto"
    >
      <div className="bg-white/95 backdrop-blur-xl text-slate-900 rounded-[22px] shadow-2xl border border-slate-200/80 overflow-hidden">
        {/* Turn-by-Turn Maneuver Header */}
        <div className="bg-[#1967d2] px-4 py-3.5 flex items-center gap-3.5 text-white shadow-inner">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#1967d2] flex items-center justify-center font-black shadow-md shrink-0 ring-4 ring-white/20">
            <CornerUpLeft className="w-7 h-7 stroke-[3]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-black tracking-wider bg-black/20 px-2 py-0.5 rounded-lg text-white backdrop-blur-sm">
                In 250 m
              </span>
              <span className="text-xs font-bold text-emerald-100 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" /> Turn left onto
              </span>
            </div>
            <p className="text-base font-black truncate text-white leading-snug mt-0.5">
              {turnRoad}
            </p>
            <p className="text-[10px] text-emerald-100/80 truncate mt-0.5">
              {nextRoad}
            </p>
          </div>

          {/* Speed Indicator */}
          <div className="shrink-0 text-right bg-blue-800/40 p-2 rounded-2xl border border-blue-300/30">
            <span className="text-[10px] font-bold text-blue-100 uppercase block">Speed</span>
            <span className="text-sm font-black text-white font-mono">{currentSpeed} <span className="text-[9px] font-normal text-blue-100">km/h</span></span>
          </div>
        </div>

        {/* ETA, Remaining Distance & Green Wave status */}
        <div className="px-4 py-3 bg-white/90 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="font-extrabold text-slate-800 truncate text-xs">
              {destinationName}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-center">
              <span className="text-[11px] font-black text-emerald-800">
                {formatDistance(remainingDistanceKm)}
              </span>
            </div>

            <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] font-black text-slate-800">
                {formatDuration(remainingEtaMinutes)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
