import React from 'react';

export interface CategoryIconProps {
  categoryId: string;
  className?: string;
}

/**
 * 1. Photography & Media
 * Soft 3D isometric compact camera with cylindrical lens, top shutter dial, and dark navy details
 */
export const PhotographyIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Soft ground contact shadow */}
    <ellipse cx="32" cy="53.5" rx="20" ry="4.5" fill="#202536" fillOpacity="0.12"/>
    
    {/* Camera Top Dial & Shutter */}
    <rect x="18" y="16" width="6" height="4" rx="1.8" fill="#C98A48"/>
    <rect x="18.8" y="15.2" width="4.4" height="2" rx="1" fill="#DF9E58"/>
    <rect x="38" y="17" width="8" height="3" rx="1.5" fill="#6D8298"/>

    {/* Camera Body - Back/Top depth */}
    <rect x="12" y="19" width="40" height="28" rx="6" fill="#202536"/>
    <rect x="13" y="20" width="38" height="6" rx="3" fill="#31384E"/>

    {/* Camera Main Front Face */}
    <path d="M12 25H52V42C52 45.3137 49.3137 48 46 48H18C14.6863 48 12 45.3137 12 42V25Z" fill="#E8D7B5"/>
    <path d="M12 25H52V27H12V25Z" fill="#F5ECE0"/>
    
    {/* Ergonomic Right Grip */}
    <path d="M43 25H50C51.1046 25 52 25.8954 52 27V42C52 44.5 50.5 46.5 48.5 47.3C49.5 45.5 49.5 43.5 49.5 41V28C49.5 26.5 48 25.5 46.5 25.5H43V25Z" fill="#202536" fillOpacity="0.2"/>
    <rect x="44.5" y="28" width="5.5" height="15" rx="2.5" fill="#202536"/>

    {/* Flash / Viewfinder Window */}
    <rect x="36" y="23" width="7" height="4.5" rx="1.8" fill="#E8E8E5" stroke="#202536" strokeWidth="1.2"/>
    <circle cx="39.5" cy="25.2" r="1.2" fill="#DF9E58"/>

    {/* Rangefinder Accent Dot */}
    <circle cx="21" cy="27" r="1.5" fill="#C98A48"/>

    {/* Isometric 3D Lens Barrel */}
    <circle cx="30.5" cy="36.5" r="12" fill="#202536" fillOpacity="0.15"/>
    <circle cx="30" cy="36" r="11.5" fill="#202536"/>
    <circle cx="30" cy="36" r="10" fill="#6D8298"/>
    <circle cx="30" cy="36" r="8.2" fill="none" stroke="#C98A48" strokeWidth="1.2"/>
    <circle cx="30" cy="36" r="7.2" fill="#161A26"/>
    <path d="M26 31C28 29.5 32 29.5 34 31C32.5 31.8 29.5 31.8 26 31Z" fill="#FFFFFF" fillOpacity="0.6"/>
    <circle cx="33" cy="38.5" r="1.2" fill="#FFFFFF" fillOpacity="0.3"/>
  </svg>
);

/**
 * 2. Events & Party
 * Soft 3D isometric calendar with twin spiral rings, event indicator, and angled ticket with golden sparkle
 */
export const EventsIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Soft ground contact shadow */}
    <ellipse cx="32" cy="54" rx="21" ry="4.5" fill="#202536" fillOpacity="0.12"/>

    {/* Calendar Backing & 3D Extrusion */}
    <rect x="15" y="16" width="34" height="34" rx="6" fill="#202536"/>
    <rect x="14" y="15" width="34" height="34" rx="6" fill="#D4D4D0"/>
    <rect x="14" y="14" width="34" height="34" rx="6" fill="#E8E8E5"/>

    {/* Calendar Top Header (Soft Orange) */}
    <path d="M14 20C14 16.6863 16.6863 14 20 14H42C45.3137 14 48 16.6863 48 20V24H14V20Z" fill="#C98A48"/>
    <path d="M14 19C14 16.5 16.5 14 19.5 14H42.5C45.5 14 48 16.5 48 19V20.5H14V19Z" fill="#DF9E58" fillOpacity="0.4"/>

    {/* Twin Spiral Rings (Dark Navy) */}
    <rect x="21" y="11" width="3.8" height="6.5" rx="1.9" fill="#202536"/>
    <rect x="21.5" y="11.5" width="1.8" height="5" rx="0.9" fill="#31384E"/>
    <rect x="37" y="11" width="3.8" height="6.5" rx="1.9" fill="#202536"/>
    <rect x="37.5" y="11.5" width="1.8" height="5" rx="0.9" fill="#31384E"/>

    {/* Calendar Date Grid */}
    <rect x="19" y="28" width="4" height="3" rx="1" fill="#6D8298" fillOpacity="0.6"/>
    <rect x="26" y="28" width="4" height="3" rx="1" fill="#6D8298" fillOpacity="0.6"/>
    <rect x="33" y="28" width="4" height="3" rx="1" fill="#6D8298" fillOpacity="0.6"/>
    <rect x="40" y="28" width="4" height="3" rx="1" fill="#6D8298" fillOpacity="0.6"/>
    <rect x="19" y="34" width="4" height="3" rx="1" fill="#6D8298" fillOpacity="0.6"/>
    <rect x="26" y="34" width="4" height="3" rx="1" fill="#8FA58A"/>
    <circle cx="28" cy="35.5" r="3.5" stroke="#202536" strokeWidth="1.2" fill="none"/>
    <rect x="33" y="34" width="4" height="3" rx="1" fill="#6D8298" fillOpacity="0.6"/>
    <rect x="40" y="34" width="4" height="3" rx="1" fill="#6D8298" fillOpacity="0.6"/>
    <rect x="19" y="40" width="4" height="3" rx="1" fill="#6D8298" fillOpacity="0.4"/>
    <rect x="26" y="40" width="4" height="3" rx="1" fill="#6D8298" fillOpacity="0.4"/>
    <rect x="33" y="40" width="4" height="3" rx="1" fill="#6D8298" fillOpacity="0.4"/>

    {/* Angled VIP Event Ticket */}
    <g transform="rotate(14 43 41)">
      <rect x="33" y="32" width="18" height="11" rx="2.5" fill="#202536" fillOpacity="0.18"/>
      <rect x="32" y="31" width="18" height="11" rx="2.5" fill="#E8D7B5"/>
      <path d="M32 31H40V42H32C30.8954 42 30 41.1046 30 40V33C30 31.8954 30.8954 31 32 31Z" fill="#F5ECE0"/>
      <circle cx="43" cy="31" r="1.5" fill="#E8E8E5"/>
      <circle cx="43" cy="42" r="1.5" fill="#E8E8E5"/>
      <line x1="43" y1="33" x2="43" y2="40" stroke="#C98A48" strokeWidth="1" strokeDasharray="1.5 1"/>
      <polygon points="46.5,34.5 47.3,36.5 49.5,36.5 47.7,37.8 48.4,39.8 46.5,38.5 44.6,39.8 45.3,37.8 43.5,36.5 45.7,36.5" fill="#202536"/>
    </g>

    {/* Top-Right 3D Sparkle Star */}
    <path d="M47 13L48.2 16.5L52 17.5L48.5 19L47.5 22.5L46.2 19L42.5 18L46 16.5L47 13Z" fill="#C98A48"/>
    <circle cx="47.2" cy="17.7" r="1" fill="#DF9E58"/>
  </svg>
);

