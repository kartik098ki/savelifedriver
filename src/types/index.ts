// SAVIFE Ambulance Driver Platform Types

export type TripStatus =
  | 'AVAILABLE'
  | 'BOOKING_RECEIVED'
  | 'ACCEPTED'
  | 'EN_ROUTE_TO_CUSTOMER'
  | 'ARRIVED_AT_CUSTOMER'
  | 'OTP_PENDING'
  | 'PATIENT_VERIFIED'
  | 'HOSPITAL_SEARCH'
  | 'HOSPITAL_SELECTED'
  | 'HOSPITAL_CONFIRMATION'
  | 'EN_ROUTE_TO_HOSPITAL'
  | 'ARRIVED_AT_HOSPITAL'
  | 'PAYMENT_PENDING'
  | 'RATING_PENDING'
  | 'COMPLETED'
  | 'OFFLINE';

export type AppLanguage = 'hi' | 'en' | 'hinglish';

export type EmergencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type HospitalStatus = 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE' | 'FULL';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  ambulanceNumber: string;
  status: 'ONLINE' | 'OFFLINE' | 'ON_TRIP' | 'BUSY';
  rating: number;
  totalTrips: number;
  currentLocation: LocationCoordinates;
  verificationStatus: 'VERIFIED' | 'PENDING';
  profileImage: string;
  licenseNumber: string;
  experienceYears: number;
}

export interface Ambulance {
  id: string;
  driverId: string;
  registrationNumber: string;
  type: 'ALS' | 'BLS' | 'PATIENT_TRANSPORT' | 'ICU_ON_WHEELS'; // Advanced Life Support / Basic Life Support
  capacity: string;
  equipment: string[];
  status: 'ACTIVE' | 'MAINTENANCE' | 'OFF_DUTY';
  oxygenLevel: number; // percentage
  ventilatorAvailable: boolean;
  defibrillatorAvailable: boolean;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  emergencyLevel: EmergencyLevel;
  medicalCondition: string;
  vitals?: {
    heartRate?: number;
    spo2?: number;
    bp?: string;
    temperature?: string;
  };
  specialRequirements: string[];
}

export interface Hospital {
  id: string;
  name: string;
  coordinates: LocationCoordinates;
  address: string;
  distanceKm: number;
  etaMinutes: number;
  emergencyAvailable: boolean;
  doctorsAvailable: boolean;
  bedsAvailable: boolean;
  icuAvailable: boolean;
  bedCount: number;
  icuBedCount: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  specialties: string[];
  aiMatchScore: number;
  aiMatchReason: string;
  phone: string;
  status: HospitalStatus;
  lastUpdated: string;
}

export interface HospitalInteraction {
  id: string;
  bookingId: string;
  hospitalId: string;
  hospitalName: string;
  communicationStatus: 'INITIATED' | 'IN_PROGRESS' | 'ACCEPTED' | 'REJECTED' | 'FAILED';
  responseReason?: string;
  timestamp: string;
  source: 'AI_AGENT_CALL' | 'DIRECT_API' | 'MANUAL';
  transcriptSnippet?: string;
}

export interface NavigationStep {
  instruction: string;
  distance: string;
  icon: 'straight' | 'turn-left' | 'turn-right' | 'u-turn' | 'arrive';
  roadName: string;
}

export interface Booking {
  id: string;
  patientId: string;
  patient: Patient;
  driverId: string;
  pickupLocation: {
    address: string;
    coordinates: LocationCoordinates;
    landmark?: string;
  };
  destinationHospital?: Hospital;
  fare: number;
  distanceKm: number;
  estimatedMinutes: number;
  status: TripStatus;
  emergencyLevel: EmergencyLevel;
  otp: string; // 4-digit code e.g. "4827"
  createdAt: string;
  acceptedAt?: string;
  arrivedPickupAt?: string;
  patientVerifiedAt?: string;
  hospitalSelectedAt?: string;
  hospitalConfirmedAt?: string;
  completedAt?: string;
  rejectedHospitals: string[]; // Hospital IDs rejected during this trip
  reRouteCount: number;
}

export interface ChatMessage {
  id: string;
  sender: 'driver' | 'customer';
  text: string;
  timestamp: string;
}

export interface TripHistoryItem {
  id: string;
  bookingId: string;
  date: string;
  patientName: string;
  emergencyLevel: EmergencyLevel;
  pickupAddress: string;
  hospitalName: string;
  distanceKm: number;
  durationMinutes: number;
  fare: number;
  driverEarnings: number;
  status: 'Completed' | 'Hospital Redirected' | 'Emergency' | 'Cancelled';
  otpVerified: boolean;
  aiRerouted: boolean;
}

export interface EarningsData {
  todayEarnings: number;
  completedTrips: number;
  onlineHours: string;
  averageTripFare: number;
  weeklyEarnings: { day: string; amount: number; trips: number }[];
  recentPayouts: { id: string; date: string; amount: number; status: 'PAID' | 'PROCESSING' }[];
  incentives: { title: string; reward: number; progress: number; total: number; expires: string }[];
}

export interface AiHospitalRecommendationResponse {
  hospitals: Hospital[];
  recommendedHospitalId: string;
  triageReason: string;
  confidence: number;
  voiceTextHindi: string;
  voiceTextEnglish: string;
}

export interface AiAgentCallResponse {
  hospitalId: string;
  hospitalName: string;
  status: 'ACCEPTED' | 'NOT_AVAILABLE';
  rejectionReason?: string;
  bedStatus: string;
  doctorStatus: string;
  transcript: string[];
  suggestedAlternativeHospitalId?: string;
  voiceAnnouncementHindi: string;
}
