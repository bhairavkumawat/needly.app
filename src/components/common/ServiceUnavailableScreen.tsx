import React from 'react';
import { Search, ArrowLeft, ShieldAlert, Sparkles, Home } from 'lucide-react';

interface ServiceUnavailableScreenProps {
  serviceId?: string;
  onGoHome: () => void;
  onExploreServices?: () => void;
}

export const ServiceUnavailableScreen: React.FC<ServiceUnavailableScreenProps> = ({
  serviceId,
  onGoHome,
  onExploreServices,
}) => {
  return (
    <div 
      id="service-unavailable-screen"
      className="min-h-[100dvh] w-full max-w-lg mx-auto bg-white flex flex-col justify-between p-4 sm:p-6 text-slate-800 animate-in fade-in duration-200"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between py-2 border-b border-slate-100">
        <button
          onClick={onGoHome}
          id="service-unavailable-back-btn"
          aria-label="Back to Needly Home"
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-800 tracking-wide uppercase">
            Needly Service Notice
          </span>
        </div>
        <div className="w-9" />
      </div>

      {/* Main Empty State Content */}
      <div className="my-auto py-10 flex flex-col items-center text-center max-w-sm mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-xs">
          <ShieldAlert className="w-8 h-8 stroke-[1.75]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-serif font-normal text-slate-900 tracking-tight">
            Service Not Available
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            This service listing is no longer active, may have been removed by the provider, or is temporarily unpublished.
          </p>
        </div>

        {serviceId && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-[11px] font-mono text-slate-500 border border-slate-200/80">
            <span>Reference ID:</span>
            <span className="font-semibold text-slate-700">{serviceId}</span>
          </div>
        )}

        {/* Suggestion Card */}
        <div className="w-full mt-4 p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-900">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Looking for similar local services?</span>
          </div>
          <p className="text-[11px] text-teal-800/90 leading-relaxed">
            Hundreds of trusted local plumbers, electricians, tutors, photographers, and artisans are active in your area.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <button
          type="button"
          id="unavailable-explore-btn"
          onClick={onExploreServices || onGoHome}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-teal-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Browse Available Services</span>
        </button>

        <button
          type="button"
          id="unavailable-home-btn"
          onClick={onGoHome}
          className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4 text-slate-500" />
          <span>Return to Needly Home</span>
        </button>
      </div>
    </div>
  );
};