/**
 * 3. Home & Living
 * Soft 3D isometric modern house with muted blue overhanging roof, warm beige walls, and dark navy front door
 */
export const HomeIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ground contact shadow */}
    <ellipse cx="32" cy="54" rx="22" ry="4.5" fill="#202536" fillOpacity="0.12"/>

    {/* Chimney on Roof */}
    <path d="M40 18V24L44 26V18H40Z" fill="#202536"/>
    <rect x="39" y="17" width="5.5" height="2" rx="0.8" fill="#C98A48"/>

    {/* House Body - Side Wall (Depth) */}
    <path d="M33 26L49 19V38L33 46V26Z" fill="#D8C39F"/>
    <path d="M49 19L52 20.5V39.5L49 38V19Z" fill="#202536" fillOpacity="0.1"/>

    {/* House Body - Front Wall */}
    <path d="M15 28L33 18L33 46H18C16.3431 46 15 44.6569 15 43V28Z" fill="#E8D7B5"/>
    <path d="M15 28L33 18V20L15 30V28Z" fill="#F5ECE0"/>

    {/* 3D Overhanging Roof */}
    <path d="M12 28L32 15L35 17L15 30L12 28Z" fill="#8FA5BB"/>
    <path d="M14 29L33 16.5L49 24.5L30 37L14 29Z" fill="#6D8298"/>
    <path d="M14 29L33 16.5L33 17.8L14 30.3V29Z" fill="#8FA5BB"/>
    <path d="M33 16.5L52 25.5L49 27.5L30 18.5L33 16.5Z" fill="#202536"/>

    {/* Modern Front Door (Dark Navy with Arch) */}
    <rect x="20" y="32" width="7" height="14" rx="3.5" fill="#202536"/>
    <circle cx="25.5" cy="39" r="0.9" fill="#E8D7B5"/>
    <rect x="19" y="45.5" width="9" height="1.5" rx="0.5" fill="#C98A48"/>

    {/* Side Window on Depth Wall */}
    <path d="M38 29L45 25.5V33L38 36.5V29Z" fill="#6D8298"/>
    <path d="M38 29L45 25.5V26.5L38 30V29Z" fill="#8FA5BB"/>
    <line x1="41.5" y1="27.2" x2="41.5" y2="34.8" stroke="#202536" strokeWidth="0.8"/>
    <line x1="38" y1="32.8" x2="45" y2="29.3" stroke="#202536" strokeWidth="0.8"/>

    {/* Front Window with White Reflection */}
    <rect x="21" y="23" width="7" height="6.5" rx="1.5" fill="#6D8298"/>
    <rect x="21" y="23" width="7" height="1" rx="0.5" fill="#8FA5BB"/>
    <path d="M22 27.5L26 23.5H24L22 25.5V27.5Z" fill="#FFFFFF" fillOpacity="0.5"/>

    {/* Miniature Potted Shrub (Sage Green) */}
    <ellipse cx="14" cy="46" rx="2" ry="1" fill="#202536" fillOpacity="0.2"/>
    <rect x="13" y="42" width="3" height="4" rx="1" fill="#C98A48"/>
    <circle cx="14.5" cy="40.5" r="3" fill="#8FA58A"/>
    <circle cx="13.5" cy="39.5" r="1.5" fill="#A6BEA1"/>
  </svg>
);

/**
 * 4. Vehicles & Mobility
 * Soft 3D isometric compact car in 3/4 view with rounded aerodynamic cabin, headlights, and dual wheels
 */
