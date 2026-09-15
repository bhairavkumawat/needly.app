import React from 'react';
import { CategoryIcon, CategorySvgIcon } from './CategoryIcons';

interface AnimatedCategoryIconProps {
  categoryId?: string;
  iconName?: string;
  photoUrl?: string;
  image?: string;
  animatedIconUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
  isSelected?: boolean;
}

const sizeConfig = {
  xs: { box: 'w-5 h-5', icon: 'w-5 h-5' },
  sm: { box: 'w-8 h-8', icon: 'w-8 h-8' },
  md: { box: 'w-14 h-14 sm:w-16 sm:h-16', icon: 'w-14 h-14 sm:w-16 sm:h-16' },
  lg: { box: 'w-16 h-16 sm:w-20 sm:h-20', icon: 'w-16 h-16 sm:w-20 sm:h-20' },
  xl: { box: 'w-20 h-20 sm:w-24 sm:h-24', icon: 'w-20 h-20 sm:w-24 sm:h-24' },
};

export const AnimatedCategoryIcon: React.FC<AnimatedCategoryIconProps> = ({
  categoryId,
  iconName,
  photoUrl,
  image,
  size = 'md',
  className = '',
  alt = 'Category icon',
  isSelected = false
}) => {
  // Normalize categoryId
  let resolvedCatId = categoryId;
  if (!resolvedCatId && iconName) {
    // Map legacy icon names if categoryId is not directly passed
    const map: Record<string, string> = {
      Camera: 'photography-media',
      Tv: 'electronics',
      Home: 'home',
      Car: 'vehicles',
      PartyPopper: 'events',
      Wrench: 'tools',
      Compass: 'tools',
      Plane: 'tools',
      Luggage: 'tools',
      MapPin: 'tools',
      Dumbbell: 'sports-fitness',
      GraduationCap: 'education',
      Shirt: 'fashion',
      Sprout: 'agriculture',
      Briefcase: 'business',
      Sparkles: 'all',
      Package: 'other'
    };
    resolvedCatId = map[iconName] || 'other';
  }

  if (resolvedCatId) {
    const config = sizeConfig[size] || sizeConfig.md;

    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 transition-transform duration-200 ${config.box} ${className}`}
        title={alt}
      >
        <span
          className={`inline-flex items-center justify-center transition-all duration-200 ${
            isSelected ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-108 group-hover:-translate-y-0.5'
          }`}
        >
          <CategoryIcon categoryId={resolvedCatId} className={config.icon} />
        </span>
      </span>
    );
  }

  // Fallback for custom images if provided without a known category
  const resolvedPng = photoUrl || image;
  const config = sizeConfig[size] || sizeConfig.md;

  if (resolvedPng) {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${config.box} ${className}`}>
        <img
          src={resolvedPng}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain p-1 select-none"
        />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${config.box} ${className}`}>
      <CategorySvgIcon categoryId="all" className={config.icon} />
    </span>
  );
};

export const CategoryPhoto = AnimatedCategoryIcon;

