import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Copy, 
  Check, 
  MessageSquare, 
  ArrowRight, 
  Sparkles,
  Calendar,
  X,
  FileCheck
} from 'lucide-react';
import { RentalRequest, ServiceBooking } from '../../types';

interface RequestAcknowledgementModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: RentalRequest | ServiceBooking | null;
  isService?: boolean;
  onOpenChat?: () => void;
  onViewRequests?: () => void;
}

export const RequestAcknowledgementModal: React.FC<RequestAcknowledgementModalProps> = ({
  isOpen,
  onClose,
  request,
  isService = false,
  onOpenChat,
  onViewRequests
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !request) return null;

  const refCode = `${isService ? 'SRV' : 'REQ'}-${request.id.slice(-6).toUpperCase()}`;

  const recipientName = isService 
    ? (request as ServiceBooking).providerName 
    : (request as RentalRequest).ownerName;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(request.createdAt || Date.now()).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <div 
      id="request-acknowledgement-backdrop"
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        id="request-acknowledgement-modal"
        className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center shrink-0 shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold tracking-wider uppercase bg-teal-400/20 text-teal-200 px-2 py-0.5 rounded-full border border-teal-400/30">
                  Acknowledgement Confirmed
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mt-1 leading-snug">
                {isService ? 'Service Booking Requested' : 'Rental Request Submitted'}
              </h3>
              <p className="text-xs text-teal-100/80 mt-0.5">
                Sent to {recipientName} • Awaiting acceptance
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Reference and Timestamp Bar */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">Reference Code</span>
              <span className="font-mono font-bold text-slate-800 tracking-wide text-xs sm:text-sm">{refCode}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="Copy reference code"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Item / Service Summary */}
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-start gap-3">
            <img 
              src={request.listingImage} 
              alt={request.listingTitle} 
              className="w-14 h-14 rounded-lg object-cover border border-slate-100 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[9.5px] uppercase font-semibold text-teal-600 tracking-wider">
                {isService ? 'Service Offering' : 'Rental Product'}
              </span>
              <h4 className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                {request.listingTitle}
              </h4>
              
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                {isService ? (
                  <>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-teal-600 shrink-0" />
                      {(request as ServiceBooking).scheduledDate} at {(request as ServiceBooking).scheduledTime}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-teal-600 shrink-0" />
                      {(request as RentalRequest).startDate} to {(request as RentalRequest).endDate} ({(request as RentalRequest).totalDays} days)
                    </span>
                  </>
                )}
              </div>

              <div className="mt-1 text-xs font-semibold text-slate-900">
                Total: ₹{request.totalAmount}
                {!isService && (request as RentalRequest).securityDeposit > 0 && (
                  <span className="text-[10px] text-slate-500 font-normal ml-1.5">
                    (+₹{(request as RentalRequest).securityDeposit} refundable deposit)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Acknowledged Terms Summary */}
          <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-900">
              <FileCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Acknowledged Rental &amp; Safety Commitments</span>
            </div>

            <ul className="space-y-1.5 text-[11px] text-teal-800/90">
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>OTP Verification:</strong> A 6-digit {isService ? 'Starting & Completion OTP' : 'Handover & Return OTP'} must be exchanged in-person to start and finish.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isService ? 'Attendance' : 'Care & Return'}:</strong> {isService 
                    ? 'Agreed to be available at the scheduled time & address.'
                    : 'Agreed to keep item in safe condition and return on scheduled end date.'}
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>48h Response Window:</strong> {recipientName} has 48 hours to confirm or decline. You will not be charged if expired.
                </span>
              </li>
            </ul>

            <div className="pt-1.5 border-t border-teal-200/60 flex items-center justify-between text-[10px] text-teal-700">
              <span>Verified with Needly Community Guidelines</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* What Happens Next Roadmap */}
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              What Happens Next
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-amber-50/80 border border-amber-200/80 rounded-xl text-center">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-1 text-[11px] font-bold">
                  1
                </div>
                <div className="text-[10px] font-semibold text-amber-950 leading-tight">Owner Review</div>
                <div className="text-[9px] text-amber-700 mt-0.5">48h response window</div>
              </div>

              <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-1 text-[11px] font-bold">
                  2
                </div>
                <div className="text-[10px] font-semibold text-slate-800 leading-tight">OTP Handover</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Verify code in person</div>
              </div>

              <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-1 text-[11px] font-bold">
                  3
                </div>
                <div className="text-[10px] font-semibold text-slate-800 leading-tight">Return &amp; Done</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Deposit released</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
          {onOpenChat && (
            <button
              id="ack-open-chat-btn"
              type="button"
              onClick={onOpenChat}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open Chat with {recipientName}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </button>
          )}

          <div className="flex items-center gap-2">
            {onViewRequests && (
              <button
                id="ack-view-requests-btn"
                type="button"
                onClick={onViewRequests}
                className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium rounded-xl transition-colors text-center cursor-pointer"
              >
                View in My Bookings
              </button>
            )}

            <button
              id="ack-close-btn"
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-medium rounded-xl transition-colors text-center cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
