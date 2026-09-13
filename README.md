# 🚑 SAVIFE Ambulance Driver Application & Emergency Dispatch System

> **Production-Grade Emergency Ambulance Driver & First-Responder Platform**  
> Built for rapid clinical triage, real-time GPS waypoint navigation, automated **Gnani.ai Indic Voice Guidance**, **Autonomous AI Hospital Telephony Calling Agents**, and frictionless ride lifecycle management.

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.35-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Gnani.ai Voice](https://img.shields.io/badge/Gnani.ai-Indic_Voice_&_Telephony-emerald?style=flat-square)](https://gnani.ai/)
[![OpenAI / LLM](https://img.shields.io/badge/OpenAI%20%2F%20Gemini-Clinical_Triage_AI-orange?style=flat-square)](https://openai.com/)

---

## 🤖 Deep Dive: AI & Gnani.ai Integrations

SAVIFE leverages specialized Artificial Intelligence modules at every stage of the emergency response pipeline. Below is the exact breakdown of **where, why, and how Gnani.ai and other AI systems are used in the codebase**:

```
                                  SAVIFE AI ECOSYSTEM
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │   1. GNANI.AI INDIC VOICE ASSISTANT                                                   │
  │      ├─ [File: src/services/voice-service.ts]                                          │
  │      ├─ [File: src/app/api/voice/speak/route.ts]                                       │
  │      └─ Natural Hindi / Hinglish / English voice synthesis for hands-free driving      │
  │                                                                                        │
  │   2. GNANI.AI TELEPHONY CALLING AGENT (ER Pre-Admission)                               │
  │      ├─ [File: src/services/hospital-agent-service.ts]                                  │
  │      ├─ [File: src/app/api/ai/hospital-agent/route.ts]                                 │
  │      ├─ [File: src/components/dashboard/HospitalAgentOverlay.tsx]                     │
  │      └─ Autonomous voice bot calls Hospital ER desks to reserve beds & doctors        │
  │                                                                                        │
  │   3. LLM CLINICAL TRIAGE & HOSPITAL MATCHING (OpenAI / Gemini / Heuristics)            │
  │      ├─ [File: src/services/ai-service.ts]                                             │
  │      ├─ [File: src/app/api/ai/hospital-recommendations/route.ts]                       │
  │      └─ Matches patient vitals (ECG/SpO2) against live ICU/Cath Lab telemetry          │
  │                                                                                        │
  │   4. REAL-TIME GPS & TRAFFIC-AWARE ROUTING ENGINE                                      │
  │      ├─ [File: src/services/map-service.ts]                                             │
  │      ├─ [File: src/context/DriverContext.tsx]                                          │
  │      └─ Multi-waypoint simulation, speed telemetry, and turn-by-turn ETA calculations   │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 1. 🎙️ Gnani.ai Indic Voice Guidance Assistant
- **Where in Codebase**:
  - `src/services/voice-service.ts`: Client-side audio synthesizers with dialect handling.
  - `src/app/api/voice/speak/route.ts`: Server-side endpoint integrating **Gnani TTS API** with fallback to Web Speech.
  - `src/context/DriverContext.tsx`: Auto-triggers spoken notifications upon status changes.
- **How it works**:
  Ambulance drivers navigate through chaotic traffic where taking eyes off the road to look at phone screens is dangerous. Gnani.ai provides low-latency, clear, and high-fidelity Indic voice guidance:
  - **Incoming Dispatch Alert**: *"Sector 62 se Fortis Hospital jaana hai. Guaranteed fare ₹450 hai."*
  - **Pickup Arrival**: *"Aap pickup location par pahunch gaye hain. Kripya customer ka 4-digit OTP enter karein."*
  - **Hospital Bed Confirmed**: *"Fortis Hospital ne patient ko receive karne ki confirmation de di hai. Route start kar rahe hain."*
  - **Trip Completion**: *"Trip complete ho gayi hai. Fare ₹450 add ho gaya hai."*
- **Language Dialects Supported**:
  - `hi` (Pure Hindi)
  - `hinglish` (Colloquial Hindi-English blend for urban drivers)
  - `en` (English)

---

### 2. 📞 Gnani.ai Conversational Telephony Calling Agent (ER Pre-Arrival)
- **Where in Codebase**:
  - `src/services/hospital-agent-service.ts`: Autonomous calling logic, prompt generator, and call history logger.
  - `src/app/api/ai/hospital-agent/route.ts`: Server API handling telephone bot sessions.
  - `src/components/dashboard/HospitalAgentOverlay.tsx`: Real-time driver HUD displaying live AI-to-Hospital transcript, bed reservation confirmation, and doctor standby notes.
- **How it works**:
  While the driver is transporting the patient, the AI Telephony Agent autonomously calls the emergency desk of the selected hospital:
  1. **Initiation**: Informs the hospital of incoming patient vitals (*"SAVIFE Ambulance DL 01 AB 1234 en-route with HIGH priority cardiac patient (44M, suspected NSTEMI, SpO2 91%). ETA 8 mins."*).
  2. **Bed & Team Reservation**: Confirms **ICU Bed reservation** and **Interventional Cardiologist on-call standby**.
  3. **Automated Fallback Rerouting**: If the contacted hospital reports 100% ICU occupancy or Cath Lab downtime, the agent automatically rejects the admission, updates driver navigation to the secondary nearest facility (e.g., Jaypee Hospital), and dials the next facility seamlessly.

---

### 3. 🧠 LLM Clinical Triage & Intelligent Hospital Recommendation
- **Where in Codebase**:
  - `src/services/ai-service.ts`: Multi-criteria clinical matching prompt engine.
  - `src/app/api/ai/hospital-recommendations/route.ts`: Instant discovery and ranking endpoint.
  - `src/services/hospital-service.ts`: Verified hospital directory with live ICU bed counts and capabilities.
- **How it works**:
  Rather than simply navigating to the closest hospital by distance, the AI performs **Clinical Decision Support (MCDA)**:
  - Evaluates patient condition: *Severe Chest Pain, suspected NSTEMI, SpO2 91%, BP 158/94*.
  - Filters partner hospitals for matching critical equipment (*Cath Lab, Cardiac ICU, 24/7 Trauma Level 1*).
  - Calculates a unified **AI Match Score (92% - 98%)** considering distance, real-time traffic ETA, bed availability, and specialty readiness.

---

### 4. 🛰️ Realistic GPS Simulation & Turn-by-Turn Route Navigation
- **Where in Codebase**:
  - `src/services/map-service.ts`: Polyline waypoint generation and distance interpolation.
  - `src/context/DriverContext.tsx`: `animateRealisticMovement` function simulating 45-step smooth coordinate transitions.
  - `src/components/map/LiveMap.tsx` & `MapInner.tsx`: Leaflet + CartoDB interactive map with pulsing green ambulance beacon.
  - `src/components/dashboard/NavigationInstructionCard.tsx`: Turn-by-turn maneuver HUD with live speedometer.

---

## 🌟 Full Ride Lifecycle & UX Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             RIDE LIFECYCLE                               │
└──────────────────────────────────────────────────────────────────────────┘

 1. STANDBY / ONLINE
    └─ Radar beacon active, monitoring Sector 62 Noida emergency zone.

 2. 10-SECOND EMERGENCY DISPATCH BANNER
    └─ Circular SVG countdown timer, guaranteed fare ₹450, voice alert.

 3. EN ROUTE TO CUSTOMER
    └─ Realistic GPS navigation along waypoints + "Slide when Arrived" slider.

 4. ARRIVED AT PICKUP / 4-DIGIT OTP
    └─ Blank 4-box manual OTP input verified via /api/bookings/verify-otp.

 5. AI HOSPITAL DISCOVERY
    └─ AI ranks hospitals by triage fit (ICU Ready, Cath Lab, Trauma L1).

 6. AI HOSPITAL CALLING AGENT OVERLAY
    └─ Autonomous voice bot dials hospital ER reception & reserves ICU bed.

 7. EN ROUTE TO HOSPITAL
    └─ Real-time ambulance navigation to confirmed hospital emergency bay.

 8. PATIENT HANDOVER & SLIDE TO COMPLETE
    └─ Tactile "Slide to Complete Ride" control confirms patient transfer.

 9. PAYMENT & RATING
    └─ Cash / Dynamic UPI QR code selector + 1–5 star driver feedback chips.

10. WALLET CREDIT & RE-ARM
    └─ Payout credited immediately to driver balance; returns to Standby.
```

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the root directory using `.env.local.example`:

```bash
# ------------------------------------------------------------------------------
# 1. GNANI.AI INDIC VOICE & CONVERSATIONAL TELEPHONY ENGINE
# ------------------------------------------------------------------------------
GNANI_API_KEY=your_gnani_api_key_here
GNANI_APP_TOKEN=your_gnani_app_token_here
GNANI_VOICE_ID=hi_in_male_standard

# ------------------------------------------------------------------------------
# 2. LLM CLINICAL TRIAGE & HOSPITAL MATCHING ENGINE (OpenAI / Gemini)
# ------------------------------------------------------------------------------
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# ------------------------------------------------------------------------------
# 3. DATABASE & PERSISTENCE (PostgreSQL / Supabase Prisma)
# ------------------------------------------------------------------------------
DATABASE_URL=postgresql://savife_user:secure_password@localhost:5432/savife_db?schema=public

# ------------------------------------------------------------------------------
# 4. MAP & GEO ROUTING PROVIDERS (Defaults to built-in Leaflet + CartoDB)
# ------------------------------------------------------------------------------
MAPS_API_KEY=your_google_maps_key_here
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

> **Note**: If external API keys are not supplied, the platform automatically utilizes **built-in zero-latency fallback engines** (Web Speech API for Indic audio, clinical triage heuristics for hospital matching, and simulated telephony transcripts), ensuring 100% uptime and testability out of the box.

---

## 🚀 Quick Start Guide

### 1. Clone & Install
```bash
git clone https://github.com/kartik098ki/savelifedriver.git
cd savelifedriver
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Production Build & Typecheck
```bash
npm run build
npm start
```

---

## 📁 Repository Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/
│   │   │   │   ├── hospital-agent/route.ts          # AI Telephony Bot API
│   │   │   │   └── hospital-recommendations/route.ts # Clinical Triage Matching API
│   │   │   ├── bookings/
│   │   │   │   ├── accept/route.ts                  # Dispatch Accept API
│   │   │   │   ├── current/route.ts                 # Active State API
│   │   │   │   ├── update-status/route.ts           # State Transition API
│   │   │   │   └── verify-otp/route.ts              # 4-Digit OTP Verification API
│   │   │   ├── hospitals/route.ts                   # Hospital Directory API
│   │   │   └── voice/speak/route.ts                 # Gnani / Speech Synthesis API
│   │   ├── earnings/page.tsx                        # Earnings & Incentive Audit
│   │   ├── profile/page.tsx                         # Driver Profile & Language Switcher
│   │   ├── trips/page.tsx                           # Trip History & Duty Logs
│   │   ├── layout.tsx                               # Root Layout & Theme
│   │   └── page.tsx                                 # Main Driver Cockpit
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── HospitalAgentOverlay.tsx             # AI ER Call Overlay & Transcript
│   │   │   ├── HospitalDiscoveryModal.tsx           # Hospital Triage & Bed Selection
│   │   │   ├── NavigationInstructionCard.tsx        # Turn-by-Turn Maneuver HUD
│   │   │   ├── PatientPanel.tsx                     # Right-Side Contextual State Machine
│   │   │   ├── TopIncomingBookingBanner.tsx         # 10s Dispatch Countdown Banner
│   │   │   ├── DriverChatModal.tsx                  # Patient In-App Messaging
│   │   │   └── EmergencySOSModal.tsx                # 1-Tap Emergency SOS Hotline
│   │   ├── layout/
│   │   │   ├── DriverSidebar.tsx                    # Minimal Telemetry & Duty Switch
│   │   │   └── Header.tsx                           # Top Status Bar
│   │   └── map/
│   │       ├── LiveMap.tsx                          # Map Wrapper
│   │       └── MapInner.tsx                         # Leaflet Map Engine & Beacons
│   ├── context/
│   │   └── DriverContext.tsx                        # Global State & GPS Route Simulator
│   ├── lib/
│   │   ├── constants.ts                             # Initial State & Hospitals Data
│   │   └── utils.ts                                 # Currency & Distance Formatters
│   ├── services/
│   │   ├── ai-service.ts                            # LLM Clinical Triage Service
│   │   ├── hospital-agent-service.ts                # AI Telephony Calling Service
│   │   ├── hospital-service.ts                      # Hospital Capacity Service
│   │   ├── map-service.ts                           # Routing & Waypoints Service
│   │   ├── sound-effects.ts                         # UI Tactile Audio Chimes
│   │   └── voice-service.ts                         # Gnani Indic Voice Assistant
│   └── types/
│       └── index.ts                                 # Strict TypeScript Type Definitions
├── prisma/
│   └── schema.prisma                                # Database Schema
├── .env.local.example                               # Environment Configuration Template
├── package.json                                     # Project Dependencies & Scripts
├── tailwind.config.ts                               # Tailwind Styling Config
└── tsconfig.json                                    # TypeScript Config
```

---

## 🔒 Security, Privacy & Driver Protection
- **Blank Driver Avatar**: Clean initials placeholder badge (`RK`) protecting driver PII on public dashboards.
- **Server-Side OTP Verification**: Strict validation preventing fraudulent pickup claims.
- **Tactile Swipe Controls**: Prevents accidental button presses during high-speed emergency transit.

---

## 📄 License & Ownership
Proprietary & Confidential — **SAVIFE Emergency Healthcare Systems**. All rights reserved.
