'use client';

import React, { useState } from 'react';
import DriverSidebar from '@/components/layout/DriverSidebar';
import { SAMPLE_TRIP_HISTORY } from '@/lib/constants';
import { formatCurrency, formatDistance, formatDuration } from '@/lib/utils';
import {
  Clock,
  CheckCircle2,
  MapPin,
  Hospital,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';

export default function TripsHistoryPage() {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'Completed' | 'Hospital Redirected' | 'CRITICAL'>('ALL');

  const filteredTrips = SAMPLE_TRIP_HISTORY.filter((trip) => {
    if (activeFilter === 'Completed') return trip.status === 'Completed';
    if (activeFilter === 'Hospital Redirected') return trip.status === 'Hospital Redirected';
    if (activeFilter === 'CRITICAL') return trip.emergencyLevel === 'CRITICAL';
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Left Sidebar */}
      <div className="hidden lg:flex shrink-0 h-full">
        <DriverSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto text-slate-900">
        <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                  Mission Audit Log
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900">Trip & Dispatch History</h1>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Verified records with server-side OTP audit and hospital interaction timelines
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 text-xs shadow-sm">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeFilter === 'ALL' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All (5)
            </button>
            <button
              onClick={() => setActiveFilter('Completed')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeFilter === 'Completed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveFilter('Hospital Redirected')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeFilter === 'Hospital Redirected'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AI Rerouted
            </button>
            <button
              onClick={() => setActiveFilter('CRITICAL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeFilter === 'CRITICAL'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Critical
            </button>
          </div>
        </div>

        {/* Trips List */}
        <div className="space-y-4">
          {filteredTrips.map((trip) => {
            const isRerouted = trip.status === 'Hospital Redirected';
            return (
              <div
                key={trip.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 space-y-4 shadow-sm hover:border-emerald-300 transition-all"
              >
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {trip.bookingId}
                    </span>
                    <span className="text-xs text-slate-500">{trip.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isRerouted && (
                      <span className="text-[11px] font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-xl border border-amber-200 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" /> AI Rerouted
                      </span>
                    )}

                    <span
                      className={`text-[11px] font-extrabold px-3 py-1 rounded-xl border flex items-center gap-1.5 ${
                        trip.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {trip.status}
                    </span>
                  </div>
                </div>

                {/* Patient & Route Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-600" />
                        <span className="font-extrabold text-sm text-slate-900">{trip.patientName}</span>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                          trip.emergencyLevel === 'CRITICAL'
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}
                      >
                        {trip.emergencyLevel}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs pt-1">
                      <div className="flex items-start gap-2 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>Pickup: {trip.pickupAddress}</span>
                      </div>
                      <div className="flex items-start gap-2 text-emerald-800 font-bold">
                        <Hospital className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>Destination: {trip.hospitalName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry & Earnings */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <p className="text-[10px] text-slate-400">Distance</p>
                        <p className="font-black text-slate-800">{formatDistance(trip.distanceKm)}</p>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <p className="text-[10px] text-slate-400">Duration</p>
                        <p className="font-black text-slate-800">{formatDuration(trip.durationMinutes)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs">
                      <span className="text-slate-500 font-medium">Driver Earnings:</span>
                      <span className="font-black text-base text-emerald-700">
                        {formatCurrency(trip.driverEarnings)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Audit Confirmation */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" /> OTP 4-Digit Handshake Verified
                  </span>
                  <span>Direct settlement credited to Driver Wallet</span>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </main>
    </div>
  );
}
