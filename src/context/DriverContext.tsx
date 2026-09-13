'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Driver,
  Ambulance,
  Booking,
  Hospital,
  TripStatus,
  LocationCoordinates,
  AiAgentCallResponse,
  ChatMessage,
} from '@/types';
import {
  INITIAL_DRIVER,
  INITIAL_AMBULANCE,
  INITIAL_PATIENT,
  INITIAL_PICKUP_LOCATION,
  NEARBY_HOSPITALS,
} from '@/lib/constants';
import { soundEffects } from '@/services/sound-effects';
import { voiceService } from '@/services/voice-service';
import { VoiceLanguage } from '@/services/voice-service';
import { mapService } from '@/services/map-service';
import confetti from 'canvas-confetti';

interface TrafficLight {
  id: string;
  lat: number;
  lng: number;
  status: 'GREEN' | 'RED' | 'AMBER';
  label: string;
}

interface DriverEarningsState {
  todayEarnings: number;
  completedTrips: number;
  onlineHours: string;
}

interface DriverContextType {
  driver: Driver;
  ambulance: Ambulance;
  booking: Booking | null;
  tripStatus: TripStatus;
  countdownSeconds: number;
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  rejectedHospital: Hospital | null;
  suggestedAlternative: Hospital | null;
  isCallingHospital: boolean;
  hospitalCallResponse: AiAgentCallResponse | null;
  currentLocation: LocationCoordinates;
  routeCoordinates: [number, number][];
  currentSpeed: number;
  gpsStatus: 'LOCATING' | 'LIVE' | 'DENIED' | 'UNAVAILABLE';
  gpsAccuracyMeters: number | null;
  isMuted: boolean;
  isVoiceEnabled: boolean;
  isSosOpen: boolean;
  isChatOpen: boolean;
  chatMessages: ChatMessage[];
  earnings: DriverEarningsState;

  // Real-time moving distance & ETA
  remainingDistanceKm: number;
  remainingEtaMinutes: number;
  trafficLights: TrafficLight[];
  isMoving: boolean;
  selectedPaymentMethod: 'CASH' | 'UPI';
  customerRating: number;
  voiceLanguage: VoiceLanguage;
  appLanguage: 'hi' | 'en' | 'hinglish';

  // Actions
  toggleOnlineStatus: () => void;
  triggerIncomingBooking: () => void;
  acceptBooking: () => Promise<void>;
  declineBooking: () => void;
  verifyPatientOtp: (otp: string) => Promise<{ success: boolean; error?: string }>;
  confirmArrivalAtCustomer: () => void;
  swipeArrivalAtCustomer: () => void;
  selectHospital: (hospital: Hospital, forceRejection?: boolean) => Promise<void>;
  acceptReroute: (hospital: Hospital) => void;
  swipeToComplete: () => void;
  confirmPayment: (method: 'CASH' | 'UPI') => void;
  submitRating: (rating: number) => void;
  finishTrip: () => void;
  toggleMute: () => void;
  toggleVoice: () => void;
  setVoiceLanguage: (language: VoiceLanguage) => void;
  setAppLanguage: (lang: 'hi' | 'en' | 'hinglish') => void;
  setSosOpen: (open: boolean) => void;
  setChatOpen: (open: boolean) => void;
  sendChatMessage: (text: string) => void;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

export const DriverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [driver, setDriver] = useState<Driver>(INITIAL_DRIVER);
  const [ambulance] = useState<Ambulance>(INITIAL_AMBULANCE);
  const [tripStatus, setTripStatus] = useState<TripStatus>('AVAILABLE');
  const [countdownSeconds, setCountdownSeconds] = useState<number>(10);
  const [hospitals, setHospitals] = useState<Hospital[]>(NEARBY_HOSPITALS);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [rejectedHospital, setRejectedHospital] = useState<Hospital | null>(null);
  const [suggestedAlternative, setSuggestedAlternative] = useState<Hospital | null>(null);
  const [isCallingHospital, setIsCallingHospital] = useState<boolean>(false);
  const [hospitalCallResponse, setHospitalCallResponse] = useState<AiAgentCallResponse | null>(null);

  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates>(INITIAL_DRIVER.currentLocation);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [gpsStatus, setGpsStatus] = useState<'LOCATING' | 'LIVE' | 'DENIED' | 'UNAVAILABLE'>('LOCATING');
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number | null>(null);

  // Dynamic moving metrics
  const [remainingDistanceKm, setRemainingDistanceKm] = useState<number>(3.2);
  const [remainingEtaMinutes, setRemainingEtaMinutes] = useState<number>(12);
  const [isMoving, setIsMoving] = useState<boolean>(false);

