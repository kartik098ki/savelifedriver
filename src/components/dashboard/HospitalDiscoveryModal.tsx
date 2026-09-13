'use client';

import React, { useState } from 'react';
import { useDriver } from '@/context/DriverContext';
import {
  Building2,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  Phone,
  Sparkles,
  ShieldCheck,
  HeartPulse,
} from 'lucide-react';
import { formatDistance, formatDuration } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function HospitalDiscoveryModal() {
  const { tripStatus, hospitals, selectHospital } = useDriver();
  const [filterType, setFilterType] = useState<'ALL' | 'ICU' | 'TRAUMA'>('ALL');

  if (tripStatus !== 'HOSPITAL_SEARCH') {
    return null;
  }

  const filteredHospitals = hospitals.filter((h) => {
    if (filterType === 'ICU') return h.icuAvailable;
    if (filterType === 'TRAUMA') return h.emergencyAvailable;
    return true;
  });

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[88vh] border border-slate-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-4 sm:p-6 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                SELECT DESTINATION HOSPITAL
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Live capacity and ICU availability near Sector 62, Noida
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs self-start sm:self-auto">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterType === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Hospitals
            </button>
            <button
              onClick={() => setFilterType('ICU')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterType === 'ICU'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ICU Ready
            </button>
            <button
              onClick={() => setFilterType('TRAUMA')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterType === 'TRAUMA'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Trauma Level 1
            </button>
          </div>
        </div>

        {/* Hospital Cards List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHospitals.map((hospital, index) => {
              const isTopPick = index === 0;
              return (
                <div
                  key={hospital.id}
                  className={`bg-white rounded-3xl border-2 p-5 flex flex-col justify-between transition-all hover:shadow-lg ${
                    isTopPick
                      ? 'border-emerald-500 bg-emerald-50/20'
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Photo, Name, Distance & ETA */}
                    <div className="flex items-start gap-3.5">
                      <div className="relative w-18 h-18 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-sm">
                        {hospital.imageUrl ? (
                          <img
                            src={hospital.imageUrl}
                            alt={hospital.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Building2 className="w-7 h-7" />
                          </div>
                        )}
                        <span className="absolute top-1 left-1 bg-emerald-700 px-2 py-0.5 rounded-lg text-[9px] font-black text-white shadow-sm">
                          #{index + 1}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-black text-base text-slate-900 truncate">
                            {hospital.name}
                          </h4>
                          <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {hospital.rating}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                          {formatDistance(hospital.distanceKm)} away • Approx {formatDuration(hospital.etaMinutes)}
                        </p>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5 mt-2 text-[10px] font-black">
                          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                            🟢 {hospital.icuBedCount || 4} ICU Beds
                          </span>
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                            {hospital.specialties[0] || 'Emergency Center'}
                          </span>
                          <span className="bg-sky-50 text-sky-800 px-2 py-0.5 rounded-lg border border-sky-200">
                            Oxygen Ready
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <a
                      href={`tel:${hospital.phone}`}
                      className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors border border-slate-200"
                      title="Call Hospital Emergency Desk"
                    >
                      <Phone className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => selectHospital(hospital, hospital.id === 'HOSP-APOLLO')}
                      className="flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-xs tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <span>SELECT & START NAVIGATION</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

