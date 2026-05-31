import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface FlashSalesProps {
  products: Product[];
  wishlist: Product[];
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
}

export default function FlashSales({
  products,
  wishlist,
  onAddToCart,
  onToggleWishlist,
  onSelectProduct
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
  const flashProducts = products.filter(p => p.isFlashSale);

  const formatNaira = (amount: number) => {
    return '₦ ' + amount.toLocaleString('en-NG');
  };

  return (
    <div className="bg-[#b31414] sm:bg-[#b31414] rounded-lg overflow-hidden border border-gray-150/10 shadow-md mb-6" id="quxba-flash-sales">
      {/* Quxba Red Flash Header matching screenshot */}
      <div className="bg-[#df1212] px-3.5 py-4 text-white flex items-center justify-between gap-2 border-b border-red-700/30">
        {/* Title, Lightning Symbol and Badge */}
        <div className="flex items-center gap-2 md:gap-3.5">
          {/* Yellow Lightning Tag Icon exactly like screenshot */}
          <div className="flex-shrink-0 relative w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center rounded-lg shadow-md animate-pulse">
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
            >
              <path d="M19 10h-5.64l.82-5.74A1 1 0 0012.39 3H7.5a1 1 0 00-1 .92L5.05 14.4A1 1 0 006 15.5h5l-.83 5.82a1 1 0 001.78.78l7.5-11A1 1 0 0019 10z" />
            </svg>
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-yellow-300 rounded-full animate-ping" />
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <h2 className="text-sm sm:text-lg font-black tracking-tight uppercase flex items-center gap-1">
                FLASH SALES
              </h2>
              {/* Dynamic countdown strictly aligned with screenshot standard */}
              <div className="text-[10px] sm:text-xs text-white/95 font-medium flex items-center gap-1 font-sans">
                <span className="opacity-90">Time Left:</span>
                <span className="font-mono font-black tracking-wide text-yellow-300">
                  {time.hours}h : {time.minutes}m : {time.seconds}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clickable White SEE ALL button, aligned perfectly */}
        <button 
          onClick={() => {
            // Scroll down directly to core results view
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

      {/* Horizontally scrollable product stage strictly optimized for Touch/Mobile layout & Desktop */}
      <div className="bg-[#b31414] px-1.5 py-4 flex flex-col">
        <div 
          className="flex flex-row overflow-x-auto gap-3 pb-2 pt-1 px-2 scrollbar-none snap-x snap-mandatory scroll-smooth touch-pan-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {flashProducts.map((product) => {
            // Simulate authentic inventory left indicators based on ID or details
            const simInventoryLeft = Math.max(3, (product.price % 80) + 4);
            const simInitialCap = simInventoryLeft > 40 ? 200 : 50;
            const simPercent = Math.min(95, Math.max(8, (simInventoryLeft / simInitialCap) * 100));

            // Select color for progress track: under 12 left turns red orange, otherwise warm yellow orange
            const isLowStock = simInventoryLeft < 15;
            const progressColor = isLowStock ? 'bg-[#df1212]' : 'bg-[#7c3aed]';

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="w-[135px] sm:w-[165px] bg-white rounded-lg p-2.5 flex flex-col justify-between flex-shrink-0 snap-start relative shadow-md border border-red-800/10 hover:shadow-xl transition-all duration-300 cursor-pointer group"
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

                  {/* discount stamp matching yellow beige label */}
                  {product.discount > 0 && (
                    <span className="bg-[#f5f3ff] border border-purple-100/60 text-[#f51515] text-[9px] font-extrabold px-1 py-0.5 rounded-sm">
                      -{product.discount}%
                    </span>
                  )}
                </div>

                {/* Centered high-fidelity image */}
                <div className="aspect-square w-full flex items-center justify-center p-1 relative mb-2 bg-white rounded">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="max-h-[95%] max-w-[95%] object-contain group-hover:scale-105 transition-transform duration-350"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Product text details & precise pricing alignment */}
                <div className="mt-auto space-y-1 text-left">
                  <h3 className="text-gray-800 text-[11px] font-normal leading-tight tracking-tight line-clamp-2 h-7 mb-0.5">
                    {product.name}
                  </h3>

                  {/* Red / Black Naira Price */}
                  <div>
                    <span className="text-xs sm:text-[13px] font-black text-slate-900 font-sans tracking-tight block">
                      {formatNaira(product.price)}
                    </span>
                  </div>

                  {/* Items Left text indicator */}
                  <div className="text-[9px] text-[#282828] font-bold">
                    {simInventoryLeft} items left
                  </div>

                  {/* Inventory depletion status bar */}
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden relative mt-1">
                    <div 
                      className={`h-full ${progressColor} rounded-full transition-all duration-500`}
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
