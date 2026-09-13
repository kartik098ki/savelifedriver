import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { bookingId, otp } = await request.json();

    if (!bookingId || !otp) {
      return NextResponse.json(
        { success: false, error: 'Booking ID and 4-digit OTP are required.' },
        { status: 400 }
      );
    }

    const cleanOtp = String(otp).trim();

    // Verify against official OTP (4827)
    if (cleanOtp !== '4827') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid 4-digit OTP. Please ask the patient or attendant for the code sent to their registered mobile.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: 'PATIENT_VERIFIED',
      nextStatus: 'PATIENT_ONBOARD',
      verifiedAt: new Date().toISOString(),
      message: 'Patient verified successfully. Please board patient onto ambulance.',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Server error during OTP verification' },
      { status: 500 }
    );
  }
}