export const VehiclesIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ground contact shadow */}
    <ellipse cx="32" cy="53.5" rx="23" ry="4.5" fill="#202536" fillOpacity="0.14"/>

    {/* Back Wheel Shadow */}
    <ellipse cx="43" cy="46" rx="5" ry="3" fill="#202536"/>

    {/* Car Cabin & Roof */}
    <path d="M23 29L30 20H43L48 29H23Z" fill="#202536"/>
    <path d="M29 20H42L44 22H31L29 20Z" fill="#F5ECE0"/>
    <path d="M31 22H44L41 29H28L31 22Z" fill="#E8D7B5"/>

    {/* Glass Windows */}
    <path d="M25 28L30.5 21.5H35.5L34 28H25Z" fill="#8FA5BB"/>
    <path d="M36.5 21.5H41.5L45.5 28H35L36.5 21.5Z" fill="#6D8298"/>
    <path d="M26 27L29.5 22.5H31L27.5 27H26Z" fill="#FFFFFF" fillOpacity="0.5"/>

    {/* Main Car Body (Muted Blue) */}
    <path d="M12 37C12 33 15 30 19 30H47C51 30 54 33 54 37V43C54 44.5 53 45.5 51.5 45.5H14.5C13 45.5 12 44.5 12 43V37Z" fill="#6D8298"/>
    <path d="M12 37C12 34 15 31 19 31H47C51 31 54 34 54 37V38.5H12V37Z" fill="#8FA5BB"/>
    <path d="M12 42.5H54V44C54 45 53 45.5 51.5 45.5H14.5C13 45.5 12 45 12 44V42.5Z" fill="#202536"/>

    {/* Headlight (Soft Orange Capsule) */}
    <rect x="13" y="34.5" width="4.5" height="3" rx="1.5" fill="#C98A48"/>
    <rect x="13.5" y="35" width="2" height="2" rx="1" fill="#DF9E58"/>

    {/* Bumper Grille (Dark Navy) */}
    <rect x="13" y="39" width="6" height="2.5" rx="1.2" fill="#202536"/>

    {/* Front Wheel */}
    <ellipse cx="23" cy="46" rx="6.5" ry="6.5" fill="#202536"/>
    <ellipse cx="23" cy="46" rx="4.5" ry="4.5" fill="#E8E8E5"/>
    <ellipse cx="23" cy="46" rx="4.5" ry="4.5" fill="#D2D2CE"/>
    <circle cx="23" cy="46" r="2.2" fill="#6D8298"/>
    <circle cx="23" cy="46" r="1.2" fill="#202536"/>

    {/* Rear Wheel */}
    <ellipse cx="44" cy="46" rx="6.5" ry="6.5" fill="#202536"/>
    <ellipse cx="44" cy="46" rx="4.5" ry="4.5" fill="#E8E8E5"/>
    <ellipse cx="44" cy="46" rx="4.5" ry="4.5" fill="#D2D2CE"/>
    <circle cx="44" cy="46" r="2.2" fill="#6D8298"/>
    <circle cx="44" cy="46" r="1.2" fill="#202536"/>

    {/* Rear Tail Light Hint */}
    <rect x="52" y="35" width="2" height="3" rx="1" fill="#C98A48"/>
  </svg>
);

/**
 * 5. Electronics & Tech
 * Soft 3D isometric smartphone with muted blue screen cards and looping soft orange magnetic charger plug
 */
export const ElectronicsIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ground contact shadow */}
    <ellipse cx="32" cy="54" rx="22" ry="4.5" fill="#202536" fillOpacity="0.12"/>

    {/* Charger Cable Loop */}
    <path d="M42 47C46 48 50 45 49 41C48 37 43 36 41 39" stroke="#E8E8E5" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M42 47C46 48 50 45 49 41C48 37 43 36 41 39" stroke="#202536" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="1 3"/>

    {/* Magnetic Plug (Soft Orange & Navy) */}
    <g transform="rotate(-20 37 46)">
      <rect x="34" y="44" width="7" height="4" rx="1.5" fill="#C98A48"/>
      <rect x="35" y="44" width="5" height="1" rx="0.5" fill="#DF9E58"/>
      <rect x="33" y="45" width="1.5" height="2" rx="0.5" fill="#E8D7B5"/>
    </g>

    {/* 3D Smartphone Body */}
    <rect x="19" y="16" width="26" height="36" rx="5" fill="#202536"/>
    <rect x="18" y="15" width="26" height="36" rx="5" fill="#D2D2CE"/>
    <rect x="18" y="14" width="26" height="36" rx="5" fill="#E8E8E5"/>
    <rect x="20" y="16" width="22" height="32" rx="3.5" fill="#202536"/>
    
    {/* Screen Glass */}
    <rect x="21" y="17" width="20" height="30" rx="2.5" fill="#6D8298"/>
    <path d="M21 17H41V22L21 28V17Z" fill="#8FA5BB" fillOpacity="0.5"/>

    {/* Camera Notch */}
    <rect x="28" y="18" width="6" height="1.8" rx="0.9" fill="#202536"/>

    {/* Screen Miniature UI Cards */}
    <rect x="23" y="22" width="16" height="6.5" rx="1.5" fill="#E8D7B5"/>
    <circle cx="26" cy="25.2" r="1.5" fill="#C98A48"/>
    <rect x="29" y="24" width="8" height="1.5" rx="0.7" fill="#202536"/>
    <rect x="29" y="26.2" width="5" height="1" rx="0.5" fill="#202536" fillOpacity="0.4"/>

    <rect x="23" y="30.5" width="16" height="8" rx="1.5" fill="#F7F7F5"/>
    <rect x="25" y="35" width="2" height="2.5" rx="0.6" fill="#8FA58A"/>
    <rect x="28.5" y="33" width="2" height="4.5" rx="0.6" fill="#6D8298"/>
    <rect x="32" y="34" width="2" height="3.5" rx="0.6" fill="#C98A48"/>
    <rect x="35.5" y="32" width="2" height="5.5" rx="0.6" fill="#202536"/>

    {/* Diagonal Glare Reflection */}
    <path d="M22 45L39 18H41L24 45H22Z" fill="#FFFFFF" fillOpacity="0.25"/>
    <rect x="28" y="44.5" width="6" height="1" rx="0.5" fill="#FFFFFF" fillOpacity="0.7"/>
  </svg>
);

/**
 * 6. Tours & Travel
 * Soft 3D rolling travel luggage suitcase with telescopic pull handle, wheels, luggage tag, destination compass stamp, and soaring jet flight trail
 */
