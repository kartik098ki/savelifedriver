'use client';

import React, { useRef, useState } from 'react';
import { CheckCircle2, KeyRound, PhoneCall, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDriver } from '@/context/DriverContext';

export default function PickupOtpPanel() {
  const { tripStatus, booking, verifyPatientOtp } = useDriver();
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  if (tripStatus !== 'OTP_PENDING' || !booking) return null;

  const verify = async () => {
    const otp = digits.join('');
    if (otp.length !== 4) return setError('Enter all 4 digits from the customer app.');
    setLoading(true); setError('');
    const result = await verifyPatientOtp(otp);
    setLoading(false);
    if (!result.success) setError(result.error || 'OTP could not be verified.');
  };

  return <motion.section initial={{ x: -18, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="absolute top-24 left-5 z-[700] w-[min(360px,calc(100%-2.5rem))] rounded-[28px] bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl overflow-hidden">
    <div className="bg-slate-950 px-5 py-4 text-white flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center"><KeyRound className="w-5 h-5" /></div>
      <div><p className="text-[10px] text-emerald-300 font-black tracking-[.16em] uppercase">Pickup confirmed</p><h2 className="font-black text-sm">Verify customer OTP</h2></div>
    </div>
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 border border-slate-100"><div><p className="text-[10px] text-slate-400 font-black uppercase">Customer</p><p className="text-sm font-black text-slate-900">{booking.patient.name}</p></div><a aria-label="Call customer" href={`tel:${booking.patient.phone}`} className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center"><PhoneCall className="w-4 h-4" /></a></div>
      <p className="text-xs text-slate-600">Ask the customer for the code shown in their app. It is never displayed to the driver.</p>
      <div className="flex justify-between gap-2">{digits.map((digit, i) => <input key={i} ref={(node) => { refs.current[i] = node; }} value={digit} onChange={(e) => { if (!/^\d?$/.test(e.target.value)) return; const next = [...digits]; next[i] = e.target.value; setDigits(next); setError(''); if (e.target.value) refs.current[i + 1]?.focus(); }} onKeyDown={(e) => { if (e.key === 'Backspace' && !digits[i]) refs.current[i - 1]?.focus(); }} inputMode="numeric" maxLength={1} className="w-14 h-16 rounded-2xl bg-slate-50 text-center text-2xl font-black border-2 border-slate-200 focus:border-emerald-500 focus:outline-none" />)}</div>
      {error && <p className="rounded-xl bg-red-50 text-red-700 border border-red-100 p-2 text-xs font-bold">{error}</p>}
      <button disabled={loading} onClick={verify} className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 py-3.5 text-white text-xs font-black flex items-center justify-center gap-2"><ShieldCheck className="w-4 h-4" />{loading ? 'VERIFYING…' : 'VERIFY & START AI HOSPITAL SEARCH'}</button>
    </div>
  </motion.section>;
}
