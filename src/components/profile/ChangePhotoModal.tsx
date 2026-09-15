import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Check, 
  Sparkles, 
  AlertCircle,
  Link2,
  RefreshCw
} from 'lucide-react';
import { compressImage } from '../../utils/imageUtils';

interface ChangePhotoModalProps {
  currentAvatar: string;
  userName: string;
  onSave: (newAvatarUrl: string) => void;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80'
];

export const ChangePhotoModal: React.FC<ChangePhotoModalProps> = ({
  currentAvatar,
  userName,
  onSave,
  onClose
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [customUrl, setCustomUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file (JPEG, PNG, WebP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Selected image exceeds 8MB size limit.');
      return;
    }

    setError(null);
    setIsCompressing(true);
    try {
      const compressed = await compressImage(file, 400, 0.85);
      if (compressed) {
        setSelectedAvatar(compressed);
      }
    } catch (err) {
      console.warn('Compression fallback:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim()) return;
    try {
      new URL(customUrl);
      setSelectedAvatar(customUrl.trim());
      setCustomUrl('');
      setShowUrlInput(false);
      setError(null);
    } catch {
      setError('Please provide a valid web image link starting with http:// or https://');
    }
  };

  const handleSave = () => {
    onSave(selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="change-photo-modal"
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/10 rounded-xl">
              <Camera className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <h2 className="text-base font-normal tracking-tight">Change Profile Photo</h2>
              <p className="text-[11px] text-teal-100/80">Upload a picture or pick an avatar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-teal-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-800">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current / Selected Preview */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-center">
            <div className="relative group mb-2">
              <img
                src={selectedAvatar}
                alt={userName}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-emerald-500/30 shadow-md"
                referrerPolicy="no-referrer"
              />
              {isCompressing && (
                <div className="absolute inset-0 rounded-full bg-slate-900/60 flex items-center justify-center text-white text-xs font-normal">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                </div>
              )}
            </div>
            <div className="text-xs font-normal text-slate-900">{userName}</div>
            <div className="text-[11px] text-slate-500">Live preview of your profile image</div>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-emerald-600 bg-emerald-50/70' 
                : 'border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 bg-white'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1.5">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-xs font-normal text-slate-800">
              Click or drag photo here to upload
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Supports JPEG, PNG, WebP up to 8MB
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Web Link Option */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-xs font-normal text-teal-700 hover:text-teal-800 flex items-center gap-1.5 cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{showUrlInput ? 'Hide image URL option' : 'Or paste a web photo link (URL)'}</span>
            </button>

            {showUrlInput && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex gap-2">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://images.example.com/avatar.jpg"
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-normal rounded-lg text-xs cursor-pointer"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Preset Avatars */}
          <div className="space-y-2">
            <div className="text-xs font-normal text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Select from verified community presets:</span>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {PRESET_AVATARS.map((url, idx) => {
                const isSelected = selectedAvatar === url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(url);
                      setError(null);
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-transform active:scale-95 cursor-pointer ${
                      isSelected 
                        ? 'border-teal-600 ring-2 ring-teal-500/30 scale-102 shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Avatar option ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-teal-700/40 flex items-center justify-center text-white">
                        <Check className="w-5 h-5 font-normal stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-normal text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-normal rounded-xl shadow-md cursor-pointer transition-all active:scale-98 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Profile Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
