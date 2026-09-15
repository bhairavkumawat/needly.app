import React from 'react';
import { 
  X, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Briefcase, 
  ExternalLink, 
  MessageSquare, 
  Calendar, 
  Sparkles,
  Layers,
  ArrowUpRight,
  Globe,
  Instagram,
  Youtube,
  Linkedin,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserProfile, ServiceListing, PortfolioItem } from '../../types';

interface PublicProfileModalProps {
  userId: string;
  onClose: () => void;
  onSelectService?: (service: ServiceListing) => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({
  userId,
  onClose,
  onSelectService
}) => {
  const { 
    currentUser, 
    allProfiles, 
    services, 
    setSelectedListing,
    startConversationWithListing 
  } = useApp();

  // Find target provider profile
  const profile: UserProfile | undefined = 
    (allProfiles || []).find(p => p.id === userId) ||
    (currentUser?.id === userId ? currentUser : undefined);

  // Find all active services listed by this provider
  const providerServices = services.filter(s => s.providerId === userId);

  if (!profile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-3">
          <p className="text-sm text-slate-700">Provider profile could not be found.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const isMe = currentUser?.id === profile.id;
  const portfolio: PortfolioItem[] = profile.portfolio || [];

  const getPlatformIcon = (platform?: string) => {
    const p = (platform || '').toLowerCase();
    if (p.includes('instagram')) return <Instagram className="w-3.5 h-3.5 text-pink-600" />;
    if (p.includes('youtube')) return <Youtube className="w-3.5 h-3.5 text-red-600" />;
    if (p.includes('linkedin')) return <Linkedin className="w-3.5 h-3.5 text-blue-600" />;
    return <Globe className="w-3.5 h-3.5 text-teal-600" />;
  };

  const handleContactProvider = () => {
    if (isMe) return;
    const firstService = providerServices[0];
    if (firstService) {
      startConversationWithListing(firstService);
      onClose();
    } else {
      // Create direct generic conversation if needed
      onClose();
    }
  };

  return (
    <div 
      id="public-profile-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="public-profile-modal-window"
        className="bg-white w-full max-w-lg max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200"
      >
        {/* Header Cover Bar */}
        <div className="relative bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 px-5 pt-4 pb-14 text-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-wide uppercase text-teal-200 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-xs">
              Verified Neighbor Profile
            </span>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Card Header (Overlapping Cover) */}
        <div className="px-5 pb-4 -mt-10 relative z-10 flex-1 overflow-y-auto no-scrollbar space-y-5">
          <div className="flex items-end justify-between gap-3">
            <div className="relative">
              <img
                src={profile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80'}
                alt={profile.name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md bg-slate-100"
                referrerPolicy="no-referrer"
              />
              {profile.isVerified && (
                <div 
                  title="Verified Community Member"
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-full flex items-center justify-center shadow-xs border-2 border-white"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {!isMe && (
              <button
                onClick={handleContactProvider}
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:opacity-95 active:scale-95 text-white text-xs font-medium rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contact Provider</span>
              </button>
            )}
          </div>

          {/* Name & Basic Info */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">{profile.name}</h2>
              {isMe && (
                <span className="text-[10px] bg-teal-100 text-teal-800 font-medium px-2 py-0.5 rounded-full">
                  You
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
              <div className="flex items-center gap-1 text-teal-700">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{profile.location?.displayName || profile.location?.area || profile.location?.city || 'Udaipur'}</span>
              </div>

              <div className="flex items-center gap-1 text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-slate-800">{profile.rating || 5.0}</span>
                <span className="text-slate-400">({profile.reviewCount || 1} reviews)</span>
              </div>

              {profile.memberSince && (
                <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span>Member since {profile.memberSince}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio / About */}
          {profile.bio && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                About the Provider
              </span>
              <p>{profile.bio}</p>
            </div>
          )}

          {/* Professional Credentials & Experience */}
          {(profile.experienceYears || profile.experienceSummary || (profile.skills && profile.skills.length > 0)) && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                <span>Experience &amp; Expertise</span>
              </h3>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                {profile.experienceYears && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-slate-900">Experience:</span>
                    <span className="text-teal-700 font-semibold">{profile.experienceYears} Years</span>
                  </div>
                )}

                {profile.experienceSummary && (
                  <p className="text-xs text-slate-600 leading-normal">
                    {profile.experienceSummary}
                  </p>
                )}

                {profile.skills && profile.skills.length > 0 && (
                  <div className="pt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills.map((skill, idx) => (
                        <span 
                          key={idx}
                          className="px-2.5 py-1 bg-teal-50 text-teal-800 text-[11px] font-medium rounded-lg border border-teal-200/70"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Work Showcase / Portfolio (Optional) */}
          {portfolio.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-600" />
                  <span>Work Showcase</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-normal">
                  {portfolio.length} sample{portfolio.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {portfolio.map((item) => {
                  const itemLink = item.link || item.url;
                  return (
                    <div 
                      key={item.id}
                      className="p-3 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-300 shadow-2xs flex flex-col justify-between transition-all group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-teal-50 border border-slate-100 transition-colors shrink-0">
                          {getPlatformIcon(item.platform)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-semibold text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {itemLink && (
                        <a
                          href={itemLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 text-[10px] text-teal-700 hover:text-teal-800 font-medium inline-flex items-center gap-1 self-end transition-colors"
                        >
                          <span>Open link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Services Offered by This Provider */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Services Offered ({providerServices.length})</span>
              </h3>
            </div>

            {providerServices.length === 0 ? (
              <div className="p-4 text-center bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-500">
                No public service listings currently active for this user.
              </div>
            ) : (
              <div className="space-y-2">
                {providerServices.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => {
                      if (onSelectService) {
                        onSelectService(srv);
                      } else {
                        setSelectedListing(srv);
                      }
                      onClose();
                    }}
                    className="p-3 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-400 hover:shadow-sm transition-all cursor-pointer flex items-center gap-3 group"
                  >
                    {srv.images[0] && (
                      <img
                        src={srv.images[0]}
                        alt={srv.title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100 group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-medium text-teal-700 uppercase tracking-wider truncate">
                          {srv.subcategory || srv.category}
                        </span>
                        {srv.packages && srv.packages.length > 0 && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            {srv.packages.length} package{srv.packages.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-medium text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                        {srv.title}
                      </h4>
                      <div className="text-xs font-semibold text-slate-900 mt-1">
                        ₹{srv.startingPrice} <span className="text-[10px] font-normal text-slate-500">/{srv.unit}</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-teal-50 text-slate-400 group-hover:text-teal-600 flex items-center justify-center shrink-0 transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
