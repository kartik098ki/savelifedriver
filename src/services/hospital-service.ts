import { Hospital, LocationCoordinates, Patient } from '@/types';
import { NEARBY_HOSPITALS } from '@/lib/constants';
import { mapService } from './map-service';

export class HospitalService {
  // Retrieve nearby hospitals with dynamic distance, ETA, and AI Match Scores
  public async findNearbyHospitals(
    currentLocation: LocationCoordinates,
    patient: Patient,
    excludedHospitalIds: string[] = []
  ): Promise<Hospital[]> {
    // Clone hospitals so we don't mutate the seed constant
    const hospitals: Hospital[] = NEARBY_HOSPITALS.map((h) => {
      const realDist = mapService.calculateDistance(currentLocation, h.coordinates) * 1.25;
      const distanceKm = Number(realDist.toFixed(1));
      const etaMinutes = Math.max(3, Math.round((distanceKm / 28) * 60));

      // Calculate AI match score based on clinical priority:
      // High weight on ETA, ICU availability for HIGH/CRITICAL, Bed availability, Doctors
      let score = 98 - distanceKm * 4;
      if (!h.icuAvailable && (patient.emergencyLevel === 'HIGH' || patient.emergencyLevel === 'CRITICAL')) {
        score -= 20;
      }
      if (!h.bedsAvailable) {
        score -= 25;
      }
      if (!h.emergencyAvailable) {
        score -= 35;
      }
      if (h.rating >= 4.5) {
        score += 4;
      }

      // Cap between 40 and 99
      const aiMatchScore = Math.min(99, Math.max(40, Math.round(score)));

      return {
        ...h,
        distanceKm,
        etaMinutes,
        aiMatchScore,
      };
    });

    // Sort by AI Match Score descending
    const sorted = hospitals.sort((a, b) => b.aiMatchScore - a.aiMatchScore);

    // If excluded hospitals provided, mark them or place at bottom
    if (excludedHospitalIds.length > 0) {
      return sorted.map((h) => {
        if (excludedHospitalIds.includes(h.id)) {
          return {
            ...h,
            status: 'UNAVAILABLE' as const,
            emergencyAvailable: false,
            aiMatchScore: 30,
            aiMatchReason: 'Hospital unavailable for this patient (Confirmed capacity full via call)',
          };
        }
        return h;
      }).sort((a, b) => b.aiMatchScore - a.aiMatchScore);
    }

    return sorted;
  }

  // Get single hospital by ID
  public async getHospitalById(id: string): Promise<Hospital | undefined> {
    return NEARBY_HOSPITALS.find((h) => h.id === id);
  }

  // Score and recommend the top alternative hospital when primary is rejected
  public async getAlternativeRecommendation(
    currentLocation: LocationCoordinates,
    patient: Patient,
    rejectedHospitalId: string
  ): Promise<{ recommendedHospital: Hospital; reason: string; voiceHindi: string }> {
    const hospitals = await this.findNearbyHospitals(currentLocation, patient, [rejectedHospitalId]);
    const nextBest = hospitals.find((h) => h.id !== rejectedHospitalId && h.emergencyAvailable && h.bedsAvailable) || hospitals[0];

    const rejectedHospital = NEARBY_HOSPITALS.find((h) => h.id === rejectedHospitalId);
    const rejectedName = rejectedHospital ? rejectedHospital.name : 'Hospital';

    return {
      recommendedHospital: nextBest,
      reason: `Closest hospital (${nextBest.distanceKm} km, ETA ${nextBest.etaMinutes} min) with confirmed ${nextBest.icuBedCount} ICU beds and 24/7 cardiac trauma team.`,
      voiceHindi: `${rejectedName} abhi patient ko receive nahi kar sakta. Main aapko next nearest available hospital ${nextBest.name} par redirect kar raha hoon.`,
    };
  }
}

export const hospitalService = new HospitalService();
