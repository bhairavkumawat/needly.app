import { UnifiedCategory } from '../types';
import { CATEGORY_NAMES_HI } from '../i18n/translations';

export const ALL_NEEDS_PHOTO = '/assets/categories/category_all.svg';
export const ALL_NEEDS_ANIMATED_ICON = ALL_NEEDS_PHOTO;

export const UNIFIED_CATEGORIES: UnifiedCategory[] = [
  {
    id: 'photography-media',
    name: 'Photography & Media',
    iconName: 'Camera',
    photoUrl: '/assets/categories/category_photography.svg',
    image: '/assets/categories/category_photography.svg',
    animatedIcon: '/assets/categories/category_photography.svg',
    color: 'bg-violet-50 text-violet-600 border-violet-200',
    description: 'Cameras, lenses, studio lighting, professional photographers, editors & cinema gear',
    productSubcategories: [
      'Cameras',
      'Lenses',
      'Tripods & Gimbals',
      'Lighting & Flash',
      'Drones & Action Cams',
      'Microphones & Audio',
      'Studio Props & Backdrops'
    ],
    serviceSubcategories: [
      'Photographers',
      'Videographers',
      'Drone Operators',
      'Photo & Video Editing',
      'Studio Space Rental',
      'Live Streaming Setup',
      'Album & Print Design'
    ]
  },
  {
    id: 'electronics',
    name: 'Electronics & Appliances',
    iconName: 'Tv',
    photoUrl: '/assets/categories/category_electronics.svg',
    image: '/assets/categories/category_electronics.svg',
    animatedIcon: '/assets/categories/category_electronics.svg',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    description: 'Projectors, laptops, consoles, audio systems, tech repairs & network setup',
    productSubcategories: [
      'Projectors & Screens',
      'Laptops & PCs',
      'Gaming Consoles & VR',
      'Audio & Home Theaters',
      'Monitors & Displays',
      'Printers & 3D Scanners',
      'Power Banks & Inverters'
    ],
    serviceSubcategories: [
      'Electronics Repair',
      'IT & Computer Support',
      'Audio/Visual Setup',
      'Home Network & Wi-Fi',
      'Smart Home & CCTV Setup',
      'Data Recovery & Software'
    ]
  },
  {
    id: 'home',
    name: 'Home & Properties',
    iconName: 'Home',
    photoUrl: '/assets/categories/category_home.svg',
    image: '/assets/categories/category_home.svg',
    animatedIcon: '/assets/categories/category_home.svg',
    color: 'bg-teal-50 text-teal-600 border-teal-200',
    description: 'Appliances, power cleaners, deep home cleaning, plumbers, electricians & carpenters',
    productSubcategories: [
      'High-Pressure Cleaners',
      'Lawn & Garden Equipment',
      'Air Coolers & Heaters',
      'Furniture & Seating',
      'Kitchen Appliances',
      'Generators & Backup Power',
      'Home Decor & Props'
    ],
    serviceSubcategories: [
      'Deep Cleaning & Sanitization',
      'Plumbing',
      'Electrician',
      'Carpentry',
      'Appliance Repair',
      'Interior Painting',
      'Pest Control',
      'Gardening & Landscaping'
    ]
  },
  {
    id: 'vehicles',
    name: 'Vehicles & Rentals',
    iconName: 'Car',
    photoUrl: '/assets/categories/category_vehicles.svg',
    image: '/assets/categories/category_vehicles.svg',
    animatedIcon: '/assets/categories/category_vehicles.svg',
    color: 'bg-sky-50 text-sky-700 border-sky-200',
    description: 'Bikes, scooters, cars, chauffeur drivers, roadside assistance & detailing',
    productSubcategories: [
      'Cars & SUVs',
      'Bikes & Motorcycles',
      'Electric Scooters',
      'Bicycles & Mountain Bikes',
      'Utility Trailers & Racks',
      'Car Roof Boxes & Carriers'
    ],
    serviceSubcategories: [
      'Chauffeur & Drivers',
      'Car Wash & Detailing',
      'Mechanic & Roadside Help',
      'Bike Servicing & Tuning',
      'Towing Services',
      'Vehicle Inspection'
    ]
  },
  {
    id: 'events',
    name: 'Events & Entertainment',
    iconName: 'PartyPopper',
    photoUrl: '/assets/categories/category_event.svg',
    image: '/assets/categories/category_event.svg',
    animatedIcon: '/assets/categories/category_event.svg',
    color: 'bg-rose-50 text-rose-600 border-rose-200',
    description: 'PA systems, party tents, DJ setups, event planners, caterers & decorators',
    productSubcategories: [
      'PA Systems & DJ Gear',
      'Party Tents & Canopies',
      'Stage Lighting & Lasers',
      'Tables & Banquet Chairs',
      'Costumes & Mascots',
      'Karaoke Machines',
      'Projector Screens & Stage Sets'
    ],
    serviceSubcategories: [
      'Event Planners & Managers',
      'DJs & Sound Engineers',
      'Caterers & Bartenders',
      'Stage Decorators & Florists',
      'Performers & Magicians',
      'Emcees & Anchors',
      'Security & Bouncers'
    ]
  },
  {
    id: 'tools',
    name: 'Tours & Travel',
    iconName: 'Compass',
    photoUrl: '/assets/categories/category_travel.svg',
    image: '/assets/categories/category_travel.svg',
    animatedIcon: '/assets/categories/category_travel.svg',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    description: 'Local city tours, heritage walks, travel guides, cab booking, luggage, trekking & travel gear',
    productSubcategories: [
      'Luggage & Travel Bags',
      'Camping & Trekking Gear',
      'Travel Adapters & Accessories',
      'Vehicle Carriers & Roof Racks',
      'Power Drills & Drivers',
      'Ladders & Scaffolding',
      'Hand Tool Kits & Measuring'
    ],
    serviceSubcategories: [
      'Local Tour Guides',
      'Sightseeing & Heritage Walks',
      'Outstation Cabs & Drivers',
      'Custom Itinerary & Trip Planning',
      'Trek & Adventure Guides',
      'Handyman Services'
    ]
  },
  {
    id: 'sports-fitness',
    name: 'Sports & Fitness',
    iconName: 'Dumbbell',
    photoUrl: '/assets/categories/category_sports_fitness.svg',
    image: '/assets/categories/category_sports_fitness.svg',
    animatedIcon: '/assets/categories/category_sports_fitness.svg',
    color: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    description: 'Camping tents, trekking gear, home gyms, personal trainers & adventure guides',
    productSubcategories: [
      'Tents & Camping Gear',
      'Treadmills & Home Gyms',
      'Trekking Backpacks & Poles',
      'Bicycles & Rollerblades',
      'Cricket & Racket Sets',
      'Kayaks & Water Sports',
      'Yoga Mats & Weights'
    ],
    serviceSubcategories: [
      'Personal Trainers',
      'Yoga & Pilates Instructors',
      'Sports Coaches (Cricket/Tennis)',
      'Trek & Adventure Guides',
      'Nutrition & Diet Planners',
      'Swimming Coaches'
    ]
  },
  {
    id: 'education',
    name: 'Education & Learning',
    iconName: 'GraduationCap',
    photoUrl: '/assets/categories/category_education.svg',
    image: '/assets/categories/category_education.svg',
    animatedIcon: '/assets/categories/category_education.svg',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    description: 'Musical instruments, robotics kits, textbooks, home tutors & coding coaches',
    productSubcategories: [
      'Musical Instruments (Guitars/Keyboards)',
      'Science & Robotics Kits',
      'Smart Projectors & Boards',
      'Textbooks & Prep Guides',
      'Art & Craft Supply Kits'
    ],
    serviceSubcategories: [
      'Home & Online Tutors',
      'Music Instructors',
      'Language Trainers',
      'Coding & Robotics Mentors',
      'Test Prep & JEE Coaches',
      'Art & Dance Teachers'
    ]
  },
  {
    id: 'fashion',
    name: 'Beauty & Fashion',
    iconName: 'Shirt',
    photoUrl: '/assets/categories/category_fashion.svg',
    image: '/assets/categories/category_fashion.svg',
    animatedIcon: '/assets/categories/category_fashion.svg',
    color: 'bg-pink-50 text-pink-600 border-pink-200',
    description: 'Designer tuxedos, bridal wear, luxury jewelry, tailors & makeup artists',
    productSubcategories: [
      'Wedding & Bridal Outfits',
      'Designer Suits & Tuxedos',
      'Traditional & Festival Wear',
      'Fine Jewelry & Watches',
      'Luxury Bags & Clutches',
      'Themed Costumes'
    ],
    serviceSubcategories: [
      'Custom Tailoring & Alterations',
      'Bridal & Party Makeup Artists',
      'Hair Stylists & Barbers',
      'Fashion Stylists & Drapers',
      'Dry Cleaning & Steam Press'
    ]
  },
  {
    id: 'agriculture',
    name: 'Agriculture & Farming',
    iconName: 'Sprout',
    photoUrl: '/assets/categories/category_agriculture.svg',
    image: '/assets/categories/category_agriculture.svg',
    animatedIcon: '/assets/categories/category_agriculture.svg',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    description: 'Tractors, sprayers, drip irrigation, farm labor & soil testing experts',
    productSubcategories: [
      'Tractors & Attachments',
      'Power Tillers & Weeders',
      'Sprayers & Dusters',
      'Irrigation Pipes & Solar Pumps',
      'Harvesting Equipment',
      'Grain Storage & Crates'
    ],
    serviceSubcategories: [
      'Farm Labor Crew',
      'Tractor & Machinery Operators',
      'Agronomy & Soil Testing',
      'Borewell & Pump Servicing',
      'Crop Spraying Services',
      'Harvesting Support'
    ]
  },
  {
    id: 'business',
    name: 'Business & Market',
    iconName: 'Briefcase',
    photoUrl: '/assets/categories/category_business.svg',
    image: '/assets/categories/category_business.svg',
    animatedIcon: '/assets/categories/category_business.svg',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    description: 'Office setups, commercial printers, booths, accountants & legal consultants',
    productSubcategories: [
      'Office Desks & Ergonomic Chairs',
      'Commercial Printers & Copiers',
      'Trade Show Booth Displays',
      'POS Terminals & Barcode Scanners',
      'Conference Mics & Webcams'
    ],
    serviceSubcategories: [
      'Accountants & Tax Filing (GST)',
      'Legal & Notary Assistance',
      'Graphic Designers & Branding',
      'Virtual Assistants & Data Entry',
      'Business Consultation & Registrations'
    ]
  },
  {
    id: 'other',
    name: 'Other Services',
    iconName: 'Sparkles',
    photoUrl: '/assets/categories/category_others.svg',
    image: '/assets/categories/category_others.svg',
    animatedIcon: '/assets/categories/category_others.svg',
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    description: 'Board games, luggage bags, pet crates, dog walking & local errand runners',
    productSubcategories: [
      'Board Games & Party Toys',
      'Luggage & Travel Bags',
      'Pet Crates & Carriers',
      'Vintage Collectibles',
      'Miscellaneous Equipment'
    ],
    serviceSubcategories: [
      'Pet Sitting & Dog Walking',
      'Local Errand Runners & Delivery',
      'Home Organization & Moving Help',
      'Custom & Specialized Requests'
    ]
  }
];