export const ToursTravelIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ground contact shadow */}
    <ellipse cx="32" cy="54.5" rx="21" ry="4" fill="#202536" fillOpacity="0.12"/>
    <ellipse cx="24" cy="54" rx="5.5" ry="2" fill="#202536" fillOpacity="0.14"/>
    <ellipse cx="40" cy="54" rx="5.5" ry="2" fill="#202536" fillOpacity="0.14"/>

    {/* Dotted Flight Contrail Arc */}
    <path d="M12 28C13.5 17 22.5 10 38 8.5" stroke="#6D8298" strokeWidth="1.8" strokeDasharray="2.5 2.5" strokeLinecap="round" strokeOpacity="0.75"/>

    {/* Soaring Travel Plane (Top-Right Flight Angle) */}
    <g transform="translate(36, 4) rotate(16)">
      {/* Plane Shadow */}
      <path d="M15 6L6 9.5V11L15 8.5L18.5 9.5V8.5L16.5 7.5L20 7L21.5 6L20 5L16.5 4.5L18.5 3.5V2.5L15 3.5L6 1.5V3L15 6Z" fill="#202536" fillOpacity="0.15"/>
      {/* Fuselage */}
      <path d="M21 6.5C21 6.5 19 5.2 15 5.2L6 5.6L2 3H0.8L2 6.5L0.8 10H2L6 7.4L15 7.8C19 7.8 21 6.5 21 6.5Z" fill="#E8E8E5"/>
      <path d="M21 6.5C21 6.5 19 5.4 15 5.4L6 5.8L2 3.3H1.2L2.3 6.5L1.2 9.7H2L6 7.2L15 7.6C19 7.6 21 6.5 21 6.5Z" fill="#FFFFFF"/>
      {/* Wings */}
      <path d="M11 6.5L6.5 1L4 1.4L7.5 6.5H11Z" fill="#6D8298"/>
      <path d="M11 6.5L6.5 12L4 11.6L7.5 6.5H11Z" fill="#4E657B"/>
      {/* Cockpit Window */}
      <path d="M17 6.2L18.5 6.5L17 6.8H15.8L16.4 6.2H17Z" fill="#202536"/>
    </g>

    {/* RETRACTABLE TELESCOPIC HANDLE */}
    {/* Left Chrome Rod */}
    <rect x="27" y="11" width="2" height="13" rx="1" fill="#D2D2CE"/>
    <rect x="27" y="11" width="1" height="13" rx="0.5" fill="#FFFFFF"/>
    {/* Right Chrome Rod */}
    <rect x="35" y="11" width="2" height="13" rx="1" fill="#D2D2CE"/>
    <rect x="35" y="11" width="1" height="13" rx="0.5" fill="#FFFFFF"/>
    {/* Top Ergonomic Handle Bar */}
    <rect x="25" y="8" width="14" height="4.5" rx="2.2" fill="#202536"/>
    <rect x="27" y="9" width="10" height="2" rx="1" fill="#31384E"/>

    {/* Top Carry Handle on Suitcase */}
    <rect x="28.5" y="19" width="7" height="2.5" rx="1.2" fill="#202536"/>
    <rect x="29.5" y="19.4" width="5" height="1" rx="0.5" fill="#31384E"/>

    {/* SPINNER WHEELS */}
    {/* Left Wheel */}
    <ellipse cx="23.5" cy="51.5" rx="3.2" ry="3.8" fill="#202536"/>
    <circle cx="23.5" cy="51.5" r="1.8" fill="#D2D2CE"/>
    <circle cx="23.5" cy="51.5" r="0.9" fill="#202536"/>
    {/* Right Wheel */}
    <ellipse cx="40.5" cy="51.5" rx="3.2" ry="3.8" fill="#202536"/>
    <circle cx="40.5" cy="51.5" r="1.8" fill="#D2D2CE"/>
    <circle cx="40.5" cy="51.5" r="0.9" fill="#202536"/>

    {/* SUITCASE BODY */}
    {/* Base 3D Shell Shadow */}
    <rect x="17.5" y="22" width="29" height="28" rx="5.5" fill="#202536"/>
    {/* Outer Shell (Warm Golden Amber) */}
    <rect x="17.5" y="21" width="29" height="28" rx="5.5" fill="#C98A48"/>
    {/* Front Face */}
    <rect x="18.5" y="22" width="27" height="26" rx="4.5" fill="#DF9E58"/>
    {/* Top Bevel Highlight */}
    <path d="M18.5 25C18.5 23.3 19.8 22 21.5 22H42.5C44.2 22 45.5 23.3 45.5 25V26H18.5V25Z" fill="#F5ECE0" fillOpacity="0.4"/>

    {/* Molded Ribbed Horizontal Travel Grooves */}
    <rect x="22" y="27" width="20" height="2.2" rx="1.1" fill="#C98A48" fillOpacity="0.85"/>
    <rect x="22" y="27" width="20" height="0.8" rx="0.4" fill="#FFFFFF" fillOpacity="0.4"/>
    <rect x="22" y="32" width="20" height="2.2" rx="1.1" fill="#C98A48" fillOpacity="0.85"/>
    <rect x="22" y="32" width="20" height="0.8" rx="0.4" fill="#FFFFFF" fillOpacity="0.4"/>
    <rect x="22" y="37" width="20" height="2.2" rx="1.1" fill="#C98A48" fillOpacity="0.85"/>
    <rect x="22" y="37" width="20" height="0.8" rx="0.4" fill="#FFFFFF" fillOpacity="0.4"/>
    <rect x="22" y="42" width="20" height="2.2" rx="1.1" fill="#C98A48" fillOpacity="0.85"/>
    <rect x="22" y="42" width="20" height="0.8" rx="0.4" fill="#FFFFFF" fillOpacity="0.4"/>

    {/* Navy Reinforced Corner Protectors */}
    <path d="M17.5 26.5C17.5 23.5 19.9 21 22.9 21H24V25C24 25.8 23.3 26.5 22.5 26.5H17.5V26.5Z" fill="#202536"/>
    <path d="M46.5 26.5C46.5 23.5 44.1 21 41.1 21H40V25C40 25.8 40.7 26.5 41.5 26.5H46.5V26.5Z" fill="#202536"/>
    <path d="M17.5 43.5C17.5 46.5 19.9 49 22.9 49H24V45C24 44.2 23.3 43.5 22.5 43.5H17.5V43.5Z" fill="#202536"/>
    <path d="M46.5 43.5C46.5 46.5 44.1 49 41.1 49H40V45C40 44.2 40.7 43.5 41.5 43.5H46.5V43.5Z" fill="#202536"/>

    {/* Hanging Luggage Baggage Tag */}
    <g transform="rotate(-15 41 27)">
      <path d="M41 24.5L42.5 27" stroke="#202536" strokeWidth="1"/>
      <rect x="40.5" y="27" width="6.5" height="8.5" rx="1.5" fill="#E8D7B5" stroke="#202536" strokeWidth="1"/>
      <circle cx="43.7" cy="28.8" r="0.8" fill="#202536"/>
      <rect x="42" y="31" width="3.5" height="1" rx="0.5" fill="#6D8298"/>
      <rect x="42" y="33" width="2.5" height="1" rx="0.5" fill="#C98A48"/>
    </g>

    {/* Destination Compass Stamp Accent */}
    <circle cx="23.5" cy="40" r="3.4" fill="#E8E8E5" stroke="#202536" strokeWidth="0.9"/>
    <path d="M23.5 37.8L24.7 40L23.5 42.2L22.3 40L23.5 37.8Z" fill="#C98A48"/>
    <path d="M21.3 40L23.5 41.2L25.7 40L23.5 38.8L21.3 40Z" fill="#6D8298"/>
    <circle cx="23.5" cy="40" r="0.6" fill="#202536"/>
  </svg>
);

