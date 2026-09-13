'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useDriver } from '@/context/DriverContext';

export default function FallbackMapInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const accuracyRef = useRef<L.Circle | null>(null);
  const { currentLocation, gpsStatus, gpsAccuracyMeters, routeCoordinates, booking, tripStatus, selectedHospital } = useDriver();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { center: [currentLocation.lat, currentLocation.lng], zoom: 14, zoomControl: false, attributionControl: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 20, subdomains: 'abcd' }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (gpsStatus !== 'LIVE') { if (driverMarkerRef.current) driverMarkerRef.current.setOpacity(0); return; }
    const icon = L.divIcon({ className: 'driver-live-dot', html: '<div class="fallback-gps-dot"><span></span></div>', iconSize: [50, 50], iconAnchor: [25, 25] });
    if (!driverMarkerRef.current) driverMarkerRef.current = L.marker([currentLocation.lat, currentLocation.lng], { icon, zIndexOffset: 2000 }).addTo(map);
    else { driverMarkerRef.current.setLatLng([currentLocation.lat, currentLocation.lng]); driverMarkerRef.current.setOpacity(1); }
    if (!accuracyRef.current) accuracyRef.current = L.circle([currentLocation.lat, currentLocation.lng], { radius: gpsAccuracyMeters || 25, color: '#1a73e8', weight: 1, fillColor: '#1a73e8', fillOpacity: 0.12 }).addTo(map);
    else { accuracyRef.current.setLatLng([currentLocation.lat, currentLocation.lng]); accuracyRef.current.setRadius(gpsAccuracyMeters || 25); }
    if (tripStatus === 'EN_ROUTE_TO_CUSTOMER' || tripStatus === 'EN_ROUTE_TO_HOSPITAL') map.panTo([currentLocation.lat, currentLocation.lng], { animate: true, duration: 0.5 });
  }, [currentLocation, gpsStatus, gpsAccuracyMeters, tripStatus]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (routeRef.current) { map.removeLayer(routeRef.current); routeRef.current = null; }
    if (routeCoordinates.length > 1) routeRef.current = L.polyline(routeCoordinates, { color: '#1967d2', weight: 6, opacity: 0.92 }).addTo(map);
    if (pickupMarkerRef.current) { map.removeLayer(pickupMarkerRef.current); pickupMarkerRef.current = null; }
    const target = selectedHospital ? selectedHospital.coordinates : booking?.pickupLocation.coordinates;
    if (target) {
      const label = selectedHospital ? 'H' : '•';
      const color = selectedHospital ? '#e53935' : '#0f9d58';
      pickupMarkerRef.current = L.marker([target.lat, target.lng], { icon: L.divIcon({ className: 'destination-dot', html: `<div style="width:32px;height:32px;border-radius:50%;border:3px solid white;background:${color};color:white;display:grid;place-items:center;font-weight:900;font-size:17px;box-shadow:0 3px 10px rgba(0,0,0,.3)">${label}</div>`, iconSize: [32, 32], iconAnchor: [16, 16] }) }).addTo(map);
    }
  }, [routeCoordinates, booking, selectedHospital]);

  useEffect(() => {
    const recenter = () => mapRef.current?.setView([currentLocation.lat, currentLocation.lng], 16, { animate: true });
    window.addEventListener('savife:recenter-map', recenter);
    return () => window.removeEventListener('savife:recenter-map', recenter);
  }, [currentLocation]);

  return <div ref={containerRef} className="w-full h-full" aria-label="Live fallback map" />;
}
