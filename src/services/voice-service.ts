// Voice Service for SAVIFE Driver Assistant (Hindi Spoken Output)

export interface VoiceSpeakOptions {
  textHindi: string;
  textEnglish?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export type VoiceLanguage = 'hi-IN' | 'en-IN' | 'ta-IN';

class VoiceService {
  private isVoiceEnabled: boolean = true;
  private language: VoiceLanguage = 'hi-IN';
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  public setVoiceEnabled(enabled: boolean) {
    this.isVoiceEnabled = enabled;
    if (!enabled && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  public getVoiceEnabled(): boolean {
    return this.isVoiceEnabled;
  }

  public setLanguage(language: VoiceLanguage) {
    this.language = language;
  }

  // Speaks in Hindi using Web Speech API or server-side audio
  public async speak(options: VoiceSpeakOptions): Promise<void> {
    if (!this.isVoiceEnabled) return;

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('SpeechSynthesis is not supported on this platform.');
      return;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const text = this.language === 'hi-IN' ? options.textHindi : (options.textEnglish || options.textHindi);
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Select the driver's preferred local voice when available.
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find((v) => v.lang === this.language || v.lang.startsWith(this.language.slice(0, 2)));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      utterance.lang = this.language;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      if (options.onStart) {
        utterance.onstart = options.onStart;
      }
      if (options.onEnd) {
        utterance.onend = options.onEnd;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Voice playback error:', err);
    }
  }

  // Pre-configured emergency voice prompts
  public speakIncomingBooking(fromText: string = 'Sector 62 Noida', toText: string = 'Fortis Hospital', fare: number = 450) {
    this.speak({
      textHindi: `${fromText} se ${toText} jaana hai. Fare ${fare} rupaye hai.`,
      textEnglish: `Going from ${fromText} to ${toText}. Fare is ${fare} rupees.`,
    });
  }

  public speakBookingAccepted() {
    this.speak({
      textHindi: `Ride accept ho gayi hai. Customer pickup location par ja rahe hain.`,
      textEnglish: `Ride accepted. En route to customer pickup.`,
    });
  }

  public speakArrivedAtPickup() {
    this.speak({
      textHindi: 'Aap pickup location par pahunch gaye hain. Kripya customer ka 4-digit OTP enter karein.',
      textEnglish: 'You have reached the pickup location. Please enter customer 4-digit OTP.',
    });
  }

  public speakPatientVerified() {
    this.speak({
      textHindi: 'OTP verify ho gaya hai. Hospital search ho raha hai.',
      textEnglish: 'OTP verified. Searching hospitals.',
    });
  }

  public speakHospitalContacting(hospitalName: string) {
    this.speak({
      textHindi: `AI agent ${hospitalName} ko contact kar raha hai.`,
      textEnglish: `AI agent is contacting ${hospitalName}.`,
    });
  }

  public speakHospitalRejection(rejectedHospital: string, nextHospital: string) {
    this.speak({
      textHindi: `Yeh hospital abhi patient ko receive nahi kar sakta. Main aapko next available hospital par redirect kar raha hoon.`,
      textEnglish: `This hospital cannot receive the patient right now. Redirecting to next available hospital.`,
    });
  }

  public speakHospitalConfirmed(hospitalName: string) {
    this.speak({
      textHindi: `${hospitalName} patient ko receive karne ke liye ready hai. Route update ho raha hai.`,
      textEnglish: `${hospitalName} is ready to receive the patient. Route updating.`,
    });
  }

  public speakHospitalNavUpdate(distanceKm: number, etaMin: number) {
    this.speak({
      textHindi: `Hospital ${Math.round(distanceKm)} kilometer door hai. Aapko ${etaMin} minute lagenge.`,
      textEnglish: `Hospital is ${distanceKm} km away. ETA is ${etaMin} minutes.`,
    });
  }

  public speakArrivedAtHospital(hospitalName: string) {
    this.speak({
      textHindi: `Aap destination ${hospitalName} pahunch gaye hain.`,
      textEnglish: `You have arrived at ${hospitalName}.`,
    });
  }

  public speakTripCompleted(fare: number) {
    this.speak({
      textHindi: `Trip complete ho gayi hai. Fare ${fare} rupaye add ho gaya hai.`,
      textEnglish: `Trip completed. Fare of ${fare} rupees added.`,
    });
  }
}

export const voiceService = new VoiceService();
