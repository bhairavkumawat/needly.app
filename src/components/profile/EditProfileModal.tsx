import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Check, 
  User, 
  Sparkles, 
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  FileText,
  Briefcase,
  Award,
  Plus,
  Trash2,
  Globe,
  ExternalLink,
  Layers
} from 'lucide-react';
import { UserProfile, PortfolioItem, PortfolioPlatform } from '../../types';
import { compressImage } from '../../utils/imageUtils';

interface EditProfileModalProps {
  currentUser: UserProfile;
  onSave: (updates: Partial<UserProfile>) => void;
  onClose: () => void;
  onOpenChangePhoto?: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  currentUser,
  onSave,
  onClose,
  onOpenChangePhoto
}) => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [locationName, setLocationName] = useState(currentUser.location?.displayName || 'Udaipur, Rajasthan');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [bio, setBio] = useState(currentUser.bio || '');

  // Experience & Skills
  const [experienceYears, setExperienceYears] = useState<string>(currentUser.experienceYears !== undefined ? String(currentUser.experienceYears) : '');
  const [experienceSummary, setExperienceSummary] = useState(currentUser.experienceSummary || '');
  const [skills, setSkills] = useState<string[]>(currentUser.skills || []);
  const [skillInput, setSkillInput] = useState('');

  // Portfolio
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(currentUser.portfolio || []);
  const [showAddPort, setShowAddPort] = useState(false);
  const [newPortTitle, setNewPortTitle] = useState('');
  const [newPortPlatform, setNewPortPlatform] = useState<PortfolioPlatform>('instagram');
  const [newPortLink, setNewPortLink] = useState('');
  const [newPortDesc, setNewPortDesc] = useState('');

  const [customUrl, setCustomUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddSkill = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'key' in e && e.key !== 'Enter') return;
    if (e) e.preventDefault();
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleAddPortfolioItem = () => {
    if (!newPortTitle.trim()) {
      setError('Please provide a title for the portfolio item.');
      return;
    }
    const newItem: PortfolioItem = {
      id: `port-${Date.now()}`,
      title: newPortTitle.trim(),
      platform: newPortPlatform,
      link: newPortLink.trim() || undefined,
      description: newPortDesc.trim() || undefined,
      createdAt: new Date().toISOString()
    };
    setPortfolio(prev => [...prev, newItem]);
    setNewPortTitle('');
    setNewPortLink('');
    setNewPortDesc('');
    setShowAddPort(false);
    setError(null);
  };

  const handleRemovePortfolioItem = (id: string) => {
    setPortfolio(prev => prev.filter(p => p.id !== id));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Image size exceeds 8MB limit.');
      return;
    }

    setError(null);
    try {
      const compressed = await compressImage(file, 400, 0.85);
      if (compressed) {
        setAvatar(compressed);
      }
    } catch (err) {
      console.warn('Failed to compress avatar:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim()) return;
    try {
      new URL(customUrl);
      setAvatar(customUrl.trim());
      setCustomUrl('');
      setShowUrlInput(false);
      setError(null);
    } catch {
      setError('Please provide a valid web image URL starting with http:// or https://');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    onSave({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      avatar: avatar || currentUser.avatar,
      bio: bio.trim(),
      experienceYears: experienceYears.trim() === '' ? undefined : Number(experienceYears),
      experienceSummary: experienceSummary.trim() || undefined,
      skills: skills.length > 0 ? skills : undefined,
      portfolio: portfolio.length > 0 ? portfolio : undefined,
      location: {
        ...currentUser.location,
        displayName: locationName.trim() || currentUser.location.displayName
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="edit-profile-modal-container"
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/10 rounded-xl">
              <User className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <h2 className="text-base font-normal tracking-tight">Edit Profile</h2>
              <p className="text-[11px] text-teal-100/80">Update your public details &amp; contact info</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 text-slate-800 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Photo Section */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-normal text-slate-800">
                Profile Photo
              </label>
              {onOpenChangePhoto && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChangePhoto();
                  }}
                  className="text-[11px] font-normal text-teal-700 hover:text-teal-800 cursor-pointer"
                >
                  Advanced Photo Tool →
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3.5">
              <div className="relative group shrink-0">
                <img
                  src={avatar}
                  alt={name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30 shadow-xs"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-900/50 hover:bg-slate-900/60 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Upload from device"
                >
                  <Camera className="w-4 h-4 mb-0.5" />
                  <span className="text-[8px] font-normal">Change</span>
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white hover:bg-teal-50 text-teal-700 text-xs font-normal rounded-xl border border-teal-200/80 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Photo
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-normal rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    Image Link
                  </button>
                </div>

                <p className="text-[10px] text-slate-500">
                  Visible to neighbors when you rent gear or book services.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Custom URL Input Field */}
            {showUrlInput && (
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <div className="text-[10px] font-normal text-slate-700">Paste Image Web Link:</div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://images.example.com/my-photo.jpg"
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-normal rounded-lg text-xs cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {/* Preset Avatars Selection */}
            <div>
              <div className="text-[10px] font-normal text-slate-500 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Or pick from preset avatars:</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((preset, idx) => {
                  const isSelected = avatar === preset;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatar(preset);
                        setError(null);
                      }}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-transform active:scale-95 cursor-pointer ${
                        isSelected ? 'border-teal-600 ring-2 ring-teal-500/30 scale-105' : 'border-transparent hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={preset}
                        alt={`Preset ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-teal-600/30 flex items-center justify-center text-white">
                          <Check className="w-3.5 h-3.5 font-normal" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-normal text-slate-700 uppercase tracking-wider block">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Your full name..."
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-900 font-normal"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-normal text-slate-700 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-900"
              />
            </div>
          </div>

          {/* Phone Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-normal text-slate-700 uppercase tracking-wider block">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-900"
              />
            </div>
          </div>

          {/* Location Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-normal text-slate-700 uppercase tracking-wider block">
              Neighborhood / Area
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Fatehpura, Udaipur"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-900"
              />
            </div>
          </div>

          {/* Bio Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-normal text-slate-700 uppercase tracking-wider block">
              Bio / About You
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell neighbors what services you provide, your background, or what you love about your craft..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-900 resize-none"
              />
            </div>
          </div>

          {/* Experience Section */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
              <Briefcase className="w-3.5 h-3.5 text-teal-600" />
              <span>Professional Experience</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-1 space-y-1">
                <label className="text-[10px] font-normal text-slate-500 uppercase tracking-wider block">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder="e.g. 3"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-900"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-normal text-slate-500 uppercase tracking-wider block">
                  Experience Summary
                </label>
                <input
                  type="text"
                  value={experienceSummary}
                  onChange={(e) => setExperienceSummary(e.target.value)}
                  placeholder="e.g. Over 3 years specializing in inverter wiring and drone videography"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
                <Award className="w-3.5 h-3.5 text-teal-600" />
                <span>Skills &amp; Capabilities</span>
              </div>
              <span className="text-[10px] text-slate-400">({skills.length} added)</span>
            </div>

            {/* Skill tags */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-white border border-teal-200 text-teal-800 text-[11px] rounded-lg flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add skill input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add a skill (e.g. 4K Editing, Wiring, Carpentry)..."
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-normal rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Add
              </button>
            </div>
          </div>

          {/* Portfolio Section */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                <span>Portfolio &amp; Work Samples</span>
              </div>
              {!showAddPort && (
                <button
                  type="button"
                  onClick={() => setShowAddPort(true)}
                  className="text-xs text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Sample</span>
                </button>
              )}
            </div>

            {/* List of existing portfolio items */}
            {portfolio.length > 0 ? (
              <div className="space-y-2 pt-1">
                {portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-slate-800 truncate">{item.title}</span>
                        {item.platform && (
                          <span className="px-1.5 py-0.2 bg-teal-50 text-teal-700 text-[9px] rounded-md font-mono border border-teal-200/80">
                            {item.platform}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.description}</p>
                      )}
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-teal-600 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Globe className="w-2.5 h-2.5" />
                          <span className="truncate">{item.link}</span>
                        </a>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePortfolioItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Remove sample"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              !showAddPort && (
                <p className="text-[11px] text-slate-400 italic">No work samples added yet. Showcase your skills with links or project titles.</p>
              )
            )}

            {/* Inline Add Portfolio Item Form */}
            {showAddPort && (
              <div className="p-3 bg-white border border-teal-200 rounded-xl space-y-2.5 shadow-xs">
                <div className="text-[11px] font-medium text-teal-900">New Portfolio Item</div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newPortTitle}
                    onChange={(e) => setNewPortTitle(e.target.value)}
                    placeholder="Project or Reel Title *"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                  />
                  <select
                    value={newPortPlatform}
                    onChange={(e) => setNewPortPlatform(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 text-slate-700"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="website">Website / Portfolio</option>
                    <option value="behance">Behance</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="github">GitHub</option>
                    <option value="other">Other Link</option>
                  </select>
                </div>

                <input
                  type="url"
                  value={newPortLink}
                  onChange={(e) => setNewPortLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                />

                <input
                  type="text"
                  value={newPortDesc}
                  onChange={(e) => setNewPortDesc(e.target.value)}
                  placeholder="Brief description (optional)..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                />

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddPort(false)}
                    className="px-3 py-1 text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddPortfolioItem}
                    className="px-3.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded-lg font-normal"
                  >
                    Add to Portfolio
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-normal text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-normal rounded-xl shadow-md active:scale-98 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
