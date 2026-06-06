/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import HeroCarousel from './components/HeroCarousel';
import FlashSales from './components/FlashSales';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import ProductDetailModal from './components/ProductDetailModal';
import QuickViewModal from './components/QuickViewModal';
import CheckoutView from './components/CheckoutView';
import { 
  SellerDashboard, 
  AdminDashboard, 
  OrderTrackingView, 
  CustomerSupportChat 
} from './components/DashboardViews';
import { AdminStorefrontPortal } from './components/AdminStorefrontPortal';
import { DailyDealCountdown } from './components/DailyDealCountdown';

import { INITIAL_PRODUCTS } from './data/products';
const quxbaLogo = '/quxba_blocks_logo.png';
import quxbaBlocksBanner from './assets/images/quxba_blocks_banner_1780389199277.png';
import { Product, CartItem, Order, UserAccount } from './types';
import { 
  Zap, Flame, Percent, RefreshCcw, Landmark, Award, ShieldCheck, HelpCircle, Smartphone, ArrowRight,
  ListFilter, SlidersHorizontal, RotateCcw, X, ChevronDown, ChevronRight, Grid, List,
  Home, ShoppingCart, Heart, User, ShieldAlert, KeyRound, Mail, UserPlus, Info, ShoppingBag,
  Eye, EyeOff, Loader2, Scale, FileText
} from 'lucide-react';

// Supabase Integrations
import { 
  isSupabaseEnabled, 
  supabase, 
  supabaseSignIn, 
  supabaseSignUp, 
  supabaseSignOut, 
  supabaseGetProducts, 
  supabaseAddProduct, 
  supabaseGetCategories,
  supabaseAddCategory,
  supabaseDeleteCategory,
  supabaseAddOrder,
  supabaseGetOrders,
  supabaseUpdateOrderStatus
} from './supabase';

const ADMIN_RESTRICTED_PRODUCTS = INITIAL_PRODUCTS;

