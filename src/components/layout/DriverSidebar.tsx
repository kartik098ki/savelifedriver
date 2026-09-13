'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDriver } from '@/context/DriverContext';
import {
  Home,
  Wallet,
  Clock,
  User,
  ShieldAlert,
  Headphones,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  ShieldCheck,
  MapPinned,
} from 'lucide-react';

export default function DriverSidebar() {
  const pathname = usePathname();
  const {
    driver,
    toggleOnlineStatus,
    setSosOpen,
    isMuted,
    toggleMute,
    isVoiceEnabled,
    toggleVoice,
  } = useDriver();

  const isOnline = driver.status === 'ONLINE';

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/earnings', label: 'Earnings', icon: Wallet },
    { href: '/trips', label: 'Trips', icon: Clock },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-full lg:w-72 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none shadow-sm z-30">
      {/* Top Section */}
      <div className="p-5 space-y-5">
        {/* Brand & Quick Toggles */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <span>S+</span>
            </div>
            <div>
              <span className="font-black text-xl tracking-wider text-slate-900 block leading-tight">SAVIFE</span>
              <p className="text-[10px] uppercase font-black tracking-widest text-emerald-700">
                Ambulance Captain
              </p>
            </div>
          </Link>

          {/* Quick Sound/Voice Toggles */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute Siren Sound' : 'Mute Siren Sound'}
              className={`p-1.5 rounded-xl text-xs transition-all ${
                isMuted
                  ? 'bg-white text-slate-400 shadow-sm'
                  : 'bg-emerald-600 text-white shadow-sm'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleVoice}
              title={isVoiceEnabled ? 'Hindi Voice Active' : 'Hindi Voice Muted'}
              className={`p-1.5 rounded-xl text-xs transition-all ${
                !isVoiceEnabled
                  ? 'bg-white text-slate-400 shadow-sm'
                  : 'bg-emerald-600 text-white shadow-sm'
              }`}
            >
              {isVoiceEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Privacy-first duty controls — profile details live in the Profile screen. */}
        <div className="bg-gradient-to-b from-slate-50 to-white p-4 rounded-3xl border border-slate-200 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><MapPinned className="w-5 h-5" /></div>
            <div><p className="text-xs font-black">Live duty controls</p><p className="text-[10px] text-slate-500">GPS is shared only while online</p></div>
          </div>
          <button
            onClick={toggleOnlineStatus}
            className={`w-full py-2.5 px-3 rounded-2xl font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 border shadow-sm ${
              isOnline
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 ring-2 ring-emerald-500/10'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
              }`}
            />
            <span>{isOnline ? '🟢 YOU ARE ONLINE' : '⚪ GO ONLINE'}</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions: Customer Support & SOS */}
      <div className="p-5 border-t border-slate-200 space-y-2.5">
        <a
          href="tel:18001237284"
          className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-200"
        >
          <Headphones className="w-4 h-4 text-slate-600" />
          <span>Dispatch Control Support</span>
        </a>

        <button
          onClick={() => setSosOpen(true)}
          className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all active:scale-98"
        >
          <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
          <span>EMERGENCY SOS</span>
        </button>
      </div>
    </aside>
  );
}
