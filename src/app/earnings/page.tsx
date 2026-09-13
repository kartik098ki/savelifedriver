'use client';

import React from 'react';
import DriverSidebar from '@/components/layout/DriverSidebar';
import { useDriver } from '@/context/DriverContext';
import { INITIAL_EARNINGS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Award,
  ArrowDownLeft,
} from 'lucide-react';

export default function EarningsPage() {
  const { earnings: liveEarnings } = useDriver();
  const baseEarnings = INITIAL_EARNINGS;
  const maxAmount = Math.max(...baseEarnings.weeklyEarnings.map((d) => d.amount));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Left Sidebar */}
      <div className="hidden lg:flex shrink-0 h-full">
        <DriverSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto text-slate-900">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                    Financial Overview
                  </span>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900">Driver Earnings & Payouts</h1>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Settlement records for Ambulance DL 01 AB 1234
              </p>
            </div>

            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 w-fit">
              <ArrowDownLeft className="w-4 h-4" /> Instant Bank Withdrawal
            </button>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Earnings</p>
              <p className="text-2xl md:text-3xl font-black text-emerald-700">
                {formatCurrency(liveEarnings.todayEarnings)}
              </p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +14% vs yesterday
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Trips</p>
              <p className="text-2xl md:text-3xl font-black text-slate-900">{liveEarnings.completedTrips}</p>
              <p className="text-[11px] text-slate-500">Verified missions</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Online Hours</p>
              <p className="text-2xl md:text-3xl font-black text-sky-700">{liveEarnings.onlineHours}</p>
              <p className="text-[11px] text-slate-500">Shift started 04:00 AM</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Trip Fare</p>
              <p className="text-2xl md:text-3xl font-black text-amber-700">
                {formatCurrency(baseEarnings.averageTripFare)}
              </p>
              <p className="text-[11px] text-slate-500">Emergency baseline</p>
            </div>
          </div>

          {/* Weekly Earnings Graph */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" /> Weekly Earnings Trend
                </h3>
                <p className="text-xs text-slate-500">Sep 07 - Sep 13, 2026</p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                7-Day Average: ₹3,178 / day
              </span>
            </div>

            {/* Bar Chart */}
            <div className="pt-6 pb-2 grid grid-cols-7 gap-2 md:gap-4 items-end h-48 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {baseEarnings.weeklyEarnings.map((day) => {
                const heightPercent = Math.round((day.amount / maxAmount) * 100);
                const isToday = day.day === 'Sun';
                return (
                  <div key={day.day} className="flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-bold text-slate-500 hidden sm:block">
                      ₹{day.amount}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[44px] rounded-t-xl transition-all ${
                        isToday
                          ? 'bg-emerald-600 shadow-md'
                          : 'bg-slate-200 hover:bg-slate-300'
                      }`}
                    />
                    <span className={`text-xs font-bold ${isToday ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct Bank Settlements */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-sky-600" /> Direct Bank Settlements
            </h3>

            <div className="space-y-3">
              {baseEarnings.recentPayouts.map((pay) => (
                <div
                  key={pay.id}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-slate-900">HDFC Bank Direct Deposit</p>
                      <p className="text-xs text-slate-500">{pay.date} • Reference: {pay.id}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-base text-emerald-700">{formatCurrency(pay.amount)}</p>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {pay.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

