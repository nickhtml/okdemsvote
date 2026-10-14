import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Coordinates {
  lat: number;
  lng: number;
}

interface PollingPlaceMapProps {
  homeAddress?: string;
  pollingLocationName: string;
  pollingAddress: string;
  homeCoords?: Coordinates;
  pollingCoords?: Coordinates;
}

// Quick geocode helper using public ArcGIS World Geocoding Service (CORS enabled)
async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${encodeURIComponent(address)}&f=json&maxLocations=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      const cand = data.candidates?.[0];
      if (cand?.location) {
        return { lat: cand.location.y, lng: cand.location.x };
      }
    }
  } catch (e) {
    console.warn("Geocoding failed for address:", address, e);
  }
  return null;
}

export function PollingPlaceMap({
  homeAddress,
  pollingLocationName,
  pollingAddress,
  homeCoords: initialHomeCoords,
  pollingCoords: initialPollingCoords
}: PollingPlaceMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [resolvedHome, setResolvedHome] = useState<Coordinates | null>(initialHomeCoords || null);
  const [resolvedPolling, setResolvedPolling] = useState<Coordinates | null>(initialPollingCoords || null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Resolve coordinates if not provided
  useEffect(() => {
    let isMounted = true;
    async function resolveLocations() {
      setIsLoading(true);
      let h = initialHomeCoords || resolvedHome;
      let p = initialPollingCoords || resolvedPolling;

      if (!h && homeAddress) {
        h = await geocodeAddress(homeAddress);
        if (isMounted && h) setResolvedHome(h);
      }
      if (!p && pollingAddress) {
        p = await geocodeAddress(`${pollingLocationName}, ${pollingAddress}`);
        if (!p) p = await geocodeAddress(pollingAddress);
        if (isMounted && p) setResolvedPolling(p);
      }
      if (isMounted) setIsLoading(false);
    }
    resolveLocations();
    return () => { isMounted = false; };
  }, [homeAddress, pollingAddress, pollingLocationName, initialHomeCoords, initialPollingCoords]);

  // 2. Render Map (Google Maps or Leaflet Carto Voyager)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!resolvedPolling && !resolvedHome) return;

    // Cleanup previous map if exists
    if (mapInstanceRef.current) {
      if (typeof mapInstanceRef.current.remove === 'function') {
        mapInstanceRef.current.remove();
      }
      mapInstanceRef.current = null;
    }

    const container = mapContainerRef.current;
    container.innerHTML = '';

    const googleApiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;
    const canUseGoogle = Boolean(googleApiKey && typeof window !== 'undefined');

    let isGoogleLoaded = Boolean((window as any).google?.maps?.Map);

    const initLeafletMap = () => {
      if (!container) return;
      container.innerHTML = '';
      const map = L.map(container, {
        zoomControl: false,
        attributionControl: false
      });

      // Carto Voyager tiles (clean Google-style palette with soft blue water, crisp roads and parks)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      // Add Zoom control to bottom right (matching Google Maps position)
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Home Marker Icon (Blue pin badge with white Home icon)
      const homeDivIcon = L.divIcon({
        className: 'custom-home-pin',
        html: `
          <div style="position: relative; width: 38px; height: 44px; display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));">
            <div style="width: 34px; height: 34px; background: #1d3557; border: 2.5px solid #ffffff; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #1d3557; margin-top: -1px;"></div>
          </div>
        `,
        iconSize: [38, 44],
        iconAnchor: [19, 42],
        popupAnchor: [0, -38]
      });

      // Polling Place Pin Icon (Google red teardrop pin with white center dot)
      const pollingDivIcon = L.divIcon({
        className: 'custom-polling-pin',
        html: `
          <div style="position: relative; width: 40px; height: 48px; display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.45));">
            <svg width="40" height="48" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 43C18 43 34 27.5 34 17C34 8.16344 26.8366 1 18 1C9.16344 1 2 8.16344 2 17C2 27.5 18 43 18 43Z" fill="#ea4335" stroke="#b91c1c" stroke-width="1.5"/>
              <circle cx="18" cy="17" r="6" fill="#ffffff"/>
            </svg>
          </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 46],
        popupAnchor: [0, -42]
      });

      const bounds = L.latLngBounds([]);

      if (resolvedHome) {
        const homeMarker = L.marker([resolvedHome.lat, resolvedHome.lng], { icon: homeDivIcon }).addTo(map);
        homeMarker.bindPopup(`<b>Your Address</b><br/>${homeAddress || 'Your home'}`);
        bounds.extend([resolvedHome.lat, resolvedHome.lng]);
      }

      if (resolvedPolling) {
        const pollingMarker = L.marker([resolvedPolling.lat, resolvedPolling.lng], { icon: pollingDivIcon }).addTo(map);
        pollingMarker.bindPopup(`<b>Polling Place</b><br/><b>${pollingLocationName}</b><br/>${pollingAddress}`);
        bounds.extend([resolvedPolling.lat, resolvedPolling.lng]);
      }

      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [35, 35],
          maxZoom: 16
        });
      } else if (resolvedPolling) {
        map.setView([resolvedPolling.lat, resolvedPolling.lng], 15);
      }

      mapInstanceRef.current = map;
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    };

    const initGoogleMap = () => {
      try {
        const google = (window as any).google;
        const map = new google.maps.Map(container, {
          zoom: 14,
          center: resolvedPolling ? { lat: resolvedPolling.lat, lng: resolvedPolling.lng } : { lat: 35.4676, lng: -97.5164 },
          zoomControl: true,
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false
        });

        const bounds = new google.maps.LatLngBounds();

        // Home Marker (Blue Pin with Home Icon)
        if (resolvedHome) {
          const homeIconSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="44" viewBox="0 0 38 44">
              <defs>
                <filter id="s" x="-20%" y="-10%" width="140%" height="130%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.4"/>
                </filter>
              </defs>
              <g filter="url(#s)">
                <rect x="2" y="2" width="34" height="34" rx="8" fill="#1d3557" stroke="#ffffff" stroke-width="2.5"/>
                <polygon points="19,43 13,35 25,35" fill="#1d3557"/>
                <path d="M19 11 L11 18 L13.5 18 L13.5 26 L17.5 26 L17.5 21 L20.5 21 L20.5 26 L24.5 26 L24.5 18 L27 18 Z" fill="#ffffff"/>
              </g>
            </svg>
          `)}`;

          const homeMarker = new google.maps.Marker({
            position: { lat: resolvedHome.lat, lng: resolvedHome.lng },
            map,
            title: `Your Address: ${homeAddress || ''}`,
            icon: {
              url: homeIconSvg,
              scaledSize: new google.maps.Size(38, 44),
              anchor: new google.maps.Point(19, 43)
            }
          });

          const homeInfoWindow = new google.maps.InfoWindow({
            content: `<div style="font-family:sans-serif;font-size:12px;color:#1d3557;font-weight:bold;">🏠 Your Address<br/><span style="font-weight:normal;color:#4b5563;">${homeAddress || ''}</span></div>`
          });
          homeMarker.addListener('click', () => homeInfoWindow.open(map, homeMarker));
          bounds.extend(homeMarker.getPosition());
        }

        // Polling Place Marker (Google Red Pin)
        if (resolvedPolling) {
          const pollingPinSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 36 44">
              <defs>
                <filter id="s" x="-20%" y="-10%" width="140%" height="130%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.45"/>
                </filter>
              </defs>
              <g filter="url(#s)">
                <path d="M18 43C18 43 34 27.5 34 17C34 8.16344 26.8366 1 18 1C9.16344 1 2 8.16344 2 17C2 27.5 18 43 18 43Z" fill="#ea4335" stroke="#b91c1c" stroke-width="1.5"/>
                <circle cx="18" cy="17" r="6" fill="#ffffff"/>
              </g>
            </svg>
          `)}`;

          const pollingMarker = new google.maps.Marker({
            position: { lat: resolvedPolling.lat, lng: resolvedPolling.lng },
            map,
            title: `Polling Place: ${pollingLocationName}`,
            icon: {
              url: pollingPinSvg,
              scaledSize: new google.maps.Size(38, 46),
              anchor: new google.maps.Point(19, 43)
            }
          });

          const pollingInfoWindow = new google.maps.InfoWindow({
            content: `<div style="font-family:sans-serif;font-size:12px;color:#1d3557;"><b>📍 ${pollingLocationName}</b><br/><span style="font-size:11px;color:#4b5563;">${pollingAddress}</span></div>`
          });
          pollingMarker.addListener('click', () => pollingInfoWindow.open(map, pollingMarker));
          bounds.extend(pollingMarker.getPosition());
        }

        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { top: 35, right: 35, bottom: 35, left: 35 });
        }

        mapInstanceRef.current = map;
      } catch (err) {
        console.warn("Google Maps init failed, using Leaflet fallback:", err);
        initLeafletMap();
      }
    };

    if (canUseGoogle) {
      if (isGoogleLoaded) {
        initGoogleMap();
      } else {
        // Load Google Maps script with safety timeout
        const scriptId = 'google-maps-js-sdk';
        let script = document.getElementById(scriptId) as HTMLScriptElement;
        if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}`;
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
        }

        const onLoad = () => {
          initGoogleMap();
        };
        const onError = () => {
          initLeafletMap();
        };

        script.addEventListener('load', onLoad);
        script.addEventListener('error', onError);

        // Timeout fallback if script takes too long or fails silently
        const fallbackTimer = setTimeout(() => {
          if (!mapInstanceRef.current) {
            initLeafletMap();
          }
        }, 2500);

        return () => {
          clearTimeout(fallbackTimer);
          script.removeEventListener('load', onLoad);
          script.removeEventListener('error', onError);
        };
      }
    } else {
      initLeafletMap();
    }

    return () => {
      if (mapInstanceRef.current && typeof mapInstanceRef.current.remove === 'function') {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [resolvedHome, resolvedPolling, homeAddress, pollingAddress, pollingLocationName]);

  return (
    <div className="w-full my-2">
      {/* Map Canvas */}
      <div className="w-full h-48 sm:h-52 md:h-56 border-2 border-[#1d3557] shadow-inner bg-slate-100 relative overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {isLoading && !resolvedPolling && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#1d3557]">
              <span className="w-3.5 h-3.5 border-2 border-[#1d3557] border-t-transparent rounded-full animate-spin"></span>
              <span>Loading map...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
