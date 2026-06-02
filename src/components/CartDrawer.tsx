import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, CreditCard, CheckCircle2, Truck, ArrowLeft, Percent, MapPin } from 'lucide-react';
import { CartItem, Product, Order, UserAccount } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (pId: string, qty: number, selectedOptions?: Record<string, string>) => void;
  onRemove: (pId: string, selectedOptions?: Record<string, string>) => void;
  onClearCart: () => void;
  onPlaceOrder: (order: Order) => void;
  onToggleView: (view: 'storefront' | 'orders' | 'checkout') => void;
  currentUser: UserAccount | null;
  onOpenAuthModal: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemove,
  onClearCart,
  onPlaceOrder,
  onToggleView,
  currentUser,
  onOpenAuthModal
}: CartDrawerProps) {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  
  // Shipping details state
  const [address, setAddress] = useState('14/16 Adeola Hopewell Street, Victoria Island');
  const [city, setCity] = useState('Lagos');
  const [phone, setPhone] = useState('+234 812 345 6789');
  const [deliveryMethod, setDeliveryMethod] = useState<'express' | 'pickup'>('express');
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'cod'>('paystack');

  // Geolocation automatic detection states
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  useEffect(() => {
    if (checkoutStep === 'shipping' && navigator.geolocation) {
      setIsDetectingLocation(true);
      setLocationStatus('Automatically detecting your coordinates...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocationStatus(`Successfully pinned: ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`);
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`, {
              headers: {
                'Accept-Language': 'en'
              }
            });
            if (response.ok) {
              const data = await response.json();
              const detectedCity = data.address.city || data.address.town || data.address.suburb || data.address.county || 'Lagos';
              const detectedState = data.address.state || 'Lagos State';
              const country = data.address.country || 'Nigeria';
              
              setCity(`${detectedCity}, ${detectedState}`);
              
              const street = data.address.road || data.address.suburb || data.address.neighbourhood || '';
              if (street) {
                setAddress(`${street}, ${detectedCity}, ${detectedState}, ${country}`);
              } else {
                setAddress(`Coordinates (${latitude.toFixed(5)}, ${longitude.toFixed(5)}), ${detectedCity}`);
              }
            } else {
              setCity('Lagos, Lagos State');
              setAddress(`Coordinate Point (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);
            }
          } catch (err) {
            console.error('Reverse geocode error:', err);
            setCity('Lagos, Lagos State');
            setAddress(`GPS Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`);
          } finally {
            setIsDetectingLocation(false);
          }
        },
        (error) => {
          console.warn('Geolocation access declined or unavailable:', error.message);
          setIsDetectingLocation(false);
          setLocationStatus('Using saved checkout address');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [checkoutStep]);

  if (!isOpen) return null;

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

  const subtotal = cart.reduce((acc, item) => acc + (getCartItemPrice(item) * item.quantity), 0);
  const deliveryFee = deliveryMethod === 'express' ? 4500 : 1200;
  const grandTotal = subtotal + deliveryFee - discountAmount;

  const applyPromo = () => {
    const code = couponCode.toUpperCase();
    if (code === 'QUXBA50') {
      setDiscountAmount(5000);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon! Try "QUXBA50" for ₦5,000 off.');
    }
  };

  const handleCreateOrder = () => {
    const newOrder: Order = {
      id: 'QUX-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      items: [...cart],
      totalPrice: grandTotal,
      status: 'Pending',
      deliveryAddress: `${address}, ${city}`,
      paymentMethod: paymentMethod === 'paystack' ? 'Paystack Card Pre-Paid' : 'Cash on Delivery',
      expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      customerEmail: currentUser?.email || 'guest@example.com'
    };
    onPlaceOrder(newOrder);
    setCheckoutStep('success');
    onClearCart();
  };

  const formatNaira = (amount: number) => '₦' + amount.toLocaleString('en-NG');

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans" id="cart-drawer-container">
      {/* Dark Overlay with transition blur */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-slide-in">
        
        {/* Header Block */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#7c3aed]" />
            <h2 className="text-lg font-bold text-gray-800">
              {checkoutStep === 'cart' && 'Your Shopping Cart'}
              {checkoutStep === 'shipping' && 'Delivery Information'}
              {checkoutStep === 'payment' && 'Confirm & Match Payment'}
              {checkoutStep === 'success' && 'Order Placed successfully!'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-full transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Wizard Steps content */}
        {checkoutStep === 'cart' && (
          <div className="flex-1 flex flex-col justify-between overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-purple-50 text-[#7c3aed] p-5 rounded-full mb-4">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-base font-bold text-gray-800">Your cart is empty!</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">Explore Quxba anniversary sale deals and add appliances or fashion items to get started.</p>
                <button 
                  onClick={onClose}
                  className="mt-5 bg-[#7c3aed] text-white px-5 py-2.5 rounded-md font-bold text-xs hover:bg-[#6d28d9] transition"
                >
                  START SHOPPING
                </button>
              </div>
            ) : (
              <>
                {/* List Items of products */}
                <div className="p-6 divide-y divide-gray-100 overflow-y-auto max-h-[50vh]">
                  {cart.map((item, index) => {
                    const comboKey = item.selectedOptions 
                      ? `${item.product.id}_${Object.entries(item.selectedOptions).map(([k, v]) => `${k}_${v}`).join('_')}`
                      : item.product.id;
                    const resolvedPrice = getCartItemPrice(item);
                    return (
                      <div key={comboKey + '_' + index} className="py-4 flex gap-4">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          className="w-16 h-16 object-contain rounded border border-gray-100 bg-gray-50 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs md:text-sm font-semibold text-gray-800 truncate">{item.product.name}</h4>
                          <p className="text-xs text-purple-600 font-bold mt-0.5">{item.product.sellerName}</p>
                          
                          {/* Display Selected Options */}
                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <div className="flex gap-1.5 mt-1 flex-wrap">
                              {Object.entries(item.selectedOptions).map(([keyName, keyVal]) => (
                                <span key={keyName} className="text-[9px] font-black bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded tracking-wider uppercase border border-neutral-200">
                                  {keyName}: {keyVal}
                                </span>
                              ))}
                            </div>
                          )}

                          <p className="text-sm font-extrabold text-[#7c3aed] mt-1">{formatNaira(resolvedPrice)}</p>
                          
                          {/* Control Quantity Indicators */}
                          <div className="flex items-center justify-between mt-2.5">
                            <div className="flex items-center border border-gray-200 rounded-md bg-white overflow-hidden shadow-sm">
                              <button 
                                onClick={() => onUpdateQty(item.product.id, Math.max(1, item.quantity - 1), item.selectedOptions)}
                                className="px-2 py-1 hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition shadow-xs"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3 py-0.5 text-xs font-bold text-gray-800">{item.quantity}</span>
                              <button 
                                onClick={() => onUpdateQty(item.product.id, item.quantity + 1, item.selectedOptions)}
                                className="px-2 py-1 hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition shadow-xs"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button 
                              onClick={() => onRemove(item.product.id, item.selectedOptions)}
                              className="text-red-500 hover:underline flex items-center gap-1 text-xs font-semibold hover:bg-red-50/50 px-2 py-1 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal, Coupon, Checkout segment */}
                <div className="border-t border-gray-100 bg-gray-50 p-6 space-y-4">
                  
                  {/* Coupon Area */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. QUXBA50)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-white border border-gray-200 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-brand-primary"
                    />
                    <button 
                      onClick={applyPromo}
                      className="bg-gray-800 hover:bg-black text-white text-xs px-3.5 rounded font-bold transition"
                    >
                      APPLY
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-[11px] font-semibold">{couponError}</p>}
                  {discountAmount > 0 && <p className="text-green-600 text-[11px] font-bold">✓ Coupon active: ₦{discountAmount.toLocaleString()} saved!</p>}

                  {/* Summary math */}
                  <div className="space-y-2 text-xs text-gray-600 border-b border-gray-200 pb-3">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold text-gray-800 text-sm">{formatNaira(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount Coupon</span>
                        <span>-{formatNaira(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>{formatNaira(deliveryFee)}</span>
                    </div>
                  </div>

                  {/* Grand total */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-800">Total Price:</span>
                    <span className="text-xl font-extrabold text-[#7c3aed] font-display">{formatNaira(grandTotal)}</span>
                  </div>

                  <button 
                    onClick={() => {
                      onToggleView('checkout');
                      onClose();
                    }}
                    className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-3 rounded-md font-bold text-sm shadow flex items-center justify-center gap-2 transition hover:shadow-lg active:scale-98"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>PROCEED TO CHECKOUT</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Phase 2: Shipping/Delivery Info */}
        {checkoutStep === 'shipping' && (
          <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <button 
                onClick={() => setCheckoutStep('cart')}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Go back to Cart</span>
              </button>

              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2">Where should we deliver?</h3>

              {/* Delivery method toggle */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setDeliveryMethod('express')}
                  className={`border p-3 rounded-lg text-left transition ${deliveryMethod === 'express' ? 'border-[#7c3aed] bg-purple-50/50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gray-800">
                    <Truck className="w-4 h-4 text-purple-500" />
                    <span>Quxba Jet</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">Direct home delivery inside 48 hours. Max comfort.</p>
                </button>
                <button 
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`border p-3 rounded-lg text-left transition ${deliveryMethod === 'pickup' ? 'border-[#7c3aed] bg-purple-50/50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gray-800">
                    <ShoppingBag className="w-4 h-4 text-purple-500" />
                    <span>Hub Pick-Up</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">Collect from nearest station. Lowest delivery fee.</p>
                </button>
              </div>

              {/* Form Input Blocks */}
              <div className="space-y-3.5">
                {/* Geolocation Live Status Pill */}
                <div className="bg-purple-50/70 border border-purple-100 rounded-lg p-3 text-xs flex items-start gap-2.5">
                  <MapPin className={`w-4 h-4 text-purple-600 mt-0.5 ${isDetectingLocation ? 'animate-bounce' : ''}`} />
                  <div className="flex-1">
                    <span className="font-extrabold text-[10px] text-purple-750 uppercase tracking-widest block">📍 Geographic Location Sync</span>
                    <p className="text-gray-600 text-[11px] leading-snug mt-0.5">
                      {locationStatus || 'Your high-accuracy coordinates are processed automatically to map state, city, and nearest landmark.'}
                    </p>
                    {isDetectingLocation && (
                      <div className="flex items-center gap-1.5 mt-1.5 font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
                        <span className="text-[10px] text-purple-600 font-black">Connecting to satellite sensors...</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">State / City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-md px-3.5 py-2 text-sm focus:ring-1 focus:ring-brand-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Complete Street Address</label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-md px-3.5 py-2 text-sm focus:ring-1 focus:ring-brand-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Active Mobile Number (For Delivery Rider OTP/Call)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-md px-3.5 py-2 text-sm focus:ring-1 focus:ring-brand-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button 
                onClick={() => setCheckoutStep('payment')}
                className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-3 rounded-md font-bold text-sm shadow transition"
              >
                PROCEED TO PAYMENT
              </button>
            </div>
          </div>
        )}

        {/* Phase 3: Payment Choice */}
        {checkoutStep === 'payment' && (
          <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <button 
                onClick={() => setCheckoutStep('shipping')}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Go back to Shipping</span>
              </button>

              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2">Select Payment Gateway</h3>

              <div className="space-y-3">
                <button 
                  onClick={() => setPaymentMethod('paystack')}
                  className={`w-full border p-4 rounded-lg text-left transition flex items-center justify-between ${paymentMethod === 'paystack' ? 'border-[#7c3aed] bg-purple-50/50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div>
                    <span className="font-bold text-xs text-gray-800 block">Pre-paid Secure Card via Paystack</span>
                    <span className="text-[10px] text-gray-500">Supports Mastercard, Visa, Verve & Bank Transfer</span>
                  </div>
                  <span className="bg-purple-100 text-[#7c3aed] text-[10px] px-2 py-0.5 rounded-full font-extrabold font-mono">RECOMMENDED</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('cod')}
                  className={`w-full border p-4 rounded-lg text-left transition flex items-center justify-between ${paymentMethod === 'cod' ? 'border-[#7c3aed] bg-purple-50/50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div>
                    <span className="font-bold text-xs text-gray-800 block">Cash On Delivery (COD)</span>
                    <span className="text-[10px] text-gray-500">Pay securely in cash or POS on arrival of rider</span>
                  </div>
                  <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-extrabold font-mono">SECURE</span>
                </button>
              </div>

              {/* Security guarantee line */}
              <div className="p-3.5 bg-yellow-50 rounded-md border border-yellow-100 text-[11px] text-yellow-800 leading-relaxed font-semibold">
                ⚠️ IMPORTANT: Quxba guarantees 100% item safety. If you are not fully satisfied with any electronic appliance, return it instantly during delivery for an express full refund or wallet credit!
              </div>

              {/* Total review */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                  <span>Gross Total (Including Delivery):</span>
                  <span className="font-bold text-gray-800">{formatNaira(grandTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <span>Shipping Destination:</span>
                  <span className="font-bold text-gray-800">{city}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button 
                onClick={handleCreateOrder}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-bold text-sm shadow transition"
              >
                PLACE SECURE ORDER ({formatNaira(grandTotal)})
              </button>
            </div>
          </div>
        )}

        {/* Phase 4: Order Completed Success screen */}
        {checkoutStep === 'success' && (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
            <div className="bg-green-100 text-green-600 p-5 rounded-full mb-5 flash-heartbeat">
              <CheckCircle2 className="w-14 h-14" />
            </div>
            
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">E-Commerce order Placed!</h3>
            <p className="text-sm text-green-700 font-bold mt-1">Your purchase tracker is active.</p>
            
            <p className="text-xs text-gray-500 mt-4 max-w-sm leading-relaxed">
              We have dispatched a notification ping. Our dispatch partner will reach out to you at <span className="font-semibold text-gray-800">{phone}</span> to coordinate your express delivery to Adeola Hopewell Street.
            </p>

            <div className="space-y-2.5 w-full mt-8">
              <button 
                onClick={() => {
                  onClose();
                  setCheckoutStep('cart');
                  onToggleView('orders');
                }}
                className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-2.5 rounded-md text-xs font-bold transition shadow"
              >
                TRACK ORDERS LIVE
              </button>
              <button 
                onClick={() => {
                  onClose();
                  setCheckoutStep('cart');
                  onToggleView('storefront');
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-md text-xs font-bold transition"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
