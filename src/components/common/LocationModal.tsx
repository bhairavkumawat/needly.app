import React, { useState } from 'react';
import { ArrowLeft, Navigation, MapPin, Check, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LOCATIONS } from '../../data/mockData';
import { LocationInfo } from '../../types';

export const LocationModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentLocation, setCurrentLocation, detectGPSLocation } = useApp();
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customArea, setCustomArea] = useState('');

  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleGPS = async () => {
    setIsDetecting(true);
    setGpsError(null);
    const success = await detectGPSLocation();
    setIsDetecting(false);
    if (success) {
      onClose();
    } else {
      setGpsError('Could not retrieve GPS coordinates. Please check your browser/phone location permissions, or choose an area below.');
    }
  };

  const handleSelectLocation = (loc: LocationInfo) => {
    setCurrentLocation(loc);
    onClose();
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCity.trim()) return;
    const newLoc: LocationInfo = {
      city: customCity.trim(),
      area: customArea.trim() || 'Central District',
      state: 'Local Area',
      latitude: 24.58,
      longitude: 73.71,
      displayName: `${customArea.trim() ? customArea.trim() + ', ' : ''}${customCity.trim()}`
    };
    setCurrentLocation(newLoc);
    onClose();
  };

  const filteredLocations = LOCATIONS.filter(l => 
    l.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-slate-900/40 backdrop-blur-xs">
      <div 
        id="location-screen-container" 
        className="bg-white w-full max-w-lg h-full min-h-[100dvh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Mobile App Bar */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              aria-label="Back"
              className="p-2 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors active:scale-95 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-normal text-slate-900">Choose Location</h2>
              <p className="text-[11px] text-slate-500">Discover rental gear &amp; services in your neighborhood</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 bg-slate-50/50">
          {/* GPS Button */}
          <button
            onClick={handleGPS}
            disabled={isDetecting}
            className="w-full flex items-center justify-between p-3.5 bg-teal-50 hover:bg-teal-100/70 rounded-2xl text-teal-700 transition-colors active:scale-[0.99] border border-teal-200/70 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-xs">
                <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
              </div>
              <div className="text-left">
                <div className="text-xs font-normal text-teal-950 flex items-center gap-1.5">
                  <span>Use Live GPS Location</span>
                  <span className="px-1.5 py-0.2 bg-teal-100/90 text-teal-800 text-[9px] font-normal rounded-md">Google Location</span>
                </div>
                <div className="text-[11px] text-teal-700">High-accuracy Android Fused Location &amp; GPS</div>
              </div>
            </div>
            {isDetecting && <span className="text-xs font-normal animate-pulse text-teal-800">Detecting...</span>}
          </button>

          {gpsError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-relaxed">
              ⚠️ {gpsError}
            </div>
          )}

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search area, landmark or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none transition-colors shadow-xs"
            />
          </div>

          {/* Preset list */}
          <div className="space-y-2">
            <span className="text-[11px] font-normal text-slate-400 uppercase tracking-wider px-1">
              Popular Hyperlocal Hubs
            </span>
            <div className="space-y-1.5">
              {filteredLocations.map((loc, idx) => {
                const isSelected = currentLocation.displayName === loc.displayName;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectLocation(loc)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all ${
                      isSelected
                        ? 'bg-teal-50 border border-teal-300 text-teal-950 font-normal shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-teal-100/80 text-teal-700' : 'bg-slate-100 text-slate-400'}`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-normal text-slate-900">{loc.area}</div>
                        <div className="text-[11px] text-slate-500">{loc.city}, {loc.state} ({loc.pincode})</div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom location entry */}
          <form onSubmit={handleAddCustom} className="pt-3 border-t border-slate-200 space-y-2.5">
            <span className="text-[11px] font-normal text-slate-400 uppercase tracking-wider px-1 block">
              Enter Custom Area
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Neighborhood / Area"
                value={customArea}
                onChange={(e) => setCustomArea(e.target.value)}
                className="px-3.5 py-2.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 shadow-xs"
              />
              <input
                type="text"
                placeholder="City (e.g. Udaipur)"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                className="px-3.5 py-2.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 shadow-xs"
              />
            </div>
            <button
              type="submit"
              disabled={!customCity.trim()}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-normal rounded-xl transition-colors shadow-xs active:scale-98"
            >
              Set Custom Location
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
