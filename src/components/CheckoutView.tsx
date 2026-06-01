import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  Truck, 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  ShieldCheck, 
  Check, 
  Sun, 
  Moon, 
  Tag, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, Product, Order, UserAccount } from '../types';

interface CheckoutViewProps {
  cart: CartItem[];
  currentUser: UserAccount | null;
  onPlaceOrder: (order: Order) => void;
  onClearCart: () => void;
  onToggleView: (view: 'storefront' | 'orders' | 'seller' | 'admin' | 'support') => void;
}

const LAGOS_NEIGHBORHOODS = [
  { area: "Victoria Island", postalCode: "101241", description: "VI - Adeola Hopewell, Kuramo, Adetokunbo Ademola" },
  { area: "Lekki Phase 1", postalCode: "105102", description: "Lekki - Admiralty Way, Phase 1 Residents Zone" },
  { area: "Ikoyi", postalCode: "101233", description: "Ikoyi - Bourdillon, Kingsway, Awolowo Road" },
  { area: "Ikeja GRA", postalCode: "100271", description: "Ikeja - GRA, Allen Avenue, Toyin Street" },
  { area: "Yaba", postalCode: "100231", description: "Yaba - Sabo, Akoka (Unilag), Herbert Macaulay" },
  { area: "Surulere", postalCode: "101211", description: "Surulere - Adeniran Ogunsanya, Bode Thomas" },
  { area: "Maryland", postalCode: "100211", description: "Maryland - Shonibare Estate, Mende" },
  { area: "Festac Town", postalCode: "102102", description: "Festac - 2nd Avenue, Mile 2 Interchange" },
  { area: "Alimosho / Ipaja", postalCode: "100278", description: "Alimosho - Egbeda, Akowonjo, Ipaja" },
  { area: "Ajah / Sangotedo", postalCode: "101245", description: "Ajah - VGC, Sangotedo, Abraham Adesanya" },
  { area: "Apapa", postalCode: "101251", description: "Apapa - Marine Road, Commercial Area, Wharf" },
  { area: "Gbagada", postalCode: "100244", description: "Gbagada - Phase 1 & 2, Ifako Residential" },
];

