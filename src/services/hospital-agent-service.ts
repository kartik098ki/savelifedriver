import { Hospital, Patient, AiAgentCallResponse, HospitalInteraction } from '@/types';
import { hospitalService } from './hospital-service';

export interface HospitalCallSimulationOptions {
  shouldSimulateRejection?: boolean;
  rejectionReason?: string;
}

export class HospitalAgentService {
  private callLogs: HospitalInteraction[] = [];

  // Initiate AI Call to Hospital Emergency Reception
  public async contactHospital(
    hospital: Hospital,
    patient: Patient,
    bookingId: string,
    options?: HospitalCallSimulationOptions
  ): Promise<AiAgentCallResponse> {
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    
    // Log initiation
    this.addLog({
      id: `INT-${Date.now()}-1`,
      bookingId,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      communicationStatus: 'INITIATED',
      timestamp: `${timestamp} — Hospital Contacted via AI Telephony Agent`,
      source: 'AI_AGENT_CALL',
      transcriptSnippet: `AI: "Hello, this is SAVIFE Emergency Ambulance. We are bringing a ${patient.emergencyLevel} priority patient (${patient.age}M, suspected cardiac emergency). Please confirm admission readiness."`,
    });

    // Simulate network and voice bot conversation latency (approx 2s in demo)
    await new Promise((res) => setTimeout(res, 1800));

    const isRejection = options?.shouldSimulateRejection ?? (hospital.id === 'HOSP-APOLLO');

    if (isRejection) {
      const rejectionReason = options?.rejectionReason || 'ICU Beds 100% Occupied & Cath Lab under emergency maintenance';
      
      const alt = await hospitalService.getAlternativeRecommendation(hospital.coordinates, patient, hospital.id);

      this.addLog({
        id: `INT-${Date.now()}-2`,
        bookingId,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        communicationStatus: 'REJECTED',
        responseReason: rejectionReason,
        timestamp: `${timestamp} — Hospital Rejected: ${rejectionReason}`,
        source: 'AI_AGENT_CALL',
        transcriptSnippet: `Hospital: "Sorry SAVIFE Dispatch, our emergency cardiac beds are currently full. We cannot accept."`,
      });

      return {
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        status: 'NOT_AVAILABLE',
        rejectionReason,
        bedStatus: '0 ICU Beds Available',
        doctorStatus: 'Emergency team occupied',
        transcript: [
          `AI Agent: "Hello, SAVIFE Emergency Ambulance dispatch. We are transporting 44M with acute chest pain, ETA ${hospital.etaMinutes} mins."`,
          `Hospital Reception: "Emergency reception here. Checking with On-Duty Cardiac Registrar..."`,
          `Hospital Doctor: "Negative, both Cath Labs are occupied with acute STEMI cases and ICU 1 & 2 are at maximum capacity. Cannot admit."`,
          `AI Agent: "Acknowledged. Updating driver navigation immediately to secondary partner facility."`,
        ],
        suggestedAlternativeHospitalId: alt.recommendedHospital.id,
        voiceAnnouncementHindi: `${hospital.name} abhi patient ko receive nahi kar sakta. Main aapko next nearest available hospital ${alt.recommendedHospital.name} par redirect kar raha hoon.`,
      };
    } else {
      this.addLog({
        id: `INT-${Date.now()}-3`,
        bookingId,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        communicationStatus: 'ACCEPTED',
        timestamp: `${timestamp} — Hospital Confirmed & Bed Reserved`,
        source: 'AI_AGENT_CALL',
        transcriptSnippet: `Hospital: "Confirmed. Emergency bay and on-call cardiologist notified. Direct entry green corridor open."`,
      });

      return {
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        status: 'ACCEPTED',
        bedStatus: 'ICU Bed #4 Reserved',
        doctorStatus: 'Dr. Alok Verma (Interventional Cardiologist) Standby',
        transcript: [
          `AI Agent: "Hello ${hospital.name} Emergency Desk. SAVIFE Ambulance DL 01 AB 1234 en-route with HIGH priority cardiac patient. ETA ${hospital.etaMinutes} mins."`,
          `Hospital Reception: "Emergency Desk copied. Standby for Chief Medical Officer..."`,
          `ER Doctor: "Confirmed. ECG and vitals received via telemetry. Emergency Bay 3 and Cath Lab team alerted. Proceed immediately."`,
          `AI Agent: "Confirmation logged. Driver alerted."`,
        ],
        voiceAnnouncementHindi: `${hospital.name} ne patient ko receive karne ki confirmation de di hai. Main route start kar raha hoon.`,
      };
    }
  }

  public getCallLogs(bookingId?: string): HospitalInteraction[] {
    if (bookingId) {
      return this.callLogs.filter((log) => log.bookingId === bookingId);
    }
    return this.callLogs;
  }

  private addLog(log: HospitalInteraction) {
    this.callLogs.unshift(log);
  }
}

export const hospitalAgentService = new HospitalAgentService();