// Backward-compatibility alias
export const ToolsIcon = ToursTravelIcon;

/**
 * 7. Sports & Fitness
 * Soft 3D isometric dumbbell with dual navy/muted-blue weight plates and textured sports ball
 */
export const SportsIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ground contact shadow */}
    <ellipse cx="32" cy="54" rx="22" ry="4.5" fill="#202536" fillOpacity="0.12"/>
    <ellipse cx="44" cy="52" rx="9" ry="3" fill="#202536" fillOpacity="0.15"/>

    {/* DUMBBELL */}
    <g transform="translate(-2, 0)">
      <path d="M15 26L21 21H24L18 26V37L15 35V26Z" fill="#161A26"/>
      <rect x="13" y="24" width="7" height="15" rx="3.5" fill="#202536"/>
      <rect x="14" y="25" width="5" height="13" rx="2.5" fill="#6D8298"/>
      <rect x="14.5" y="25.5" width="2" height="12" rx="1" fill="#8FA5BB"/>
    </g>

    {/* Center Steel Bar */}
    <rect x="19" y="30" width="20" height="4.5" rx="1.5" fill="#202536"/>
    <rect x="19" y="29.5" width="20" height="4" rx="1.5" fill="#D2D2CE"/>
    <rect x="19" y="29.5" width="20" height="1.8" rx="0.9" fill="#FFFFFF"/>
    <line x1="26" y1="30" x2="26" y2="33.5" stroke="#202536" strokeWidth="0.8"/>
    <line x1="29" y1="30" x2="29" y2="33.5" stroke="#202536" strokeWidth="0.8"/>
    <line x1="32" y1="30" x2="32" y2="33.5" stroke="#202536" strokeWidth="0.8"/>

    {/* Front Weight Plate */}
    <g transform="translate(14, 0)">
      <rect x="23" y="23" width="7" height="17" rx="3.5" fill="#202536"/>
      <rect x="23.5" y="24" width="5.5" height="15" rx="2.5" fill="#6D8298"/>
      <rect x="24" y="24.5" width="2.2" height="14" rx="1" fill="#8FA5BB"/>
      <circle cx="26" cy="31.5" r="1.5" fill="#202536"/>
    </g>

    {/* SPORTS BALL (Sage Green) */}
    <circle cx="43" cy="42" r="9" fill="#202536" fillOpacity="0.1"/>
    <circle cx="42" cy="41" r="8.5" fill="#8FA58A"/>
    <path d="M37 36C40 33.5 45 34 47 37C45 35 40 34.5 37 36Z" fill="#A6BEA1"/>
    <path d="M35 38C38 40 40 45 39 48" stroke="#E8D7B5" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M48 35C45 37 43 42 45 46" stroke="#E8D7B5" strokeWidth="1.3" strokeLinecap="round"/>
    <circle cx="40" cy="38" r="1" fill="#FFFFFF" fillOpacity="0.4"/>
  </svg>
);

/**
 * 8. Education & Learning
 * Soft 3D isometric dark navy graduation cap with draped soft orange tassel resting atop an open book
 */
export const EducationIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ground contact shadow */}
    <ellipse cx="32" cy="54" rx="22" ry="4.5" fill="#202536" fillOpacity="0.12"/>

    {/* OPEN BOOK BASE */}
    <path d="M14 43L32 46L50 43V47L32 50L14 47V43Z" fill="#202536"/>
    <path d="M13 42L32 45L51 42V45L32 48L13 45V42Z" fill="#6D8298"/>
    
    {/* Left Page Leaf */}
    <path d="M15 41C20 40 27 41 32 44V40C27 37 20 36 15 37V41Z" fill="#D8C39F"/>
    <path d="M15 37C20 36 27 37 32 40C27 37.5 20 36.5 15 37Z" fill="#F5ECE0"/>
    <path d="M16 38C21 37 27 38 31 40.5V43C27 40.5 21 39.5 16 40.5V38Z" fill="#E8D7B5"/>
    
    {/* Right Page Leaf */}
    <path d="M49 41C44 40 37 41 32 44V40C37 37 44 36 49 37V41Z" fill="#D2D2CE"/>
    <path d="M49 37C44 36 37 37 32 40C37 37.5 44 36.5 49 37Z" fill="#FFFFFF"/>
    <path d="M48 38C43 37 37 38 33 40.5V43C37 40.5 43 39.5 48 40.5V38Z" fill="#E8E8E5"/>

    <line x1="19" y1="39" x2="27" y2="40.5" stroke="#202536" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.3"/>
    <line x1="37" y1="40.5" x2="45" y2="39" stroke="#202536" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.3"/>

    {/* GRADUATION CAP (Mortarboard) */}
    <path d="M24 26C24 23 27 21 32 21C37 21 40 23 40 26V30C40 32 37 34 32 34C27 34 24 32 24 30V26Z" fill="#161A26"/>
    <path d="M25 28C27 30 30 31 32 31C34 31 37 30 39 28V30C39 31.5 36 33 32 33C28 33 25 31.5 25 30V28Z" fill="#202536"/>

    <polygon points="32,15 54,23 32,31 10,23" fill="#161A26"/>
    <polygon points="32,14 54,22 32,30 10,22" fill="#202536"/>
    <polygon points="32,14 10,22 32,30 32,14" fill="#31384E"/>

    {/* Button & Tassel */}
    <ellipse cx="32" cy="22" rx="2" ry="1.2" fill="#C98A48"/>
    <circle cx="32" cy="21.5" r="1" fill="#DF9E58"/>
    <path d="M32 22C37 22 43 24 45 27C47 30 46 34 46.5 37" stroke="#C98A48" strokeWidth="1.8" strokeLinecap="round"/>
    <rect x="45" y="37" width="3.2" height="5.5" rx="1.5" fill="#C98A48"/>
    <rect x="45.5" y="37" width="2.2" height="1" rx="0.5" fill="#DF9E58"/>
  </svg>
);