export default function CheckoutView({
  cart,
  currentUser,
  onPlaceOrder,
  onClearCart,
  onToggleView
}: CheckoutViewProps) {
  // Wizard view steps: 'info' | 'shipping' | 'payment' | 'review' | 'success'
  const [step, setStep] = useState<'info' | 'shipping' | 'payment' | 'review' | 'success'>('info');
  
  // Independent theme override for Checkout Card/Form to support dark/light demo
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Lagos'); // Locked to Lagos as per spec
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Nigeria'); // Locked to Nigeria as per spec
  const [orderNotes, setOrderNotes] = useState('');
  
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'pickup'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer' | 'mobile_money' | 'cod'>('card');
  
  // Form controls & settings
  const [saveInfo, setSaveInfo] = useState(true);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressQuery, setAddressQuery] = useState('');
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState<typeof LAGOS_NEIGHBORHOODS>([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  
  // Custom coupon engine state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Form Error Flags for Real-Time Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Generated Order Details after success
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [placedExpectedDelivery, setPlacedExpectedDelivery] = useState('');

  // Initial mount: load saved info if exists
  useEffect(() => {
    const saved = localStorage.getItem('quxba_checkout_saved_profile');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setFullName(data.fullName || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setCity(data.city || '');
        setPostalCode(data.postalCode || '');
        setSaveInfo(true);
      } catch (err) {
        console.warn('Could not parse pre-saved profiles:', err);
      }
    } else if (currentUser) {
      setFullName(currentUser.name || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  // Handle live address field search mapping to Lagos neighborhood suggestions
  useEffect(() => {
    if (!addressQuery.trim()) {
      setFilteredNeighborhoods([]);
      return;
    }
    const filtered = LAGOS_NEIGHBORHOODS.filter(n => 
      n.area.toLowerCase().includes(addressQuery.toLowerCase()) || 
      n.description.toLowerCase().includes(addressQuery.toLowerCase())
    );
    setFilteredNeighborhoods(filtered);
  }, [addressQuery]);

  // Helpers for calculations
  const getCartItemPrice = (item: CartItem): number => {
    if (item.selectedOptions && item.product.variants && item.product.variants.length > 0) {
      const match = item.product.variants.find((v) => {
        const o1 = v.options || {};
        const o2 = item.selectedOptions || {};
        return Object.keys(o1).every((k) => o1[k] === o2[k]) &&
               Object.keys(o2).every((k) => o1[k] === o2[k]);
      });
      if (match) return match.price;
    }
    return item.product.price;
  };

  const getShippingFee = () => {
    switch (shippingMethod) {
      case 'express': return 3500;
      case 'pickup': return 500;
      default: return 1500;
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => acc + (getCartItemPrice(item) * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const shippingFee = getShippingFee();
  const taxAmount = Math.round(subtotal * 0.075); // 7.5% VAT in Nigeria
  const discountAmount = appliedCoupon ? couponDiscount : 0;
  const grandTotal = Math.max(0, subtotal + shippingFee + taxAmount - discountAmount);

  // Auto-Validate and check specific step errors
  const validateStep = (currentStep: 'info' | 'shipping' | 'payment' | 'review') => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 'info') {
      if (!fullName.trim()) newErrors.fullName = 'Full Name is required';
      else if (fullName.trim().split(' ').length < 2) newErrors.fullName = 'Please enter both your first and last name';

      if (!email.trim()) newErrors.email = 'Email Address is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email address';

      if (!phone.trim()) newErrors.phone = 'Phone Number is required';
      else if (!/^(?:\+234|0)[789][01]\d{8}$/.test(phone.replace(/\s+/g, ''))) {
        newErrors.phone = 'Please enter a valid Nigerian phone number (e.g. 08123456789 or +2348123456789)';
      }
    }

    if (currentStep === 'shipping') {
      if (!address.trim()) newErrors.address = 'A complete delivery address is required';
      if (!city.trim()) newErrors.city = 'Neighborhood City/LGA is required';
      if (state !== 'Lagos') newErrors.state = 'Currently, Quxba only delivers inside Lagos State';
    }

    if (currentStep === 'payment') {
      if (!paymentMethod) newErrors.paymentMethod = 'Please select a payment gateway';
    }

    if (currentStep === 'review') {
      if (!privacyConsent) newErrors.privacyConsent = 'You must accept the terms & privacy policy to place an order';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Safe Proceed Action
  const handleProceed = (nextStep: 'shipping' | 'payment' | 'review') => {
    let currentValidatorStep: 'info' | 'shipping' | 'payment' = 'info';
    if (nextStep === 'payment') currentValidatorStep = 'shipping';
    if (nextStep === 'review') currentValidatorStep = 'payment';

    if (validateStep(currentValidatorStep)) {
      setStep(nextStep);
    }
  };

  // Handlers for dynamic suggestions autocomplete
  const handleSelectNeighborhood = (n: typeof LAGOS_NEIGHBORHOODS[number]) => {
    setAddress(`${n.description}`);
    setCity(`${n.area}`);
    setPostalCode(n.postalCode);
    setAddressQuery(`${n.area}, Lagos`);
    setShowAddressDropdown(false);
    
    // Clear validation fields once loaded
    setErrors(prev => {
      const copy = { ...prev };
      delete copy.address;
      delete copy.city;
      return copy;
    });
  };

  // Handle promo card inputs
  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    // Modern backend-like validations replicated client-side safely
    if (code === 'QUXBA50') {
      setCouponDiscount(5000);
      setAppliedCoupon('QUXBA50');
      setCouponSuccess('Success! Special anniversary bonus has been registered (₦5,000 Off!).');
    } else if (code === 'LAGOSFREE') {
      setCouponDiscount(shippingFee);
      setAppliedCoupon('LAGOSFREE');
      setCouponSuccess('Success! Free Standard Shipping campaign has been applied to this package.');
    } else if (code === 'QUXBA10') {
      const tenPercent = Math.round(subtotal * 0.10);
      setCouponDiscount(tenPercent);
      setAppliedCoupon('QUXBA10');
      setCouponSuccess(`Success! 10% discount has been applied to catalog items (-₦${tenPercent.toLocaleString()}).`);
    } else {
      setCouponError('Invalid coupon code. Try using "QUXBA50" or "LAGOSFREE".');
    }
  };

  // Clear Coupon Action
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  // Place Final Order Action
  const handlePlaceSecureOrder = async () => {
    if (!validateStep('review')) return;

    setIsSubmitting(true);
    
    // Auto-save information to localStorage if saved checkbox is checked
    if (saveInfo) {
      const profileToSave = { fullName, email, phone, address, city, postalCode };
      localStorage.setItem('quxba_checkout_saved_profile', JSON.stringify(profileToSave));
    } else {
      localStorage.removeItem('quxba_checkout_saved_profile');
    }

    // Call simulated checkout validation API on backend (Express) to replicate professional checkout safety
    try {
      const response = await fetch('/api/orders/validate-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          address,
          city,
          state,
          postalCode,
          country,
          shippingMethod,
          paymentMethod,
          cartItemsCount: cart.length,
          discountAmount,
          taxAmount,
          subtotal,
          grandTotal
        })
      });

      const validatorResult = await response.json();
      
      if (!response.ok || !validatorResult.isValid) {
        setErrors({ submit: validatorResult.error || 'Server-side validation failed. Please review values and try again.' });
        setIsSubmitting(false);
        return;
      }

      // If valid, synthesize standard order tracking document
      const randomId = 'QUX-' + Math.floor(100000 + Math.random() * 900000);
      const deliveryDays = shippingMethod === 'express' ? 1 : 3;
      const expectedDate = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      const resolvedPaymentMethodString = () => {
        switch (paymentMethod) {
          case 'card': return 'Paystack Card Pre-Paid';
          case 'bank_transfer': return 'Bank Transfer Pre-Paid';
          case 'mobile_money': return 'OPay / Paga Mobile Money';
          default: return 'Cash on Delivery';
        }
      };

      const newOrder: Order = {
        id: randomId,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        items: [...cart],
        totalPrice: grandTotal,
        status: 'Pending',
        deliveryAddress: `${address}, ${city}, Lagos State, Nigeria`,
        paymentMethod: resolvedPaymentMethodString(),
        expectedDelivery: expectedDate,
        customerEmail: email || currentUser?.email || 'guest@gmail.com',
        customerName: fullName,
        customerPhone: phone,
        city,
        state,
        postalCode,
        country,
        orderNotes,
        shippingMethod,
        shippingFee,
        discountCode: appliedCoupon || undefined,
        discountAmount,
        taxAmount,
        subtotal,
        grandTotal,
        statusTimestamps: {
          'Pending': new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })
        }
      };

      // Push real verified order document directly into Firestore db via callback
      await onPlaceOrder(newOrder);
      
      setPlacedOrderId(randomId);
      setPlacedExpectedDelivery(expectedDate);
      setStep('success');
      onClearCart();
      
    } catch (err: any) {
      console.error('Checkout submit failure:', err);
      setErrors({ submit: 'A communication error occurred with the merchant gateway. Please try saving again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNaira = (amount: number) => '₦' + amount.toLocaleString('en-NG');

  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center" id="checkout-view-empty">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-xl max-w-lg mx-auto shadow-sm"
        >
          <div className="bg-[#f5f3ff] dark:bg-neutral-800 text-[#7c3aed] p-5 rounded-full inline-block mb-4 shadow-inner">
            <Truck className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-2 font-display">Your Checkout Cart is Empty!</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
            Please back out and search through Quxba marketplace categories (like electronics, devices or beauty products) to add goods before checking out.
          </p>
          <button
            onClick={() => onToggleView('storefront')}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs py-3 px-6 rounded-md uppercase tracking-wider transition duration-150 cursor-pointer"
          >
            Go back to marketplace
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`transition-colors duration-300 ${isDarkMode ? 'dark bg-neutral-950 text-neutral-100' : 'bg-gray-100 text-gray-900'}`} id="checkout-view-root">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 font-sans">
        
        {/* Upper Brand Info & Dark Mode Toggle Row */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-neutral-800 pb-4">
          <div className="text-left">
            <span className="text-[9px] bg-purple-100 dark:bg-neutral-800 text-[#7c3aed] dark:text-[#a78bfa] border border-purple-250 dark:border-neutral-700 font-black px-2 py-0.5 rounded uppercase tracking-widest block w-fit">
              🔒 Ultra secure 256-bit gateway
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1 text-gray-900 dark:text-gray-100 font-display">
              QUXBA ANNIVERSARY SECURE CHECKOUT
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark & light visual preset button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="md:flex items-center gap-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 py-1.5 px-3 rounded-full text-xs font-bold shadow-xs hover:bg-gray-50 dark:hover:bg-neutral-800 transition cursor-pointer select-none text-neutral-700 dark:text-neutral-300"
              title="Toggle checkout styling presentation preset"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Light checkout</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden sm:inline">Theme Preview</span>
                </>
              )}
            </button>
            
            <button 
              onClick={() => onToggleView('storefront')}
              className="text-xs font-bold text-gray-500 hover:text-[#7c3aed] flex items-center gap-1 cursor-pointer bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 py-1.5 px-3 rounded-full"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back Shop</span>
            </button>
          </div>
        </div>

        {/* Dynamic content rendering */}
        {step === 'success' ? (
          /* SUCCESS SCREEN DISPLAY */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center shadow-xl font-sans"
            id="checkout-success-container"
          >
            <div className="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 p-6 rounded-full inline-block mb-6 shadow-inner animate-pulse">
              <CheckCircle2 className="w-16 h-16 stroke-[2.5]" />
            </div>

            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight font-display uppercase">
              Thank you for your order!
            </h2>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-extrabold mt-1 uppercase tracking-widest">
              ✓ Securely saved & verified by Lagos dispatch
            </p>

            {/* Simulated order info placard */}
            <div className="bg-gray-50 dark:bg-neutral-800/50 p-6 rounded-xl border border-gray-200 dark:border-neutral-850 my-6 text-left space-y-3 font-sans">
              <div className="flex justify-between items-center text-xs border-b border-gray-200 dark:border-neutral-800 pb-2">
                <span className="text-neutral-400 dark:text-neutral-400 uppercase tracking-widest font-bold">Order reference:</span>
                <span className="font-mono text-purple-600 dark:text-purple-400 font-extrabold text-sm select-all">{placedOrderId}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-gray-200 dark:border-neutral-800 pb-2">
                <span className="text-neutral-400 dark:text-neutral-400 uppercase tracking-widest font-bold">Courier tracking window:</span>
                <span className="text-gray-800 dark:text-neutral-200 font-bold">{placedExpectedDelivery}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-gray-200 dark:border-neutral-800 pb-2">
                <span className="text-neutral-400 dark:text-neutral-400 uppercase tracking-widest font-bold">Pre-calculated Grand Total:</span>
                <span className="text-neutral-900 dark:text-neutral-50 font-black text-sm">{formatNaira(grandTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 dark:text-neutral-400 uppercase tracking-widest font-bold">Saved address state:</span>
                <span className="text-gray-800 dark:text-neutral-200 font-semibold truncate max-w-xs">{address} ({city})</span>
              </div>
            </div>

            <p className="text-[12.5px] text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg mx-auto font-sans">
              A dispatcher will transmit a secure order ping. Standard processing delivers package parcels within Lagos State within 24-48 working hours. For logistics inquiries, call <strong>+234 1 888 0900</strong> or write our admin helpline.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 w-full">
              <button
                onClick={() => {
                  onToggleView('orders');
                }}
                className="w-full sm:w-auto bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-3 px-8 rounded-lg text-xs uppercase tracking-wider shadow transition duration-150 cursor-pointer font-sans"
              >
                Track Live Packages
              </button>
              <button
                onClick={() => {
                  onToggleView('storefront');
                }}
                className="w-full sm:w-auto bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-750 text-gray-700 dark:text-neutral-300 font-bold py-3 px-8 rounded-lg text-xs uppercase tracking-wider transition duration-150 cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        ) : (
          /* PRIMARY CHECKOUT WIZARD LAYOUT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT 7 COLUMNS: Customer Steps Wizard Form and details */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* COMPONENT STEPS PROGRESS INDICATOR */}
              <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-4 rounded-xl shadow-xs">
                <div className="flex justify-between items-center max-w-xl mx-auto flex-nowrap overflow-x-auto text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center py-2">
                  
                  {/* Step 1 indicator */}
                  <div className={`flex items-center gap-1.5 shrink-0 ${step === 'info' ? 'text-[#7c3aed] dark:text-[#a78bfa]' : 'text-gray-400'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border font-mono text-[10px] ${step === 'info' ? 'bg-[#7c3aed] border-[#7c3aed] text-white' : 'border-gray-300'}`}>
                      1
                    </span>
                    <span className="hidden xs:inline">Info</span>
                  </div>

                  <span className="h-0.5 bg-gray-200 dark:bg-neutral-800 flex-1 mx-2 min-w-[20px]" />

                  {/* Step 2 indicator */}
                  <div className={`flex items-center gap-1.5 shrink-0 ${step === 'shipping' ? 'text-[#7c3aed] dark:text-[#a78bfa]' : 'text-gray-400'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border font-mono text-[10px] ${step === 'shipping' ? 'bg-[#7c3aed] border-[#7c3aed] text-white' : 'border-gray-300'}`}>
                      2
                    </span>
                    <span className="hidden xs:inline">Shipping</span>
                  </div>

                  <span className="h-0.5 bg-gray-200 dark:bg-neutral-800 flex-1 mx-2 min-w-[20px]" />

                  {/* Step 3 indicator */}
                  <div className={`flex items-center gap-1.5 shrink-0 ${step === 'payment' ? 'text-[#7c3aed] dark:text-[#a78bfa]' : 'text-gray-400'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border font-mono text-[10px] ${step === 'payment' ? 'bg-[#7c3aed] border-[#7c3aed] text-white' : 'border-gray-300'}`}>
                      3
                    </span>
                    <span className="hidden xs:inline">Payment</span>
                  </div>

                  <span className="h-0.5 bg-gray-200 dark:bg-neutral-800 flex-1 mx-2 min-w-[20px]" />

                  {/* Step 4 indicator */}
                  <div className={`flex items-center gap-1.5 shrink-0 ${step === 'review' ? 'text-[#7c3aed] dark:text-[#a78bfa]' : 'text-gray-400'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border font-mono text-[10px] ${step === 'review' ? 'bg-[#7c3aed] border-[#7c3aed] text-white' : 'border-gray-300'}`}>
                      4
                    </span>
                    <span className="hidden xs:inline">Review</span>
                  </div>

                </div>
              </div>

              {/* CARD BLOCK FOR DATA INPUT BASED ON STEP */}
              <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 rounded-xl shadow-sm text-left">
                
                <AnimatePresence mode="wait">
                  
                  {/* STEP 1: CUSTOMER GENERAL CONTACT DATA */}
                  {step === 'info' && (
                    <motion.div
                      key="info-fields-step"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      className="space-y-4"
                    >
                      <div className="border-b border-gray-100 dark:border-neutral-850 pb-3 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-[#7c3aed]" />
                        <div>
                          <h3 className="text-base font-black text-gray-900 dark:text-neutral-50 uppercase tracking-tight font-display">Customer Contact Details</h3>
                          <p className="text-[11px] text-gray-500">Provide active identity matching details for the dispatch logbook.</p>
                        </div>
                      </div>

                      <div className="space-y-1 block">
                        <label className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-wider block">Full Name (First and Last Name) *</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => {
                              setFullName(e.target.value);
                              if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                            }}
                            placeholder="e.g. Babajide Kolawole"
                            className={`w-full bg-transparent border ${errors.fullName ? 'border-red-500' : 'border-gray-250 dark:border-neutral-800'} p-3 pl-10 text-xs font-semibold rounded-lg focus:ring-1 focus:ring-[#7c3aed] focus:outline-none dark:text-white`}
                            id="field-fullname"
                          />
                          <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                        {errors.fullName && <p className="text-red-500 text-[10px] font-black mt-1">⚠️ {errors.fullName}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 block">
                          <label className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-wider block">Email Address *</label>
                          <div className="relative">
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                              }}
                              placeholder="e.g. customer@domain.ng"
                              className={`w-full bg-transparent border ${errors.email ? 'border-red-500' : 'border-gray-250 dark:border-neutral-800'} p-3 pl-10 text-xs font-semibold rounded-lg focus:ring-1 focus:ring-[#7c3aed] focus:outline-none dark:text-white`}
                              id="field-email"
                            />
                            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                          </div>
                          {errors.email && <p className="text-red-500 text-[10px] font-black mt-1">⚠️ {errors.email}</p>}
                        </div>

                        <div className="space-y-1 block">
                          <label className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-wider block">Phone Number (Rider OTP Call) *</label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={phone}
                              onChange={(e) => {
                                setPhone(e.target.value);
                                if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                              }}
                              placeholder="e.g. 08123456789"
                              className={`w-full bg-transparent border ${errors.phone ? 'border-red-500' : 'border-gray-250 dark:border-neutral-800'} p-3 pl-10 text-xs font-semibold rounded-lg focus:ring-1 focus:ring-[#7c3aed] focus:outline-none dark:text-white`}
                              id="field-phone"
                            />
                            <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                          </div>
                          {errors.phone && <p className="text-red-500 text-[10px] font-black mt-1">⚠️ {errors.phone}</p>}
                        </div>
                      </div>

                      {/* Info Persist Option & GDPR Check */}
                      <div className="pt-4 border-t border-gray-100 dark:border-neutral-850 space-y-3 font-sans">
                        <label className="flex gap-2.5 items-start cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={saveInfo}
                            onChange={(e) => setSaveInfo(e.target.checked)}
                            className="mt-0.5 border-gray-300 rounded text-[#7c3aed] focus:ring-0 cursor-pointer"
                          />
                          <span className="text-[11px] text-gray-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition font-medium">
                            📁 Save customer details locally on this device to skip form typing next time.
                          </span>
                        </label>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          type="button"
                          onClick={() => handleProceed('shipping')}
                          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-extrabold text-xs py-3 px-6 rounded-lg uppercase tracking-wider transition flex items-center gap-1.5 shadow active:scale-98 cursor-pointer font-sans"
                        >
                          <span>Proceed to Delivery</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: SHIPPING CONFIGURATION */}
                  {step === 'shipping' && (
                    <motion.div
                      key="shipping-fields-step"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      className="space-y-4"
                    >
                      <button
                        type="button"
                        onClick={() => setStep('info')}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-violet-400 font-bold mb-4 bg-transparent outline-none border-0 cursor-pointer"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Go back to Contact</span>
                      </button>

                      <div className="border-b border-gray-100 dark:border-neutral-850 pb-3 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#7c3aed]" />
                        <div>
                          <h3 className="text-base font-black text-gray-900 dark:text-neutral-50 uppercase tracking-tight font-display">Lagos State Home Delivery</h3>
                          <p className="text-[11px] text-gray-500">Currently servicing verified addresses inside the metropolitan area of Lagos only.</p>
                        </div>
                      </div>

                      {/* Smart Address Query Suggestion Search Box */}
                      <div className="space-y-1 block relative">
                        <label className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider block">⚡ Auto-Fill Address Autocomplete (Lagos Streets/Zones)</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={addressQuery}
                            onChange={(e) => {
                              setAddressQuery(e.target.value);
                              setShowAddressDropdown(true);
                            }}
                            onFocus={() => setShowAddressDropdown(true)}
                            placeholder="Start typing area (e.g. Lekki, Ikoyi, Ikeja, Yaba...)"
                            className="w-full bg-violet-50/50 dark:bg-neutral-850 border border-purple-200 dark:border-neutral-800 p-3 pl-10 text-xs font-semibold rounded-lg focus:ring-1 focus:ring-[#7c3aed] focus:outline-none dark:text-white"
                          />
                          <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-purple-600 dark:text-[#a78bfa]" />
                        </div>
                        
                        {/* Lagos Autocompleter Dropdown results list */}
                        {showAddressDropdown && filteredNeighborhoods.length > 0 && (
                          <div className="absolute left-0 right-0 top-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 mt-1 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-gray-100 dark:divide-neutral-855 animate-fade-in">
                            {filteredNeighborhoods.map((n) => (
                              <div
                                key={n.postalCode}
                                onClick={() => handleSelectNeighborhood(n)}
                                className="px-4 py-2.5 cursor-pointer hover:bg-purple-50 dark:hover:bg-neutral-800 transition text-left flex items-start gap-2.5"
                              >
                                <span className="bg-purple-100 dark:bg-neutral-800 text-[#7c3aed] dark:text-[#a78bfa] text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded leading-none mt-0.5 shrink-0 select-none">
                                  {n.area}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-xs text-neutral-800 dark:text-neutral-200 font-bold truncate">{n.description}</p>
                                  <p className="text-[10px] text-gray-400">Postal Zone Code: {n.postalCode}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Manual input Address field */}
                      <div className="space-y-1 block">
                        <label className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-wider block">Exact Apartment Street Delivery Address *</label>
                        <textarea
                          rows={2}
                          required
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value);
                            if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
                          }}
                          placeholder="e.g. Flat 3B, Plot 12, Adeola Hopewell Street, Victoria Island"
                          className={`w-full bg-transparent border ${errors.address ? 'border-red-500' : 'border-gray-250 dark:border-neutral-800'} p-3 text-xs font-semibold rounded-lg focus:ring-1 focus:ring-[#7c3aed] focus:outline-none dark:text-white`}
                        />
                        {errors.address && <p className="text-red-500 text-[10px] font-black mt-1">⚠️ {errors.address}</p>}
                      </div>

                      {/* City, State, Postal Code, Country alignment grids */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1 block col-span-2 md:col-span-1">
                          <label className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-wider block">City / District *</label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => {
                              setCity(e.target.value);
                              if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
                            }}
                            placeholder="e.g. Victoria Island"
                            className={`w-full bg-transparent border ${errors.city ? 'border-red-500' : 'border-gray-250 dark:border-neutral-800'} p-3 text-xs font-semibold rounded-lg focus:ring-1 focus:ring-[#7c3aed] focus:outline-none dark:text-white`}
                          />
                          {errors.city && <p className="text-red-500 text-[10px] font-black mt-1">⚠️ {errors.city}</p>}
                        </div>

                        <div className="space-y-1 block">
                          <label className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-wider block">State/Region *</label>
                          <input
                            type="text"
                            disabled
                            value={state}
                            className="w-full bg-gray-50 dark:bg-neutral-850 border border-gray-200 dark:border-neutral-800/80 p-3 text-xs font-extrabold text-neutral-500 rounded-lg outline-none select-none"
                          />
                        </div>

                        <div className="space-y-1 block">
                          <label className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-wider block">Postal Code *</label>
                          <input
                            type="text"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            placeholder="e.g. 101241"
                            className="w-full bg-transparent border border-gray-250 dark:border-neutral-800 p-3 text-xs font-semibold rounded-lg focus:ring-1 focus:ring-[#7c3aed] focus:outline-none dark:text-white"
                          />
                        </div>

                        <div className="space-y-1 block col-span-2 md:col-span-1">
                          <label className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-wider block">Country *</label>
                          <input
                            type="text"
                            disabled
                            value={country}
                            className="w-full bg-gray-50 dark:bg-neutral-850 border border-gray-200 dark:border-neutral-800/80 p-3 text-xs font-extrabold text-neutral-500 rounded-lg outline-none select-none"
                          />
                        </div>
                      </div>

                      {/* Optional delivery notes */}
                      <div className="space-y-1 block">
                        <label className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-wider block">Order Dispatch Notes (Optional)</label>
                        <input
                          type="text"
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          placeholder="e.g. Ring phone first or drop with secure estate security gatehouse desk"
                          className="w-full bg-transparent border border-gray-250 dark:border-neutral-800 p-3 text-xs font-semibold rounded-lg focus:ring-1 focus:ring-[#7c3aed] focus:outline-none dark:text-white"
                        />
                      </div>

                      {/* Premium Courier Options Selection */}
                      <div className="pt-4 border-t border-gray-100 dark:border-neutral-850 text-left">
                        <label className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-wider block mb-2">Select Shipping Logistics Method</label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => setShippingMethod('standard')}
                            className={`border p-3.5 rounded-lg text-left transition relative flex flex-col justify-between h-28 cursor-pointer ${shippingMethod === 'standard' ? 'border-[#7c3aed] bg-purple-50/50 dark:bg-purple-950/20' : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-850'}`}
                          >
                            <div className="flex items-center gap-1.5 font-extrabold text-xs text-neutral-800 dark:text-neutral-100">
                              <Truck className="w-4 h-4 text-purple-600" />
                              <span>Quxba Standard</span>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-neutral-400 leading-snug">Average home transit in 2 to 3 days.</p>
                            <span className="text-xs font-black text-[#7c3aed] dark:text-[#a78bfa] block mt-1">₦1,500</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShippingMethod('express')}
                            className={`border p-3.5 rounded-lg text-left transition relative flex flex-col justify-between h-28 cursor-pointer ${shippingMethod === 'express' ? 'border-[#7c3aed] bg-purple-50/50 dark:bg-purple-950/20' : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-850'}`}
                          >
                            <div className="absolute top-2.5 right-2.5 bg-purple-100 dark:bg-purple-900 text-[#7c3aed] dark:text-purple-200 text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded leading-none select-none uppercase">
                              FASTEST
                            </div>
                            <div className="flex items-center gap-1.5 font-extrabold text-xs text-neutral-800 dark:text-neutral-100">
                              <Truck className="w-4 h-4 text-purple-600 animate-bounce" />
                              <span>Lagos rocket express</span>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-neutral-400 leading-snug">Same-day delivery under 24 hours.</p>
                            <span className="text-xs font-black text-[#7c3aed] dark:text-[#a78bfa] block mt-1">₦3,500</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShippingMethod('pickup')}
                            className={`border p-3.5 rounded-lg text-left transition relative flex flex-col justify-between h-28 cursor-pointer ${shippingMethod === 'pickup' ? 'border-[#7c3aed] bg-purple-50/50 dark:bg-purple-950/20' : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-850'}`}
                          >
                            <div className="flex items-center gap-1.5 font-extrabold text-xs text-neutral-800 dark:text-neutral-100">
                              <MapPin className="w-4 h-4 text-purple-600" />
                              <span>Hub self pick-up</span>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-neutral-400 leading-snug">Collect directly from Ikeja Hub Station.</p>
                            <span className="text-xs font-black text-[#7c3aed] dark:text-[#a78bfa] block mt-1">₦500</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          type="button"
                          onClick={() => handleProceed('payment')}
                          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-extrabold text-xs py-3 px-6 rounded-lg uppercase tracking-wider transition flex items-center gap-1.5 shadow active:scale-98 cursor-pointer font-sans"
                        >
                          <span>Proceed to Payment</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: PAYMENT GATEWAY CHANNELS */}
                  {step === 'payment' && (
                    <motion.div
                      key="payment-selection-step"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      className="space-y-4"
                    >
                      <button
                        type="button"
                        onClick={() => setStep('shipping')}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-purple-400 font-bold mb-4 bg-transparent outline-none border-0 cursor-pointer"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Go back to Delivery</span>
                      </button>

                      <div className="border-b border-gray-100 dark:border-neutral-850 pb-3 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#7c3aed]" />
                        <div>
                          <h3 className="text-base font-black text-gray-900 dark:text-neutral-50 uppercase tracking-tight font-display">Secure Payment Gateways</h3>
                          <p className="text-[11px] text-gray-500">Choose your preferred transaction settlement mode.</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* Option 1: Card via Paystack */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`w-full border p-4 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${paymentMethod === 'card' ? 'border-[#7c3aed] bg-purple-50/50 dark:bg-purple-950/20' : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-850'}`}
                        >
                          <div className="flex items-start gap-3">
                            <CreditCard className="w-5 h-5 text-purple-650 mt-1 shrink-0" />
                            <div>
                              <span className="font-extrabold text-xs text-neutral-800 dark:text-neutral-100 block">Secure Card Payment (Online Checkout)</span>
                              <span className="text-[10px] text-gray-500 dark:text-neutral-400 block mt-0.5">Supports Mastercard, Visa, Verve & Quick Access Codes. processed securely by Paystack.</span>
                            </div>
                          </div>
                          <span className="bg-purple-100 dark:bg-purple-900 text-[#7c3aed] dark:text-purple-200 text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0 hidden sm:inline-block">
                            RECOMMENDED
                          </span>
                        </button>

                        {/* Option 2: Bank Transfer */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('bank_transfer')}
                          className={`w-full border p-4 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${paymentMethod === 'bank_transfer' ? 'border-[#7c3aed] bg-purple-50/50 dark:bg-purple-950/20' : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-850'}`}
                        >
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-blue-650 mt-1 shrink-0" />
                            <div>
                              <span className="font-extrabold text-xs text-neutral-800 dark:text-neutral-100 block">Instant Bank Transfer Settlement</span>
                              <span className="text-[10px] text-gray-500 dark:text-neutral-400 block mt-0.5">Transfer directly to Quxba escrow account. Instant verification upon completion.</span>
                            </div>
                          </div>
                        </button>

                        {/* Option 3: Mobile money */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('mobile_money')}
                          className={`w-full border p-4 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${paymentMethod === 'mobile_money' ? 'border-[#7c3aed] bg-purple-50/50 dark:bg-purple-950/20' : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-850'}`}
                        >
                          <div className="flex items-start gap-3">
                            <Lock className="w-5 h-5 text-indigo-655 mt-1 shrink-0" />
                            <div>
                              <span className="font-extrabold text-xs text-neutral-800 dark:text-neutral-100 block">OPay, Palmpay & Paga Wallet Transfer</span>
                              <span className="text-[10px] text-gray-500 dark:text-neutral-400 block mt-0.5">Pay via fast digital wallets with premium safety.</span>
                            </div>
                          </div>
                        </button>

                        {/* Option 4: COD */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className={`w-full border p-4 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${paymentMethod === 'cod' ? 'border-[#7c3aed] bg-purple-50/50 dark:bg-purple-950/20' : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-850'}`}
                        >
                          <div className="flex items-start gap-3">
                            <Truck className="w-5 h-5 text-gray-650 mt-1 shrink-0 animate-pulse" />
                            <div>
                              <span className="font-extrabold text-xs text-neutral-800 dark:text-neutral-100 block">Cash or POS on Delivery (Nigeria Only)</span>
                              <span className="text-[10px] text-gray-500 dark:text-neutral-400 block mt-0.5">Inspect your catalog items live before making payment. Cash or POS credit cards accepted.</span>
                            </div>
                          </div>
                        </button>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          type="button"
                          onClick={() => handleProceed('review')}
                          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-extrabold text-xs py-3 px-6 rounded-lg uppercase tracking-wider transition flex items-center gap-1.5 shadow active:scale-98 cursor-pointer font-sans"
                        >
                          <span>Review Full Order</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: SUMMARY & GDPR CONSENT RULINGS */}
                  {step === 'review' && (
                    <motion.div
                      key="review-fields-step"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      className="space-y-4"
                    >
                      <button
                        type="button"
                        onClick={() => setStep('payment')}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-purple-400 font-bold mb-4 bg-transparent outline-none border-0 cursor-pointer"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Go back to Payment</span>
                      </button>

                      <div className="border-b border-gray-100 dark:border-neutral-850 pb-3 mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#7c3aed]" />
                        <div>
                          <h3 className="text-base font-black text-gray-900 dark:text-neutral-50 uppercase tracking-tight font-display">Confirm & Place Purchase Order</h3>
                          <p className="text-[11px] text-gray-500">Confirm all registered details before triggering instant dispatch packaging.</p>
                        </div>
                      </div>

                      {/* Display grid summarizing all input choices */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-neutral-850 p-4 rounded-xl border border-gray-205 dark:border-neutral-800 text-xs font-sans">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block leading-none">Customer Identity</span>
                          <p className="font-extrabold text-neutral-800 dark:text-neutral-200">{fullName}</p>
                          <p className="text-neutral-600 dark:text-neutral-400">{email} · {phone}</p>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block leading-none">Shipping Destination</span>
                          <p className="font-extrabold text-neutral-800 dark:text-neutral-200 truncate">{address}</p>
                          <p className="text-neutral-600 dark:text-neutral-400">{city}, Lagos State, {country}</p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-gray-200 dark:border-neutral-800 md:col-span-2 grid grid-cols-2">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Logistics Courier Method</span>
                            <span className="font-extrabold text-purple-700 dark:text-purple-300 uppercase block mt-1">
                              {shippingMethod === 'express' ? 'Lagos rocket express (Same day)' : shippingMethod === 'pickup' ? 'Hub Pick-up' : 'Standard 2-3 Days'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Settlement Gateway</span>
                            <span className="font-extrabold text-[#7c3aed] dark:text-[#a78bfa] uppercase block mt-1">
                              {paymentMethod.toUpperCase().replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        {orderNotes && (
                          <div className="pt-2 border-t border-gray-200 dark:border-neutral-800 md:col-span-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Dispatch Instructions:</span>
                            <p className="italic text-gray-650 dark:text-neutral-300 mt-0.5 font-medium">"{orderNotes}"</p>
                          </div>
                        )}
                      </div>

                      {/* GDPR Consent Requirements */}
                      <div className="space-y-3 pt-2">
                        <label className="flex gap-2.5 items-start cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={privacyConsent}
                            onChange={(e) => {
                              setPrivacyConsent(e.target.checked);
                              if (errors.privacyConsent) setErrors(prev => { const c = { ...prev }; delete c.privacyConsent; return c; });
                            }}
                            className="mt-0.5 border-gray-300 rounded text-[#7c3aed] focus:ring-0 cursor-pointer"
                          />
                          <span className="text-[11px] text-gray-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition leading-snug">
                            🛡️ <strong>GDPR Consent:</strong> I authorize Quxba and its third-party dispatch partners to use these details representation to coordinate delivery. My secure PII claims will not be shared with outside spam marketers.
                          </span>
                        </label>
                        {errors.privacyConsent && <p className="text-red-500 text-[10px] font-black">⚠️ {errors.privacyConsent}</p>}
                      </div>

                      {/* General Submit Error Placeholder */}
                      {errors.submit && (
                        <div className="bg-red-50 dark:bg-neutral-800/50 text-red-600 dark:text-red-400 border border-red-200 p-3 rounded-lg text-xs leading-relaxed font-semibold">
                          ⚠️ {errors.submit}
                        </div>
                      )}

                      {/* Final Place Button containing active loading spin */}
                      <div className="pt-4 border-t border-gray-100 dark:border-neutral-850">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={handlePlaceSecureOrder}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-850 text-white font-black text-sm py-4 rounded-xl uppercase tracking-wider transition shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                          id="btn-place-secure-order"
                        >
                          {isSubmitting ? (
                            <>
                              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-1" />
                              <span>Enforcing secure transactions & double checks...</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              <span>Place validated escrow Order ({formatNaira(grandTotal)})</span>
                            </>
                          )}
                        </button>
                        <p className="text-[9.5px] text-center text-gray-400 dark:text-neutral-500 mt-2 font-mono">
                          Secure payment guarantees by CBN regulated merchant escrow guidelines.
                        </p>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>

              </div>
            </div>

            {/* RIGHT SIDEBAR (5 COLUMNS): Elegant Cart Breakdown Math and item list */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* CART OVERVIEW LIST */}
              <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 rounded-xl shadow-sm text-left">
                <span className="text-[10px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest block font-sans">
                  📦 Checkout Item Summary ({cart.length})
                </span>

                <div className="divide-y divide-gray-100 dark:divide-neutral-850 max-h-56 overflow-y-auto mt-4 pr-1">
                  {cart.map((item, id) => {
                    const resolvedPrice = getCartItemPrice(item);
                    return (
                      <div key={item.product.id + '-' + id} className="py-3 flex gap-3 items-start font-sans">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-12 h-12 object-contain rounded border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-850 p-1 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-gray-800 dark:text-neutral-200 truncate">{item.product.name}</h4>
                          <p className="text-[10px] text-gray-400 dark:text-neutral-500 truncate">Seller: {item.product.sellerName}</p>
                          
                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {Object.entries(item.selectedOptions).map(([key, val]) => (
                                <span key={key} className="text-[8px] font-black bg-gray-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-1 py-0.5 rounded uppercase leading-none border border-gray-200/50 dark:border-neutral-750">
                                  {key}: {val}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-1.5 leading-none">
                            <span className="text-[11px] text-gray-500 dark:text-neutral-400 font-semibold">Qty: {item.quantity}</span>
                            <span className="text-xs font-bold text-[#7c3aed] dark:text-[#a78bfa]">{formatNaira(resolvedPrice * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MATHEMATICAL TOTAL BREAKDOWNS & ACTIVE PROMO CODES */}
              <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 rounded-xl shadow-sm text-left">
                
                {/* Apply Coupon input field */}
                <span className="text-[10px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest block font-sans">
                  🎟️ Apply Store Promotional Coupon
                </span>
                
                {appliedCoupon ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/55 p-3.5 rounded-lg text-xs flex justify-between items-center my-3">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <p className="font-extrabold text-emerald-700 dark:text-emerald-300">Active Code: {appliedCoupon}</p>
                        <p className="text-[10.5px] text-emerald-600 dark:text-emerald-405 font-medium">- ₦{couponDiscount.toLocaleString()} saved</p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-500 hover:text-red-700 font-black text-[10px] uppercase transition cursor-pointer bg-transparent outline-none border-0"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-3 font-sans">
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="e.g. QUXBA50"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="bg-transparent border border-gray-250 dark:border-neutral-800 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#7c3aed] focus:outline-none dark:text-white flex-1 font-semibold"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs px-4 rounded-lg font-bold tracking-wider transition active:scale-95 cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                )}

                {couponError && <p className="text-red-500 text-[10px] font-black mt-1 font-sans">⚠️ {couponError}</p>}
                {couponSuccess && <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black mt-1 font-sans">✓ {couponSuccess}</p>}

                {/* Mathematical price ledger */}
                <div className="space-y-2.5 text-xs text-neutral-500 dark:text-neutral-400 mt-6 pt-4 border-t border-gray-100 dark:border-neutral-850">
                  
                  <div className="flex justify-between items-center">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-gray-800 dark:text-neutral-100">{formatNaira(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <span>Logistics Delivery Fee</span>
                      <HelpCircle className="w-3 h-3 text-neutral-400" title="Based on standard shipping, express courier, or pick-up choices" />
                    </span>
                    <span className="font-bold text-gray-800 dark:text-neutral-100">{formatNaira(shippingFee)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-extrabold">
                      <span>Promotional Discount Coupon</span>
                      <span>- {formatNaira(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <span>Nigeria VAT (7.5%)</span>
                    </span>
                    <span className="font-bold text-gray-800 dark:text-neutral-100">{formatNaira(taxAmount)}</span>
                  </div>

                  {/* Grand final mathematically calculated sum */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-250 dark:border-neutral-800 text-neutral-950 dark:text-neutral-50">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-[#7c3aed] dark:text-[#a78bfa]">Escrow Gross Total</span>
                    <span className="text-lg font-black tracking-tight font-display">{formatNaira(grandTotal)}</span>
                  </div>

                </div>

                {/* Return logistics security policy */}
                <div className="bg-[#fffbeb] dark:bg-amber-950/20 border border-amber-250/50 dark:border-amber-900/40 p-4 rounded-xl text-[10.5px] text-amber-800 dark:text-amber-400 leading-relaxed font-semibold mt-6">
                  📢 <strong>Inspection & Escrow Safe Guarantee:</strong> Inspect all electronics or equipment live upon arrival. If they do not match specifications, reject it free of charge with the rider for a prompt refunds!
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
