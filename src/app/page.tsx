'use client';

import React from 'react';
import DriverSidebar from '@/components/layout/DriverSidebar';
import LiveMap from '@/components/map/LiveMap';
import NavigationInstructionCard from '@/components/dashboard/NavigationInstructionCard';
import PatientPanel from '@/components/dashboard/PatientPanel';
import TopIncomingBookingBanner from '@/components/dashboard/TopIncomingBookingBanner';
import HospitalDiscoveryModal from '@/components/dashboard/HospitalDiscoveryModal';
import HospitalAgentOverlay from '@/components/dashboard/HospitalAgentOverlay';
import DriverChatModal from '@/components/dashboard/DriverChatModal';
import EmergencySOSModal from '@/components/dashboard/EmergencySOSModal';
import PickupOtpPanel from '@/components/dashboard/PickupOtpPanel';
import { useDriver } from '@/context/DriverContext';
import { Radio } from 'lucide-react';

export default function DriverDashboardPage() {
  const { tripStatus, toggleOnlineStatus } = useDriver();

  const isOffline = tripStatus === 'OFFLINE';

  return (
    <main className="relative flex-1 flex flex-col lg:flex-row h-screen lg:h-screen overflow-hidden bg-slate-100">
      {/* 1. LEFT SIDEBAR (SAVIFE, Driver Profile, Navigation, Compact Earnings, SOS/Support) */}
      <div className="hidden lg:flex shrink-0 h-full">
        <DriverSidebar />
      </div>

      {/* 2. CENTER MAP-FIRST AREA */}
      <div className="relative flex-1 h-full min-h-[360px] bg-slate-100">
        {/* Turn-by-Turn Navigation HUD */}
        <NavigationInstructionCard />
        <PickupOtpPanel />

        {/* Live Navigation Map */}
        <LiveMap />

        {/* Offline Overlay Banner */}
        {isOffline && (
          <div className="absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-slate-900 space-y-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center max-w-sm space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Radio className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">You are Offline</h3>
              <p className="text-xs text-slate-500">
                Go online to start receiving instant emergency ambulance requests across Sector 62, Noida.
              </p>
              <button
                onClick={toggleOnlineStatus}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-sm text-white tracking-wide shadow-lg transition-all active:scale-98"
              >
                GO ONLINE NOW
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. RIGHT STATE ACTION PANEL */}
      <PatientPanel />

      {/* Top Slide-Down Incoming Booking Request (From, To, Fare & 5s Timer) */}
      <TopIncomingBookingBanner />

      {/* AI Hospital Recommendations Sheet */}
      <HospitalDiscoveryModal />

      {/* Automated AI Hospital Calling & Auto-Reroute Alert */}
      <HospitalAgentOverlay />

      {/* Driver-Customer Chat Modal */}
      <DriverChatModal />

      {/* Emergency SOS Modal */}
      <EmergencySOSModal />
    </main>
  );
}
