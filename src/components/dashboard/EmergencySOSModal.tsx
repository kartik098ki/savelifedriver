'use client';

import React, { useState } from 'react';
import { useDriver } from '@/context/DriverContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Headphones,
  Share2,
  PhoneCall,
  X,
  CheckCircle,
} from 'lucide-react';

export default function EmergencySOSModal() {
  const { isSosOpen, setSosOpen, driver, currentLocation } = useDriver();
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isSosOpen) return null;

  const handleShareLocation = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        `https://savife.in/live-ambulance-tracker?lat=${currentLocation.lat}&lng=${currentLocation.lng}&vehicle=${driver.ambulanceNumber}`
      );
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900"
        >
          {/* Header */}
          <div className="bg-red-600 px-6 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-white" />
              <div>
                <h3 className="text-lg font-black text-white">SAVIFE SUPPORT</h3>
                <p className="text-[11px] text-red-100">Emergency Driver Assistance</p>
              </div>
            </div>
            <button
              onClick={() => setSosOpen(false)}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Options */}
          <div className="p-5 space-y-3">
            {/* 1. Call Customer Support */}
            <a
              href="tel:18001237284"
              className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Call Customer Support</h4>
                  <p className="text-xs text-slate-500">24x7 SAVIFE Helpline</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                CALL
              </span>
            </a>

            {/* 2. Emergency Assistance (112 / 108) */}
            <a
              href="tel:112"
              className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Emergency Assistance</h4>
                  <p className="text-xs text-slate-500">Police & Medical Central Triage (112)</p>
                </div>
              </div>
              <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                DIAL
              </span>
            </a>

            {/* 3. Share Live Location */}
            <button
              onClick={handleShareLocation}
              className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-left transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-100 text-sky-700 rounded-xl">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Share Live Location</h4>
                  <p className="text-xs text-slate-500">
                    {copiedLink ? 'Location link copied to clipboard!' : 'Copy tracking link for attendants'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                {copiedLink ? 'COPIED' : 'SHARE'}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

