// Voice Service for SAVIFE Driver Assistant (Gnani.ai & Web Speech API)

export interface VoiceSpeakOptions {
  textHindi: string;
  textEnglish?: string;
  textHinglish?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export type VoiceLanguage = 'hi-IN' | 'en-IN' | 'ta-IN';

class VoiceService {
  private isVoiceEnabled: boolean = true;
  private language: VoiceLanguage = 'hi-IN';
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;
  private subtitleListeners: Array<(text: string, lang: string) => void> = [];

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

  public getLanguage(): VoiceLanguage {
    return this.language;
  }

  public getLastSpokenText(): string {
    return this.lastSpokenText;
  }

  public onSubtitle(listener: (text: string, lang: string) => void) {
    this.subtitleListeners.push(listener);
    return () => {
      this.subtitleListeners = this.subtitleListeners.filter((l) => l !== listener);
    };
  }

  private notifySubtitles(text: string, lang: string) {
    this.lastSpokenText = text;
    this.subtitleListeners.forEach((fn) => fn(text, lang));
  }

  // Speaks using Web Speech API with debounce locking
  public async speak(options: VoiceSpeakOptions): Promise<void> {
    const text =
      this.language === 'hi-IN'
        ? options.textHindi
        : options.textHinglish || options.textEnglish || options.textHindi;

    // Debounce duplicate utterances within 1.5 seconds
    const now = Date.now();
    if (this.lastSpokenText === text && now - this.lastSpokenTime < 1500) {
      return;
    }
    this.lastSpokenTime = now;
    this.notifySubtitles(text, this.language);

    if (!this.isVoiceEnabled) return;

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('SpeechSynthesis is not supported on this platform.');
      return;
    }

    try {
      // Cancel any prior speech cleanly
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.lang === this.language || v.lang.startsWith(this.language.slice(0, 2))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      utterance.lang = this.language;
      utterance.rate = 0.96; // Clear slightly slower pace for noisy ambulance environments
      utterance.pitch = 1.02;

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

  public replayLast() {
    if (this.lastSpokenText) {
      this.speak({
        textHindi: this.lastSpokenText,
        textEnglish: this.lastSpokenText,
      });
    }
  }

  // Pre-configured emergency voice prompts
  public speakIncomingBooking(
    fromText: string = 'Shipra Sun City Indirapuram',
    toText: string = 'Fortis Emergency Hospital',
    fare: number = 450
  ) {
    this.speak({
      textHindi: `${fromText} se emergency booking aayi hai. Hospital ${toText} jaana hai. Fare ${fare} rupaye hai.`,
      textHinglish: `Emergency booking from ${fromText}. Destination ${toText}. Guaranteed fare is ₹${fare}.`,
      textEnglish: `Incoming emergency dispatch from ${fromText}. Destination ${toText}. Fare is ${fare} rupees.`,
    });
  }

  public speakBookingAccepted() {
    this.speak({
      textHindi: `Ride accept ho gayi hai. Customer pickup location ki taraf navigate kar rahe hain.`,
      textHinglish: `Ride accepted. Navigating towards customer pickup point.`,
      textEnglish: `Ride accepted. En route to customer pickup location.`,
    });
  }

  public speakArrivedAtPickup() {
    this.speak({
      textHindi: 'Aap pickup location par pahunch gaye hain. Kripya customer se 4-digit OTP lekar enter karein.',
      textHinglish: 'Reached pickup spot. Please ask customer for 4-digit OTP.',
      textEnglish: 'You have arrived at pickup. Please verify the customer 4-digit OTP.',
    });
  }

  public speakPatientVerified() {
    this.speak({
      textHindi: 'OTP verify ho gaya hai. AI sabse best emergency hospital search kar raha hai.',
      textHinglish: 'OTP verified. AI is finding the best emergency hospital.',
      textEnglish: 'OTP verified. AI is discovering optimal emergency hospital.',
    });
  }

  public speakHospitalContacting(hospitalName: string) {
    this.speak({
      textHindi: `AI agent ${hospitalName} emergency desk ko call kar raha hai.`,
      textHinglish: `AI agent is calling ${hospitalName} emergency desk.`,
      textEnglish: `AI agent is connecting with ${hospitalName} emergency reception.`,
    });
  }

  public speakHospitalRejection(rejectedHospital: string, nextHospital: string) {
    this.speak({
      textHindi: `${rejectedHospital} mein ICU beds full hain. Main aapko ${nextHospital} redirect kar raha hoon.`,
      textHinglish: `${rejectedHospital} ICU is full. Auto redirecting to ${nextHospital}.`,
      textEnglish: `${rejectedHospital} is at capacity. Redirecting to ${nextHospital}.`,
    });
  }

  public speakHospitalConfirmed(hospitalName: string) {
    this.speak({
      textHindi: `${hospitalName} ne ICU bed aur doctor confirm kar diya hai. Emergency bay ka route start ho raha hai.`,
      textHinglish: `${hospitalName} has confirmed ICU bed. Starting navigation to emergency bay.`,
      textEnglish: `${hospitalName} confirmed ICU bed readiness. Starting navigation.`,
    });
  }

  public speakHospitalNavUpdate(distanceKm: number, etaMin: number) {
    this.speak({
      textHindi: `Hospital ${Math.round(distanceKm)} kilometer door hai. ETA ${etaMin} minute hai.`,
      textHinglish: `Hospital is ${distanceKm} km away. Estimated arrival in ${etaMin} mins.`,
      textEnglish: `Hospital is ${distanceKm} km away. ETA is ${etaMin} minutes.`,
    });
  }

  public speakArrivedAtHospital(hospitalName: string) {
    this.speak({
      textHindi: `Aap destination ${hospitalName} ke Emergency Bay pahunch gaye hain.`,
      textHinglish: `Arrived at ${hospitalName} emergency department.`,
      textEnglish: `You have arrived at ${hospitalName} emergency bay.`,
    });
  }

  public speakTripCompleted(fare: number) {
    this.speak({
      textHindi: `Trip complete ho gayi hai. Fare ${fare} rupaye wallet mein add ho gaye hain.`,
      textHinglish: `Trip completed! ₹${fare} credited to your driver wallet.`,
      textEnglish: `Trip completed. Fare of ${fare} rupees added to wallet.`,
    });
  }
}

export const voiceService = new VoiceService();