  // Earnings
  const [earnings, setEarnings] = useState<DriverEarningsState>({
    todayEarnings: 2450,
    completedTrips: 8,
    onlineHours: '7h 42m',
  });

  // Modals & Chat
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [isSosOpen, setSosOpen] = useState<boolean>(false);
  const [isChatOpen, setChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'customer',
      text: 'Bhaiya jaldi aaiye, patient ki tabiyat kharab hai.',
      timestamp: 'Just now',
    },
  ]);

  // Payment & Rating
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'CASH' | 'UPI'>('CASH');
  const [customerRating, setCustomerRating] = useState<number>(5);
  const [voiceLanguage, setVoiceLanguageState] = useState<VoiceLanguage>('hi-IN');
  const [appLanguage, setAppLanguageState] = useState<'hi' | 'en' | 'hinglish'>('hi');

  // Live Traffic Lights on Map
  const [trafficLights] = useState<TrafficLight[]>([
    { id: 'TL-1', lat: 28.6215, lng: 77.3662, status: 'GREEN', label: 'Sector 62 Crossing' },
    { id: 'TL-2', lat: 28.6252, lng: 77.3675, status: 'GREEN', label: 'Fortis Chowk' },
    { id: 'TL-3', lat: 28.6010, lng: 77.3480, status: 'AMBER', label: 'Expressway Flyover' },
  ]);

  const [booking, setBooking] = useState<Booking | null>(null);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const movementIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialBookingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tripStatusRef = useRef<TripStatus>(tripStatus);
  const bookingRef = useRef<Booking | null>(booking);

  useEffect(() => { tripStatusRef.current = tripStatus; }, [tripStatus]);
  useEffect(() => { bookingRef.current = booking; }, [booking]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEffects.setMuted(next);
  };

  const toggleVoice = () => {
    const next = !isVoiceEnabled;
    setIsVoiceEnabled(next);
    voiceService.setVoiceEnabled(next);
  };

  const setVoiceLanguage = (language: VoiceLanguage) => {
    setVoiceLanguageState(language);
    voiceService.setLanguage(language);
  };

  const setAppLanguage = (lang: 'hi' | 'en' | 'hinglish') => {
    setAppLanguageState(lang);
    if (lang === 'hi' || lang === 'hinglish') {
      voiceService.setLanguage('hi-IN');
      setVoiceLanguageState('hi-IN');
    } else {
      voiceService.setLanguage('en-IN');
      setVoiceLanguageState('en-IN');
    }
  };

  const toggleOnlineStatus = () => {
    soundEffects.playTapSound();
    if (driver.status === 'ONLINE') {
      setDriver((prev) => ({ ...prev, status: 'OFFLINE' }));
      setTripStatus('OFFLINE');
      setBooking(null);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (initialBookingTimerRef.current) clearTimeout(initialBookingTimerRef.current);
      if (movementIntervalRef.current) clearInterval(movementIntervalRef.current);
    } else {
      setDriver((prev) => ({ ...prev, status: 'ONLINE' }));
      setTripStatus('AVAILABLE');
      // After ~2 seconds, incoming booking arrives
      if (initialBookingTimerRef.current) clearTimeout(initialBookingTimerRef.current);
      initialBookingTimerRef.current = setTimeout(() => {
        triggerIncomingBooking();
      }, 2000);
    }
  };

  // Trigger Incoming Booking with Gnani TTS reading From, To, and Fare Price (10s countdown)
  const triggerIncomingBooking = useCallback(() => {
    const newBooking: Booking = {
      id: `SVF-${Math.floor(10000 + Math.random() * 90000)}`,
      patientId: INITIAL_PATIENT.id,
      patient: INITIAL_PATIENT,
      driverId: INITIAL_DRIVER.id,
      pickupLocation: INITIAL_PICKUP_LOCATION,
      fare: 450,
      distanceKm: 1.8,
      estimatedMinutes: 4,
      status: 'BOOKING_RECEIVED',
      emergencyLevel: 'HIGH',
      otp: '4829',
      createdAt: new Date().toISOString(),
      rejectedHospitals: [],
      reRouteCount: 0,
    };

    setBooking(newBooking);
    setTripStatus('BOOKING_RECEIVED');
    setCountdownSeconds(10);
    setRemainingDistanceKm(1.8);
    setRemainingEtaMinutes(4);

    soundEffects.playEmergencyBookingAlarm();

    // Voice announcement in chosen language
    voiceService.speakIncomingBooking('Shipra Sun City Indirapuram', 'Fortis Emergency Hospital', 450);

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          setTripStatus('AVAILABLE');
          setBooking(null);
          return 0;
        }
        soundEffects.playCountdownTick(prev - 1);
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Smooth realistic GPS movement simulation
  const animateRealisticMovement = (
    from: LocationCoordinates,
    to: LocationCoordinates,
    initialDist: number,
    initialEta: number,
    onArrived: () => void
  ) => {
    if (movementIntervalRef.current) clearInterval(movementIntervalRef.current);

    setIsMoving(true);
    let step = 0;
    const totalSteps = 45; // Smooth realistic multi-step journey

    movementIntervalRef.current = setInterval(() => {
      step += 1;
      const progress = step / totalSteps;

      // Interpolate GPS coordinates along route
      const currentLat = from.lat + (to.lat - from.lat) * progress;
      const currentLng = from.lng + (to.lng - from.lng) * progress;
      setCurrentLocation({ lat: currentLat, lng: currentLng });

      // Calculate realistic remaining distance & ETA
      const remainingDist = Math.max(0, Number((initialDist * (1 - progress)).toFixed(1)));
      const remainingEta = Math.max(0, Math.ceil(initialEta * (1 - progress)));

      setRemainingDistanceKm(remainingDist);
      setRemainingEtaMinutes(remainingEta);
      setCurrentSpeed(step < totalSteps ? Math.floor(42 + Math.random() * 8) : 0);

      if (step >= totalSteps) {
        if (movementIntervalRef.current) clearInterval(movementIntervalRef.current);
        setIsMoving(false);
        setCurrentSpeed(0);
        setRemainingDistanceKm(0);
        setRemainingEtaMinutes(0);
        setCurrentLocation(to);
        onArrived();
      }
    }, 800);
  };

  // Accept incoming booking
  const acceptBooking = async () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    soundEffects.playSuccessChime();
    setTripStatus('ACCEPTED');

    // Generate Route from Driver to Customer Pickup
    const route = await mapService.getRoute(
      driver.currentLocation,
      INITIAL_PICKUP_LOCATION.coordinates,
      'Customer Pickup'
    );
    setRouteCoordinates(route.coordinates);
    setRemainingDistanceKm(1.8);
    setRemainingEtaMinutes(4);
    setCurrentSpeed(46);

    setTimeout(() => {
      setTripStatus('EN_ROUTE_TO_CUSTOMER');
      voiceService.speakBookingAccepted();

      // Start realistic movement along road
      animateRealisticMovement(
        driver.currentLocation,
        INITIAL_PICKUP_LOCATION.coordinates,
        1.8,
        4,
        () => {
          setTripStatus('ARRIVED_AT_CUSTOMER');
          voiceService.speakArrivedAtPickup();
        }
      );
    }, 1000);
  };

  const declineBooking = () => {
    soundEffects.playTapSound();
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setTripStatus('AVAILABLE');
    setBooking(null);
  };

  // Driver swipes to confirm arrival at pickup location
  const swipeArrivalAtCustomer = () => {
    if (movementIntervalRef.current) clearInterval(movementIntervalRef.current);
    setIsMoving(false);
    setCurrentSpeed(0);
    setRemainingDistanceKm(0);
    setRemainingEtaMinutes(0);
    setCurrentLocation(INITIAL_PICKUP_LOCATION.coordinates);
    soundEffects.playSuccessChime();
    setTripStatus('ARRIVED_AT_CUSTOMER');
    voiceService.speakArrivedAtPickup();
  };

  const confirmArrivalAtCustomer = () => {
    swipeArrivalAtCustomer();
  };

  // Verify OTP provided by customer
  const verifyPatientOtp = async (otp: string): Promise<{ success: boolean; error?: string }> => {
    soundEffects.playTapSound();

    try {
      const res = await fetch('/api/bookings/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking?.id, otp }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        soundEffects.playWarningSound();
        return { success: false, error: data.error || 'Incorrect OTP. Please try again.' };
      }

      soundEffects.playSuccessChime();
      setTripStatus('PATIENT_VERIFIED');
      voiceService.speakPatientVerified();

      // Move to Hospital Search
      setTimeout(async () => {
        setTripStatus('HOSPITAL_SEARCH');
        try {
          const hospRes = await fetch('/api/hospitals');
          const hospData = await hospRes.json();
          if (hospData.hospitals) {
            setHospitals(hospData.hospitals);
          }
        } catch {
          // Keep defaults
        }
      }, 1200);

      return { success: true };
    } catch {
      soundEffects.playWarningSound();
      return { success: false, error: 'Incorrect OTP. Please try again.' };
    }
  };

  // Select hospital -> trigger backend AI hospital calling agent
  const selectHospital = async (hospital: Hospital, forceRejection: boolean = true) => {
    soundEffects.playTapSound();
    setSelectedHospital(hospital);
    setTripStatus('HOSPITAL_SELECTED');
    setIsCallingHospital(true);

    voiceService.speakHospitalContacting(hospital.name);

    // Generate Route from Customer to Selected Hospital
    const route = await mapService.getRoute(currentLocation, hospital.coordinates, hospital.name);
    setRouteCoordinates(route.coordinates);
    setRemainingDistanceKm(hospital.distanceKm);
    setRemainingEtaMinutes(hospital.etaMinutes);

    // Backend AI Call to Hospital
    try {
      const res = await fetch('/api/ai/hospital-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: hospital.id,
          bookingId: booking?.id,
          simulateRejection: forceRejection,
          rejectionReason: 'ICU Beds 100% full & Cath Lab under emergency maintenance',
        }),
      });

      const callResult: AiAgentCallResponse = await res.json();
      setHospitalCallResponse(callResult);
      setIsCallingHospital(false);

      if (callResult.status === 'NOT_AVAILABLE') {
        // Hospital rejected! Auto-reroute to Fortis Hospital
        soundEffects.playWarningSound();
        setRejectedHospital(hospital);

        const fortis = hospitals.find((h) => h.id === 'HOSP-FORTIS') || hospitals[1];
        setSuggestedAlternative(fortis);

        // Voice alert
        voiceService.speakHospitalRejection(hospital.name, fortis.name);
      } else {
        // Hospital Accepted & Bed Confirmed
        confirmAndStartRoute(hospital);
      }
    } catch {
      setIsCallingHospital(false);
      // Fallback to confirming hospital
      confirmAndStartRoute(hospital);
    }
  };

  // Confirm Route to Hospital and animate live navigation
  const confirmAndStartRoute = async (hospital: Hospital) => {
    soundEffects.playSuccessChime();
    setSelectedHospital(hospital);
    setRejectedHospital(null);
    setSuggestedAlternative(null);
    setTripStatus('HOSPITAL_CONFIRMATION');

    voiceService.speakHospitalConfirmed(hospital.name);

    // Update Route to Hospital
    const route = await mapService.getRoute(currentLocation, hospital.coordinates, hospital.name);
    setRouteCoordinates(route.coordinates);
    setRemainingDistanceKm(hospital.distanceKm);
    setRemainingEtaMinutes(hospital.etaMinutes);

    setTimeout(() => {
      setTripStatus('EN_ROUTE_TO_HOSPITAL');

      // Start realistic movement towards hospital
      animateRealisticMovement(
        currentLocation,
        hospital.coordinates,
        hospital.distanceKm,
        hospital.etaMinutes,
        () => {
          setTripStatus('ARRIVED_AT_HOSPITAL');
          voiceService.speakArrivedAtHospital(hospital.name);
        }
      );
    }, 1500);
  };

  // Accept Reroute to alternative hospital
  const acceptReroute = (alternativeHospital: Hospital) => {
    soundEffects.playTapSound();
    confirmAndStartRoute(alternativeHospital);
  };

  // Driver physically swipes the control to complete ride
  const swipeToComplete = () => {
    soundEffects.playSuccessChime();
    setTripStatus('PAYMENT_PENDING');
  };

  // Driver marks payment received
  const confirmPayment = (method: 'CASH' | 'UPI') => {
    soundEffects.playTapSound();
    setSelectedPaymentMethod(method);
    setTripStatus('RATING_PENDING');
  };

  // Driver manually selects rating
  const submitRating = (rating: number) => {
    soundEffects.playSuccessChime();
    setCustomerRating(rating);
    setTripStatus('COMPLETED');

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10B981', '#34D399'],
      });
    } catch {
      // Confetti fallback
    }

    if (booking) {
      voiceService.speakTripCompleted(booking.fare);
    }
  };

  // Trip finalized -> update earnings and reset state to AVAILABLE
  const finishTrip = () => {
    soundEffects.playTapSound();
    const fareToAdd = booking?.fare || 450;

    setEarnings((prev) => ({
      ...prev,
      todayEarnings: prev.todayEarnings + fareToAdd,
      completedTrips: prev.completedTrips + 1,
    }));

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (movementIntervalRef.current) clearInterval(movementIntervalRef.current);

    setBooking(null);
    setSelectedHospital(null);
    setRejectedHospital(null);
    setSuggestedAlternative(null);
    setIsCallingHospital(false);
    setHospitalCallResponse(null);
    setRouteCoordinates([]);
    setCurrentSpeed(0);
    setRemainingDistanceKm(3.2);
    setRemainingEtaMinutes(12);
    setTripStatus('AVAILABLE');
  };

  // Chat actions
  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'driver',
      text: text.trim(),
      timestamp: 'Just now',
    };
    setChatMessages((prev) => [...prev, newMsg]);
    soundEffects.playTapSound();

    // Auto customer response after 2s
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'customer',
          text: 'Theek hai bhaiya, hum gate par hi khade hain.',
          timestamp: 'Just now',
        },
      ]);
    }, 2000);
  };

  // On initial startup: show normal online dashboard, after 2 seconds incoming booking arrives
  useEffect(() => {
    initialBookingTimerRef.current = setTimeout(() => {
      triggerIncomingBooking();
    }, 2000);

    return () => {
      if (initialBookingTimerRef.current) clearTimeout(initialBookingTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (movementIntervalRef.current) clearInterval(movementIntervalRef.current);
    };
  }, [triggerIncomingBooking]);

  // The map position and all arrival checks come from the driver's actual device GPS.
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('UNAVAILABLE');
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const location = { lat: coords.latitude, lng: coords.longitude };
        setGpsStatus('LIVE');
        setGpsAccuracyMeters(Math.round(coords.accuracy));
        setCurrentLocation(location);
        setDriver((prev) => ({ ...prev, currentLocation: location }));

        const activeBooking = bookingRef.current;
        if (tripStatusRef.current === 'EN_ROUTE_TO_CUSTOMER' && activeBooking && mapService.isWithinGeofence(location, activeBooking.pickupLocation.coordinates, 0.18)) {
          if (movementIntervalRef.current) clearInterval(movementIntervalRef.current);
          setIsMoving(false); setCurrentSpeed(0); setRemainingDistanceKm(0); setRemainingEtaMinutes(0);
          setTripStatus('ARRIVED_AT_CUSTOMER');
          voiceService.speakArrivedAtPickup();
        }
        if (tripStatusRef.current === 'EN_ROUTE_TO_HOSPITAL' && selectedHospital && mapService.isWithinGeofence(location, selectedHospital.coordinates, 0.18)) {
          if (movementIntervalRef.current) clearInterval(movementIntervalRef.current);
          setIsMoving(false); setCurrentSpeed(0); setRemainingDistanceKm(0); setRemainingEtaMinutes(0);
          setTripStatus('ARRIVED_AT_HOSPITAL');
          voiceService.speakArrivedAtHospital(selectedHospital.name);
        }
      },
      (error) => {
        setGpsStatus(error.code === error.PERMISSION_DENIED ? 'DENIED' : 'UNAVAILABLE');
        setGpsAccuracyMeters(null);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 12000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [selectedHospital]);

  return (
    <DriverContext.Provider
      value={{
        driver,
        ambulance,
        booking,
        tripStatus,
        countdownSeconds,
        hospitals,
        selectedHospital,
        rejectedHospital,
        suggestedAlternative,
        isCallingHospital,
        hospitalCallResponse,
        currentLocation,
        routeCoordinates,
        currentSpeed,
        gpsStatus,
        gpsAccuracyMeters,
        isMuted,
        isVoiceEnabled,
        isSosOpen,
        isChatOpen,
        chatMessages,
        earnings,
        remainingDistanceKm,
        remainingEtaMinutes,
        trafficLights,
        isMoving,
        selectedPaymentMethod,
        customerRating,
        voiceLanguage,
        appLanguage,
        toggleOnlineStatus,
        triggerIncomingBooking,
        acceptBooking,
        declineBooking,
        verifyPatientOtp,
        confirmArrivalAtCustomer,
        swipeArrivalAtCustomer,
        selectHospital,
        acceptReroute,
        swipeToComplete,
        confirmPayment,
        submitRating,
        finishTrip,
        toggleMute,
        toggleVoice,
        setVoiceLanguage,
        setAppLanguage,
        setSosOpen,
        setChatOpen,
        sendChatMessage,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
};

export const useDriver = (): DriverContextType => {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error('useDriver must be used within a DriverProvider');
  }
  return context;
};
