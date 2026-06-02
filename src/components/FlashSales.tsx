import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface FlashSalesProps {
  products: Product[];
  wishlist: Product[];
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  title?: string;
  type?: 'flash' | 'weekend' | 'new' | 'discount';
}

export default function FlashSales({
  products,
  wishlist,
  onAddToCart,
  onToggleWishlist,
  onSelectProduct,
  title = 'FLASH SALES',
  type = 'flash'
}: FlashSalesProps) {
  // Static 4 hours target timer from component mount
  const [timeLeft, setTimeLeft] = useState(14400); // 4 hours in seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 14400));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      hours: h.toString().padStart(2, '0'),
      minutes: m.toString().padStart(2, '0'),
      seconds: s.toString().padStart(2, '0')
    };
  };

  const time = formatTime(timeLeft);

  // Dynamic products filter based on sections
  let displayedProducts = products;
  if (type === 'weekend') {
    displayedProducts = products.filter(p => p.rating >= 4.6 || p.specifications?.['Featured'] === 'Yes');
    if (displayedProducts.length < 3) {
      displayedProducts = products.slice(0, 6);
    }
  } else if (type === 'new') {
    displayedProducts = [...products].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    if (displayedProducts.length < 3) {
      displayedProducts = products.slice(3, 9);
    }
  } else if (type === 'discount') {
    displayedProducts = products.filter(p => p.discount >= 20);
    if (displayedProducts.length < 3) {
      displayedProducts = products.filter(p => p.discount > 0);
    }
    if (displayedProducts.length < 3) {
      displayedProducts = products.slice(2, 8);
    }
  } else {
    displayedProducts = products.filter(p => p.isFlashSale);
    if (displayedProducts.length < 3) {
      displayedProducts = products.slice(0, 4);
    }
  }

  const formatNaira = (amount: number) => {
    return '₦ ' + amount.toLocaleString('en-NG');
  };

  // Determine styles and SVGs dynamically based on section type
  let outerBg = 'bg-[#b31414] border-red-800/10';
  let headerBg = 'bg-[#df1212] border-red-700/30';
  let iconContainerBg = 'bg-gradient-to-br from-[#a855f7] to-[#7c3aed]';
  let progressColorDefault = 'bg-[#7c3aed]';
  let timerLabel = 'Time Left:';

  let customIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 text-white">
      <path d="M19 10h-5.64l.82-5.74A1 1 0 0012.39 3H7.5a1 1 0 00-1 .92L5.05 14.4A1 1 0 006 15.5h5l-.83 5.82a1 1 0 001.78.78l7.5-11A1 1 0 0019 10z" />
    </svg>
  );

  if (type === 'weekend') {
    outerBg = 'bg-gradient-to-r from-purple-950 via-indigo-900 to-indigo-950 border-purple-800/20';
    headerBg = 'bg-gradient-to-r from-purple-850 to-pink-700 border-b border-purple-750/30';
    iconContainerBg = 'bg-gradient-to-br from-amber-400 to-orange-600';
    progressColorDefault = 'bg-pink-600';
    timerLabel = 'Vibez End In:';
    customIcon = (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 sm:w-6 sm:h-6 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
      </svg>
    );
  } else if (type === 'new') {
    outerBg = 'bg-gradient-to-r from-teal-950 via-emerald-900 to-emerald-950 border-emerald-800/20';
    headerBg = 'bg-gradient-to-r from-teal-850 to-emerald-650 border-b border-emerald-750/30';
    iconContainerBg = 'bg-gradient-to-br from-emerald-400 to-teal-500';
    progressColorDefault = 'bg-emerald-500';
    timerLabel = 'Fresh Stock In:';
    customIcon = (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 sm:w-6 sm:h-6 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.187L15 15l-5.187.813zM19.07 8.32a.75.75 0 00-1.06 0l-.53.53a.75.75 0 000 1.06l.53.53a.75.75 0 001.06 0l.53-.53a.75.75 0 000-1.06l-.53-.53z" />
      </svg>
    );
  } else if (type === 'discount') {
    outerBg = 'bg-gradient-to-r from-slate-950 via-blue-950 to-neutral-950 border-blue-850/20';
    headerBg = 'bg-gradient-to-r from-[#6366f1] to-blue-600 border-b border-indigo-750/30';
    iconContainerBg = 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600';
    progressColorDefault = 'bg-indigo-600';
    timerLabel = 'Price Rise In:';
    customIcon = (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 sm:w-6 sm:h-6 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 001.591 0l4.318-4.318a1.125 1.125 0 000-1.591L9.568 4.591A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden border shadow-md mb-6 ${outerBg}`} id={`quxba-flash-sales-${type}`}>
      {/* Dynamic Header */}
      <div className={`px-3.5 py-4 text-white flex items-center justify-between gap-2 ${headerBg}`}>
        {/* Title, Lightning Symbol and Badge */}
        <div className="flex items-center gap-2 md:gap-3.5">
          {/* Decorative customizable icon */}
          <div className={`flex-shrink-0 relative w-9 h-9 sm:w-11 sm:h-11 ${iconContainerBg} flex items-center justify-center rounded-lg shadow-md animate-pulse`}>
            {customIcon}
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-yellow-300 rounded-full animate-ping" />
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <h2 className="text-sm sm:text-lg font-black tracking-tight uppercase flex items-center gap-1">
                {title}
              </h2>
              {/* Dynamic countdown timer */}
              <div className="text-[10px] sm:text-xs text-white/95 font-medium flex items-center gap-1 font-sans">
                <span className="opacity-90">{timerLabel}</span>
                <span className="font-mono font-black tracking-wide text-yellow-300">
                  {time.hours}h : {time.minutes}m : {time.seconds}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clickable White SEE ALL button */}
        <button 
          onClick={() => {
            const gridContainer = document.getElementById('product-grid-container');
            if (gridContainer) {
              gridContainer.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="text-[11px] sm:text-xs font-black tracking-wider text-white hover:text-yellow-200 transition-colors uppercase border-b-2 border-transparent hover:border-yellow-200 py-0.5 whitespace-nowrap cursor-pointer select-none"
        >
          SEE ALL
        </button>
      </div>

      {/* Horizontally scrollable product stage */}
      <div className="px-1.5 py-4 flex flex-col">
        <div 
          className="flex flex-row overflow-x-auto gap-3 pb-2 pt-1 px-2 scrollbar-none snap-x snap-mandatory scroll-smooth touch-pan-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayedProducts.map((product) => {
            // Simulate authentic inventory left indicators based on ID or details
            const simInventoryLeft = Math.max(3, (product.price % 80) + 4);
            const simInitialCap = simInventoryLeft > 40 ? 200 : 50;
            const simPercent = Math.min(95, Math.max(8, (simInventoryLeft / simInitialCap) * 100));

            // Select color for progress track: under 12 left turns red orange, otherwise the custom accent color
            const isLowStock = simInventoryLeft < 15;
            const finalProgressColor = isLowStock ? 'bg-[#df1212]' : progressColorDefault;

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="w-[135px] sm:w-[165px] bg-white rounded-lg p-2.5 flex flex-col justify-between flex-shrink-0 snap-start relative shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                {/* Brand label & logo header */}
                <div className="flex items-start justify-between gap-1 mb-1 pointer-events-none select-none min-h-[16px]">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-800 tracking-tight leading-none truncate max-w-[80px]">
                      {product.brand || 'Official'}
                    </span>
                    <span className="text-[8px] text-gray-400 font-bold leading-none mt-0.5">
                      Official Store
                    </span>
                  </div>

                  {/* discount stamp */}
                  {product.discount > 0 && (
                    <span className="bg-[#f5f3ff] border border-purple-100/60 text-[#f51515] text-[9px] font-extrabold px-1 py-0.5 rounded-sm">
                      -{product.discount}%
                    </span>
                  )}
                </div>

                {/* Centered image */}
                <div className="aspect-square w-full flex items-center justify-center p-1 relative mb-2 bg-white rounded">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="max-h-[95%] max-w-[95%] object-contain group-hover:scale-105 transition-transform duration-350"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                </div>

                {/* Product details */}
                <div className="mt-auto space-y-1 text-left">
                  <h3 className="text-gray-800 text-[11px] font-normal leading-tight tracking-tight line-clamp-2 h-7 mb-0.5">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div>
                    <span className="text-xs sm:text-[13px] font-black text-slate-900 font-sans tracking-tight block">
                      {formatNaira(product.price)}
                    </span>
                  </div>

                  {/* Items Left text */}
                  <div className="text-[9px] text-[#282828] font-bold">
                    {simInventoryLeft} items left
                  </div>

                  {/* Inventory depletion status bar */}
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden relative mt-1">
                    <div 
                      className={`h-full ${finalProgressColor} rounded-full transition-all duration-500`}
                      style={{ width: `${simPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
