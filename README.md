# 🚑 SAVIFE Ambulance Driver Application & Emergency Dispatch System

> **Production-Grade Emergency Ambulance Driver & First-Responder Platform**  
> Built for rapid clinical triage, real-time GPS waypoint navigation, **Gnani.ai Indic Voice Guidance**, **Uber/Rapido-Style Emergency Surge Heatmaps**, **Secure 4-Digit Customer SMS OTP Verification**, **Autonomous AI Hospital Calling Agents**, and frictionless ride lifecycle management.

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.35-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Gnani.ai Voice](https://img.shields.io/badge/Gnani.ai-Indic_Voice_&_Telephony-emerald?style=flat-square)](https://gnani.ai/)
[![OpenAI / LLM](https://img.shields.io/badge/OpenAI%20%2F%20Gemini-Clinical_Triage_AI-orange?style=flat-square)](https://openai.com/)

---

## 🌟 Key Capabilities & Advanced Architecture

```
                                      SAVIFE CORE ENGINE
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │   1. 5-MINUTE PROXIMITY DISPATCH ENGINE                                                │
  │      ├─ Real-time matching within 1.5 - 2.5 km radius (e.g., Shipra Sun City ~4 mins) │
  │      └─ Guaranteed upfront emergency payout badge (₹450) with 10-second countdown     │
  │                                                                                        │
  │   2. SECURE 4-DIGIT CUSTOMER SMS OTP VERIFICATION                                      │
  │      ├─ Customer receives secure 4-digit code (e.g. 4829) via SMS / App               │
  │      ├─ Driver enters code upon arrival; verified via /api/bookings/verify-otp        │
  │      └─ Prevents fraudulent claims; unlocks instant AI Hospital Discovery             │
  │                                                                                        │
  │   3. UBER / RAPIDO STYLE EMERGENCY DEMAND SURGE HEATMAP                                │
  │      ├─ Live daylight CartoDB map with glowing High-Demand Emergency Zones             │
  │      ├─ Surge multiplier tags (🔥 1.2x Payout • Indirapuram / ⚡ 1.35x • Sector 18)    │
  │      └─ Live standby network ambulance markers (AMB-102 ALS, AMB-108 BLS)             │
  │                                                                                        │
  │   4. GNANI.AI DEBOUNCED INDIC VOICE ASSISTANT & SUBTITLE HUD                           │
  │      ├─ Spoken voice in Hindi, Hinglish, or English without annoying duplicate loops   │
  │      ├─ On-screen bold subtitle banner ("🔊 Gnani AI: ...") with Replay & Mute        │
  │      └─ Hands-free audio alerts for dispatch, arrival, OTP, and hospital bed holds    │
  │                                                                                        │
  │   5. AUTONOMOUS AI HOSPITAL TELEPHONY CALLING AGENT                                    │
  │      ├─ Live voice bot calls Hospital ER desks to hold ICU Beds & Cardiologists        │
  │      ├─ Auto-reroute fallback if hospital ICU is 100% full (e.g., Apollo ➔ Jaypee)    │
  │      └─ Real-time dialogue HUD showing doctor standby notes & green corridor status   │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 1. Customer OTP Verification System (What is the OTP & How it Works)

### 📌 How OTP Works:
1. **Dispatch Generated**: When an emergency booking is confirmed, the SAVIFE core dispatch generates a secure 4-digit one-time passcode (`4829`).
2. **Delivered to Customer**: The code is sent directly to the patient or attendant's phone via SMS and shown in their patient application.
3. **Driver Arrival**: The driver arrives at the pickup gate (e.g. *Shipra Sun City, Indirapuram*) and clicks *"Slide when Arrived at Pickup"*.
4. **Manual 4-Box Entry**: The driver asks the patient/attendant: *"Sir, kripya apna 4-digit OTP bataiye"*, and enters the code (`4 8 2 9`) into the 4 blank boxes.
5. **Server Verification**: The input is verified against the secure backend route:
   ```http
   POST /api/bookings/verify-otp
   Content-Type: application/json

   {
     "bookingId": "SVF-10293",
     "otp": "4829"
   }
   ```
6. **Instant AI Discovery Unlock**: Once verified (`200 OK`), the system transitions immediately into **AI Hospital Discovery & Triage matching**.

---

## 🗺️ 2. Uber / Rapido Style Emergency Demand Surge Zones

Ambulance drivers can monitor live high-incident zones on the crisp daylight map:
- **🔥 Indirapuram Emergency Hotspot**: 650m radius • 4 Min Avg Response • `1.2x Payout`
- **⚡ Sector 18 Commercial & Metro Hub**: 800m radius • Critical Surge Zone • `1.35x Payout`
- **🟢 Sector 62 IT & Hospital Corridor**: 550m radius • Driver Standby Base
- **🚑 Live Standby Ambulances**: Surrounding fleet units (`AMB-102 ALS`, `AMB-108 BLS`) rendered in real-time.
- **Surge Toggle**: Dedicated floating control pill (`🔥 Emergency Surge: ON / OFF`) allowing drivers to focus on navigation during active trips.

---

## 🤖 3. Deep Dive: Gnani.ai Voice & Other AI Integrations

### 🎙️ A. Gnani.ai Indic Voice Assistant
- **Files**: `src/services/voice-service.ts`, `src/app/api/voice/speak/route.ts`, `src/components/dashboard/VoiceSubtitleBanner.tsx`
- **Dialects**: Hindi (`hi-IN`), Hinglish (`hinglish`), English (`en-IN`).
- **Debounced Audio Delivery**: Employs speech locking to prevent audio spam or overlapping speech loops.
- **On-Screen Subtitle Banner**: Displays bold transcription on top of the cockpit with one-tap Replay (🔄) and Mute (🔇) buttons.
- **Spoken Prompts**:
  - *Incoming Dispatch*: *"Shipra Sun City Indirapuram se emergency booking aayi hai. Hospital Fortis jaana hai. Fare ₹450 hai."*
  - *Pickup Arrival*: *"Aap pickup location par pahunch gaye hain. Kripya customer se 4-digit OTP lekar enter karein."*
  - *Hospital Confirmed*: *"Fortis Hospital ne ICU bed aur doctor confirm kar diya hai. Emergency bay ka route start ho raha hai."*
  - *Trip Completed*: *"Trip complete ho gayi hai! ₹450 aapke driver wallet mein add ho gaye hain."*

### 📞 B. Gnani.ai Autonomous Telephony Calling Agent (ER Pre-Admission)
- **Files**: `src/services/hospital-agent-service.ts`, `src/app/api/ai/hospital-agent/route.ts`, `src/components/dashboard/HospitalAgentOverlay.tsx`
- **Autonomous Calling**: Directly dials the hospital emergency reception desk.
- **Vitals Telemetry**: Transmits patient condition (*44M, Acute Chest Pain, suspected NSTEMI, SpO2 91%, BP 158/94*).
- **Bed & Cath Lab Reservation**: Locks **ICU Bed #4** and notifies on-call Interventional Cardiologist.
- **Dynamic Fallback**: If the contacted hospital rejects admission (e.g., ICU beds 100% full), the agent automatically reroutes the driver to the secondary nearest facility (e.g., Jaypee Hospital) and dials the next facility.

### 🧠 C. LLM Clinical Triage Matching Engine
- **Files**: `src/services/ai-service.ts`, `src/app/api/ai/hospital-recommendations/route.ts`, `src/services/hospital-service.ts`
- **Multi-Criteria Decision Analysis (MCDA)**: Evaluates patient vitals, emergency priority (ALS), distance, ETA, and live hospital bed counters to generate an **AI Match Score (92% - 98%)**.

---

## 📱 Full Ride Lifecycle Flowchart

```
   ┌────────────────────────────────────────────────────────┐
   │             SAVIFE RIDE LIFECYCLE PIPELINE             │
   └────────────────────────────────────────────────────────┘

 1. STANDBY / ONLINE
    └─ Active in Sector 62 base; monitoring Indirapuram & Sector 18 surge zones.

 2. 10-SECOND NEARBY DISPATCH ALERT
    └─ Nearby pickup (Shipra Sun City • 1.8 km • 4 min away • ₹450 fare).
    └─ Gnani voice alert + 10s circular countdown ring.

 3. EN ROUTE TO CUSTOMER
    └─ Realistic GPS navigation along waypoints with speed gauge & turn HUD.
    └─ "Slide when Arrived at Pickup" tactile slider prevents misclicks.

 4. ARRIVED AT PICKUP / 4-DIGIT OTP
    └─ Driver asks customer for SMS OTP (4829).
    └─ Server verification via /api/bookings/verify-otp.

 5. AI HOSPITAL DISCOVERY
    └─ AI scores and ranks partner hospitals based on patient vitals & ICU beds.

 6. AI HOSPITAL CALLING AGENT OVERLAY
    └─ Autonomous voice bot calls ER reception, locks ICU Bed #4, alerts doctor.

 7. EN ROUTE TO HOSPITAL
    └─ Real-time ambulance navigation to confirmed hospital emergency bay.

 8. PATIENT HANDOVER & SLIDE TO COMPLETE
    └─ Tactile "Slide to Complete Ride" slider confirms transfer.

 9. PAYMENT & RATING
    └─ Split Cash / Dynamic UPI QR code selector + 1–5 star customer feedback.

10. WALLET CREDIT & RE-ARM
    └─ Instant ₹450 credit added to driver earnings; returns to Standby.
```

---

## ⚙️ Environment Variables (`.env.local`)

```bash
# ------------------------------------------------------------------------------
# 1. GNANI.AI INDIC VOICE & CONVERSATIONAL TELEPHONY ENGINE
# ------------------------------------------------------------------------------
GNANI_API_KEY=your_gnani_api_key_here
GNANI_APP_TOKEN=your_gnani_app_token_here
GNANI_VOICE_ID=hi_in_male_standard # Options: hi_in_male_standard, hinglish_neutral, en_in_male

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

---

## 🚀 Getting Started

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

### 3. Production Build & Verify
```bash
npm run build
npm start
```

---

## 📄 License & Ownership
Proprietary & Confidential — **SAVIFE Emergency Healthcare Systems**. All rights reserved.
