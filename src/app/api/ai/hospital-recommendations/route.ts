import { NextResponse } from 'next/server';
import { aiService } from '@/services/ai-service';
import { hospitalService } from '@/services/hospital-service';
import { INITIAL_PATIENT } from '@/lib/constants';
import { LocationCoordinates } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const patient = body.patient || INITIAL_PATIENT;
    const location: LocationCoordinates = body.location || { lat: 28.628, lng: 77.3685 };
    const excludedHospitals: string[] = body.excludedHospitalIds || [];

    const hospitals = await hospitalService.findNearbyHospitals(location, patient, excludedHospitals);
    const recommendation = await aiService.getHospitalRecommendations(patient, hospitals);

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error('Error in hospital recommendations API:', error);
    return NextResponse.json(
      { error: 'Failed to generate hospital recommendations' },
      { status: 500 }
    );
  }
}
