'use client';

import React from 'react';
import DriverSidebar from '@/components/layout/DriverSidebar';
import { useDriver } from '@/context/DriverContext';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  FileText,
  Phone,
  Languages,
  MapPin,
} from 'lucide-react';

export default function DriverProfilePage() {
  const { driver, ambulance, voiceLanguage, setVoiceLanguage } = useDriver();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Left Sidebar */}
      <div className="hidden lg:flex shrink-0 h-full">
        <DriverSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto text-slate-900">
        <div className="max-w-5xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="relative">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white font-black text-3xl shadow-md flex items-center justify-center border-2 border-white ring-4 ring-emerald-500/20">
              <span>RK</span>
            </div>
            <span className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1.5 rounded-xl shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900">{driver.name}</h1>
              <span className="inline-flex items-center gap-1 text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-xl border border-emerald-200 w-fit mx-auto md:mx-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> SAVIFE CERTIFIED CAPTAIN
              </span>
            </div>

            <p className="text-xs text-slate-500">
              {driver.experienceYears} Years Emergency Medical Response Experience • Base: Sector 62 Noida
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs">
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> {driver.phone}
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <FileText className="w-3.5 h-3.5 text-emerald-600" /> DL: {driver.licenseNumber}
              </span>
              <span className="text-amber-700 font-extrabold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ★ {driver.rating} Rating ({driver.totalTrips} Lifetime Trips)
              </span>
            </div>
          </div>
        </div>

        {/* Language Selection Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Languages className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="font-black text-slate-900 text-base">Driver Preferred Language & AI Voice</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Trip announcements, fare prices, and hospital status will be spoken in your selected language.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
                {[
                  ['hi-IN', 'हिंदी (Hindi)'],
                  ['en-IN', 'English'],
                  ['ta-IN', 'Hinglish (मिक्स)'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setVoiceLanguage(value as typeof voiceLanguage)}
                    className={`py-3.5 px-4 rounded-2xl text-xs font-black border transition-all ${
                      voiceLanguage === value
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Response Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 text-center shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Avg 5s Accept Time</p>
            <p className="text-3xl font-black text-emerald-700">1.8 <span className="text-sm font-normal text-slate-400">sec</span></p>
            <p className="text-[11px] text-slate-500">Target: Under 5.0 seconds</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 text-center shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Avg Pickup Arrival</p>
            <p className="text-3xl font-black text-sky-700">4.2 <span className="text-sm font-normal text-slate-400">min</span></p>
            <p className="text-[11px] text-slate-500">Top 1% Fastest NCR Dispatch</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 text-center shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Hospital AI Handshake</p>
            <p className="text-3xl font-black text-amber-700">99.6%</p>
            <p className="text-[11px] text-slate-500">Zero diversion delays</p>
          </div>
        </div>

        {/* Ambulance Equipment */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" /> Assigned Ambulance: {ambulance.registrationNumber}
              </h3>
              <p className="text-xs text-slate-500">
                Type: {ambulance.type} (Advanced Life Support / ICU On Wheels)
              </p>
            </div>

            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 w-fit">
              Oxygen Level: {ambulance.oxygenLevel}% (Optimal)
            </span>
          </div>

          {/* Equipment Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Verified Onboard Medical Equipment Checklist
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ambulance.equipment.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3"
                >
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
