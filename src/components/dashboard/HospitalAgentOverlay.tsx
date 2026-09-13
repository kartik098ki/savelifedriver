'use client';

import React from 'react';
import { useDriver } from '@/context/DriverContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneCall,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  ArrowRight,
  Clock,
  MapPin,
} from 'lucide-react';
import { formatDistance, formatDuration } from '@/lib/utils';

export default function HospitalAgentOverlay() {
  const {
    isCallingHospital,
    selectedHospital,
    rejectedHospital,
    suggestedAlternative,
    hospitalCallResponse,
    acceptReroute,
  } = useDriver();

  if (!isCallingHospital && !rejectedHospital) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900"
        >
          {/* 1. Active Hospital Calling State */}
          {isCallingHospital && selectedHospital && (
            <div>
              <div className="bg-emerald-600 p-5 flex items-center gap-3 text-white">
                <div className="p-2.5 bg-white/20 rounded-xl">
                  <PhoneCall className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">
                    Telephony Verification
                  </span>
                  <h3 className="text-lg font-black">Contacting Emergency Desk</h3>
                </div>
              </div>

              <div className="p-6 space-y-4 text-center">
                <div>
                  <h4 className="text-2xl font-black text-slate-900">{selectedHospital.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedHospital.phone}</p>
                </div>

                {/* Animated Voice Waveform */}
                <div className="flex items-center justify-center gap-1.5 h-12 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {[35, 75, 95, 60, 100, 45, 85, 30, 95, 55, 85, 45, 90, 65, 40].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['20%', `${h}%`, '20%'] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.05 }}
                      className="w-1 bg-emerald-600 rounded-full"
                    />
                  ))}
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  Checking emergency doctor & bed admission readiness...
                </p>
              </div>
            </div>
          )}

          {/* 2. Rejection & Auto Reroute Notification */}
          {!isCallingHospital && rejectedHospital && suggestedAlternative && (
            <div>
              <div className="bg-rose-600 p-5 flex items-center gap-3 text-white">
                <div className="p-2.5 bg-white/20 rounded-xl">
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-100">
                    Hospital Admission Notice
                  </span>
                  <h3 className="text-lg font-black">{rejectedHospital.name} Unavailable</h3>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-red-50 p-3.5 rounded-2xl border border-red-200 text-xs text-red-800 space-y-0.5">
                  <p className="font-black text-sm">
                    {rejectedHospital.name} cannot receive patient at this moment.
                  </p>
                  <p className="text-red-700">
                    Reason: {hospitalCallResponse?.rejectionReason || 'ICU Beds 100% full'}
                  </p>
                </div>

                {/* Recommended Next Alternative */}
                <div className="bg-emerald-50/80 p-4 rounded-2xl border-2 border-emerald-500 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-emerald-800">
                      Rerouting to Available Hospital:
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                      READY
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-slate-900">{suggestedAlternative.name}</h4>
                    <p className="text-xs text-slate-500">{suggestedAlternative.address}</p>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold pt-1">
                    <span className="flex items-center gap-1 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {formatDistance(suggestedAlternative.distanceKm)}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-800">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      ETA {formatDuration(suggestedAlternative.etaMinutes)}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Bed & Doctor Available
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => acceptReroute(suggestedAlternative)}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Navigation className="w-4 h-4" />
                  <span>START ROUTE TO {suggestedAlternative.name.toUpperCase()}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

