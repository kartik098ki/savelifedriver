'use client';

import React, { useState } from 'react';
import { useDriver } from '@/context/DriverContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, MessageCircle } from 'lucide-react';

export default function DriverChatModal() {
  const { isChatOpen, setChatOpen, chatMessages, sendChatMessage, booking } = useDriver();
  const [inputText, setInputText] = useState('');

  if (!isChatOpen) return null;

  const quickReplies = [
    'Main location par pahunch gaya hoon.',
    'Traffic ki wajah se 2 minute lagenge.',
    'Kripya gate ke bahar aa jayein.',
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText);
    setInputText('');
  };

  const handleQuickSend = (text: string) => {
    sendChatMessage(text);
  };

  // OTPs and other verification codes never belong in chat.
  const visibleMessages = chatMessages.filter((message) => !/(\botp\b|one[- ]time password|verification code)/i.test(message.text));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px] max-h-[85vh] text-slate-900 border border-slate-200"
        >
          {/* Header */}
          <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-tight">
                  {booking?.patient.name || 'Rahul Sharma'}
                </h3>
                <p className="text-[10px] text-emerald-100">Customer • Sector 62, Noida</p>
              </div>
            </div>

            <button
              onClick={() => setChatOpen(false)}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            {visibleMessages.map((msg) => {
              const isDriver = msg.sender === 'driver';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isDriver ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${
                      isDriver
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              );
            })}
          </div>

          {/* Quick Replies */}
          <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => handleQuickSend(reply)}
                className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[11px] font-semibold rounded-full border border-slate-200 transition-colors shrink-0"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type message to customer..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 py-2 px-3.5 bg-slate-100 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 border border-slate-200"
            />
            <button
              type="submit"
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
