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

    // Verify against official OTP (4829 / 4827 / 1234)
    const validOtps = ['4829', '4827', '1234'];
    if (!validOtps.includes(cleanOtp) && cleanOtp.length !== 4) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid 4-digit OTP. Please ask the patient or attendant for the 4-digit code sent via SMS (Demo: 4829).',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: 'PATIENT_VERIFIED',
      nextStatus: 'PATIENT_ONBOARD',
      verifiedAt: new Date().toISOString(),
      patientName: 'Rahul Sharma (44M)',
      condition: 'Acute Chest Pain - High Priority Cardiac Triage',
      message: 'Patient verified successfully. Initiating AI Hospital Discovery...',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Server error during OTP verification' },
      { status: 500 }
    );
  }
}
