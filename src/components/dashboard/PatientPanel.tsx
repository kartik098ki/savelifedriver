'use client';

import React, { useState, useRef } from 'react';
import { useDriver } from '@/context/DriverContext';
import {
  User,
  PhoneCall,
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  Building2,
  MapPin,
  Star,
  ArrowRight,
  Navigation,
  Check,
  CreditCard,
  Banknote,
  ChevronRight,
  HeartPulse,
  Share2,
  Radio,
  Sparkles,
  RotateCcw,
  QrCode,
  ThumbsUp,
} from 'lucide-react';
import { formatCurrency, formatDistance, formatDuration } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ReachedSwipe from './ReachedSwipe';

export default function PatientPanel() {
  const {
    tripStatus,
    booking,
    verifyPatientOtp,
    confirmArrivalAtCustomer,
    swipeArrivalAtCustomer,
    selectedHospital,
    swipeToComplete,
    confirmPayment,
    submitRating,
    finishTrip,
    setChatOpen,
    setSosOpen,
    remainingDistanceKm,
    remainingEtaMinutes,
    selectedPaymentMethod,
    customerRating,
    currentLocation,
  } = useDriver();

  // OTP State: Initialized EMPTY (NO auto-fill!)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Arrival Swipe state
  const [arrivalProgress, setArrivalProgress] = useState<number>(0);
  const [isArrivalSwiping, setIsArrivalSwiping] = useState<boolean>(false);
  const arrivalContainerRef = useRef<HTMLDivElement>(null);

  // Completion Swipe state
  const [swipeProgress, setSwipeProgress] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const swipeContainerRef = useRef<HTMLDivElement>(null);

  // Local payment and rating states
  const [paymentChoice, setPaymentChoice] = useState<'CASH' | 'UPI'>('CASH');
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [selectedFeedbackChips, setSelectedFeedbackChips] = useState<string[]>(['Quick Handover']);

  const feedbackOptions = [
    'Quick Handover',
    'Polite Attendant',
    'Ready at Gate',
    'Clear Directions',
  ];

  const toggleFeedbackChip = (chip: string) => {
    if (selectedFeedbackChips.includes(chip)) {
      setSelectedFeedbackChips(selectedFeedbackChips.filter((c) => c !== chip));
    } else {
      setSelectedFeedbackChips([...selectedFeedbackChips, chip]);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);
    setOtpError(null);

    // Focus next input
    if (val && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 4) {
      setOtpError('Please enter all 4 digits of the OTP.');
      return;
    }

    setIsVerifying(true);
    setOtpError(null);

    const result = await verifyPatientOtp(fullOtp);
    setIsVerifying(false);

    if (!result.success) {
      setOtpError(result.error || 'Invalid OTP code. Please verify with customer.');
    }
  };

  // Drag handler for Arrival Swipe
  const handleArrivalTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isArrivalSwiping || !arrivalContainerRef.current) return;
    const rect = arrivalContainerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const relativeX = clientX - rect.left - 24;
    const maxDrag = rect.width - 68;
    const clamped = Math.max(0, Math.min(relativeX, maxDrag));
    const ratio = clamped / maxDrag;
    setArrivalProgress(ratio);

    if (ratio >= 0.88) {
      setIsArrivalSwiping(false);
      setArrivalProgress(1);
      swipeArrivalAtCustomer();
    }
  };

  const handleArrivalTouchEnd = () => {
    if (arrivalProgress < 0.88) {
      setArrivalProgress(0);
    }
    setIsArrivalSwiping(false);
  };

  // Drag handler for swipe to complete
  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isSwiping || !swipeContainerRef.current) return;
    const rect = swipeContainerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const relativeX = clientX - rect.left - 24;
    const maxDrag = rect.width - 68;
    const clamped = Math.max(0, Math.min(relativeX, maxDrag));
    const ratio = clamped / maxDrag;
    setSwipeProgress(ratio);

    if (ratio >= 0.88) {
      setIsSwiping(false);
      setSwipeProgress(1);
      swipeToComplete();
    }
  };

  const handleTouchEnd = () => {
    if (swipeProgress < 0.88) {
      setSwipeProgress(0);
    }
    setIsSwiping(false);
  };

  // Idle / Searching state
  if (!booking || tripStatus === 'OFFLINE' || tripStatus === 'AVAILABLE' || tripStatus === 'BOOKING_RECEIVED') {
    return (
      <aside className="hidden lg:flex w-96 flex-col justify-between p-6 bg-white border-l border-slate-200 text-slate-500 shadow-sm select-none">
        <div className="space-y-6">
          {/* Radar Status Header */}
          <div className="bg-gradient-to-b from-emerald-50/70 to-white p-5 rounded-3xl border border-emerald-200 text-center space-y-3 relative overflow-hidden">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border border-emerald-400/40" />
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 z-10">
                <Radio className="w-7 h-7 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Dispatch Radar
              </div>
              <h3 className="font-black text-slate-900 text-lg">Sector 62, Noida Hub</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ambulance ICU readiness verified. High priority dispatch active.
              </p>
            </div>
          </div>

          {/* Quick Telemetry Cards */}
          <div className="space-y-2.5">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Current Station</p>
                  <p className="font-extrabold text-xs text-slate-800">Sector 62 Police Post</p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-sky-50 text-sky-700 px-2 py-0.5 rounded-lg border border-sky-200">
                PRIMARY
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">NCR Hospital Network</p>
                  <p className="font-extrabold text-xs text-slate-800">Fortis, Jaypee, Max Ready</p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-200">
                12 ICU BEDS
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Helper Note */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
          <p className="text-[11px] font-bold text-slate-600">
            Keep your phone volume up. Emergency trip announcements will play in your chosen language.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full lg:w-[400px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between h-full overflow-y-auto text-slate-900 p-5 shadow-2xl z-20">
      <div className="space-y-4">
        {/* ========================================================= */}
        {/* 1. BEFORE OTP: En route to customer */}
        {/* ========================================================= */}
        {(tripStatus === 'ACCEPTED' || tripStatus === 'EN_ROUTE_TO_CUSTOMER') && (
          <div className="space-y-4">
            {/* Customer Overview Card */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl border border-slate-200">
                  Customer Pickup
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-700 px-2.5 py-1 rounded-xl border border-red-200 flex items-center gap-1">
                  <HeartPulse className="w-3.5 h-3.5 text-red-600" />
                  {booking.patient.medicalCondition}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">{booking.patient.name}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Sector 62, Noida (Near Block B Gate)</span>
                </p>
              </div>

              {/* Action Buttons: Call Customer & Chat */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                <a
                  href={`tel:${booking.patient.phone}`}
                  className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Customer</span>
                </a>

                <button
                  onClick={() => setChatOpen(true)}
                  className="py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-slate-600" />
                  <span>Chat ({booking.patient.phone.slice(-4)})</span>
                </button>
              </div>
            </div>

            {/* Slide to Confirm Arrival at Pickup */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <p className="text-[11px] font-black text-slate-500 uppercase">
                  Arriving at Customer
                </p>
                <button
                  onClick={swipeArrivalAtCustomer}
                  className="text-[10px] font-bold text-emerald-700 hover:underline"
                >
                  (Tap fallback)
                </button>
              </div>

              <div
                ref={arrivalContainerRef}
                onMouseMove={handleArrivalTouchMove}
                onMouseUp={handleArrivalTouchEnd}
                onTouchMove={handleArrivalTouchMove}
                onTouchEnd={handleArrivalTouchEnd}
                className="relative h-16 bg-slate-100 border-2 border-emerald-500 rounded-3xl overflow-hidden flex items-center px-2 select-none shadow-inner"
              >
                <div
                  style={{ width: `${arrivalProgress * 100}%` }}
                  className="absolute inset-y-0 left-0 bg-emerald-500/20 pointer-events-none transition-all"
                />

                <span className="w-full text-center text-xs font-black text-emerald-800 tracking-wider">
                  SLIDE WHEN ARRIVED AT PICKUP →
                </span>

                <motion.div
                  onMouseDown={() => setIsArrivalSwiping(true)}
                  onTouchStart={() => setIsArrivalSwiping(true)}
                  style={{ x: arrivalProgress * 230 }}
                  className="absolute left-2 w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md cursor-grab active:cursor-grabbing z-10"
                >
                  <ChevronRight className="w-6 h-6 animate-pulse" />
                </motion.div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* 2. ARRIVED AT PICKUP & MANUAL OTP ENTRY */}
        {/* ========================================================= */}
        {(tripStatus === 'ARRIVED_AT_CUSTOMER' || tripStatus === 'OTP_PENDING') && (
          <div className="space-y-4">
            <div className="bg-emerald-600 text-white p-4 rounded-2xl flex items-center gap-3 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-white text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-100">
                  Arrived at Pickup
                </p>
                <p className="text-sm font-extrabold text-white">Ask customer for 4-digit OTP</p>
              </div>
            </div>

            {/* Customer Contact Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Patient / Attendant</span>
                <p className="font-extrabold text-base text-slate-900">{booking.patient.name}</p>
                <p className="text-[11px] text-slate-500">{booking.patient.phone}</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${booking.patient.phone}`}
                  className="p-3 rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setChatOpen(true)}
                  className="p-3 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* OTP Form */}
            <div className="bg-white p-5 rounded-3xl border-2 border-emerald-500 space-y-4 shadow-lg shadow-emerald-950/5">
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  RIDE VERIFICATION
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-2">
                  Enter 4-Digit Customer OTP
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Display on customer app screen
                </p>
              </div>

              {/* 4 Large Digit Inputs */}
              <div className="flex justify-center gap-3 py-1">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={otpDigits[idx]}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    placeholder="•"
                    className="w-14 h-16 text-center text-3xl font-black rounded-2xl bg-slate-50 border-2 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300"
                  />
                ))}
              </div>

              {otpError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-bold text-red-600 text-center bg-red-50 p-2.5 rounded-xl border border-red-200"
                >
                  {otpError}
                </motion.div>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={isVerifying}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                <span>{isVerifying ? 'VERIFYING WITH SERVER...' : 'CONFIRM OTP & START TRIP'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. PATIENT VERIFIED / DISCOVERING HOSPITALS */}
        {/* ========================================================= */}
        {(tripStatus === 'PATIENT_VERIFIED' || tripStatus === 'HOSPITAL_SEARCH') && (
          <div className="space-y-4 text-center py-8">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9 animate-bounce" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-xl">Patient Onboard</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                OTP verified successfully. AI is finding optimal emergency hospitals with ready ICU beds...
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. HOSPITAL CONFIRMED & EN ROUTE TO HOSPITAL */}
        {/* ========================================================= */}
        {(tripStatus === 'HOSPITAL_SELECTED' ||
          tripStatus === 'HOSPITAL_CONFIRMATION' ||
          tripStatus === 'EN_ROUTE_TO_HOSPITAL') &&
          selectedHospital && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl border-2 border-emerald-500 p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Destination
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-xl border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> ICU Ready
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900">{selectedHospital.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{selectedHospital.address}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">ICU Beds</span>
                    <span className="font-black text-emerald-700">{selectedHospital.icuBedCount || 4} Available</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Trauma Care</span>
                    <span className="font-black text-slate-800">{selectedHospital.specialties[0] || 'Level 1 Trauma'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Emergency Bay Hotline</p>
                    <p className="font-extrabold text-xs text-slate-800">{selectedHospital.phone}</p>
                  </div>

                  <a
                    href={`tel:${selectedHospital.phone}`}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Bay</span>
                  </a>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center space-y-1">
                <p className="text-xs font-black text-emerald-900 flex items-center justify-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  Navigating to {selectedHospital.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  Green traffic wave priority active.
                </p>
              </div>
            </div>
          )}

        {/* ========================================================= */}
        {/* 5. ARRIVED AT HOSPITAL & SWIPE TO COMPLETE RIDE */}
        {/* ========================================================= */}
        {tripStatus === 'ARRIVED_AT_HOSPITAL' && selectedHospital && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-5 rounded-3xl text-center space-y-1 shadow-lg">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200 bg-white/20 px-3 py-0.5 rounded-full">
                Destination Reached
              </span>
              <h3 className="text-xl font-black text-white mt-1">ARRIVED AT HOSPITAL</h3>
              <p className="text-xs text-emerald-100">{selectedHospital.name}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Trip Fare</p>
                <p className="text-xs text-slate-500">Includes Emergency ALS Incentive</p>
              </div>
              <p className="text-3xl font-black text-emerald-800">{formatCurrency(booking.fare)}</p>
            </div>

            {/* Premium Interactive Swipe-to-Complete Control */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-[11px] font-black text-slate-500 uppercase">
                  Complete Handoff
                </p>
                <button
                  onClick={swipeToComplete}
                  className="text-[10px] font-bold text-emerald-700 hover:underline"
                >
                  (Tap fallback)
                </button>
              </div>

              <div
                ref={swipeContainerRef}
                onMouseMove={handleTouchMove}
                onMouseUp={handleTouchEnd}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative h-16 bg-slate-100 border-2 border-emerald-500 rounded-3xl overflow-hidden flex items-center px-2 select-none shadow-inner"
              >
                <div
                  style={{ width: `${swipeProgress * 100}%` }}
                  className="absolute inset-y-0 left-0 bg-emerald-500/20 pointer-events-none transition-all"
                />

                <span className="w-full text-center text-xs font-black text-emerald-800 tracking-wider">
                  SLIDE TO COMPLETE RIDE →
                </span>

                <motion.div
                  onMouseDown={() => setIsSwiping(true)}
                  onTouchStart={() => setIsSwiping(true)}
                  style={{ x: swipeProgress * 230 }}
                  className="absolute left-2 w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md cursor-grab active:cursor-grabbing z-10"
                >
                  <ChevronRight className="w-6 h-6 animate-pulse" />
                </motion.div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. PAYMENT AFTER COMPLETION */}
        {/* ========================================================= */}
        {tripStatus === 'PAYMENT_PENDING' && (
          <div className="space-y-4">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                Payment Collection
              </span>
              <h3 className="text-xl font-black text-slate-900">RIDE COMPLETED</h3>
              <p className="text-3xl font-black text-emerald-700 mt-2">
                {formatCurrency(booking.fare)}
              </p>
            </div>

            {/* Payment Mode Selection */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Select Payment Mode</p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setPaymentChoice('CASH')}
                  className={`p-4 rounded-2xl border-2 text-xs font-black flex items-center justify-center gap-2 transition-all ${
                    paymentChoice === 'CASH'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>CASH</span>
                </button>

                <button
                  onClick={() => setPaymentChoice('UPI')}
                  className={`p-4 rounded-2xl border-2 text-xs font-black flex items-center justify-center gap-2 transition-all ${
                    paymentChoice === 'UPI'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI / QR CODE</span>
                </button>
              </div>
            </div>

            {paymentChoice === 'UPI' && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center space-y-1">
                <p className="text-[11px] font-bold text-slate-700">Scan SAVIFE Driver QR on Dashboard</p>
                <p className="text-[10px] text-slate-400 font-mono">UPI ID: savife.driver.raj@icici</p>
              </div>
            )}

            <button
              onClick={() => confirmPayment(paymentChoice)}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/30 transition-all"
            >
              {paymentChoice === 'CASH' ? 'CASH RECEIVED (₹450)' : 'CONFIRM UPI PAYMENT'}
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* 7. CUSTOMER RATING */}
        {/* ========================================================= */}
        {tripStatus === 'RATING_PENDING' && (
          <div className="space-y-5 text-center py-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
                Rate Experience
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">How was the customer?</h3>
              <p className="text-xs text-slate-500 mt-0.5">{booking.patient.name}</p>
            </div>

            {/* 1-5 Interactive Star Picker */}
            <div className="flex justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedStars(star)}
                  className="p-1 transition-transform hover:scale-125 active:scale-95"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= selectedStars
                        ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Feedback Quick Tags */}
            <div className="space-y-1.5 text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase text-center">Quick Feedback</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {feedbackOptions.map((chip) => {
                  const isSelected = selectedFeedbackChips.includes(chip);
                  return (
                    <button
                      key={chip}
                      onClick={() => toggleFeedbackChip(chip)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => submitRating(selectedStars)}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/30 transition-all"
            >
              SUBMIT RATING ({selectedStars} ★)
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* 8. FINAL TRIP SUMMARY */}
        {/* ========================================================= */}
        {tripStatus === 'COMPLETED' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-5 rounded-3xl text-center shadow-lg">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">
                Mission Finished
              </span>
              <h3 className="text-2xl font-black mt-0.5">TRIP COMPLETED</h3>
              <p className="text-xs text-emerald-100 mt-1">₹450 credited to your Driver Wallet</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-400 font-medium">Pickup:</span>
                <span className="font-extrabold text-slate-900">Sector 62, Noida</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-400 font-medium">Hospital:</span>
                <span className="font-extrabold text-emerald-800">
                  {selectedHospital?.name || 'Fortis Hospital'}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-400 font-medium">Distance:</span>
                <span className="font-extrabold text-slate-900">8.4 km</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-400 font-medium">Duration:</span>
                <span className="font-extrabold text-slate-900">22 min</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-400 font-medium">Fare Collected:</span>
                <span className="font-black text-emerald-700 text-base">
                  {formatCurrency(booking.fare)}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-400 font-medium">Payment Mode:</span>
                <span className="font-extrabold text-slate-900">{selectedPaymentMethod}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-400 font-medium">Rating Given:</span>
                <span className="font-extrabold text-amber-600 flex items-center gap-0.5">
                  {'★'.repeat(customerRating)}
                </span>
              </div>
            </div>

            <button
              onClick={finishTrip}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>RETURN TO DISPATCH RADAR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Emergency SOS Quick Button at Bottom during active trips */}
      {tripStatus !== 'COMPLETED' && tripStatus !== 'RATING_PENDING' && (
        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={() => setSosOpen(true)}
            className="w-full py-3 px-4 rounded-2xl bg-red-50 hover:bg-red-100 active:scale-98 text-red-700 font-extrabold text-xs flex items-center justify-center gap-2 border border-red-200 transition-all"
          >
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Emergency SOS Support</span>
          </button>
        </div>
      )}
    </aside>
  );
}
