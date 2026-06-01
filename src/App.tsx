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

import { INITIAL_PRODUCTS } from './data/products';
import { Product, CartItem, Order, UserAccount } from './types';
import { 
  Zap, Flame, Percent, RefreshCcw, Landmark, Award, ShieldCheck, HelpCircle, Smartphone, ArrowRight,
  ListFilter, SlidersHorizontal, RotateCcw, X, ChevronDown, ChevronRight, Grid, List,
  Home, ShoppingCart, Heart, User, ShieldAlert, KeyRound, Mail, UserPlus, Info, ShoppingBag,
  Eye, EyeOff, Loader2
} from 'lucide-react';

// Firebase Integrations
import { auth, db, OperationType, handleFirestoreError } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  deleteDoc, 
  updateDoc,
  query,
  where
} from 'firebase/firestore';

export default function App() {
  // Syncing States to Client-Side Local Storage & Firebase Firestore
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

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
  const [isAppLoading, setIsAppLoading] = useState(true);

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

    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2650);

    return () => clearTimeout(timer);
  }, []);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  // Firebase Real-time listeners & Auth Change Trigger
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email || '';
        const name = firebaseUser.displayName || email.split('@')[0] || 'User';
        const u = { email, name };
        setCurrentUser(u);
        localStorage.setItem('jumia_logged_in_user', JSON.stringify(u));
        localStorage.setItem('jumia_auth_method', 'firebase');

        // Sync or register user node in database
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            await setDoc(userRef, { email, name });
          }
        } catch (error) {
          console.warn("Gracefully handled Firestore user sync error (ignoring to avoid blocking auth state):", error);
        }
      } else {
        const authMethod = localStorage.getItem('jumia_auth_method');
        if (authMethod !== 'local') {
          setCurrentUser(null);
          localStorage.removeItem('jumia_logged_in_user');
          localStorage.removeItem('jumia_auth_method');
        }
      }
    });
    return unsubscribe;
  }, []);

  // Sync Products list in real-time
  useEffect(() => {
    const ref = collection(db, 'products');
    const unsubscribe = onSnapshot(ref, async (snapshot) => {
      if (snapshot.empty) {
        setProducts(INITIAL_PRODUCTS);
        // Only the admin authenticated via Firebase can seed the database
        const authMethod = localStorage.getItem('jumia_auth_method');
        if (currentUser?.email === 'quxbashop@gmail.com' && authMethod === 'firebase' && auth.currentUser) {
          try {
            // Auto seed database with products
            for (const item of INITIAL_PRODUCTS) {
              const docRef = doc(db, 'products', item.id);
              await setDoc(docRef, {
                ...item,
                isApproved: item.isApproved !== undefined ? item.isApproved : true,
                createdAt: item.createdAt || Date.now()
              });
            }
          } catch (error) {
            console.warn("Auto seed of products skipped or failed (local fallback products loaded):", error);
          }
        }
      } else {
        const prodList: Product[] = [];
        snapshot.forEach((snap) => {
          prodList.push(snap.data() as Product);
        });

        // Handle Change Detection relative to stored references
        const prevProducts = prevProductsRef.current;
        if (prevProducts && prevProducts.length > 0) {
          wishlistRef.current.forEach((wishItem) => {
            const oldProd = prevProducts.find(p => p.id === wishItem.id);
            const newProd = prodList.find(p => p.id === wishItem.id);
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

        setProducts(prodList);
        prevProductsRef.current = prodList;
      }
    }, (error) => {
      console.warn("Products subscription warning (offline / guest permission check):", error);
    });
    return unsubscribe;
  }, [currentUser]);

  // Sync Orders in real-time
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      return;
    }
    const collectionRef = collection(db, 'orders');
    // For admin, read all. For other users, filter by customerEmail to avoid permission rules violation.
    const q = currentUser.email === 'quxbashop@gmail.com' 
      ? collectionRef 
      : query(collectionRef, where('customerEmail', '==', currentUser.email));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersList: Order[] = [];
      snapshot.forEach((snap) => {
        ordersList.push(snap.data() as Order);
      });
      ordersList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setOrders(ordersList);
    }, (error) => {
      console.warn("Orders subscription warning (offline / guest permission check):", error);
    });
    return unsubscribe;
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
    try {
      // 1. Try Firebase Authentication
      await signInWithEmailAndPassword(auth, email, passStr);
      localStorage.setItem('jumia_auth_method', 'firebase');
      setShowAuthModal(false);
      setAuthError('');
      setAuthPassword('');
      return { success: true };
    } catch (err: any) {
      console.warn("Firebase sign-in failed, checking safe local fallback:", err);
      
      // 2. Check if user exists in local registeredUsers database
      const localUser = registeredUsers[email];
      if (localUser && localUser.pass === passStr) {
        const u = { email: localUser.email, name: localUser.name };
        setCurrentUser(u);
        localStorage.setItem('jumia_logged_in_user', JSON.stringify(u));
        localStorage.setItem('jumia_auth_method', 'local');
        
        // Silently attempt to register with Firebase in the background in case Firebase database is recovering
        try {
          await createUserWithEmailAndPassword(auth, email, passStr);
        } catch (sErr) {
          console.warn("Silent Firebase sync registration skipped:", sErr);
        }

        setShowAuthModal(false);
        setAuthError('');
        setAuthPassword('');
        return { success: true };
      }
      
      setAuthError(getFriendlyAuthErrorMessage(err));
      return { success: false };
    }
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

    try {
      // 1. Try register with Firebase Authentication
      const result = await createUserWithEmailAndPassword(auth, email, passStr);
      setRegisteredUsers(newUsers);
      localStorage.setItem('jumia_registered_users', JSON.stringify(newUsers));
      localStorage.setItem('jumia_auth_method', 'firebase');

      try {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: email,
          name: nameStr
        });
      } catch (dbErr) {
        console.warn("Could not write user profile to database (ignoring to secure signup flow):", dbErr);
      }

      setShowAuthModal(false);
      setAuthError('');
      setAuthPassword('');
      setAuthName('');
      return { success: true };
    } catch (err: any) {
      console.warn("Firebase sign-up failed, running local robust fallback registration:", err);
      
      const code = err.code || "";
      if (code.includes('auth/email-already-in-use')) {
        setAuthError('This email address is already registered. Please sign in instead.');
        return { success: false };
      }

      // Complete registration locally
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
      return { success: true };
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
    setCurrentUser(null);
    localStorage.removeItem('jumia_logged_in_user');
    localStorage.removeItem('jumia_auth_method');
    setCurrentView('storefront');
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setShowAuthModal(false);
      setAuthError('');
    } catch (err: any) {
      setAuthError('Google Login failed: ' + getFriendlyAuthErrorMessage(err));
    }
  };

  // Navigation states
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [currentView, setCurrentView] = useState<'storefront' | 'seller' | 'admin' | 'orders' | 'support' | 'checkout'>('storefront');

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
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  const handleAddReview = async (productId: string, rating: number, comment: string, userName: string) => {
    const prod = products.find(p => p.id === productId);
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

    try {
      await updateDoc(doc(db, 'products', productId), {
        reviews: updatedReviews,
        rating: newAvgRating,
        reviewsCount: updatedReviews.length
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${productId}`);
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
    // Inject the customer email if logged in to link it securely in Firestore
    const orderWithEmail: Order = {
      ...newOrder,
      customerEmail: currentUser?.email || 'guest@gmail.com',
      statusTimestamps: newOrder.statusTimestamps || {
        'Pending': new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })
      }
    };
    try {
      await setDoc(doc(db, 'orders', newOrder.id), orderWithEmail);
      console.log(`[Mock Email Notification Service] SUCCESS: Simulating email delivery... Order confirmation successfully generated & sent to customer inbox at ${orderWithEmail.customerEmail} for order ID: ${newOrder.id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${newOrder.id}`);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const snap = await getDoc(orderRef);
      if (snap.exists()) {
        const orderData = snap.data() as Order;
        const currentTimestamps = orderData.statusTimestamps || {};
        const updatedTimestamps = {
          ...currentTimestamps,
          'Cancelled': new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })
        };
        await updateDoc(orderRef, {
          status: 'Cancelled',
          statusTimestamps: updatedTimestamps
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: 'Pending' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled') => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const snap = await getDoc(orderRef);
      if (snap.exists()) {
        const orderData = snap.data() as Order;
        const currentTimestamps = orderData.statusTimestamps || {};
        const updatedTimestamps = {
          ...currentTimestamps,
          [nextStatus]: new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })
        };
        await updateDoc(orderRef, {
          status: nextStatus,
          statusTimestamps: updatedTimestamps
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
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
    try {
      // Force auto-approval for admin (quxbashop@gmail.com) added products so they show instantly
      const isAdminUser = currentUser?.email === 'quxbashop@gmail.com';
      await setDoc(doc(db, 'products', newProduct.id), {
        ...newProduct,
        isApproved: isAdminUser ? true : (newProduct.isApproved !== undefined ? newProduct.isApproved : false),
        createdAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${newProduct.id}`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
    }
  };

  const handleApproveProductFromAdmin = async (productId: string) => {
    try {
      await updateDoc(doc(db, 'products', productId), { isApproved: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${productId}`);
    }
  };

  const handleRejectProductFromAdmin = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
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
  const publicProducts = products.filter((p) => p.isApproved);

  const filteredProducts = publicProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All Categories' || product.category === selectedCategory;
    
    const matchesSearch =
      searchQuery.trim() === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMinPrice = minPrice === '' || product.price >= minPrice;
    const matchesMaxPrice = maxPrice === '' || product.price <= maxPrice;
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(getProductBrand(product));

    return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice && matchesBrand;
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
          <div className="relative flex items-center justify-center w-28 h-28 bg-white/10 rounded-full border border-white/20 shadow-2xl backdrop-blur-md transition-transform duration-500 scale-105">
            {/* Animating outer accent rings */}
            <div className="absolute inset-0 rounded-full border-2 border-t-purple-400 border-r-indigo-400 animate-spin" />
            <div className="absolute -inset-3 rounded-full border border-purple-500/20 animate-ping opacity-75" />
            
            {/* Real Logo Vector / Symbols */}
            <ShoppingBag className="w-12 h-12 text-purple-300 animate-pulse" />
          </div>

          {/* Core Branding Label */}
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-200 via-white to-indigo-200 bg-clip-text text-transparent">
              QUXBA NIGERIA
            </h1>
            <p className="text-xs uppercase tracking-widest font-black text-purple-300 font-mono">
              ★ 10th Anniversary Superstore ★
            </p>
          </div>

          {/* Stepper Delivery Themed Progress Bar */}
          <div className="w-48 bg-purple-950 h-2.5 rounded-full overflow-hidden border border-purple-800 shadow-inner">
            <div className="bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 h-full w-full rounded-full animate-progress" />
          </div>

          {/* Fun Loading Captions / Telemetry labels */}
          <div className="space-y-1">
            <p className="text-xs font-bold text-indigo-200 font-mono flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
              <span>Initializing secure Quxba gateway...</span>
            </p>
            <p className="text-[10px] text-purple-300/80 font-mono">Nigeria's #1 Anniversary Mall · Syncing Firestore databases</p>
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
          if (view === 'seller' || view === 'admin' || view === 'support') {
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
      />

      {/* Primary Workspace Stage */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-6 py-6" id="main-storefront-wrapper">
        
        {currentView === 'storefront' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Upper layouts: Category tree panel & Hero Slider */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left sidebar: Quick category selector list (Matches Quxba Sidebar) */}
              <div className="hidden lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-1">
                <span className="text-xs font-black tracking-widest text-[#7c3aed] px-3 py-2 block uppercase border-b border-gray-50 mb-2">
                  OUR DEPARTMENTS 🛒
                </span>
                {[
                  'All Categories',
                  'Electronics & Appliances',
                  'Phones & Tablets',
                  'Computers & Accessories',
                  'Fashion & Apparel',
                  'Supermarket & Groceries',
                  'Health & Beauty'
                ].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      selectedCategory === category
                        ? 'bg-purple-50 text-[#7c3aed] font-bold border-l-4 border-l-[#7c3aed] pl-4'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
                
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
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 animate-fade-in" id="shortcut-cards">
              {[
                { label: 'Flash Sales', emoji: '🔥', imgUrl: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=400&q=80', action: () => { setSelectedCategory('All Categories'); setTimeout(() => { document.getElementById('quxba-flash-sales')?.scrollIntoView({ behavior: 'smooth' }); }, 150); }, bg: 'bg-purple-100' },
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
              <FlashSales
                products={products}
                wishlist={wishlist}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                onSelectProduct={(p) => setSelectedProduct(p)}
              />
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
                          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                            {[
                              'All Categories',
                              'Electronics & Appliances',
                              'Phones & Tablets',
                              'Computers & Accessories',
                              'Fashion & Apparel',
                              'Supermarket & Groceries',
                              'Health & Beauty'
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
                            <p className="font-extrabold text-[#7c3aed] uppercase text-[9px] tracking-wider font-sans">Express Delivery</p>
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
                                />
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        /* Beautiful Category Rows layout on actual homepage */
                        <div className="space-y-8 animate-fade-in text-left">
                          {[
                            { name: 'Electronics & Appliances', emoji: '🔌', subtitle: 'Explore heavy-duty refrigerators, split air conditioners, smart TVs & audio setups.' },
                            { name: 'Phones & Tablets', emoji: '📱', subtitle: 'Find the latest smartphones, premium corporate pads & accessory lines with genuine warranties.' },
                            { name: 'Computers & Accessories', emoji: '💻', subtitle: 'Upgrade your work setup with heavy-duty laptops, screens & drives.' },
                            { name: 'Fashion & Apparel', emoji: '👕', subtitle: 'Premium styles, lightweight activewear, designer canvas sneakers & elegant wristwatches.' },
                            { name: 'Supermarket & Groceries', emoji: '🍏', subtitle: 'Get quick handpicked kitchen items, nutritious breakfast packs & essential provisions.' },
                            { name: 'Health & Beauty', emoji: '💄', subtitle: 'Premium cosmetic brands, organic skincare routines, beauty serums & luxury designer scents.' }
                          ].map((sec) => {
                            const catProducts = publicProducts.filter(p => p.category === sec.name).slice(0, 4);
                            if (catProducts.length === 0) return null;
                            return (
                              <div key={sec.name} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden pb-5 sm:pb-6 space-y-4">
                                {/* Signature Brand Header Banner (Matches requested styling mockup) */}
                                <div className="bg-[#7c3aed] px-4 py-2.5 sm:px-5 flex items-center justify-between text-white font-sans font-black tracking-wider uppercase">
                                  <span className="font-black tracking-wider flex items-center gap-1.5">
                                    <span className="text-sm">{sec.emoji}</span>
                                    <span style={{ fontSize: '9px', lineHeight: '15px' }} className="font-black">
                                      {sec.name === 'Fashion & Apparel' 
                                        ? 'FASHION DEALS' 
                                        : sec.name === 'Phones & Tablets' 
                                        ? 'PHONES & TABLETS DEALS' 
                                        : sec.name === 'Electronics & Appliances' 
                                        ? 'ELECTRONICS & APPLIANCES DEALS' 
                                        : sec.name === 'Computers & Accessories' 
                                        ? 'COMPUTERS & ACCESSORIES DEALS' 
                                        : sec.name === 'Supermarket & Groceries' 
                                        ? 'SUPERMARKET & GROCERIES DEALS' 
                                        : 'HEALTH & BEAUTY DEALS'}
                                    </span>
                                  </span>
                                  <button
                                    onClick={() => {
                                      setSelectedCategory(sec.name);
                                      window.scrollTo({ top: 300, behavior: 'smooth' });
                                    }}
                                    className="hover:underline font-black tracking-widest cursor-pointer select-none uppercase"
                                    style={{ fontSize: '9px', lineHeight: '11px' }}
                                  >
                                    SEE ALL
                                  </button>
                                </div>

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
              products={products}
              onAddNewProduct={handleAddNewProductFromSeller}
              onDeleteProduct={handleDeleteProduct}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-red-50 p-8 max-w-md mx-auto text-center space-y-4 font-sans animate-fade-in my-10">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl">🔒</div>
              <h3 className="text-base font-black text-gray-800 uppercase tracking-tight">Access Restricted</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">Only the store owner account (<strong className="text-purple-600 font-mono">quxbashop@gmail.com</strong>) has access to sell products and manage inventories.</p>
              <button onClick={() => setCurrentView('storefront')} className="bg-[#7c3aed] hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition uppercase cursor-pointer">Return to Shop</button>
            </div>
          )
        )}

        {currentView === 'admin' && (
          currentUser?.email === 'quxbashop@gmail.com' ? (
            <AdminDashboard
              products={products}
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
          currentUser?.email === 'quxbashop@gmail.com' ? (
            <CustomerSupportChat />
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-red-50 p-8 max-w-md mx-auto text-center space-y-4 font-sans animate-fade-in my-10">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl">🔒</div>
              <h3 className="text-base font-black text-gray-800 uppercase tracking-tight">Live Support Desk</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">Live support assistance channel is authorized for store management (<strong className="text-purple-600 font-mono">quxbashop@gmail.com</strong>) to chat with clients.</p>
              <button onClick={() => setCurrentView('storefront')} className="bg-[#7c3aed] hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition uppercase cursor-pointer font-sans">Return to Shop</button>
            </div>
          )
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            cart={cart}
            currentUser={currentUser}
            onPlaceOrder={handlePlaceOrder}
            onClearCart={handleClearCart}
            onToggleView={(view) => {
              if (view === 'seller' || view === 'admin' || view === 'support') {
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
            <span className="font-display text-2xl font-extrabold text-[#7c3aed] italic uppercase w-auto h-12 flex items-center">
              QUXBA
            </span>
            <p className="text-xs text-gray-400 leading-relaxed">
              Quxba is the leading e-commerce platform. Discover incredible discounts, electronic flash sales, clothes, and groceries delivered straight to your residence.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Help & Resources</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><button onClick={() => setCurrentView('support')} className="hover:text-white transition">Live Support Chat</button></li>
              <li><button onClick={() => setSelectedCategory('All Categories')} className="hover:text-white transition">Return Guidelines</button></li>
              <li><span className="text-gray-500">Service Hours: 24/7 Fast Help Room</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Partner with Quxba</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><button onClick={() => setCurrentView('seller')} className="hover:text-white transition font-bold text-purple-400">Sell on Quxba (Seller Zone)</button></li>
              <li><span className="text-gray-500">Hub Pick-up Joint Partner</span></li>
              <li><span className="text-gray-500">Logistics & Rider Contractor</span></li>
            </ul>
          </div>

          <div className="space-y-4 text-xs">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quxba Newsletter</h4>
            <p className="text-gray-400 leading-relaxed">Get first pings when flash sales on refrigerators and ACs begin!</p>
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
          <p>© 2026 Quxba E-Commerce Platform. Designed for modern high-fidelity responsive web experience.</p>
          <div className="flex justify-center gap-4">
            <span className="hover:text-gray-300">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-gray-300">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-gray-300">Nigeria</span>
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
        product={selectedProduct ? products.find(p => p.id === selectedProduct.id) || selectedProduct : null}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isInWishlist={wishlist.some(w => w.id === selectedProduct?.id)}
        onAddReview={handleAddReview}
        currentUser={currentUser}
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
                { label: 'Live Assistance Chat Room', desc: 'Converse 24/7 with a dedicated service agent', view: 'support', color: 'text-green-600 bg-green-50', adminOnly: true },
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
            <div className="bg-[#7c3aed] text-white px-6 py-5 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-display font-black text-xl italic tracking-wide">QUXBA MALL</span>
                <p className="text-[10px] uppercase font-black tracking-widest text-purple-100">Anniversary Auth Center</p>
              </div>
              <button 
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthError('');
                  setAuthEmail('');
                  setAuthPassword('');
                }}
                className="text-black/70 hover:text-black hover:bg-black/10 transition p-1.5 rounded-full"
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

              {/* Custom descriptive tip */}
              <p className="text-xs text-gray-400 font-medium text-center">
                {authMode === 'signin' 
                  ? "Access your personal dashboard to track purchases or verify authorized seller configurations."
                  : "Register as a Quxba Prime customer to buy hot anniversary appliances and trace shipment logs."}
              </p>

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
                        placeholder="e.g. Kola Adesina"
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

              <div className="mt-4 bg-[#f5f3ff] border border-purple-100 rounded-lg p-3 text-[10.5px] text-purple-800 leading-normal font-medium">
                <p className="font-bold text-purple-950 mb-1">💡 Google Login Tips:</p>
                <ul className="list-disc list-inside space-y-1 text-purple-900/90 text-left">
                  <li>Please make sure to click <strong className="text-purple-950">"Open in New Tab"</strong> at the top right of the preview so Google's login popup can open safely outside the sandboxed iframe.</li>
                  <li>Ensure your application's domain is added to <strong className="text-purple-950">Authorized Domains</strong> in your Firebase Console under <em className="not-italic">Authentication ➔ Settings</em>.</li>
                </ul>
              </div>

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



    </div>
  );
}
