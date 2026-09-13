'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDriver } from '@/context/DriverContext';
import FallbackMapInner from './FallbackMapInner';

declare global {
  interface Window { google?: any; }
}

const GOOGLE_MAPS_SCRIPT_ID = 'savife-google-maps';

function loadGoogleMaps(apiKey: string): Promise<any> {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  return new Promise((resolve, reject) => {
    const previous = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    if (previous) {
      previous.addEventListener('load', () => resolve(window.google?.maps), { once: true });
      previous.addEventListener('error', () => reject(new Error('Google Maps did not load')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
    script.onload = () => window.google?.maps ? resolve(window.google.maps) : reject(new Error('Google Maps unavailable'));
    script.onerror = () => reject(new Error('Google Maps could not be loaded'));
    document.head.appendChild(script);
  });
}

export default function GoogleMapInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const locationMarkerRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const hospitalMarkerRef = useRef<any>(null);
  const routeRendererRef = useRef<any>(null);
  const trafficRef = useRef<any>(null);
  const [error, setError] = useState('');
  const { currentLocation, routeCoordinates, tripStatus, selectedHospital, booking, gpsStatus } = useDriver();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!containerRef.current) return;
    if (!apiKey) { setError('Google Maps key is not configured.'); return; }
    let cancelled = false;
    loadGoogleMaps(apiKey).then((maps) => {
      if (cancelled || !containerRef.current) return;
      const map = new maps.Map(containerRef.current, {
        center: currentLocation,
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: { position: maps.ControlPosition.RIGHT_BOTTOM },
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        gestureHandling: 'greedy',
        styles: [
          { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        ],
      });
      mapRef.current = map;
      trafficRef.current = new maps.TrafficLayer();
      trafficRef.current.setMap(map);
      routeRendererRef.current = new maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: { strokeColor: '#1967D2', strokeOpacity: 0.92, strokeWeight: 6 },
      });
    }).catch((loadError) => setError(loadError.message || 'Google Maps could not be loaded.'));
    return () => { cancelled = true; };
  }, [apiKey]);

  useEffect(() => {
    const maps = window.google?.maps;
    const map = mapRef.current;
    if (!maps || !map) return;
    if (gpsStatus !== 'LIVE') {
      if (locationMarkerRef.current) locationMarkerRef.current.setMap(null);
      return;
    }
    const position = new maps.LatLng(currentLocation.lat, currentLocation.lng);
    const icon = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg width="62" height="62" viewBox="0 0 62 62" xmlns="http://www.w3.org/2000/svg"><circle cx="31" cy="31" r="27" fill="#1A73E8" fill-opacity=".16"/><circle cx="31" cy="31" r="16" fill="#1A73E8" stroke="#fff" stroke-width="4"/><circle cx="31" cy="31" r="5" fill="#fff"/></svg>`),
      scaledSize: new maps.Size(62, 62), anchor: new maps.Point(31, 31),
    };
    if (!locationMarkerRef.current) locationMarkerRef.current = new maps.Marker({ map, position, icon, zIndex: 10, title: 'Driver live GPS location' });
    else { locationMarkerRef.current.setMap(map); locationMarkerRef.current.setPosition(position); locationMarkerRef.current.setIcon(icon); }
    if (tripStatus === 'EN_ROUTE_TO_CUSTOMER' || tripStatus === 'EN_ROUTE_TO_HOSPITAL') map.panTo(position);
  }, [currentLocation, gpsStatus, tripStatus]);

  useEffect(() => {
    const recenter = () => mapRef.current?.panTo(currentLocation);
    window.addEventListener('savife:recenter-map', recenter);
    return () => window.removeEventListener('savife:recenter-map', recenter);
  }, [currentLocation]);

  useEffect(() => {
    const maps = window.google?.maps;
    const map = mapRef.current;
    if (!maps || !map) return;
    if (pickupMarkerRef.current) pickupMarkerRef.current.setMap(null);
    if (booking && !['OFFLINE', 'COMPLETED', 'EN_ROUTE_TO_HOSPITAL', 'ARRIVED_AT_HOSPITAL'].includes(tripStatus)) {
      pickupMarkerRef.current = new maps.Marker({
        map, position: booking.pickupLocation.coordinates, title: 'Customer pickup',
        icon: { path: maps.SymbolPath.CIRCLE, fillColor: '#0F9D58', fillOpacity: 1, strokeColor: '#FFFFFF', strokeWeight: 3, scale: 8 },
      });
    }
    if (hospitalMarkerRef.current) hospitalMarkerRef.current.setMap(null);
    if (selectedHospital) {
      hospitalMarkerRef.current = new maps.Marker({
        map, position: selectedHospital.coordinates, title: selectedHospital.name,
        label: { text: 'H', color: '#FFFFFF', fontWeight: '700' },
        icon: { path: maps.SymbolPath.CIRCLE, fillColor: '#E53935', fillOpacity: 1, strokeColor: '#FFFFFF', strokeWeight: 3, scale: 12 },
      });
    }
  }, [booking, selectedHospital, tripStatus]);

  useEffect(() => {
    const maps = window.google?.maps;
    const renderer = routeRendererRef.current;
    if (!maps || !renderer) return;
    if (routeCoordinates.length < 2) { renderer.set('directions', null); return; }
    const origin = routeCoordinates[0];
    const destination = routeCoordinates[routeCoordinates.length - 1];
    const service = new maps.DirectionsService();
    service.route({ origin: { lat: origin[0], lng: origin[1] }, destination: { lat: destination[0], lng: destination[1] }, travelMode: maps.TravelMode.DRIVING, drivingOptions: { departureTime: new Date(), trafficModel: maps.TrafficModel.BEST_GUESS } }, (result: any, status: string) => {
      if (status === 'OK') renderer.setDirections(result);
    });
  }, [routeCoordinates]);

  if (error) return <FallbackMapInner />;
  return <div ref={containerRef} className="w-full h-full" aria-label="Live Google Map" />;
}
