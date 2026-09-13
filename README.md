# 🚑 SAVIFE Ambulance Driver Application

> **Production-Grade Emergency Ambulance Driver & First-Responder Dashboard**  
> Built for rapid emergency triage, real-time live GPS waypoint navigation, automated AI hospital admission readiness discovery, multi-lingual audio synthesis, and frictionless ride lifecycle management.

---

## 🌟 Key Features

### 1. 🗺️ Real-Time Navigation & Realistic GPS Route Simulation
- **Leaflet & CartoDB Engine**: High-clarity map tiles optimized for in-vehicle mounting and fast rendering.
- **Pulsing Green Ambulance Beacon**: Live coordinate tracking with multi-stage route interpolation.
- **Turn-by-Turn Maneuver HUD**: Dynamic next-turn arrows, remaining distance, ETA, and live speedometer.
- **Realistic GPS Simulation**: Progressively navigates along actual road coordinates (Sector 62 to pickup, pickup to selected hospital) without instant teleportation.

### 2. ⚡ 10-Second High-Priority Dispatch Banner
- **Circular SVG Countdown**: 10-second high-visibility alert with sound and voice announcements.
- **Guaranteed Payout Badge**: Transparent fare upfront (e.g., `₹450`).
- **One-Tap Accept & Decline**: Instant state transition into emergency response mode.

### 3. 🖐️ Tactile Swipe Controls & OTP Security
- **"Slide when Arrived at Pickup"**: Swipe gesture prevents accidental touch triggers while driving.
- **4-Digit Manual OTP Verification**: Blank boxes requiring driver entry verified securely against backend `/api/bookings/verify-otp`.
- **"Slide to Complete Ride"**: Smooth slide confirmation once patient is transferred to hospital ER triage.

### 4. 🤖 AI Hospital Discovery & ER Pre-Arrival Notification
- **Intelligent Triage Matching**: Automatically scans verified partner hospitals matching patient vitals (e.g., NSTEMI / ICU / Cath Lab readiness).
- **Live AI Dispatch Calling Agent**: Real-time hospital confirmation dialogue simulation with instant ER bed reservation and fallback options.
- **Speciality Filter Tabs**: Filter by *All Hospitals*, *ICU Ready*, and *Trauma Level 1*.

### 5. 🗣️ Multi-Language Voice Guidance
- **Hindi, English & Hinglish**: High-fidelity speech synthesis announces dispatches, arrival confirmations, bed readiness, and trip completions.
- Switchable anytime from the Driver Profile settings.

### 6. 💳 Flexible Payments & 5-Star Rating
- **Payment Split**: Cash or dynamic instant UPI QR code generation.
- **Driver Feedback**: 1–5 star patient/attendant rating with quick attribute tags (*Polite*, *Ready at gate*, *Accurate location*).

---

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS & Lucide React
- **Animations**: Framer Motion
- **Map & Geo**: Leaflet & React-Leaflet
- **Voice**: Web Speech API with custom multi-dialect synthesizers

---

## 🚀 Getting Started

### 1. Installation
```bash
git clone https://github.com/kartik098ki/savelifedriver.git
cd savelifedriver
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm start
```

---

## 📱 Application Flow & Lifecycle

```
Online / Standby
   │
   ▼ (10s Dispatch Banner)
Accept Dispatch
   │
   ▼
EN ROUTE TO CUSTOMER (Live GPS Navigation)
   │
   ▼ (Slide when Arrived at Pickup)
ARRIVED AT CUSTOMER (Enter 4-Digit OTP)
   │
   ▼ (OTP Verified: /api/bookings/verify-otp)
AI HOSPITAL DISCOVERY
   │
   ▼ (Select Hospital)
AI Hospital Bed Calling & ER Confirmation
   │
   ▼
EN ROUTE TO HOSPITAL (Live GPS Route Navigation)
   │
   ▼ (Slide to Complete Ride)
ARRIVED AT HOSPITAL / ER Handover
   │
   ▼
Payment (Cash / UPI QR Code)
   │
   ▼
Customer Rating (1-5 Stars)
   │
   ▼
Trip Completed & Wallet Credit Added
```

---

## 🔒 Security & Privacy
- **Blank Driver Avatar**: Clean initials placeholder badge (`RK`) protecting driver PII on public dashboards.
- **Strict Verification API**: Server-side OTP validation endpoint with error handling.

---

## 📄 License
Proprietary & Confidential — SAVIFE Emergency Response Systems.
