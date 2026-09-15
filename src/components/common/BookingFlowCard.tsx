import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Check, 
  X, 
  Play,
  Calendar,
  MapPin,
  Sparkles,
  Package,
  IndianRupee,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RentalRequest, ServiceBooking, RequestStatus } from '../../types';
import { triggerConfetti } from '../../utils/confetti';

interface BookingFlowCardProps {
  booking: RentalRequest | ServiceBooking;
  isService?: boolean;
  compact?: boolean;
  onStatusChange?: (newStatus: string) => void;
}

export const BookingFlowCard: React.FC<BookingFlowCardProps> = ({
  booking,
  isService = false,
  compact = false,
  onStatusChange
}) => {
  const { currentUser, updateRequestStatus, updateBookingStatus } = useApp();

  const isServiceBooking = isService || 'providerId' in booking;
  const ownerId = isServiceBooking
    ? (booking as ServiceBooking).providerId 
    : (booking as RentalRequest).ownerId;
  const renterId = isServiceBooking 
    ? (booking as ServiceBooking).customerId 
    : (booking as RentalRequest).renterId;
  const ownerName = isServiceBooking 
    ? (booking as ServiceBooking).providerName 
    : (booking as RentalRequest).ownerName;
  const renterName = isServiceBooking 
    ? (booking as ServiceBooking).customerName 
    : (booking as RentalRequest).renterName;

  const isOwner = currentUser.id === ownerId;
  const isRenter = currentUser.id === renterId;

  const [isUpdating, setIsUpdating] = useState(false);

  // 1. Accept Request (Provider only)
  const handleAccept = () => {
    setIsUpdating(true);
    if (isServiceBooking) {
      updateBookingStatus(booking.id, 'accepted');
    } else {
      updateRequestStatus(booking.id, 'accepted');
    }
    onStatusChange?.('accepted');
    setIsUpdating(false);
    triggerConfetti({ particleCount: 35, spread: 50, origin: { y: 0.5 } });
  };

  // 2. Decline Request (Provider only)
  const handleDecline = () => {
    if (!window.confirm('Are you sure you want to decline this request?')) return;
    setIsUpdating(true);
    if (isServiceBooking) {
      updateBookingStatus(booking.id, 'rejected');
    } else {
      updateRequestStatus(booking.id, 'rejected');
    }
    onStatusChange?.('rejected');
    setIsUpdating(false);
  };

  // 3. Start Service / In Progress (Provider only)
  const handleStartService = () => {
    setIsUpdating(true);
    if (isServiceBooking) {
      updateBookingStatus(booking.id, 'active');
    } else {
      updateRequestStatus(booking.id, 'active');
    }
    onStatusChange?.('active');
    setIsUpdating(false);
  };

  // 4. Complete Service (Provider only)
  const handleComplete = () => {
    setIsUpdating(true);
    if (isServiceBooking) {
      updateBookingStatus(booking.id, 'completed');
    } else {
      updateRequestStatus(booking.id, 'completed');
    }
    onStatusChange?.('completed');
    setIsUpdating(false);
    triggerConfetti({ particleCount: 45, spread: 60, origin: { y: 0.5 } });
  };

  // 5. Cancel Request (Customer if pending)
  const handleCancel = () => {
    if (!window.confirm('Are you sure you want to cancel your request?')) return;
    setIsUpdating(true);
    if (isServiceBooking) {
      updateBookingStatus(booking.id, 'cancelled');
    } else {
      updateRequestStatus(booking.id, 'cancelled');
    }
    onStatusChange?.('cancelled');
    setIsUpdating(false);
  };

  const status = booking.status;
  const serviceBooking = isServiceBooking ? (booking as ServiceBooking) : null;

  // COMPACT VIEW (used in top bar of chat detail modal)
  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200/80 text-xs shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium shrink-0 flex items-center gap-1 ${
            status === 'pending' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
            status === 'accepted' ? 'bg-teal-50 text-teal-800 border border-teal-200' :
            status === 'active' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
            status === 'completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
            'bg-slate-100 text-slate-600 border border-slate-200'
          }`}>
            {status === 'pending' && <Clock className="w-2.5 h-2.5" />}
            {status === 'accepted' && <Check className="w-2.5 h-2.5" />}
            {status === 'active' && <Play className="w-2.5 h-2.5" />}
            {status === 'completed' && <CheckCircle2 className="w-2.5 h-2.5" />}
            <span className="capitalize">{status === 'active' ? 'In Progress' : status}</span>
          </span>

          <span className="text-[11px] text-slate-700 truncate font-normal">
            {serviceBooking?.packageName ? `${serviceBooking.packageName} • ` : ''}₹{booking.totalAmount}
          </span>
        </div>

        {/* Action button inside compact strip */}
        <div className="flex items-center gap-1 shrink-0">
          {status === 'pending' && isOwner && (
            <button
              onClick={handleAccept}
              disabled={isUpdating}
              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-medium transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              Accept
            </button>
          )}

          {status === 'pending' && isRenter && (
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-normal transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}

          {status === 'accepted' && isOwner && (
            <button
              onClick={handleStartService}
              disabled={isUpdating}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-medium transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              Start Service
            </button>
          )}

          {status === 'active' && isOwner && (
            <button
              onClick={handleComplete}
              disabled={isUpdating}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-medium transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              Mark Completed
            </button>
          )}
        </div>
      </div>
    );
  }

  // FULL CARD VIEW
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
      {/* Top status bar */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            status === 'pending' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
            status === 'accepted' ? 'bg-teal-50 text-teal-800 border border-teal-200' :
            status === 'active' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
            status === 'completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
            'bg-slate-100 text-slate-600 border border-slate-200'
          }`}>
            {status === 'pending' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
            {status === 'accepted' && <Check className="w-3.5 h-3.5 text-teal-600" />}
            {status === 'active' && <Play className="w-3.5 h-3.5 text-blue-600" />}
            {status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            <span className="capitalize">{status === 'active' ? 'In Progress' : status}</span>
          </span>
          <span className="text-xs text-slate-500 font-normal">
            {isServiceBooking ? 'Service Booking' : 'Item Request'}
          </span>
        </div>

        <div className="text-sm font-semibold text-slate-900 flex items-center">
          <IndianRupee className="w-3.5 h-3.5" />
          <span>{booking.totalAmount}</span>
        </div>
      </div>

      {/* Package & Schedule Info */}
      <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
        {serviceBooking?.packageName && (
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <Package className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Package: {serviceBooking.packageName}</span>
          </div>
        )}

        {serviceBooking?.scheduledDate && (
          <div className="flex items-center gap-1.5 text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Scheduled: {serviceBooking.scheduledDate} {serviceBooking.scheduledTime ? `at ${serviceBooking.scheduledTime}` : ''}</span>
          </div>
        )}

        {serviceBooking?.serviceAddress && (
          <div className="flex items-center gap-1.5 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{serviceBooking.serviceAddress}</span>
          </div>
        )}
      </div>

      {/* Action Controls based on user role and request status */}
      <div className="pt-1">
        {status === 'pending' && isOwner && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleAccept}
              disabled={isUpdating}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white text-xs font-medium rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept Request</span>
            </button>
            <button
              onClick={handleDecline}
              disabled={isUpdating}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 text-xs font-normal rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Decline</span>
            </button>
          </div>
        )}

        {status === 'pending' && isRenter && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Awaiting confirmation from {ownerName}
            </span>
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="text-rose-600 hover:text-rose-700 hover:underline text-xs cursor-pointer"
            >
              Cancel Request
            </button>
          </div>
        )}

        {status === 'accepted' && isOwner && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartService}
              disabled={isUpdating}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-medium rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Service</span>
            </button>
            <button
              onClick={handleComplete}
              disabled={isUpdating}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-medium rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Completed</span>
            </button>
          </div>
        )}

        {status === 'accepted' && isRenter && (
          <div className="p-2.5 bg-teal-50/70 border border-teal-100 rounded-xl text-xs text-teal-900 flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{ownerName} has accepted your request. Coordinate directly via chat.</span>
          </div>
        )}

        {status === 'active' && isOwner && (
          <button
            onClick={handleComplete}
            disabled={isUpdating}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-medium rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark Service Completed</span>
          </button>
        )}

        {status === 'active' && isRenter && (
          <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-center gap-2">
            <Play className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Service is currently in progress.</span>
          </div>
        )}

        {status === 'completed' && (
          <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>This service has been successfully completed. Thank you!</span>
          </div>
        )}

        {(status === 'rejected' || status === 'cancelled') && (
          <div className="p-2.5 bg-slate-100 rounded-xl text-xs text-slate-600 text-center">
            {status === 'rejected' ? 'This request was declined.' : 'This request was cancelled.'}
          </div>
        )}
      </div>
    </div>
  );
};
