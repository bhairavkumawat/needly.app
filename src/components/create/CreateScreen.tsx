import React, { useState, useMemo, useRef } from 'react';
import { 
  Briefcase, 
  Check, 
  IndianRupee, 
  MapPin, 
  ChevronLeft, 
  Plus, 
  UploadCloud, 
  X, 
  Camera, 
  AlertCircle,
  Sparkles,
  Link,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UNIFIED_CATEGORIES, getSubcategoriesForCategory } from '../../data/categories';
import { ListingItem, ServiceListing, PortfolioItem, ServicePackage } from '../../types';
import { compressImage } from '../../utils/imageUtils';

export const CreateScreen: React.FC = () => {
  const { 
    currentUser, 
    currentLocation, 
    addServiceListing, 
    setSelectedListing,
    t,
    language,
    goBack
  } = useApp();

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('home');
  const [subcategory, setSubcategory] = useState('Deep Cleaning & Sanitization');
  const [customSubcategory, setCustomSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('499');
  const [serviceUnit, setServiceUnit] = useState<'visit' | 'hour' | 'session' | 'project'>('visit');
  const [serviceArea, setServiceArea] = useState(`${currentLocation.city} & nearby 15km`);
  
  // Multi-tier Packages
  const [customPackages, setCustomPackages] = useState<ServicePackage[]>([]);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [pkgName, setPkgName] = useState('');
  const [pkgPrice, setPkgPrice] = useState('');
  const [pkgDesc, setPkgDesc] = useState('');
  
  // Media & Error states
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Skills / Highlights
  const [featuresList, setFeaturesList] = useState<string[]>([
    'Experienced Specialist',
    'Background Verified',
    'Brings Own Tools'
  ]);
  const [newFeature, setNewFeature] = useState('');

  // Portfolio items attached to this service
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);

  const [createdSuccess, setCreatedSuccess] = useState<ListingItem | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setUploadedImages([]);
    setUploadError('');
    setFeaturesList(['Experienced Specialist', 'Background Verified', 'Brings Own Tools']);
    setNewFeature('');
    setCustomSubcategory('');
    setPortfolioItems([]);
    setCustomPackages([]);
    setPrice('499');
  };

  const handleAddPackage = () => {
    if (!pkgName.trim()) return;
    const newPkg: ServicePackage = {
      id: `pkg-${Date.now()}`,
      name: pkgName.trim(),
      price: Number(pkgPrice) || Number(price) || 499,
      description: pkgDesc.trim() || 'Custom service package'
    };
    setCustomPackages(prev => [...prev, newPkg]);
    setPkgName('');
    setPkgPrice('');
    setPkgDesc('');
    setShowAddPackage(false);
  };

  const handleRemovePackage = (index: number) => {
    setCustomPackages(prev => prev.filter((_, idx) => idx !== index));
  };

  // Service subcategories
  const availableSubcategories = useMemo(() => {
    return getSubcategoriesForCategory(category, 'service');
  }, [category]);

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const subcats = getSubcategoriesForCategory(newCat, 'service');
    setSubcategory(subcats[0] || 'General');
    setCustomSubcategory('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFiles(Array.from(files));
    e.target.value = '';
  };

  const processFiles = async (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      setUploadError('Please select valid image files.');
      return;
    }

    const availableSlots = 6 - uploadedImages.length;
    if (availableSlots <= 0) {
      setUploadError('Maximum 6 photos allowed.');
      return;
    }

    const toProcess = imageFiles.slice(0, availableSlots);
    if (imageFiles.length > availableSlots) {
      setUploadError(`Only ${availableSlots} more photo(s) added (maximum 6 photos).`);
    }

    for (const file of toProcess) {
      try {
        const compressed = await compressImage(file, 900, 0.8);
        if (compressed) {
          setUploadedImages(prev => {
            if (prev.length >= 6) return prev;
            return [...prev, compressed];
          });
        }
      } catch (err) {
        console.warn('Error compressing image:', err);
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== indexToRemove));
    setUploadError('');
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeaturesList(prev => [...prev, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setFeaturesList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddPortfolio = () => {
    if (!portfolioTitle.trim()) return;
    let validLink = portfolioLink.trim();
    if (validLink && !validLink.startsWith('http://') && !validLink.startsWith('https://')) {
      validLink = `https://${validLink}`;
    }

    const newItem: PortfolioItem = {
      id: `port-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: portfolioTitle.trim(),
      link: validLink || undefined,
      description: 'Project showcase sample',
      imageUrl: uploadedImages[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
      createdAt: new Date().toISOString()
    };

    setPortfolioItems(prev => [...prev, newItem]);
    setPortfolioTitle('');
    setPortfolioLink('');
    setShowAddPortfolio(false);
  };

  const handleRemovePortfolio = (id: string) => {
    setPortfolioItems(prev => prev.filter(p => p.id !== id));
  };

  const finalSubcategory = customSubcategory.trim() || subcategory;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (uploadedImages.length === 0) {
      setUploadError('Please upload at least 1 photo for your service listing.');
      return;
    }

    const created = addServiceListing({
      type: 'service',
      title: title.trim(),
      category,
      subcategory: finalSubcategory,
      description: description.trim() || `Professional ${title.trim()} services across ${currentLocation.displayName}. Reliable, on-time and satisfaction guaranteed.`,
      images: uploadedImages,
      providerId: currentUser.id,
      providerName: currentUser.name,
      providerAvatar: currentUser.avatar,
      providerRating: currentUser.rating || 5.0,
      providerReviewCount: currentUser.reviewCount || 1,
      isProviderVerified: currentUser.isVerified,
      startingPrice: Number(price) || 499,
      unit: serviceUnit,
      serviceArea: serviceArea || `${currentLocation.city} & nearby area`,
      location: currentLocation,
      available: true,
      skills: featuresList.length > 0 ? featuresList : ['Experienced Specialist', 'Background Verified'],
      portfolio: portfolioItems.length > 0 ? portfolioItems : undefined,
      packages: customPackages.length > 0 ? customPackages : [
        { id: `pkg-${Date.now()}-std`, name: 'Standard Service Session', price: Number(price) || 499, description: 'Comprehensive on-site service visit / task completion' }
      ]
    });

    resetForm();
    setCreatedSuccess(created);
  };

  // Success Confirmation Screen
  if (createdSuccess) {
    const sListing = createdSuccess as ServiceListing;
    return (
      <div id="needly-create-success-screen" className="p-4 space-y-6 pb-24 max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <Check className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-slate-900">Service Published Successfully!</h2>
            <p className="text-xs text-slate-500 mt-1">
              Your service listing is now live in the Udaipur community directory for neighbors to discover and book.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center gap-3 text-left border border-slate-100">
            {sListing.images[0] && (
              <img 
                src={sListing.images[0]} 
                alt={sListing.title} 
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
              />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-slate-900 truncate">{sListing.title}</h3>
              <p className="text-xs font-normal text-teal-600">
                Starting at ₹{sListing.startingPrice}/{sListing.unit}
              </p>
              <span className="text-[11px] text-slate-400">
                {sListing.subcategory || sListing.category}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                setSelectedListing(createdSuccess);
              }}
              className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-normal text-sm rounded-2xl shadow-md hover:opacity-95 transition-all cursor-pointer"
            >
              View Listing
            </button>
            <button
              onClick={() => {
                setCreatedSuccess(null);
                resetForm();
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-normal text-xs rounded-2xl transition-colors cursor-pointer"
            >
              List Another Service
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="needly-create-form-screen" className="pb-28">
      {/* Top Bar */}
      <div 
        id="needly-create-form-top-bar"
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between shadow-xs"
      >
        <button
          onClick={() => goBack()}
          className="flex items-center gap-1 text-xs font-normal text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> {t('create.back', 'Back')}
        </button>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-900 tracking-tight">
          <Briefcase className="w-3.5 h-3.5 text-teal-600" />
          <span>Offer Local Service</span>
        </div>
        <div className="w-12" />
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 w-full max-w-lg mx-auto">
        
        {/* Intro banner */}
        <div className="p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-100/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-medium text-teal-950">Reach Nearby Clients</h3>
            <p className="text-[11px] text-teal-700 leading-snug">
              List your specialized skills, set your transparent rates, and showcase your past projects.
            </p>
          </div>
        </div>

        {/* Image Upload Option (1 mandatory, max 6) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-normal text-slate-800 flex items-center gap-1">
              <span>Service Photos</span>
              <span className="text-rose-500 font-normal">*</span>
              <span className="text-[11px] font-normal text-slate-400">(1 mandatory, max 6)</span>
            </label>
            <span className={`text-[11px] font-normal ${
              uploadedImages.length === 0 ? 'text-rose-600' : 'text-slate-500'
            }`}>
              {uploadedImages.length}/6 photos
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Empty Upload Dropzone */}
          {uploadedImages.length === 0 ? (
            <div
              id="listing-photo-upload-zone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) {
                  processFiles(Array.from(e.dataTransfer.files));
                }
              }}
              className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-2.5 ${
                uploadError 
                  ? 'border-rose-400 bg-rose-50/50' 
                  : 'border-slate-300 hover:border-teal-500 bg-slate-50/80 hover:bg-teal-50/30'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 mx-auto flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-900 block">
                  Upload work or service photos
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Click to select photos of your work, equipment, or service setup
                </span>
              </div>
              <button
                type="button"
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-normal rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Photos</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {uploadedImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100 shadow-2xs"
                  >
                    <img
                      src={img}
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-teal-600 text-white text-[9px] font-normal rounded-md shadow-xs">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/75 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                      title="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {uploadedImages.length < 6 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50 hover:bg-teal-50/40 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-teal-700 transition-colors cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-[10px] font-normal">Add Photo</span>
                    <span className="text-[9px] text-slate-400">({6 - uploadedImages.length} left)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {uploadError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-normal">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-normal text-slate-800 block mb-1">
            Service Title *
          </label>
          <input
            type="text"
            required
            placeholder={language === 'hi' ? 'उदा. पेशेवर डीप होम एवं सोफा क्लीनिंग' : 'e.g. Professional Deep Cleaning & Sanitization'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white transition-colors text-slate-900"
          />
        </div>

        {/* Unified Category & Subcategory Selection */}
        <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">
            Service Category &amp; Specialization
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="text-xs font-normal text-slate-800 block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-800 font-medium cursor-pointer"
              >
                {UNIFIED_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="text-xs font-normal text-slate-800 block mb-1">
                Subcategory *
              </label>
              <select
                value={subcategory}
                onChange={(e) => {
                  setSubcategory(e.target.value);
                  setCustomSubcategory('');
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-800 font-medium cursor-pointer"
              >
                {availableSubcategories.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
                <option value="custom">+ Other / Custom Specialization</option>
              </select>
            </div>
          </div>

          {subcategory === 'custom' && (
            <div>
              <label className="text-[11px] font-normal text-slate-700 block mb-1">
                Specify Custom Specialization
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vintage Furniture Polishing, Drone Videography..."
                value={customSubcategory}
                onChange={(e) => setCustomSubcategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
              />
            </div>
          )}
        </div>

        {/* Pricing Unit and Starting Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-normal text-slate-800 block mb-1">
              Pricing Model
            </label>
            <select
              value={serviceUnit}
              onChange={(e) => setServiceUnit(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-800 cursor-pointer"
            >
              <option value="visit">Per Visit</option>
              <option value="hour">Per Hour</option>
              <option value="session">Per Session</option>
              <option value="project">Per Project</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-normal text-slate-800 block mb-1">
              Starting Price (₹ / {serviceUnit}) *
            </label>
            <div className="relative">
              <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="number"
                required
                min="50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-normal text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Multi-tier Packages (Optional) */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-medium text-slate-800">Multiple Service Packages</span>
              <span className="text-[10px] text-slate-400">(Optional)</span>
            </div>
            {!showAddPackage && (
              <button
                type="button"
                onClick={() => setShowAddPackage(true)}
                className="text-xs text-teal-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Tier
              </button>
            )}
          </div>

          {showAddPackage && (
            <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-2">
              <input
                type="text"
                placeholder="Tier Name (e.g. Basic Inspection / Full Service / Premium)"
                value={pkgName}
                onChange={(e) => setPkgName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="number"
                  placeholder="Tier Price (₹)"
                  value={pkgPrice}
                  onChange={(e) => setPkgPrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>
              <input
                type="text"
                placeholder="What is included in this tier..."
                value={pkgDesc}
                onChange={(e) => setPkgDesc(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddPackage(false)}
                  className="px-3 py-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddPackage}
                  className="px-3 py-1 text-xs bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Save Tier
                </button>
              </div>
            </div>
          )}

          {customPackages.length > 0 && (
            <div className="space-y-1.5">
              {customPackages.map((pkg, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="font-medium text-slate-900 block truncate">{pkg.name}</span>
                    <span className="text-[11px] text-slate-500 block truncate">{pkg.description}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-normal text-teal-700">₹{pkg.price}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePackage(idx)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Service Area */}
        <div>
          <label className="text-xs font-normal text-slate-800 block mb-1">
            Service Coverage Area
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              placeholder="e.g. Udaipur City & 15km radius (Sukher, Fatehpura, Hiran Magri)"
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-800"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-normal text-slate-800 block mb-1">
            Detailed Service Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what's included, your experience, tools used, and what clients should prepare..."
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 resize-none text-slate-800"
          />
        </div>

        {/* Skills / Highlights */}
        <div>
          <label className="text-xs font-normal text-slate-800 block mb-1">
            Key Skills &amp; Highlights
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g. 8+ yrs experience, ISO certified, brings ladder..."
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-800"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-normal rounded-xl cursor-pointer"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {featuresList.map((f, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-teal-50 text-teal-700 text-[11px] font-normal rounded-lg flex items-center gap-1 border border-teal-100"
              >
                {f}
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="hover:text-rose-600 ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Optional Portfolio / Work Showcase */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-medium text-slate-800">Portfolio &amp; Work Showcase</span>
              <span className="text-[10px] text-slate-400">(Optional)</span>
            </div>
            {!showAddPortfolio && (
              <button
                type="button"
                onClick={() => setShowAddPortfolio(true)}
                className="text-xs text-teal-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            )}
          </div>

          {showAddPortfolio && (
            <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-2">
              <input
                type="text"
                placeholder="Project title (e.g. 3BHK Villa Deep Cleaning)"
                value={portfolioTitle}
                onChange={(e) => setPortfolioTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
              <div className="relative">
                <Link className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="url"
                  placeholder="External link / Drive / Instagram proof (optional)"
                  value={portfolioLink}
                  onChange={(e) => setPortfolioLink(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddPortfolio(false)}
                  className="px-3 py-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddPortfolio}
                  className="px-3 py-1 text-xs bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Save Project
                </button>
              </div>
            </div>
          )}

          {portfolioItems.length > 0 && (
            <div className="space-y-1.5">
              {portfolioItems.map(item => (
                <div key={item.id} className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 truncate">{item.title}</span>
                  <div className="flex items-center gap-2">
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">
                        Link ↗
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemovePortfolio(item.id)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location display */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-xs text-slate-600">
          <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Listing will be discoverable near <strong>{currentLocation.displayName}</strong></span>
        </div>

        {/* Publish Action */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white text-sm font-normal rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Briefcase className="w-4 h-4" />
            <span>Publish Service Listing</span>
          </button>
        </div>
      </form>
    </div>
  );
};