export default function App() {
  // Syncing States to Client-Side Local Storage & Firebase Firestore
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('quxba_local_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return ADMIN_RESTRICTED_PRODUCTS;
  });
  const [productToConfirmDelete, setProductToConfirmDelete] = useState<Product | null>(null);
  const [deletedProductIds, setDeletedProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('quxba_deleted_product_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {}
    return [];
  });

  const visibleProducts = products.filter(p => !deletedProductIds.includes(p.id));

  const DEFAULT_CATEGORIES = [
    {
      id: 'electronics',
      name: 'Electronics & Appliances',
      desc: 'Fridges, ACs, smart TVs, soundbars',
      emoji: '🔌',
      subcategories: ['Refrigerators', 'Air Conditioners', 'Smart TVs', 'Audio Setups']
    },
    {
      id: 'phones',
      name: 'Phones & Tablets',
      desc: 'Latest devices, powerbanks, chargers',
      emoji: '📱',
      subcategories: ['Smartphones', 'Tablets', 'Chargers & Powerbanks']
    },
    {
      id: 'computers',
      name: 'Computers & Accessories',
      desc: 'Laptops, mouse, keyboards, monitors',
      emoji: '💻',
      subcategories: ['Laptops', 'Keyboards & Mice', 'Monitors']
    },
    {
      id: 'fashion',
      name: 'Fashion & Apparel',
      desc: 'Wears, sneakers, shoes, bags',
      emoji: '👕',
      subcategories: [
        "Women's Fashion",
        "Men's Fashion",
        "Shoes",
        "Bags",
        "Accessories",
        "Watches",
        "High Glass"
      ]
    },
    {
      id: 'supermarket',
      name: 'Supermarket & Groceries',
      desc: 'Food items, snacks, drinks, dishwashers',
      emoji: '🍏',
      subcategories: ['Grains & Pasta', 'Snacks', 'Soft Drinks', 'Household']
    },
    {
      id: 'health',
      name: 'Health & Beauty',
      desc: 'Skincare, lotions, roll-on, body spray',
      emoji: '🧴',
      subcategories: ['Skincare', 'Makeup', 'Perfumes & Deodorant']
    }
  ];

  const [categories, setCategories] = useState<any[]>(() => {
    const saved = localStorage.getItem('quxba_local_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  
  // Admin category editing states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [adminSelectedCatId, setAdminSelectedCatId] = useState<string>('');
  const [adminCatName, setAdminCatName] = useState('');
  const [adminCatEmoji, setAdminCatEmoji] = useState('📦');
  const [adminCatDesc, setAdminCatDesc] = useState('');
  const [adminCatSubs, setAdminCatSubs] = useState('');
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState('');
  const [catSuccess, setCatSuccess] = useState('');

  // Categories realtime syncing
  useEffect(() => {
    if (isSupabaseEnabled) {
      const fetchSupabaseCategories = async () => {
        try {
          const catList = await supabaseGetCategories();
          if (catList && catList.length > 0) {
            setCategories(catList);
            localStorage.setItem('quxba_local_categories', JSON.stringify(catList));
          } else {
            setCategories(DEFAULT_CATEGORIES);
          }
        } catch (e) {
          console.warn("Supabase fetch categories error:", e);
          setCategories(DEFAULT_CATEGORIES);
        }
      };

      fetchSupabaseCategories();

      const channel = supabase
        .channel('categories-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'categories' },
          () => {
            fetchSupabaseCategories();
          }
        )
        .subscribe();

      // Listen to local storage updates inside the same application
      const handleLocalUpdate = () => {
        try {
          const saved = localStorage.getItem('quxba_local_categories');
          if (saved) {
            setCategories(JSON.parse(saved));
          }
        } catch (e) {}
      };
      window.addEventListener('quxba_local_categories_updated', handleLocalUpdate);

      return () => {
        supabase.removeChannel(channel);
        window.removeEventListener('quxba_local_categories_updated', handleLocalUpdate);
      };
    } else {
      const handleLocalUpdate = () => {
        try {
          const saved = localStorage.getItem('quxba_local_categories');
          if (saved) {
            setCategories(JSON.parse(saved));
          } else {
            setCategories(DEFAULT_CATEGORIES);
          }
        } catch (e) {
          setCategories(DEFAULT_CATEGORIES);
        }
      };
      handleLocalUpdate();
      window.addEventListener('quxba_local_categories_updated', handleLocalUpdate);
      return () => {
        window.removeEventListener('quxba_local_categories_updated', handleLocalUpdate);
      };
    }
  }, []);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('jumia_user_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('jumia_user_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>([]);

  // User Authentication States
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('jumia_logged_in_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [registeredUsers, setRegisteredUsers] = useState<Record<string, { name: string; email: string; pass: string }>>(() => {
    const saved = localStorage.getItem('jumia_registered_users');
    if (saved) return JSON.parse(saved);
    const initial = {
      'quxbashop@gmail.com': { name: 'Owner / Admin', email: 'quxbashop@gmail.com', pass: 'quxbashop123' }
    };
    localStorage.setItem('jumia_registered_users', JSON.stringify(initial));
    return initial;
  });

  // Real-time Toast Notifications state for flash sale & price drop alerts
  const [toasts, setToasts] = useState<{ id: string; title: string; message: string; type: 'price-drop' | 'flash-sale' | 'info'; productImageUrl?: string }[]>([]);
  
  // Ref to hold previous products list for change detection
  const prevProductsRef = useRef<Product[]>([]);

  // Ref to hold latest wishlist values to prevent stale closures inside onSnapshot
  const wishlistRef = useRef<Product[]>(wishlist);
  
  useEffect(() => {
    wishlistRef.current = wishlist;
  }, [wishlist]);

  const addToast = (title: string, message: string, type: 'price-drop' | 'flash-sale' | 'info', productImageUrl?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type, productImageUrl }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isAppLoading, setIsAppLoading] = useState(() => {
    return sessionStorage.getItem('quxba_app_already_loaded') !== 'true';
  });

  // Automatic geographic location request and loading simulation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      // First attempt immediate location check to prompt permission automatically
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log("Automatic geographic location granted successfully:", pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn("Automatic geographic location prompt ignored or failed:", err.message);
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    }

    const alreadyLoaded = sessionStorage.getItem('quxba_app_already_loaded') === 'true';
    if (alreadyLoaded) {
      setIsAppLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsAppLoading(false);
      sessionStorage.setItem('quxba_app_already_loaded', 'true');
    }, 2650);

    return () => clearTimeout(timer);
  }, []);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  // Session listener & Auth Change Trigger (Supabase / Local)
  useEffect(() => {
    if (isSupabaseEnabled) {
      // 1. Get current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          const u = {
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User'
          };
          setCurrentUser(u);
          localStorage.setItem('jumia_logged_in_user', JSON.stringify(u));
          localStorage.setItem('jumia_auth_method', 'supabase');
        }
      }).catch(err => {
        console.warn("Supabase auth session load warning:", err);
      });

      // 2. Listen to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
          const u = {
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User'
          };
          setCurrentUser(u);
          localStorage.setItem('jumia_logged_in_user', JSON.stringify(u));
          localStorage.setItem('jumia_auth_method', 'supabase');
        } else if (event === 'SIGNED_OUT' || !session) {
          const authMethod = localStorage.getItem('jumia_auth_method');
          if (authMethod === 'supabase' || !authMethod) {
            setCurrentUser(null);
            localStorage.removeItem('jumia_logged_in_user');
            localStorage.removeItem('jumia_auth_method');
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Local Database Auth mode: read current user from localStorage if set
      try {
        const saved = localStorage.getItem('jumia_logged_in_user');
        if (saved) {
          setCurrentUser(JSON.parse(saved));
        }
      } catch (e) {}
    }
  }, []);

  // Sync Products list in real-time
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    const logPrefix = "[Firestore Product Sync]";

    // Change Detection & Notifications Alert logic
    const detectChanges = (newProds: Product[]) => {
      const prevProducts = prevProductsRef.current;
      if (prevProducts && prevProducts.length > 0) {
        wishlistRef.current.forEach((wishItem) => {
          const oldProd = prevProducts.find(p => p.id === wishItem.id);
          const newProd = newProds.find(p => p.id === wishItem.id);
          if (oldProd && newProd) {
            // 1. Detect Product Price Drop
            if (newProd.price < oldProd.price) {
              addToast(
                'Price Drop Alert! 📉',
                `The price of ${newProd.name} on your wishlist dropped from ₦${oldProd.price.toLocaleString()} to ₦${newProd.price.toLocaleString()}!`,
                'price-drop',
                newProd.imageUrl
              );
              // Sync wishlist
              setWishlist(prev => prev.map(item => item.id === newProd.id ? newProd : item));
            }
            // 2. Detect Flash Sale event
            else if (newProd.isFlashSale && !oldProd.isFlashSale) {
              addToast(
                'Flash Sale Alert! ⚡',
                `${newProd.name} on your wishlist is now on a limited Flash Sale! Hurry and secure yours before it runs out!`,
                'flash-sale',
                newProd.imageUrl
              );
              // Sync wishlist
              setWishlist(prev => prev.map(item => item.id === newProd.id ? newProd : item));
            }
          }
        });
      }
      prevProductsRef.current = newProds;
    };

    if (isSupabaseEnabled) {
      const fetchSupabaseProducts = async () => {
        try {
          const prodList = await supabaseGetProducts();
          const staleIds = [
            'elec-ref-001', 
            'elec-ac-002', 
            'elec-tv-003', 
            'elec-tv-003b', 
            'elec-tv-003c', 
            'elec-tv-003d', 
            'ph-sph-004', 
            'cop-lap-005', 
            'fas-mcl-006', 
            'gro-pmp-007', 
            'hea-cos-008', 
            'daily-deal-ref-nexus'
          ];
          
          if (prodList && prodList.length > 0) {
            // One-time deletion cleanup from Supabase tables for deleted base items
            const foundStale = prodList.some((p: any) => staleIds.includes(p.id));
            if (foundStale) {
              console.log("[Supabase Sync] Cleaning up stale pre-seeded products across the database:", staleIds);
              for (const staleId of staleIds) {
                try {
                  await supabase.from('products').delete().eq('id', staleId);
                } catch (delErr) {
                  console.warn(`Could not erase legacy item ${staleId}:`, delErr);
                }
              }
            }

            let formatted = prodList.map((p: any) => ({
              ...p,
              createdAt: p.created_at ? new Date(p.created_at).getTime() : Date.now(),
            }));
            
            // Filter stale pre-seeded legacy items completely
            formatted = formatted.filter((p: any) => p && p.id && !staleIds.includes(p.id));

            // Merge with local-only fallback products so user added items are NEVER overwritten or deleted by database synchronizations
            try {
              const saved = localStorage.getItem('quxba_local_products');
              if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                  parsed.forEach((localProd: any) => {
                    if (localProd && localProd.id && !staleIds.includes(localProd.id)) {
                      const exists = formatted.some((p: any) => p.id === localProd.id);
                      if (!exists) {
                        formatted.push(localProd);
                      }
                    }
                  });
                }
              }
            } catch (mergeErr) {}

            detectChanges(formatted);
            setProducts(formatted);
            try {
              localStorage.setItem('quxba_local_products', JSON.stringify(formatted));
            } catch (e) {}
          } else {
            // Auto-seeding initial products when database is black
            const emailInStorage = localStorage.getItem('jumia_logged_in_user');
            const isAdmin = (emailInStorage && emailInStorage.toLowerCase().includes('quxbashop@gmail.com')) || 
                            (currentUser?.email && currentUser.email.toLowerCase() === 'quxbashop@gmail.com');
            if (isAdmin) {
              console.log("[Supabase Product Sync] Products table is empty. Auto-seeding initial products...");
              try {
                for (const item of INITIAL_PRODUCTS) {
                  try {
                    await supabaseAddProduct({
                      ...item,
                      addedByAdmin: true,
                      isApproved: true,
                      adminId: 'quxbashop@gmail.com'
                    });
                  } catch (e) {}
                }
                const updatedList = await supabaseGetProducts();
                if (updatedList && updatedList.length > 0) {
                  let formatted = updatedList.map((p: any) => ({
                    ...p,
                    createdAt: p.created_at ? new Date(p.created_at).getTime() : Date.now(),
                  }));
                  formatted = formatted.filter((p: any) => p && p.id && !staleIds.includes(p.id));
                  
                  // Merge local Fallbacks here too
                  try {
                    const saved = localStorage.getItem('quxba_local_products');
                    if (saved) {
                      const parsed = JSON.parse(saved);
                      if (Array.isArray(parsed)) {
                        parsed.forEach((localProd: any) => {
                          if (localProd && localProd.id && !staleIds.includes(localProd.id)) {
                            const exists = formatted.some((p: any) => p.id === localProd.id);
                            if (!exists) {
                              formatted.push(localProd);
                            }
                          }
                        });
                      }
                    }
                  } catch (mergeErr) {}

                  detectChanges(formatted);
                  setProducts(formatted);
                  try {
                    localStorage.setItem('quxba_local_products', JSON.stringify(formatted));
                  } catch (e) {}
                  return;
                }
              } catch (seedErr) {
                console.warn("[Supabase Product Sync] Seeding index error:", seedErr);
              }
            }
            setProducts(ADMIN_RESTRICTED_PRODUCTS);
          }
        } catch (e) {
          console.warn("Supabase products load issue:", e);
          setProducts(ADMIN_RESTRICTED_PRODUCTS);
        }
      };

      fetchSupabaseProducts();

      const channel = supabase
        .channel('products-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          () => {
            fetchSupabaseProducts();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      // Offline / Local storage fallback products loader
      try {
        const saved = localStorage.getItem('quxba_local_products');
        let currentProds = ADMIN_RESTRICTED_PRODUCTS;
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            currentProds = parsed;
          }
        }
        
        // Filter out stale IDs from offline fallback state
        const staleIds = [
          'elec-ref-001', 
          'elec-ac-002', 
          'elec-tv-003', 
          'elec-tv-003b', 
          'elec-tv-003c', 
          'elec-tv-003d', 
          'ph-sph-004', 
          'cop-lap-005', 
          'fas-mcl-006', 
          'gro-pmp-007', 
          'hea-cos-008', 
          'daily-deal-ref-nexus'
        ];
        currentProds = currentProds.filter((p: any) => p && p.id && !staleIds.includes(p.id));

        detectChanges(currentProds);
        setProducts(currentProds);
        try {
          localStorage.setItem('quxba_local_products', JSON.stringify(currentProds));
        } catch (e) {}
      } catch (e) {
        setProducts(ADMIN_RESTRICTED_PRODUCTS);
      }
    }
  }, [currentUser]);

  // Sync Orders in real-time
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      return;
    }

    if (isSupabaseEnabled) {
      const fetchSupabaseOrders = async () => {
        try {
          const ordList = await supabaseGetOrders(currentUser.email, currentUser.email === 'quxbashop@gmail.com');
          const formatted = ordList.map((o: any) => ({
            ...o,
            items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []),
            statusTimestamps: typeof o.statusTimestamps === 'string' ? JSON.parse(o.statusTimestamps) : (o.statusTimestamps || {})
          }));
          formatted.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setOrders(formatted);
          try {
            localStorage.setItem('quxba_local_orders', JSON.stringify(formatted));
          } catch (e) {}
        } catch (e) {
          console.warn("Supabase orders load warning:", e);
        }
      };

      fetchSupabaseOrders();

      const channel = supabase
        .channel('orders-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            fetchSupabaseOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      try {
        const saved = localStorage.getItem('quxba_local_orders');
        if (saved) {
          const ordList = JSON.parse(saved);
          const filtered = ordList.filter((o: any) => currentUser.email === 'quxbashop@gmail.com' || o.customerEmail === currentUser.email);
          filtered.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setOrders(filtered);
        } else {
          setOrders([]);
        }
      } catch (e) {
        setOrders([]);
      }
    }
  }, [currentUser]);

  const getFriendlyAuthErrorMessage = (error: any): string => {
    if (!error) return "An unknown error has occurred. Please try again.";
    const code = error.code || error.message || "";
    
    if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password') || code.includes('auth/user-not-found')) {
      return "Invalid email or password. Please verify your credentials and try again.";
    }
    if (code.includes('auth/email-already-in-use')) {
      return "This email address is already registered. Please sign in instead.";
    }
    if (code.includes('auth/weak-password')) {
      return "The password is too weak. It must be at least 6 characters long.";
    }
    if (code.includes('auth/invalid-email')) {
      return "Please enter a valid email address.";
    }
    if (code.includes('auth/user-disabled')) {
      return "This user account has been disabled. Please contact support.";
    }
    if (code.includes('auth/too-many-requests')) {
      return "Too many failed sign-in attempts. Access has been temporarily locked. Please try again later.";
    }
    if (code.includes('auth/network-request-failed')) {
      return "A network error occurred. Please check your internet connection and try again.";
    }
    if (code.includes('auth/popup-closed-by-user')) {
      return "The connection window was closed. Please try again.";
    }
    
    let msg = error.message || String(error);
    if (msg.startsWith("Firebase: ")) {
      msg = msg.replace("Firebase: ", "");
    }
    return msg;
  };

  const handleLogin = async (emailStr: string, passStr: string) => {
    const email = emailStr.toLowerCase().trim();
    
    // 0. Try Supabase Authentication first if configured
    if (isSupabaseEnabled) {
      try {
        const { user } = await supabaseSignIn(email, passStr) as any;
        const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || email.split('@')[0] || 'User';
        localStorage.setItem('jumia_auth_method', 'supabase');
        const u = { email, name: displayName };
        setCurrentUser(u);
        localStorage.setItem('jumia_logged_in_user', JSON.stringify(u));
        setShowAuthModal(false);
        setAuthError('');
        setAuthPassword('');
        addToast('Welcome Back', `Logged in via Supabase as ${displayName}!`, 'info');
        return { success: true };
      } catch (err: any) {
        console.warn("Supabase auth login failed, checking fallback:", err);
      }
    }

    // 1. Check if user exists in local registeredUsers database
    const localUser = registeredUsers[email];
    if (localUser && localUser.pass === passStr) {
      const u = { email: localUser.email, name: localUser.name };
      setCurrentUser(u);
      localStorage.setItem('jumia_logged_in_user', JSON.stringify(u));
      localStorage.setItem('jumia_auth_method', 'local');
      
      setShowAuthModal(false);
      setAuthError('');
      setAuthPassword('');
      addToast('Welcome Back', `Logged in in offline mode as ${localUser.name}!`, 'info');
      return { success: true };
    }
    
    setAuthError("Invalid email or password. Please verify your credentials and try again.");
    return { success: false };
  };

  const handleRegister = async (nameStr: string, emailStr: string, passStr: string) => {
    const email = emailStr.toLowerCase().trim();
    if (!nameStr.trim() || !emailStr.trim() || !passStr.trim()) {
      setAuthError('Please fill in all blanks.');
      return { success: false };
    }

    const newUsers = {
      ...registeredUsers,
      [email]: { name: nameStr, email, pass: passStr }
    };

    // 0. Try registration with Supabase if configured
    if (isSupabaseEnabled) {
      try {
        const { user } = await supabaseSignUp(email, passStr, nameStr) as any;
        setRegisteredUsers(newUsers);
        localStorage.setItem('jumia_registered_users', JSON.stringify(newUsers));
        localStorage.setItem('jumia_auth_method', 'supabase');

        const u = { email, name: nameStr };
        setCurrentUser(u);
        localStorage.setItem('jumia_logged_in_user', JSON.stringify(u));

        setShowAuthModal(false);
        setAuthError('');
        setAuthPassword('');
        setAuthName('');
        addToast('Registration Successful', `Welcome to Quxba via Supabase, ${nameStr}!`, 'info');
        return { success: true };
      } catch (err: any) {
        console.warn("Supabase registration failed:", err);
        setAuthError(err.message || 'Supabase signup failed.');
        return { success: false };
      }
    }

    // Local Database path (fallback of Supabase, or default)
    if (registeredUsers[email]) {
      setAuthError('This email address is already registered. Please sign in instead.');
      return { success: false };
    }

    setRegisteredUsers(newUsers);
    localStorage.setItem('jumia_registered_users', JSON.stringify(newUsers));
    
    const u = { email, name: nameStr };
    setCurrentUser(u);
    localStorage.setItem('jumia_logged_in_user', JSON.stringify(u));
    localStorage.setItem('jumia_auth_method', 'local');

    setShowAuthModal(false);
    setAuthError('');
    setAuthPassword('');
    setAuthName('');
    addToast('Welcome to Quxba!', `Registered in offline mode as ${nameStr}.`, 'info');
    return { success: true };
  };

  const handleLogout = async () => {
    try {
      if (isSupabaseEnabled) {
        await supabaseSignOut();
      }
    } catch (err) {
      console.error(err);
    }
    setCurrentUser(null);
    localStorage.removeItem('jumia_logged_in_user');
    localStorage.removeItem('jumia_auth_method');
    setCurrentView('storefront');
  };

  const handleGoogleSignIn = async () => {
    addToast('Google Sign-In', 'Google authentication is being routed via custom secure email flows in this environment.', 'info');
  };

  const handleOpenCategoryManager = (catToEdit?: any) => {
    if (catToEdit) {
      setAdminSelectedCatId(catToEdit.id);
      setAdminCatName(catToEdit.name);
      setAdminCatEmoji(catToEdit.emoji || '📦');
      setAdminCatDesc(catToEdit.desc || '');
      setAdminCatSubs(catToEdit.subcategories ? catToEdit.subcategories.join(', ') : '');
    } else {
      setAdminSelectedCatId('');
      setAdminCatName('');
      setAdminCatEmoji('📦');
      setAdminCatDesc('');
      setAdminCatSubs('');
    }
    setCatError('');
    setCatSuccess('');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCatName.trim()) {
      setCatError('Category Name cannot be blank.');
      return;
    }
    setCatSaving(true);
    setCatError('');
    setCatSuccess('');

    const targetId = adminSelectedCatId || adminCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const subList = adminCatSubs
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const docData = {
      id: targetId,
      name: adminCatName.trim(),
      emoji: adminCatEmoji.trim(),
      desc: adminCatDesc.trim(),
      subcategories: subList
    };

    // 1. Optimistic Local State Update
    setCategories(prev => {
      const filtered = prev.filter(c => c.id !== docData.id);
      const updated = [docData, ...filtered].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      localStorage.setItem('quxba_local_categories', JSON.stringify(updated));
      return updated;
    });

    try {
      if (isSupabaseEnabled) {
        await supabaseAddCategory(docData);
      }
    } catch (err: any) {
      console.warn("Supabase category set warning:", err);
    }

    setCatSuccess(adminSelectedCatId ? 'Category edited successfully!' : 'Category added successfully!');
    setCatSaving(false);
    
    // Dispatch a local storage update event to synchronize sibling state listeners immediately
    window.dispatchEvent(new Event('quxba_local_categories_updated'));

    setTimeout(() => {
      setIsCategoryModalOpen(false);
    }, 1000);
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"? This is irreversible.`)) {
      return;
    }
    setCatSaving(true);
    setCatError('');
    setCatSuccess('');

    // 1. Optimistic Local State Deletion
    setCategories(prev => {
      const updated = prev.filter(c => c.id !== id);
      localStorage.setItem('quxba_local_categories', JSON.stringify(updated));
      return updated;
    });

    try {
      if (isSupabaseEnabled) {
        await supabaseDeleteCategory(id);
      }
    } catch (err: any) {
      console.warn("Supabase category deletion warning:", err);
    }

    setCatSuccess('Category deleted successfully!');
    // Trigger local state updates across components
    window.dispatchEvent(new Event('quxba_local_categories_updated'));

    setAdminSelectedCatId('');
    setAdminCatName('');
    setAdminCatEmoji('📦');
    setAdminCatDesc('');
    setAdminCatSubs('');
    setCatSaving(false);
  };

  // Navigation states
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem('quxba_selected_category') || 'All Categories';
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem('quxba_search_query') || '';
  });
  const [sortBy, setSortBy] = useState(() => {
    return localStorage.getItem('quxba_sort_by') || 'relevance';
  });
  const [currentView, setCurrentView] = useState<'storefront' | 'seller' | 'admin' | 'orders' | 'support' | 'checkout'>(() => {
    return (localStorage.getItem('quxba_current_view') as any) || 'storefront';
  });

  // Track state changes to sync with local storage
  useEffect(() => {
    localStorage.setItem('quxba_selected_category', selectedCategory);
    setSelectedSubcategory('All');
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem('quxba_search_query', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('quxba_sort_by', sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem('quxba_current_view', currentView);
  }, [currentView]);

  // Advanced Filter States
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSortSheet, setShowMobileSortSheet] = useState(false);
  const [showMobileCategoriesSheet, setShowMobileCategoriesSheet] = useState(false);
  const [showMobileAccountSheet, setShowMobileAccountSheet] = useState(false);

  // Drawer / overlay triggers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!selectedProduct) {
      const savedId = localStorage.getItem('quxba_selected_product_id');
      if (savedId && visibleProducts.length > 0) {
        const found = visibleProducts.find(p => p.id === savedId);
        if (found) setSelectedProduct(found);
      }
    }
  }, [visibleProducts, selectedProduct]);

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (selectedProduct) {
      localStorage.setItem('quxba_selected_product_id', selectedProduct.id);
    } else {
      localStorage.removeItem('quxba_selected_product_id');
    }
  }, [selectedProduct]);

  const [showPassword, setShowPassword] = useState(false);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleAddReview = async (productId: string, rating: number, comment: string, userName: string) => {
    const prod = visibleProducts.find(p => p.id === productId);
    if (!prod) return;

    const newReview = {
      id: Math.random().toString(36).substring(2, 9),
      userName,
      rating,
      comment,
      date: new Date().toLocaleDateString('en-NG')
    };

    const oldReviews = prod.reviews || [];
    const updatedReviews = [...oldReviews, newReview];

    const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
    const newAvgRating = parseFloat((totalRating / updatedReviews.length).toFixed(1));

    // 1. Optimistic Local State Update
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          reviews: updatedReviews,
          rating: newAvgRating,
          reviewsCount: updatedReviews.length
        };
      }
      return p;
    }));
    
    // Also update selectedProduct view if it's active
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(prev => prev ? {
        ...prev,
        reviews: updatedReviews,
        rating: newAvgRating,
        reviewsCount: updatedReviews.length
      } : null);
    }
    
    addToast('Review Submitted', 'Thank you for your valuable feedback!', 'info');

    try {
      if (isSupabaseEnabled) {
        await supabase
          .from('products')
          .update({
            reviews: updatedReviews,
            rating: newAvgRating,
            reviewsCount: updatedReviews.length
          })
          .eq('id', productId);
      }
    } catch (error) {
      console.warn("Supabase product review update skipped/failed:", error);
    }
  };

  // Sync state back to local storage
  useEffect(() => {
    localStorage.setItem('jumia_user_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('jumia_user_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  /* ==========================================================================
     Cart & Wishlist Logic Handles
     ========================================================================== */
  const handleAddToCart = (product: Product, selectedOptions?: Record<string, string>) => {
    setCart((prev) => {
      const exists = prev.find((item) => {
        if (item.product.id !== product.id) return false;
        const o1 = item.selectedOptions || {};
        const o2 = selectedOptions || {};
        const keys1 = Object.keys(o1);
        const keys2 = Object.keys(o2);
        if (keys1.length !== keys2.length) return false;
        return keys1.every((key) => o1[key] === o2[key]);
      });

      if (exists) {
        return prev.map((item) => {
          const o1 = item.selectedOptions || {};
          const o2 = selectedOptions || {};
          const isSame = item.product.id === product.id &&
            Object.keys(o1).length === Object.keys(o2).length &&
            Object.keys(o1).every((key) => o1[key] === o2[key]);
          return isSame
            ? { ...item, quantity: item.quantity + 1 }
            : item;
        });
      }
      return [...prev, { product, quantity: 1, selectedOptions }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (productId: string, quantity: number, selectedOptions?: Record<string, string>) => {
    setCart((prev) =>
      prev.map((item) => {
        const o1 = item.selectedOptions || {};
        const o2 = selectedOptions || {};
        const isSame = item.product.id === productId &&
          Object.keys(o1).length === Object.keys(o2).length &&
          Object.keys(o1).every((key) => o1[key] === o2[key]);
        return isSame ? { ...item, quantity } : item;
      })
    );
  };

  const handleRemoveFromCart = (productId: string, selectedOptions?: Record<string, string>) => {
    setCart((prev) => 
      prev.filter((item) => {
        const o1 = item.selectedOptions || {};
        const o2 = selectedOptions || {};
        const isSame = item.product.id === productId &&
          Object.keys(o1).length === Object.keys(o2).length &&
          Object.keys(o1).every((key) => o1[key] === o2[key]);
        return !isSame;
      })
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const isSaved = prev.some((item) => item.id === product.id);
      if (isSaved) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleMoveToCart = (product: Product) => {
    // Remove from wishlist
    setWishlist((prev) => prev.filter((p) => p.id !== product.id));
    // Add to cart
    handleAddToCart(product);
  };

  const handlePlaceOrder = async (newOrder: Order) => {
    // Inject the customer email if logged in to link it securely
    const orderWithEmail: Order = {
      ...newOrder,
      customerEmail: currentUser?.email || 'guest@gmail.com',
      statusTimestamps: newOrder.statusTimestamps || {
        'Pending': new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })
      }
    };

    // 1. Optimistic Local State Update with Offline Support
    setOrders(prev => [orderWithEmail, ...prev]);
    addToast('Order Placed', 'Your order was successfully submitted and registered locally.', 'info');

    if (isSupabaseEnabled) {
      try {
        await supabaseAddOrder(orderWithEmail);
        console.log(`[Supabase Order Sync] SUCCESS: Synchronizing confirmation for order ID: ${newOrder.id}`);
      } catch (error) {
        console.warn("Supabase order placement warning:", error);
      }
    } else {
      try {
        const saved = localStorage.getItem('quxba_local_orders');
        const currentList = saved ? JSON.parse(saved) : [];
        const updatedList = [orderWithEmail, ...currentList.filter((o: any) => o.id !== orderWithEmail.id)];
        localStorage.setItem('quxba_local_orders', JSON.stringify(updatedList));
        console.log(`[Local Confirmed Sync] SUCCESS: Local order conf generated for order ID: ${newOrder.id}`);
      } catch (error) {
        console.warn("Local order placement skipped/failed:", error);
      }
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const cancelTime = new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' });
    
    // 1. Optimistic local state update
    let updatedOrder: Order | null = null;
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const currentTimestamps = o.statusTimestamps || {};
        const matched = {
          ...o,
          status: 'Cancelled' as const,
          statusTimestamps: {
            ...currentTimestamps,
            'Cancelled': cancelTime
          }
        };
        updatedOrder = matched;
        return matched;
      }
      return o;
    }));
    addToast('Order Cancelled', 'Your order has been cancelled successfully.', 'info');

    if (isSupabaseEnabled) {
      try {
        const currentTimestamps = updatedOrder?.statusTimestamps || {};
        await supabaseUpdateOrderStatus(orderId, 'Cancelled', currentTimestamps);
      } catch (error) {
        console.warn("Supabase cancel order status update failed:", error);
      }
    } else {
      try {
        const saved = localStorage.getItem('quxba_local_orders');
        if (saved) {
          const currentList = JSON.parse(saved);
          const updatedList = currentList.map((o: any) => {
            if (o.id === orderId && updatedOrder) {
              return updatedOrder;
            }
            return o;
          });
          localStorage.setItem('quxba_local_orders', JSON.stringify(updatedList));
        }
      } catch (error) {
        console.warn("Local storage cancel update warning:", error);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: 'Pending' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled') => {
    const updateTime = new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' });

    // 1. Optimistic local state update
    let updatedOrder: Order | null = null;
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const currentTimestamps = o.statusTimestamps || {};
        const matched = {
          ...o,
          status: nextStatus,
          statusTimestamps: {
            ...currentTimestamps,
            [nextStatus]: updateTime
          }
        };
        updatedOrder = matched;
        return matched;
      }
      return o;
    }));
    addToast('Status Updated', `Order status updated to ${nextStatus}.`, 'info');

    if (isSupabaseEnabled) {
      try {
        const currentTimestamps = updatedOrder?.statusTimestamps || {};
        await supabaseUpdateOrderStatus(orderId, nextStatus, currentTimestamps);
      } catch (error) {
        console.warn("Supabase update order status failed:", error);
      }
    } else {
      try {
        const saved = localStorage.getItem('quxba_local_orders');
        if (saved) {
          const currentList = JSON.parse(saved);
          const updatedList = currentList.map((o: any) => {
            if (o.id === orderId && updatedOrder) {
              return updatedOrder;
            }
            return o;
          });
          localStorage.setItem('quxba_local_orders', JSON.stringify(updatedList));
        }
      } catch (error) {
        console.warn("Local storage status update warning:", error);
      }
    }
  };

  const handleReorder = (items: CartItem[]) => {
    if (!items || items.length === 0) return;
    setCart((prevCart) => {
      let updatedCart = [...prevCart];
      items.forEach((item) => {
        const existingIdx = updatedCart.findIndex(
          (c) => c.product.id === item.product.id
        );
        if (existingIdx !== -1) {
          updatedCart[existingIdx] = {
            ...updatedCart[existingIdx],
            quantity: updatedCart[existingIdx].quantity + item.quantity
          };
        } else {
          updatedCart.push({
            product: item.product,
            quantity: item.quantity
          });
        }
      });
      localStorage.setItem('jumia_user_cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
    alert("Past package items have been added to your current active cart successfully.");
  };

  /* ==========================================================================
     Vendor & Admin Operations
     ========================================================================== */
  const handleAddNewProductFromSeller = async (newProduct: Product) => {
    // Sanitize product properties to avoid NaN and ensure valid data types for Firestore validation rules
    const targetAdminId = currentUser?.email || 'unauthenticated';
    
    // Ensure the ID is unique and prevents collisions by prefixing with safe user-specific identifier if they are a vendor
    const isVendor = currentUser?.email !== 'quxbashop@gmail.com';
    let finalProductId = newProduct.id;
    if (isVendor && !newProduct.id.startsWith('v_')) {
      const sanitizedEmailPrefix = targetAdminId.replace(/[^a-zA-Z0-9]/g, '_');
      finalProductId = `v_${sanitizedEmailPrefix}_${newProduct.id}`;
    }

    const sanitizedProduct = {
      ...newProduct,
      id: finalProductId,
      source: 'web_marketplace_quxba',
      adminId: targetAdminId,
      price: typeof newProduct.price === 'number' && !isNaN(newProduct.price) ? newProduct.price : 0,
      originalPrice: typeof newProduct.originalPrice === 'number' && !isNaN(newProduct.originalPrice) ? newProduct.originalPrice : (newProduct.price || 0) * 1.25,
      discount: typeof newProduct.discount === 'number' && !isNaN(newProduct.discount) ? newProduct.discount : 0,
      stock: typeof newProduct.stock === 'number' && !isNaN(newProduct.stock) ? newProduct.stock : 50,
      rating: typeof newProduct.rating === 'number' && !isNaN(newProduct.rating) ? newProduct.rating : 5.0,
      reviewsCount: typeof newProduct.reviewsCount === 'number' && !isNaN(newProduct.reviewsCount) ? newProduct.reviewsCount : 0,
      isApproved: currentUser?.email === 'quxbashop@gmail.com' ? true : (newProduct.isApproved !== undefined ? newProduct.isApproved : false),
      addedByAdmin: currentUser?.email === 'quxbashop@gmail.com' ? true : (newProduct.addedByAdmin !== undefined ? newProduct.addedByAdmin : false),
      createdAt: newProduct.createdAt || Date.now()
    };

    // 1. Optimistic Local State Update
    setDeletedProductIds(prev => {
      const updated = prev.filter(id => id !== sanitizedProduct.id);
      try {
        localStorage.setItem('quxba_deleted_product_ids', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setProducts(prev => {
      const filtered = prev.filter(p => p.id !== sanitizedProduct.id);
      return [sanitizedProduct, ...filtered];
    });
    addToast('Product Added', `"${sanitizedProduct.name}" was successfully registered offline as a listing.`, 'info');

    // Always save to localStorage immediately to guarantee new merchant listings never disappear or get wiped
    try {
      const saved = localStorage.getItem('quxba_local_products');
      const currentList = saved ? JSON.parse(saved) : ADMIN_RESTRICTED_PRODUCTS;
      const updatedList = [sanitizedProduct, ...currentList.filter((p: any) => p.id !== sanitizedProduct.id)];
      localStorage.setItem('quxba_local_products', JSON.stringify(updatedList));
    } catch (error) {
      console.warn("Local product creation sync warning:", error);
    }

    if (isSupabaseEnabled) {
      try {
        await supabaseAddProduct(sanitizedProduct);
      } catch (error) {
        console.warn("Supabase product insert failed (using secure local backup instead):", error);
      }
    }
  };

  const handleDeleteProduct = (productId: string) => {
    const prod = visibleProducts.find(p => p.id === productId);
    if (prod) {
      setProductToConfirmDelete(prod);
    } else {
      executeDeleteProduct(productId);
    }
  };

  const executeDeleteProduct = async (productId: string) => {
    // 1. Save deleted ID locally to ensure it is immediately and persistently filtered out
    setDeletedProductIds(prev => {
      const updated = prev.includes(productId) ? prev : [...prev, productId];
      try {
        localStorage.setItem('quxba_deleted_product_ids', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Optimistic Local State Deletion (high-availability safeguard)
    setProducts(prev => prev.filter(p => p.id !== productId));
    addToast('Product Deleted', 'The catalog item was successfully removed.', 'info');

    if (isSupabaseEnabled) {
      try {
        await supabase.from('products').delete().eq('id', productId);
      } catch (error) {
        console.warn("Supabase product delete failed:", error);
      }
    } else {
      try {
        const saved = localStorage.getItem('quxba_local_products');
        const currentList = saved ? JSON.parse(saved) : ADMIN_RESTRICTED_PRODUCTS;
        const updatedList = currentList.filter((p: any) => p.id !== productId);
        localStorage.setItem('quxba_local_products', JSON.stringify(updatedList));
      } catch (error) {
        console.warn("Local product deletion warning:", error);
      }
    }
  };

  const handleApproveProductFromAdmin = async (productId: string) => {
    // 1. Optimistic Local State Update
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, isApproved: true, addedByAdmin: true } : p));
    addToast('Product Approved', 'The brand new seller listing was approved successfully.', 'info');

    if (isSupabaseEnabled) {
      try {
        await supabase.from('products').update({ isApproved: true, addedByAdmin: true }).eq('id', productId);
      } catch (error) {
        console.warn("Supabase product approve failed:", error);
      }
    } else {
      try {
        const saved = localStorage.getItem('quxba_local_products');
        const currentList = saved ? JSON.parse(saved) : ADMIN_RESTRICTED_PRODUCTS;
        const updatedList = currentList.map((p: any) => p.id === productId ? { ...p, isApproved: true, addedByAdmin: true } : p);
        localStorage.setItem('quxba_local_products', JSON.stringify(updatedList));
      } catch (error) {
        console.warn("Local product approve warning:", error);
      }
    }
  };

  const handleRejectProductFromAdmin = async (productId: string) => {
    // 1. Optimistic Local State Deletion
    setProducts(prev => prev.filter(p => p.id !== productId));
    addToast('Product Rejected', 'The pending vendor listing was rejected.', 'info');

    if (isSupabaseEnabled) {
      try {
        await supabase.from('products').delete().eq('id', productId);
      } catch (error) {
        console.warn("Supabase product reject failed:", error);
      }
    } else {
      try {
        const saved = localStorage.getItem('quxba_local_products');
        const currentList = saved ? JSON.parse(saved) : ADMIN_RESTRICTED_PRODUCTS;
        const updatedList = currentList.filter((p: any) => p.id !== productId);
        localStorage.setItem('quxba_local_products', JSON.stringify(updatedList));
      } catch (error) {
        console.warn("Local reject delete warning:", error);
      }
    }
  };

  /* ==========================================================================
     Item Filter & Sort Process
     ========================================================================== */
  const getProductBrand = (p: Product): string => {
    return p.brand || p.name.trim().split(/\s+/)[0] || 'Generic';
  };

  const getRelevanceScore = (p: Product, query: string): number => {
    if (!query) return p.rating * 10 + (p.reviewsCount / 10);
    const q = query.toLowerCase();
    const name = p.name.toLowerCase();
    const cat = p.category.toLowerCase();
    const desc = p.description.toLowerCase();
    
    let score = 0;
    if (name.startsWith(q)) score += 100;
    if (name.includes(q)) score += 50;
    if (cat.includes(q)) score += 20;
    if (desc.includes(q)) score += 10;
    
    score += p.rating * 2;
    return score;
  };

  // Only show approved products on public customer storefront
  const publicProducts = visibleProducts.filter((p) => p.isApproved);

  const filteredProducts = publicProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All Categories' || product.category === selectedCategory;
    
    // Check dynamic subcategory matching
    const productSub = product.specifications?.['Subcategory'] || (product as any).subcategory || '';
    const matchesSubcategory =
      selectedSubcategory === 'All' ||
      productSub === selectedSubcategory ||
      product.name.toLowerCase().includes(selectedSubcategory.toLowerCase()) ||
      product.description.toLowerCase().includes(selectedSubcategory.toLowerCase());
    
    const matchesSearch =
      searchQuery.trim() === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMinPrice = minPrice === '' || product.price >= minPrice;
    const matchesMaxPrice = maxPrice === '' || product.price <= maxPrice;
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(getProductBrand(product));

    return matchesCategory && matchesSubcategory && matchesSearch && matchesMinPrice && matchesMaxPrice && matchesBrand;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
    if (sortBy === 'discount') return b.discount - a.discount;
    if (sortBy === 'relevance' && searchQuery.trim() !== '') {
      return getRelevanceScore(b, searchQuery) - getRelevanceScore(a, searchQuery);
    }
    // Default popularity / relevance fallback
    return (b.rating * 10 + b.reviewsCount) - (a.rating * 10 + a.reviewsCount);
  });

  const formatNairaRaw = (amount: number) => {
    return '₦' + amount.toLocaleString('en-NG');
  };



  if (isAppLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-[#581c87] to-indigo-900 text-white font-sans selection:bg-purple-500 selection:text-white" id="initial-purple-splash-loading">
        <div className="max-w-md w-full px-6 text-center space-y-6 flex flex-col items-center">
          
          {/* Main Logo Container */}
          <div className="relative flex items-center justify-center w-28 h-28 bg-white/10 rounded-full border border-white/20 shadow-2xl backdrop-blur-md transition-transform duration-500 scale-105 overflow-hidden">
            {/* Animating outer accent rings */}
            <div className="absolute inset-0 rounded-full border-2 border-t-purple-400 border-r-indigo-400 animate-spin" />
            <div className="absolute -inset-3 rounded-full border border-purple-500/20 animate-ping opacity-75" />
            
            {/* Real Logo Image Asset */}
            <img src={quxbaLogo} alt="Quxba" className="w-20 h-20 object-contain rounded-full relative z-10 animate-pulse" />
          </div>

          {/* Core Branding Label */}
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-200 via-white to-indigo-200 bg-clip-text text-transparent">
              QUXBA
            </h1>
          </div>

          {/* Stepper Delivery Themed Progress Bar */}
          <div className="w-48 bg-purple-950 h-2.5 rounded-full overflow-hidden border border-purple-800 shadow-inner">
            <div className="bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 h-full w-full rounded-full animate-progress" />
          </div>

        </div>

        {/* Global style tag for the animated loading bar gradient */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes animProgress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-progress {
            animation: animProgress 2.2s infinite linear;
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900 selection:bg-purple-200">
      

      {/* Universal Sticky Header */}
      <Header
        cart={cart}
        wishlist={wishlist}
        onSearch={setSearchQuery}
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onToggleView={(view) => {
          // Guard unauthorized view access
          if (view === 'seller' || view === 'admin') {
            if (!currentUser || currentUser.email !== 'quxbashop@gmail.com') {
              setAuthMode('signin');
              setAuthError('Access Denied. Only quxbashop@gmail.com can access admin zones.');
              setShowAuthModal(true);
              return;
            }
          }
          if (view === 'orders' && !currentUser) {
            setAuthMode('signin');
            setAuthError('Please sign in to view your orders.');
            setShowAuthModal(true);
            return;
          }
          setCurrentView(view);
        }}
        currentView={currentView}
        allProducts={publicProducts}
        onSelectProduct={(p) => setSelectedProduct(p)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuthModal={() => { setAuthMode('signin'); setAuthError(''); setShowAuthModal(true); }}
        categories={categories}
      />

      {/* Primary Workspace Stage */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-6 py-6" id="main-storefront-wrapper">
        
        {currentView === 'storefront' && (
          <div className="space-y-8 animate-fade-in">
            
            {currentUser?.email === 'quxbashop@gmail.com' && (
              <AdminStorefrontPortal 
                categories={categories}
                onSaveCategory={async (catData) => {
                  try {
                    if (isSupabaseEnabled) {
                      await supabaseAddCategory(catData);
                    } else {
                      const saved = localStorage.getItem('quxba_local_categories');
                      const current = saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
                      const updated = [...current.filter((c: any) => c.id !== catData.id), catData];
                      localStorage.setItem('quxba_local_categories', JSON.stringify(updated));
                    }
                    setCategories(prev => {
                      const idx = prev.findIndex(c => c.id === catData.id);
                      if (idx > -1) {
                        const updated = [...prev];
                        updated[idx] = catData;
                        return updated;
                      }
                      return [...prev, catData];
                    });
                    return true;
                  } catch (err) {
                    console.error(err);
                    return false;
                  }
                }}
                onDeleteCategory={async (catId) => {
                  try {
                    if (isSupabaseEnabled) {
                      await supabaseDeleteCategory(catId);
                    } else {
                      const saved = localStorage.getItem('quxba_local_categories');
                      if (saved) {
                        const current = JSON.parse(saved);
                        const updated = current.filter((c: any) => c.id !== catId);
                        localStorage.setItem('quxba_local_categories', JSON.stringify(updated));
                      }
                    }
                    setCategories(prev => prev.filter(c => c.id !== catId));
                    return true;
                  } catch (err) {
                    console.error(err);
                    return false;
                  }
                }}
                onAddProduct={async (prodData) => {
                  try {
                    await handleAddNewProductFromSeller(prodData);
                    return true;
                  } catch (err) {
                    console.error(err);
                    return false;
                  }
                }}
              />
            )}
            
            {/* Elegant Daily Deal Countdown at the top of storefront */}
            {publicProducts.length > 0 && (
              <DailyDealCountdown
                products={publicProducts}
                wishlist={wishlist}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                onSelectProduct={(p) => setSelectedProduct(p)}
              />
            )}
            
            {/* Upper layouts: Category tree panel & Hero Slider */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left sidebar: Quick category selector list (Matches Quxba Sidebar) */}
              <div className="hidden lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-1">
                <span className="text-xs font-black tracking-widest text-[#7c3aed] px-3 py-2 block uppercase border-b border-gray-50 mb-2">
                  OUR DEPARTMENTS 🛒
                </span>
                {[
                  { name: 'All Categories', emoji: '🏬' },
                  ...categories
                ].map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${
                      selectedCategory === category.name
                        ? 'bg-purple-50 text-[#7c3aed] font-bold border-l-4 border-l-[#7c3aed] pl-4'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm">{category.emoji || '📦'}</span>
                    <span>{category.name}</span>
                  </button>
                ))}

                {currentUser?.email === 'quxbashop@gmail.com' && (
                  <div className="pt-3 border-t border-gray-150 mt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenCategoryManager()}
                      className="w-full text-left px-3 py-2 rounded bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[10px] font-black tracking-wider uppercase transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>🛠️ Category Control Deck</span>
                    </button>
                  </div>
                )}
                
                {/* Visual mini-ad widget */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg p-3 text-white mt-6 shadow-sm">
                  <span className="text-[9px] font-black uppercase tracking-wider block bg-black/20 w-fit px-1.5 py-0.5 rounded">WEEKLY BONANZA</span>
                  <p className="text-xs font-extrabold mt-1">Get ₦5,000 instant cashback!</p>
                  <p className="text-[10px] text-purple-100 leading-snug mt-0.5">Enter code <strong className="text-white font-mono">QUXBA50</strong> at checkout.</p>
                </div>
              </div>

              {/* Center & Right Banner carousel & Promo cards */}
              <div className="lg:col-span-9 space-y-4">
                <HeroCarousel onSelectCategory={setSelectedCategory} />
              </div>
            </div>

            {/* Shortcut categories promo line (Sleek Theme Circular Grid) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 animate-fade-in" id="shortcut-cards">
              {[
                { label: 'Free Delivery', emoji: '🚚', imgUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80', action: () => { setSelectedCategory('Supermarket & Groceries'); }, bg: 'bg-blue-100' },
                { label: 'Supermarket', emoji: '🍏', action: () => { setSelectedCategory('Supermarket & Groceries'); }, bg: 'bg-green-100' },
                { label: 'Phone Deals', emoji: '📱', action: () => { setSelectedCategory('Phones & Tablets'); }, bg: 'bg-red-100' },
                { label: 'Official Stores', emoji: '🏦', action: () => { setSelectedCategory('Electronics & Appliances'); }, bg: 'bg-purple-100' },
                { label: 'Clearance Sale', emoji: '💎', action: () => { setSelectedCategory('Computers & Accessories'); }, bg: 'bg-yellow-100' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.action}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:scale-105 transition-all duration-200 text-center"
                >
                  {item.imgUrl ? (
                    <img 
                      src={item.imgUrl} 
                      alt={item.label} 
                      className="w-11 h-11 rounded-lg object-cover shadow-sm bg-white" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`w-11 h-11 ${item.bg || ''} rounded-full flex items-center justify-center text-xl shadow-sm`}>
                      {item.emoji}
                    </div>
                  )}
                  <span className="text-[11px] font-bold text-gray-800 tracking-tight leading-tight">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Red Flash Sales Stage */}
            {selectedCategory === 'All Categories' && (
              <>
                <FlashSales
                  products={publicProducts}
                  wishlist={wishlist}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  currentUser={currentUser}
                  onDeleteProduct={handleDeleteProduct}
                />
                <FlashSales
                  title="WEEKEND VIBEZ"
                  type="weekend"
                  products={publicProducts}
                  wishlist={wishlist}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  currentUser={currentUser}
                  onDeleteProduct={handleDeleteProduct}
                />
                <FlashSales
                  title="NEW ARRIVED"
                  type="new"
                  products={publicProducts}
                  wishlist={wishlist}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  currentUser={currentUser}
                  onDeleteProduct={handleDeleteProduct}
                />
                <FlashSales
                  title="BIG DISCOUNT"
                  type="discount"
                  products={publicProducts}
                  wishlist={wishlist}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  currentUser={currentUser}
                  onDeleteProduct={handleDeleteProduct}
                />
              </>
            )}

            {/* Primary Marketplace Directory grid shelf */}
            <div className="space-y-4">
              {/* Dynamic brand metrics */}
              {(() => {
                const uniqueBrands = Array.from(new Set(publicProducts.map(p => getProductBrand(p)))).filter(Boolean) as string[];
                const getBrandCount = (brandName: string) => {
                  return publicProducts.filter(p => {
                    const matchesCategory = selectedCategory === 'All Categories' || p.category === selectedCategory;
                    return matchesCategory && getProductBrand(p) === brandName;
                  }).length;
                };

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Collapsible Mobile Toggle button - Show only on categoric/search pages */}
                    {(selectedCategory !== 'All Categories' || searchQuery.trim() !== '') && (
                      <div className="lg:hidden w-full px-1">
                        <button
                          onClick={() => setShowMobileFilters(!showMobileFilters)}
                          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg py-2.5 font-bold text-gray-700 shadow-sm text-xs cursor-pointer active:scale-[0.99] transition"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-[#7c3aed]" />
                          <span>{showMobileFilters ? "HIDE ADVANCED FILTERS" : "SHOW ADVANCED FILTERS & BRANDS"}</span>
                          {(selectedBrands.length > 0 || minPrice !== '' || maxPrice !== '') && (
                            <span className="bg-[#7c3aed] rounded-full w-2 h-2 ml-1" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Advanced Left Filters Sidebar - Show only on categoric/search pages */}
                    {(selectedCategory !== 'All Categories' || searchQuery.trim() !== '') ? (
                      <div className={`lg:col-span-3 space-y-5 bg-white rounded-xl border border-gray-100 p-5 shadow-sm lg:block ${showMobileFilters ? "block" : "hidden lg:block"} transition-all duration-200`}>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-150">
                          <div className="flex items-center justify-between w-full lg:w-auto">
                            <span className="text-xs font-black tracking-widest text-[#7c3aed] uppercase flex items-center gap-1.5 font-sans">
                              <ListFilter className="w-4 h-4" />
                              SEARCH FILTER
                            </span>
                            {/* Close button on mobile list filters popover */}
                            <button 
                              type="button"
                              onClick={() => setShowMobileFilters(false)} 
                              className="lg:hidden text-gray-400 hover:text-red-500 font-extrabold focus:outline-none p-1 cursor-pointer ml-3"
                              title="Close Filters"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          {(minPrice !== '' || maxPrice !== '' || selectedBrands.length > 0 || selectedCategory !== 'All Categories' || searchQuery.trim() !== '') && (
                            <button
                              onClick={() => {
                                setMinPrice('');
                                setMaxPrice('');
                                setSelectedBrands([]);
                                setSelectedCategory('All Categories');
                                setSearchQuery('');
                              }}
                              className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase flex items-center gap-1 cursor-pointer transition select-none"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reset</span>
                            </button>
                          )}
                        </div>

                        {/* Department Radio Selectors */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block font-sans">Department</span>
                          <div className="space-y-1 max-h-48 overflow-y-auto pr-1 font-sans">
                            {[
                              'All Categories',
                              ...categories.map(c => c.name)
                            ].map((cat) => (
                              <label key={cat} className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 cursor-pointer hover:text-purple-500 transition py-0.5">
                                <input
                                  type="radio"
                                  name="department-radio-select"
                                  checked={selectedCategory === cat}
                                  onChange={() => setSelectedCategory(cat)}
                                  className="text-[#7c3aed] focus:ring-purple-500 w-3.5 h-3.5 border-gray-300"
                                />
                                <span className={selectedCategory === cat ? "text-[#7c3aed] font-extrabold" : ""}>{cat}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Brand Checklist */}
                        <div className="space-y-2 pt-3 border-t border-gray-50">
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block font-sans">Brand</span>
                          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                            {uniqueBrands.map((brand) => {
                              const isChecked = selectedBrands.includes(brand);
                              const count = getBrandCount(brand);
                              return (
                                <label
                                  key={brand}
                                  className={`flex items-center justify-between text-xs font-semibold cursor-pointer transition py-0.5 ${
                                    count === 0 && !isChecked ? 'text-gray-300 pointer-events-none' : 'text-gray-700 hover:text-purple-500'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      disabled={count === 0 && !isChecked}
                                      onChange={() => {
                                        setSelectedBrands((prev) =>
                                          prev.includes(brand)
                                            ? prev.filter((b) => b !== brand)
                                            : [...prev, brand]
                                        );
                                      }}
                                      className="rounded text-[#7c3aed] focus:ring-purple-500 border-gray-300 w-3.5 h-3.5"
                                    />
                                    <span className={isChecked ? "text-gray-950 font-extrabold" : ""}>{brand}</span>
                                  </div>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isChecked ? "bg-purple-50 text-[#7c3aed]" : "bg-gray-50 text-gray-400"}`}>
                                    {count}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Price Inputs & Bounds */}
                        <div className="space-y-2 pt-3 border-t border-gray-50">
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block font-sans">Price (₦)</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="Min Price"
                              value={minPrice}
                              onChange={(e) => setMinPrice(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)))}
                              className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#7c3aed] focus:outline-none placeholder-gray-400 font-semibold text-gray-800"
                            />
                            <span className="text-gray-300 text-xs">to</span>
                            <input
                              type="number"
                              placeholder="Max Price"
                              value={maxPrice}
                              onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)))}
                              className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#7c3aed] focus:outline-none placeholder-gray-400 font-semibold text-gray-800"
                            />
                          </div>
                          
                          {/* Instant presets brackets */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {[
                              { label: 'Under ₦25k', min: '', max: 25000 },
                              { label: '₦25k - ₦100k', min: 25000, max: 100000 },
                              { label: '₦100k - ₦300k', min: 100000, max: 300000 },
                              { label: 'Over ₦300k', min: 300000, max: '' }
                            ].map((bracket, bIdx) => {
                              const isActive = minPrice === bracket.min && maxPrice === bracket.max;
                              return (
                                <button
                                  key={bIdx}
                                  type="button"
                                  onClick={() => {
                                    setMinPrice(bracket.min);
                                    setMaxPrice(bracket.max);
                                  }}
                                  className={`text-[9px] px-2 py-1 rounded transition font-bold border cursor-pointer ${
                                    isActive
                                      ? 'bg-purple-50 border-purple-200 text-[#7c3aed]'
                                      : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                                  }`}
                                >
                                  {bracket.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Logistics Info Ad */}
                        <div className="p-3 bg-gradient-to-br from-gray-50 to-purple-50/10 rounded-lg border border-gray-150/15 flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                          <div className="space-y-0.5">
                            <p className="font-extrabold text-[#7c3aed] uppercase text-[9px] tracking-wider font-sans">Jet Delivery</p>
                            <p className="leading-snug text-[10px] text-gray-400 font-medium">Genuine warranty on every single deal.</p>
                          </div>
                          <span className="text-xl">🛡️</span>
                        </div>
                      </div>
                    ) : null}

                    {/* Right Hand Product Grid Column (lg:col-span-12 when on home page, lg:col-span-9 on category pages for sidebar filters layout) */}
                    <div className={`${
                      (selectedCategory !== 'All Categories' || searchQuery.trim() !== '') ? 'lg:col-span-9 bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6' : 'lg:col-span-12 space-y-8 bg-transparent p-0 border-none shadow-none'
                    }`}>
                      
                      {/* Grid / Home Segment */}
                      {(selectedCategory !== 'All Categories' || searchQuery.trim() !== '') ? (
                        <>
                          {/* Grid header controls */}
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-50 pb-4">
                            <div>
                              <h2 className="text-lg font-sans font-black text-gray-850 tracking-tight flex items-center gap-2">
                                <span className="w-3.5 h-3.5 bg-[#7c3aed] rounded-full animate-bounce" />
                                <span>{selectedCategory} Mall Shelf ({sortedProducts.length})</span>
                              </h2>
                              
                              {/* Selected filtering pill highlights */}
                              {(selectedBrands.length > 0 || minPrice !== '' || maxPrice !== '' || searchQuery.trim() !== '') && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {searchQuery.trim() !== '' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-[#7c3aed] px-2.5 py-0.5 rounded-full border border-purple-100">
                                      Search: "{searchQuery}"
                                      <X className="w-2.5 h-2.5 cursor-pointer hover:text-red-500 transition-colors" onClick={() => setSearchQuery('')} />
                                    </span>
                                  )}
                                  {minPrice !== '' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-gray-50 text-gray-700 px-2.5 py-0.5 rounded-full border border-gray-200">
                                      Min: ₦{minPrice.toLocaleString()}
                                      <X className="w-2.5 h-2.5 cursor-pointer hover:text-red-500 transition-colors" onClick={() => setMinPrice('')} />
                                    </span>
                                  )}
                                  {maxPrice !== '' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-gray-50 text-gray-700 px-2.5 py-0.5 rounded-full border border-gray-200">
                                      Max: ₦{maxPrice.toLocaleString()}
                                      <X className="w-2.5 h-2.5 cursor-pointer hover:text-red-500 transition-colors" onClick={() => setMaxPrice('')} />
                                    </span>
                                  )}
                                  {selectedBrands.map((brand) => (
                                    <span key={brand} className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100 font-sans">
                                      Brand: {brand}
                                      <X className="w-2.5 h-2.5 cursor-pointer hover:text-red-500 transition-colors" onClick={() => setSelectedBrands(prev => prev.filter(b => b !== brand))} />
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Interactive select filter segment */}
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-400 font-bold uppercase tracking-wider">Sort by:</span>
                              <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-gray-50 border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] font-extrabold text-gray-700 cursor-pointer text-xs"
                              >
                                <option value="relevance">Relevance</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="newest">Newest Arrivals</option>
                                <option value="discount">Highest Discount</option>
                              </select>
                            </div>
                          </div>
 
                                  {sortedProducts.length === 0 ? (
                            <div className="py-20 text-center text-gray-400 space-y-4">
                              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-2xl">🔍</div>
                              <p className="font-extrabold text-base text-gray-800">No matching search query found!</p>
                              <p className="text-xs max-w-sm mx-auto leading-relaxed">We could not locate items meeting these constraints. Try broadening your boundaries or clear your selected brand constraints.</p>
                              <button 
                                onClick={() => {
                                  setMinPrice('');
                                  setMaxPrice('');
                                  setSelectedBrands([]);
                                  setSelectedCategory('All Categories');
                                  setSearchQuery('');
                                }}
                                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-5 py-2.5 rounded text-xs font-bold transition shadow-sm cursor-pointer select-none"
                              >
                                RESET DISCOVERY SEARCH
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 animate-fade-in" id="product-grid-container">
                              {sortedProducts.map((p) => (
                                <ProductCard
                                  key={p.id}
                                  product={p}
                                  isInWishlist={wishlist.some(w => w.id === p.id)}
                                  onAddToCart={handleAddToCart}
                                  onToggleWishlist={handleToggleWishlist}
                                  onClick={(prod) => setSelectedProduct(prod)}
                                  onQuickView={(prod) => setQuickViewProduct(prod)}
                                  currentUser={currentUser}
                                  onDeleteProduct={handleDeleteProduct}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        /* Beautiful Category Rows layout on actual homepage */
                        <div className="space-y-8 animate-fade-in text-left">
                          {categories.map((sec) => {
                            const catProducts = publicProducts.filter(p => p.category === sec.name).slice(0, 4);
                            if (catProducts.length === 0) return null;
                            return (
                              <div key={sec.name} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden pb-5 sm:pb-6 space-y-4">
                                {/* Signature Brand Header Banner (Matches requested styling mockup) */}
                                <div className="bg-[#7c3aed] px-4 py-2.5 sm:px-5 flex items-center justify-between text-white font-sans font-black tracking-wider uppercase bg-linear-to-r from-[#7c3aed] to-[#6d28d9]">
                                  <span className="font-black tracking-wider flex items-center gap-1.5">
                                    <span className="text-sm">{sec.emoji || '📦'}</span>
                                    <span style={{ fontSize: '9px', lineHeight: '15px' }} className="font-black">
                                      {sec.name.toUpperCase()} DEALS
                                    </span>
                                  </span>
                                  <button
                                    onClick={() => {
                                      setSelectedCategory(sec.name);
                                      setSelectedSubcategory('All');
                                      window.scrollTo({ top: 300, behavior: 'smooth' });
                                    }}
                                    className="hover:underline font-black tracking-widest cursor-pointer select-none uppercase"
                                    style={{ fontSize: '9px', lineHeight: '11px' }}
                                  >
                                    SEE ALL
                                  </button>
                                </div>

                                {/* Dynamic Subcategories Filter Row inside each row item so users can instantly filter by Subcategory! */}
                                {sec.subcategories && sec.subcategories.length > 0 && (
                                  <div className="px-5 py-2.5 bg-gray-50/70 border-b border-gray-100/50 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 select-none">Filters:</span>
                                    <button
                                      onClick={() => {
                                        setSelectedCategory(sec.name);
                                        setSelectedSubcategory('All');
                                        window.scrollTo({ top: 300, behavior: 'smooth' });
                                      }}
                                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                                        selectedCategory === sec.name && selectedSubcategory === 'All'
                                          ? 'bg-[#7c3aed] text-white shadow-xs'
                                          : 'bg-white text-gray-500 border border-gray-150 hover:bg-gray-50'
                                      }`}
                                    >
                                      All Products
                                    </button>
                                    {sec.subcategories.map((sub: string) => {
                                      const isCurrent = selectedCategory === sec.name && selectedSubcategory === sub;
                                      return (
                                        <button
                                          key={sub}
                                          onClick={() => {
                                            setSelectedCategory(sec.name);
                                            setSelectedSubcategory(sub);
                                            window.scrollTo({ top: 300, behavior: 'smooth' });
                                          }}
                                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                                            isCurrent
                                              ? 'bg-[#7c3aed] text-white shadow-xs'
                                              : 'bg-white text-gray-500 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
                                          }`}
                                        >
                                          {sub}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}

                                <div className="px-4.5 sm:px-6 space-y-4">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 font-sans">
                                    {catProducts.map((p) => (
                                      <ProductCard
                                        key={p.id}
                                        product={p}
                                        isInWishlist={wishlist.some(w => w.id === p.id)}
                                        onAddToCart={handleAddToCart}
                                        onToggleWishlist={handleToggleWishlist}
                                        onClick={(prod) => setSelectedProduct(prod)}
                                        onQuickView={(prod) => setQuickViewProduct(prod)}
                                        currentUser={currentUser}
                                        onDeleteProduct={handleDeleteProduct}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* View togglers for dashboard / support simulations */}
        {currentView === 'seller' && (
          currentUser?.email === 'quxbashop@gmail.com' ? (
            <SellerDashboard
              products={visibleProducts}
              onAddNewProduct={handleAddNewProductFromSeller}
              onDeleteProduct={handleDeleteProduct}
              categories={categories}
              onQuotaExceeded={() => {}}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-neutral-100 p-8 max-w-md mx-auto text-center space-y-5 font-sans animate-fade-in my-10">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto text-2xl">🏪</div>
              <h3 className="text-base font-black text-gray-800 uppercase tracking-tight">Become a Quxba Merchant</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Want to sell your products on our storefront? Authorized merchant accounts are curated directly by store admins. 
              </p>
              <div className="bg-purple-50/50 rounded-lg p-3 text-xs text-purple-900 font-medium">
                Please submit your product inventory catalog and merchant request directly to <a href="mailto:quxbashop@gmail.com" className="text-purple-700 underline font-semibold">quxbashop@gmail.com</a>
              </div>
              <button onClick={() => setCurrentView('storefront')} className="bg-[#7c3aed] hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition uppercase cursor-pointer w-full">Return to Shop</button>
            </div>
          )
        )}

        {currentView === 'admin' && (
          currentUser?.email === 'quxbashop@gmail.com' ? (
            <AdminDashboard
              products={visibleProducts}
              onApproveProduct={handleApproveProductFromAdmin}
              onRejectProduct={handleRejectProductFromAdmin}
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-red-50 p-8 max-w-md mx-auto text-center space-y-4 font-sans animate-fade-in my-10">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl">🔒</div>
              <h3 className="text-base font-black text-gray-800 uppercase tracking-tight">Admin Approval Locked</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">Only the store owner (<strong className="text-purple-600 font-mono">quxbashop@gmail.com</strong>) is authorized to audit product submissions and configure platform limits.</p>
              <button onClick={() => setCurrentView('storefront')} className="bg-[#7c3aed] hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition uppercase cursor-pointer">Return to Shop</button>
            </div>
          )
        )}

        {currentView === 'orders' && (
          currentUser !== null ? (
            <OrderTrackingView 
              orders={currentUser?.email === 'quxbashop@gmail.com' ? orders : orders.filter(o => o.customerEmail === currentUser?.email)} 
              onCancelOrder={handleCancelOrder}
              onReorder={handleReorder}
              onToggleView={setCurrentView}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-neutral-100 p-8 max-w-md mx-auto text-center space-y-4 font-sans animate-fade-in my-10">
              <div className="w-16 h-16 bg-purple-50 text-[#7c3aed] rounded-full flex items-center justify-center mx-auto text-2xl">📦</div>
              <h3 className="text-base font-black text-gray-800 uppercase tracking-tight font-sans">Track Your Package</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">Sign in or create an account to view and check the packages you have ordered instantly.</p>
              <button onClick={() => { setAuthMode('signin'); setAuthError(''); setShowAuthModal(true); }} className="bg-[#7c3aed] hover:bg-purple-700 text-white font-black text-xs px-6 py-2.5 rounded-lg transition uppercase cursor-pointer">Sign In / Sign Up</button>
            </div>
          )
        )}

        {currentView === 'support' && (
          <CustomerSupportChat />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            cart={cart}
            currentUser={currentUser}
            onPlaceOrder={handlePlaceOrder}
            onClearCart={handleClearCart}
            onToggleView={(view) => {
              if (view === 'seller' || view === 'admin') {
                if (!currentUser || currentUser.email !== 'quxbashop@gmail.com') {
                  setAuthMode('signin');
                  setAuthError('Access Denied. Only quxbashop@gmail.com can access admin zones.');
                  setShowAuthModal(true);
                  return;
                }
              }
              if (view === 'orders' && !currentUser) {
                setAuthMode('signin');
                setAuthError('Please sign in to view your orders.');
                setShowAuthModal(true);
                return;
              }
              setCurrentView(view);
            }}
          />
        )}

      </main>

      {/* Footer Block */}
      <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800 font-sans" id="quxba-footer-block">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-1 w-auto h-12 select-none" id="quxba-footer-logo-blocks">
              <span className="w-8 h-8 rounded-full bg-[#f47a20] text-black font-sans font-black text-base flex items-center justify-center shadow-sm">
                Q
              </span>
              <span className="w-8 h-8 rounded-sm bg-[#ffc312] text-black font-sans font-black text-base flex items-center justify-center shadow-sm">
                U
              </span>
              <span 
                className="w-8 h-8 bg-[#8ec010] text-white font-sans font-black text-base flex items-center justify-center shadow-sm"
                style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
              >
                X
              </span>
              <span className="w-8 h-8 rounded-full bg-[#13b5ea] text-black font-sans font-black text-base flex items-center justify-center shadow-sm">
                B
              </span>
              <span className="w-8 h-8 rounded-sm bg-[#7c3aed] text-white font-sans font-black text-base flex items-center justify-center shadow-sm">
                A
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              QUXBA Shop Online for Women's fashion, Men's fashion Electronics, Phones, Computers, Accessories, Fashion, Shoes.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Help & Resources</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><button onClick={() => setCurrentView('support')} className="hover:text-white transition">Live Support Chat</button></li>
              <li><span className="text-gray-500">Service Hours: 24/7 Fast Help Room</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Partner with Quxba</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><button onClick={() => setCurrentView('seller')} className="hover:text-white transition font-bold text-purple-400">Sell on Quxba (Seller Zone)</button></li>
              <li className="text-[11px] text-gray-400 leading-normal mt-1 border-t border-gray-800/60 pt-2">
                Want to sell your products? Send your request to <a href="mailto:quxbashop@gmail.com" className="text-purple-400 font-semibold hover:underline">quxbashop@gmail.com</a>
              </li>
            </ul>
          </div>

          <div className="space-y-4 text-xs">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quxba Newsletter</h4>
            <div className="flex gap-1.5">
              <input 
                type="email" 
                placeholder="Type email..." 
                className="bg-gray-800 border border-gray-700 text-xs px-3 py-2 rounded text-white focus:outline-none focus:ring-1 focus:ring-brand-primary min-w-0" 
              />
              <button className="bg-[#7c3aed] text-white text-xs px-3.5 py-2 rounded font-bold hover:bg-[#6d28d9] transition">SUB</button>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8 pt-8 border-t border-gray-800 text-center text-xs text-gray-500 flex flex-col md:flex-row justify-between gap-4">
          <p>© 2026 Quxba</p>
          <div className="flex justify-center gap-4">
            <span 
              onClick={() => setShowPrivacyModal(true)} 
              className="hover:text-white cursor-pointer transition duration-150 hover:underline select-none"
              id="quxba-footer-privacy-link"
            >
              Privacy Policy
            </span>
            <span>·</span>
            <span 
              onClick={() => setShowTermsModal(true)} 
              className="hover:text-white cursor-pointer transition duration-150 hover:underline select-none"
              id="quxba-footer-terms-link"
            >
              Terms of Service
            </span>
            <span>·</span>
            <span className="hover:text-gray-300 select-none">Nigeria</span>
          </div>
        </div>
      </footer>

      {/* Slide drawers and detail sheets */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemove={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onPlaceOrder={handlePlaceOrder}
        onToggleView={(view) => {
          if (view === 'orders') setCurrentView('orders');
          if (view === 'storefront') setCurrentView('storefront');
          if (view === 'checkout') setCurrentView('checkout');
        }}
        currentUser={currentUser}
        onOpenAuthModal={() => { setAuthMode('signin'); setAuthError(''); setShowAuthModal(true); setIsCartOpen(false); }}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={handleToggleWishlist}
        onMoveToCart={handleMoveToCart}
      />

      <ProductDetailModal
        product={selectedProduct ? visibleProducts.find(p => p.id === selectedProduct.id) || selectedProduct : null}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isInWishlist={wishlist.some(w => w.id === selectedProduct?.id)}
        onAddReview={handleAddReview}
        currentUser={currentUser}
        onDeleteProduct={handleDeleteProduct}
      />

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isInWishlist={quickViewProduct ? wishlist.some(w => w.id === quickViewProduct.id) : false}
        onViewFullDetails={(prod) => setSelectedProduct(prod)}
      />

      {/* Quxba Style Floating Mobile Capsule (Sort by ⇅ | Filter ☰) */}
      {currentView === 'storefront' && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-[#282828] text-white shadow-xl rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-3 divide-x divide-neutral-600 select-none border border-neutral-700 max-w-max md:hidden">
          <button
            type="button"
            onClick={() => setShowMobileSortSheet(true)}
            className="flex items-center gap-1.5 hover:text-[#7c3aed] active:scale-95 transition cursor-pointer"
          >
            <span>Sort by</span>
            <span className="text-sm font-semibold text-[#7c3aed]">⇅</span>
          </button>
          <button
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="pl-3 flex items-center gap-1.5 hover:text-[#7c3aed] active:scale-95 transition cursor-pointer"
          >
            <span>Filter</span>
            <span className="text-sm font-semibold text-[#7c3aed]">☰</span>
          </button>
        </div>
      )}

      {/* Quxba Mobile Bottom Sticky Tab Bar (Home | Categories | Cart | Wishlist | Account) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] h-[62px] flex items-center justify-around md:hidden px-1 select-none">
        
        {/* Home Button */}
        <button
          type="button"
          onClick={() => {
            setCurrentView('storefront');
            setSelectedCategory('All Categories');
            setSearchQuery('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer transition ${
            currentView === 'storefront' && selectedCategory === 'All Categories' && !searchQuery
              ? 'text-[#7c3aed]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Home className={`w-[22px] h-[22px] stroke-[2.2] ${currentView === 'storefront' && selectedCategory === 'All Categories' && !searchQuery ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </button>

        {/* Categories Button */}
        <button
          type="button"
          onClick={() => setShowMobileCategoriesSheet(true)}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer transition ${
            showMobileCategoriesSheet || selectedCategory !== 'All Categories'
              ? 'text-[#7c3aed]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Grid className="w-[22px] h-[22px] stroke-[2.2]" />
          <span className="text-[10px] font-bold mt-0.5">Categories</span>
        </button>

        {/* Cart Button */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer transition relative ${
            isCartOpen ? 'text-[#7c3aed]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-[22px] h-[22px] stroke-[2.2]" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white font-extrabold text-[9px] rounded-full w-4.5 h-4.5 flex items-center justify-center border border-white">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5">Cart</span>
        </button>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={() => setIsWishlistOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer transition relative ${
            isWishlistOpen ? 'text-[#7c3aed]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <div className="relative">
            <Heart className="w-[22px] h-[22px] stroke-[2.2]" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white font-extrabold text-[9px] rounded-full w-4.5 h-4.5 flex items-center justify-center border border-white">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5">Wishlist</span>
        </button>

        {/* Account Button */}
        <button
          type="button"
          onClick={() => setShowMobileAccountSheet(true)}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer transition ${
            currentView !== 'storefront' || showMobileAccountSheet
              ? 'text-[#7c3aed]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <div className="relative">
            <User className="w-[22px] h-[22px] stroke-[2.2]" />
            <span className="absolute bottom-0 right-0 bg-green-500 rounded-full w-2 h-2 border border-white animate-pulse" />
          </div>
          <span className="text-[10px] font-bold mt-0.5">Account</span>
        </button>

      </div>

      {/* Mobile Sort Bottom Drawer Sheet */}
      {showMobileSortSheet && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center animate-fade-in" 
          onClick={() => setShowMobileSortSheet(false)}
        >
          <div 
            className="bg-white w-full rounded-t-2xl p-5 space-y-4 animate-slide-up shadow-2xl max-h-[80vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">Sort Products By</span>
              <button 
                onClick={() => setShowMobileSortSheet(false)} 
                className="text-gray-400 p-1 hover:text-gray-700 font-extrabold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1">
              {[
                { value: 'relevance', label: 'Relevance' },
                { value: 'price-low', label: 'Price: Low to High' },
                { value: 'price-high', label: 'Price: High to Low' },
                { value: 'newest', label: 'Newest Arrivals' },
                { value: 'discount', label: 'Highest Discount' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSortBy(opt.value);
                    setShowMobileSortSheet(false);
                  }}
                  className={`w-full text-left py-3 px-4 rounded-lg text-xs font-extrabold transition-all flex items-center justify-between ${
                    sortBy === opt.value ? 'bg-purple-50 text-[#7c3aed]' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.value && <span className="text-[#7c3aed] text-sm">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Categories Bottom Drawer Sheet */}
      {showMobileCategoriesSheet && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center animate-fade-in" 
          onClick={() => setShowMobileCategoriesSheet(false)}
        >
          <div 
            className="bg-white w-full rounded-t-2xl p-5 space-y-4 animate-slide-up shadow-2xl max-h-[85vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-black uppercase tracking-wider text-[#7c3aed]">Browse Departments</span>
              <button 
                onClick={() => setShowMobileCategoriesSheet(false)} 
                className="text-gray-200 bg-gray-50 p-1.5 rounded-full hover:bg-gray-100 font-extrabold text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {[
                { name: 'All Categories', desc: 'Browse entire digital mall deals' },
                { name: 'Electronics & Appliances', desc: 'Fridges, ACs, smart TVs, soundbars' },
                { name: 'Phones & Tablets', desc: 'Latest devices, powerbanks, chargers' },
                { name: 'Computers & Accessories', desc: 'Laptops, mouse, keyboards, monitors' },
                { name: 'Fashion & Apparel', desc: 'Wears, sneakers, shoes, bags' },
                { name: 'Supermarket & Groceries', desc: 'Food items, snacks, drinks, dishwashers' },
                { name: 'Health & Beauty', desc: 'Skincare, lotions, roll-on, body spray' }
              ].map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setCurrentView('storefront');
                    setShowMobileCategoriesSheet(false);
                    // scroll to top anchor
                    const topAnchor = document.getElementById('shortcut-cards');
                    if (topAnchor) {
                      topAnchor.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`w-full text-left py-2.5 px-3.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex flex-col justify-center gap-0.5 ${
                    selectedCategory === cat.name ? 'bg-purple-50 border-l-4 border-[#7c3aed]' : 'hover:bg-gray-50/80 border-l-4 border-transparent'
                  }`}
                >
                  <span className={`text-[12px] font-black ${selectedCategory === cat.name ? 'text-[#7c3aed]' : 'text-slate-800'}`}>
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal">{cat.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Account Drawer Sheet */}
      {showMobileAccountSheet && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center animate-fade-in" 
          onClick={() => setShowMobileAccountSheet(false)}
        >
          <div 
            className="bg-white w-full rounded-t-2xl p-5 space-y-4 animate-slide-up shadow-2xl max-h-[85vh] overflow-y-auto font-sans text-left" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header User Profile Card */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7c3aed] to-purple-400 text-white flex items-center justify-center font-black text-sm uppercase relative border border-purple-100">
                  {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : 'GS'}
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${currentUser ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-800 block leading-tight">
                    {currentUser ? currentUser.name : 'Guest Customer'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold block leading-none mt-1">
                    {currentUser ? currentUser.email : 'Check out & track your goods'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowMobileAccountSheet(false)} 
                className="text-gray-400 p-1 hover:text-gray-700 font-extrabold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action links */}
            <div className="space-y-1.5 pt-1">
              {[
                { label: 'Seller Dashboard (Sell on Quxba)', desc: 'Submit and manage commercial inventory', view: 'seller', color: 'text-purple-600 bg-purple-50', adminOnly: true },
                { label: 'Admin Control Room', desc: 'Audit submissions and authorize catalog items', view: 'admin', color: 'text-purple-600 bg-purple-50', adminOnly: true },
                { label: 'Track Packages & Orders', desc: 'Real-time logistics courier updates', view: 'orders', color: 'text-blue-600 bg-blue-50', adminOnly: false },
                { label: 'Live Assistance Chat Room', desc: 'Converse 24/7 with a dedicated service agent', view: 'support', color: 'text-green-600 bg-green-50', adminOnly: false },
              ].filter(act => {
                if (act.adminOnly) {
                  return currentUser?.email === 'quxbashop@gmail.com';
                }
                return true;
              }).map((act) => (
                <button
                  key={act.view}
                  type="button"
                  onClick={() => {
                    if (act.view === 'orders' && !currentUser) {
                      setAuthMode('signin');
                      setAuthError('Please sign in to view your orders.');
                      setShowAuthModal(true);
                      setShowMobileAccountSheet(false);
                      return;
                    }
                    setCurrentView(act.view as any);
                    setShowMobileAccountSheet(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full text-left py-2.5 px-3.5 rounded-lg transition-all flex items-center justify-between border ${
                    currentView === act.view ? 'bg-purple-50 border-purple-100' : 'bg-gray-50/50 border-transparent hover:border-gray-100'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-[12px] font-black text-slate-800 block">
                      {act.label}
                    </span>
                    <span className="text-[9.5px] text-gray-400 font-normal block leading-none">
                      {act.desc}
                    </span>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-1 rounded uppercase ${act.color}`}>
                    Go
                  </span>
                </button>
              ))}
            </div>

            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setShowMobileAccountSheet(false);
                }}
                className="w-full text-slate-800 font-bold text-xs bg-gray-100 hover:bg-gray-200 py-3 rounded-lg text-center uppercase tracking-wider transition"
              >
                LOG OUT ACCOUNT
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setAuthError('');
                  setShowAuthModal(true);
                  setShowMobileAccountSheet(false);
                }}
                className="w-full text-white font-black text-xs bg-[#7c3aed] hover:bg-purple-700 py-3 rounded-lg text-center uppercase tracking-wider transition"
              >
                SIGN IN / REGISTER
              </button>
            )}

            {/* Quxba Premium Prime info segment */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-3.5 text-white flex items-center justify-between gap-2 shadow-sm">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block leading-none">QUXBA PRIME ⭐ PREMIUM</span>
                <p className="text-[11px] font-extrabold mt-0.5">Enjoy unlimited free shipping</p>
                <p className="text-[9px] text-slate-300">Fast home deliveries for subscribers</p>
              </div>
              <span className="bg-[#7c3aed] text-white text-[9px] font-black px-2 py-1 rounded">ACTIVE</span>
            </div>
          </div>
        </div>
      )}

      {/* Quxba Branded Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
          <div 
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            id="auth-modal-panel"
          >
            {/* Upper Quxba Banner */}
            <div className="bg-black text-white px-6 py-4 flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center">
                <img 
                  src={quxbaBlocksBanner} 
                  alt="Quxba Blocks Logo" 
                  className="h-10 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button 
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthError('');
                  setAuthEmail('');
                  setAuthPassword('');
                }}
                className="text-white/60 hover:text-white hover:bg-white/10 transition p-1.5 rounded-full"
                aria-label="Close authentication modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-5 flex-grow overflow-y-auto max-h-[75vh]">
              {/* Error Callout */}
              {authError && (
                <div className="bg-red-50/90 border border-red-100 rounded-xl p-4 flex gap-3.5 w-full text-left shadow-xs animate-shake">
                  <div className="w-9 h-9 bg-red-100/80 rounded-full flex items-center justify-center text-red-600 flex-shrink-0">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-red-800 uppercase tracking-widest block leading-none">Authentication Notice</span>
                    <p className="text-[11px] text-red-700/90 font-bold leading-relaxed">{authError}</p>
                  </div>
                </div>
              )}

              {/* Segment Toggle tabs (Regular Sign In or Join) */}
              <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setAuthError('');
                  }}
                  className={`py-2 text-xs font-black rounded-md tracking-wider transition ${
                    authMode === 'signin' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  SIGN IN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthError('');
                  }}
                  className={`py-2 text-xs font-black rounded-md tracking-wider transition ${
                    authMode === 'signup' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  CREATE ACCOUNT
                </button>
              </div>



              {/* Input Form Fields */}
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsAuthSubmitting(true);
                  try {
                    if (authMode === 'signin') {
                      await handleLogin(authEmail, authPassword);
                    } else {
                      await handleRegister(authName, authEmail, authPassword);
                    }
                  } catch (err) {
                    console.error("Auth submission error:", err);
                  } finally {
                    setIsAuthSubmitting(false);
                  }
                }}
                className="space-y-3 text-left"
              >
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. John Coaster"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg pl-9 pr-3.5 py-2 text-xs focus:ring-1 focus:ring-brand-primary font-bold focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      placeholder="Enter your registered email ID"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg pl-9 pr-3.5 py-2 text-xs focus:ring-1 focus:ring-brand-primary font-bold focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Access Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <KeyRound className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg pl-9 pr-10 py-2 text-xs focus:ring-1 focus:ring-brand-primary font-bold focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] disabled:bg-purple-350 text-white py-2.5 rounded-lg text-xs font-black tracking-wider transition uppercase shadow-sm mt-5 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isAuthSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{authMode === 'signin' ? 'LOGIN ACCOUNT' : 'REGISTER NEW ACCOUNT'}</span>
                </button>
              </form>

              <div className="relative my-4 flex py-1.5 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-2.5 rounded-lg text-xs font-black tracking-wider transition uppercase shadow-sm cursor-pointer"
              >
                <span className="w-4 h-4 flex items-center justify-center font-bold text-red-500 font-sans">G</span>
                <span>Continue with Google</span>
              </button>



            </div>
          </div>
        </div>
      )}

      {/* Gorgeous Quxba Platform Privacy Policy Overlay Model */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans" id="privacy-policy-modal-overlay">
          <div 
            className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-150 dark:border-neutral-800 flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            id="privacy-modal-panel"
          >
            {/* Header */}
            <div className="bg-[#7c3aed] text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-white/25 p-2 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">Our Privacy Policy</h3>
                  <p className="text-[10px] text-purple-100 uppercase tracking-widest font-black">Legal & Extant Compliance</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 transition p-1.5 rounded-full cursor-pointer bg-transparent outline-none border-0"
                aria-label="Close privacy policy modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Privacy Policy terms content matched perfectly with requested info */}
            <div className="p-6 space-y-4 flex-grow overflow-y-auto max-h-[70vh] text-left">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-semibold">
                Welcome to Quxba! This privacy policy documents how we handle, inspect, and protect data which you submit when traversing our marketplace.
              </p>

              <div className="space-y-3.5 pt-1">
                
                <div className="bg-gray-50 dark:bg-neutral-850 p-4 rounded-xl border border-gray-100 dark:border-neutral-800/80">
                  <h4 className="text-xs font-black text-purple-700 dark:text-[#a78bfa] uppercase tracking-wider mb-1.5">
                    ✓ How we collect information from you
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed font-medium">
                    We collect direct customer identity details (such as names, verified Lagos shipping addresses, phone numbers, and optional order remarks) submitted during user account sign-up and verified secure checkouts.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-neutral-850 p-4 rounded-xl border border-gray-100 dark:border-neutral-800/80">
                  <h4 className="text-xs font-black text-purple-700 dark:text-[#a78bfa] uppercase tracking-wider mb-1.5">
                    ✓ How we protect customers' information
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed font-medium">
                    Customer dispatch lists and pre-paid checkout details are securely protected behind 256-bit encryption layers and compiled within robust Cloud Firestore databases. We run consistent security rule verification matrices to prevent data leaks.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-neutral-850 p-4 rounded-xl border border-gray-100 dark:border-neutral-800/80">
                  <h4 className="text-xs font-black text-purple-700 dark:text-[#a78bfa] uppercase tracking-wider mb-1.5">
                    ✓ How we use and share personal information
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed font-medium">
                    Quxba uses collected information specifically to coordinate anniversary dispatches, compute logistics routing, and run real-time logistics tracking updates. We do not sell or lease customer database lists to external marketing affiliates.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-neutral-850 p-4 rounded-xl border border-gray-100 dark:border-neutral-800/80">
                  <h4 className="text-xs font-black text-purple-700 dark:text-[#a78bfa] uppercase tracking-wider mb-1.5">
                    ✓ General information & Extant compliance
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed font-medium">
                    Our platform services are strictly governed in line with extant laws and national data privacy regulations of Nigeria. By submitting security details to Quxba marketplace, you consent to our secure transaction pipelines.
                  </p>
                </div>

                <div className="bg-rose-50/50 dark:bg-rose-950/10 p-4 rounded-xl border border-rose-100 dark:border-rose-900/20">
                  <h4 className="text-xs font-black text-rose-750 dark:text-rose-400 uppercase tracking-wider mb-1.5">
                    ⚠️ Third-Party Exclusion Disclaimer
                  </h4>
                  <p className="text-xs text-rose-800/80 dark:text-rose-300/90 leading-relaxed font-bold">
                    This policy does not apply to the practices of authorized third party agents, or people of whom we do not exercise direct control, employment, or management.
                  </p>
                </div>

              </div>
            </div>

            {/* Footer Close CTA */}
            <div className="bg-gray-50 dark:bg-neutral-850 px-6 py-4 border-t border-gray-150 dark:border-neutral-800/60 flex justify-end">
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-black px-6 py-3 rounded-xl uppercase tracking-wider transition hover:shadow active:scale-98 cursor-pointer"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gorgeous Quxba Platform Terms of Service Overlay Model */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans" id="terms-of-service-modal-overlay">
          <div 
            className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-150 dark:border-neutral-800 flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            id="terms-modal-panel"
          >
            {/* Header */}
            <div className="bg-[#7c3aed] text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-white/25 p-2 rounded-lg">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">Terms of Service</h3>
                  <p className="text-[10px] text-purple-100 uppercase tracking-widest font-black">Platform Agreements & User Rules</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 transition p-1.5 rounded-full cursor-pointer bg-transparent outline-none border-0"
                aria-label="Close terms of service modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Terms items content scrolling */}
            <div className="p-6 space-y-5 flex-grow overflow-y-auto max-h-[65vh] text-left">
              <div className="flex items-center justify-between p-3.5 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-xl mb-4">
                <div className="flex items-center gap-2">
                  <div className="text-[#f47a20] font-black text-xs font-sans bg-black/5 dark:bg-white/10 w-6 h-6 rounded-full flex items-center justify-center">Q</div>
                  <span className="text-xs font-black text-purple-950 dark:text-purple-200">Official Quxba Marketplace Code</span>
                </div>
                <span className="text-[9px] font-mono bg-[#7c3aed]/10 text-[#7c3aed] dark:text-purple-300 font-bold px-2 py-0.5 rounded-full">
                  Lagos, Nigeria
                </span>
              </div>

              <div className="space-y-4">
                {/* 1. Age constraints */}
                <div className="border border-gray-100 dark:border-neutral-800/80 rounded-xl p-4 hover:border-purple-200 dark:hover:border-purple-900/50 transition">
                  <h4 className="text-[11.5px] font-black text-[#7c3aed] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f47a20]" />
                    1. Eligibility & Age Restriction
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed font-semibold">
                    You must be at least <strong className="text-gray-900 dark:text-white">18 years old</strong> to place orders directly on this platform. If under the required age, orders must be placed under the guidance and active supervision of a parent or legal guardian.
                  </p>
                </div>

                {/* 2. Contract Formation */}
                <div className="border border-gray-100 dark:border-neutral-800/80 rounded-xl p-4 hover:border-purple-200 dark:hover:border-purple-900/50 transition">
                  <h4 className="text-[11.5px] font-black text-[#7c3aed] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffc312]" />
                    2. Orders, Acceptance & Contract Formation
                  </h4>
                  <ul className="text-xs text-gray-600 dark:text-neutral-300 space-y-2 leading-relaxed font-semibold pl-4 list-disc">
                    <li>Placing an order constitutes an offer to purchase the products listed.</li>
                    <li>We may accept or decline orders at our sole discretion. An order is accepted and a contract formed when we send an order confirmation email or when we dispatch the goods, whichever occurs first.</li>
                    <li>We reserve the right to limit quantities, refuse service, cancel orders, or revoke offers at our sole discretion.</li>
                    <li>Prices are shown on the Site and include or exclude taxes and shipping as specified at checkout.</li>
                    <li>We accept payment methods listed at checkout (e.g., credit/debit cards, bank transfer, or Pay on Delivery in Lagos).</li>
                    <li>Payment is taken at the time of ordering. If payment cannot be processed, we reserve the right to cancel the order.</li>
                    <li>Errors in pricing or product information will be corrected immediately; if a product's correct price is higher, we may contact you to confirm or cancel the order.</li>
                  </ul>
                </div>

                {/* 3. Shipping and regional limitations */}
                <div className="border border-gray-100 dark:border-neutral-800/80 rounded-xl p-4 hover:border-purple-200 dark:hover:border-purple-900/50 transition">
                  <h4 className="text-[11.5px] font-black text-[#7c3aed] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8ec010]" />
                    3. Shipping & Delivery
                  </h4>
                  <ul className="text-xs text-gray-600 dark:text-neutral-300 space-y-1 leading-relaxed font-semibold pl-4 list-disc">
                    <li>We ship to specified countries/regions (principally optimized for Lagos delivery zones).</li>
                    <li>Estimated delivery times are provided at checkout and are estimates only. Physical constraints may affect delivery schedules.</li>
                  </ul>
                </div>

                {/* 4. Returns & Refunds */}
                <div className="border border-gray-100 dark:border-neutral-800/80 rounded-xl p-4 hover:border-purple-200 dark:hover:border-purple-900/50 transition">
                  <h4 className="text-[11.5px] font-black text-[#7c3aed] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#13b5ea]" />
                    4. Returns & Refunds Policy
                  </h4>
                  <ul className="text-xs text-gray-600 dark:text-neutral-300 space-y-2 leading-relaxed font-semibold pl-4 list-disc">
                    <li>Our returns policy is strict: <strong className="text-gray-950 dark:text-white">7 days from delivery</strong>, unworn, with tags attached, and in original packaging.</li>
                    <li>To log a return, please contact customer support immediately inside our chat module or email us at <span className="text-[#7c3aed] hover:underline font-mono">support@quxba.com</span>.</li>
                    <li>Refunds are processed back to your original payment method within <strong className="text-gray-950 dark:text-white">7 days</strong> of our warehouse receiving and inspecting the returned item.</li>
                    <li>Shipping costs for returns are paid by the customer, unless the item is defective or incorrect.</li>
                    <li>Sale/clearance items are final sale and not eligible for return unless authorized otherwise.</li>
                  </ul>
                </div>

                {/* 5. Sizing details */}
                <div className="border border-gray-100 dark:border-neutral-800/80 rounded-xl p-4 hover:border-purple-200 dark:hover:border-purple-900/50 transition">
                  <h4 className="text-[11.5px] font-black text-[#7c3aed] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
                    5. Sizing & Product Information
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed font-semibold">
                    We provide detailed size guides and comprehensive product descriptions to help choice matching. Variations in color hue, fit, or measurements may occur slightly depending on monitor and physical supply chains. Minor variations from images do not constitute a defect.
                  </p>
                </div>

                {/* 6. Defective items */}
                <div className="border border-gray-100 dark:border-neutral-800/80 rounded-xl p-4 hover:border-purple-200 dark:hover:border-purple-900/50 transition">
                  <h4 className="text-[11.5px] font-black text-[#7c3aed] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f47a20]" />
                    6. Defective or Incorrect Items
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed font-semibold">
                    If an item is faulty, damaged, or incorrect, please submit a report within <strong className="text-gray-950 dark:text-white">3 days of delivery</strong> with visual evidence (photos, order number). We will evaluate and coordinate replacements, repairs, or full refunds.
                  </p>
                </div>

                {/* 7. Cancellations */}
                <div className="border border-gray-100 dark:border-neutral-800/80 rounded-xl p-4 hover:border-purple-200 dark:hover:border-purple-900/50 transition">
                  <h4 className="text-[11.5px] font-black text-[#7c3aed] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffc312]" />
                    7. Cancellations
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed font-semibold">
                    You may cancel an order prior to dispatch by contacting customer service directly. Once an order has been dispatched from our Lagos station, cancellation is not possible; normal return/exchange procedures will apply instead.
                  </p>
                </div>

                {/* 8. Promotions */}
                <div className="border border-gray-100 dark:border-neutral-800/80 rounded-xl p-4 hover:border-purple-200 dark:hover:border-purple-900/50 transition">
                  <h4 className="text-[11.5px] font-black text-[#7c3aed] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8ec010]" />
                    8. Promotions & Discounts
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed font-semibold">
                    Promotional codes (such as <strong className="text-purple-750 dark:text-purple-300">QUXBA50</strong>), discounts, and offers are subject to terms and expiration dates. Only one promotion may be applied per order unless stated otherwise. We reserve the right to cancel or modify active promotions.
                  </p>
                </div>

                {/* 9. IP rights */}
                <div className="border border-gray-100 dark:border-neutral-800/80 rounded-xl p-4 hover:border-purple-200 dark:hover:border-purple-900/50 transition">
                  <h4 className="text-[11.5px] font-black text-[#7c3aed] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#13b5ea]" />
                    9. Intellectual Property
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed font-semibold">
                    All content on the Site (designs, special graphics, 3D animations, block logos, text, images, and product photos) is our property or licensed to us. You may not reproduce or use our intellectual property without express written permission.
                  </p>
                </div>

                {/* 10. Accounts */}
                <div className="border border-gray-100 dark:border-neutral-800/80 rounded-xl p-4 hover:border-purple-200 dark:hover:border-purple-900/50 transition">
                  <h4 className="text-[11.5px] font-black text-[#7c3aed] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
                    10. User Accounts
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed font-semibold">
                    If you create an account, you are solely responsible for maintaining the confidentiality of your login details and for all activity on your account. Notify us immediately of any unauthorized usage checks.
                  </p>
                </div>

                {/* 11. Privacy with explicit link back */}
                <div className="bg-purple-50/50 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/20 rounded-xl p-4 hover:border-purple-200 dark:hover:border-purple-900/40 transition">
                  <h4 className="text-[11.5px] font-black text-[#7c3aed] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f47a20]" />
                    11. Privacy Statement
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed font-semibold">
                    Our Privacy Policy governs the collection, use, and disclosure of personal information. By using our Site, you consent to computing and processing of your data as described in that policy. 
                    <button 
                      onClick={() => { setShowTermsModal(false); setShowPrivacyModal(true); }}
                      className="ml-1 text-purple-700 hover:text-[#6d28d9] hover:underline font-black cursor-pointer bg-transparent border-0 p-0"
                    >
                      [View Privacy Policy]
                    </button>
                  </p>
                </div>

                {/* 12. Limitation of liability */}
                <div className="border border-gray-100 dark:border-neutral-800/80 rounded-xl p-4 hover:border-purple-200 dark:hover:border-purple-900/50 transition">
                  <h4 className="text-[11.5px] font-black text-[#7c3aed] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffc312]" />
                    12. Limitation of Liability & Warranties
                  </h4>
                  <ul className="text-xs text-gray-600 dark:text-neutral-300 space-y-1.5 leading-relaxed font-semibold pl-4 list-disc">
                    <li>Products are provided "as is" except as required by law.</li>
                    <li>To the fullest extent permitted by law, we disclaim all warranties (express or implied) and limit liability for damages arising from use of the Site or products. Our liability for any claim shall not exceed the purchase price paid for the relevant Product(s).</li>
                    <li>Some jurisdictions do not allow exclusion of certain warranties or limits on liability; where prohibited, those exclusions/limits may not apply.</li>
                  </ul>
                </div>

                {/* 13. Indemnification */}
                <div className="border border-gray-150 dark:border-neutral-800 rounded-xl p-4 bg-gray-50 dark:bg-neutral-850 hover:border-purple-200 dark:hover:border-purple-900/50 transition">
                  <h4 className="text-[11.5px] font-black text-[#7c3aed] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8ec010]" />
                    13. Indemnification
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed font-semibold">
                    You agree to indemnify, defend, and hold us harmless from claims, damages, liabilities, costs, and expenses arising out of your breach of these Terms, misuse of Products, or violation of third-party rights.
                  </p>
                </div>

              </div>
            </div>

            {/* Footer Close CTA */}
            <div className="bg-gray-50 dark:bg-neutral-850 px-6 py-4 border-t border-gray-150 dark:border-neutral-800/60 flex justify-end">
              <button 
                onClick={() => setShowTermsModal(false)}
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-black px-6 py-3 rounded-xl uppercase tracking-wider transition hover:shadow active:scale-98 cursor-pointer"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Manager Admin control center Modal overlay */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans" id="category-control-modal-overlay">
          <div 
            className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-150 flex flex-col animate-slide-up w-full max-w-2xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
            id="category-modal-panel"
          >
            {/* Modal Header */}
            <div className="bg-[#7c3aed] text-white px-6 py-5 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2.5">
                <div className="bg-white/20 p-2 rounded-lg text-lg">📁</div>
                <div>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">CATEGORY CONTROL DECK</h3>
                  <p className="text-[10px] text-purple-100 uppercase tracking-widest font-black">Configure & Manage Store Departments</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 transition p-1.5 rounded-full cursor-pointer bg-transparent outline-none border-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-left">
              {/* List of existing categories first */}
              <div>
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-2">Existing Store Departments ({categories.length})</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                  {categories.map((cat) => (
                    <div 
                      key={cat.id} 
                      className={`p-3 rounded-lg border flex items-center justify-between transition ${
                        adminSelectedCatId === cat.id 
                          ? 'bg-purple-50/50 border-purple-300' 
                          : 'bg-gray-50/60 border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg bg-white p-1 rounded border border-gray-100/55 shadow-2xs flex-shrink-0">{cat.emoji || '📦'}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{cat.name}</p>
                          <p className="text-[9px] text-gray-400 font-medium truncate">
                            {cat.subcategories && cat.subcategories.length > 0 
                              ? `${cat.subcategories.length} subcategories` 
                              : 'No subcategories'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenCategoryManager(cat)}
                          className="p-1 hover:bg-purple-100 rounded transition cursor-pointer text-xs"
                          title="Edit department"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1 hover:bg-red-100 rounded transition cursor-pointer text-xs"
                          title="Delete department"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form to Create/Edit */}
              <form onSubmit={handleSaveCategory} className="space-y-4 border-t border-gray-100 pt-4">
                <span className="text-[10px] font-black uppercase text-[#7c3aed] tracking-wider block">
                  {adminSelectedCatId ? '✏️ EDIT SELECT DEPARTMENT' : '✨ INVENT NEW DEPARTMENT'}
                </span>

                {catError && (
                  <div className="p-3 bg-red-50 text-red-600 text-xs rounded border border-red-150 font-semibold">{catError}</div>
                )}
                {catSuccess && (
                  <div className="p-3 bg-green-50 text-green-700 text-xs rounded border border-green-150 font-semibold">{catSuccess}</div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[9.5px] font-black text-gray-500 uppercase mb-1">Emoji Icon</label>
                    <input
                      type="text"
                      value={adminCatEmoji}
                      onChange={(e) => setAdminCatEmoji(e.target.value)}
                      placeholder="e.g. 🎒"
                      maxLength={4}
                      className="w-full bg-white border border-gray-250 rounded px-2.5 py-2 text-xs text-center font-bold focus:ring-1 focus:ring-[#7c3aed] focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[9.5px] font-black text-gray-500 uppercase mb-1">Department Title *</label>
                    <input
                      type="text"
                      value={adminCatName}
                      onChange={(e) => setAdminCatName(e.target.value)}
                      placeholder="e.g. Toys & Playgrounds"
                      className="w-full bg-white border border-gray-250 rounded px-2.5 py-2 text-xs font-bold focus:ring-1 focus:ring-[#7c3aed] focus:outline-none placeholder-gray-300 text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9.5px] font-black text-gray-500 uppercase mb-1">Short Description / Subtitle</label>
                  <input
                    type="text"
                    value={adminCatDesc}
                    onChange={(e) => setAdminCatDesc(e.target.value)}
                    placeholder="e.g. Baby gears, outdoor playgrounds, building blocks"
                    className="w-full bg-white border border-gray-250 rounded px-2.5 py-2 text-xs font-semibold focus:ring-1 focus:ring-[#7c3aed] focus:outline-none placeholder-gray-300 text-gray-800"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[9.5px] font-black text-[#7c3aed] uppercase">Subcategories list (Comma-separated)</label>
                    <span className="text-[9px] text-gray-400 font-bold">Recommended</span>
                  </div>
                  <input
                    type="text"
                    value={adminCatSubs}
                    onChange={(e) => setAdminCatSubs(e.target.value)}
                    placeholder="e.g. Women's Fashion, Men's Fashion, Shoes, Bags, Accessories, Watches, High Glass"
                    className="w-full bg-white border border-gray-250 rounded px-2.5 py-2.5 text-xs font-semibold focus:ring-1 focus:ring-[#7c3aed] focus:outline-none placeholder-gray-300 text-gray-800 shadow-2xs"
                  />
                  <p className="text-[9.5px] text-gray-400 leading-snug mt-1 font-medium">Input subcategories separated by commas. These will automatically appear as beautiful filters under the storefront rows & when adding products!</p>
                </div>

                <div className="flex justify-end gap-2.5 pt-2 font-sans">
                  {adminSelectedCatId && (
                    <button
                      type="button"
                      onClick={() => handleOpenCategoryManager()}
                      className="px-4 py-2 border border-gray-200 text-gray-500 rounded text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
                    >
                      Clear Selection
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={catSaving}
                    className="px-5 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white rounded text-xs font-black uppercase tracking-wider transition shadow-sm cursor-pointer"
                  >
                    {catSaving ? 'Saving...' : adminSelectedCatId ? '💾 Save Changes' : '➕ Invent Department'}
                  </button>
                </div>

              </form>

            </div>
          </div>
        </div>
      )}

      {/* Real-time Wishlist Alerts Toast Container */}
      <div 
        id="toast-notification-container" 
        className="fixed bottom-5 right-5 z-100 flex flex-col gap-3.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            id={`toast-item-${toast.id}`}
            className="pointer-events-auto bg-white border border-purple-100 rounded-lg shadow-xl p-3 flex gap-3 animate-slide-in-right relative overflow-hidden"
            style={{ borderLeftWidth: '5px', borderLeftColor: toast.type === 'price-drop' ? '#ef4444' : '#7c3aed' }}
          >
            {toast.productImageUrl && (
              <div className="w-10 h-10 flex-shrink-0 bg-neutral-50 border border-gray-100 rounded flex items-center justify-center p-0.5 overflow-hidden">
                <img
                  src={toast.productImageUrl}
                  alt=""
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'; }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-extrabold text-neutral-900 leading-tight pr-4">{toast.title}</h4>
              <p className="text-[10px] text-neutral-500 mt-1 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="absolute top-2 right-2 text-neutral-300 hover:text-neutral-500 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>


      {/* Custom Delete Confirmation Modal overlay */}
      {productToConfirmDelete && (
        <div 
          id="delete-confirmation-modal-overlay" 
          className="fixed inset-0 z-[110] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans"
          onClick={() => setProductToConfirmDelete(null)}
        >
          <div 
            id="delete-confirmation-modal-card"
            className="bg-white rounded-2xl shadow-2xl border border-gray-150 overflow-hidden w-full max-w-sm animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning gradient banner */}
            <div className="bg-red-50 text-red-700 px-6 py-5 border-b border-red-100 flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-left">
                <h3 className="font-display font-black text-xs uppercase tracking-wider text-red-950">Confirm Deletion</h3>
                <p className="text-[9px] text-red-600 uppercase tracking-widest font-black font-mono">Administrative Action Required</p>
              </div>
            </div>

            {/* Modal Body content */}
            <div className="p-6 space-y-4 text-left">
              <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                Are you sure you want to permanently remove this catalog item from the Quxba platform?
              </p>

              {/* Product Info Card Preview */}
              <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 p-0.5 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-2xs">
                  <img 
                    src={productToConfirmDelete.imageUrl} 
                    alt={productToConfirmDelete.name}
                    className="max-h-full max-w-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'; }}
                  />
                </div>
                <div className="min-w-0 flex-grow text-left">
                  <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider">
                    {productToConfirmDelete.category}
                  </span>
                  <h4 className="text-[11px] font-bold text-neutral-900 truncate leading-snug mt-0.5">
                    {productToConfirmDelete.name}
                  </h4>
                  <p className="text-[11px] font-black text-[#7c3aed] mt-0.5">
                    ₦ {productToConfirmDelete.price.toLocaleString('en-NG')}
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-red-500 font-bold leading-relaxed">
                ⚠ Note: This action is permanent and cannot be undone.
              </p>
            </div>

            {/* Actions CTA Bar */}
            <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-100 flex gap-2.5 justify-end">
              <button 
                id="delete-confirm-btn-no"
                onClick={() => setProductToConfirmDelete(null)}
                className="bg-white hover:bg-neutral-100 text-neutral-600 font-black text-[10px] px-4 py-2.5 rounded-xl border border-neutral-200 uppercase tracking-wider transition active:scale-95 cursor-pointer outline-none focus:ring-1 focus:ring-neutral-300"
              >
                Keep Listing
              </button>
              <button 
                id="delete-confirm-btn-yes"
                onClick={() => {
                  if (productToConfirmDelete) {
                    executeDeleteProduct(productToConfirmDelete.id);
                    setProductToConfirmDelete(null);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] px-5 py-2.5 rounded-xl shadow-sm uppercase tracking-wider transition active:scale-95 cursor-pointer outline-none focus:ring-1 focus:ring-red-400"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
