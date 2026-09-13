'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDriver } from '@/context/DriverContext';
import { HIGH_DEMAND_ZONES, STANDBY_AMBULANCES, INITIAL_PICKUP_LOCATION } from '@/lib/constants';
import L from 'leaflet';
import { Flame, Layers, Shield } from 'lucide-react';

export default function MapInner() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const pickupGeofenceRef = useRef<L.Circle | null>(null);
  const hospitalMarkerRef = useRef<L.Marker | null>(null);
  const hospitalGeofenceRef = useRef<L.Circle | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const polylineCasingRef = useRef<L.Polyline | null>(null);
  const trafficMarkersRef = useRef<L.Marker[]>([]);
  const demandLayersRef = useRef<L.Layer[]>([]);
  const standbyAmbulanceMarkersRef = useRef<L.Marker[]>([]);

  const [showSurgeZones, setShowSurgeZones] = useState<boolean>(true);

  const { currentLocation, routeCoordinates, tripStatus, selectedHospital, trafficLights } = useDriver();

  // Initialize Clean Bright White Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [currentLocation.lat, currentLocation.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Pristine Light Street Map (CartoDB Voyager)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render Demand Surge Zones (Uber/Rapido style)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear previous demand layers
    demandLayersRef.current.forEach((layer) => map.removeLayer(layer));
    demandLayersRef.current = [];

    if (!showSurgeZones) return;

    HIGH_DEMAND_ZONES.forEach((zone) => {
      const isSurge = zone.type === 'HIGH_DEMAND' || zone.type === 'SURGE_EMERGENCY';
      const color = isSurge ? '#EA580C' : '#059669';
      const fillColor = isSurge ? '#F97316' : '#10B981';

      // Circle polygon
      const circle = L.circle([zone.lat, zone.lng], {
        radius: zone.radiusMeters,
        color: color,
        fillColor: fillColor,
        fillOpacity: isSurge ? 0.14 : 0.08,
        weight: 1.5,
        dashArray: isSurge ? '4, 4' : undefined,
      }).addTo(map);
      demandLayersRef.current.push(circle);

      // Zone Label Badge
      const labelIcon = L.divIcon({
        className: 'demand-zone-badge',
        html: `
          <div style="
            background: #FFFFFF;
            border: 1.5px solid ${color};
            border-radius: 12px;
            padding: 3px 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
            font-size: 10px;
            font-weight: 800;
            color: ${color};
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
          ">
            <span>${isSurge ? '🔥' : '🟢'}</span>
            <span>${zone.name}</span>
            <span style="background: ${isSurge ? '#FFEDD5' : '#D1FAE5'}; color: ${color}; padding: 1px 4px; border-radius: 6px; font-size: 9px;">${zone.surgeMultiplier}</span>
          </div>
        `,
        iconSize: [220, 26],
        iconAnchor: [110, 13],
      });

      const labelMarker = L.marker([zone.lat, zone.lng], { icon: labelIcon }).addTo(map);
      demandLayersRef.current.push(labelMarker);
    });

    // Standby Ambulances Network
    STANDBY_AMBULANCES.forEach((amb) => {
      const ambIcon = L.divIcon({
        className: 'standby-amb-marker',
        html: `
          <div style="
            background: #FFFFFF;
            border: 1.5px solid #0284C7;
            border-radius: 20px;
            padding: 2px 7px;
            box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);
            font-size: 9px;
            font-weight: 800;
            color: #0369A1;
            display: flex;
            align-items: center;
            gap: 3px;
            white-space: nowrap;
          ">
            <span>🚑</span>
            <span>${amb.id}</span>
          </div>
        `,
        iconSize: [110, 22],
        iconAnchor: [55, 11],
      });

      const ambMarker = L.marker([amb.lat, amb.lng], { icon: ambIcon }).addTo(map);
      standbyAmbulanceMarkersRef.current.push(ambMarker);
      demandLayersRef.current.push(ambMarker);
    });
  }, [showSurgeZones]);

  // Ambulance Marker Update (Emerald Pulsing Marker)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const navigationIcon = L.divIcon({
      className: 'custom-navigation-icon',
      html: `
        <div class="navigation-marker-container">
          <div style="
            position: absolute;
            inset: -8px;
            border-radius: 50%;
            background: rgba(5, 150, 105, 0.25);
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            width: 44px;
            height: 44px;
            background: #059669;
            border: 3.5px solid #FFFFFF;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 18px rgba(5, 150, 105, 0.5), 0 2px 8px rgba(0, 0, 0, 0.15);
            position: relative;
            z-index: 20;
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="m5 19 14-7L5 5v5l10 2-10 2v5Z" fill="#FFFFFF" stroke="#FFFFFF"></path>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    if (!markerRef.current) {
      markerRef.current = L.marker([currentLocation.lat, currentLocation.lng], {
        icon: navigationIcon,
        zIndexOffset: 1000,
      }).addTo(mapInstanceRef.current);
    } else {
      markerRef.current.setLatLng([currentLocation.lat, currentLocation.lng]);
    }

    if (tripStatus === 'EN_ROUTE_TO_CUSTOMER' || tripStatus === 'EN_ROUTE_TO_HOSPITAL') {
      mapInstanceRef.current.panTo([currentLocation.lat, currentLocation.lng], { animate: true, duration: 0.3 });
    }
  }, [currentLocation, tripStatus]);

  // Traffic Lights & Routes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove old traffic markers
    trafficMarkersRef.current.forEach((m) => map.removeLayer(m));
    trafficMarkersRef.current = [];

    // Render Traffic Lights along route
    trafficLights.forEach((tl) => {
      const icon = L.divIcon({
        className: 'traffic-light-icon',
        html: `
          <div style="
            background: #FFFFFF;
            border: 1.5px solid #CBD5E1;
            padding: 3px 6px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 10px;
            font-weight: 800;
          ">
            <span>🚦</span>
            <span style="color: ${tl.status === 'GREEN' ? '#059669' : '#D97706'}">${tl.label}</span>
          </div>
        `,
        iconSize: [120, 24],
        iconAnchor: [60, 12],
      });
      const marker = L.marker([tl.lat, tl.lng], { icon }).addTo(map);
      trafficMarkersRef.current.push(marker);
    });

    // Clean up old polylines
    if (polylineCasingRef.current) {
      map.removeLayer(polylineCasingRef.current);
      polylineCasingRef.current = null;
    }
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    // Draw route if active
    if (routeCoordinates.length > 1) {
      const latLngs: L.LatLngExpression[] = routeCoordinates.map((c) => [c[0], c[1]]);

      polylineCasingRef.current = L.polyline(latLngs, {
        color: '#FFFFFF',
        weight: 8,
        opacity: 0.9,
      }).addTo(map);

      polylineRef.current = L.polyline(latLngs, {
        color: '#059669',
        weight: 6,
        opacity: 1,
      }).addTo(map);

      map.fitBounds(polylineCasingRef.current.getBounds(), { padding: [60, 60], maxZoom: 16 });
    }

    // Customer Pickup Pin
    const pickupIcon = L.divIcon({
      className: 'pickup-icon',
      html: `
        <div style="
          background: #0284C7;
          color: #FFFFFF;
          border: 2px solid #FFFFFF;
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
          white-space: nowrap;
        ">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #FFFFFF; display: inline-block;"></span>
          PICKUP: SHIPRA SUN CITY (4 MIN)
        </div>
      `,
      iconSize: [210, 30],
      iconAnchor: [105, 15],
    });

    if (tripStatus !== 'OFFLINE' && tripStatus !== 'COMPLETED') {
      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = L.marker([INITIAL_PICKUP_LOCATION.coordinates.lat, INITIAL_PICKUP_LOCATION.coordinates.lng], { icon: pickupIcon }).addTo(map);
      }
      if (!pickupGeofenceRef.current) {
        pickupGeofenceRef.current = L.circle([INITIAL_PICKUP_LOCATION.coordinates.lat, INITIAL_PICKUP_LOCATION.coordinates.lng], {
          radius: 150,
          color: '#0284C7',
          fillColor: '#0284C7',
          fillOpacity: 0.12,
          weight: 2,
        }).addTo(map);
      }
    } else {
      if (pickupMarkerRef.current) {
        map.removeLayer(pickupMarkerRef.current);
        pickupMarkerRef.current = null;
      }
      if (pickupGeofenceRef.current) {
        map.removeLayer(pickupGeofenceRef.current);
        pickupGeofenceRef.current = null;
      }
    }

    // Hospital Marker
    if (selectedHospital && (tripStatus === 'HOSPITAL_CONFIRMATION' || tripStatus === 'EN_ROUTE_TO_HOSPITAL' || tripStatus === 'ARRIVED_AT_HOSPITAL')) {
      const hospitalIcon = L.divIcon({
        className: 'hospital-icon',
        html: `
          <div style="
            background: #059669;
            color: #FFFFFF;
            border: 2px solid #FFFFFF;
            border-radius: 20px;
            padding: 5px 12px;
            font-size: 11px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 4px 14px rgba(5, 150, 105, 0.4);
            white-space: nowrap;
          ">
            <span>🏥</span>
            ${selectedHospital.name.toUpperCase()} (CONFIRMED)
          </div>
        `,
        iconSize: [200, 32],
        iconAnchor: [100, 16],
      });

      if (!hospitalMarkerRef.current) {
        hospitalMarkerRef.current = L.marker([selectedHospital.coordinates.lat, selectedHospital.coordinates.lng], {
          icon: hospitalIcon,
        }).addTo(map);
      } else {
        hospitalMarkerRef.current.setLatLng([selectedHospital.coordinates.lat, selectedHospital.coordinates.lng]);
      }

      if (!hospitalGeofenceRef.current) {
        hospitalGeofenceRef.current = L.circle([selectedHospital.coordinates.lat, selectedHospital.coordinates.lng], {
          radius: 180,
          color: '#059669',
          fillColor: '#059669',
          fillOpacity: 0.15,
          weight: 2,
        }).addTo(map);
      }
    } else {
      if (hospitalMarkerRef.current) {
        map.removeLayer(hospitalMarkerRef.current);
        hospitalMarkerRef.current = null;
      }
      if (hospitalGeofenceRef.current) {
        map.removeLayer(hospitalGeofenceRef.current);
        hospitalGeofenceRef.current = null;
      }
    }
  }, [routeCoordinates, tripStatus, selectedHospital, trafficLights]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Map Floating Badge: Demand Surge Toggle */}
      <div className="absolute top-4 right-4 z-[400] flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setShowSurgeZones(!showSurgeZones)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border transition-all ${
            showSurgeZones
              ? 'bg-white text-orange-700 border-orange-200'
              : 'bg-white/90 text-slate-600 border-slate-200'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${showSurgeZones ? 'text-orange-600 animate-pulse' : 'text-slate-400'}`} />
          <span>{showSurgeZones ? 'Emergency Surge: ON' : 'Surge: Hidden'}</span>
        </button>
      </div>
    </div>
  );
}