/**
 * 9. Fashion & Costume
 * Soft 3D isometric folded apparel top paired with structured warm beige and soft orange handbag
 */
export const FashionIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ground contact shadow */}
    <ellipse cx="32" cy="54" rx="22" ry="4.5" fill="#202536" fillOpacity="0.12"/>
    <ellipse cx="44" cy="53" rx="10" ry="3.5" fill="#202536" fillOpacity="0.15"/>

    {/* FOLDED T-SHIRT (Muted Blue) */}
    <g transform="translate(0, 2)">
      <rect x="13" y="27" width="23" height="20" rx="4" fill="#202536"/>
      <rect x="12" y="26" width="23" height="20" rx="4" fill="#6D8298"/>
      <path d="M12 30C12 27.7909 13.7909 26 16 26H31C33.2091 26 35 27.7909 35 30V34H12V30Z" fill="#8FA5BB"/>
      
      <path d="M12 29L19 33V42L12 39V29Z" fill="#52667A"/>
      <path d="M35 29L28 33V42L35 39V29Z" fill="#52667A"/>

      <path d="M20 26C20 28.5 22 30 23.5 30C25 30 27 28.5 27 26H20Z" fill="#202536"/>
      <path d="M21 26C21 27.5 22.5 28.5 23.5 28.5C24.5 28.5 26 27.5 26 26H21Z" fill="#E8D7B5"/>

      <line x1="16" y1="43" x2="31" y2="43" stroke="#52667A" strokeWidth="1.2" strokeLinecap="round"/>
    </g>

    {/* DESIGNER HANDBAG (Warm Beige & Soft Orange) */}
    <g>
      <path d="M38 31C38 23 48 23 48 31" stroke="#202536" strokeWidth="3" strokeLinecap="round"/>
      <path d="M38.5 31C38.5 24 47.5 24 47.5 31" stroke="#31384E" strokeWidth="1.2" strokeLinecap="round"/>

      <rect x="34" y="32" width="18" height="17" rx="5" fill="#202536"/>
      <rect x="33" y="31" width="18" height="17" rx="5" fill="#E8D7B5"/>
      <rect x="33" y="31" width="18" height="4" rx="2" fill="#F5ECE0"/>

      <path d="M33 34C33 32.5 34 31 35.5 31H48.5C50 31 51 32.5 51 34V39C51 40 50 41 49 41H35C34 41 33 40 33 39V34Z" fill="#C98A48"/>
      <path d="M33 34C33 32.5 34 31 35.5 31H48.5C50 31 51 32.5 51 34V35.5H33V34Z" fill="#DF9E58"/>

      <rect x="40.5" y="39" width="3" height="3" rx="1" fill="#F5ECE0" stroke="#202536" strokeWidth="0.8"/>
      <circle cx="42" cy="40.5" r="0.6" fill="#202536"/>

      <circle cx="36" cy="45" r="1" fill="#DF9E58"/>
      <circle cx="48" cy="45" r="1" fill="#DF9E58"/>
    </g>
  </svg>
);

/**
 * 10. Agriculture & Farm
 * Soft 3D isometric sage green farm tractor with heavy rear wheel and fresh organic green sprout
 */
export const AgricultureIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ground contact shadow */}
    <ellipse cx="32" cy="54" rx="22" ry="4.5" fill="#202536" fillOpacity="0.12"/>
    <ellipse cx="48" cy="52" rx="7" ry="2.5" fill="#202536" fillOpacity="0.15"/>

    {/* Far Rear Wheel Silhouette */}
    <ellipse cx="19" cy="38" rx="5" ry="7" fill="#161A26"/>

    {/* Tractor Roll Bar & Steering */}
    <path d="M18 22H27V33H18V22Z" fill="none" stroke="#202536" strokeWidth="2.2" strokeLinejoin="round"/>
    <rect x="17" y="21" width="11" height="2.5" rx="1" fill="#C98A48"/>
    <line x1="26" y1="30" x2="28" y2="27" stroke="#202536" strokeWidth="1.8" strokeLinecap="round"/>

    {/* Engine Hood (Sage Green) */}
    <path d="M26 29H42C43.5 29 44.5 30 44.5 31.5V39H26V29Z" fill="#8FA58A"/>
    <path d="M26 29H42C43.5 29 44.5 30 44.5 31V32.5H26V29Z" fill="#A6BEA1"/>
    <path d="M43 31.5H45C45.5 31.5 46 32 46 32.5V38.5H43V31.5Z" fill="#202536"/>
    <circle cx="44.5" cy="33.5" r="1" fill="#DF9E58"/>

    {/* Exhaust Smokestack */}
    <rect x="37" y="19" width="2.2" height="10" rx="1" fill="#D2D2CE"/>
    <rect x="36.5" y="18" width="3.2" height="1.8" rx="0.8" fill="#202536"/>

    {/* Heavy-Duty Rear Wheel */}
    <circle cx="20" cy="42" r="9.5" fill="#202536"/>
    <path d="M12 42H14M26 42H28M20 34V36M20 48V50" stroke="#31384E" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="20" cy="42" r="6" fill="#E8D7B5"/>
    <circle cx="20" cy="42" r="6" fill="#D8C39F" fillOpacity="0.5"/>
    <circle cx="20" cy="42" r="2.5" fill="#202536"/>

    {/* Front Wheel */}
    <circle cx="41" cy="45" r="5.5" fill="#202536"/>
    <circle cx="41" cy="45" r="3.2" fill="#E8D7B5"/>
    <circle cx="41" cy="45" r="1.5" fill="#202536"/>

    {/* GREEN SPROUT */}
    <ellipse cx="50" cy="49" rx="4" ry="2" fill="#C98A48"/>
    <ellipse cx="50" cy="48.5" rx="3" ry="1.2" fill="#E8D7B5"/>
    <path d="M50 48C50 44 49 40 48 37" stroke="#73896E" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M48 40C44 39 43 43 48 42C48 41 48 40.5 48 40Z" fill="#8FA58A"/>
    <path d="M48 40C45 39.5 44 42 47 41.5Z" fill="#A6BEA1"/>
    <path d="M48 37C52 35 54 39 49 40C48.5 39 48.2 38 48 37Z" fill="#8FA58A"/>
    <path d="M48 37C51 35.5 52.5 38 49 39Z" fill="#A6BEA1"/>
  </svg>
);

