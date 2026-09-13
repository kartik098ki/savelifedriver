'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDriver } from '@/context/DriverContext';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Radio,
  Home,
  Wallet,
  Clock,
  User,
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const {
    driver,
    toggleOnlineStatus,
    isMuted,
    toggleMute,
    isVoiceEnabled,
    toggleVoice,
    setSosOpen,
  } = useDriver();

  const isOnline = driver.status === 'ONLINE';

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/earnings', label: 'Earnings', icon: Wallet },
    { href: '/trips', label: 'Trips', icon: Clock },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="lg:hidden bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-40 px-3 sm:px-5 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: SAVIFE Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-base shadow-sm">
              <span>S+</span>
            </div>
            <div>
              <span className="font-black text-base tracking-wider text-slate-900">SAVIFE</span>
              <span className="ml-1 text-[9px] uppercase font-black tracking-widest bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md border border-emerald-200">
                DRIVER
              </span>
            </div>
          </Link>

          {/* Nav Links for tablet */}
          <nav className="hidden sm:flex items-center gap-1 ml-2 border-l border-slate-200 pl-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Mute Toggle */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute siren' : 'Mute siren'}
            className={`p-1.5 rounded-xl text-xs transition-colors border ${
              isMuted
                ? 'bg-slate-100 border-slate-200 text-slate-400'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Voice Toggle */}
          <button
            onClick={toggleVoice}
            title={isVoiceEnabled ? 'Voice Active' : 'Voice Muted'}
            className={`p-1.5 rounded-xl text-xs transition-colors border ${
              !isVoiceEnabled
                ? 'bg-slate-100 border-slate-200 text-slate-400'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {isVoiceEnabled ? <Mic className="w-4 h-4 text-emerald-600" /> : <MicOff className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Online / Offline Toggle */}
          <button
            onClick={toggleOnlineStatus}
            className={`px-3 py-1.5 rounded-xl font-black text-xs tracking-wide transition-all shadow-sm flex items-center gap-1.5 ${
              isOnline
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
            }`}
          >
            <Radio className={`w-3 h-3 ${isOnline ? 'animate-pulse text-white' : 'text-slate-400'}`} />
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={() => setSosOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md border border-red-500"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
}

