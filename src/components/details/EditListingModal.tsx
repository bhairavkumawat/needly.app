import React, { useState, useMemo, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  Trash2, 
  Plus, 
  Check, 
  MapPin, 
  Package, 
  Briefcase, 
  Loader2,
  Sparkles,
  Camera,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UNIFIED_CATEGORIES, getSubcategoriesForCategory } from '../../data/categories';
import { ProductCondition, RentalPeriodUnit, ProductListing, ServiceListing, ListingItem } from '../../types';
import { compressImage } from '../../utils/imageUtils';

interface EditListingModalProps {
  listing: ListingItem;
  isOpen: boolean;
  onClose: () => void;
}

export const EditListingModal: React.FC<EditListingModalProps> = ({
  listing,
  isOpen,
  onClose
}) => {
  const { updateProductListing, updateServiceListing } = useApp();
  const isProduct = listing.type === 'product';
  const product = isProduct ? (listing as ProductListing) : null;
  const service = !isProduct ? (listing as ServiceListing) : null;

  // Form states initialized with listing values
  const [title, setTitle] = useState(listing.title);
  const [category, setCategory] = useState(listing.category);
  const [subcategory, setSubcategory] = useState(listing.subcategory || '');
  const [customSubcategory, setCustomSubcategory] = useState('');
  const [description, setDescription] = useState(listing.description || '');
  const [price, setPrice] = useState(
    String(isProduct ? product?.pricePerUnit ?? 399 : service?.startingPrice ?? 499)
  );
  const [images, setImages] = useState<string[]>([...(listing.images || [])]);
  const [available, setAvailable] = useState<boolean>(listing.available ?? true);
  const [locationArea, setLocationArea] = useState(
    listing.location?.area || listing.location?.displayName || ''
  );

  // Product-specific
  const [condition, setCondition] = useState<ProductCondition>(
    product?.condition || 'excellent'
  );
  const [unit, setUnit] = useState<RentalPeriodUnit>(product?.unit || 'day');
  const [securityDeposit, setSecurityDeposit] = useState(
    String(product?.securityDeposit ?? 0)
  );
  const [features, setFeatures] = useState<string[]>([...(product?.features || [])]);

  // Service-specific
  const [serviceUnit, setServiceUnit] = useState<'visit' | 'hour' | 'session' | 'project'>(
    service?.unit || 'visit'
  );
  const [serviceArea, setServiceArea] = useState(
    service?.serviceArea || `${listing.location?.city || 'Local'} & nearby area`
  );
  const [skills, setSkills] = useState<string[]>([...(service?.skills || [])]);

  // Tag addition state
  const [newTag, setNewTag] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subcategories list for current category
  const availableSubcategories = useMemo(() => {
    return getSubcategoriesForCategory(category, isProduct ? 'product' : 'service');
  }, [category, isProduct]);

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const subcats = getSubcategoriesForCategory(newCat, isProduct ? 'product' : 'service');
    setSubcategory(subcats[0] || 'General');
    setCustomSubcategory('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imageFiles = (Array.from(files) as File[]).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      setUploadError('Please select valid image files.');
      return;
    }

    const availableSlots = 6 - images.length;
    if (availableSlots <= 0) {
      setUploadError('Maximum 6 photos allowed.');
      return;
    }

    setIsProcessingImage(true);
    const toProcess = imageFiles.slice(0, availableSlots);
    if (imageFiles.length > availableSlots) {
      setUploadError(`Only ${availableSlots} more photo(s) added (maximum 6 photos).`);
    }

    for (const file of toProcess) {
      try {
        const compressed = await compressImage(file, 900, 0.8);
        if (compressed) {
          setImages(prev => {
            if (prev.length >= 6) return prev;
            return [...prev, compressed];
          });
        }
      } catch (err) {
        console.error('Image compression failed', err);
      }
    }
    setIsProcessingImage(false);
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      setUploadError('At least 1 photo is required for your listing.');
      return;
    }
    setUploadError('');
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetCoverImage = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const tag = newTag.trim();
    if (isProduct) {
      if (!features.includes(tag)) setFeatures(prev => [...prev, tag]);
    } else {
      if (!skills.includes(tag)) setSkills(prev => [...prev, tag]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (idx: number) => {
    if (isProduct) {
      setFeatures(prev => prev.filter((_, i) => i !== idx));
    } else {
      setSkills(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setUploadError('Please enter a listing title.');
      return;
    }
    if (images.length === 0) {
      setUploadError('Listing must have at least 1 image.');
      return;
    }
    if (images.length > 6) {
      setUploadError('Maximum 6 photos allowed.');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setUploadError('Please enter a valid price.');
      return;
    }

    setIsSaving(true);
    const finalSub = customSubcategory.trim() || subcategory;

    try {
      if (isProduct && product) {
        const updatedProduct: ProductListing = {
          ...product,
          title: title.trim(),
          category,
          subcategory: finalSub,
          description: description.trim(),
          pricePerUnit: numPrice,
          unit,
          securityDeposit: Number(securityDeposit) || 0,
          condition,
          images,
          features: features.length > 0 ? features : ['Quality checked', 'Ready to use'],
          available,
          location: {
            ...product.location,
            area: locationArea.trim() || product.location.area || product.location.city,
            displayName: locationArea.trim() ? `${locationArea.trim()}, ${product.location.city}` : product.location.displayName
          }
        };
        updateProductListing(updatedProduct);
      } else if (service) {
        const updatedService: ServiceListing = {
          ...service,
          title: title.trim(),
          category,
          subcategory: finalSub,
          description: description.trim(),
          startingPrice: numPrice,
          unit: serviceUnit,
          serviceArea: serviceArea.trim() || service.serviceArea,
          images,
          skills: skills.length > 0 ? skills : ['Experienced', 'Reliable'],
          available,
          location: {
            ...service.location,
            area: locationArea.trim() || service.location?.area || service.location?.city || '',
            displayName: locationArea.trim() ? `${locationArea.trim()}, ${service.location?.city || ''}` : (service.location?.displayName || '')
          }
        };
        updateServiceListing(updatedService);
      }
      setIsSaving(false);
      onClose();
    } catch (err) {
      console.error('Failed to update listing:', err);
      setIsSaving(false);
      setUploadError('Failed to save changes. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        id="edit-listing-modal"
        className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200/80 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isProduct ? 'bg-teal-100 text-teal-700' : 'bg-purple-100 text-purple-700'
            }`}>
              {isProduct ? <Package className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-normal text-slate-900 leading-tight">
                Edit {isProduct ? 'Product Listing' : 'Service Listing'}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Update photos, pricing, availability & details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1">
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Photos Management */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-normal text-slate-700">
                Listing Photos ({images.length}/6)
              </label>
              <span className="text-[10px] text-slate-400">First photo is cover</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-2xs"
                >
                  <img 
                    src={img} 
                    alt={`Photo ${idx + 1}`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded-md font-medium">
                      Cover
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetCoverImage(idx)}
                        className="p-1 bg-white/90 hover:bg-white text-slate-700 rounded-md text-[9px] font-medium shadow-xs"
                        title="Set as cover"
                      >
                        Main
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      disabled={images.length <= 1}
                      className={`p-1.5 rounded-md shadow-xs transition-colors ${
                        images.length <= 1
                          ? 'bg-slate-400/80 text-white/80 cursor-not-allowed'
                          : 'bg-rose-600/90 hover:bg-rose-600 text-white cursor-pointer'
                      }`}
                      title={images.length <= 1 ? "At least 1 photo is required" : "Remove image"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {images.length < 6 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingImage}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-teal-500 bg-slate-50 hover:bg-teal-50/50 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-teal-600 transition-all cursor-pointer"
                >
                  {isProcessingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      <span className="text-[10px] font-medium">+ Add</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-normal text-slate-700">Listing Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sony Alpha 7 IV Camera / Professional Deep Cleaning"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-hidden transition-all"
            />
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-normal text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-hidden"
              >
                {UNIFIED_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-normal text-slate-700">Subcategory</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-hidden"
              >
                {availableSubcategories.map(sub => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Unit */}
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-3">
            <div className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">
              Pricing & Terms
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-normal text-slate-700">
                  {isProduct ? 'Price (₹) *' : 'Starting Price (₹) *'}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-normal text-slate-700">Charging Unit</label>
                {isProduct ? (
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as RentalPeriodUnit)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                  >
                    <option value="day">Per Day</option>
                    <option value="week">Per Week</option>
                    <option value="month">Per Month</option>
                    <option value="hour">Per Hour</option>
                  </select>
                ) : (
                  <select
                    value={serviceUnit}
                    onChange={(e) => setServiceUnit(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                  >
                    <option value="visit">Per Visit</option>
                    <option value="hour">Per Hour</option>
                    <option value="session">Per Session</option>
                    <option value="project">Per Project</option>
                  </select>
                )}
              </div>
            </div>

            {isProduct ? (
              <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-200/50">
                <div className="space-y-1">
                  <label className="text-xs font-normal text-slate-700">Security Deposit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-normal text-slate-700">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ProductCondition)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                  >
                    <option value="like_new">Like New (Mint)</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-1 pt-1 border-t border-slate-200/50">
                <label className="text-xs font-normal text-slate-700">Service Coverage Area</label>
                <input
                  type="text"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. Udaipur City & within 20 km"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-normal text-slate-700">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide key details, included accessories, or instructions..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-hidden resize-none transition-all"
            />
          </div>

          {/* Features / Skills Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-slate-700">
              {isProduct ? 'Key Highlights & Accessories' : 'Specialities & Skills'}
            </label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {(isProduct ? features : skills).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-normal transition-colors"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder={isProduct ? 'Add feature (e.g. Extra Battery)' : 'Add skill (e.g. Same-day visit)'}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-normal rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Location Area */}
          <div className="space-y-1">
            <label className="text-xs font-normal text-slate-700">Locality / Neighborhood</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={locationArea}
                onChange={(e) => setLocationArea(e.target.value)}
                placeholder="e.g. Fatehsagar / Panchwati"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Listing Active Status */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-normal text-slate-900 flex items-center gap-1.5">
                {available ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                <span>Listing Status</span>
              </div>
              <p className="text-[10px] text-slate-500">
                {available ? 'Active and visible in local search' : 'Temporarily paused / hidden'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAvailable(!available)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                available 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/60' 
                  : 'bg-slate-200 text-slate-700 border border-slate-300/60'
              }`}
            >
              {available ? 'Active' : 'Paused'}
            </button>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 sticky bottom-0 bg-white/95 backdrop-blur-xs pb-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-normal rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-edit-listing-btn"
              disabled={isSaving || isProcessingImage}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-normal rounded-xl shadow-md shadow-teal-600/20 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
