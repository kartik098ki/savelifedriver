import { NextResponse } from 'next/server';
import { TripStatus } from '@/types';

export async function POST(request: Request) {
  try {
    const { bookingId, status } = await request.json();

    if (!bookingId || !status) {
      return NextResponse.json({ error: 'Missing bookingId or status' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      bookingId,
      status: status as TripStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 });
  }
}
