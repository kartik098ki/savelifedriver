import { NextResponse } from 'next/server';
import { hospitalService } from '@/services/hospital-service';
import { INITIAL_DRIVER, INITIAL_PATIENT } from '@/lib/constants';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || String(INITIAL_DRIVER.currentLocation.lat));
  const lng = parseFloat(searchParams.get('lng') || String(INITIAL_DRIVER.currentLocation.lng));
  const excluded = searchParams.get('excluded')?.split(',') || [];

  const hospitals = await hospitalService.findNearbyHospitals(
    { lat, lng },
    INITIAL_PATIENT,
    excluded
  );

  return NextResponse.json({
    count: hospitals.length,
    hospitals,
    timestamp: new Date().toISOString(),
  });
}