export const CATEGORIES = UNIFIED_CATEGORIES;

export function getCategoryById(id: string): UnifiedCategory | undefined {
  if (!id) return undefined;
  const lower = id.toLowerCase().trim();
  return UNIFIED_CATEGORIES.find(c => {
    const cId = c.id.toLowerCase();
    const cName = c.name.toLowerCase();
    if (cId === lower || cName === lower) return true;
    if (c.id === 'tools' && (lower === 'tours-travel' || lower === 'tours & travel' || lower === 'tours and travel' || lower === 'travel')) return true;
    if (c.id === 'fashion' && (lower === 'beauty & fashion' || lower === 'beauty and fashion' || lower === 'beauty-fashion' || lower === 'beauty')) return true;
    if (c.id === 'electronics' && (lower === 'electronics & appliances' || lower === 'electronics and appliances' || lower === 'appliances')) return true;
    if (c.id === 'home' && (lower === 'home & properties' || lower === 'home and properties' || lower === 'properties')) return true;
    if (c.id === 'vehicles' && (lower === 'vehicles & rentals' || lower === 'vehicles and rentals' || lower === 'rentals')) return true;
    if (c.id === 'events' && (lower === 'events & entertainment' || lower === 'events and entertainment' || lower === 'entertainment')) return true;
    if (c.id === 'education' && (lower === 'education & learning' || lower === 'education and learning' || lower === 'learning')) return true;
    if (c.id === 'agriculture' && (lower === 'agriculture & farming' || lower === 'agriculture and farming' || lower === 'farming')) return true;
    if (c.id === 'business' && (lower === 'business & market' || lower === 'business and market' || lower === 'market')) return true;
    if (c.id === 'other' && (lower === 'other services' || lower === 'others' || lower === 'services')) return true;
    return false;
  });
}

export function getCategoryName(id: string, lang?: string): string {
  const currentLang = lang || (typeof localStorage !== 'undefined' ? localStorage.getItem('needly_language') : 'en');
  if (currentLang === 'hi' && CATEGORY_NAMES_HI[id]) {
    return CATEGORY_NAMES_HI[id];
  }
  const match = getCategoryById(id);
  return match ? match.name : id;
}

export function getSubcategoriesForCategory(catId: string, type: 'product' | 'service'): string[] {
  const cat = getCategoryById(catId);
  if (!cat) return [];
  return type === 'product' ? cat.productSubcategories : cat.serviceSubcategories;
}
