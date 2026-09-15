import React, { useState } from 'react';
import { 
  X, 
  Moon, 
  Sun, 
  Globe, 
  ShieldCheck, 
  MessageSquare, 
  Bell, 
  HelpCircle, 
  ChevronRight, 
  Check, 
  Send, 
  AlertTriangle, 
  FileText, 
  Lock, 
  RotateCcw,
  Sparkles,
  Info,
  Database,
  Users,
  Trash2,
  MapPin,
  Phone,
  Edit3,
  User,
  Mail,
  Calendar,
  Star,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OTHER_USERS } from '../../data/mockData';

interface SettingsModalProps {
  onClose: () => void;
  onOpenEditProfile?: () => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onOpenEditProfile }) => {
  const { 
    currentUser, 
    allProfiles, 
    switchUser, 
    deleteAccount, 
    supabaseStatus, 
    setIsSupabaseSyncModalOpen, 
    openModal,
    resetToDemoData, 
    darkMode, 
    setDarkMode, 
    language, 
    setLanguage, 
    setShowOnboarding, 
    logout,
    t 
  } = useApp();
  const [activeSection, setActiveSection] = useState<'main' | 'profile_details' | 'language' | 'safety' | 'feedback' | 'about'>('main');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('needly_notifications') !== 'false';
    } catch {
      return true;
    }
  });

  const handleToggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleSelectLanguage = (code: string) => {
    setLanguage(code);
    setTimeout(() => setActiveSection('main'), 250);
  };

  const handleToggleNotifications = () => {
    const nextVal = !notificationsEnabled;
    setNotificationsEnabled(nextVal);
    localStorage.setItem('needly_notifications', String(nextVal));
  };

  // Feedback form state
  const [feedbackCategory, setFeedbackCategory] = useState<'suggestion' | 'bug' | 'safety' | 'general'>('suggestion');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackText('');
      setFeedbackSubmitted(false);
      setActiveSection('main');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="settings-modal-container"
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-normal">
              {activeSection === 'main' && t('settings.title', 'Settings & Preferences')}
              {activeSection === 'profile_details' && 'Profile Details & Information'}
              {activeSection === 'language' && t('settings.language', 'App Language')}
              {activeSection === 'safety' && t('settings.safety_guidelines', 'Safety & Community Guidelines')}
              {activeSection === 'feedback' && t('settings.feedback', 'Report & Feedback')}
              {activeSection === 'about' && t('settings.about', 'About Needly')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {activeSection !== 'main' && (
              <button
                onClick={() => setActiveSection('main')}
                className="text-xs font-normal text-teal-300 hover:text-white px-2 py-1 rounded-md transition-colors"
              >
                {t('settings.back', '← Back')}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-slate-800 text-xs">
          {/* MAIN MENU */}
          {activeSection === 'main' && (
            <div className="space-y-4">
              {/* Account & Profile Option */}
              <div id="settings-profile-nav-group">
                <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wider block px-1 mb-1.5">
                  Account & Profile
                </span>
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-2xs">
                  {/* Profile Details & Information Option */}
                  <button
                    id="settings-profile-details-nav-btn"
                    onClick={() => setActiveSection('profile_details')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-100/70 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-normal text-slate-900">Profile Details & Information</div>
                        <div className="text-[11px] text-slate-500">
                          {currentUser.name} • {currentUser.phone || '+91 98290 12345'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Preferences Group */}
              <div>
                <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wider block px-1 mb-1.5">
                  {t('settings.app_preferences', 'App Preferences')}
                </span>
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {/* Dark Mode Toggle */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-200/70 text-slate-700">
                        {darkMode ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
                      </div>
                      <div>
                        <div className="font-normal text-slate-900">{t('settings.dark_mode', 'Dark Mode')}</div>
                        <div className="text-[11px] text-slate-500">
                          {darkMode ? t('settings.dark_mode_enabled', 'Dark theme enabled') : t('settings.dark_mode_disabled', 'Clean light theme enabled')}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleDarkMode}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                        darkMode ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                          darkMode ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Language Selector */}
                  <button
                    onClick={() => setActiveSection('language')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-100/70 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-normal text-slate-900">{t('settings.language', 'Language')}</div>
                        <div className="text-[11px] text-slate-500">
                          {LANGUAGES.find(l => l.code === language)?.name} ({LANGUAGES.find(l => l.code === language)?.native})
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Notifications Toggle */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-normal text-slate-900">{t('settings.notifications', 'Push Notifications')}</div>
                        <div className="text-[11px] text-slate-500">
                          {notificationsEnabled ? t('settings.notifications_sub', 'Instant rental & chat alerts enabled') : 'Push notifications muted'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleNotifications}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                        notificationsEnabled ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                          notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Trust, Support & Safety */}
              <div>
                <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wider block px-1 mb-1.5">
                  {t('settings.safety_heading', 'Trust, Safety & Feedback')}
                </span>
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {/* Interactive App Tour & Safety Guidelines */}
                  <button
                    onClick={() => {
                      setShowOnboarding(true);
                      onClose();
                    }}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-100/70 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-normal text-slate-900">App Intro & Safety Guide</div>
                        <div className="text-[11px] text-slate-500">Interactive 4-slide tour & safety handbook</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Safety Guidelines */}
                  <button
                    onClick={() => setActiveSection('safety')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-100/70 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-normal text-slate-900">{t('settings.safety_guidelines', 'Safety & Community Guidelines')}</div>
                        <div className="text-[11px] text-slate-500">{t('settings.safety_sub', 'Deposit protection, verification & dispute protocol')}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Report / Feedback */}
                  <button
                    onClick={() => setActiveSection('feedback')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-100/70 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-normal text-slate-900">{t('settings.feedback', 'Report an Issue / Feedback')}</div>
                        <div className="text-[11px] text-slate-500">{t('settings.feedback_sub', 'Share suggestions or report a listing/user')}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* About */}
                  <button
                    onClick={() => setActiveSection('about')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-100/70 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-200 text-slate-700">
                        <Info className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-normal text-slate-900">{t('settings.about', 'About Needly')}</div>
                        <div className="text-[11px] text-slate-500">{t('settings.about_sub', 'Hyperlocal Peer-to-Peer Sharing & Service Network')}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Supabase Cloud Database */}
              <div>
                <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wider block px-1 mb-1.5">
                  Cloud Synchronization
                </span>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-normal text-slate-800">Supabase Cloud Database</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-normal rounded-full flex items-center gap-1.5 ${
                      supabaseStatus?.tablesExist
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${supabaseStatus?.tablesExist ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      {supabaseStatus?.tablesExist ? 'Connected' : 'Setup Required'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSupabaseSyncModalOpen(true);
                      onClose();
                    }}
                    className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-normal transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5 text-teal-600" />
                    <span>{supabaseStatus?.tablesExist ? 'Database Status & Sync' : 'Complete Setup →'}</span>
                  </button>
                </div>
              </div>

              {/* Persona Switcher */}
              <div>
                <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wider block px-1 mb-1.5">
                  Marketplace Demo Persona Switcher
                </span>
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2">
                  <p className="text-[11px] text-slate-500">
                    Switch between demo personas to test requests, chat threads, and approvals:
                  </p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                    {(allProfiles && allProfiles.length > 0 ? allProfiles : Object.values(OTHER_USERS)).map((user) => {
                      const isCurrent = currentUser.id === user.id;
                      const displayUser = isCurrent ? currentUser : user;
                      return (
                        <button
                          key={displayUser.id}
                          onClick={() => {
                            switchUser(displayUser);
                            onClose();
                          }}
                          className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-600 shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={displayUser.avatar}
                              alt={displayUser.name}
                              className="w-8 h-8 rounded-full object-cover border border-white shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-normal truncate">{displayUser.name}</div>
                              <div className={`text-[10px] truncate ${isCurrent ? 'text-teal-100' : 'text-slate-400'}`}>
                                {displayUser.email || displayUser.bio}
                              </div>
                            </div>
                          </div>
                          {isCurrent ? (
                            <span className="text-[9px] font-normal px-2 py-0.5 bg-white/20 rounded-md shrink-0">Active</span>
                          ) : (
                            <span className="text-[11px] font-normal text-teal-600 shrink-0">Switch →</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Developer & Demo Reset & Danger Zone */}
              <div className="space-y-2">
                <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wider block px-1">
                  Account Management
                </span>
                
                {showResetConfirm ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-2xl space-y-2 text-center animate-in fade-in duration-150">
                    <p className="text-xs font-normal text-red-800">
                      Reset all demo listings, bookings, messages, and state back to fresh defaults?
                    </p>
                    <div className="flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          resetToDemoData();
                          setShowResetConfirm(false);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-normal rounded-xl transition-colors cursor-pointer"
                      >
                        Yes, Reset All
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(false)}
                        className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-normal rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full p-3 bg-red-50 hover:bg-red-100 text-red-700 font-normal rounded-2xl border border-red-200 transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{t('settings.reset_demo', 'Reset Application Demo State')}</span>
                  </button>
                )}

                {/* Sign Out Button */}
                <button
                  id="settings-sign-out-btn"
                  type="button"
                  onClick={() => {
                    onClose();
                    logout();
                  }}
                  className="w-full p-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-normal rounded-2xl border border-slate-200/80 transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <LogOut className="w-4 h-4 text-slate-600" />
                  <span>Sign Out</span>
                </button>

                {/* Delete Account & Data - kept at the bottom as requested */}
                <button
                  type="button"
                  id="settings-delete-account-btn"
                  onClick={() => {
                    onClose();
                    openModal('deleteAccount');
                  }}
                  className="w-full p-3 bg-rose-50/60 hover:bg-rose-100 text-rose-700 font-normal rounded-2xl border border-rose-200/80 transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Delete Account &amp; Data</span>
                </button>
              </div>
            </div>
          )}

          {/* PROFILE DETAILS & INFORMATION SUB-SECTION */}
          {activeSection === 'profile_details' && (
            <div id="settings-profile-details-view" className="space-y-3.5">
              {/* Profile Overview Header Card */}
              <div className="p-4 bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 rounded-2xl text-white shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white/80 shrink-0 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h3 className="font-normal text-sm sm:text-base truncate text-white">
                      {currentUser.name}
                    </h3>
                    <p className="text-[11px] text-teal-200 truncate">
                      {currentUser.email || 'sayyedamaan2004@gmail.com'}
                    </p>
                  </div>
                </div>

                {onOpenEditProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenEditProfile();
                    }}
                    className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 active:scale-95 text-white rounded-xl text-[11px] font-normal border border-white/25 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                    title="Edit Profile"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-teal-200" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {/* Information Cards Stack */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-2xs">
                {/* 1. Verified Status */}
                <div className="p-3.5 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-slate-400 font-normal">Verified Status</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-normal text-slate-900">
                        {currentUser.isVerified ? 'Active & KYC Confirmed' : 'Verification In Review'}
                      </span>
                      {currentUser.isVerified && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-normal">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {currentUser.isVerified 
                        ? 'Identity and mobile verified for trusted peer rentals and neighborhood bookings in Udaipur.' 
                        : 'Profile verification in progress.'}
                    </p>
                  </div>
                </div>

                {/* 2. Mobile Number */}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-teal-50 text-teal-700 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-normal">Mobile Number</div>
                      <div className="font-normal text-slate-900">
                        {currentUser.phone || '+91 98290 12345'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-normal">
                    Confirmed
                  </span>
                </div>

                {/* 3. Location */}
                <div className="p-3.5 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-slate-400 font-normal">Location</div>
                    <div className="font-normal text-slate-900 truncate">
                      {currentUser.location?.displayName || 'Fatehsagar, Udaipur, Rajasthan'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      City: {currentUser.location?.city || 'Udaipur'} • State: {currentUser.location?.state || 'Rajasthan'} • Radius: 0–15 km
                    </div>
                  </div>
                </div>

                {/* 4. Other Existing Profile Information */}
                {/* Email Address */}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-normal">Account Email</div>
                      <div className="font-normal text-slate-900 truncate">
                        {currentUser.email || 'sayyedamaan2004@gmail.com'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 font-normal">
                    Primary
                  </span>
                </div>

                {/* Trust & Community Rating */}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-normal">Trust & Community Rating</div>
                      <div className="font-normal text-slate-900 flex items-center gap-1.5">
                        <span>{currentUser.rating?.toFixed(1) || '4.9'} / 5.0</span>
                        <span className="text-slate-400 text-[11px]">
                          ({currentUser.reviewsCount || 24} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-normal">
                    Top Rated
                  </span>
                </div>

                {/* Member Since */}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-200/70 text-slate-700 shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-normal">Member Since</div>
                      <div className="font-normal text-slate-900">
                        {currentUser.memberSince || 'October 2023'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                {/* 5. Profile Description / Bio */}
                <div className="p-3.5 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-700 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-slate-400 font-normal">Profile Description / Bio</div>
                    <p className="text-slate-800 text-[11px] leading-relaxed mt-1 italic">
                      &ldquo;{currentUser.bio || 'Passionate local creator and neighbor in Udaipur offering premium camera gear, audio equipment, and reliable local assistance.'}&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Update Button */}
              {onOpenEditProfile && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEditProfile();
                  }}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:opacity-95 text-white rounded-xl text-xs font-normal shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile Details</span>
                </button>
              )}
            </div>
          )}

          {/* LANGUAGE SELECTOR */}
          {activeSection === 'language' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 mb-3">
                {t('settings.select_language', 'Select your preferred language (English or हिन्दी):')}
              </p>
              <div className="space-y-2">
                {LANGUAGES.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-teal-500 bg-teal-50/80 text-teal-900 font-normal shadow-xs' 
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-normal text-slate-900">{lang.name}</div>
                        <div className="text-xs text-slate-500">{lang.native}</div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 font-normal" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SAFETY GUIDELINES */}
          {activeSection === 'safety' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-teal-50 rounded-2xl border border-teal-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-normal text-teal-900 text-xs">Trust &amp; Verification Standard</h4>
                  <p className="text-[11px] text-teal-800 leading-relaxed">
                    Needly connects verified neighbors within your local radius. Every item and skill is vetted for safe sharing.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  {
                    title: '1. In-Person Item Inspection',
                    desc: 'Always inspect tools, electronics, or gear together during handover. Verify functionality before taking possession.'
                  },
                  {
                    title: '2. Refundable Security Deposit',
                    desc: 'Security deposits are safely tracked and returned immediately upon undamaged item return.'
                  },
                  {
                    title: '3. In-App Direct Chat',
                    desc: 'Keep all agreements, meetup timing, and quote terms documented in the Needly inbox for transparency.'
                  },
                  {
                    title: '4. Prompt Returns & Reviews',
                    desc: 'Return items cleanly on time. High community ratings unlock premium gear discounts and lower deposit rates.'
                  }
                ].map((rule, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                    <h5 className="font-normal text-slate-900 text-xs">{rule.title}</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{rule.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REPORT / FEEDBACK */}
          {activeSection === 'feedback' && (
            <div className="space-y-3">
              {feedbackSubmitted ? (
                <div className="py-8 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200 p-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-normal text-emerald-900 text-sm">Thank You for Your Feedback!</h4>
                  <p className="text-xs text-emerald-700">Our neighborhood moderation team will review this shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <div>
                    <label className="font-normal text-slate-700 block mb-1">Feedback Category</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'suggestion' as const, label: '💡 App Suggestion' },
                        { id: 'bug' as const, label: '🐛 Report Bug' },
                        { id: 'safety' as const, label: '🛡️ Safety / Fraud' },
                        { id: 'general' as const, label: '💬 General Query' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFeedbackCategory(cat.id)}
                          className={`py-2 text-[11px] font-normal rounded-xl border transition-all cursor-pointer ${
                            feedbackCategory === cat.id
                              ? 'bg-teal-50 border-teal-500 text-teal-800'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-normal text-slate-700 block mb-1">Details / Description</label>
                    <textarea
                      rows={4}
                      required
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Please share what you noticed or how we can make neighborhood renting even smoother..."
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-900 resize-none text-xs shadow-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-normal rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    Submit Feedback
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ABOUT NEEDLY & FOUNDERS */}
          {activeSection === 'about' && (
            <div className="space-y-3.5">
              {/* Needly Description Banner */}
              <div className="p-4 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl space-y-2.5 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-teal-500 text-white flex items-center justify-center font-normal text-sm shadow-sm">
                    N
                  </div>
                  <div>
                    <h3 className="font-normal text-sm tracking-tight text-white flex items-center gap-1.5">
                      Needly
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-300 border border-teal-400/20">
                        v2.4.0
                      </span>
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Needly is a smart, hyperlocal peer-to-peer rental and on-demand skilled service platform. 
                  It connects verified neighbors within a 0–15 km radius to borrow tools, cameras, electronics, camping equipment, 
                  and hire trusted local services directly—transforming idle resources into shared neighborhood value.
                </p>
              </div>

              {/* Founders Section */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-3.5 space-y-3">
                <div className="flex items-center gap-1.5 text-slate-900 font-normal text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Founders</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Founder 1: Amaan Sayyed */}
                  <div className="p-3 bg-white rounded-xl border border-teal-200/80 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white flex items-center justify-center font-normal text-sm shadow-sm shrink-0">
                      AS
                    </div>
                    <div>
                      <h4 className="font-normal text-xs text-slate-900">Amaan Sayyed</h4>
                      <p className="text-[10px] font-normal text-teal-700">Founder</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                        Product &amp; Hyperlocal Sharing Architecture
                      </p>
                    </div>
                  </div>

                  {/* Founder 2: Bhairav Kumawat */}
                  <div className="p-3 bg-white rounded-xl border border-teal-200/80 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-700 text-white flex items-center justify-center font-normal text-sm shadow-sm shrink-0">
                      BK
                    </div>
                    <div>
                      <h4 className="font-normal text-xs text-slate-900">Bhairav Kumawat</h4>
                      <p className="text-[10px] font-normal text-teal-700">Founder</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                        Community Growth &amp; Operations
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Info Details */}
              <div className="bg-white rounded-xl border border-slate-200 p-3 text-[11px] text-slate-600 space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="font-medium text-slate-500">Mission</span>
                  <span className="font-normal text-slate-800 text-right">Zero-Waste Neighborhood Sharing</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="font-medium text-slate-500">Security Architecture</span>
                  <span className="font-normal text-slate-800 text-right">Role &amp; Identity Verified</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-medium text-slate-500">Service Coverage</span>
                  <span className="font-normal text-slate-800 text-right">Hyperlocal (0–15 km radius)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
