import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  ShieldAlert, 
  CheckCircle2,
  PackageX,
  MessageSquareOff,
  UserX
} from 'lucide-react';
import { UserProfile } from '../../types';

interface DeleteAccountModalProps {
  currentUser: UserProfile;
  onConfirmDelete: () => void;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  currentUser,
  onConfirmDelete,
  onClose
}) => {
  const [confirmInput, setConfirmInput] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = acknowledged && confirmInput.trim().toUpperCase() === 'DELETE';

  const handleDelete = () => {
    if (!canDelete) return;
    setIsDeleting(true);
    setTimeout(() => {
      onConfirmDelete();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="delete-account-modal"
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200"
      >
        {/* Danger Header */}
        <div className="px-5 py-4 bg-red-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-normal tracking-tight">Delete Account</h2>
              <p className="text-[11px] text-red-100">Permanent action on Needly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-red-100 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-800 text-xs">
          {/* User Preview */}
          <div className="flex items-center gap-3 p-3 bg-red-50/60 rounded-2xl border border-red-100">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-red-200"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <div className="font-normal text-slate-900 truncate">{currentUser.name}</div>
              <div className="text-[11px] text-slate-500 truncate">{currentUser.email || 'Registered Resident'}</div>
              <div className="text-[10px] text-red-700 font-normal mt-0.5">Account ID: {currentUser.id}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-normal text-slate-900 text-xs">What happens when you delete your account:</h4>
            <div className="space-y-2 text-[11px] text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <div className="flex items-start gap-2">
                <PackageX className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>All your listed products, rental gear, and service offers will be removed immediately.</span>
              </div>
              <div className="flex items-start gap-2">
                <MessageSquareOff className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Your active chat conversations and booking history will be unlinked.</span>
              </div>
              <div className="flex items-start gap-2">
                <UserX className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Your neighborhood reviews, ratings, and saved wishlist items will be wiped.</span>
              </div>
            </div>
          </div>

          {/* Acknowledgment Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
            />
            <span className="text-[11px] text-slate-700 font-medium">
              I understand that deleting my account is irreversible and all my listings and records will be deleted.
            </span>
          </label>

          {/* Type Confirmation */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-normal text-slate-700 uppercase tracking-wider block">
              Type <span className="text-red-600 font-normal">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 font-normal uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder:font-normal"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 text-xs font-normal text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Cancel &amp; Keep Account
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
            className={`px-5 py-2.5 text-xs font-normal rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              canDelete && !isDeleting
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-98'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Deleting...' : 'Delete Account'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
