import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'elec-tv-003',
    name: 'Samsung 55" UHD 4K Smart TV - Crystal Display with HDR10+',
    category: 'Electronics & Appliances',
    price: 495000,
    originalPrice: 620000,
    discount: 20,
    imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 220,
    description: 'Experience pure ultra-high definition cinematic entertainment in Nigerian homes. Stream your favorite movies, sports, and YouTube flaws with native Smart Hub integration and dual Bluetooth connectivity.',
    stock: 12,
    sellerId: 'sell-samsung-concept',
    sellerName: 'Samsung Direct Shop',
    isFlashSale: true,
    isApproved: true,
    brand: 'Samsung',
    createdAt: 1717000000000,
    specifications: {
      'Screen Size': '55 Inches',
      'Display Resolution': '4K UHD (3840 x 2160)',
      'Smart OS': 'Tizen Smart TV Platform',
      'HDMI Ports': '3 Ports',
      'USB Ports': '2 Ports'
    },
    reviews: [
      { id: '1', userName: 'Yemi A.', rating: 5, comment: 'Colors are breathtaking. Remote is simple and sleek.', date: '2026-05-20' }
    ]
  },
  {
    id: 'elec-tv-003b',
    name: 'LG 55" Nanocell 4K UHD Smart TV with ThinQ AI Voice Control',
    category: 'Electronics & Appliances',
    price: 365000,
    originalPrice: 480000,
    discount: 24,
    imageUrl: 'https://images.unsplash.com/photo-1601944179066-297bff591b3e?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewsCount: 145,
    description: 'Immerse into pure, vibrant colors on this LG Nanocell display and experience high frame rate HDR playback. Supports Apple AirPlay 2, HomeKit, and Google Assistant natively.',
    stock: 15,
    sellerId: 'sell-lg-official',
    sellerName: 'LG Authorized Mall',
    isFlashSale: false,
    isApproved: true,
    brand: 'LG',
    createdAt: 1717050000000,
    specifications: {
      'Screen Size': '55 Inches',
      'Display Resolution': '4K UHD (3840 x 2160)',
      'Smart OS': 'webOS Smart Platform',
      'AI Voice Control': 'Built-in ThinQ AI'
    },
    reviews: [
      { id: '1', userName: 'Oluwaseun T.', rating: 5, comment: 'Simply the best colors for gaming and live action sports! Extremely responsive menu.', date: '2026-05-22' }
    ]
  },
  {
    id: 'elec-tv-003c',
    name: 'Sony Bravia XR 65" Class OLED 4K Smart Google TV Ultra Color',
    category: 'Electronics & Appliances',
    price: 850000,
    originalPrice: 1100000,
    discount: 22,
    imageUrl: 'https://images.unsplash.com/photo-1558882224-cca166733360?auto=format&fit=crop&w=600&q=80',
    rating: 5.0,
    reviewsCount: 88,
    description: 'The pinnacle of contrast and color depth: Sony Bravia OLED panel delivers deepest blacks and sparkling brightness for true theater experiences in Lagos.',
    stock: 7,
    sellerId: 'sell-sony-gallery',
    sellerName: 'Sony Center Victoria Island',
    isFlashSale: true,
    isApproved: true,
    brand: 'Sony',
    createdAt: 1717150000000,
    specifications: {
      'Screen Size': '65 Inches',
      'Display Resolution': '4K OLED',
      'Audio': 'Acoustic Surface Audio+ (Digital Surround)',
      'Refresh Rate': '120 Hz Variable'
    },
    reviews: [
      { id: '1', userName: 'Kelechi N.', rating: 5, comment: 'Mind-boggling colors! Cinematic grade audio coming straight from the screen.', date: '2026-05-25' }
    ]
  },
  {
    id: 'elec-tv-003d',
    name: 'Hisense 43" HDR smart LED TV - High Def Bright Colors',
    category: 'Electronics & Appliances',
    price: 185000,
    originalPrice: 245000,
    discount: 24,
    imageUrl: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
    reviewsCount: 112,
    description: 'Affordable, premium class visuals for matching cozy lounges and executive bedrooms. Features bright LED backlit pixel arrays and rapid smart app hubs.',
    stock: 20,
    sellerId: 'sell-hisense-flagship',
    sellerName: 'Hisense Official Mall',
    isFlashSale: false,
    isApproved: true,
    brand: 'Hisense',
    createdAt: 1716950000000,
    specifications: {
      'Screen Size': '43 Inches',
      'Display Resolution': 'FHD 1080P with HDR',
      'HDMI Ports': '2 Ports',
      'Smart OS': 'VIDAA Smart OS'
    },
    reviews: []
  },
  {
    id: 'ph-sph-004',
    name: 'Infinix Note 40 Pro 5G - 256GB ROM + 8GB RAM Epic Slate',
    category: 'Phones & Tablets',
    price: 295000,
    originalPrice: 350000,
    discount: 16,
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
    reviewsCount: 180,
    description: 'Unmatched speed with Infinix Note 40 Pro featuring 120Hz AMOLED super-fluid curved display, ultra-vivid 108MP camera lens, all-day 5000mAh battery with 70W fast charger.',
    stock: 45,
    sellerId: 'sell-infinix-shack',
    sellerName: 'Infinix Plaza Vendor',
    isFlashSale: false,
    isApproved: true,
    brand: 'Infinix',
    createdAt: 1717100000000,
    specifications: {
      'Storage': '256GB ROM',
      'RAM': '8GB + 8GB Extended RAM',
      'Camera': '108MP Quad Main + 32MP Front Selfie',
      'Battery': '5000mAh Lithium-Polymer',
      'Charging speed': '70W All-Round FastCharge'
    },
    reviews: [
      { id: '1', userName: 'Umar F.', rating: 5, comment: 'Charge holds for 2 full days under heavy usage. Fast charging is magical!', date: '2026-05-18' }
    ]
  },
  {
    id: 'cop-lap-005',
    name: 'HP EliteBook 840 G8 - Intel Core i7 16GB RAM / 512GB SSD',
    category: 'Computers & Accessories',
    price: 340000,
    originalPrice: 420000,
    discount: 19,
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
    reviewsCount: 42,
    description: 'A powerful modern laptop designed for local remote workers and tech industry leaders in Nigeria. Secure, robust carbon fiber construct, beautiful 14-inch Full HD glare-free panel, and exceptional battery backup.',
    stock: 8,
    sellerId: 'sell-compu-tech',
    sellerName: 'CompuTech Hub',
    isFlashSale: true,
    isApproved: true,
    brand: 'HP',
    createdAt: 1716500000000,
    specifications: {
      'CPU': 'Intel Core i7 11th Gen',
      'RAM': '16GB DDR4 High Speed',
      'SSD': '512GB NVMe M.2 Solid State',
      'OS': 'Windows 11 Professional',
      'Keyboard': 'Backlit Ergonomic English'
    }
  },
  {
    id: 'fas-mcl-006',
    name: 'Classic Men Breathable Leather Loafers - Elegant Dark Brown',
    category: 'Fashion & Apparel',
    price: 28500,
    originalPrice: 45000,
    discount: 36,
    imageUrl: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=600&q=80',
    rating: 4.4,
    reviewsCount: 54,
    description: 'Step in style to church, business meetings, or wedding invitations. Made with hand-finished genuine brown leather, padded support core, and durable rubber non-slip driving outsoles.',
    stock: 60,
    sellerId: 'sell-lagos-fashion',
    sellerName: 'Lagos Couture Store',
    isFlashSale: false,
    isApproved: true,
    brand: 'Classic Men',
    createdAt: 1716700000000,
    specifications: {
      'Style': 'Italian Slip-on Loafers',
      'Material': 'Genuine Calf Leather',
      'Inner lining': 'Premium Sweat-Absorbent Canvas',
      'Sizes': '40 - 46 Available'
    }
  },
  {
    id: 'gro-pmp-007',
    name: 'Mamador Pure Vegetable Cooking Oil - 3.8L Power Canister',
    category: 'Supermarket & Groceries',
    price: 14200,
    originalPrice: 17500,
    discount: 18,
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 310,
    description: 'Churched for health and pure quality. Mamador vegetable oil ensures your family meals—Jollof, fried plantains, stews—taste outstandingly delicious and free of harmful cholesterol.',
    stock: 150,
    sellerId: 'sell-gro-mart',
    sellerName: 'Mainland Grocery Wholesale',
    isFlashSale: false,
    isApproved: true,
    brand: 'Mamador',
    createdAt: 1717200000000,
    specifications: {
      'Volume': '3.8 Litres',
      'Type': '100% Soya & Vegetable Extract',
      'Packaging': 'Ergonomic Plastic Canister'
    }
  }
];

export const CATEGORIES = [
  'All Categories',
  'Electronics & Appliances',
  'Phones & Tablets',
  'Computers & Accessories',
  'Fashion & Apparel',
  'Supermarket & Groceries',
  'Health & Beauty'
];
