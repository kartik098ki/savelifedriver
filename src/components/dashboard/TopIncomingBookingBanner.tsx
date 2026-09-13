'use client';

import React from 'react';
import { useDriver } from '@/context/DriverContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Building2,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldAlert,
  Zap,
  Clock,
  HeartPulse,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function TopIncomingBookingBanner() {
  const { tripStatus, booking, countdownSeconds, acceptBooking, declineBooking } = useDriver();

  if (tripStatus !== 'BOOKING_RECEIVED' || !booking) return null;

  // Ten seconds gives the driver time to assess a live emergency dispatch.
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (countdownSeconds / 10) * circumference;

  return (
    <AnimatePresence>
      <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <motion.div
          initial={{ y: -90, opacity: 0, scale: 0.94 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -90, opacity: 0, scale: 0.94 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className="w-full max-w-xl bg-white/95 backdrop-blur-xl border-2 border-emerald-500 rounded-3xl shadow-2xl shadow-emerald-950/25 p-5 md:p-6 pointer-events-auto text-slate-900 overflow-hidden relative"
        >
          {/* Top Row: Emergency Alert Badge + Countdown Ring */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                    EMERGENCY DISPATCH INCOMING
                  </span>
                  <span className="bg-red-50 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-0.5">
                    <HeartPulse className="w-3 h-3" /> ALS
                  </span>
                </div>
                  <p className="text-[11px] text-slate-500">10-second decision window · auto-reassigns if unanswered</p>
              </div>
            </div>

            {/* Circular 10-second countdown timer */}
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    className="text-slate-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    className="text-emerald-500 transition-all duration-1000 ease-linear"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute font-black text-base text-emerald-700">
                  {countdownSeconds}s
                </span>
              </div>
            </div>
          </div>

          {/* Clean Route & Fare Block */}
          <div className="py-4 space-y-3">
            <div className="relative bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
              {/* Pickup */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 font-black text-xs border border-sky-200">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Pickup Location
                  </span>
                  <p className="font-extrabold text-sm text-slate-900 truncate">
                    Sector 62, Noida
                  </p>
                  <p className="text-[11px] text-slate-500">Approx. 400m from current position</p>
                </div>
              </div>

              {/* Connector line */}
              <div className="ml-3 border-l-2 border-dashed border-slate-300 h-2 my-0.5"></div>

              {/* Destination */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-black text-xs border border-emerald-200">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Destination Hospital
                  </span>
                  <p className="font-extrabold text-sm text-slate-900 truncate">
                    Fortis Hospital (Emergency Bay)
                  </p>
                  <p className="text-[11px] text-slate-500">ICU Bed & Trauma Staff on alert</p>
                </div>
              </div>
            </div>

            {/* Payout Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-emerald-100/40 to-emerald-50 p-3.5 rounded-2xl border border-emerald-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                  ₹
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                    Guaranteed Payout
                  </span>
                  <p className="text-[11px] text-slate-500">Includes Emergency ALS Incentive</p>
                </div>
              </div>
              <span className="text-2xl font-black text-emerald-800 tracking-tight">
                {formatCurrency(booking.fare)}
              </span>
            </div>
          </div>

          {/* Action Buttons: Big Accept & Crisp Decline */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={declineBooking}
              className="py-4 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-200 shadow-sm"
            >
              <X className="w-4 h-4 text-slate-500" />
              <span>PASS</span>
            </button>

            <button
              onClick={acceptBooking}
              className="flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all group"
            >
              <CheckCircle2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              <span>ACCEPT DISPATCH</span>
              <ArrowRight className="w-4 h-4 text-emerald-100 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
