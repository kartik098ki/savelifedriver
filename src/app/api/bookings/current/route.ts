import { NextResponse } from 'next/server';
import { INITIAL_DRIVER, INITIAL_PATIENT, INITIAL_PICKUP_LOCATION } from '@/lib/constants';
import { Booking } from '@/types';

// Module-level in-memory active booking state for server persistence
let currentServerBooking: Booking | null = {
  id: 'SVF-10293',
  patientId: INITIAL_PATIENT.id,
  patient: INITIAL_PATIENT,
  driverId: INITIAL_DRIVER.id,
  pickupLocation: INITIAL_PICKUP_LOCATION,
  fare: 450,
  distanceKm: 3.2,
  estimatedMinutes: 12,
  status: 'BOOKING_RECEIVED',
  emergencyLevel: 'HIGH',
  otp: '4827',
  createdAt: new Date().toISOString(),
  rejectedHospitals: [],
  reRouteCount: 0,
};

export async function GET() {
  return NextResponse.json({
    driver: INITIAL_DRIVER,
    booking: currentServerBooking,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'RESET') {
      currentServerBooking = {
        id: `SVF-${Math.floor(10000 + Math.random() * 90000)}`,
        patientId: INITIAL_PATIENT.id,
        patient: INITIAL_PATIENT,
        driverId: INITIAL_DRIVER.id,
        pickupLocation: INITIAL_PICKUP_LOCATION,
        fare: 450,
        distanceKm: 3.2,
        estimatedMinutes: 12,
        status: 'BOOKING_RECEIVED',
        emergencyLevel: 'HIGH',
        otp: '4827',
        createdAt: new Date().toISOString(),
        rejectedHospitals: [],
        reRouteCount: 0,
      };
    } else if (body.booking) {
      currentServerBooking = body.booking;
    }
    return NextResponse.json({ success: true, booking: currentServerBooking });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
