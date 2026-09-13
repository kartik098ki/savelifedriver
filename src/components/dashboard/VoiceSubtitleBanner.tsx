'use client';

import React, { useState, useEffect } from 'react';
import { voiceService } from '@/services/voice-service';
import { useDriver } from '@/context/DriverContext';
import { Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoiceSubtitleBanner() {
  const { isVoiceEnabled, toggleVoice, appLanguage } = useDriver();
  const [subtitle, setSubtitle] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const unsub = voiceService.onSubtitle((text) => {
      setSubtitle(text);
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 7000);
      return () => clearTimeout(timer);
    });
    return unsub;
  }, []);

  if (!visible || !subtitle) return null;

  const langLabel =
    appLanguage === 'hi' ? 'Hindi Voice' : appLanguage === 'hinglish' ? 'Hinglish Voice' : 'English Voice';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="fixed top-20 inset-x-0 z-40 flex justify-center px-4 pointer-events-none"
      >
        <div className="bg-slate-900/95 backdrop-blur-md text-white border border-emerald-500/40 rounded-2xl shadow-2xl shadow-emerald-950/30 px-4 py-2.5 max-w-lg w-full flex items-center justify-between gap-3 pointer-events-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-400">
              <Volume2 className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                <Sparkles className="w-3 h-3" />
                <span>Gnani AI • {langLabel}</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-100 truncate leading-snug">
                &ldquo;{subtitle}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => voiceService.replayLast()}
              title="Replay Audio"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleVoice}
              title={isVoiceEnabled ? 'Mute Audio' : 'Unmute Audio'}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            >
              {isVoiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
