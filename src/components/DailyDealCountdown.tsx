import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Flame, 
  ShoppingBag, 
  Eye, 
  Heart, 
  Sparkles, 
  Check, 
  TrendingUp, 
  Star 
} from 'lucide-react';
import { Product } from '../types';

interface DailyDealCountdownProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  wishlist: Product[];
  onToggleWishlist: (product: Product) => void;
}

export function DailyDealCountdown({
  products,
  onAddToCart,
  onSelectProduct,
  wishlist,
  onToggleWishlist
}: DailyDealCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(86400); // Default to 24 hrs
  const [claimedPercent, setClaimedPercent] = useState(74); // Interactive standard claim state
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);

  // Sync countdown to actual midnight of the current day, or fallback to standard 24h
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffSeconds = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
      setTimeLeft(diffSeconds);
    };

    updateTimer();
    const interval = setInterval(() => {
      updateTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update claim percentage occasionally to mock real-time sales progress
  useEffect(() => {
    const claimInterval = setInterval(() => {
      setClaimedPercent(prev => {
        if (prev >= 98) return 74; // Reset to loop animation naturally
        return prev + 1;
      });
    }, 45000);

    return () => clearInterval(claimInterval);
  }, []);

  // Format seconds to hours, minutes, seconds digits
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    return {
      hours: hrs.toString().padStart(2, '0'),
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0')
    };
  };

  const { hours, minutes, seconds } = formatTime(timeLeft);

  // Pick a special premium product to be the highlight of the Daily Deal.
  // We prefer items with large discounts and high ratings (e.g. smart watch, laptop, or refrigerator)
  const getDailyProduct = (): Product => {
    if (!products || products.length === 0) {
      // Fallback robust mock product in case list is not loaded yet
      return {
        id: 'daily-deal-ref-nexus',
        name: 'Nexus 250L Double Door Refrigerator - Premium Stainless Steel Accent',
        category: 'Electronics & Appliances',
        price: 385000,
        originalPrice: 480000,
        discount: 20,
        imageUrl: 'https://images.unsplash.com/photo-1571875257727-256c3a8428e8?auto=format&fit=crop&w=600&q=80',
        rating: 4.8,
        reviewsCount: 164,
        description: 'Elite home essential offering optimal cooling efficiency, custom stabilizer shield, noiseless operations and premium steel double-door frame structure.',
        stock: 12,
        sellerId: 'sell-nexus-direct',
        sellerName: 'Nexus Official Store',
        isFlashSale: true,
        brand: 'Nexus'
      };
    }

    // Try finding the item with the highest price or highest discount
    const candidates = [...products].sort((a, b) => b.discount - a.discount);
    return candidates[0] || products[0];
  };

  const specialProduct = getDailyProduct();
  const formatNaira = (amt: number) => '₦ ' + amt.toLocaleString('en-NG');
  const isInWishlist = wishlist.some(item => item.id === specialProduct.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(specialProduct);
    setIsSuccessFeedback(true);
    setTimeout(() => setIsSuccessFeedback(false), 2000);
  };

  return (
    <div 
      id="daily-deal-highlight-portal"
      className="bg-gradient-to-r from-neutral-900 via-purple-950 to-slate-900 text-white rounded-2xl border-2 border-purple-500/20 overflow-hidden shadow-xl font-sans transition-all duration-300 relative"
    >
      {/* Accent pattern background lines */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.12),transparent_60%)] pointer-events-none" />

      {/* Ribbon Banner Top */}
      <div className="bg-gradient-to-r from-indigo-600 to-[#7c3aed] px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 border-b border-purple-900/30">
        <div className="flex items-center gap-2">
          <span className="bg-yellow-400 text-neutral-950 px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase flex items-center gap-1 shadow-sm select-none animate-bounce">
            <Flame className="w-3 h-3 fill-current text-red-600" />
            <span>TOP DEAL</span>
          </span>
          <span className="text-xs font-black tracking-wide uppercase text-white flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
            <span>DAILY EXCLUSIVE OFFSHELF HIGHLIGHT</span>
          </span>
        </div>
        <div className="text-[10px] text-purple-100 font-bold flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-full">
          <span>Current Active Campaign ID:</span>
          <span className="font-mono text-yellow-300">QUXBA-DEAL-{(new Date()).getDate()}</span>
        </div>
      </div>

      <div className="p-5 md:p-6 lg:p-7 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center relative z-10">
        {/* LEFT COLUMN: HERO COUNTDOWN MODULE */}
        <div className="md:col-span-5 space-y-4 text-center md:text-left border-b md:border-b-0 md:border-r border-neutral-800 pb-5 md:pb-0 md:pr-6">
          <div className="inline-flex items-center justify-center gap-1 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-xl text-purple-300 text-xs font-bold leading-none w-fit">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>PROMO ENDS TODAY AT MIDNIGHT</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent uppercase">
              DEAL OF THE DAY
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
              Hand-picked retail essential. Active for 24 hours only with highly limited stocks. Act fast before price restores to standard.
            </p>
          </div>

          {/* Countdown Clock Grid */}
          <div className="flex items-center justify-center md:justify-start gap-2.5 py-1 select-none">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-neutral-950 border border-purple-500/30 rounded-xl flex items-center justify-center text-lg sm:text-2xl font-black text-yellow-300 shadow-md">
                {hours}
              </div>
              <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase mt-1">Hours</span>
            </div>
            
            <span className="text-lg font-black text-purple-400 animate-pulse">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-neutral-950 border border-purple-500/30 rounded-xl flex items-center justify-center text-lg sm:text-2xl font-black text-yellow-300 shadow-md">
                {minutes}
              </div>
              <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase mt-1">Minutes</span>
            </div>

            <span className="text-lg font-black text-purple-400 animate-pulse">:</span>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-neutral-950 border border-purple-500/30 rounded-xl flex items-center justify-center text-lg sm:text-2xl font-black text-red-400 shadow-md">
                {seconds}
              </div>
              <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase mt-1">Seconds</span>
            </div>
          </div>

          {/* Progress state */}
          <div className="space-y-1.5 max-w-xs mx-auto md:mx-0">
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className="text-orange-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{claimedPercent}% claimed</span>
              </span>
              <span className="text-slate-400">Limited Store Quantity</span>
            </div>
            <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden p-0.5 border border-neutral-800">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${claimedPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HIGHLIGHTED PRODUCT PRESENTATION */}
        <div 
          onClick={() => onSelectProduct(specialProduct)}
          className="md:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center cursor-pointer group"
        >
          {/* IMAGE PORTRAIT CONTROLLER */}
          <div className="sm:col-span-5 bg-white rounded-2xl p-3 aspect-square flex items-center justify-center relative overflow-hidden shadow-inner border border-neutral-800/10 group-hover:scale-[1.02] transition-transform duration-300">
            {specialProduct.discount > 0 && (
              <span className="absolute top-3 left-3 bg-red-650 text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg select-none z-10 shadow-xs animate-pulse">
                {specialProduct.discount}% OFF
              </span>
            )}
            
            <img 
              src={specialProduct.imageUrl} 
              alt={specialProduct.name}
              referrerPolicy="no-referrer"
              className="max-h-[92%] max-w-[92%] object-contain group-hover:scale-105 transition-transform duration-350"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80';
              }}
            />
          </div>

          {/* RIGHT PRODUCT DETAILS */}
          <div className="sm:col-span-7 flex flex-col justify-between h-full space-y-3.5 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-[#7c3aed] uppercase bg-[#7c3aed]/10 px-2 py-0.5 rounded">
                  {specialProduct.brand || 'Official Partner'}
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-black max-w-[120px] truncate">
                  {specialProduct.category}
                </span>
              </div>
              
              <h4 className="text-base sm:text-lg font-black text-white hover:text-[#c084fc] transition-colors line-clamp-2 leading-snug tracking-tight">
                {specialProduct.name}
              </h4>

              {/* Rating stars */}
              <div className="flex items-center gap-1">
                <div className="flex items-center text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < Math.floor(specialProduct.rating) ? 'fill-current' : 'opacity-30'}`} 
                    />
                  ))}
                </div>
                <span className="text-[10.5px] font-bold text-slate-400">
                  {specialProduct.rating} ({specialProduct.reviewsCount} Buyer Ratings)
                </span>
              </div>
            </div>

            {/* Description pitch */}
            <p className="text-xs text-slate-350 line-clamp-2 md:line-clamp-3 leading-snug font-medium">
              {specialProduct.description}
            </p>

            {/* Price display layout matching screenshot excellence */}
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-black text-yellow-300 font-sans tracking-tight">
                {formatNaira(specialProduct.price)}
              </span>
              {specialProduct.originalPrice > specialProduct.price && (
                <span className="text-xs font-semibold text-slate-400 font-sans line-through">
                  {formatNaira(specialProduct.originalPrice)}
                </span>
              )}
            </div>

            {/* Interactive action buttons tray */}
            <div className="flex items-center gap-2 sm:gap-3.5 pt-1.5">
              {/* Quick Add To Cart Button */}
              <button
                type="button"
                onClick={handleQuickAdd}
                className={`flex-1 px-4 py-3 rounded-xl text-xs font-black tracking-wider uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer select-none transition-all duration-200 ${
                  isSuccessFeedback 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-yellow-400 hover:bg-yellow-500 text-neutral-950 font-black'
                }`}
              >
                {isSuccessFeedback ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3.2]" />
                    <span>Added Successfully!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                    <span>CLAIM DEAL NOW</span>
                  </>
                )}
              </button>

              {/* View details */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProduct(specialProduct);
                }}
                className="p-3 bg-neutral-800 hover:bg-neutral-750 text-slate-100 rounded-xl transition border border-neutral-700 flex items-center justify-center cursor-pointer"
                title="Expand Specification Grid"
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* Wishlist toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(specialProduct);
                }}
                className={`p-3 rounded-xl transition border flex items-center justify-center cursor-pointer ${
                  isInWishlist
                    ? 'bg-red-500/15 border-red-500/40 text-red-500 hover:bg-red-500/25'
                    : 'bg-neutral-800 border-neutral-700 text-slate-400 hover:text-white hover:bg-neutral-750'
                }`}
                title="Save product"
              >
                <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