/**
 * 11. Business & Office
 * Soft 3D isometric briefcase with golden latches and 3D ascending bar chart columns with growth sparkle
 */
export const BusinessIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ground contact shadow */}
    <ellipse cx="32" cy="54" rx="22" ry="4.5" fill="#202536" fillOpacity="0.12"/>

    {/* EXECUTIVE BRIEFCASE */}
    <g transform="translate(-1, 0)">
      <path d="M22 23V19C22 17.5 23.5 16 25 16H31C32.5 16 34 17.5 34 19V23" stroke="#202536" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M23 23V19.5C23 18.5 24 17.5 25 17.5H31C32 17.5 33 18.5 33 19.5V23" stroke="#31384E" strokeWidth="1" strokeLinecap="round"/>

      <rect x="14" y="24" width="28" height="23" rx="5" fill="#202536"/>
      <rect x="13" y="23" width="28" height="23" rx="5" fill="#E8D7B5"/>
      <rect x="13" y="23" width="28" height="4" rx="2" fill="#F5ECE0"/>

      <line x1="13" y1="33" x2="41" y2="33" stroke="#202536" strokeWidth="1.5"/>

      {/* Latches */}
      <rect x="19" y="31" width="4.5" height="5" rx="1.2" fill="#C98A48"/>
      <rect x="19.5" y="31" width="3.5" height="2" rx="0.5" fill="#DF9E58"/>
      <rect x="20.5" y="34.5" width="1.5" height="1" rx="0.3" fill="#202536"/>

      <rect x="30.5" y="31" width="4.5" height="5" rx="1.2" fill="#C98A48"/>
      <rect x="31" y="31" width="3.5" height="2" rx="0.5" fill="#DF9E58"/>
      <rect x="32" y="34.5" width="1.5" height="1" rx="0.3" fill="#202536"/>

      {/* Reinforced Corners */}
      <path d="M13 41V43C13 44.5 14 46 16 46H18L13 41Z" fill="#D8C39F"/>
      <path d="M41 41V43C41 44.5 40 46 38 46H36L41 41Z" fill="#D8C39F"/>
    </g>

    {/* 3D ASCENDING BAR CHART */}
    <g transform="translate(38, 36)">
      <rect x="1" y="1" width="4" height="11" rx="1" fill="#202536" fillOpacity="0.15"/>
      <rect x="0" y="0" width="4" height="11" rx="1" fill="#8FA58A"/>
      <rect x="0" y="0" width="4" height="2" rx="0.8" fill="#A6BEA1"/>
    </g>

    <g transform="translate(44, 30)">
      <rect x="1" y="1" width="4" height="17" rx="1" fill="#202536" fillOpacity="0.15"/>
      <rect x="0" y="0" width="4" height="17" rx="1" fill="#C98A48"/>
      <rect x="0" y="0" width="4" height="2" rx="0.8" fill="#DF9E58"/>
    </g>

    <g transform="translate(50, 23)">
      <rect x="1" y="1" width="4" height="24" rx="1" fill="#202536" fillOpacity="0.15"/>
      <rect x="0" y="0" width="4" height="24" rx="1" fill="#6D8298"/>
      <rect x="0" y="0" width="4" height="2" rx="0.8" fill="#8FA5BB"/>
    </g>

    <polygon points="52,16 53,18.5 55.5,19.5 53,20.5 52,23 51,20.5 48.5,19.5 51,18.5" fill="#C98A48"/>
  </svg>
);

/**
 * 12. Others & Community (Three Stacked Boxes)
 * Soft 3D isometric stack of three delivery/gift boxes in warm beige, muted blue, and sage green with ribbon bow
 */
export const OthersIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ground contact shadow */}
    <ellipse cx="32" cy="54" rx="23" ry="4.5" fill="#202536" fillOpacity="0.14"/>

    {/* BOTTOM BOX (Warm Beige) */}
    <g>
      <path d="M46 39L53 35V45L46 49V39Z" fill="#D8C39F"/>
      <path d="M46 39L53 35V45L46 49V39Z" fill="#202536" fillOpacity="0.08"/>
      <path d="M15 41L32 49V51L15 43V41Z" fill="#202536" fillOpacity="0.1"/>
      <path d="M15 41L46 41V49C46 49.5 45.5 50 45 50H16C15.5 50 15 49.5 15 49V41Z" fill="#E8D7B5"/>
      <polygon points="31,33 46,39 31,43 16,37" fill="#F5ECE0"/>
      <path d="M31 33L46 39L46 41L31 35L16 39L16 37L31 33Z" fill="#C98A48" fillOpacity="0.7"/>
      <rect x="29.5" y="41" width="3" height="9" fill="#C98A48" fillOpacity="0.8"/>
    </g>

    {/* MIDDLE BOX (Muted Blue) */}
    <g>
      <path d="M40 28L46 25V34L40 37V28Z" fill="#52667A"/>
      <path d="M19 30L40 30V38C40 38.5 39.5 39 39 39H20C19.5 39 19 38.5 19 38V30Z" fill="#6D8298"/>
      <polygon points="30,23 41,27 30,31 19,27" fill="#8FA5BB"/>
      <rect x="28.5" y="30" width="3" height="8" fill="#FFFFFF" fillOpacity="0.7"/>
    </g>

    {/* TOP BOX (Sage Green with Soft Orange Ribbon Bow) */}
    <g>
      <path d="M36 18L41 15.5V23L36 25.5V18Z" fill="#73896E"/>
      <path d="M22 20L36 20V26C36 26.5 35.5 27 35 27H23C22.5 27 22 26.5 22 26V20Z" fill="#8FA58A"/>
      <polygon points="29,15 37,18 29,21 21,18" fill="#A6BEA1"/>

      <rect x="27.5" y="20" width="3" height="6.5" fill="#C98A48"/>
      <ellipse cx="26.5" cy="15" rx="2.5" ry="1.8" fill="#C98A48"/>
      <ellipse cx="26.5" cy="14.8" rx="1.5" ry="1" fill="#DF9E58"/>
      <ellipse cx="31.5" cy="15" rx="2.5" ry="1.8" fill="#C98A48"/>
      <ellipse cx="31.5" cy="14.8" rx="1.5" ry="1" fill="#DF9E58"/>
      <circle cx="29" cy="15.5" r="1.5" fill="#202536"/>
    </g>
  </svg>
);

