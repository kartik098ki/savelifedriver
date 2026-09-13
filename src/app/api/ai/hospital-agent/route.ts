import { NextResponse } from 'next/server';
import { hospitalAgentService } from '@/services/hospital-agent-service';
import { hospitalService } from '@/services/hospital-service';
import { INITIAL_PATIENT } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const { hospitalId, bookingId, simulateRejection, rejectionReason } = await request.json();

    if (!hospitalId) {
      return NextResponse.json({ error: 'hospitalId is required' }, { status: 400 });
    }

    const hospital = await hospitalService.getHospitalById(hospitalId);
    if (!hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
    }

    const result = await hospitalAgentService.contactHospital(
      hospital,
      INITIAL_PATIENT,
      bookingId || 'SVF-10293',
      {
        shouldSimulateRejection: simulateRejection,
        rejectionReason,
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in AI Hospital Agent API:', error);
    return NextResponse.json({ error: 'Failed to contact hospital agent' }, { status: 500 });
  }
}
