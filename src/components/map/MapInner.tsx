'use client';

import React, { useEffect, useRef } from 'react';
import { useDriver } from '@/context/DriverContext';
import L from 'leaflet';

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

  const { currentLocation, routeCoordinates, tripStatus, selectedHospital, trafficLights } = useDriver();

  // Initialize Clean Light Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [currentLocation.lat, currentLocation.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Pristine Light Street Map
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

  // Ambulance Marker Update
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const navigationIcon = L.divIcon({
      className: 'custom-navigation-icon',
      html: `
        <div class="navigation-marker-container">
          <div class="beacon-pulse-blue"></div>
          <div style="
            width: 42px;
            height: 42px;
            background: #2563EB;
            border: 3px solid #FFFFFF;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(37, 99, 235, 0.45), 0 2px 6px rgba(0, 0, 0, 0.15);
            position: relative;
            z-index: 20;
          ">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="m5 19 14-7L5 5v5l10 2-10 2v5Z" fill="#FFFFFF" stroke="#FFFFFF"></path>
            </svg>
          </div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
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
        color: '#2563EB',
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
          LIVE CUSTOMER PICKUP
        </div>
      `,
      iconSize: [170, 30],
      iconAnchor: [85, 15],
    });

    if (tripStatus !== 'OFFLINE' && tripStatus !== 'COMPLETED') {
      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = L.marker([28.628, 77.3685], { icon: pickupIcon }).addTo(map);
      }
      if (!pickupGeofenceRef.current) {
        pickupGeofenceRef.current = L.circle([28.628, 77.3685], {
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
        iconSize: [180, 32],
        iconAnchor: [90, 16],
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

  return <div ref={mapContainerRef} className="w-full h-full min-h-[400px] relative" />;
}
