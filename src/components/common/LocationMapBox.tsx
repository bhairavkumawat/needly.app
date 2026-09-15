import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  ExternalLink, 
  Copy, 
  Check, 
  Compass, 
  Navigation
} from 'lucide-react';
import { LocationInfo } from '../../types';
import { useApp } from '../../context/AppContext';

interface LocationMapBoxProps {
  location?: LocationInfo;
  title: string;
  itemType?: 'product' | 'service';
  distanceKm?: number;
}

const DEFAULT_FALLBACK_LOCATION: LocationInfo = {
  city: 'Udaipur',
  area: 'Fatehsagar & Panchwati',
  state: 'Rajasthan',
  pincode: '313001',
  latitude: 24.5854,
  longitude: 73.7125,
  displayName: 'Fatehsagar, Udaipur'
};

export const LocationMapBox: React.FC<LocationMapBoxProps> = ({
  location: locationProp,
  title,
  itemType = 'product',
  distanceKm
}) => {
  const { currentLocation } = useApp();
  // Use listing's own location (where it was created), falling back to current location or default
  const location = locationProp || currentLocation || DEFAULT_FALLBACK_LOCATION;
  const [copied, setCopied] = useState(false);
  const [liveDistance, setLiveDistance] = useState<number | null>(distanceKm ?? null);
  const [zoomLevel, setZoomLevel] = useState<number>(14);

  const lat = location.latitude || 24.5854;
  const lng = location.longitude || 73.7125;

  // Detect Android device
  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

  // Calculate approximate distance between user's current location and listing location (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  useEffect(() => {
    if (currentLocation?.latitude && currentLocation?.longitude) {
      const d = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        lat,
        lng
      );
      setLiveDistance(d > 0.05 ? d : 0.1);
    }
  }, [currentLocation, lat, lng]);

  const handleCopyCoords = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${lat}, ${lng}`);
      }
    } catch {
      // Gracefully handle iframe clipboard permission rejections
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Google Maps URLs & Android Intents for listing origin
  const webGoogleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
  const webDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}`;
  const androidDirectionsIntent = `google.navigation:q=${lat},${lng}&mode=d`;
  const androidGeoIntent = `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(location.displayName || title)})`;

  const handleOpenDirections = () => {
    if (isAndroid) {
      // Launch Android native Google Maps Navigation intent
      window.location.href = androidDirectionsIntent;
      setTimeout(() => {
        window.open(webDirectionsUrl, '_blank', 'noopener,noreferrer');
      }, 1500);
    } else {
      window.open(webDirectionsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenGoogleMaps = () => {
    if (isAndroid) {
      // Launch Android native Google Maps app via geo: intent
      window.location.href = androidGeoIntent;
      setTimeout(() => {
        window.open(webGoogleMapsUrl, '_blank', 'noopener,noreferrer');
      }, 1500);
    } else {
      window.open(webGoogleMapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Google Maps embed URL centered on listing coordinates
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=${zoomLevel}&output=embed`;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-normal text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-teal-600" />
          <span>{itemType === 'product' ? 'Pickup Location & Map' : 'Service Location & Coverage Area'}</span>
        </h3>
        {liveDistance !== null && (
          <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-normal rounded-lg border border-teal-200/80 flex items-center gap-1">
            <Compass className="w-3 h-3 text-teal-600" />
            <span>~{liveDistance} km away</span>
          </span>
        )}
      </div>

      {/* Google Maps Card Container */}
      <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 shadow-xs group">
        {/* Interactive Google Map Frame */}
        <div className="h-48 sm:h-52 w-full relative bg-slate-200">
          <iframe
            title={`Google Map for ${title}`}
            src={googleMapsEmbedUrl}
            className="w-full h-full border-0 pointer-events-auto"
            loading="lazy"
            allowFullScreen
          />

          {/* Floating Controls Overlay: Google Maps Badge + Zoom Controls */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
            <div className="px-2 py-1 bg-white/95 backdrop-blur-md text-slate-700 text-[10px] font-normal rounded-lg shadow-sm border border-slate-200/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Google Maps</span>
            </div>
            <div className="flex bg-white/95 backdrop-blur-md rounded-lg shadow-sm border border-slate-200/80 overflow-hidden">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(prev + 1, 19))}
                className="w-7 h-7 flex items-center justify-center font-normal text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Zoom In"
              >
                +
              </button>
              <div className="w-[1px] bg-slate-200" />
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(prev - 1, 10))}
                className="w-7 h-7 flex items-center justify-center font-normal text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                −
              </button>
            </div>
          </div>

          {/* Floating Origin Area Pill (Top Left: Location from where the listing was made) */}
          <div className="absolute top-2.5 left-2.5 z-10 max-w-[70%]">
            <div className="px-2.5 py-1 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-normal rounded-lg shadow-md flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">
                {location.area ? `${location.area}, ` : ''}{location.city}
              </span>
            </div>
          </div>

          {/* Google Maps Directions Button (with Android Native Intent) */}
          <button
            type="button"
            onClick={handleOpenDirections}
            className="absolute bottom-2.5 right-2.5 z-10 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-normal rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 hover:opacity-95"
            title={isAndroid ? 'Open Android Google Maps Navigation' : 'Open Google Maps Directions'}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{isAndroid ? 'Navigate' : 'Directions'}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-80" />
          </button>
        </div>

        {/* Location Details Footer - Place of listing */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
              <MapPin className="w-4 h-4 text-teal-600" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-normal text-slate-900 truncate flex items-center gap-1.5">
                <span>{location.displayName || `${location.area ? `${location.area}, ` : ''}${location.city}`}</span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span>Listed in {location.area ? `${location.area}, ` : ''}{location.city}</span>
                {location.state && <span>• {location.state}</span>}
                {location.pincode && <span>• PIN: {location.pincode}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleCopyCoords}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Copy GPS coordinates"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            </button>
            <button
              type="button"
              onClick={handleOpenGoogleMaps}
              className="p-2 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title={isAndroid ? 'Open in Google Maps Android App' : 'Open in Google Maps'}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
