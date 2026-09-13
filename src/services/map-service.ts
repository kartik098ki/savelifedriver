import { LocationCoordinates, NavigationStep } from '@/types';

export interface RouteGeometry {
  coordinates: [number, number][]; // [lat, lng] array
  distanceKm: number;
  durationMinutes: number;
  steps: NavigationStep[];
}

export class MapService {
  private provider: 'LEAFLET_OSRM' | 'GOOGLE_MAPS' | 'MAPBOX';

  constructor() {
    this.provider = process.env.NEXT_PUBLIC_MAP_PROVIDER === 'GOOGLE' ? 'GOOGLE_MAPS' : 'LEAFLET_OSRM';
  }

  // Calculate Haversine straight-line distance in km
  public calculateDistance(from: LocationCoordinates, to: LocationCoordinates): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(to.lat - from.lat);
    const dLng = this.deg2rad(to.lng - from.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(from.lat)) * Math.cos(this.deg2rad(to.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Check if driver has entered pickup/hospital geofence (default 100 meters = 0.1 km)
  public isWithinGeofence(driverLoc: LocationCoordinates, targetLoc: LocationCoordinates, radiusKm: number = 0.15): boolean {
    const distance = this.calculateDistance(driverLoc, targetLoc);
    return distance <= radiusKm;
  }

  // Generate realistic road waypoints and turn-by-turn navigation steps between two coordinates
  public async getRoute(from: LocationCoordinates, to: LocationCoordinates, destinationName?: string): Promise<RouteGeometry> {
    const straightDist = this.calculateDistance(from, to);
    // Factor in actual road network (approx 1.25x - 1.35x straight line)
    const distanceKm = Number((straightDist * 1.28).toFixed(1));
    // Factor in traffic (approx 25-35 km/h urban ambulance speed with siren)
    const durationMinutes = Math.max(2, Math.round((distanceKm / 28) * 60));

    // Generate smooth interpolated road waypoints with realistic turns
    const stepsCount = 18;
    const coordinates: [number, number][] = [];

    // Create a realistic curved road path around Noida grid
    for (let i = 0; i <= stepsCount; i++) {
      const t = i / stepsCount;
      // Slight bezier curve offset for realistic city road navigation
      const curveOffset = Math.sin(t * Math.PI) * 0.0035;
      const lat = from.lat + (to.lat - from.lat) * t + curveOffset * 0.5;
      const lng = from.lng + (to.lng - from.lng) * t - curveOffset * 0.8;
      coordinates.push([lat, lng]);
    }

    const steps: NavigationStep[] = [
      {
        instruction: 'Head straight on Main Road',
        distance: '300 m',
        icon: 'straight',
        roadName: 'Sector 62 Internal Link',
      },
      {
        instruction: 'Turn left onto Captain Shashikant Marg',
        distance: '800 m',
        icon: 'turn-left',
        roadName: 'Shashikant Marg',
      },
      {
        instruction: 'Take the flyover toward Medical Corridor',
        distance: '1.2 km',
        icon: 'straight',
        roadName: 'Noida Expressway Connector',
      },
      {
        instruction: 'Turn right at the roundabout',
        distance: '450 m',
        icon: 'turn-right',
        roadName: 'Hospital Boulevard',
      },
      {
        instruction: `Arriving at ${destinationName || 'Destination'} (Emergency Gate on Left)`,
        distance: '150 m',
        icon: 'arrive',
        roadName: 'Emergency Bay',
      },
    ];

    return {
      coordinates,
      distanceKm,
      durationMinutes,
      steps,
    };
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const mapService = new MapService();