export const CommunityIcon = OthersIcon;

/**
 * 13. All Needs Sparkles / Geometric 3D Gem Cluster
 */
export const AllNeedsIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ground contact shadow */}
    <ellipse cx="32" cy="54" rx="21" ry="4.5" fill="#202536" fillOpacity="0.12"/>

    {/* Main Isometric 4-Point Gem / Star (Center) */}
    <g>
      <path d="M32 12L37 25L50 30L37 35L32 48L27 35L14 30L27 25L32 12Z" fill="#202536" fillOpacity="0.15"/>
      <polygon points="32,11 32,29 26,24" fill="#DF9E58"/>
      <polygon points="13,29 32,29 26,24" fill="#C98A48"/>
      <polygon points="32,11 32,29 38,24" fill="#8FA5BB"/>
      <polygon points="51,29 32,29 38,24" fill="#6D8298"/>
      <polygon points="13,29 32,29 26,34" fill="#8FA58A"/>
      <polygon points="32,47 32,29 26,34" fill="#73896E"/>
      <polygon points="51,29 32,29 38,34" fill="#202536"/>
      <polygon points="32,47 32,29 38,34" fill="#31384E"/>

      <polygon points="32,22 39,29 32,36 25,29" fill="#E8D7B5"/>
      <polygon points="32,22 32,36 25,29" fill="#F5ECE0"/>
      <circle cx="32" cy="29" r="1.5" fill="#202536"/>
    </g>

    {/* Floating Accent Gems */}
    <g transform="translate(42, 14)">
      <polygon points="6,0 12,6 6,12 0,6" fill="#C98A48"/>
      <polygon points="6,0 6,12 0,6" fill="#DF9E58"/>
      <circle cx="6" cy="6" r="1" fill="#FFFFFF"/>
    </g>
    <g transform="translate(12, 40)">
      <polygon points="5,0 10,5 5,10 0,5" fill="#8FA58A"/>
      <polygon points="5,0 5,10 0,5" fill="#A6BEA1"/>
    </g>
  </svg>
);

/**
 * Unified Category Icon Renderer
 * Routes category ID or name to its soft 3D miniature / isometric SVG icon
 */
export const CategoryIcon: React.FC<CategoryIconProps> = ({ categoryId, className = "w-10 h-10" }) => {
  const norm = (categoryId || '').toLowerCase().replace(/[_\s]+/g, '-');
  switch (norm) {
    case 'category-photography':
    case 'cat-camera':
    case 'photography':
    case 'photography-media':
    case 'photography-&-media':
    case 'photography-and-media':
      return <PhotographyIcon className={className} />;
    
    case 'category-home':
    case 'cat-home':
    case 'home':
    case 'home-living':
    case 'home-properties':
    case 'home-&-properties':
    case 'home-and-properties':
      return <HomeIcon className={className} />;
    
    case 'category-event':
    case 'category-events':
    case 'cat-events':
    case 'event':
    case 'events':
    case 'events-party':
    case 'events-entertainment':
    case 'events-&-entertainment':
    case 'events-and-entertainment':
      return <EventsIcon className={className} />;
    
    case 'category-vehicles':
    case 'cat-vehicles':
    case 'vehicle':
    case 'vehicles':
    case 'vehicles-mobility':
    case 'vehicles-rentals':
    case 'vehicles-&-rentals':
    case 'vehicles-and-rentals':
      return <VehiclesIcon className={className} />;
    
    case 'category-electronics':
    case 'category-tech':
    case 'cat-tech':
    case 'tech':
    case 'electronics':
    case 'electronics-tech':
    case 'electronics-appliances':
    case 'electronics-&-appliances':
    case 'electronics-and-appliances':
      return <ElectronicsIcon className={className} />;
    
    case 'category-travel':
    case 'category-tours':
    case 'category-tours-travel':
    case 'category-tools':
    case 'cat-tools':
    case 'cat-travel':
    case 'tool':
    case 'tools':
    case 'tools-equipment':
    case 'tours-travel':
    case 'tours-&-travel':
    case 'tours-and-travel':
    case 'tours':
    case 'travel':
      return <ToursTravelIcon className={className} />;
    
    case 'category-sports-fitness':
    case 'category-sports':
    case 'cat-sports':
    case 'sport':
    case 'sports':
    case 'sports-fitness':
    case 'sports-outdoors':
    case 'sports-&-fitness':
    case 'sports-and-fitness':
      return <SportsIcon className={className} />;
    
    case 'category-fashion':
    case 'cat-fashion':
    case 'fashion':
    case 'fashion-costume':
    case 'beauty-fashion':
    case 'beauty-&-fashion':
    case 'beauty-and-fashion':
    case 'beauty':
      return <FashionIcon className={className} />;
    
    case 'category-agriculture':
    case 'cat-agriculture':
    case 'agriculture':
    case 'agriculture-farm':
    case 'agriculture-farming':
    case 'agriculture-&-farming':
    case 'agriculture-and-farming':
      return <AgricultureIcon className={className} />;
    
    case 'category-business':
    case 'cat-business':
    case 'business':
    case 'business-office':
    case 'business-market':
    case 'business-&-market':
    case 'business-and-market':
      return <BusinessIcon className={className} />;
    
    case 'category-education':
    case 'cat-education':
    case 'education':
    case 'education-learning':
    case 'education-&-learning':
    case 'education-and-learning':
      return <EducationIcon className={className} />;
    
    case 'category-all':
    case 'all':
    case 'all-needs':
      return <AllNeedsIcon className={className} />;
    
    case 'category-others':
    case 'category-other':
    case 'cat-others':
    case 'cat-community':
    case 'community':
    case 'community-miscellaneous':
    case 'others':
    case 'other':
    case 'other-services':
    case 'other-&-services':
    case 'others-services':
    default:
      return <OthersIcon className={className} />;
  }
};

export const CategorySvgIcon = CategoryIcon;
